/**
 * One screenshot per bike, on a given theme, from the running game.
 *
 *     node tools/bike-shots.mjs                 # all four on Aurora Pass
 *     node tools/bike-shots.mjs galaxyRoad      # on Galaxy Road instead
 *
 * Writes tools/out/bike-<name>.png plus a contact sheet, tools/out/bikes.png,
 * because four colourways are judged against each other and not one at a time.
 *
 * Also prints, per bike, the mean colour of the fairing, the tank and the
 * windscreen as they land ON SCREEN - after bloom and the tone curve, which is
 * the only place the question "is the 10 per cent visible" can honestly be
 * asked. A colourway that differs in config and not in the frame is not a
 * colourway.
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const THEME = process.argv[2] || 'auroraPass';
const W = 1280;
const H = 720;
const OUT = 'tools/out';

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server: ' + text)), 30000);
    child.stdout.on('data', (chunk) => {
      text += String(chunk);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve({ child, url: m[1].trim() }); }
    });
  });
}

const server = await startServer();
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

// god mode: no title card, no HUD, no pause button - the cockpit and the road,
// which is what is being looked at.
await page.goto(`${server.url}?god=1&theme=${THEME}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON && window.NEON.rider, null, { timeout: 20000 });
await page.waitForTimeout(3500);

const names = await page.evaluate(() => Object.keys(window.NEON.config.bikes));
console.log('theme', THEME, '- bikes', names.join(', '), '\n');

for (const name of names) {
  await page.evaluate((n) => window.NEON.rider.setBike(n), name);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/bike-${name}.png` });
  const swatch = await page.evaluate(() => {
    const bike = window.NEON.config.bikes[window.NEON.rider.bike.name.toLowerCase()];
    return { paint: window.NEON.rider.bike.paint, name: window.NEON.rider.bike.name, bike: !!bike };
  });
  console.log(`${swatch.name.padEnd(6)} body #${swatch.paint.body.toString(16).padStart(6, '0')}`
    + `  rim #${swatch.paint.rim.toString(16).padStart(6, '0')}`
    + `  glass #${swatch.paint.glass.toString(16).padStart(6, '0')}`);
}

await browser.close();
server.child.kill();
console.log(`\nwrote ${OUT}/bike-*.png`);
process.exit(0);
