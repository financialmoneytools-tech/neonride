/**
 * What does the PHONE actually draw?
 *
 *     node tools/phone-probe.mjs          # npm run phone
 *
 * Renders at 740x320 with a device pixel ratio of 3 - the real phone's frame -
 * in a touch, mobile context, so the auto quality preset resolves the way it
 * does on the device instead of the way it does on a desktop capture.
 *
 * ================= WHY THIS EXISTS =================
 *
 * The edge strips were reported as thick bright bands from a phone THREE times.
 * Each time a desktop capture at 1280x720 was measured, a number was tuned, and
 * tools/brightness-check.mjs passed. The fourth report said the strip had not
 * visibly changed, and asked the right question: why do the phone and the
 * captures disagree?
 *
 * They did not disagree. The measurement was looking at the wrong object.
 *
 * `road.edges` is the pair of thin lines ON the carriageway edges, and that is
 * what was narrowed to 0.0375 m. `road.strips` is a SEPARATE set of four
 * flowing neon lanes - shoulder, both sides of the median, far verge - each
 * 0.45 to 0.5 m wide with a halo reaching width * strips.glow. brightness-check
 * ablated `edges.intensity` and `edges.halo` and nothing else, so the strips
 * were never in the measurement at all. The check passed because it measured a
 * line that had genuinely been fixed, standing next to a band that had never
 * been touched.
 *
 * So this tool ablates EVERY lit element of the road in turn - edges, strips,
 * markings - and reports the width of each one's footprint in device pixels on
 * the phone's own frame. Nothing here classifies by colour and nothing here
 * assumes which element is which: an element's footprint is what the frame
 * loses when that element is turned off.
 *
 * It also prints the resolved quality preset, the renderer's pixel ratio, the
 * drawing buffer, the bloom buffer and the LIVE uniform values, because the
 * other half of the question was whether the values being edited are read on
 * the mobile path at all.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, devices } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
// THE PHONE'S OWN FRAME. 740x320 CSS is what the device reports in landscape,
// and 3 is its device pixel ratio. Both matter: the preset is chosen from the
// CSS size, and the pixel ratio is what the preset then clamps.
const SIZE = { width: 740, height: 320 };
const DPR = 3;
const THEME = process.argv[2] || 'auroraPass';

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

const server = await startServer();
mkdirSync('tools/out', { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({
  ...devices['Pixel 7'],
  viewport: SIZE,
  deviceScaleFactor: DPR,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto(`${server.url}?god=1&theme=${THEME}&stats=0`, { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });

// GOD MODE PINS THE PIXEL RATIO, AND THAT IS HALF OF WHY THE PHONE AND THE
// CAPTURES DISAGREED. God mode turns capture mode on, and Engine.pixelRatio()
// returns config.capture.pixelRatio - 1 - whenever capture mode is enabled,
// instead of min(devicePixelRatio, preset.maxPixelRatio). Every capture ever
// taken of this game was driven by god mode, so every one of them rendered at
// pixel ratio 1 while the phone renders at its preset's ratio. The autopilot is
// still wanted - it is what puts the bike at speed in traffic - so the ratio is
// put back to what the device would really use rather than the mode turned off.
await page.evaluate(() => {
  const N = window.NEON;
  N.config.capture.pixelRatio = Math.min(
    window.devicePixelRatio, N.config.renderer.maxPixelRatio,
  );
  N.engine.resize(window.innerWidth, window.innerHeight);
});
await page.waitForTimeout(7000);

// --- what the mobile path resolved to ------------------------------------
const env = await page.evaluate(() => {
  const N = window.NEON;
  const renderer = N.engine.renderer;
  const buffer = renderer.getContext();
  const u = N.road.surface.material.uniforms;
  const bloom = N.post && N.post.bloom;
  return {
    cssSize: [window.innerWidth, window.innerHeight],
    devicePixelRatio: window.devicePixelRatio,
    coarsePointer: matchMedia('(pointer: coarse)').matches,
    presetRequested: N.config.quality.preset,
    presetResolved: N.device && (N.device.preset || N.device.resolved || N.device.name),
    maxPixelRatio: N.config.quality.presets[
      (N.device && (N.device.preset || N.device.resolved || N.device.name)) || 'high'
    ]?.maxPixelRatio,
    rendererPixelRatio: renderer.getPixelRatio(),
    drawingBuffer: [buffer.drawingBufferWidth, buffer.drawingBufferHeight],
    bloomResolution: bloom && bloom.resolution ? [bloom.resolution.x, bloom.resolution.y] : null,
    bloomStrength: bloom ? bloom.strength : null,
    bloomRadius: bloom ? bloom.radius : null,
    bloomThreshold: bloom ? bloom.threshold : null,
    // THE LIVE UNIFORMS. Not the config - what the GPU is actually holding on
    // this device, which is the only thing that answers "is the value I edited
    // read on the mobile path".
    uniforms: {
      edgeWidth: u.uEdgeWidth.value,
      edgeGlow: u.uEdgeGlow.value,
      edgeIntensity: u.uEdgeIntensity.value,
      edgeHalo: u.uEdgeHalo.value,
      stripWidth: Array.from(u.uStripWidth.value),
      stripGlow: u.uStripGlow.value,
      stripHalo: u.uStripHalo.value,
      stripIntensity: Array.from(u.uStripIntensity.value),
      markLaneWidth: u.uMarkDashWidth.value,
      markSolidWidth: u.uMarkSolidWidth ? u.uMarkSolidWidth.value : null,
      markIntensity: u.uMarkIntensity.value,
    },
  };
});

// A REAL FREEZE. Assigning loop.paused does nothing - main.js reassigns it from
// the session phase every frame, so an external pause is undone before the next
// tick. Redefining the property is what holds.
await page.evaluate(() => {
  Object.defineProperty(window.NEON.loop, 'paused', {
    get: () => true, set: () => {}, configurable: true,
  });
});
await page.waitForTimeout(400);

const shot = async (name) => {
  await page.waitForTimeout(350);
  const path = `tools/out/phone-${THEME}-${name}.png`;
  await page.screenshot({ path });
  return path;
};

const base = await shot('all');

// --- ablate each lit element in turn -------------------------------------
// An element's footprint is what the frame LOSES when it is turned off. No
// classifier, no colour test, nothing that can be wrong about which pixel
// belongs to what.
const ablate = async (which) => {
  await page.evaluate((w) => {
    const road = window.NEON.config.world.road;
    window.__keep = window.__keep || {
      edgeIntensity: road.edges.intensity,
      edgeHalo: road.edges.halo,
      stripIntensity: road.strips.lanes.map((l) => l.intensity),
      markIntensity: road.markings.intensity,
    };
    const k = window.__keep;
    road.edges.intensity = k.edgeIntensity;
    road.edges.halo = k.edgeHalo;
    road.strips.lanes.forEach((l, i) => { l.intensity = k.stripIntensity[i]; });
    road.markings.intensity = k.markIntensity;
    if (w === 'edges') { road.edges.intensity = 0; road.edges.halo = 0; }
    if (w === 'strips') road.strips.lanes.forEach((l) => { l.intensity = 0; });
    if (w === 'markings') road.markings.intensity = 0;
    window.NEON.road.surface.applyTheme();
  }, which);
  return shot('no-' + which);
};

const off = {
  edges: await ablate('edges'),
  strips: await ablate('strips'),
  markings: await ablate('markings'),
};
await ablate('none');

await browser.close();
server.child.kill();

writeFileSync('tools/out/phone-env.json', JSON.stringify(env, null, 2));

console.log('');
console.log('THE MOBILE PATH');
console.log('  css frame            %s x %s', env.cssSize[0], env.cssSize[1]);
console.log('  devicePixelRatio     %s   coarse pointer %s', env.devicePixelRatio, env.coarsePointer);
console.log('  quality preset       %s (requested %s), maxPixelRatio %s',
  env.presetResolved, env.presetRequested, env.maxPixelRatio);
console.log('  renderer pixelRatio  %s', env.rendererPixelRatio);
console.log('  drawing buffer       %s x %s', env.drawingBuffer[0], env.drawingBuffer[1]);
if (env.bloomResolution) {
  console.log('  bloom buffer         %s x %s   strength %s radius %s threshold %s',
    Math.round(env.bloomResolution[0]), Math.round(env.bloomResolution[1]),
    env.bloomStrength, env.bloomRadius, env.bloomThreshold);
}
console.log('');
console.log('LIVE UNIFORMS ON THIS DEVICE');
const u = env.uniforms;
const f = (v, n = 3) => (v === null || v === undefined ? '-' : Number(v).toFixed(n));
console.log(`  edges   width ${f(u.edgeWidth, 4)} m  glow ${f(u.edgeGlow, 2)}`
  + `  -> lit half width ${f(u.edgeWidth * u.edgeGlow, 4)} m  intensity ${f(u.edgeIntensity, 2)}`);
console.log(`  strips  width ${u.stripWidth.map((w) => f(w)).join(' ')} m  glow ${f(u.stripGlow, 2)}`
  + `  -> lit HALF width ${u.stripWidth.map((w) => f(w * u.stripGlow, 2)).join(' ')} m`);
console.log(`  strips  intensity ${u.stripIntensity.map((i) => f(i, 2)).join(' ')}`
  + `  halo ${f(u.stripHalo, 2)}`);
console.log(`  paint   lane ${f(u.markLaneWidth)} m  solid ${f(u.markSolidWidth)} m`
  + `  intensity ${f(u.markIntensity, 2)}`);

const script = `
import json, sys
from PIL import Image
import numpy as np

THEME = ${JSON.stringify(THEME)}
BASE = ${JSON.stringify(base)}
OFF = ${JSON.stringify(off)}
U = json.loads(r'''${JSON.stringify(env.uniforms)}''')

# THE GEOMETRY IS ASSERTED IN METRES, NOT IN PIXELS, and that is a correction to
# this tool rather than a preference. A pixel run length across a row measures
# width / sin(angle), so a line seen nearly edge on - which is what the shoulder
# and verge strips are - reads several times wider than the same line painted
# across the middle of the road. Comparing the strips' pixel width against the
# lane markings' therefore punished them for WHERE they are, and tuning against
# it would have chased an artefact of the measurement.
#
# So: brightness is compared in pixels, where the bias does not exist, and width
# is compared in world metres, where it cannot.
CORE_MAX = 0.14    # m. The lane paint's own width; no neon core may beat it.
REACH_MAX = 0.25   # m. width * glow - how far the halo lands on the asphalt.

def luma(p):
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

base = luma(BASE)
h, w = base.shape

# THE NEAR ROAD, where the rider actually looks and where a band is widest in
# screen terms. Above this is the vanishing point, where everything is one pixel
# wide and every element would pass any width test ever written.
top, bot = int(h * 0.50), int(h * 0.60)

def runs(mask_row):
    """Lengths of each contiguous lit run in one row, in device pixels."""
    out, n = [], 0
    for v in mask_row:
        if v: n += 1
        elif n: out.append(n); n = 0
    if n: out.append(n)
    return out

print('')
print('FOOTPRINT ON THE PHONE FRAME  (%d x %d device px, rows %d-%d = the near road)'
      % (w, h, top, bot))
print('  %-10s %8s %8s %8s %9s' % ('element', 'median', 'widest', 'peak', 'lit px'))
report = {}
for name, path in OFF.items():
    lost = base - luma(path)
    # Lit where the element contributes real light, not dither.
    mask = lost > 4.0
    band = mask[top:bot]
    widths = []
    for row in band:
        widths += runs(row)
    widths = [x for x in widths if x >= 1]
    med = float(np.median(widths)) if widths else 0.0
    wide = float(np.percentile(widths, 98)) if widths else 0.0
    peak = float(np.percentile(lost[top:bot][band], 99.5)) if band.sum() else 0.0
    report[name] = dict(median=med, widest=wide, peak=peak, px=int(band.sum()))
    print('  %-10s %8.1f %8.1f %8.1f %9d' % (name, med, wide, peak, band.sum()))

print('')
print('THE ORDER THE EYE GETS IT, brightest first:')
for name, r in sorted(report.items(), key=lambda kv: -kv[1]['peak']):
    print('  %-10s peak %6.1f   widest run %5.1f px' % (name, r['peak'], r['widest']))

json.dump(report, open('tools/out/phone-report.json', 'w'), indent=2)

# THE REQUIREMENT, in the user's words: road surface and traffic read first,
# markings second, neon edge lines last.
fail = []
for name in ('strips', 'edges'):
    if report[name]['peak'] > report['markings']['peak']:
        fail.append('the neon %s peak at %.1f against the markings at %.1f - the neon is '
                    'the brightest thing on the road'
                    % (name, report[name]['peak'], report['markings']['peak']))

neon = [('edge lines', U['edgeWidth'], U['edgeGlow'])]
for i, w in enumerate(U['stripWidth']):
    neon.append(('strip %d' % i, w, U['stripGlow']))

print('')
print('GEOMETRY IN METRES  (core, and how far the halo reaches onto the asphalt)')
print('  %-12s %8s %8s' % ('element', 'core', 'reach'))
print('  %-12s %8.3f %8s' % ('lane paint', U['markSolidWidth'], '-'))
for name, w, glow in neon:
    print('  %-12s %8.3f %8.3f' % (name, w, w * glow))
    if w > CORE_MAX + 1e-6:
        fail.append('%s has a %.3f m core against the %.3f m ceiling - it is wider than the '
                    'lane paint beside it' % (name, w, CORE_MAX))
    if w * glow > REACH_MAX + 1e-6:
        fail.append('%s throws its halo %.3f m onto the asphalt, over the %.3f m ceiling'
                    % (name, w * glow, REACH_MAX))
print('')
for f in fail:
    print('FAIL  ' + f)
if fail:
    sys.exit(1)
print('phone-probe: markings read before neon, on the phone frame')
`;

const python = spawn('python', ['-c', script], { stdio: 'inherit' });
python.on('exit', (code) => process.exit(code === 0 ? 0 : 1));
