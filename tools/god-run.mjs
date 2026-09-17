/**
 * A god mode run, measured.
 *
 *     node tools/god-run.mjs                 # 60 s on the default theme
 *     node tools/god-run.mjs 90 auroraPass   # 90 s on a named theme
 *
 * The autopilot is a recording tool, so the only acceptable number of times it
 * drives through a vehicle is zero, and "it looked fine" is not a measurement -
 * a single overlap in a two minute clip is the whole clip. This drives a real
 * browser, reads the loop's own counters, and walks the traffic pools every
 * frame to find the tightest gap the bike actually took.
 *
 * ABOUT THE FRAME RATE. Headless Chromium usually falls back to SwiftShader,
 * which is a software rasteriser - the figure it gives is a regression signal
 * and NOT a frame rate anybody will ever see. The renderer it actually used is
 * printed with the result so the number is never read as something it is not.
 * The phone figure comes off the phone, with ?stats=1.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const SECONDS = Number(process.argv[2] || 60);
const THEME = process.argv[3] || '';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server: ' + text)), 30000);
    child.stdout.on('data', (chunk) => {
      text += String(chunk);
      const match = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve({ child, url: match[1].trim() });
      }
    });
    child.on('error', reject);
  });
}

function stop(child) {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

const server = await startServer();
const browser = await chromium.launch({
  // Ask for the real GPU. It is often refused in headless, which is why the
  // result prints what it ended up with rather than assuming.
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const failures = [];
page.on('pageerror', (error) => failures.push('pageerror: ' + error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') failures.push('console: ' + msg.text());
});

const query = '?god=1&stats=1' + (THEME ? '&theme=' + THEME : '');
await page.goto(server.url + query, { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(1500);

// The watcher runs inside the page, once per animation frame, because the
// tightest pass happens between two frames a sampler outside would never see.
await page.evaluate(() => {
  const NEON = window.NEON;
  const watch = {
    frames: 0,
    seconds: 0,
    overlaps: 0,
    tightestLateral: Infinity,
    tightestName: '',
    startDistance: NEON.loop.state.distance || 0,
    startHits: NEON.loop.state.hits || 0,
    startNearMisses: NEON.loop.state.nearMisses || 0,
    fps: [],
  };
  window.__watch = watch;

  const collision = NEON.config.world.traffic.collision;
  NEON.loop.add((dt, state) => {
    watch.frames++;
    watch.seconds += dt;
    if (state.fps) watch.fps.push(state.fps);

    const distance = state.distance || 0;
    const lateral = state.lateral || 0;

    for (const fleet of NEON.traffic.fleets) {
      const halfWidth = fleet.type.size.width * 0.5;
      const halfLength = fleet.type.size.length * 0.5;
      for (const vehicle of fleet.vehicles) {
        if (!vehicle.active) continue;
        const along = Math.abs(distance - vehicle.distance)
          - (halfLength * vehicle.scale + collision.playerHalfLength);
        if (along > 0) continue; // not level with it, so no lateral test applies
        const gap = Math.abs(lateral - vehicle.lateral)
          - (halfWidth * vehicle.scale + collision.playerHalfWidth);
        if (gap < watch.tightestLateral) {
          watch.tightestLateral = gap;
          watch.tightestName = fleet.type.name;
        }
        if (gap < 0) watch.overlaps++;
      }
    }
  });
});

await page.waitForTimeout(SECONDS * 1000);

const result = await page.evaluate(() => {
  const w = window.__watch;
  const state = window.NEON.loop.state;
  const gl = document.querySelector('canvas').getContext('webgl2')
    || document.querySelector('canvas').getContext('webgl');
  const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
  const fps = w.fps.slice().sort((a, b) => a - b);
  return {
    seconds: w.seconds,
    frames: w.frames,
    overlaps: w.overlaps,
    tightest: w.tightestLateral,
    tightestName: w.tightestName,
    hits: (state.hits || 0) - w.startHits,
    nearMisses: (state.nearMisses || 0) - w.startNearMisses,
    distance: (state.distance || 0) - w.startDistance,
    drawCalls: state.drawCalls,
    triangles: state.triangles,
    fpsMedian: fps.length ? fps[Math.floor(fps.length / 2)] : 0,
    fpsLow: fps.length ? fps[Math.floor(fps.length * 0.05)] : 0,
    renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unknown',
    guard: {
      saves: window.NEON.guard.saves,
      eases: window.NEON.guard.eases,
      trapped: window.NEON.guard.trapped,
      worst: window.NEON.guard.worst,
      buckets: window.NEON.guard.buckets.join('/'),
    },
  };
});

await browser.close();
stop(server.child);

const perMinute = (n) => (result.seconds > 0 ? (n * 60) / result.seconds : 0);

console.log('');
console.log('god run' + (THEME ? '  theme ' + THEME : '  theme (default)'));
console.log('  ' + result.seconds.toFixed(1) + ' s, ' + result.frames + ' frames, '
  + (result.distance / 1000).toFixed(2) + ' km');
console.log('  overlaps          ' + result.overlaps + (result.overlaps ? '   FAIL' : '   ok'));
console.log('  collisions logged ' + result.hits + (result.hits ? '   FAIL' : '   ok'));
console.log('  tightest pass     ' + (Number.isFinite(result.tightest)
  ? result.tightest.toFixed(3) + ' u  (' + result.tightestName + ')'
  : 'never level with one'));
console.log('  near misses       ' + perMinute(result.nearMisses).toFixed(1) + ' a minute');
console.log('  draw calls        ' + result.drawCalls);
console.log('  triangles         ' + result.triangles.toLocaleString('en-US'));
console.log('  frame rate        ' + result.fpsMedian.toFixed(1) + ' median, '
  + result.fpsLow.toFixed(1) + ' at the 5th percentile');
console.log('  guard             ' + result.guard.saves + ' saves, '
  + result.guard.eases + ' eases, ' + result.guard.trapped + ' trapped frames, worst '
  + result.guard.worst.toFixed(2) + ' u, buckets ' + result.guard.buckets);
console.log('  renderer          ' + result.renderer);
console.log('                    (software here means the frame rate is a '
  + 'regression signal, not a frame rate)');

if (failures.length) {
  console.log('');
  console.log(failures.length + ' page errors:');
  for (const line of failures.slice(0, 10)) console.log('  ' + line);
}

if (result.overlaps || result.hits || failures.length) process.exit(1);
