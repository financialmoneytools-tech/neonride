/**
 * Can you get out of a run?
 *
 *     node tools/exit-check.mjs        # npm run exit
 *
 * ================= WHY =================
 *
 * Until ui/PauseExit.js there was no way out of a run. Once one started, the
 * only exits were finishing it, crashing three times, or reloading the page -
 * everything on the pause card changed how the current run behaved and
 * nothing left it. A rider who had picked the wrong road had to crash on
 * purpose.
 *
 * This drives the two buttons the way a thumb does, through real clicks on
 * the real card, and asserts what each one is supposed to leave behind:
 *
 *   YENİDEN BAŞLA  the same level, running again, from the start of it
 *   ANA MENÜ       no run at all, the selection flow up, and - the part worth
 *                  checking rather than assuming - NOTHING WRITTEN. Walking
 *                  away from a run is not a result and must not record one.
 *
 * The confirm step is checked from both sides: one press must NOT leave, and
 * the arming must expire on its own so a card left open is not a trap.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 1280, height: 720 };

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

const failures = [];
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  - ' + detail}`);
  if (!ok) failures.push(`${name}: ${detail}`);
}

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });

/** Opens a page with a staged run under way and the pause card up. */
async function paused(level = 3) {
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`page error ${e.message}`));
  await page.goto(`${server.url}?stats=0&level=${level}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.mouse.click(SIZE.width - 40, 40);
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const N = window.NEON;
    N.selection.setMode('stage');
    N.beginRun(3);
  });
  // Far enough in that a restart has something visible to undo.
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.NEON.session.togglePause());
  await page.waitForTimeout(400);
  return page;
}

// ================= YENİDEN BAŞLA =================
{
  const page = await paused();
  const before = await page.evaluate(() => ({
    level: window.NEON.session.levels.level,
    travelled: window.NEON.loop.state.levelTravelled || 0,
  }));
  await page.click('.pause-exit-restart');
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({
    phase: window.NEON.session.phase,
    level: window.NEON.session.levels.level,
    travelled: window.NEON.loop.state.levelTravelled || 0,
    paused: window.NEON.loop.paused,
  }));
  await page.close();

  check('restart: the run is running again', after.phase === 'running',
    `phase is ${after.phase}`);
  check('restart: the world is not left paused', !after.paused,
    'the loop is still paused, so the card closed onto a frozen game');
  check('restart: the SAME level', after.level === before.level,
    `was on level ${before.level}, restarted on ${after.level}`);
  check('restart: from the beginning of it',
    after.travelled < before.travelled,
    `travelled ${before.travelled.toFixed(0)} before and `
    + `${after.travelled.toFixed(0)} after, so it did not reset`);
}

// ================= ANA MENÜ, AND ITS CONFIRM =================
{
  const page = await paused();
  const armedLabel = await page.evaluate(() => window.NEON.config.ui.panel.menuConfirm);

  // ONE press must not leave.
  await page.click('.pause-exit-menu');
  await page.waitForTimeout(250);
  const once = await page.evaluate(() => ({
    phase: window.NEON.session.phase,
    open: window.NEON.selectFlow.open,
    label: document.querySelector('.pause-exit-menu').textContent,
  }));
  check('menu: one press does not end the run', once.phase === 'paused' && !once.open,
    `phase went to ${once.phase} on the first press`);
  check('menu: one press arms and says so', once.label === armedLabel,
    `the button still reads "${once.label}"`);

  // The second one does.
  await page.click('.pause-exit-menu');
  await page.waitForTimeout(700);
  const left = await page.evaluate(() => ({
    phase: window.NEON.session.phase,
    open: window.NEON.selectFlow.open,
    paused: window.NEON.loop.paused,
    record: JSON.stringify(window.NEON.progress.for(window.NEON.selection.startingRoad)),
  }));
  await page.close();

  check('menu: the second press ends the run', left.phase === 'title',
    `phase is ${left.phase}`);
  check('menu: the selection flow is up', left.open,
    'the run ended and nothing came up in its place');
  check('menu: the world is not left paused', !left.paused,
    'the menu is over a frozen world');
  // Walking away is not a result. Level 3 was never reached by riding to it.
  check('menu: nothing was recorded', !/"totalBest":\s*[0-9]/.test(left.record),
    `a total was written for an abandoned run: ${left.record}`);
}

// ================= THE CONFIRM EXPIRES =================
{
  const page = await paused();
  const wait = await page.evaluate(() => window.NEON.config.ui.panel.exitConfirmSeconds);
  const label = await page.evaluate(() => window.NEON.config.ui.panel.menu);
  await page.click('.pause-exit-menu');
  await page.waitForTimeout(wait * 1000 + 700);
  const now = await page.evaluate(() => document.querySelector('.pause-exit-menu').textContent);
  await page.close();
  check('menu: an armed confirm expires on its own', now === label,
    `still armed after ${wait} s, reading "${now}" - a card left open is a trap`);
}

// ================= IT IS REACHABLE AT ALL =================
//
// CLAUDE.md's two-tap rule is about the comfort toggle, but the reasoning
// applies here for the same reason: a rider reaching for this has already
// decided to stop, and a settings tree is not an answer. Pause, then press.
{
  const page = await paused();
  const reach = await page.evaluate(() => {
    const el = document.querySelector('.pause-exit-menu');
    if (!el) return null;
    const box = el.getBoundingClientRect();
    return { w: box.width, h: box.height, bottom: box.bottom, right: box.right };
  });
  await page.close();
  check('the exits are on screen and thumb sized',
    !!reach && reach.h >= 32 && reach.bottom <= SIZE.height && reach.right <= SIZE.width,
    reach ? `${reach.w.toFixed(0)}x${reach.h.toFixed(0)} at bottom ${reach.bottom.toFixed(0)}`
      : 'the button is not in the document');
}

await browser.close();
server.child.kill();

console.log('');
if (failures.length) {
  console.log(`${failures.length} failure(s)`);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}
console.log('exit-check: a run can be restarted and a run can be left');
process.exit(0);
