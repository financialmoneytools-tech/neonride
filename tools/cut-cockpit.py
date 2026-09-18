"""Key the white background out of a cockpit source and write an RGBA PNG.

    python tools/cut-cockpit.py               # both aspects
    python tools/cut-cockpit.py wide --debug  # and a checkerboard composite

This replaces a polygon tracer. The first pair of sources were photographs of a
road, where there was nothing to key: measured, the gloves sat at luminance 17
to 21 against road at 28 to 40, so the cockpit was DARKER than what was behind
it, and warmth did not separate them either. The silhouette had to be authored
by hand and refined against image gradients. The new sources are drawn on white,
so the flood fill is back and the polygons are gone - they are in the history if
a photographic source ever returns.

WHAT IS DIFFERENT FROM tools/key-sprite.py, which keys the same way:

- It does NOT crop to content. These sources carry a deliberate empty margin on
  every side so the cut edges stay outside the frame through the whole roll and
  shift range, and cropping to content is exactly throwing that away. The
  framing is the artist's, not this script's.
- It finds the blank instrument panel and punches it out for the live dash.
- No sleeve fade, no outline softening. Those exist because a forearm leaves the
  glove sprite's picture; here nothing leaves the picture but the bottom edge,
  which is the frame edge.

THE WHITE IS NOT ALWAYS WHITE. The wide source sits at 254 and the tall one at
246, with only 6.6 per cent of the tall image at 249 or above - so a fixed pure
white test finds essentially nothing in it and every enclosed pocket ships as an
opaque patch. Both levels are read off each image's own border instead.
"""

import json
import re
import sys
from collections import deque

import numpy as np
from PIL import Image
from scipy import ndimage

# Thresholds, as offsets below the background level measured on the border.
# Loose enough for JPEG noise and a drawing tool's dithering, tight enough to
# keep the artwork's own highlights - and this artwork is dark neon on white, so
# there is a great deal of room between the two.
BACKGROUND_DROP = 20
# A SECOND, looser pass, seeded from what the first one already proved is
# background. The sources shade their white slightly where the bodywork meets
# it - measured, the slivers either side of the tank bottom out at a median of
# 228 against a 254 ground - so a single strict threshold leaves them as opaque
# white crescents, and a single loose one is free to walk into the artwork from
# anywhere on the border. Seeding the loose pass from the strict result is what
# keeps it honest: it can only extend background that is already background, so
# a bright neon pipe running off the frame edge has nothing to walk in from.
LOOSE_DROP = 38
# An enclosed pocket has to sit closer to the background level than a reachable
# one, because nothing outside it can vouch for it.
ENCLOSED_DROP = 8
ENCLOSED_AREA = 300
# Alpha inside this band of the edge comes from luminance, which recovers the
# anti aliased edge the artist drew rather than leaving a stair stepped cut.
FEATHER = 3
# Longest side of the written PNG. The wide source is 2752 and comes out around
# 6.5 MB of RGBA at that size, which is not a thing to fetch before first frame.
MAX_SIDE = 2048

# The dash canvas is 512 x 288. The hole is shrunk to this aspect rather than
# the dash being stretched to the hole: both panels are drawn wider than 16:9 -
# 2.00 on the wide source, 1.86 on the tall - and filling them outright would
# stretch every digit by up to 13 per cent. What is left over is a sliver of the
# panel's own grey down each side, which reads as part of the instrument.
DASH_ASPECT = 512 / 288

# ONE SOURCE. The game is landscape only; the portrait source and everything
# that existed to pick between the two are gone.
SOURCES = {
    'wide': {
        'source': 'art/cockpit/cockpit-wide-source.jpg',
        'target': 'public/sprites/cockpit.png',

        # ================= THIS SOURCE HAS NO BLANK PANEL =================
        #
        # `seed` is the original mechanism and the better one: a point inside a
        # blank instrument panel, from which the rectangle is MEASURED, so a
        # redraw moves the hole without anybody editing a number. It needs the
        # artist to leave the cluster blank.
        #
        # This drawing does not. It carries a fully drawn analogue tachometer -
        # needle, scale, numbers - and a small LCD, so there is no flat panel to
        # find and the seeded flood correctly refuses: it reported a fill of
        # 0.52 against the 1.000 a real panel gives. The art was kept anyway
        # because its landmarks matched the framing contract to within 0.03
        # points, and regenerating art that fits that well to fix a hole is the
        # wrong trade.
        #
        # So the rectangle is AUTHORED for this source, measured off the
        # punched sprite rather than eyeballed. It covers THE TACHO DIAL. The
        # housing, its bezel, the surrounding fairing, the brake reservoir, the
        # left hand column of warning lamps and the green and amber lamps below
        # the dial all survive, which is what makes the live dash read as
        # sitting inside real instrument housing rather than in a hole cut
        # through the bike.
        #
        # THE SMALL LCD BESIDE THE DIAL IS NOT PUNCHED, and that is a trade
        # rather than an oversight. It sits at x 0.545 to 0.565. Reaching it
        # means a hole 0.125 wide, and the dash is 16:9, so the height goes with
        # it: y 0.520 to 0.646. That cuts through the housing bezel at 0.525 AND
        # swallows the green and amber lamps at 0.632 to 0.642. Keeping the
        # housing and the warning lamps was the stated requirement and the LCD
        # was not worth either of them - left drawn, it reads as a static trip
        # meter beside a live gauge, which is what a real cluster looks like.
        #
        # The hole is 209 x 117 px on the shipped sprite against the old
        # drawing's 126 x 71: the dash is 66 per cent larger, which is what the
        # redraw was for.
        #
        # A FUTURE REDRAW SHOULD LEAVE THE CLUSTER BLANK and delete this, which
        # puts the seeded measurement back. See ASSETS.md.
        'face': (0.4420, 0.5316, 0.5440, 0.6345),
        'seed': (0.50, 0.59),
    },
}

CONFIG = 'src/config/cockpit.js'


def background_level(rgb):
    """The tone the artist drew on, read off the border rather than assumed."""
    edges = np.concatenate([
        rgb[0].min(axis=1), rgb[-1].min(axis=1),
        rgb[:, 0].min(axis=1), rgb[:, -1].min(axis=1),
    ])
    light = edges[edges >= 200]
    # A source whose border is mostly artwork still has to give an answer, and
    # the brightest thing on the border is the best one available.
    return int(np.median(light)) if len(light) else int(edges.max())


def _grow(light, bg):
    """Extends `bg` through `light`, four-connected."""
    h, w = light.shape
    queue = deque(zip(*np.nonzero(bg)))
    while queue:
        y, x = queue.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                queue.append((ny, nx))
    return bg


def flood_background(rgb, white, loose):
    """Everything the background reaches, starting from the border."""
    h, w, _ = rgb.shape
    darkest = rgb.min(axis=2)
    light = darkest >= white
    bg = np.zeros((h, w), dtype=bool)

    for x in range(w):
        for y in (0, h - 1):
            if light[y, x]:
                bg[y, x] = True
    for y in range(h):
        for x in (0, w - 1):
            if light[y, x]:
                bg[y, x] = True

    bg = _grow(light, bg)
    # Then the looser pass, which may only extend what the strict one found.
    return _grow(darkest >= loose, bg)


def enclosed_background(rgb, bg, enclosed):
    """Pockets of background the border fill cannot reach, and where they are.

    Real and numerous on this cockpit: between each forearm and the tank, under
    the mirror stalks, inside the fuel cap ring, and through the gap between the
    bars and the fairing. Left opaque, every one of them ships as a white patch
    hanging inside the silhouette.
    """
    h, w, _ = rgb.shape
    light = rgb.min(axis=2) >= enclosed
    candidate = light & ~bg
    labels, count = ndimage.label(candidate)
    found = np.zeros((h, w), dtype=bool)
    report = []

    if count:
        sizes = ndimage.sum(candidate, labels, range(1, count + 1))
        for index in range(1, count + 1):
            area = int(sizes[index - 1])
            if area < ENCLOSED_AREA:
                continue
            blob = labels == index
            ys, xs = np.nonzero(blob)
            found |= blob
            report.append({
                'area_px': area,
                'across': [round(xs.min() / w, 4), round(xs.max() / w, 4)],
                'down': [round(ys.min() / h, 4), round(ys.max() / h, 4)],
            })
    report.sort(key=lambda r: -r['area_px'])
    return found, report


def find_panel(rgb, seed):
    """The blank instrument panel, grown from a seed inside it.

    Grown rather than detected outright. A flatness test finds the FAIRING on
    these sources - it is a large, smoothly shaded surface and by local variance
    it looks exactly like a blank screen; measured, it came back as a region
    filling 57 per cent of its own bounding box, which is the tell. A seeded
    flood on colour comes back at 0.99 and above, because the panel really is
    one flat rectangle and the fairing is not.
    """
    h, w, _ = rgb.shape
    y = int(h * seed[1])
    x = int(w * seed[0])
    distance = np.abs(rgb - rgb[y, x]).sum(axis=2)
    labels, _ = ndimage.label(distance < 34)
    index = labels[y, x]
    if index == 0:
        raise SystemExit('panel seed landed on nothing at %s' % (seed,))
    ys, xs = np.nonzero(labels == index)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    fill = len(ys) / ((box[2] - box[0]) * (box[3] - box[1]))
    if fill < 0.9:
        raise SystemExit('panel at %s is not a rectangle (fill %.2f) - move the seed'
                         % (seed, fill))
    return box, fill


def dash_hole(box, width, height):
    """The panel, narrowed to the dash's own aspect and centred in it."""
    x0, y0, x1, y1 = box
    panel_w = (x1 - x0) / width
    panel_h = (y1 - y0) / height
    want = panel_h * height * DASH_ASPECT / width
    if want < panel_w:
        middle = (x0 / width + x1 / width) * 0.5
        return (middle - want * 0.5, y0 / height, middle + want * 0.5, y1 / height)
    # Taller than the dash rather than wider: trim the height instead.
    want_h = panel_w * width / DASH_ASPECT / height
    middle = (y0 / height + y1 / height) * 0.5
    return (x0 / width, middle - want_h * 0.5, x1 / width, middle + want_h * 0.5)


def config_screen():
    """The `screen` rectangle config/cockpit.js is currently using."""
    try:
        text = open(CONFIG, encoding='utf-8').read()
    except OSError:
        return None
    match = re.search(r"screen:\s*\[([^\]]+)\]", text)
    return [round(float(v), 4) for v in match.group(1).split(',')] if match else None


def cut(name, spec, debug=False):
    image = Image.open(spec['source']).convert('RGB')
    width, height = image.size
    raw = np.asarray(image)
    rgb = raw.astype(np.float32)

    level = background_level(raw)
    bg = flood_background(raw, level - BACKGROUND_DROP, level - LOOSE_DROP)
    pockets, holes = enclosed_background(raw, bg, level - ENCLOSED_DROP)
    bg |= pockets
    alpha = np.where(bg, 0.0, 1.0)

    # The edge the artist anti aliased is a blend of the drawing and the white
    # behind it. Inside a narrow band around the background, recover how much of
    # each pixel was really drawing, then undo the blend so the colour is the
    # artwork's own rather than a washed out version of it. Skipping this leaves
    # a pale fringe on every edge, which on a dark neon bike is the one artefact
    # that reads instantly.
    band = (ndimage.binary_dilation(bg, iterations=FEATHER)) & ~bg
    luminance = rgb.min(axis=2)
    edge_alpha = np.clip((level - luminance) / max(level, 1), 0.0, 1.0)
    alpha = np.where(band, edge_alpha, alpha)

    safe = np.maximum(alpha, 1e-3)[..., None]
    unpremultiplied = (rgb - level * (1.0 - alpha[..., None])) / safe
    rgb = np.where(band[..., None], np.clip(unpremultiplied, 0, 255), rgb)

    if spec.get('face'):
        # Authored, because this drawing has no blank panel to find. Still
        # narrowed to the dash's own aspect below, so nothing is stretched.
        face = spec['face']
        panel = (face[0] * width, face[1] * height, face[2] * width, face[3] * height)
        fill = None
    else:
        panel, fill = find_panel(rgb, spec['seed'])
    screen = dash_hole(panel, width, height)
    # Punched last, so nothing upstream mistakes it for background that leaked.
    alpha[int(screen[1] * height):int(screen[3] * height),
          int(screen[0] * width):int(screen[2] * width)] = 0.0

    out = np.dstack([rgb, alpha * 255.0]).astype(np.uint8)
    result = Image.fromarray(out, 'RGBA')
    if max(result.size) > MAX_SIDE:
        shrink = MAX_SIDE / max(result.size)
        result = result.resize((round(result.width * shrink), round(result.height * shrink)),
                               Image.LANCZOS)
    result.save(spec['target'], optimize=True)

    if debug:
        stem = spec['target'].rsplit('.', 1)[0]
        checks = np.indices((height, width)).sum(axis=0) // 64 % 2
        ground = np.where(checks[..., None] == 0, np.array([18, 20, 34]),
                          np.array([34, 24, 52])).astype(np.float32)
        comp = rgb * alpha[..., None] + ground * (1 - alpha[..., None])
        Image.fromarray(comp.astype(np.uint8)).save(stem + '-debug-cut.png')

    solid = alpha > 0.5
    rows = np.nonzero(solid.any(axis=1))[0]
    cols = np.nonzero(solid.any(axis=0))[0]
    rounded = [round(v, 4) for v in screen]
    live = config_screen()
    report = {
        'source': spec['source'],
        'size': [width, height],
        'aspect': round(width / height, 4),
        'target': spec['target'],
        'written': list(result.size),
        'background_level': level,
        'alpha_coverage_pct': round(float(alpha.mean()) * 100, 2),
        'soft_edge_pct': round(float(((alpha > 0) & (alpha < 1)).mean()) * 100, 2),
        # Where the artwork sits inside its margin. This is what the overlay's
        # framing depends on, and the one thing a redrawn source changes without
        # telling anybody.
        'content_bounds_pct': {
            'across': [round(cols.min() / width * 100, 1), round(cols.max() / width * 100, 1)],
            'down': [round(rows.min() / height * 100, 1), round(rows.max() / height * 100, 1)],
        },
        'margin_pct': {
            'left': round(cols.min() / width * 100, 1),
            'right': round((width - cols.max()) / width * 100, 1),
            'top': round(rows.min() / height * 100, 1),
            'bottom': round((height - rows.max()) / height * 100, 1),
        },
        'panel': 'authored gauge face' if fill is None else 'measured from the seed',
        'panel_fill': None if fill is None else round(fill, 3),
        'screen': rounded,
        'screen_pct': {
            'across': [round(screen[0] * 100, 1), round(screen[2] * 100, 1)],
            'down': [round(screen[1] * 100, 1), round(screen[3] * 100, 1)],
        },
        'enclosed_pockets_removed': len(holes),
        'largest_pockets': holes[:5],
    }
    if live is not None and live != rounded:
        report['CONFIG_DISAGREES'] = {'config/cockpit.js': live, 'measured': rounded}
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    debug = '--debug' in sys.argv
    for key in (args or SOURCES.keys()):
        cut(key, SOURCES[key], debug)
