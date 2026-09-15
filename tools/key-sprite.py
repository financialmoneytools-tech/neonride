"""Key a flat white background out of a sprite and write a trimmed RGBA PNG.

Run once per source image; the game loads only the PNG this produces.

    python tools/key-sprite.py art/sprites/glove-right.png public/sprites/glove-right.png

Sources live in art/ and are not shipped; only the keyed PNG under public/ is
fetched at runtime. Keeping them apart matters more than it looks - the source
is a PNG too now, and writing the result beside it under a derived name would
overwrite the thing it was derived from the second time anyone ran this.

Why a script and not a shader or a load-time canvas pass: the source is a JPEG,
so its edges carry ringing, and getting clean alpha needs a flood fill from the
borders rather than a per-pixel threshold. A threshold alone punches holes in
every light thing INSIDE the drawing - the carbon knuckle armour here is full of
white highlights - and leaves a white halo everywhere the artwork is dark. Doing
it once, offline, also means the runtime pays nothing and the result can be
looked at before it ships.
"""

import sys
from collections import deque

import numpy as np
from PIL import Image

# A pixel is background if it is this close to white AND reachable from the
# border. Loose enough for JPEG noise, tight enough to keep the artwork's own
# highlights.
WHITE = 236
# Background does not have to touch the border. The gap between the brake lever
# and the fingers is enclosed by the drawing, and the border fill cannot reach
# it - it came out as a white patch hanging in the middle of the sprite. An
# enclosed pocket is treated as background when it is PURE white over an area
# no highlight would cover; the artwork's own bright spots are grey by
# comparison and much smaller.
ENCLOSED_WHITE = 249
ENCLOSED_AREA = 400
# Alpha inside this band is taken from luminance, which recovers the anti
# aliased edge the artist drew instead of leaving a stair-stepped cut.
FEATHER = 3
# Longest side of the written PNG. The sprite covers a few per cent of a 1080p
# frame, so anything past this is bytes nobody sees.
MAX_SIDE = 1024
# Artwork that runs off the edge of its own canvas - the forearm at the bottom,
# the switch block at the side - leaves a dead straight cut that reads as a
# rectangle pasted over the scene, because that is what it is. Faded over a band
# it reads as the part going into shadow, which at night is what it would do.
#
# Applied to all four sides unconditionally. Where the drawing does not reach an
# edge the pixels there are already transparent and the fade changes nothing, so
# there is no side to remember to switch on. The bottom gets more because the
# arm is the longest run of solid colour into an edge.
EDGE_FADE = 0.05
BOTTOM_FADE = 0.10


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


def fade_edges(image):
    """Ramp alpha to zero at every border, so nothing ends on a straight cut."""
    alpha = image.getchannel('A').load()
    w, h = image.size

    for depth, span, read, write in (
        (round(h * BOTTOM_FADE), h, lambda i: h - 1 - i, 'row'),
        (round(h * EDGE_FADE), h, lambda i: i, 'row'),
        (round(w * EDGE_FADE), w, lambda i: i, 'col'),
        (round(w * EDGE_FADE), w, lambda i: w - 1 - i, 'col'),
    ):
        if depth < 2:
            continue
        for i in range(depth):
            scale = (i + 1) / depth
            at = read(i)
            if write == 'row':
                for x in range(w):
                    alpha[x, at] = int(alpha[x, at] * scale)
            else:
                for y in range(h):
                    alpha[at, y] = int(alpha[at, y] * scale)


def main(path, target):
    source = Image.open(path).convert('RGB')
    rgb = np.asarray(source).astype(np.float32)

    raw = np.asarray(source)
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
    image = Image.fromarray(out, 'RGBA')

    # Trim to what is actually drawn, so the plane is not mostly empty.
    box = image.getbbox()
    image = image.crop(box)

    if max(image.size) > MAX_SIDE:
        scale = MAX_SIDE / max(image.size)
        image = image.resize(
            (round(image.width * scale), round(image.height * scale)), Image.LANCZOS)

    fade_edges(image)

    image.save(target, optimize=True)
    print('%s -> %s' % (path, target))
    print('  cropped from %s to %s at %s' % (source.size, box, image.size))
    print('  opaque %.1f%%, partial %.1f%%' % (
        100.0 * (alpha == 1).mean(), 100.0 * ((alpha > 0) & (alpha < 1)).mean()))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('usage: key-sprite.py <source> <target>')
    main(sys.argv[1], sys.argv[2])
