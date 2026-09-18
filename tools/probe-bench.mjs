/**
 * What each look costs to DRAW, measured at 1280x720.
 *
 *     node tools/probe-bench.mjs
 *
 * Both looks sit on the 60 Hz vsync cap on a desktop GPU, so "60 FPS" says
 * nothing about which is cheaper or by how much. This measures the time to draw
 * one frame with nothing else running, which is the number a phone estimate can
 * be built from.
 *
 * TWO THINGS HAD TO BE GOT RIGHT, and both were wrong first.
 *
 * 1. A RESOLUTION SWEEP DID NOT WORK. Scaling the pixel ratio on a live
 *    renderer left the frame times flat, and at the largest scale the probe
 *    measured FASTER than at the smallest - which is impossible, and is how the
 *    sweep was known to be invalid rather than merely surprising. Dropped: this
 *    reports one resolution that was actually observed.
 * 2. THE APP'S OWN LOOP HAS TO BE STOPPED. Measuring while the game is still
 *    rendering measures the two competing, and the same look came out at
 *    0.27 ms on one run and 0.14 ms on the next. Both loops are halted before
 *    the clock starts.
 *
 * `gl.finish()` is the rest of it: without it the driver queues the work and
 * returns immediately, so the measurement is of the queue and not the picture.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const W = 1280;
const H = 720;
const PASSES = 5;

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

const SAMPLER = `
  window.__bench = (draw) => {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    for (let i = 0; i < 20; i++) draw();   // compile programs, upload textures
    gl.finish();
    const N = 120;
    const start = performance.now();
    for (let i = 0; i < N; i++) draw();
    gl.finish();
    return +(((performance.now() - start) / N)).toFixed(3);
  };
`;

const server = await startServer();
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

async function bench(kind, url) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.log(kind, 'PAGEERROR', e.message));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(
    () => window.NEON || (window.PROBE && window.PROBE.stats && window.PROBE.stats.ready),
    null, { timeout: 40000 },
  );
  await page.waitForTimeout(6500);

  const stats = await page.evaluate((isProbe) => {
    if (isProbe) return window.PROBE.stats;
    const info = window.NEON.engine.renderer.info;
    return { drawCalls: info.render.calls, triangles: info.render.triangles };
  }, kind !== 'current');

  // STOP EVERYTHING ELSE. setAnimationLoop(null) halts the game; the probe's
  // own rAF is stopped by a flag it checks.
  await page.evaluate((isProbe) => {
    if (isProbe) window.PROBE.renderer.setAnimationLoop(null);
    else window.NEON.engine.renderer.setAnimationLoop(null);
    window.__halt = true;
  }, kind !== 'current');
  await page.waitForTimeout(700);

  await page.addScriptTag({ content: SAMPLER });
  const samples = [];
  for (let i = 0; i < PASSES; i++) {
    samples.push(await page.evaluate((isProbe) => {
      const draw = isProbe
        ? () => window.PROBE.composer.render(0.016)
        : () => window.NEON.post.render(0.016);
      return window.__bench(draw);
    }, kind !== 'current'));
    await page.waitForTimeout(250);
  }
  await page.close();
  samples.sort((a, b) => a - b);
  return { ms: samples[Math.floor(samples.length / 2)], samples, stats };
}

const current = await bench('current', `${server.url}?god=1&theme=auroraPass&stats=0`);
const probe = await bench('probe', `${server.url}probe.html`);
const low = await bench('probeLow', `${server.url}probe.html?quality=low`);

await browser.close();
server.child.kill();

const line = (name, r, base) => {
  const ratio = base ? `   ${(r.ms / base).toFixed(1)}x` : '';
  console.log(`  ${name.padEnd(22)} ${r.ms.toFixed(2)} ms   ${(1000 / r.ms).toFixed(0).padStart(5)} fps uncapped${ratio}`);
};

console.log(`\n${W}x${H}, median of ${PASSES} passes, 120 frames each, app loop halted\n`);
line('current look', current);
line('probe, full', probe, current.ms);
line('probe, no shadows', low, current.ms);
console.log(`\n  shadow maps alone      ${(probe.ms - low.ms).toFixed(2)} ms of the probe's frame`);
console.log(`\n  samples (ms): current ${JSON.stringify(current.samples)}`);
console.log(`                probe   ${JSON.stringify(probe.samples)}`);
console.log(`                low     ${JSON.stringify(low.samples)}`);
console.log('\nJSON', JSON.stringify({ current, probe, low }));
process.exit(0);
