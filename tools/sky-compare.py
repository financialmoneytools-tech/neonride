"""
sky-compare - the picture half of tools/sky-stable.mjs.

Reads the captures that tool leaves in tools/out/sky and answers two questions
about every road: does its sky hold still across a run, and does the road
reached through the menus look like the same road reached by ?theme=.

    python tools/sky-compare.py <dir> <frames> <floor> <mult> <marks> <roads>

Every setting is passed in by sky-stable.mjs rather than repeated here, so the
two halves cannot come to disagree about what a mark is or where the captures
went. It used to live inside the .mjs as an array of source-code strings; it
is a hundred lines of real code and it reads better as a file.

================= WHAT THE NUMBERS MEAN =================

noise     the spread between the frames taken AT one mark, where nothing has
          changed but the clock. It is not error - a nebula breathes and a
          road turns through ten degrees, which swings a horizon glow across
          the frame - and it is the floor everything else is judged against.
drift     how far the sky moves BETWEEN marks in one run.
path gap  the same road, entered two different ways.

A fixed threshold was tried and was wrong: Sunset Highway measures 27 between
consecutive frames of one mark, all of it legitimate, so a fixed 8 fails a
road for behaving correctly. The question worth asking is whether a difference
is bigger than what waiting a second gives you.
"""
import itertools
import os
import sys

from PIL import Image

DIR = sys.argv[1]
FRAMES = int(sys.argv[2])
FLOOR = float(sys.argv[3])
MULT = float(sys.argv[4])
MARKS = [int(m) for m in sys.argv[5].split(',')]
ROADS = sys.argv[6].split()
TAGS = ['patch', 'menu']

# Coarse on purpose. It throws away where individual stars happen to be and
# keeps the gradient, which is what a sky's identity actually is.
GRID = (16, 6)


def grid(path):
    im = Image.open(path).convert('RGB').resize(GRID, Image.LANCZOS)
    return [[float(c) for c in p] for p in list(im.getdata())]


def diff(a, b):
    n = len(a)
    return sum(abs(a[i][k] - b[i][k]) for i in range(n) for k in range(3)) / (n * 3.0)


def mean(grids):
    out = [[0.0, 0.0, 0.0] for _ in grids[0]]
    for g in grids:
        for i, p in enumerate(g):
            for k in range(3):
                out[i][k] += p[k] / len(grids)
    return out


def frames(road, tag, mark):
    paths = ['%s/%s-%s-%d-%d.png' % (DIR, road, tag, mark, f) for f in range(FRAMES)]
    return [grid(p) for p in paths if os.path.exists(p)]


print('')
print('SKY STABILITY  (mean absolute RGB over the band above the horizon)')
print('')
print('  %-16s %7s %7s %9s %7s   %s'
      % ('road', 'noise', 'drift', 'path gap', 'limit', 'verdict'))

bad = []
for road in ROADS:
    shots = {t: {m: frames(road, t, m) for m in MARKS} for t in TAGS}
    if not shots['patch'][MARKS[0]]:
        print('  %-16s   no captures' % road)
        bad.append(road)
        continue

    noise = 0.0
    for tag in TAGS:
        for mark in MARKS:
            for a, b in itertools.combinations(shots[tag][mark], 2):
                noise = max(noise, diff(a, b))

    avg = {t: {m: mean(shots[t][m]) for m in MARKS if shots[t][m]} for t in TAGS}

    drift = 0.0
    for tag in TAGS:
        marks = sorted(avg[tag].keys())
        for mark in marks[1:]:
            drift = max(drift, diff(avg[tag][marks[0]], avg[tag][mark]))

    # THE TWO PATHS MUST AGREE. This is the half that caught the real bug.
    gap = 0.0
    for mark in MARKS:
        if mark in avg['patch'] and mark in avg['menu']:
            gap = max(gap, diff(avg['patch'][mark], avg['menu'][mark]))

    limit = max(FLOOR, noise * MULT)
    why = 'ok'
    if drift > limit or gap > limit:
        parts = []
        if drift > limit:
            parts.append('DRIFTS within a run')
        if gap > limit:
            parts.append('the menus give a DIFFERENT sky')
        why = ' and '.join(parts)
        bad.append(road)
    print('  %-16s %7.1f %7.1f %9.1f %7.1f   %s' % (road, noise, drift, gap, limit, why))

print('')
print('  noise    = spread between frames at one mark: the floor the rest is judged against')
print('  drift    = how far the sky moves across %s m within one run'
      % ' / '.join(str(m) for m in MARKS))
print('  path gap = the same road by ?theme= versus through the road screen')
print('  limit    = the greater of %.1f and %.2f x the noise on that road' % (FLOOR, MULT))
print('')
if bad:
    for road in bad:
        print('FAIL  %s does not hold one sky' % road)
else:
    print('PASS  every road holds one sky, from the first metre and however you reach it')
sys.exit(1 if bad else 0)
