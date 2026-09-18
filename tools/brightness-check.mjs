/**
 * Are the neon edge strips the brightest thing in the frame?
 *
 *     node tools/brightness-check.mjs            # npm run bright
 *     node tools/brightness-check.mjs --tag=before
 *
 * Exits non-zero if the shoulder strips out-shine the things they sit behind,
 * or if they light too much of the road.
 *
 * ================= WHY THIS EXISTS =================
 *
 * Reported twice from a phone: the edge strips are wide white-hot bands along
 * both shoulders, and the asphalt, the lane markings and the traffic are all
 * dimmer than they are - which is backwards. A road is lit; its edge lines are
 * a detail ON it.
 *
 * The first report was not acted on at all. `git log -L` on the `edges` block
 * in config/road.js shows a single commit, the one that created the file, so
 * nothing about their width, colour or intensity had changed between the two
 * reports. This check exists so that cannot happen a third time.
 *
 * ================= THE STRIPS ARE ISOLATED BY TURNING THEM OFF =============
 *
 * The obvious measurement is to find the strips by colour - bright and
 * saturated - and it is WRONG. On Aurora Pass the whole scene carries a green
 * cast from the aurora, so the asphalt passes that test too: the first version
 * of this tool reported the strips covering 61 per cent of the road band, and
 * most of that was road.
 *
 * So the frame is captured TWICE from the same frozen moment, once normally and
 * once with the edge lines turned off. The difference between them is the
 * strips - exactly, by construction, with no classifier that can be wrong. The
 * loop is paused between the two shots, because at 235 units a second two
 * unfrozen frames are two different roads.
 *
 * Everything else is measured on the strips-off frame, where the strips cannot
 * contaminate it.
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const W = 1280;
const H = 720;
const THEMES = ['auroraPass', 'galaxyRoad'];
const TAG = (process.argv.find((a) => a.startsWith('--tag=')) || '--tag=now').slice(6);

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server')), 30000);
    child.stdout.on('data', (c) => {
      text += String(c);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve({ child, url: m[1].trim() }); }
    });
  });
}

const geometry = {};
const server = await startServer();
mkdirSync('tools/out', { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

for (const theme of THEMES) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto(`${server.url}?god=1&theme=${theme}&stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  // Long enough to be at speed, where the bloom's speed gain is fully applied,
  // and to have traffic in shot to compare against.
  await page.waitForTimeout(7000);

  // FROZEN. Pausing hands every loop step a delta of zero and keeps drawing, so
  // the two frames below are the same instant.
  // A REAL FREEZE. Setting `loop.paused = true` from outside does NOT work:
  // main.js has a loop step that reassigns it from the session phase on every
  // frame, so an external pause is undone before the next tick. Measured, the
  // bike covered 476 units in 1.9 seconds while supposedly paused and 74 per
  // cent of the pixels changed - which silently turned every before/after
  // comparison into two different roads. Redefining the property is what
  // actually holds, because the assignment in main.js then does nothing.
  await page.evaluate(() => {
    Object.defineProperty(window.NEON.loop, 'paused', {
      get: () => true, set: () => {}, configurable: true,
    });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tools/out/strips-${TAG}-${theme}-on.png` });

  await page.evaluate(() => {
    const edges = window.NEON.config.world.road.edges;
    window.__restore = { intensity: edges.intensity, halo: edges.halo };
    edges.intensity = 0;
    edges.halo = 0;
    window.NEON.road.surface.applyTheme();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tools/out/strips-${TAG}-${theme}-off.png` });

  await page.evaluate(() => {
    const edges = window.NEON.config.world.road.edges;
    edges.intensity = window.__restore.intensity;
    edges.halo = window.__restore.halo;
    window.NEON.road.surface.applyTheme();
  });
  const edges = await page.evaluate(() => {
    const e = window.NEON.config.world.road.edges;
    return { width: e.width, glow: e.glow, halo: e.halo, intensity: e.intensity };
  });
  geometry[theme] = edges;
  await page.close();
}

await browser.close();
server.child.kill();

// The measurement is in Python with Pillow, which is the toolchain this repo
// already uses for pixels - paint-mask.py, cut-cockpit.py and fit-cockpit.py
// are all Pillow, and a second image decoder is a second thing to be wrong.
const script = `
import sys
from PIL import Image
import numpy as np

THEMES = ${JSON.stringify(THEMES)}
TAG = ${JSON.stringify(TAG)}
GEOMETRY = ${JSON.stringify(geometry)}

# THE WIDTH IS THE TARGET NOW, not a brightness ratio.
#
# Two rounds of tuning passed a peak-brightness test and still looked like light
# walls on the phone, because a ratio can be satisfied by a band that is merely
# dimmer than a tail light while still being a band. The requirement is a
# THREAD: a neon line on a road, comfortable to look at for ten minutes at 220.
# So the geometry is asserted directly and the brightness ratio is kept as a
# floor underneath it.
WIDTH_MAX = 0.0375     # metres. Was 0.30, then 0.15; this is a quarter of that.
HALO_REACH_MAX = 0.10  # metres, = width * glow. Was 0.525.
COVER_MAX = 3.0        # per cent of the road band the strips may dominate.

def luma(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

def band(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    h = a.shape[0]
    # ROAD BAND ONLY. Above is sky, below is cockpit, and the cockpit's own neon
    # would otherwise be measured as part of the road.
    return a[int(h * 0.46):int(h * 0.62)]

def pct(v, p):
    return None if v.size == 0 else float(np.percentile(v, p))

failures = []
for theme in THEMES:
    on = band('tools/out/strips-%s-%s-on.png' % (TAG, theme))
    off = band('tools/out/strips-%s-%s-off.png' % (TAG, theme))
    lon, loff = luma(on), luma(off)

    # THE STRIPS, BY CONSTRUCTION: whatever turning them off removed - and only
    # where they are the MAJORITY of what is there.
    #
    # 'any pixel the strips touched' was tried first and is the wrong set. The
    # edge glow lands faintly on a lot of already-bright road, so that mask
    # answers 'the brightest pixel the strips reached', which is dominated by
    # whatever was underneath. Requiring the strips to be more than half of the
    # final luminance answers 'how bright are the strips', which is the question.
    added = lon - loff
    strips = (added > 6.0) & (added > 0.5 * np.maximum(lon, 1.0))
    total = lon.size

    r, g, b = off[..., 0], off[..., 1], off[..., 2]
    mx, mn = off.max(2), off.min(2)
    sat = np.where(mx > 8, (mx - mn) / np.maximum(mx, 1), 0)
    vehicles = (loff > 40) & (r > g + 40) & (r > b + 20)
    markings = (loff > 70) & (sat < 0.25) & ~vehicles
    surface = (loff > 3) & (loff <= 70) & ~vehicles & ~markings

    rows = [
        ('strips', lon[strips], int(strips.sum())),
        ('vehicles', loff[vehicles], int(vehicles.sum())),
        ('markings', loff[markings], int(markings.sum())),
        ('surface', loff[surface], int(surface.sum())),
    ]
    print('')
    print(theme)
    print('  %-10s %7s %7s %9s %8s' % ('region', 'peak', 'median', 'pixels', 'of band'))
    for name, v, n in rows:
        pk, md = pct(v, 99.5), pct(v, 50)
        print('  %-10s %7s %7s %9d %7.1f%%' % (
            name,
            '-' if pk is None else '%.1f' % pk,
            '-' if md is None else '%.1f' % md,
            n, 100.0 * n / total))

    geo = GEOMETRY.get(theme, {})
    width = geo.get('width')
    if width is not None:
        reach = width * geo.get('glow', 0)
        print('  width %.4f m   halo reach %.4f m   intensity %.2f'
              % (width, reach, geo.get('intensity', 0)))
        if width > WIDTH_MAX + 1e-6:
            failures.append('%s: the strips are %.4f m wide, over the %.4f m ceiling'
                            % (theme, width, WIDTH_MAX))
        if reach > HALO_REACH_MAX + 1e-6:
            failures.append('%s: the halo reaches %.4f m, over the %.4f m ceiling - that is the '
                            'bleed onto the asphalt' % (theme, reach, HALO_REACH_MAX))

    coverage = 100.0 * strips.sum() / total
    if coverage > COVER_MAX:
        failures.append('%s: the strips dominate %.1f%% of the road band, over %.1f%% - that is a '
                        'band, not a thread' % (theme, coverage, COVER_MAX))

    # A THREAD MAY REGISTER AS ALMOST NOTHING, and that is the goal rather than
    # a fault. An earlier version failed here when the isolation found few
    # pixels, which is exactly what success looks like now.
    if strips.sum() >= 100:
        strips_peak = pct(lon[strips], 99.5)
        for name, mask in (('vehicles', vehicles), ('markings', markings)):
            if mask.sum() < 100:
                continue
            other = pct(loff[mask], 99.5)
            if strips_peak >= other:
                failures.append('%s: the strips peak at %.1f against %s at %.1f - the shoulder '
                                'out-shines the road' % (theme, strips_peak, name, other))

print('')
for f in failures:
    print('FAIL  ' + f)
if failures:
    print('')
    print('%d problem(s)' % len(failures))
    sys.exit(1)
print('brightness-check: the strips are not the brightest thing in the frame')
`;

const python = spawn('python', ['-c', script], { stdio: 'inherit' });
python.on('exit', (code) => process.exit(code === 0 ? 0 : 1));
