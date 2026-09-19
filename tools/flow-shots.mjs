/**
 * Screenshots of the selection flow, at a landscape phone size.
 *
 *     node tools/flow-shots.mjs [width] [height]
 *
 * Walks title -> mode -> bike -> road -> a finished run the way a thumb would,
 * and shoots each screen including the results card.
 * 740x320 by default, which is the size the layout is built for and the one
 * the smoke test checks buttons against.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\[[0-9;]*m', 'g');
const W = Number(process.argv[2] || 740);
const H = Number(process.argv[3] || 320);
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
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });

// stats off: these are pictures of the SCREENS, and the overlay is a
// developer readout that would otherwise be half of every one of them.
await page.goto(server.url + '?stats=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/flow-1-title.png` });

// A SHORT STAGE, so the last shot in this walk is a real finished run rather
// than a card posed by hand. Everything else about the stage is untouched.
await page.evaluate(() => {
  window.NEON.config.stage.length = 500;
  window.NEON.config.stage.checkpointEvery = 250;
});

// Top right, away from the comfort toggle at the centre of the card.
await page.tap('body', { position: { x: W - 40, y: 40 }, force: true }).catch(() => {});
await page.waitForTimeout(1200);
console.log('mode screen up:', await page.isVisible('.mode-screen').catch(() => false));
await page.screenshot({ path: `${OUT}/flow-2-mode.png` });

await page.click('.select-confirm'); // KOŞU, the staged run
await page.waitForTimeout(1200);
console.log('bike screen up:', await page.isVisible('.bike-screen').catch(() => false));
await page.screenshot({ path: `${OUT}/flow-3-bike.png` });

// Cycle through the bikes so each colourway is on record.
for (const name of ['nova', 'ember', 'frost']) {
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/flow-bike-${name}.png` });
}
await page.keyboard.press('ArrowRight'); // back round to volt
await page.waitForTimeout(500);

await page.click('.select-confirm');
await page.waitForTimeout(1500);
console.log('road screen up:', await page.isVisible('.road-screen').catch(() => false));
await page.screenshot({ path: `${OUT}/flow-4-road.png` });

const cards = await page.evaluate(() => Array.from(document.querySelectorAll('.road-card'))
  .map((c) => ({ label: c.textContent, locked: c.classList.contains('road-card-locked') })));
console.log('cards:', JSON.stringify(cards));

// --- the level screen, staged mode only ---------------------------------
await page.click('.select-confirm');
await page.waitForTimeout(1200);
if (await page.isVisible('.level-screen').catch(() => false)) {
  console.log('level screen up: true');
  await page.screenshot({ path: `${OUT}/flow-5-level.png` });
  await page.click('.level-screen .select-confirm');
  await page.waitForTimeout(1200);
}

// --- and ride it to the line --------------------------------------------
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/flow-6-run.png` });

// WAITED FOR, not slept through: `resultsDelay` is game time and a throttled
// page advances it far slower than the wall clock - core/Loop.js clamps dt to
// 0.05 a frame.
await page.waitForFunction(
  () => { const el = document.querySelector('.results'); return !!el && !el.hidden; },
  null, { timeout: 60000 },
).catch(() => {});
await page.waitForTimeout(600);
const result = await page.evaluate(() => ({
  phase: window.NEON.session.phase,
  medal: window.NEON.session.stage.medal,
  time: window.NEON.session.stage.time,
}));
console.log('result:', JSON.stringify(result));
await page.screenshot({ path: `${OUT}/flow-6-results.png` });

await browser.close();
server.child.kill();
console.log(`wrote ${OUT}/flow-*.png at ${W}x${H}`);
process.exit(0);
