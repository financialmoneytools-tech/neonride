/**
 * What the frame rate is on the phone, on the densest level.
 *
 *     node tools/phone-fps.mjs        # npm run phonefps
 *     node tools/phone-fps.mjs 6      # seconds of sample
 *
 * ================= WHY IT IS NOT npm run phone =================
 *
 * `phone-probe` answers a brightness question and pins things that would
 * spoil it. This answers the performance one, and the two want opposite
 * setups: brightness wants a still, repeatable frame, and a frame rate has to
 * be read while the road is doing the most work it ever does.
 *
 * THE PHONE'S OWN FRAME, for the same reason phone-probe uses it: 740x320 CSS
 * at a device pixel ratio of 3 is what the device reports in landscape, the
 * quality preset is chosen from the CSS size, and the preset is what then
 * clamps the ratio. A desktop capture renders a different number of pixels
 * and answers a different question.
 *
 * THE DENSEST LEVEL, which is level ten, with the ramp switched off so it is
 * at full difficulty from the first metre rather than a kilometre in - the
 * same thing tools/spacing-check.mjs does and for the same reason. The
 * autopilot rides it, because a frame rate measured while nobody steers is a
 * frame rate measured on an empty road.
 */

import { spawn } from 'node:child_process';
import { chromium, devices } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\[[0-9;]*m', 'g');
const NL = String.fromCharCode(10);
const SIZE = { width: 740, height: 320 };
const DPR = 3;
const SECONDS = Number(process.argv[2] || 8);
const THEME = process.argv[3] || 'neonMetropolis';
// The floor from CLAUDE.md: a mid range phone must not drop under 30.
const FLOOR = 30;

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
await page.goto(server.url + '?theme=' + THEME + '&stats=1', { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
await page.waitForTimeout(1200);
await page.touchscreen.tap(SIZE.width - 40, 40);
await page.waitForTimeout(600);

const result = await page.evaluate(async (seconds) => {
  const N = window.NEON;
  N.config.levels.rampMeters = 1;
  N.config.autopilot.enabled = true;
  N.selection.setMode('stage');
  N.beginRun(N.config.levels.count);
  // Let the pool fill and the first frames' compile spikes pass before
  // anything is counted; a shader compile is not a frame rate.
  await new Promise((r) => setTimeout(r, 3000));

  const frames = [];
  let vehicles = 0;
  let samples = 0;
  await new Promise((done) => {
    const until = performance.now() + seconds * 1000;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      frames.push(1000 / Math.max(0.001, now - last));
      last = now;
      let live = 0;
      for (const fleet of N.traffic.fleets) {
        for (const v of fleet.vehicles) if (v.active) live++;
      }
      vehicles += live;
      samples++;
      if (now >= until) done();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  frames.sort((a, b) => a - b);
  const info = N.engine.renderer.info;
  return {
    level: N.loop.state.level,
    median: frames[Math.floor(frames.length * 0.5)],
    low: frames[Math.floor(frames.length * 0.05)],
    worst: frames[0],
    frames: frames.length,
    calls: info.render.calls,
    triangles: info.render.triangles,
    pixelRatio: N.engine.renderer.getPixelRatio(),
    preset: N.config.quality.preset,
    vehicles: vehicles / Math.max(1, samples),
  };
}, SECONDS);

const ok = result.low >= FLOOR;
console.log(NL + 'PHONE FRAME RATE  ' + SIZE.width + 'x' + SIZE.height + ' at dpr ' + DPR
  + ', ' + THEME + ', level ' + result.level);
console.log('  preset            ' + result.preset
  + ', renderer pixel ratio ' + result.pixelRatio);
console.log('  frame rate        ' + result.median.toFixed(1) + ' median, '
  + result.low.toFixed(1) + ' at the 5th percentile, ' + result.worst.toFixed(1) + ' worst');
console.log('  drawing           ' + result.calls + ' draw calls, '
  + result.triangles + ' triangles');
console.log('  traffic           ' + result.vehicles.toFixed(1) + ' vehicles live');
console.log(NL + (ok ? 'PASS' : 'FAIL') + '  the phone holds ' + FLOOR
  + ' FPS on the densest level');

await browser.close();
if (process.platform === 'win32') {
  spawn('taskkill', ['/pid', String(server.child.pid), '/T', '/F'], { stdio: 'ignore' });
} else server.child.kill('SIGTERM');
process.exit(ok ? 0 : 1);
