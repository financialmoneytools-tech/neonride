/**
 * Crop the sky out. Can you still tell which road it is?
 *
 *     node tools/road-distinct.mjs          # npm run distinct
 *     node tools/road-distinct.mjs --shots  # keep the cropped bands
 *
 * ================= THE TEST, AND WHY IT IS THIS ONE =================
 *
 * Six roads were built and reported back as "near-identical: same reddish
 * asphalt, same barriers, same markings - only the object in the sky
 * differs". That is a fair description of what happens when a theme changes
 * a sky and a handful of neon colours: the sky does all the work, and a sky
 * is the one part of the frame a rider is not looking at while they ride.
 *
 * So the agreed test is to take the sky away. What is left is the band
 * between the horizon and the cockpit - the asphalt, the markings, the
 * verges, the barrier, the roadside props and whatever is falling - which is
 * where a rider's eyes actually are. If two roads are the same down there,
 * they are the same road wearing different hats.
 *
 * ================= WHAT IT MEASURES =================
 *
 * Each road is captured at 16:9, the band is cropped, downscaled to a coarse
 * grid and compared with every other road cell by cell. Downscaling is the
 * point rather than a saving: it throws away where individual props happen
 * to have landed and keeps the things that are actually the road's identity
 * - how light the surface is, how warm, how bright the markings, how busy
 * the verges. Two roads can differ in every pixel and still be the same
 * road; this asks whether they differ in the AVERAGES.
 *
 * The number is mean absolute RGB difference over the grid, 0 to 255.
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const W = 1280;
const H = 720;
const DIR = 'tools/out/distinct';
const SHOTS = process.argv.includes('--shots');
// Long enough for the bike to be at speed with traffic and weather in shot.
const SETTLE = 8000;
// ================= AVERAGED, BECAUSE ONE FRAME IS LUCK =================
//
// A single capture per road made this test unusable: the reference pair
// alone swung from 34.7 to 23.5 between two runs of the same build, because
// eight seconds of settling lands the bike at a different point on a curving
// road with different traffic beside it. Tuning against that is tuning
// against noise.
//
// Several captures spaced a couple of seconds apart put the bike a few
// hundred metres further on each time, and averaging the grids leaves what
// is true of the ROAD rather than of one moment on it.
const SAMPLES = 4;
const SAMPLE_GAP = 2200;

// ================= WHERE TO LOOK =================
//
// Two SIDE STRIPS of the lower frame, not a horizontal band across the
// middle. The first attempt took y 0.46 to 0.63, which sounded like "the
// road" and was actually the horizon: at that height almost every pixel is
// fog and distant sky glow, so it measured the sky it was supposed to be
// cropping out.
//
// The surface, the markings, the verge and the barrier are all in the LOWER
// frame - and so is the cockpit, which is the same motorcycle on every road
// and would drag every pair together. The cockpit is central, so taking the
// outer thirds of the bottom half excludes it and keeps everything else.
const BAND_TOP = 0.50;
const BAND_BOTTOM = 0.96;
/** Share of the width taken from each edge, skipping the cockpit between. */
const SIDE = 0.30;

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server')), 40000);
    child.stdout.on('data', (c) => {
      text += String(c);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve({ child, url: m[1].trim() }); }
    });
  });
}

const server = await startServer();
mkdirSync(DIR, { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

const probe = await browser.newPage({ viewport: { width: 640, height: 360 } });
await probe.goto(`${server.url}?god=1`, { waitUntil: 'load' });
await probe.waitForFunction(() => window.NEON, null, { timeout: 20000 });
const roads = await probe.evaluate(() => Object.keys(window.NEON.config.themes));
await probe.close();

const top = Math.round(H * BAND_TOP);
const height = Math.round(H * (BAND_BOTTOM - BAND_TOP));
const side = Math.round(W * SIDE);
console.log('roads: %s', roads.join(', '));
console.log('sampling: y %d..%d, x 0..%d and %d..%d  (sky above, cockpit between)',
  top, top + height, side, W - side, W);

for (const road of roads) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.log('PAGEERROR', road, e.message));
  await page.goto(`${server.url}?god=1&theme=${road}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON && window.NEON.bike, null, { timeout: 20000 });
  await page.waitForTimeout(SETTLE);
  // Two shots per sample rather than one clip, because the two strips are
  // not adjacent - the cockpit sits between them and must not be in either.
  for (let i = 0; i < SAMPLES; i++) {
    if (i > 0) await page.waitForTimeout(SAMPLE_GAP);
    await page.screenshot({
      path: `${DIR}/${road}-${i}-L.png`,
      clip: { x: 0, y: top, width: side, height },
    });
    await page.screenshot({
      path: `${DIR}/${road}-${i}-R.png`,
      clip: { x: W - side, y: top, width: side, height },
    });
  }
  await page.close();
}

await browser.close();
server.child.kill();

// The comparison is Pillow, which is already this project's image toolchain -
// tools/theme-thumbs.mjs and the two cockpit tools all use it.
const script = [
  'import glob, os, itertools',
  'from PIL import Image',
  "names = sorted(set(os.path.basename(f).split('-')[0] "
    + "for f in glob.glob('" + DIR + "/*-L.png')))",
  'def grid(path):',
  "    return list(Image.open(path).convert('RGB').resize((12, 10), Image.LANCZOS).getdata())",
  'def band(n):',
  "    shots = sorted(glob.glob('" + DIR + "/%s-*-L.png' % n))",
  '    acc = None',
  '    for left in shots:',
  "        right = left[:-6] + '-R.png'",
  '        cells = grid(left) + (grid(right) if os.path.exists(right) else grid(left))',
  '        if acc is None:',
  '            acc = [[float(c) for c in p] for p in cells]',
  '        else:',
  '            for i, p in enumerate(cells):',
  '                for k in range(3):',
  '                    acc[i][k] += p[k]',
  '    return [[c / len(shots) for c in p] for p in acc]',
  'px = {n: band(n) for n in names}',
  '',
  'def diff(a, b):',
  '    pa, pb = px[a], px[b]',
  '    total = 0',
  '    for i in range(len(pa)):',
  '        total += abs(pa[i][0]-pb[i][0]) + abs(pa[i][1]-pb[i][1]) + abs(pa[i][2]-pb[i][2])',
  '    return total / (len(pa) * 3.0)',
  '',
  'print("")',
  'print("MEAN ABSOLUTE DIFFERENCE, sky cropped out  (0 = identical, 255 = max)")',
  'print("")',
  'w = max(len(n) for n in names)',
  'print(" " * (w + 2) + "".join(n[:9].rjust(11) for n in names))',
  'for a in names:',
  '    row = a.ljust(w + 2)',
  '    for b in names:',
  '        row += ("-" if a == b else "%.1f" % diff(a, b)).rjust(11)',
  '    print(row)',
  '',
  'pairs = sorted(((diff(a, b), a, b) for a, b in itertools.combinations(names, 2)))',
  'print("")',
  'print("closest pairs:")',
  'for d, a, b in pairs[:5]:',
  '    print("  %-16s %-16s %6.1f" % (a, b, d))',
  '',
  '# THE THRESHOLD, and it is calibrated rather than chosen. Galaxy Road and',
  '# Aurora Pass are the two roads nobody has ever confused - black space',
  '# against a snowy pass - so whatever separates THEM is what "clearly a',
  '# different road" is worth. Any pair scoring under a third of that is',
  '# trading on the sky to tell itself apart.',
  'ref = diff("galaxyRoad", "auroraPass") if "galaxyRoad" in px and "auroraPass" in px else 30.0',
  'limit = ref / 3.0',
  'print("")',
  'print("reference: galaxyRoad vs auroraPass = %.1f, so the floor is %.1f" % (ref, limit))',
  'bad = [(d, a, b) for d, a, b in pairs if d < limit]',
  'for d, a, b in bad:',
  '    print("FAIL  %s and %s are too similar with the sky cropped - %.1f < %.1f"',
  '          % (a, b, d, limit))',
  'if not bad:',
  '    print("PASS  every pair is distinguishable without its sky")',
  'raise SystemExit(1 if bad else 0)',
].join('\n');

const compare = spawn('python', ['-c', script], { stdio: 'inherit' });
compare.on('exit', (code) => {
  if (!SHOTS) console.log(`\ncropped bands kept in ${DIR}/`);
  process.exit(code === 0 ? 0 : 1);
});
