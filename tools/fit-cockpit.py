"""Reframe any cockpit drawing so it meets the framing contract.

    python tools/fit-cockpit.py art/cockpit/candidate.jpg
    python tools/fit-cockpit.py art/cockpit/candidate.jpg --compare
    python tools/fit-cockpit.py art/cockpit/candidate.jpg -o art/cockpit/fitted.jpg

================= WHY THIS EXISTS =================

Image models do not respect framing instructions. Three attempts at the redraw
all filled the frame: windscreen top at 3 per cent down instead of 35, arms
touching the side edges. Asking an artist that cannot measure to hit a
measurement is not a process, so this stops asking. The drawing supplies the
ARTWORK; this supplies the FRAMING.

It only ever SCALES, CENTRES and PADS. It never crops, never stretches, never
changes an aspect. Every pixel the artist drew is still there and still the same
shape; what changes is how much white is around it and how big it is inside the
frame. That matters because the one thing this must not do is alter the drawing
it is trying to preserve.

================= HOW THE SCALE IS SOLVED =================

Two vertical landmarks fix it exactly, with nothing left to choose:

  windscreen top   the topmost drawn row in the central band. It is the top of
                   the whole drawing in the current source, and the band keeps
                   a mirror or a stalk from claiming it.
  grip line        the densest drawn row in the handlebar band. Density, not
                   width: a mirror stalk can be wider than the bar and carries
                   almost no ink.

The distance between them is what `heightScale` is solved from - 0.7034 is
0.245 / 0.3483, where 0.3483 is that gap as a fraction of the image. So making
that gap match is not one adjustment among several, it is THE adjustment. Get it
right and the cockpit is the right size in the frame by construction.

The horizontal is a centring, because the composition is symmetric and nothing
in the framing contract asserts how far across the grips are - `STATUS.md` is
explicit that this is the artist's and not a knob.

================= THE BANDS ARE CONTENT-RELATIVE =================

The grip line is looked for between 40 and 80 per cent of the CONTENT's height,
not of the image's. That is the whole reason this works on a drawing that fills
its frame: a band measured against the image finds the bar only in a drawing
that is already framed correctly, which is exactly the drawing that does not
need this tool.
"""

import argparse
import importlib.util
import os
import sys

import numpy as np
from PIL import Image

BASELINE = 'art/cockpit/cockpit-wide-source.jpg'
DEFAULT_OUT = 'art/cockpit/cockpit-wide-source.jpg'

# THE CONTRACT, measured off the current source rather than typed from memory.
# Run --compare against it and every one of these comes back unchanged.
TARGET_WINDSCREEN = 0.3522   # down the image
TARGET_GRIP = 0.7168         # down the image
# The output. 16:9-ish at the source's own shape, which is what cut-cockpit.py
# reads and what every measurement in the project was solved against.
OUT_WIDTH = 2752
OUT_HEIGHT = 1536

# Where to look for each landmark, as fractions of the CONTENT box.
CENTRE_BAND = (0.40, 0.60)   # across: the windscreen, not the mirrors
GRIP_BAND = (0.40, 0.80)     # down: the handlebar

# The sleeves are allowed to clip the side edges, but only right at the bottom -
# measured on the current source, rows 0.959 to 0.999, the last 4 per cent. Any
# contact above this is a glove or an arm against the edge, which is the fault
# the redraws kept producing.
SIDE_CONTACT_FLOOR = 0.94
# The arms have to REACH the bottom edge or they stop in mid air instead of
# running out of frame.
BOTTOM_REACH = 0.97

# THE BAR SPAN, and it is the check this tool did not have at first.
#
# Scaling and centring can put the two VERTICAL landmarks exactly on their marks
# whatever the drawing's proportions are, because a uniform scale has only one
# degree of freedom and two vertical landmarks consume it. If the drawing is the
# wrong SHAPE - a bar drawn short against a tall cockpit - the vertical fit
# still succeeds and the bar comes out the wrong width, silently. Caught in
# testing: a deliberately stretched candidate fitted to 35.22 and 71.68 per cent
# perfectly and landed a bar span of 45.6 against the contract's 70.9.
#
# Nothing here can fix that. Correcting it needs a NON-UNIFORM scale, which
# distorts the artwork, and distorting the artwork is the one thing this tool
# promises not to do. So it is refused and named.
#
# The tolerance is derived: the grips sit at the ends of the bar, so an error of
# d in the span moves each grip by d/2, and tools/check-redraw.py allows a hand
# to move 1.5 per cent of the width. Twice that is 3 per cent.
TARGET_BAR_SPAN = 0.7093
TOLERANCE_BAR_SPAN = 0.030


def load_keyer():
    """cut-cockpit.py, imported despite the hyphen, so there is one keyer."""
    path = os.path.join(os.path.dirname(__file__), 'cut-cockpit.py')
    spec = importlib.util.spec_from_file_location('cut_cockpit', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def silhouette(image, keyer):
    """The drawn area, and the tone the artist drew it on."""
    rgb = np.asarray(image.convert('RGB')).astype(np.int16)
    white = keyer.background_level(rgb)
    background = keyer.flood_background(
        rgb, white - keyer.BACKGROUND_DROP, white - keyer.LOOSE_DROP,
    )
    enclosed, _ = keyer.enclosed_background(
        rgb, background, white - keyer.ENCLOSED_DROP,
    )
    return ~(background | enclosed), white


def measure(drawn, problems, label):
    """Landmarks in PIXELS, plus the content box they were found in."""
    height, width = drawn.shape
    ys, xs = np.nonzero(drawn)
    if len(ys) == 0:
        problems.append(f'{label}: nothing drawn - the whole image keyed as background')
        return None

    box = {
        'top': int(ys.min()), 'bottom': int(ys.max()),
        'left': int(xs.min()), 'right': int(xs.max()),
    }
    box['height'] = box['bottom'] - box['top'] + 1
    box['width'] = box['right'] - box['left'] + 1
    if box['height'] < height * 0.1:
        problems.append(f'{label}: the drawing is a sliver {box["height"]} px tall')
        return None

    # --- windscreen top -----------------------------------------------------
    cx0 = box['left'] + int(CENTRE_BAND[0] * box['width'])
    cx1 = box['left'] + int(CENTRE_BAND[1] * box['width'])
    centre = drawn[:, cx0:cx1]
    rows = np.nonzero(centre.any(axis=1))[0]
    if len(rows) == 0:
        problems.append(
            f'{label}: no windscreen - nothing is drawn in the central '
            f'{int(CENTRE_BAND[0] * 100)}-{int(CENTRE_BAND[1] * 100)} per cent of the content'
        )
        return None
    windscreen = int(rows.min())

    # --- grip line ----------------------------------------------------------
    y0 = box['top'] + int(GRIP_BAND[0] * box['height'])
    y1 = box['top'] + int(GRIP_BAND[1] * box['height'])
    best_y, best_count, best_span = None, -1, 0
    for y in range(y0, min(y1, height)):
        row = np.nonzero(drawn[y])[0]
        if len(row) > best_count:
            best_count = len(row)
            best_y = y
            best_span = row.max() - row.min()
    if best_y is None or best_count < width * 0.05:
        problems.append(
            f'{label}: no handlebar - no row between {int(GRIP_BAND[0] * 100)} and '
            f'{int(GRIP_BAND[1] * 100)} per cent of the content carries enough ink'
        )
        return None

    # --- hands, as the mass either side of centre in the grip band ----------
    centre_x = (box['left'] + box['right']) * 0.5
    band = drawn[max(best_y - int(0.06 * box['height']), 0):
                 min(best_y + int(0.10 * box['height']), height)]
    hands = {}
    for name, (lo, hi) in {
        'hand left': (box['left'], centre_x - box['width'] * 0.12),
        'hand right': (centre_x + box['width'] * 0.12, box['right']),
    }.items():
        sub = band[:, int(lo):int(hi)]
        hy, hx = np.nonzero(sub)
        if len(hx) == 0:
            problems.append(f'{label}: no {name} found beside the handlebar')
            return None
        hands[name] = {'x': float(hx.mean() + lo), 'span': (float(hx.min() + lo), float(hx.max() + lo))}

    # --- where the drawing leaves the bottom edge ---------------------------
    exits = []
    bottom_row = min(box['bottom'], height - 1)
    edge = np.nonzero(drawn[bottom_row])[0]
    if len(edge):
        splits = np.split(edge, np.where(np.diff(edge) > width * 0.02)[0] + 1)
        exits = [float(run.mean()) for run in splits if len(run) > width * 0.01]

    return {
        'box': box, 'windscreen': windscreen, 'grip': best_y,
        'grip_span': int(best_span), 'hands': hands, 'exits': exits,
        'size': (width, height),
    }


def as_fractions(marks):
    """Landmarks as fractions of their own image, for reporting."""
    width, height = marks['size']
    return {
        'windscreen top': marks['windscreen'] / height,
        'grip line': marks['grip'] / height,
        'bar span': marks['grip_span'] / width,
        'hand left': marks['hands']['hand left']['x'] / width,
        'hand right': marks['hands']['hand right']['x'] / width,
        'content top': marks['box']['top'] / height,
        'content bottom': marks['box']['bottom'] / height,
        'content left': marks['box']['left'] / width,
        'content right': marks['box']['right'] / width,
    }


def report(title, marks):
    print(f'\n{title}')
    for name, value in as_fractions(marks).items():
        print(f'   {name:16} {value * 100:6.2f}%')


def fit(image, marks, white):
    """Scales, centres and pads onto the output canvas."""
    # THE SCALE IS THE ONE UNKNOWN, and two landmarks determine it. The gap
    # between the windscreen top and the grip line has to become the same
    # fraction of the output that it is in the current source.
    gap = marks['grip'] - marks['windscreen']
    if gap <= 0:
        return None, 'the handlebar is above the windscreen - the landmarks are crossed'
    scale = (TARGET_GRIP - TARGET_WINDSCREEN) * OUT_HEIGHT / gap

    new_size = (max(int(round(image.width * scale)), 1), max(int(round(image.height * scale)), 1))
    resized = image.convert('RGB').resize(new_size, Image.LANCZOS)

    # Vertical: put the windscreen top exactly on its mark.
    ty = TARGET_WINDSCREEN * OUT_HEIGHT - marks['windscreen'] * scale
    # Horizontal: centre the CONTENT, not the canvas. A drawing with its artwork
    # off to one side would otherwise stay off to one side.
    content_centre = (marks['box']['left'] + marks['box']['right']) * 0.5 * scale
    tx = OUT_WIDTH * 0.5 - content_centre

    # PADDED WITH THE DRAWING'S OWN BORDER TONE, not with pure white. Sources
    # have arrived at 254 and at 246; padding a 246 drawing with 255 leaves a
    # visible rectangle around the artwork and gives the keyer two different
    # backgrounds to find.
    canvas = Image.new('RGB', (OUT_WIDTH, OUT_HEIGHT), (white, white, white))
    canvas.paste(resized, (int(round(tx)), int(round(ty))))
    return canvas, None


def validate(marks, problems):
    """The checks that a fitted drawing still has to pass."""
    width, height = marks['size']
    fractions = as_fractions(marks)

    for name, target in (('windscreen top', TARGET_WINDSCREEN), ('grip line', TARGET_GRIP)):
        if abs(fractions[name] - target) > 0.006:
            problems.append(
                f'{name} landed at {fractions[name] * 100:.2f}% against a target of '
                f'{target * 100:.2f}% - the fit did not converge'
            )

    span = fractions['bar span']
    if abs(span - TARGET_BAR_SPAN) > TOLERANCE_BAR_SPAN:
        problems.append(
            f'the handlebar spans {span * 100:.1f}% of the width against a contract of '
            f'{TARGET_BAR_SPAN * 100:.1f}% (+/-{TOLERANCE_BAR_SPAN * 100:.1f}). The vertical '
            'landmarks fitted, so the drawing is the wrong SHAPE rather than the wrong size - '
            'the bar is drawn too '
            + ('short' if span < TARGET_BAR_SPAN else 'wide')
            + ' against the cockpit above it. A uniform scale cannot fix that and a '
            'non-uniform one would distort the artwork, so this has to go back to the drawing.'
        )

    # Side edges: sleeves may clip at the very bottom and nothing else may.
    drawn = marks['drawn']
    for side, column in (('left', 0), ('right', width - 1)):
        rows = np.nonzero(drawn[:, column])[0]
        if len(rows) and rows.min() / height < SIDE_CONTACT_FLOOR:
            problems.append(
                f'the drawing touches the {side} edge at {rows.min() / height * 100:.1f}% down, '
                f'above the {SIDE_CONTACT_FLOOR * 100:.0f}% floor - a glove or an arm is against '
                'the frame edge, which is the fault this tool exists to fix'
            )

    if fractions['content bottom'] < BOTTOM_REACH:
        problems.append(
            f'the drawing stops at {fractions["content bottom"] * 100:.1f}% down and never '
            f'reaches the bottom edge - the forearms and the tank have to run OUT of frame, '
            'not stop in mid air'
        )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidate')
    parser.add_argument('-o', '--out', default=DEFAULT_OUT)
    parser.add_argument('--compare', action='store_true',
                        help='measure the candidate against the current source and write nothing')
    parser.add_argument('--baseline', default=BASELINE)
    args = parser.parse_args()

    keyer = load_keyer()
    problems = []

    print(f'keying {args.candidate} ...')
    candidate = Image.open(args.candidate)
    drawn, white = silhouette(candidate, keyer)
    marks = measure(drawn, problems, 'candidate')
    if marks is None:
        print('\nREFUSED')
        for problem in problems:
            print('  - ' + problem)
        return 1
    marks['drawn'] = drawn
    print(f'   {candidate.width} x {candidate.height}, border tone {white}')
    report('candidate, as drawn:', marks)

    if args.compare:
        print(f'\nkeying {args.baseline} ...')
        base_image = Image.open(args.baseline)
        base_drawn, _ = silhouette(base_image, keyer)
        base_marks = measure(base_drawn, problems, 'baseline')
        if base_marks is None:
            print('\nREFUSED: the baseline could not be measured')
            for problem in problems:
                print('  - ' + problem)
            return 1
        report('current source:', base_marks)

        a = as_fractions(marks)
        b = as_fractions(base_marks)
        print('\ndifference (candidate minus current source):')
        for name in b:
            print(f'   {name:16} {(a[name] - b[name]) * 100:+6.2f} points')
        print('\n--compare wrote nothing. Run without it to fit and write the source.')
        return 0

    canvas, error = fit(candidate, marks, white)
    if error:
        print(f'\nREFUSED: {error}')
        return 1

    fitted_drawn, _ = silhouette(canvas, keyer)
    fitted = measure(fitted_drawn, problems, 'fitted')
    if fitted is None:
        print('\nREFUSED: the fitted image could not be re-measured')
        for problem in problems:
            print('  - ' + problem)
        return 1
    fitted['drawn'] = fitted_drawn
    validate(fitted, problems)
    report('after fitting:', fitted)

    scale = (TARGET_GRIP - TARGET_WINDSCREEN) * OUT_HEIGHT / (marks['grip'] - marks['windscreen'])
    print(f'\n   scaled x{scale:.4f}, output {OUT_WIDTH} x {OUT_HEIGHT}, padded with tone {white}')

    if problems:
        print(f'\nREFUSED: {len(problems)} problem(s)')
        for problem in problems:
            print('  - ' + problem)
        print('\nNothing was written.')
        return 1

    os.makedirs(os.path.dirname(args.out) or '.', exist_ok=True)
    canvas.save(args.out, quality=95)
    print(f'\nwrote {args.out}')
    print('next: python tools/cut-cockpit.py --debug && node tools/measure-cockpit.mjs')
    return 0


if __name__ == '__main__':
    sys.exit(main())
