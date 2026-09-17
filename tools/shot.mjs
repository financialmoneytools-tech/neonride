/**
 * One screenshot of the running game, at a given size.
 *
 *     node tools/shot.mjs tools/out/framing-after.png 1280 720
 *
 * Starts its own dev server and reads the URL out of that server's own output
 * rather than assuming a port - the same trap that sent a Cloudflare tunnel to
 * a 404 - then taps through the title card, lets the world settle and shoots.
 *
 * `tools/out` is not committed. These are for looking at a change, not keeping.
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';

const out = process.argv[2] || 'tools/out/shot.png';
const width = Number(process.argv[3] || 1280);
const height = Number(process.argv[4] || 720);
// Optional query string, e.g. "god=1". `?god=1` drops the title card, which is
// the only reliable way to get a shot of the road rather than a shot of the
// card: the card owns the first gesture and a synthetic click on it is not
// always the gesture it is waiting for.
const query = process.argv[5] ? '?' + process.argv[5].replace(/^\?/, '') : '';
// Optional 6th argument: wait until a vehicle of this type is within `NEAR_MAX`
// units ahead before shooting, e.g. "semi" or "boxTruck". A screenshot of a
// thing that happens sometimes cannot be taken by waiting a fixed four seconds
// and hoping - it has to be waited FOR.
const NEAR_TYPE = process.argv[6] || '';
const NEAR_MAX = Number(process.argv[7] || 26);

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
// THE REAL GPU, the same flags tools/god-run.mjs uses. Without them headless
// Chromium falls back to SwiftShader and the stats overlay in the screenshot
// reads 7 FPS - a software rasteriser's number, which then gets read as the
// game's. A screenshot that carries an FPS counter has to carry a real one.
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(server.url + query, { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(800);
// The title card owns the first gesture.
await page.mouse.click(width / 2, height / 2);
// Long enough for the card to fade and the road to be moving.
await page.waitForTimeout(4000);

if (NEAR_TYPE) {
  const found = await page.waitForFunction(
    ([name, max]) => {
      const NEON = window.NEON;
      if (!NEON) return false;
      const distance = NEON.loop.state.distance || 0;
      for (const fleet of NEON.traffic.fleets) {
        if (fleet.type.name !== name) continue;
        for (const vehicle of fleet.vehicles) {
          if (!vehicle.active) continue;
          const gap = vehicle.distance - distance;
          // AHEAD AND IN LINE. Distance alone finds one in the next lane over,
          // which shows its flank - and the flank is not the face with the
          // doors, the plate and the tail lights on it.
          const across = Math.abs((vehicle.lateral || 0) - (NEON.loop.state.lateral || 0));
          if (gap > 4 && gap < max && across < 2.2) return true;
        }
      }
      return false;
    },
    [NEAR_TYPE, NEAR_MAX],
    { timeout: 60000, polling: 100 },
  ).catch(() => null);
  if (!found) console.log('  (never saw a ' + NEAR_TYPE + ' within ' + NEAR_MAX + ' units)');
}
mkdirSync(dirname(out), { recursive: true });
await page.screenshot({ path: out });
console.log(out + '  ' + width + 'x' + height + '  from ' + server.url + query);
await browser.close();
stop(server.child);
