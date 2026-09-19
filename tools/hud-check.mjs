/**
 * The HUD, at every shape it has to survive.
 *
 *     node tools/hud-check.mjs        # npm run hud
 *
 * The smoke test holds the phone case; this one walks the desktop aspects too,
 * because a layout fixed for 740x320 and never looked at on a wide monitor is a
 * layout that has been moved rather than fixed.
 *
 * Two rules: nothing overlaps, and the stats panel - a DEBUG TOOL - takes under
 * a fifth of the screen. The area rule is what keeps the overlap rule honest,
 * since any overlap can be removed by making a panel taller and narrower.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium, devices } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\[[0-9;]*m', 'g');
const SIZES = [
  // TOUCH, for the phone case. The pause button only exists when the controls
  // are enabled, and they are enabled on a coarse pointer - so without this the
  // check measured two boxes where the phone shows three, and reported that
  // nothing overlapped because the third was not there.
  { name: 'phone landscape', width: 740, height: 320, touch: true },
  { name: '16:9', width: 1280, height: 720 },
  { name: '2:1', width: 1440, height: 720 },
  { name: '21:9', width: 1680, height: 720 },
];
const CEILING = 0.20;

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

const SHOTS = process.argv.includes('--shots');
const server = await startServer();
if (SHOTS) mkdirSync('tools/out', { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const failures = [];

for (const size of SIZES) {
  const page = await browser.newPage(size.touch
    ? { ...devices['Pixel 7'], viewport: { width: size.width, height: size.height },
      isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
    : { viewport: { width: size.width, height: size.height } });
  page.on('pageerror', (e) => failures.push(`${size.name}: page error ${e.message}`));
  // A REAL RUN, not god mode. God mode is the obvious way to get a road on
  // screen without walking the menus, and it was the first thing tried - but it
  // takes the HUD and the pause button away with it, so the check measured the
  // stats panel alone and reported that nothing overlapped. Nothing overlapped
  // because there was nothing to overlap with.
  await page.goto(`${server.url}?theme=auroraPass&stats=1`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  // Away from the centre, where the comfort toggle swallows the press.
  await page.mouse.click(size.width - 40, 40);
  await page.waitForTimeout(700);
  // THE MODE SCREEN IS FIRST now - title -> mode -> bike -> road -> run.
  for (const selector of [
    '.mode-screen .select-confirm',
    '.bike-screen .select-confirm',
    '.road-screen .select-confirm',
  ]) {
    await page.waitForSelector(selector, { timeout: 8000 });
    await page.click(selector);
    await page.waitForTimeout(500);
  }
  // THE LEVEL SCREEN, which only exists in staged mode. Clicked only if it
  // actually appeared, so this same walk still works in SONSUZ, where there
  // are no levels and the road screen goes straight to the run.
  if (await page.isVisible('.level-screen').catch(() => false)) {
    await page.click('.level-screen .select-confirm');
    await page.waitForTimeout(500);
  }
  await page.waitForFunction(() => window.NEON.session.phase === 'running', null, { timeout: 8000 });
  await page.waitForTimeout(2500);

  const boxes = await page.evaluate(() => {
    const want = { stats: '.stats-overlay', hud: '.hud', pause: '.pause-button' };
    const out = {};
    for (const [name, selector] of Object.entries(want)) {
      const el = document.querySelector(selector);
      if (!el || el.hidden) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      out[name] = { x: b.left, y: b.top, w: b.width, h: b.height };
    }
    return out;
  });

  console.log(`\n${size.name}  ${size.width}x${size.height}`);
  for (const [name, b] of Object.entries(boxes)) {
    const share = (b.w * b.h) / (size.width * size.height);
    console.log(`  ${name.padEnd(6)} ${Math.round(b.x)},${Math.round(b.y)}  `
      + `${Math.round(b.w)}x${Math.round(b.h)}   ${(share * 100).toFixed(1)}% of screen`);
  }

  const names = Object.keys(boxes);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = boxes[names[i]];
      const b = boxes[names[j]];
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 1 && oy > 1) {
        failures.push(`${size.name}: ${names[i]} and ${names[j]} overlap `
          + `${Math.round(ox)}x${Math.round(oy)} px`);
      }
    }
  }
  if (boxes.stats) {
    const share = (boxes.stats.w * boxes.stats.h) / (size.width * size.height);
    if (share > CEILING) {
      failures.push(`${size.name}: stats covers ${(share * 100).toFixed(0)}%, over ${CEILING * 100}%`);
    }
  }
  for (const [name, b] of Object.entries(boxes)) {
    if (b.x < -1 || b.y < -1 || b.x + b.w > size.width + 1 || b.y + b.h > size.height + 1) {
      failures.push(`${size.name}: ${name} is outside the viewport`);
    }
  }
  if (SHOTS) {
    await page.screenshot({ path: `tools/out/hud-${size.name.replace(/[^a-z0-9]+/gi, '-')}.png` });
  }
  await page.close();
}

await browser.close();
server.child.kill();

if (failures.length) {
  console.log(`\n${failures.length} problem(s)`);
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
console.log('\nhud-check: nothing overlaps and the stats panel stays out of the way');
process.exit(0);
