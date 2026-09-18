/**
 * Can a FINGER drive the selection screens?
 *
 *     node tools/touch-check.mjs          # npm run touch
 *
 * Exits non-zero if a real touch gesture fails to change the selection.
 *
 * ================= WHY THIS EXISTS =================
 *
 * The bike screen worked on a desktop and did nothing at all on a phone. The
 * smoke test walked the same flow and passed, because it drove the screens with
 * `keyboard.press('ArrowRight')` and `page.click()` - a keyboard and a
 * synthesised mouse click. Neither is a finger, and the one thing that was
 * broken was the finger.
 *
 * That is the same class of fault as the smoke test which spent weeks silently
 * testing the title screen: a check that exercises a different path from the
 * user's is not checking the user's path.
 *
 * SO EVERYTHING HERE IS A REAL TOUCH, and all of it through ONE channel: CDP
 * `Input.dispatchTouchEvent`, with genuine touchStart / touchMove / touchEnd
 * sequences, in a context created with `hasTouch` and `isMobile`. No mouse
 * events are sent anywhere in this file, and Playwright's own touchscreen is
 * not mixed in - see the note on the title tap for what that cost.
 *
 * It is written to FAIL on the build that was reported broken, and it did:
 * every gesture left the selection unchanged, because `.select-screen` carried
 * `pointer-events: none` and the card never received a pointerdown at all.
 */

import { spawn } from 'node:child_process';
import { chromium, devices } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
// The size the layout is built for and the one the phone reports.
const SIZE = { width: 740, height: 320 };

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server')), 30000);
    child.stdout.on('data', (chunk) => {
      text += String(chunk);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve({ child, url: m[1].trim() }); }
    });
  });
}

const failures = [];
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`);
  if (!ok) failures.push(`${name}: ${detail}`);
}

/**
 * One finger down and up in the same place.
 *
 * WITH A DWELL, and it is not padding. A touchStart and touchEnd dispatched in
 * the same millisecond is not a tap any finger could make, and Chrome does not
 * always promote it to a `click` - measured, the arrow received pointerdown,
 * touchstart, pointerup and touchend and NO click, so a button that works
 * perfectly by hand looked broken. A real thumb is down for something like a
 * tenth of a second.
 */
async function tap(cdp, x, y) {
  const point = [{ x: Math.round(x), y: Math.round(y), radiusX: 12, radiusY: 12, force: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point });
  await new Promise((resolve) => setTimeout(resolve, 70));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/** A real finger: touchStart, several touchMoves, touchEnd. */
async function swipe(cdp, from, to, steps = 12) {
  const point = (x, y) => [{ x: Math.round(x), y: Math.round(y), radiusX: 12, radiusY: 12, force: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(from.x, from.y) });
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: point(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t),
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const context = await browser.newContext({
  ...devices['Pixel 7'], viewport: SIZE, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
});
const page = await context.newPage();
page.on('pageerror', (e) => failures.push('page error: ' + e.message));
const cdp = await context.newCDPSession(page);

await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
await page.waitForTimeout(1800);

// Dismiss the title card with a real tap, away from the comfort toggle.
// THROUGH CDP LIKE EVERYTHING ELSE. This was Playwright's own touchscreen at
// first, and mixing the two input channels is not harmless: the first CDP
// gesture after it worked and the next CDP TAP was silently swallowed, so the
// arrow test reported NOVA -> NOVA on a build where a hand-driven tap took
// NOVA -> EMBER correctly. A test that fails for reasons of its own is worse
// than no test, and this one nearly sent a real fix back to be re-fixed.
await tap(cdp, SIZE.width - 40, 40);
await page.waitForTimeout(1200);

// THE MODE SCREEN IS FIRST, and it is driven by a real tap like everything
// else here: KOŞU or SONSUZ is the first thing a thumb has to be able to
// choose, so a screen that cannot be tapped is a game that cannot be started.
const onMode = await page.isVisible('.mode-screen').catch(() => false);
check('the mode screen opens after a tap', onMode, onMode ? '' : 'never appeared');
if (onMode) {
  const modeConfirm = await page.$('.mode-screen .select-confirm');
  const modeBox = modeConfirm && await modeConfirm.boundingBox();
  if (modeBox) {
    await tap(cdp, modeBox.x + modeBox.width / 2, modeBox.y + modeBox.height / 2);
    await page.waitForTimeout(800);
  }
}

const onBike = await page.isVisible('.bike-screen').catch(() => false);
check('tapping through the mode opens the bike screen', onBike, onBike ? '' : 'never appeared');
if (!onBike) {
  await browser.close();
  server.child.kill();
  console.log('\nnothing else can be tested');
  process.exit(1);
}

const bikeName = () => page.textContent('.bike-name').catch(() => null);

// --- 1. a swipe across the middle of the card ------------------------------
const before = await bikeName();
await swipe(cdp, { x: SIZE.width * 0.72, y: SIZE.height * 0.52 },
  { x: SIZE.width * 0.24, y: SIZE.height * 0.52 });
await page.waitForTimeout(700);
const afterSwipe = await bikeName();
check('a swipe changes the bike', afterSwipe !== before, `${before} -> ${afterSwipe}`);

// --- 2. the arrow controls, tapped ----------------------------------------
const arrows = await page.$$('.select-arrow');
check('there are arrow controls to tap', arrows.length >= 2,
  `${arrows.length} found - a screen that can only be swiped is a screen a thumb cannot use`);

if (arrows.length >= 2) {
  const beforeArrow = await bikeName();
  // BY SELECTOR, not by index into the query. `$$('.select-arrow')[1]` was used
  // first and never changed the bike, while the identical tap by selector did -
  // the index is an assumption about DOM order that the test should not be
  // making about a component it is checking.
  const nextArrow = await page.$('.select-arrow-next');
  const box = nextArrow && await nextArrow.boundingBox();
  // Through CDP like every other gesture here. Mixing Playwright's touchscreen
  // with CDP touch events left the tap after a swipe silently ignored, which
  // is a property of the harness rather than of the game - and a test that
  // fails for its own reasons is worse than no test.
  await tap(cdp, box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(700);
  const afterArrow = await bikeName();
  check('tapping the right arrow changes the bike', afterArrow !== beforeArrow,
    `${beforeArrow} -> ${afterArrow}`);

  // Every arrow must be big enough to hit. 44 px is the usual floor for a
  // thumb and this screen is 320 px tall, so there is no room to be generous
  // and no excuse to be small.
  let smallest = Infinity;
  for (const arrow of arrows) {
    const b = await arrow.boundingBox();
    if (b) smallest = Math.min(smallest, Math.min(b.width, b.height));
  }
  check('the arrows are thumb sized', smallest >= 40, `smallest side ${Math.round(smallest)} px`);
}

// --- 3. confirm with a real tap, and the road screen the same way ----------
const confirm = await page.$('.select-confirm');
const confirmBox = confirm && await confirm.boundingBox();
if (confirmBox) {
  await tap(cdp, confirmBox.x + confirmBox.width / 2, confirmBox.y + confirmBox.height / 2);
  await page.waitForTimeout(900);
}
const onRoad = await page.isVisible('.road-screen').catch(() => false);
check('tapping İLERİ opens the road screen', onRoad, onRoad ? '' : 'still on the bike screen');

if (onRoad) {
  const roadLabel = () => page.evaluate(() => {
    const on = document.querySelector('.road-card-on');
    return on ? on.textContent : null;
  });
  const beforeRoad = await roadLabel();
  await swipe(cdp, { x: SIZE.width * 0.7, y: SIZE.height * 0.42 },
    { x: SIZE.width * 0.25, y: SIZE.height * 0.42 });
  await page.waitForTimeout(700);
  const afterRoad = await roadLabel();
  check('a swipe changes the road', afterRoad !== beforeRoad, `${beforeRoad} -> ${afterRoad}`);
}

await browser.close();
server.child.kill();

if (failures.length) {
  console.log(`\n${failures.length} failure(s) - the selection screens cannot be driven by touch`);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}
console.log('\ntouch-check: a finger can drive the selection screens');
process.exit(0);
