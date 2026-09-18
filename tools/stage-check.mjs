/**
 * Does a staged run actually finish, and what is a good time worth?
 *
 *     node tools/stage-check.mjs          # npm run stage
 *
 * Two jobs, and they are related. It drives a stage to its finish line and
 * checks the whole chain - checkpoints counted, finish reached, results card
 * shown, medal awarded, restart working - and it MEASURES the reference time
 * the medal thresholds are multiples of, so those thresholds are a measurement
 * rather than somebody's guess.
 *
 * ================= WHY THE STAGE IS SHORTENED, NOT SIMULATED ===============
 *
 * The finish is driven by `config.stage.length`, so the hook is to make the
 * stage short: everything else - the gates, the clock, the checkpoint counter,
 * the flash, the card - runs exactly as it does in a real run. A test that
 * called `session._finish()` directly would prove that the method works and
 * nothing about whether anything reaches it, which is the fault the smoke test
 * already had once when it spent weeks testing the title screen.
 *
 * The reference time is measured at FULL LENGTH under the autopilot, because
 * that is the number the medals mean something against.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 1280, height: 720 };

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

const failures = [];
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`);
  if (!ok) failures.push(`${name}: ${detail}`);
}

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });

// ========================= 1. the reference time =========================
// Full length, autopilot, no traffic collisions - the floor a human is
// measured against. Distance is read straight from the loop state rather than
// from the stage, because god mode has no stage: the point is how long five
// kilometres of THIS road takes at racing speed.
{
  const page = await browser.newPage({ viewport: SIZE });
  await page.goto(`${server.url}?god=1&stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });

  const reference = await page.evaluate(async (length) => {
    const N = window.NEON;
    const start = N.loop.state.distance || 0;
    const began = performance.now();
    await new Promise((resolve) => {
      const tick = () => {
        if ((N.loop.state.distance || 0) - start >= length) resolve();
        else requestAnimationFrame(tick);
      };
      tick();
    });
    return {
      seconds: (performance.now() - began) / 1000,
      distance: (N.loop.state.distance || 0) - start,
    };
  }, 5000);

  console.log('');
  console.log('REFERENCE TIME  (autopilot, full length, no collisions)');
  console.log('  %s units in %s s', Math.round(reference.distance), reference.seconds.toFixed(2));
  const configured = await page.evaluate(() => window.NEON.config.stage.medals);
  console.log('  configured reference %s s -> gold under %s s, silver under %s s',
    configured.referenceSeconds.toFixed(1),
    (configured.referenceSeconds * configured.gold).toFixed(1),
    (configured.referenceSeconds * configured.silver).toFixed(1));
  // A reference that has drifted a long way from what the game actually does
  // makes every medal wrong, so it is a failure rather than a note.
  const drift = Math.abs(reference.seconds - configured.referenceSeconds)
    / configured.referenceSeconds;
  check('the medal reference matches the measured time', drift <= 0.15,
    `measured ${reference.seconds.toFixed(2)} s against a configured `
    + `${configured.referenceSeconds.toFixed(1)} s, ${(drift * 100).toFixed(0)}% out`);
  await page.close();
}

// ========================= 2. a stage, start to finish ===================
{
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push('page error: ' + e.message));
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1500);

  // THE FAST FINISH HOOK. A short stage, not a fake one: 600 metres with a
  // checkpoint every 200, so three checkpoints and a finish all happen for
  // real inside a few seconds.
  await page.evaluate(() => {
    window.NEON.config.stage.length = 600;
    window.NEON.config.stage.checkpointEvery = 200;
  });

  // --- the flow: title -> mode -> bike -> road -> run ---------------------
  await page.keyboard.press('Space');
  await page.waitForTimeout(600);
  const onMode = await page.isVisible('.mode-screen').catch(() => false);
  check('the mode screen opens first', onMode, onMode ? '' : 'never appeared');

  // KOŞU is the first card, so Enter takes the staged run.
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const onBike = await page.isVisible('.bike-screen').catch(() => false);
  check('the bike screen follows the mode', onBike, onBike ? '' : 'never appeared');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const onRoad = await page.isVisible('.road-screen').catch(() => false);
  check('the road screen follows the bike', onRoad, onRoad ? '' : 'never appeared');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);

  const started = await page.evaluate(() => ({
    phase: window.NEON.session.phase,
    mode: window.NEON.session.mode,
    staged: window.NEON.session.staged,
  }));
  check('the run starts in stage mode', started.staged && started.phase === 'running',
    `phase ${started.phase}, mode ${started.mode}`);

  // --- ride it to the line -----------------------------------------------
  const finished = await page.evaluate(async () => {
    const N = window.NEON;
    const seen = { checkpoints: 0, gatesArmed: 0 };
    const began = performance.now();
    await new Promise((resolve) => {
      const tick = () => {
        seen.checkpoints = Math.max(seen.checkpoints, N.session.stage.checkpoints);
        if (N.checkpointGate.armed || N.finishGate.armed) seen.gatesArmed = 1;
        if (N.session.phase === 'finished') resolve();
        else if (performance.now() - began > 60000) resolve();
        else requestAnimationFrame(tick);
      };
      tick();
    });
    return {
      phase: N.session.phase,
      checkpoints: seen.checkpoints,
      gatesArmed: seen.gatesArmed,
      travelled: N.session.stage.travelled,
      time: N.session.stage.time,
      medal: N.session.stage.medal,
      lives: N.session.lives,
    };
  });

  check('the stage reaches its finish', finished.phase === 'finished',
    `phase ${finished.phase} after ${Math.round(finished.travelled)} of 600`);
  // Three checkpoints in a 600 metre stage with one every 200: at 200 and 400.
  // The gate at 600 is the finish and is not counted as one.
  check('the checkpoints are counted', finished.checkpoints === 2,
    `${finished.checkpoints} counted, expected 2`);
  check('a gate is actually placed on the road', finished.gatesArmed === 1,
    finished.gatesArmed ? '' : 'no checkpoint or finish gate was ever armed');
  check('a medal is awarded', !!finished.medal,
    `${finished.medal} in ${finished.time.toFixed(1)} s`);

  // --- the results card --------------------------------------------------
  // WAITED FOR, NOT SLEPT THROUGH: `resultsDelay` is game time, and a page
  // whose rAF is throttled advances game time far slower than the wall clock
  // because core/Loop.js clamps dt to 0.05 a frame.
  await page.waitForFunction(
    () => { const el = document.querySelector('.results'); return !!el && !el.hidden; },
    null, { timeout: 30000 },
  ).catch(() => {});
  const card = await page.evaluate(() => {
    const el = document.querySelector('.results');
    const medal = document.querySelector('.results-medal');
    return {
      shown: !!el && !el.hidden,
      finished: !!el && el.classList.contains('results-finished'),
      medal: medal && !medal.hidden ? medal.textContent : null,
      text: el ? el.textContent : '',
    };
  });
  check('the results card is shown', card.shown, card.shown ? '' : 'still hidden');
  check('it reads as a finish, not a failure', card.finished,
    card.finished ? card.medal : 'no results-finished class');
  // The old game over panel must be gone, not merely covered: two cards over
  // each other is how a retired one survives for months.
  const oldPanel = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('.panel')].filter((el) => !el.hidden);
    return panels.map((el) => el.className);
  });
  check('only one card is up', oldPanel.length === 1, oldPanel.join(' | '));

  // --- and it can be played again ----------------------------------------
  await page.keyboard.press('Space');
  await page.waitForTimeout(700);
  const again = await page.evaluate(() => ({
    phase: window.NEON.session.phase,
    travelled: window.NEON.session.stage.travelled,
    checkpoints: window.NEON.session.stage.checkpoints,
    finishArmed: window.NEON.finishGate.armed,
  }));
  check('a press starts the stage again', again.phase === 'running',
    `phase ${again.phase}`);
  check('the new stage starts from zero', again.checkpoints === 0 && again.travelled < 600,
    `${Math.round(again.travelled)} m in, ${again.checkpoints} checkpoints`);

  await page.close();
}

// ========================= 3. endless has no stage =======================
{
  const page = await browser.newPage({ viewport: SIZE });
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.keyboard.press('Space');
  await page.waitForTimeout(600);
  // SONSUZ is the second card.
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);

  const endless = await page.evaluate(() => ({
    mode: window.NEON.session.mode,
    staged: window.NEON.session.staged,
    phase: window.NEON.session.phase,
    stageHudHidden: document.querySelector('.hud-stage')?.hidden,
    gates: window.NEON.checkpointGate.armed || window.NEON.finishGate.armed,
  }));
  check('endless runs without a stage', !endless.staged && endless.phase === 'running',
    `mode ${endless.mode}, phase ${endless.phase}`);
  check('no stage readout in endless', endless.stageHudHidden === true,
    `hidden is ${endless.stageHudHidden}`);
  check('no checkpoint gates in endless', !endless.gates,
    endless.gates ? 'a staged gate was armed in an endless run' : '');
  await page.close();
}

await browser.close();
server.child.kill();

console.log('');
if (failures.length) {
  console.log(`${failures.length} failure(s)`);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}
console.log('stage-check: a stage starts, counts, finishes and can be run again');
process.exit(0);
