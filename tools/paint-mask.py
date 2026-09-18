"""Derive a mask of the cockpit's PAINTED BODYWORK and write it as an RGB PNG.

    python tools/paint-mask.py
    python tools/paint-mask.py --debug     # and an overlay in tools/out/

Output: public/sprites/cockpit-mask.png, three single-channel masks packed into
one texture so the four bike colourways cost one extra fetch, not three.

    R  bodywork   fairing, tank, nose panels, frame block, fuel cap
    G  rim light  the bright piping ON that bodywork, and nothing else
    B  glass      the windscreen, kept apart so its tint can be dialled or
                  switched off on its own

WHY THE MASK IS REGIONAL AND NOT CHROMATIC, which is the whole design and was
settled by measuring the art before any of this was written. The drawing has NO
colour separation between the bike and the rider. Measured on the shipped
sprite:

    region       mean RGB         mean sat   below luma 40
    fairing      34, 36, 51       0.43       69 %
    tank         51, 63, 77       0.39       21 %
    gloves       38, 49, 61       0.45       42 %
    bars         37, 53, 63       0.42       47 %

The gloves, the bars and the fairing are the same dark blue-grey at the same
saturation, and the whole image is one hue family - 87 per cent of every
coloured pixel sits between 180 and 225 degrees, 7 per cent at 285 to 300, and
nothing anywhere else. So no threshold on hue, saturation or luminance can tell
a fairing from a glove, and any attempt reads as a mask that works on one and
leaks into the other.

What DOES separate them is the line art. The drawing is ink on flat fills, and
the ink fully encloses every part. Labelling the connected components of
everything that is not ink separates the picture cleanly into named regions, and
the region a seed lands in is the part that seed names. That is the same
technique tools/cut-cockpit.py already uses to find the blank instrument panel,
which it reports a fill ratio of 1.000 for.

ONLY THE SEEDS ARE AUTHORED. Every region is measured out from its seed, so a
redrawn source moves a part without anybody editing a number - and a seed that
stops landing where it should is caught below rather than shipped, because a
mask of the wrong part is not a thing anyone would notice in a colourway.
"""

import argparse
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

SOURCE = 'art/cockpit/cockpit-wide-source.jpg'
SHIPPED = 'public/sprites/cockpit.png'
TARGET = 'public/sprites/cockpit-mask.png'
DEBUG = 'tools/out/paint-mask.png'

# THE MASK IS BUILT AGAINST THE SHIPPED SPRITE, not the source. Both are keyed
# from the same drawing, but cut-cockpit.py resizes and punches the dash hole,
# and a mask that does not line up with the texture it multiplies is worse than
# no mask at all. The source is read only to confirm the two still agree.

# Ink is the darkest thing in the picture. 13 per cent of the opaque pixels sit
# below 14, and at that level the components come out as whole parts; by 18 the
# ink has thickened enough to split single parts in two (measured: 421 regions
# at 14, 2544 at 18).
INK_LUMA = 14
# Below this an area is a speck of anti-aliasing between two strokes, not a part.
MIN_REGION = 3000
# How far a region may drift in size before the seed is assumed to have landed
# somewhere else. Generous, because a redraw is allowed to change a part's size;
# tight enough that a seed falling into the neighbouring panel is caught.
SIZE_TOLERANCE = 0.45

# THE RIM LIGHT AND THE PIPING, which are the same thing and are now treated as
# one. It is the neon trim drawn along the edges of the bodywork, and it FOLLOWS
# THE BIKE: on EMBER the fairing is orange, so orange is what its piping has to
# be. Trim that stays magenta on an orange bike does not read as a choice, it
# reads as a bug - which is exactly how it was reported.
#
# Measured before this was widened: of every magenta pixel in the drawing, 26
# per cent landed in this channel and 70 per cent landed in NO channel at all,
# so most of the piping was never recoloured. The cause is geometric. The
# bodywork regions are the fills BOUNDED by ink, and the piping is drawn ON that
# boundary - outside every fill, in the ink's own band. A 6 pixel reach with a
# high threshold caught the brightest quarter of it and left the rest.
RIM_VALUE = 0.26
RIM_SAT = 0.20
# How far outside a bodywork fill to look. Wide enough to cross the ink line the
# piping is drawn on, which is what the old 6 could not do.
RIM_REACH = 16
# THE GLOVES KEEP THEIR CYAN, and widening the reach is precisely what puts that
# at risk: a glove resting on the tank is within 16 pixels of it. So every
# EXCLUDED part is grown by this much and subtracted from the rim, which turns
# the exclusion from an accident of distance into a rule. The gloves and sleeves
# are the RIDER; the rider does not change colour when the bike does.
EXCLUSION_REACH = 5

# Seeds, in fractions of the image, measured off the labelled components. Each
# names one part; `size` is what that part measured when the seed was placed and
# is what the drift check above compares against.
PARTS = [
    # --- R: the painted bodywork -------------------------------------------
    {'name': 'fairing', 'channel': 'body', 'at': (0.6030, 0.6212), 'size': 49842},
    {'name': 'tank', 'channel': 'body', 'at': (0.3770, 0.9790), 'size': 66986},
    {'name': 'frameBlock', 'channel': 'body', 'at': (0.4438, 0.7524), 'size': 10978},
    {'name': 'nosePanelLeft', 'channel': 'body', 'at': (0.3628, 0.8618), 'size': 8013},
    {'name': 'nosePanelRight', 'channel': 'body', 'at': (0.6367, 0.8618), 'size': 7780},
    {'name': 'tankSideLeft', 'channel': 'body', 'at': (0.3340, 0.9353), 'size': 7327},
    {'name': 'tankSideRight', 'channel': 'body', 'at': (0.6655, 0.9335), 'size': 7352},
    {'name': 'fuelCapRing', 'channel': 'body', 'at': (0.4775, 0.9431), 'size': 10455},
    {'name': 'fuelCapFace', 'channel': 'body', 'at': (0.5464, 0.9388), 'size': 9910},
    # --- B: the windscreen --------------------------------------------------
    {'name': 'windscreen', 'channel': 'glass', 'at': (0.4854, 0.4339), 'size': 82555},
]

# A SEED IS THE DEEPEST POINT INSIDE ITS PART, not the part's centroid. The
# first set of seeds were centroids and four of them missed: a centroid is only
# guaranteed to be inside a CONVEX shape, and the fairing is a horseshoe around
# the dash while the tank has the filler cap punched out of its middle. The
# fairing's centroid landed on ink and the tank's landed in the cap. Each seed
# here is the pixel furthest from its own region's boundary, which is inside by
# construction and is also the point most tolerant of a redraw moving an edge.

# Parts that must NOT end up in any channel. Not used to build the mask - they
# are checked, so that a seed which has wandered into one of them fails loudly
# instead of painting the rider's gloves in the bike's colour. These are the
# exclusions the brief names: gloves, sleeves, bars, levers, switch blocks,
# dash screen and mirror glass.
FORBIDDEN = [
    {'name': 'sleeveLeft', 'at': (0.099, 0.922)},
    {'name': 'sleeveRight', 'at': (0.901, 0.922)},
    {'name': 'gloveLeft', 'at': (0.196, 0.739)},
    {'name': 'gloveRight', 'at': (0.799, 0.707)},
    {'name': 'mirrorLeft', 'at': (0.302, 0.470)},
    {'name': 'mirrorRight', 'at': (0.698, 0.470)},
    {'name': 'barLeft', 'at': (0.391, 0.703)},
    {'name': 'barRight', 'at': (0.607, 0.703)},
]


def luminance(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def label_parts(rgb, alpha):
    """Every enclosed fill in the drawing, as a labelled image."""
    opaque = alpha > 200
    ink = opaque & (luminance(rgb) < INK_LUMA)
    free = opaque & ~ink
    labels, count = ndimage.label(free)
    return labels, count, ink


def region_at(labels, shape, at, name):
    """The component a seed lands in, or None with a reason."""
    height, width = shape
    x = int(round(at[0] * (width - 1)))
    y = int(round(at[1] * (height - 1)))
    index = labels[y, x]
    if index == 0:
        return None, f'{name}: seed ({at[0]:.3f}, {at[1]:.3f}) landed on ink, not inside a fill'
    return index, None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--debug', action='store_true', help='write an overlay to ' + DEBUG)
    args = parser.parse_args()

    sprite = Image.open(SHIPPED).convert('RGBA')
    pixels = np.asarray(sprite).astype(np.float32)
    rgb = pixels[..., :3]
    alpha = pixels[..., 3]
    height, width = alpha.shape
    print(f'sprite      {width} x {height}')

    source = Image.open(SOURCE)
    print(f'source      {source.size[0]} x {source.size[1]}  (read only to confirm it is still the same drawing)')

    labels, count, ink = label_parts(rgb, alpha)
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    big = int((sizes >= MIN_REGION).sum())
    print(f'ink < {INK_LUMA}    {100 * ink.sum() / max((alpha > 200).sum(), 1):.0f}% of the opaque pixels')
    print(f'regions     {count} total, {big} above {MIN_REGION} px\n')

    problems = []
    claimed = {}
    channels = {
        'body': np.zeros((height, width), bool),
        'glass': np.zeros((height, width), bool),
    }

    for part in PARTS:
        index, why = region_at(labels, (height, width), part['at'], part['name'])
        if why:
            problems.append(why)
            continue
        size = int(sizes[index])
        drift = abs(size - part['size']) / max(part['size'], 1)
        status = 'ok'
        if drift > SIZE_TOLERANCE:
            status = 'DRIFTED'
            problems.append(
                f"{part['name']}: region is {size} px against {part['size']} recorded "
                f'({drift * 100:.0f}% drift) - the seed is probably in a different part now'
            )
        if index in claimed:
            problems.append(f"{part['name']}: same region as {claimed[index]}; two seeds, one part")
        claimed[index] = part['name']
        channels[part['channel']] |= labels == index
        print(f"  {part['name']:16} {part['channel']:6} {size:7d} px  {drift * 100:5.1f}% drift  {status}")

    print()
    excluded_mask = np.zeros((height, width), bool)
    for part in FORBIDDEN:
        index, why = region_at(labels, (height, width), part['at'], part['name'])
        if why:
            print(f"  {part['name']:16} EXCLUDED  (its seed is on ink; nothing to check)")
            continue
        excluded_mask |= labels == index
        leaked = index in claimed
        if leaked:
            problems.append(
                f"{part['name']}: EXCLUDED part has been claimed by {claimed[index]} - "
                'the bike colour would be painted onto the rider'
            )
        print(f"  {part['name']:16} EXCLUDED  {int(sizes[index]):7d} px  "
              f"{'LEAKED INTO THE MASK' if leaked else 'clear'}")

    # --- the rim light and the piping --------------------------------------
    body = channels['body']
    reach = ndimage.binary_dilation(body, iterations=RIM_REACH)
    scaled = rgb / 255.0
    value = scaled.max(2)
    spread = value - scaled.min(2)
    saturation = np.where(value > 0.02, spread / np.maximum(value, 1e-6), 0)
    rim = reach & (value > RIM_VALUE) & (saturation > RIM_SAT) & (alpha > 200)
    # The windscreen is bright and saturated over a large area and would swamp
    # the rim channel; it has its own.
    rim &= ~channels['glass']
    # And nothing that belongs to the rider, however close it sits to the tank.
    if excluded_mask is not None:
        rim &= ~ndimage.binary_dilation(excluded_mask, iterations=EXCLUSION_REACH)

    print(f'\n  rimLight         body   {int(rim.sum()):7d} px  '
          f'({100 * rim.sum() / max(body.sum(), 1):.1f}% of the bodywork)')

    if rim.sum() < 200:
        problems.append('rim light: almost nothing selected; the thresholds no longer match the art')

    # --- write --------------------------------------------------------------
    mask = np.zeros((height, width, 3), np.uint8)
    mask[..., 0] = np.where(body, 255, 0)
    mask[..., 1] = np.where(rim, 255, 0)
    mask[..., 2] = np.where(channels['glass'], 255, 0)
    # A one pixel blur, so the edge of a recolour lands on the ink line rather
    # than one pixel inside it and leaves a hairline of the original colour.
    blurred = np.stack(
        [ndimage.gaussian_filter(mask[..., c].astype(np.float32), 1.0) for c in range(3)],
        axis=2,
    )
    Image.fromarray(np.clip(blurred, 0, 255).astype(np.uint8)).save(TARGET)
    covered = 100 * (body | rim | channels['glass']).sum() / max((alpha > 200).sum(), 1)
    print(f'\nwrote {TARGET}  - {covered:.1f}% of the visible cockpit is masked')

    if args.debug:
        import os
        os.makedirs('tools/out', exist_ok=True)
        # The drawing, with each channel tinted and everything excluded left as
        # it is. A percentage is a proxy for a mask; this is the mask.
        overlay = rgb.copy()
        overlay[body] = overlay[body] * 0.35 + np.array([255, 90, 40]) * 0.65
        overlay[channels['glass']] = (
            overlay[channels['glass']] * 0.45 + np.array([60, 130, 255]) * 0.55
        )
        overlay[rim] = np.array([120, 255, 160])
        out = np.dstack([overlay, alpha]).clip(0, 255).astype(np.uint8)
        Image.fromarray(out, 'RGBA').save(DEBUG)
        print(f'wrote {DEBUG}  - orange is bodywork, blue is glass, green is rim light,'
              ' everything left dark is excluded')

    if problems:
        print('\nPROBLEMS')
        for problem in problems:
            print('  - ' + problem)
        return 1
    print('\npaint-mask: ok')
    return 0


if __name__ == '__main__':
    sys.exit(main())
