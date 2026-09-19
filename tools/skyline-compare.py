"""
skyline-compare - the measuring half of tools/road-run.mjs.

Takes the with/without ablation pairs that tool leaves in tools/out/roads/sky
and says how much of the frame the mountains take.

    python tools/skyline-compare.py <dir> <samples> <roads> keep|drop

Where the horizon fell in each frame is read from `<dir>/horizons.txt`, which
the tool writes beside the captures.

================= ONE NUMBER, AND THE ONE THAT WAS WRONG =================

coverage  the share of the frame the mountains occupy, found by hiding them
          and counting what changed. Calibrated from BOTH ends at the size
          this now runs at: the ring measures 0.047 to 0.166 across the six
          roads, and `--prove` - ridges dragged to 70 units with the saddle
          flattened, which is the wall the ring replaced - measures 0.220 to
          0.517. The limit sits in the gap.

There used to be a second number, `reach`: how far below the horizon the
ridge descended. It was built on a theory about what a wall looks like and
the theory was wrong. Measured against real walls it scored 0.012 to 0.230,
which overlaps the ring's 0.060 to 0.239 completely - it does not separate
them at all. A wall beside the lens is tall and near, so it fills the frame
UPWARD from the horizon; it is the share of the frame that grows, not the
descent. It is gone rather than demoted, because a metric that does not
discriminate is worse than no metric: it reads like evidence.

Interior shading is not measured here either. Three attempts to see it in
the picture each measured something else, and a flat black wall passed all
three; it is read straight off the colour buffer by `ridgeFaces` in
tools/road-run.mjs, where a silhouette scores exactly 0.
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





LIMITS = {
    # In the measured gap between a ring (worst 0.166) and a wall (best
    # 0.220). See the header - both ends were measured, neither was chosen.
    'coverage': 0.20,
    'coverage': 0.20,
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

    counted = 0
    for p, q in zip(with_px, without_px):
        if abs(p[0] - q[0]) + abs(p[1] - q[1]) + abs(p[2] - q[2]) >= DIFF:
            counted += 1

    coverage = counted / float(w * h)
    return {'coverage': coverage}


print('')
print('THE MOUNTAINS, MEASURED BY HIDING THEM  (worst of %d samples per road)' % SAMPLES)
print('')
print('  %-16s %9s   %s' % ('road', 'coverage', 'verdict'))

bad = []
for road in ROADS:
    runs = [measure(road, i) for i in range(SAMPLES)]
    runs = [r for r in runs if r]
    if not runs:
        print('  %-16s %9s' % (road, 'no mountains'))
        continue

    worst = {'coverage': max(r['coverage'] for r in runs)}

    faults = []
    if worst['coverage'] > LIMITS['coverage']:
        faults.append('A WALL - it takes too much of the frame')
    if faults:
        bad.append(road)

    print('  %-16s %9.3f   %s'
          % (road, worst['coverage'], ' and '.join(faults) if faults else 'ok'))

print('')
print('  coverage = share of the frame the mountains occupy      (limit %.2f)'
      % LIMITS['coverage'])
print('')

if not KEEP and os.path.isdir(DIR):
    shutil.rmtree(DIR, ignore_errors=True)

if bad:
    for road in bad:
        print('FAIL  %s has a wall on the horizon, not a range' % road)
    sys.exit(1)
print('PASS  every road has mountains that sit on the horizon and have faces')
sys.exit(0)
