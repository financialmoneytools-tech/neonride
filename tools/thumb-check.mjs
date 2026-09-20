/**
 * Does every shipped thumbnail match the box it goes in?
 *
 *     node tools/thumb-check.mjs        # npm run thumbcheck
 *
 * ================= WHY =================
 *
 * The road thumbnails shipped squashed. The generator clipped a 2.87:1 band
 * and then resized it to 1.78:1 - a NON-UNIFORM scale - so every circle in
 * the frame came out a vertical oval, and the retro sun on Sunset Highway was
 * reported as exactly that. They were also a quarter of the resolution the
 * card needs, which is the soft look.
 *
 * Neither fault is visible in a file listing and both are obvious on a phone,
 * which is the worst combination there is. So this reads the actual pixel
 * dimensions off every shipped file and holds them against the actual box,
 * measured from the running game rather than typed in here.
 *
 * THE BOX IS MEASURED, NOT ASSUMED. `.road-shot` is a fixed 3.6:1 in
 * index.html, but a check that hard-codes 3.6 would pass forever after
 * somebody changed the CSS - which is the failure mode that let the squash
 * ship in the first place. This opens the road screen, reads the box, and
 * compares.
 */

import { spawn } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { chromium, devices } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const DIR = 'public/thumbs';
const SIZE = { width: 740, height: 320 };
const DPR = 3;
// A card and a picture within one per cent of each other are the same shape;
// sub-pixel layout and integer image sizes cannot do better than that.
const ASPECT_TOLERANCE = 0.01;

const failures = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '  - ' + detail : ''));
  if (!ok) failures.push(name + ': ' + detail);
}

/**
 * Width and height of a JPEG, straight out of its SOF marker.
 *
 * Read here rather than with a library because the whole point is to know
 * what is in the shipped bytes, and this is a dozen lines.
 * @param {string} file
 * @returns {{width: number, height: number}}
 */
function jpegSize(file) {
  const buf = readFileSync(file);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error(file + ' is not a JPEG');
  let at = 2;
  while (at < buf.length) {
    if (buf[at] !== 0xff) { at++; continue; }
    const marker = buf[at + 1];
    // SOF0..SOF15, excluding the four that are not frame headers.
    if (marker >= 0xc0 && marker <= 0xcf
      && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(at + 5), width: buf.readUInt16BE(at + 7) };
    }
    at += 2 + buf.readUInt16BE(at + 2);
  }
  throw new Error(file + ' has no frame header');
}

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((res, rej) => {
    const timer = setTimeout(() => rej(new Error('no dev server')), 40000);
    child.stdout.on('data', (c) => {
      text += String(c);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(timer); res({ child, url: m[1].trim() }); }
    });
  });
}

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const context = await browser.newContext({
  ...devices['Pixel 7'], viewport: SIZE, deviceScaleFactor: DPR, isMobile: true, hasTouch: true,
});
const page = await context.newPage();
await page.goto(server.url + '?stats=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
await page.waitForTimeout(1300);
await page.touchscreen.tap(SIZE.width / 2, SIZE.height / 2);
await page.waitForTimeout(800);
await page.click('.mode-screen .select-confirm');
await page.waitForTimeout(500);
await page.click('.bike-screen .select-confirm');
await page.waitForTimeout(800);

const box = await page.evaluate(() => {
  const shot = document.querySelector('.road-card-on .road-shot');
  const r = shot.getBoundingClientRect();
  return { w: r.width, h: r.height, dpr: window.devicePixelRatio };
});
await browser.close();
if (process.platform === 'win32') {
  spawn('taskkill', ['/pid', String(server.child.pid), '/T', '/F'], { stdio: 'ignore' });
} else server.child.kill('SIGTERM');

const boxAspect = box.w / box.h;
const needW = Math.round(box.w * box.dpr);
const needH = Math.round(box.h * box.dpr);
console.log('');
console.log('  the card wants ' + needW + 'x' + needH + ' device pixels'
  + ' (' + Math.round(box.w) + 'x' + Math.round(box.h) + ' css at dpr ' + box.dpr + ')');
console.log('  aspect ' + boxAspect.toFixed(3));
console.log('');
console.log('  file                 size        aspect   vs card');

const files = readdirSync(DIR).filter((f) => f.endsWith('.jpg')).sort();
check('there are thumbnails to check', files.length > 0, 'nothing in ' + DIR);

for (const file of files) {
  const { width, height } = jpegSize(DIR + '/' + file);
  const aspect = width / height;
  const off = Math.abs(aspect - boxAspect) / boxAspect;
  console.log('  ' + file.padEnd(20) + (width + 'x' + height).padEnd(12)
    + aspect.toFixed(3).padStart(6) + '   ' + (off * 100).toFixed(1) + '%');

  // THE SQUASH. A picture whose shape differs from its box is either being
  // distorted or being cropped to nothing, and both are shipped faults.
  check(file + ': matches the card aspect', off <= ASPECT_TOLERANCE,
    'image is ' + aspect.toFixed(3) + ', the card box is ' + boxAspect.toFixed(3)
    + ' - ' + (off * 100).toFixed(1) + '% out');

  // THE BLUR. Anything under what the card asks for at this device pixel
  // ratio is upscaled on screen, which is exactly what "they are blurry"
  // meant.
  check(file + ': is not upscaled on the card', width >= needW && height >= needH,
    'image is ' + width + 'x' + height + ', the card needs ' + needW + 'x' + needH);
}

console.log('');
if (failures.length) {
  console.log(failures.length + ' failure(s)');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
console.log('thumb-check: every thumbnail matches the card shape and clears its size');
process.exit(0);
