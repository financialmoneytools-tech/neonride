"""
skyline-compare - the measuring half of tools/skyline-check.mjs.

Takes the with/without ablation pairs that tool leaves in tools/out/skyline
and turns each one into three numbers about the mountains in that frame.

    python tools/skyline-compare.py <dir> <samples> <roads> keep|drop

Where the horizon fell in each frame is read from `<dir>/horizons.txt`, which
the tool writes beside the captures. It is measured in the browser from the
camera that actually rendered, because the pitch and the fov both move.

================= THE THREE NUMBERS =================

coverage  share of the frame the mountains occupy. A horizon range is a
          strip; a wall is a third of the picture.
reach     how far below the horizon the mountains are still VISIBLE, as a
          share of the frame beneath it. THIS IS THE SLAB TEST: distant
          mountains sit on the horizon and stop, a wall beside the lens runs
          from the skyline toward the bottom edge.

          Weighted by how much each pixel actually changes when the ridges
          are hidden, which the first version was not. Every ridge has a
          skirt below the horizon - the foot is painted the fog colour so it
          melts into the haze - and that skirt is invisible to a rider and
          perfectly visible to a binary mask. Unweighted, it scored a ring on
          the horizon at 0.27 and a wall on the lens at 0.28, which is to say
          it measured nothing. The row taken is the one above which
          `REACH_SHARE` of the total change lies.

Interior shading is NOT measured here. Three attempts to see it in the
picture each measured something else - the vertex gradient, then the height
profile, then whichever layer stood behind the near one - and a flat black
wall passed all three. It is read straight off the colour buffer by the tool
instead; see `ridgeFaces` in tools/skyline-check.mjs.
"""
import io
import os
import shutil
import sys

from PIL import Image

DIR = sys.argv[1]
SAMPLES = int(sys.argv[2])
ROADS = sys.argv[3].split()
# Written beside the captures by the tool, so this half can be re-run against
# kept shots - recalibrating a threshold must not cost another ride.
HORIZONS = {}
_path = DIR + '/horizons.txt'
if os.path.exists(_path):
    for line in io.open(_path, encoding='utf-8'):
        parts = line.split()
        if len(parts) == 3:
            HORIZONS[(parts[0], int(parts[1]))] = float(parts[2])
KEEP = sys.argv[4] == 'keep'

# Work at a sixth of the frame. The mask is a large shape; the pixels are not
# the point and a full 1280x720 difference per sample is slow for nothing.
GRID = (214, 120)

# A pixel counts as mountain when hiding them changed it by this much, summed
# over the channels. High enough to ignore the dither and the jpeg-ish noise
# of a re-render, low enough to catch a near-black ridge against a dark sky.
DIFF = 26



# Share of the mountains' total visual weight that must lie above the row
# `reach` reports. The last few per cent is the fog-coloured skirt, which is
# geometry rather than anything a rider can see.
REACH_SHARE = 0.97

LIMITS = {
    # A range across the horizon is allowed to be big. A third of the frame
    # is what was reported as a wall, so the line sits well under it.
    'coverage': 0.20,
    # THE SLAB TEST. A tenth of the space below the horizon is a range whose
    # feet are just under the skyline. Anything approaching half is a wall.
    'reach': 0.22,
}


def load(path):
    return Image.open(path).convert('RGB').resize(GRID, Image.LANCZOS)


def measure(road, index):
    a = DIR + '/%s-%d-with.png' % (road, index)
    b = DIR + '/%s-%d-without.png' % (road, index)
    if not (os.path.exists(a) and os.path.exists(b)):
        return None
    with_px = list(load(a).getdata())
    without_px = list(load(b).getdata())
    w, h = GRID
    horizon = HORIZONS.get((road, index), 0.5) * h

    counted = 0
    lum_all = []
    top_row = [None] * w
    weight_by_row = [0.0] * h
    for i, (p, q) in enumerate(zip(with_px, without_px)):
        lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]
        lum_all.append(lum)
        delta = abs(p[0] - q[0]) + abs(p[1] - q[1]) + abs(p[2] - q[2])
        if delta < DIFF:
            continue
        counted += 1
        col = i % w
        row = i // w
        if top_row[col] is None:
            top_row[col] = row
        weight_by_row[row] += delta

    total = float(w * h)
    coverage = counted / total
    below = max(1.0, h - horizon)

    # The row above which REACH_SHARE of the change lies.
    all_weight = sum(weight_by_row)
    lowest = horizon
    if all_weight > 0:
        running = 0.0
        for row in range(h):
            running += weight_by_row[row]
            if running >= all_weight * REACH_SHARE:
                lowest = row
                break
    reach = max(0.0, lowest - horizon) / below

    def spread(values):
        if len(values) < 2:
            return 0.0
        mean = sum(values) / len(values)
        return (sum((v - mean) ** 2 for v in values) / len(values)) ** 0.5

    return {'coverage': coverage, 'reach': reach}


print('')
print('THE MOUNTAINS, MEASURED BY HIDING THEM  (worst of %d samples per road)' % SAMPLES)
print('')
print('  %-16s %9s %9s   %s' % ('road', 'coverage', 'reach', 'verdict'))

bad = []
for road in ROADS:
    runs = [measure(road, i) for i in range(SAMPLES)]
    runs = [r for r in runs if r]
    if not runs:
        print('  %-16s %9s' % (road, 'no mountains'))
        continue

    worst = {
        'coverage': max(r['coverage'] for r in runs),
        'reach': max(r['reach'] for r in runs),
    }

    faults = []
    if worst['coverage'] > LIMITS['coverage']:
        faults.append('takes too much of the frame')
    if worst['reach'] > LIMITS['reach']:
        faults.append('A WALL - it runs far below the horizon')
    if faults:
        bad.append(road)

    print('  %-16s %9.3f %9.3f   %s'
          % (road, worst['coverage'], worst['reach'],
             ' and '.join(faults) if faults else 'ok'))

print('')
print('  coverage = share of the frame the mountains occupy      (limit %.2f)'
      % LIMITS['coverage'])
print('  reach    = how far below the horizon they descend       (limit %.2f)'
      % LIMITS['reach'])
print('')

if not KEEP and os.path.isdir(DIR):
    shutil.rmtree(DIR, ignore_errors=True)

if bad:
    for road in bad:
        print('FAIL  %s has a wall on the horizon, not a range' % road)
    sys.exit(1)
print('PASS  every road has mountains that sit on the horizon and have faces')
sys.exit(0)
