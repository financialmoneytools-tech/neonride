/**
 * One 16:9 capture of every road, at the start and four kilometres in.
 *
 *     node tools/road-shots.mjs        # npm run shots
 *
 * The pair is the point. A road has to be RECOGNISABLE as itself at both,
 * which is the thing that was broken - see tools/sky-stable.mjs for what was
 * drifting and why. This is the eyeball version of that check: the numbers
 * say the sky held, these say whether it held as something worth looking at.
 *
 * Ridden through the MENUS, not by ?theme=, and by the bot rather than god
 * mode. That is the path a player takes and the path the fault lived on; a
 * capture taken any other way is a capture of a different code path.
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 1280, height: 720 };
const DIR = 'tools/out/roads';
const MARKS = [0, 4000];

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

/**
 * Picks `road` on the road screen and confirms it, then checks that the run
 * about to start is actually on that road.
 * @returns {Promise<string|null>} an error, or null
 */
async function confirmRoad(page, road, all) {
  for (let attempt = 0; attempt < all.length + 2; attempt++) {
    if (await page.evaluate(() => window.NEON.themes.name) === road) {
      await page.click('.road-screen .select-confirm');
      await page.waitForTimeout(450);
      const picked = await page.evaluate(() => ({
        road: window.NEON.selection.road,
        mixed: window.NEON.selection.mixed,
      }));
      if (picked.road === road && !picked.mixed) return null;
      // The mixed card. Step off it and keep looking.
      await page.evaluate(() => window.NEON.selectFlow.start());
      await page.waitForTimeout(400);
      await page.click('.mode-screen .select-confirm');
      await page.waitForTimeout(350);
      await page.click('.bike-screen .select-confirm');
      await page.waitForTimeout(350);
    }
    await page.click('.road-screen .select-arrow-next');
    await page.waitForTimeout(260);
  }
  return 'never confirmed the ' + road + ' card';
}

const server = await startServer();
mkdirSync(DIR, { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

const probe = await browser.newPage({ viewport: { width: 640, height: 360 } });
await probe.goto(server.url + '?god=1', { waitUntil: 'load' });
await probe.waitForFunction(() => window.NEON, null, { timeout: 20000 });
const roads = await probe.evaluate(() => Object.keys(window.NEON.config.themes));
await probe.close();

for (const road of roads) {
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => console.log('PAGEERROR', road, e.message));
  await page.goto(server.url + '?stats=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(SIZE.width - 40, 40);
  await page.waitForTimeout(700);
  await page.click('.mode-screen .select-confirm');
  await page.waitForTimeout(400);
  await page.click('.bike-screen .select-confirm');
  await page.waitForTimeout(400);
  // A full lap of the grid first, so every other road has been previewed on
  // the way to this one. That is the state the drifting sky needed.
  for (let i = 0; i < roads.length; i++) {
    await page.click('.road-screen .select-arrow-next');
    await page.waitForTimeout(240);
  }
  // THE CARD, NOT THE THEME THAT IS FITTED.
  //
  // Walking by `themes.name` alone confirmed the wrong card. The road screen
  // carries a TUM YOLLAR card for the changing road, and previewing IT fits
  // `selection.startingRoad`, which is the first theme - so `themes.name`
  // reads 'galaxyRoad' while the highlighted card is the mixed one. Measured:
  // a capture labelled galaxyRoad was Galaxy Road at 0 m and Aurora Pass at
  // 4000 m, because the run was a mixed one that gated to another road
  // halfway through it.
  //
  // `selection.road` is the truth and it only moves on CONFIRM, so the card
  // is chosen, confirmed, and then checked - and a wrong one is stepped past
  // and tried again.
  const wrong = await confirmRoad(page, road, roads);
  if (wrong) console.log('SKIPPED', road, '-', wrong);
  await page.waitForTimeout(350);
  if (await page.isVisible('.level-screen').catch(() => false)) {
    await page.click('.level-screen .select-confirm');
    await page.waitForTimeout(600);
  }
  await page.waitForFunction(() => window.NEON.session.phase === 'running',
    null, { timeout: 10000 }).catch(() => {});
  await page.evaluate(() => { window.NEON.config.autopilot.enabled = true; });

  // Past the reveal fade and the level banner, and no further: "0 m" has to
  // be the first thing a rider actually sees.
  await page.waitForTimeout(2400);
  const start = await page.evaluate(() => window.NEON.loop.state.distance || 0);
  for (const mark of MARKS) {
    await page.waitForFunction(
      (args) => (window.NEON.loop.state.distance || 0) - args[0] >= args[1],
      [start, mark], { timeout: 120000 },
    ).catch(() => {});
    const path = DIR + '/' + road + '-' + mark + '.jpg';
    await page.screenshot({ path, quality: 82, type: 'jpeg' });
    console.log(path);
  }
  await page.close();
}

await browser.close();
server.child.kill();
