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

Three things the sources are NOT trusted to have got right, each of which
arrived as a real defect rather than a precaution: a resampling seam along one
edge (trim_seams), frames of one set drawn on different canvases (register),
and the direction the forearm leaves the picture (fade_sleeve_end).
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

# Anything darker than this on a source's outermost line is drawing; anything
# lighter but short of WHITE is a resampling seam. See trim_seams.
SEAM_DARK = 150
SEAM_DEPTH = 4

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

# How far the sleeve fades in from where it leaves the picture, as a fraction of
# the finished sprite's long side. See fade_sleeve_end for what "where it leaves
# the picture" means and why it is not simply the bottom.
SLEEVE_FADE = 0.34

# Registration sweep: frame size relative to the reference frame, and the step
# the coarse pass walks it in. Refined afterwards at a quarter of that step.
FIT_RANGE = (0.25, 4.0, 0.01)
FIT_CANVAS = 512
FIT_REFINE = 1024
# Two frames of one drawing overlap around 0.9 - the fingers are all that
# differs. Below this the fit is reported as suspect rather than trusted.
FIT_WARN = 0.80


def trim_seams(image):
    """Drop outermost lines that are a flat light grey rather than white.

    A source rescaled on its way out of a drawing tool can carry a one pixel
    seam along an edge: the brake frame arrived with its left column at a median
    of 197, uniform top to bottom. That is the worst of both thresholds - light
    enough to read as background by eye, dark enough to fail the WHITE test - so
    the flood fill could not cross it. It survived into the PNG as a grey
    hairline, and because it ran the full height it dragged the crop box out to
    the whole edge with it.

    A seam is told from artwork by what its light pixels are. On a real edge the
    pixels that are not drawing are white; on a seam they are grey.
    """
    trimmed = [0, 0, 0, 0]  # left, top, right, bottom

    for side in range(4):
        for _ in range(SEAM_DEPTH):
            grey = np.asarray(image.convert('L')).astype(int)
            line = (grey[:, 0], grey[0, :], grey[:, -1], grey[-1, :])[side]
            light = line[line >= SEAM_DARK]
            if not len(light) or (light < WHITE).mean() <= 0.5:
                break
            box = [0, 0, image.width, image.height]
            box[side] += 1 if side < 2 else -1
            image = image.crop(box)
            trimmed[side] += 1

    return image, trimmed


def ink_mask(image, scale, side):
    """The drawing, resampled onto a square canvas of `side`, anchored top left."""
    grey = image.convert('L')
    w = max(1, round(grey.width * scale))
    h = max(1, round(grey.height * scale))
    canvas = Image.new('L', (side, side), 255)
    canvas.paste(grey.resize((w, h), Image.LANCZOS), (0, 0))
    return (np.asarray(canvas).astype(np.float32) < WHITE).astype(np.float32)


def fit(reference, frame):
    """Uniform scale and offset putting `frame` on `reference`'s pixel grid.

    Registered frames used to be registered by hand: both sources came off one
    2048 canvas, so a shared crop was all it took. The 35 degree redraw arrived
    as 2048x2048 and 1178x925 - the same composition, cropped and rescaled
    differently - and a shared crop of two unregistered images is not a shared
    anything. It cropped the brake frame to a box lying mostly outside it and
    wrote a hand sitting in the corner of an empty square.

    So the alignment is measured rather than assumed. Scale is swept, and the
    offset at each scale comes from a cross correlation of the two ink masks,
    which is one FFT instead of a second search. Scored by intersection over
    union, so a fit that is merely the best of a bad sweep still reports as bad.

    Only scale and offset, no rotation: these are frames of one drawing, and a
    set that needed rotating to line up is a set that will jump when it swaps
    whatever this does about it.
    """
    lo, hi, step = FIT_RANGE

    def sweep(side, relatives):
        grid = side / max(reference.size)
        reference_mask = ink_mask(reference, grid, side)
        spectrum = np.fft.rfft2(reference_mask)
        best = None
        for relative in relatives:
            mask = ink_mask(frame, relative * grid, side)
            corr = np.fft.irfft2(spectrum * np.conj(np.fft.rfft2(mask)), s=mask.shape)
            iy, ix = np.unravel_index(np.argmax(corr), corr.shape)
            dy = iy if iy < side // 2 else iy - side
            dx = ix if ix < side // 2 else ix - side
            shifted = np.roll(np.roll(mask, dy, 0), dx, 1)
            overlap = (reference_mask * shifted).sum()
            union_area = np.maximum(reference_mask, shifted).sum()
            score = overlap / max(union_area, 1.0)
            if best is None or score > best[0]:
                best = (score, relative, dx / grid, dy / grid)
        return best

    coarse = sweep(FIT_CANVAS, np.arange(lo, hi, step))
    # Refined at the resolution the answer is used at. The coarse canvas cannot
    # resolve scale to better than about a per cent, and a per cent of two
    # thousand pixels is a hand that visibly grows when the frame swaps.
    window = np.arange(max(lo, coarse[1] - step * 2), coarse[1] + step * 2, step / 4)
    return sweep(FIT_REFINE, window)


def register(frames):
    """Put every frame of a set on one pixel grid, cropped to what all of them cover.

    The result is what the rest of this script has always assumed it was handed:
    images of one size showing one composition, so a shared crop means something
    and nothing shifts when the frames swap.

    The common rectangle is the INTERSECTION of the frames, not the union. The
    brake drawing carries five hundred pixels more forearm than the neutral one;
    kept, that is empty texture in every other frame and a sleeve that leaves
    the picture somewhere different depending on which frame is up.
    """
    reference = frames[0]
    placed = [(reference, 1.0, 0.0, 0.0, 1.0)]
    for frame in frames[1:]:
        score, scale, dx, dy = fit(reference, frame)
        placed.append((frame, scale, dx, dy, score))

    rects = [(dx, dy, dx + frame.width * scale, dy + frame.height * scale)
             for frame, scale, dx, dy, _ in placed]
    left = round(max(r[0] for r in rects))
    top = round(max(r[1] for r in rects))
    width = round(min(r[2] for r in rects)) - left
    height = round(min(r[3] for r in rects)) - top
    if width < 8 or height < 8:
        raise SystemExit('registration found no region common to every frame')

    out = []
    for frame, scale, dx, dy, score in placed:
        w = max(1, round(frame.width * scale))
        h = max(1, round(frame.height * scale))
        canvas = Image.new('RGB', (width, height), (255, 255, 255))
        canvas.paste(frame.resize((w, h), Image.LANCZOS), (round(dx) - left, round(dy) - top))
        out.append((canvas, scale, score))
    return out


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


def keyed(source):
    """One source, padded and keyed, still at full size and uncropped.

    Returns the image and where the source's own rectangle sits inside it. That
    rectangle is where the canvas cut the drawing off, which is the one thing
    the alpha alone cannot tell you afterwards and the thing the sleeve fade
    needs to know.
    """
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
    return Image.fromarray(out, 'RGBA'), (pad, pad, pad + source.width, pad + source.height)


def boundary_runs(alpha, rect):
    """Stretches of silhouette lying on the source's own edge, longest first.

    Walked as one closed loop rather than as four edges, because the interesting
    one turns a corner: in the 35 degree art the forearm leaves through the
    right edge for 456 rows and the bottom edge for 657 columns, and that is one
    cut through the corner, not two of them.
    """
    x0, y0, x1, y1 = rect[0], rect[1], rect[2] - 1, rect[3] - 1
    if x1 <= x0 or y1 <= y0:
        return []

    loop = ([(x, y0) for x in range(x0, x1 + 1)]
            + [(x1, y) for y in range(y0 + 1, y1 + 1)]
            + [(x, y1) for x in range(x1 - 1, x0 - 1, -1)]
            + [(x0, y) for y in range(y1 - 1, y0, -1)])
    solid = [alpha[y, x] > 8 for x, y in loop]
    if all(solid):
        return [loop]
    if not any(solid):
        return []

    # Rotated to start on a gap, so a run straddling the join comes back whole
    # rather than as two shorter ones that each lose to the wrong cut.
    start = solid.index(False)
    loop = loop[start:] + loop[:start]
    solid = solid[start:] + solid[:start]

    runs, current = [], []
    for point, filled in zip(loop, solid):
        if filled:
            current.append(point)
        elif current:
            runs.append(current)
            current = []
    if current:
        runs.append(current)
    runs.sort(key=len, reverse=True)
    return runs


def straight_segments(run):
    """A walk along axis aligned edges, split where it changes direction."""
    segments = []
    start = previous = run[0]
    heading = None
    for point in run[1:]:
        step = (point[0] - previous[0], point[1] - previous[1])
        if heading is None:
            heading = step
        elif step != heading:
            segments.append((start, previous))
            start, heading = previous, step
        previous = point
    segments.append((start, previous))
    return segments


def fade_sleeve_end(image, rect):
    """The forearm leaves the picture; it should not leave it on a hard edge.

    WHERE it leaves is the whole problem, and it used to be assumed. The version
    this replaces ramped alpha by row across the full width - the arm ran off
    the bottom, so fading the bottom was the same thing. The 35 degree art sends
    the sleeve out through the bottom RIGHT corner instead, and there a row-wise
    fade does three wrong things at once: it eats the part of the arm that does
    not leave at all, it leaves the part that exits sideways at full alpha, and
    it lays a horizontal gradient across a diagonal cut, which reads worse than
    the cut did.

    So the cut is found rather than assumed - the longest run of silhouette
    sitting on the source's own edge - and alpha ramps with DISTANCE from it.
    Distance is what makes this work in any direction: the level sets follow the
    cut, so a corner exit fades along its own diagonal, and the only thing that
    changes between that and a plain bottom exit is their shape.

    It also replaces the outline softening that used to run beside it. That
    existed because the old forearm's outer edge was drawn within 13 degrees of
    vertical, and a billboard turns a near vertical line in the artwork into an
    exactly vertical one on screen, which reads as the boundary of a rectangle.
    The redraw moves that edge 814 px across 717 rows, which is 49 degrees, and
    the note the softening was written under says the rest in as many words: a
    diagonal reads as an arm rather than as a cut.

    Note what this does NOT do: getchannel('A') hands back a COPY of the alpha,
    not a view into the image. Writing through that copy's pixel access and
    walking away - which is what an earlier pass did for three revisions -
    changes nothing at all, silently, and the PNG ships exactly as it was. It
    has to be put back.
    """
    alpha = np.asarray(image.getchannel('A')).astype(np.float32)
    runs = boundary_runs(alpha, rect)
    depth = max(image.width, image.height) * SLEEVE_FADE
    if not runs or depth < 2:
        return 0

    # The run is at most a handful of straight pieces, and the exact distance to
    # a straight piece is closed form. Seed by seed it would be a thousand
    # points against a million pixels.
    ys = np.arange(image.height, dtype=np.float32)[:, None]
    xs = np.arange(image.width, dtype=np.float32)[None, :]
    distance = np.full(alpha.shape, np.inf, np.float32)
    for (ax, ay), (bx, by) in straight_segments(runs[0]):
        near_x = np.clip(xs, min(ax, bx), max(ax, bx))
        near_y = np.clip(ys, min(ay, by), max(ay, by))
        distance = np.minimum(distance, np.hypot(xs - near_x, ys - near_y))

    ramp = np.clip(distance / depth, 0.0, 1.0)
    image.putalpha(Image.fromarray((alpha * ramp).astype(np.uint8), 'L'))
    return len(runs[0])


def union(boxes):
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def main(pairs, group):
    sources = []
    for src, _ in pairs:
        loaded = Image.open(src).convert('RGB')
        trimmed, seams = trim_seams(loaded)
        sources.append((trimmed, seams, loaded.size))

    if group and len(sources) > 1:
        registered = register([image for image, _, _ in sources])
    else:
        registered = [(image, 1.0, 1.0) for image, _, _ in sources]

    keys = [keyed(canvas) for canvas, _, _ in registered]
    boxes = [image.getbbox() for image, _ in keys]
    # A registered set shares one crop, so every frame in it comes out the same
    # size and nothing shifts when they swap.
    crop = union(boxes) if group else None

    for (src, target), (_, seams, size), (_, scale, score), (image, rect), own in zip(
            pairs, sources, registered, keys, boxes):
        box = crop or own
        image = image.crop(box)
        rect = (rect[0] - box[0], rect[1] - box[1], rect[2] - box[0], rect[3] - box[1])

        bordered = Image.new('RGBA', (image.width + MARGIN * 2, image.height + MARGIN * 2))
        bordered.paste(image, (MARGIN, MARGIN))
        image = bordered
        rect = tuple(v + MARGIN for v in rect)

        if max(image.size) > MAX_SIDE:
            shrink = MAX_SIDE / max(image.size)
            image = image.resize(
                (round(image.width * shrink), round(image.height * shrink)), Image.LANCZOS)
            rect = tuple(round(v * shrink) for v in rect)

        # Clamped, because the crop tightens onto the content: on any side the
        # drawing stops short of its canvas, the source rectangle ends up
        # outside the image, and there is no cut on that side to look for.
        rect = (max(0, rect[0]), max(0, rect[1]),
                min(image.width, rect[2]), min(image.height, rect[3]))
        cut = fade_sleeve_end(image, rect)
        image.save(target, optimize=True)

        alpha = np.asarray(image)[..., 3]
        print('%s -> %s' % (src, target))
        print('  %s, seams trimmed %s, registered x%.4f (overlap %.3f)' % (
            size, seams, scale, score))
        print('  cropped %s, written %s, aspect %.4f' % (
            box, image.size, image.width / image.height))
        print('  cut %d px, clear %.1f%%, solid %.1f%%, edge %.1f%%' % (
            cut, 100.0 * (alpha == 0).mean(), 100.0 * (alpha == 255).mean(),
            100.0 * ((alpha > 0) & (alpha < 255)).mean()))
        if score < FIT_WARN:
            print('  WARNING: poor registration - check these frames are one drawing')


if __name__ == '__main__':
    args = sys.argv[1:]
    grouped = False
    if args and args[0] == '--group':
        grouped = True
        args = args[1:]
    if not args or len(args) % 2:
        raise SystemExit('usage: key-sprite.py [--group] <source> <target> [<source> <target>...]')
    main(list(zip(args[0::2], args[1::2])), grouped)
