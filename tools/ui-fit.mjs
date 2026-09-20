/**
 * Does anything on a selection screen fall off a 740x320 phone?
 *
 *     node tools/ui-fit.mjs         # npm run fit
 *     node tools/ui-fit.mjs --shot  # also write a capture of each screen
 *
 * ================= WHY IT MEASURES RATHER THAN LOOKS =================
 *
 * "Check nothing overflows" is not a question a screenshot answers. An
 * element one pixel past the bottom edge looks identical to one that fits,
 * and the confirm button going off the screen is the difference between a
 * playable game and a dead end. So this reads the real boxes - every
 * element's rectangle against the viewport - and fails on anything outside.
 *
 * THE PHONE'S OWN FRAME, 740x320 CSS at a device pixel ratio of 3, which is
 * what tools/phone-probe.mjs and tools/phone-fps.mjs already use: the quality
 * preset is chosen from the CSS size and the layout is written for it.
 *
 * It also checks the thing that makes text unreadable rather than absent - a
 * computed font size under the floor - and that the one card on screen is
 * actually large, since the whole point of showing one is that it can be big.
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium, devices } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 740, height: 320 };
const SHOT = process.argv.includes('--shot');
// Under this, letterspaced text on a phone at arm's length stops being
// readable. It is the floor the whole "up two steps" pass was for.
const MIN_FONT = 10.5;

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

const failures = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '  - ' + detail : ''));
  if (!ok) failures.push(name + ': ' + detail);
}

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const context = await browser.newContext({
  ...devices['Pixel 7'], viewport: SIZE, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
});
const page = await context.newPage();
page.on('pageerror', (e) => failures.push('page error ' + e.message));
await page.goto(server.url + '?stats=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
await page.waitForTimeout(1400);
await page.touchscreen.tap(SIZE.width / 2, SIZE.height / 2);
await page.waitForTimeout(900);
if (SHOT) mkdirSync('tools/out/ui', { recursive: true });

/**
 * Measures everything visible under one screen against the viewport.
 * @param {string} label
 * @param {string} root selector for the screen
 */
async function measure(label, root) {
  const visible = await page.isVisible(root).catch(() => false);
  if (!visible) {
    check(label + ': the screen is up', false, root + ' is not visible');
    return null;
  }
  const report = await page.evaluate((args) => {
    const screen = document.querySelector(args.sel);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const over = [];
    const small = [];
    const all = screen.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      // Half a pixel of slack: sub-pixel layout rounds either way, and a
      // fraction over the edge is not something anybody can see.
      if (r.left < -0.5 || r.top < -0.5 || r.right > w + 0.5 || r.bottom > h + 0.5) {
        over.push({
          what: String(el.className || el.tagName),
          box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)],
        });
      }
      // Only elements that carry text of their own, or every wrapper would
      // be reported for the size its children happen to inherit.
      let ownText = false;
      for (let n = 0; n < el.childNodes.length; n++) {
        const node = el.childNodes[n];
        if (node.nodeType === 3 && node.textContent.trim()) ownText = true;
      }
      if (ownText) {
        const size = parseFloat(style.fontSize);
        if (size < args.minFont) small.push({ what: String(el.className || el.tagName), size });
      }
    }
    const card = screen.querySelector('.road-card-on, .mode-card-on, .level-card-on, .bike-name');
    const box = card ? card.getBoundingClientRect() : null;
    return {
      over,
      small,
      viewport: [w, h],
      card: box ? { w: Math.round(box.width), h: Math.round(box.height) } : null,
    };
  }, { sel: root, minFont: MIN_FONT });

  if (SHOT) await page.screenshot({ path: 'tools/out/ui/' + label + '.png' });

  console.log('  ' + label.padEnd(6) + '  viewport ' + report.viewport[0] + 'x' + report.viewport[1]
    + '  card ' + (report.card ? report.card.w + 'x' + report.card.h : '-'));

  check(label + ': nothing falls outside the frame', report.over.length === 0,
    report.over.slice(0, 4).map((o) => o.what + ' at [' + o.box.join(', ') + ']').join('; '));
  check(label + ': no text under ' + MIN_FONT + 'px', report.small.length === 0,
    report.small.slice(0, 4).map((o) => o.what + ' at ' + o.size.toFixed(1) + 'px').join('; '));
  return report;
}

/** A card that is the only thing on screen has no excuse to be small. */
function checkBig(label, report) {
  if (!report || !report.card) return;
  const big = report.card.w >= SIZE.width * 0.45 && report.card.h >= SIZE.height * 0.5;
  check(label + ': the card fills most of the frame', big,
    'card is ' + report.card.w + 'x' + report.card.h
    + ' in a ' + SIZE.width + 'x' + SIZE.height + ' frame');
}

checkBig('mode', await measure('mode', '.mode-screen'));

await page.click('.mode-screen .select-confirm');
await page.waitForTimeout(650);
await measure('bike', '.bike-screen');

await page.click('.bike-screen .select-confirm');
await page.waitForTimeout(750);
checkBig('road', await measure('road', '.road-screen'));

await page.click('.road-screen .select-confirm');
await page.waitForTimeout(750);
if (await page.isVisible('.level-screen').catch(() => false)) {
  await measure('level', '.level-screen');
}

await browser.close();
if (process.platform === 'win32') {
  spawn('taskkill', ['/pid', String(server.child.pid), '/T', '/F'], { stdio: 'ignore' });
} else server.child.kill('SIGTERM');

console.log('');
if (failures.length) {
  console.log(failures.length + ' failure(s)');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
console.log('ui-fit: every screen fits 740x320 and nothing is too small to read');
process.exit(0);
