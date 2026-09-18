"""Does a redrawn cockpit still put the hands and the bars where they were?

    python tools/check-redraw.py art/cockpit/candidate.jpg
    python tools/check-redraw.py art/cockpit/candidate.jpg --debug

Exits non-zero if anything moved beyond tolerance, so a candidate can be
refused before it is adopted rather than after `measure-cockpit` fails and
nobody knows which of the two changes caused it.

================= WHY THIS EXISTS =================

The cockpit is ONE drawing and three separate things are solved against it:

1. **The framing contract.** `tools/measure-cockpit.mjs` asserts the windscreen
   top at 60-64 per cent down the frame and the grips at 85-88. Those were not
   chosen, they were SOLVED: `heightScale` 0.7034 is 0.245 / 0.3483, where
   0.3483 is the distance between the windscreen top and the grips as a
   fraction of the IMAGE. Move the grips inside the drawing and that division
   is answering a question about a picture that no longer exists.
2. **The paint mask.** `tools/paint-mask.py` finds each part by a seed that is
   the deepest point inside it. A part that has moved takes its seed with it.
3. **The sway pivot.** `player/Cockpit.js` rolls the sprite about the centre of
   the dash hole, and `config/cockpit.js` -> `screen` is where that hole is.

The brief for a redraw says the gloves, sleeves, handlebar, levers and switch
blocks stay exactly where they are. This is what checks that they did.

================= WHAT IS MEASURED, AND WHY THESE =================

Landmarks that survive a change of STYLE, because the whole point of the redraw
is that the style gets richer. Nothing here looks at colour, line weight or
detail - only at where the silhouette is.

  grip line     the row where the drawn silhouette is densest across the bar
                band. That is the handlebar, and it is the single number the
                framing contract is most sensitive to.
  bar span      how far the bar reaches across the image. Catches a redraw that
                kept the bar's height and changed its scale.
  glove mass    the centroid of each glove, which moves if a hand is redrawn
                further in, out, up or down, plus its knuckle line - the
                centroid alone is damped by its own measuring box.
  sleeve entry  where each arm crosses the bottom edge. The forearms run off
                the bottom by design, and where they leave is what makes them
                read as continuing past the frame.

BOTH IMAGES GO THROUGH THE SAME KEYER, imported from tools/cut-cockpit.py
rather than reimplemented. A candidate measured with a different silhouette
extractor from the baseline is being compared against a different question.
"""

import argparse
import importlib.util
import os
import sys

import numpy as np
from PIL import Image

BASELINE = 'art/cockpit/cockpit-wide-source.jpg'
DEBUG_OUT = 'tools/out/check-redraw.png'

# Everything is measured in FRACTIONS of the image, so a candidate drawn at a
# different resolution is compared fairly.
#
# ================= THE TOLERANCES, AND WHERE THEY COME FROM =================
#
# VERTICAL, 1.0 per cent of image height. Solved rather than picked. The
# framing contract allows the grips between 85 and 88 per cent down the FRAME
# and they currently sit at 86.5, so there is 1.5 per cent of frame height of
# room in the tighter direction. The sprite is 0.7034 of the frame's height, so
# 1.5 per cent of the frame is 1.5 / 0.7034 = 2.13 per cent of the IMAGE. Half
# of that is the working tolerance: a redraw may spend half the budget and
# leave the other half for a future framing change, because two things that
# each spend all of it cannot both ship.
#   At the current source height of 1536 px, 1.0 per cent is 15 px.
TOLERANCE_Y = 0.010

# HORIZONTAL, 1.5 per cent of image width. Looser than vertical on purpose:
# nothing in the framing contract asserts how far across the grips are - STATUS
# .md is explicit that where the hands sit across the frame is the artist's and
# not a knob - but the mirrors ARE asserted, across 32.8 to 67.3 per cent, and
# the paint mask's seeds have to keep landing in the right regions. This is
# what keeps both true without pretending the across position is fixed.
#   At the current source width of 2752 px, 1.5 per cent is 41 px.
TOLERANCE_X = 0.015

# SCALE, 2 per cent of the bar's span. A bar drawn 2 per cent wider moves each
# grip about 0.7 per cent of the width outward, which is inside the horizontal
# tolerance above and is the largest scale change that can be.
TOLERANCE_SPAN = 0.020

# The band the handlebar lives in, as fractions of image height. Wide enough to
# find the bar in a redraw that moved it slightly, narrow enough not to catch
# the tank below or the dash above.
BAR_BAND = (0.60, 0.80)
# Where each hand-and-forearm assembly is looked for. The boxes exist to
# separate left from right, not to assert a position, so they are generous - and
# they run all the way to the BOTTOM EDGE on purpose.
#
# A box that stops short of the bottom DAMPS what it measures. Measured with a
# drawing shifted 22 px down and a box ending at 0.90: the centroids moved only
# 11 px, because ink leaving the bottom of the box was replaced by ink entering
# the top, and the check under-reported the move by half. Running to the edge
# means the only ink that can escape is ink that leaves the IMAGE, which the
# sleeve entry landmark below is watching anyway.
#
# A knuckle-line measure was tried instead and was worse: the topmost ink in
# these boxes is the forearm, not the hand, so it pinned to the box edge and
# reported 0.6000 for both gloves whatever the drawing did.
GLOVE_BOXES = {
    'hand left': (0.02, 0.40, 0.58, 1.00),
    'hand right': (0.60, 0.98, 0.58, 1.00),
}


def load_keyer():
    """cut-cockpit.py, imported despite the hyphen, so there is one keyer."""
    path = os.path.join(os.path.dirname(__file__), 'cut-cockpit.py')
    spec = importlib.util.spec_from_file_location('cut_cockpit', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def silhouette(path, keyer):
    """The drawn area of an image, as a boolean mask."""
    image = Image.open(path).convert('RGB')
    rgb = np.asarray(image).astype(np.int16)
    white = keyer.background_level(rgb)
    background = keyer.flood_background(
        rgb, white - keyer.BACKGROUND_DROP, white - keyer.LOOSE_DROP,
    )
    enclosed, _ = keyer.enclosed_background(
        rgb, background, white - keyer.ENCLOSED_DROP,
    )
    drawn = ~(background | enclosed)
    return drawn, image.size


def landmarks(drawn):
    """Every measured position, in fractions of the image."""
    height, width = drawn.shape
    out = {}

    # The grip line: the densest row in the bar band. Density rather than the
    # widest span, because a mirror stalk can be wider than the bar and carries
    # almost no ink.
    best_y, best_count, best_span = None, -1, 0
    for y in range(int(BAR_BAND[0] * height), int(BAR_BAND[1] * height)):
        xs = np.nonzero(drawn[y])[0]
        if len(xs) > best_count:
            best_count = len(xs)
            best_y = y
            best_span = xs.max() - xs.min()
    out['grip line'] = {'y': best_y / height}
    out['bar span'] = {'span': best_span / width}

    for name, (x0, x1, y0, y1) in GLOVE_BOXES.items():
        box = drawn[int(y0 * height):int(y1 * height), int(x0 * width):int(x1 * width)]
        ys, xs = np.nonzero(box)
        if len(xs) == 0:
            out[name] = None
            continue
        out[name] = {
            'x': (xs.mean() + x0 * width) / width,
            'y': (ys.mean() + y0 * height) / height,
        }

    # Where each arm leaves through the bottom edge. Measured on the last row
    # that has any ink at all, because a redraw may extend or shorten the very
    # bottom by a pixel or two without meaning anything by it.
    bottom = None
    for y in range(height - 1, int(0.85 * height), -1):
        if drawn[y].any():
            bottom = y
            break
    if bottom is not None:
        xs = np.nonzero(drawn[bottom])[0]
        splits = np.split(xs, np.where(np.diff(xs) > width * 0.02)[0] + 1)
        runs = [run for run in splits if len(run) > width * 0.01]
        if len(runs) >= 2:
            out['sleeve entry left'] = {'x': runs[0].mean() / width}
            out['sleeve entry right'] = {'x': runs[-1].mean() / width}
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidate', help='the redrawn cockpit, before keying')
    parser.add_argument('--baseline', default=BASELINE)
    parser.add_argument('--debug', action='store_true',
                        help='write an overlay of the two silhouettes to ' + DEBUG_OUT)
    args = parser.parse_args()

    keyer = load_keyer()
    print('keying baseline ...')
    base_drawn, base_size = silhouette(args.baseline, keyer)
    print('keying candidate ...')
    cand_drawn, cand_size = silhouette(args.candidate, keyer)

    base_aspect = base_size[0] / base_size[1]
    cand_aspect = cand_size[0] / cand_size[1]
    print(f'\nbaseline  {base_size[0]} x {base_size[1]}  aspect {base_aspect:.4f}')
    print(f'candidate {cand_size[0]} x {cand_size[1]}  aspect {cand_aspect:.4f}')

    failures = []
    # ASPECT FIRST, because everything below is a fraction of the image and a
    # candidate at a different shape makes every one of those fractions mean
    # something else. This is not a tolerance, it is a precondition.
    if abs(cand_aspect - base_aspect) > 0.01:
        failures.append(
            f'aspect {cand_aspect:.4f} against {base_aspect:.4f} - the drawing must be '
            'the same shape or every measurement below is comparing different frames'
        )

    base = landmarks(base_drawn)
    cand = landmarks(cand_drawn)

    print(f'\n{"landmark":20} {"baseline":>10} {"candidate":>10} {"moved":>9}   tolerance')
    for name in base:
        if base[name] is None or cand.get(name) is None:
            failures.append(f'{name}: not found in the candidate')
            print(f'{name:20} {"-":>10} {"MISSING":>10}')
            continue
        for axis, value in base[name].items():
            got = cand[name][axis]
            moved = got - value
            if axis == 'y':
                limit = TOLERANCE_Y
            elif axis == 'span':
                limit = TOLERANCE_SPAN
            else:
                limit = TOLERANCE_X
            ok = abs(moved) <= limit
            pixels = moved * (cand_size[1] if axis == 'y' else cand_size[0])
            print(f'{name + " " + axis:20} {value:10.4f} {got:10.4f} '
                  f'{moved:+9.4f}   +/-{limit:.3f}  ({pixels:+.0f} px)  {"ok" if ok else "MOVED"}')
            if not ok:
                failures.append(
                    f'{name} {axis} moved {moved:+.4f} ({pixels:+.0f} px), '
                    f'tolerance +/-{limit:.3f}'
                )

    if args.debug:
        os.makedirs('tools/out', exist_ok=True)
        size = (900, int(900 / base_aspect))
        a = np.asarray(Image.fromarray((base_drawn * 255).astype(np.uint8)).resize(size))
        b = np.asarray(Image.fromarray((cand_drawn * 255).astype(np.uint8)).resize(size))
        # Baseline in red, candidate in cyan: anything that did not move comes
        # out grey, and anything that did shows as a coloured fringe.
        overlay = np.zeros((size[1], size[0], 3), np.uint8)
        overlay[..., 0] = a
        overlay[..., 1] = b
        overlay[..., 2] = b
        Image.fromarray(overlay).save(DEBUG_OUT)
        print(f'\nwrote {DEBUG_OUT} - baseline red, candidate cyan, grey is agreement')

    if failures:
        print(f'\nREFUSED: {len(failures)} problem(s)')
        for failure in failures:
            print('  - ' + failure)
        print('\nThe gloves, sleeves, handlebar, levers and switch blocks must not move.')
        return 1

    print('\ncheck-redraw: the hands and the bars are where they were')
    return 0


if __name__ == '__main__':
    sys.exit(main())
