"""Key a flat white background out of a sprite and write a trimmed RGBA PNG.

Run once per source image; the game loads only the PNGs this produces.

    python tools/key-sprite.py art/sprites/glove-left.png public/sprites/glove-left.png

Frames that have to stay registered with each other - the neutral and braking
right hand, which swap in place - are keyed as a GROUP, so they share one crop
and one size:

    python tools/key-sprite.py --group \\
        art/sprites/glove-right.png public/sprites/glove-right.png \\
        art/sprites/glove-right-brake.png public/sprites/glove-right-brake.png

Cropped separately the two would each shrink to their own content, come out
different sizes, and the hand would jump sideways the instant the brake came on.

Sources live in art/ and are not shipped; only the keyed PNG under public/ is
fetched at runtime. Keeping them apart matters more than it looks - the sources
are PNGs too, and writing the result beside one under a derived name would
overwrite the thing it was derived from the second time anyone ran this.

Why a script and not a shader or a load-time canvas pass: getting clean alpha
needs a flood fill from the borders rather than a per-pixel threshold. A
threshold alone punches holes in every light thing INSIDE the drawing - the
carbon knuckle armour is full of white highlights - and leaves a white halo
everywhere the artwork is dark. Doing it once, offline, also means the runtime
pays nothing and the result can be looked at before it ships.
"""

import sys
from collections import deque

import numpy as np
from PIL import Image

# A pixel is background if it is this close to white AND reachable from the
# border. Loose enough for JPEG noise, tight enough to keep the artwork's own
# highlights.
WHITE = 236
# Background does not have to touch the border. The gap between a brake lever
# and the fingers is enclosed by the drawing, and the border fill cannot reach
# it - it came out as a white patch hanging in the middle of the sprite. An
# enclosed pocket is treated as background when it is PURE white over an area
# no highlight would cover; the artwork's own bright spots are grey by
# comparison and much smaller.
ENCLOSED_WHITE = 249
ENCLOSED_AREA = 400
# Alpha inside this band of the edge is taken from luminance, which recovers the
# anti aliased edge the artist drew instead of leaving a stair-stepped cut.
FEATHER = 3

# White added around the source before anything else happens.
#
# The drawings run off their own canvas - the switch block at one side, the bar
# end at the other - and a flood fill that starts at the border cannot get round
# them, so those sides came out with no silhouette at all: the alpha simply
# stopped where the image did. Fading the edge hid it and cost a visible
# gradient band. Padding fixes the cause instead. The fill goes all the way
# round, every side gets a real outline, and the only fade left is the one that
# should be there.
PAD = 0.05
# Transparent border on the finished PNG, so sampling at the very edge of the
# plane never smears the last opaque row across it.
MARGIN = 8

# Longest side of the written PNG. The sprite covers a few per cent of a 1080p
# frame, so anything past this is bytes nobody sees.
MAX_SIDE = 1024
# The forearm is the one thing that genuinely does leave the picture: it runs
# off the bottom because the arm continues past the frame. Faded, it reads as an
# arm going into shadow, which at night is what an arm does.
#
# Long, and it has to be. Measured on the right glove, the outer edge of the
# forearm is drawn all but straight - it moves 100 px across 440 rows - and the
# sprite is a billboard, so a near vertical line in the artwork is an exactly
# vertical line on screen. With the arm running off the bottom of the frame as
# well, the two together read as the corner of a rectangle, which is what was
# being seen as the plane's boundary. It is not: the plane is wider than that,
# and the alpha has a clean transparent border on every side. It is the arm.
#
# The left glove does not do it because its arm sweeps inward - the same edge
# travels 529 px - and a diagonal reads as an arm rather than as a cut.
#
# Fading from a third of the way up dissolves the straight run before it is long
# enough to register as an edge.
BOTTOM_FADE = 0.32


def flood_background(rgb):
    h, w, _ = rgb.shape
    light = rgb.min(axis=2) >= WHITE
    bg = np.zeros((h, w), dtype=bool)
    queue = deque()

    for x in range(w):
        for y in (0, h - 1):
            if light[y, x] and not bg[y, x]:
                bg[y, x] = True
                queue.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if light[y, x] and not bg[y, x]:
                bg[y, x] = True
                queue.append((y, x))

    while queue:
        y, x = queue.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                queue.append((ny, nx))
    return bg


def enclosed_background(rgb, bg):
    """Pockets of pure white the border fill could not reach."""
    h, w, _ = rgb.shape
    light = rgb.min(axis=2) >= ENCLOSED_WHITE
    candidate = light & ~bg
    seen = np.zeros((h, w), dtype=bool)
    found = np.zeros((h, w), dtype=bool)

    ys, xs = np.nonzero(candidate)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]:
            continue
        queue = deque([(y0, x0)])
        seen[y0, x0] = True
        blob = [(y0, x0)]
        while queue:
            y, x = queue.popleft()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and candidate[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((ny, nx))
                    blob.append((ny, nx))
        if len(blob) >= ENCLOSED_AREA:
            for y, x in blob:
                found[y, x] = True
    return found


def dilate(mask, steps):
    out = mask.copy()
    for _ in range(steps):
        grown = out.copy()
        grown[1:, :] |= out[:-1, :]
        grown[:-1, :] |= out[1:, :]
        grown[:, 1:] |= out[:, :-1]
        grown[:, :-1] |= out[:, 1:]
        out = grown
    return out


def keyed(path):
    """One source, padded and keyed, still at full size and uncropped."""
    source = Image.open(path).convert('RGB')
    pad = round(max(source.size) * PAD)
    padded = Image.new('RGB', (source.width + pad * 2, source.height + pad * 2), (255, 255, 255))
    padded.paste(source, (pad, pad))

    raw = np.asarray(padded)
    rgb = raw.astype(np.float32)

    bg = flood_background(raw)
    bg |= enclosed_background(raw, bg)
    alpha = np.where(bg, 0.0, 1.0)

    # The edge the artist anti aliased is a blend of the drawing and the white
    # behind it. Inside a narrow band around the background, recover how much of
    # each pixel was really drawing, then undo the blend so the colour is the
    # artwork's own rather than a washed out version of it.
    band = dilate(bg, FEATHER) & ~bg
    luminance = rgb.min(axis=2)
    edge_alpha = np.clip((255.0 - luminance) / 255.0, 0.0, 1.0)
    alpha = np.where(band, edge_alpha, alpha)

    safe = np.maximum(alpha, 1e-3)[..., None]
    unpremultiplied = (rgb - 255.0 * (1.0 - alpha[..., None])) / safe
    rgb = np.where(band[..., None], np.clip(unpremultiplied, 0, 255), rgb)

    out = np.dstack([rgb, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), source.size


def fade_bottom(image):
    """The forearm leaves the picture; it should not leave it on a straight cut."""
    depth = round(image.height * BOTTOM_FADE)
    if depth < 2:
        return
    alpha = image.getchannel('A').load()
    for i in range(depth):
        y = image.height - 1 - i
        scale = (i + 1) / depth
        for x in range(image.width):
            alpha[x, y] = int(alpha[x, y] * scale)


def union(boxes):
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def main(pairs, group):
    images = [keyed(src) for src, _ in pairs]
    boxes = [image.getbbox() for image, _ in images]
    # A registered set shares one crop, so every frame in it comes out the same
    # size and nothing shifts when they swap.
    crop = union(boxes) if group else None

    for (src, target), (image, original), own in zip(pairs, images, boxes):
        box = crop or own
        image = image.crop(box)

        bordered = Image.new('RGBA', (image.width + MARGIN * 2, image.height + MARGIN * 2))
        bordered.paste(image, (MARGIN, MARGIN))
        image = bordered

        if max(image.size) > MAX_SIDE:
            scale = MAX_SIDE / max(image.size)
            image = image.resize(
                (round(image.width * scale), round(image.height * scale)), Image.LANCZOS)

        fade_bottom(image)
        image.save(target, optimize=True)

        alpha = np.asarray(image)[..., 3]
        print('%s -> %s' % (src, target))
        print('  %s padded, cropped %s, written %s' % (original, box, image.size))
        print('  clear %.1f%%, solid %.1f%%, edge %.1f%%' % (
            100.0 * (alpha == 0).mean(), 100.0 * (alpha == 255).mean(),
            100.0 * ((alpha > 0) & (alpha < 255)).mean()))


if __name__ == '__main__':
    args = sys.argv[1:]
    grouped = False
    if args and args[0] == '--group':
        grouped = True
        args = args[1:]
    if not args or len(args) % 2:
        raise SystemExit('usage: key-sprite.py [--group] <source> <target> [<source> <target>...]')
    main(list(zip(args[0::2], args[1::2])), grouped)
