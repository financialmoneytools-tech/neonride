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

  // MEASURED ON THE GAME CLOCK, which is the clock the medals are compared
  // against. `state.elapsed` is the sum of the same dt the stage accumulates,
  // clamped to `loop.maxDelta` a frame, and it is not the wall clock: a page
  // that drops frames advances it more slowly than `performance.now()`. The
  // reference used to be taken on the wall clock and handed straight to
  // thresholds applied to the game clock, so a slow machine measured a
  // reference that was too long and quietly made every medal easier.
  const reference = await page.evaluate(async (length) => {
    const N = window.NEON;
    const start = N.loop.state.distance || 0;
    const began = N.loop.state.elapsed;
    const wall = performance.now();
    await new Promise((resolve) => {
      const tick = () => {
        if ((N.loop.state.distance || 0) - start >= length) resolve();
        else requestAnimationFrame(tick);
      };
      tick();
    });
    return {
      seconds: N.loop.state.elapsed - began,
      wallSeconds: (performance.now() - wall) / 1000,
      distance: (N.loop.state.distance || 0) - start,
    };
  }, 5000);

  console.log('');
  console.log('REFERENCE TIME  (autopilot, full length, no collisions)');
  console.log('  %s units in %s s of game time  (%s s on the wall)',
    Math.round(reference.distance), reference.seconds.toFixed(2),
    reference.wallSeconds.toFixed(2));
  // The two clocks agreeing is what says the measurement was taken on a page
  // that was actually rendering. They diverge when frames are dropped, and a
  // reference measured through a stall is a reference that is too long.
  const clockDrift = Math.abs(reference.wallSeconds - reference.seconds)
    / Math.max(reference.seconds, 1e-6);
  check('the game clock kept up with the wall clock', clockDrift <= 0.05,
    `game ${reference.seconds.toFixed(2)} s against wall `
    + `${reference.wallSeconds.toFixed(2)} s, ${(clockDrift * 100).toFixed(0)}% apart`);
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
  // STATS ON for this one. The overlay is a debug tool and every other check
  // here runs without it, but it is one of the two readouts that misreported
  // the run - it printed the lifetime odometer under the label `dist` - so
  // this is the section that has to be able to read it.
  await page.goto(`${server.url}?stats=1`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1500);

  // THE FAST FINISH HOOK. A short road, not a fake one: two levels of 600
  // metres with a checkpoint every 200, so two checkpoints, a LEVEL BOUNDARY
  // and a finish all happen for real inside a few seconds.
  //
  // TWO LEVELS RATHER THAN ONE, because the boundary is the interesting case
  // and it is the one that cannot be reached by shortening a single stage:
  // level one has to hand back a life and carry straight on, and level two
  // has to end the run. A one level road would only ever exercise the second.
  await page.evaluate(() => {
    const N = window.NEON;
    N.config.stage.length = 600;
    N.config.stage.checkpointEvery = 200;
    N.config.levels.count = 2;
    // Generous, so a short level still earns a medal and the medal path is
    // exercised. The thresholds themselves are measured by npm run levels.
    N.config.levels.referenceSeconds = [6, 6];
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
  await page.waitForTimeout(500);
  // THE LEVEL SCREEN, which only exists in staged mode. It opens on level one,
  // which is the run that counts for a road total.
  const onLevel = await page.isVisible('.level-screen').catch(() => false);
  check('the level screen follows the road', onLevel, onLevel ? '' : 'never appeared');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);

  const started = await page.evaluate(() => ({
    phase: window.NEON.session.phase,
    mode: window.NEON.session.mode,
    staged: window.NEON.session.staged,
    level: window.NEON.session.levels.level,
  }));
  check('the run starts in stage mode', started.staged && started.phase === 'running',
    `phase ${started.phase}, mode ${started.mode}`);
  check('it starts on level one', started.level === 1, `level ${started.level}`);

  // --- ride it to the line -----------------------------------------------
  const finished = await page.evaluate(async () => {
    const N = window.NEON;
    const seen = {
      checkpoints: 0, gatesArmed: 0, speedSum: 0, speedSamples: 0, topSpeed: 0,
      // THE LEVEL BOUNDARY, caught as it happens. Both of these are only true
      // for a frame or two: the banner fades itself out and the phase never
      // changes, so a check that looked afterwards would find no evidence a
      // level boundary had ever occurred - which is exactly the property the
      // boundary is supposed to have, and exactly why it has to be watched.
      topLevel: 1, bannerSeen: 0, livesAtLevel2: 0, phaseAtBoundary: '',
    };
    // SAMPLED MID-RUN, not at the line. The HUD is only up while the run is
    // RUNNING and the dash stops being driven once the card is out, so a
    // reading taken at the finish is a reading of neither. Halfway is also
    // where the two distances are furthest apart in absolute terms, which is
    // where a readout showing the wrong one is easiest to catch.
    const mid = { speed: 0, dial: 0, travelled: 0, odo: 0, hud: '', stats: '' };
    const began = performance.now();
    await new Promise((resolve) => {
      const tick = () => {
        seen.checkpoints = Math.max(seen.checkpoints, N.session.stage.checkpoints);
        if (N.checkpointGate.armed || N.finishGate.armed) seen.gatesArmed = 1;

        const level = N.session.levels.level;
        if (level > seen.topLevel) {
          seen.topLevel = level;
          seen.livesAtLevel2 = N.session.lives;
          // THE RUN MUST NOT HAVE STOPPED. This is the whole requirement of a
          // level boundary in one assertion: on the frame the level changed,
          // the phase is still `running` and the loop is not paused.
          seen.phaseAtBoundary = N.session.phase + (N.loop.paused ? '+paused' : '');
        }
        const banner = document.querySelector('.level-banner');
        if (banner && !banner.hidden) seen.bannerSeen = 1;
        const speed = N.loop.state.speed || 0;
        seen.speedSum += speed;
        seen.speedSamples++;
        seen.topSpeed = Math.max(seen.topSpeed, speed);
        if (!mid.speed && N.session.stage.travelled > N.config.stage.length * 0.5) {
          mid.speed = speed;
          mid.dial = N.rider.instruments._shown.speed;
          mid.travelled = N.session.stage.travelled;
          mid.odo = N.loop.state.distance || 0;
          mid.hud = document.querySelector('.hud-stage')?.textContent || '';
          mid.stats = document.querySelector('.stats-overlay')?.textContent || '';
        }
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
      medal: N.session.levels.medals[N.session.levels.medals.length - 1],
      medals: N.session.levels.medals.slice(),
      levelCount: N.config.levels.count,
      total: N.session.levels.total,
      unbroken: N.session.levels.unbroken,
      topLevel: seen.topLevel,
      bannerSeen: seen.bannerSeen,
      livesAtLevel2: seen.livesAtLevel2,
      phaseAtBoundary: seen.phaseAtBoundary,
      lives: N.session.lives,
      length: N.config.stage.length,
      maxSpeed: N.config.player.bike.maxSpeed,
      odo: N.loop.state.distance || 0,
      meanSpeed: seen.speedSamples ? seen.speedSum / seen.speedSamples : 0,
      topSpeed: seen.topSpeed,
      mid,
      statsInterval: N.config.stats.updateInterval,
      toKmh: N.config.player.rider.instruments.speed.toKmh,
      step: N.config.player.rider.instruments.speed.step,
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

  // ============ THE LEVEL BOUNDARY, WHICH MUST NOT BE AN EVENT ==========
  //
  // Everything here is about the boundary being invisible to the machinery:
  // the level goes up, a life comes back and a banner appears, and NOTHING
  // ELSE happens. The moment a boundary starts pausing the loop or changing
  // the phase it has become a card with no button, which is the build this
  // feature exists to not be.
  check('the run reaches the second level', finished.topLevel === finished.levelCount,
    `reached level ${finished.topLevel} of ${finished.levelCount}`);
  check('the run never stops at a level boundary', finished.phaseAtBoundary === 'running',
    `phase was "${finished.phaseAtBoundary}" on the frame the level changed`);
  check('a banner marks the level', finished.bannerSeen === 1,
    finished.bannerSeen ? '' : 'the level banner never appeared');
  // Three lives is the cap and the run starts there, so a clean short run
  // cannot gain one. What must be true is that the grant never EXCEEDS it.
  check('the level grant never goes over the cap',
    finished.livesAtLevel2 > 0 && finished.livesAtLevel2 <= 3,
    `${finished.livesAtLevel2} lives on entering level 2`);
  check('every level scored a medal',
    finished.medals.filter(Boolean).length === finished.levelCount,
    `${finished.medals.filter(Boolean).length} medals for ${finished.levelCount} levels`);
  // A run from level one that reached the end is unbroken, so it gets a total
  // - and the total is the sum of the levels, not one level's clock.
  check('an unbroken road gets a total', finished.unbroken && finished.total !== null,
    `unbroken ${finished.unbroken}, total ${finished.total}`);

  // ============ DO THE THREE NUMBERS ADD UP? ============================
  //
  // A finish reports a distance and a time, and a player reads a speed off
  // the dial while doing it. Those three are one statement about the world
  // and they have to agree. They did not: the results card said 28.0 s for a
  // five kilometre stage while the overlay said `dist 12391` and the dial
  // said 146, which is three different rides. Neither the distance nor the
  // clock was at fault - the overlay was printing the LIFETIME odometer and
  // the dial was printing metres per second under a kilometres-per-hour
  // label. Each of the four checks below fails on exactly one of the ways
  // that can happen again.
  const avg = finished.time > 0 ? finished.travelled / finished.time : 0;
  const mid = finished.mid;

  // 1. THE LINE IS WHERE THE STAGE SAYS IT IS. A finish that triggers late or
  // against the wrong counter shows up here first. One frame at full speed is
  // about four metres, so the tolerance is a frame's worth and no more.
  check('the finish triggers at the stage length',
    Math.abs(finished.travelled - finished.length) <= finished.maxSpeed * 0.05,
    `finished at ${finished.travelled.toFixed(1)} of ${finished.length}`);

  // 2. THE AVERAGE SPEED IS ONE THE BIKE CAN ACTUALLY DO. This is the check
  // that catches the reported fault outright, and it is deliberately the
  // crudest of them: 12391 units in 28 s is 442 m/s against a ceiling of 235,
  // so a distance and a clock belonging to different things cannot both
  // survive it whatever labels they are wearing.
  check('the average speed is physically possible',
    avg > 0 && avg <= finished.maxSpeed,
    `${finished.travelled.toFixed(0)} m in ${finished.time.toFixed(2)} s `
    + `is ${avg.toFixed(1)} m/s, ceiling ${finished.maxSpeed}`);

  // ...and that it is the speed the bike was actually seen doing. The sampled
  // mean is per FRAME and the average is per SECOND, so they are not the same
  // mean and are not expected to match exactly; ten per cent is far tighter
  // than any unit error and far looser than that difference.
  const meanGap = Math.abs(avg - finished.meanSpeed) / Math.max(finished.meanSpeed, 1e-6);
  check('distance over time matches the speed the bike was doing', meanGap <= 0.10,
    `${avg.toFixed(1)} m/s from distance and clock against a sampled mean of `
    + `${finished.meanSpeed.toFixed(1)} m/s, ${(meanGap * 100).toFixed(1)}% apart`);

  // 3. THE DIAL AGREES WITH BOTH. It reads km/h and the physics carries m/s,
  // so the only correct relationship between them is the conversion. Printing
  // the raw number under a KM/SA label is precisely what this fails on, and
  // it is what the dash did for the whole of the stage's first life.
  const expectedDial = Math.round(mid.speed * finished.toKmh / finished.step) * finished.step;
  check('the dial reads the same speed in km/sa',
    mid.speed > 0 && mid.dial === expectedDial,
    `${mid.speed.toFixed(1)} m/s should show ${expectedDial}, the dash shows ${mid.dial}`);

  // 4. THE READOUTS SHOW THE STAGE'S METRES, NOT THE WORLD'S. This is the one
  // that would have caught the report as filed. The odometer and the stage
  // are both live, both in metres, and differ by wherever the bike happened
  // to be when the run began; the readouts have to be showing the second one.
  //
  // COMPARED WITH A TOLERANCE, not exactly. The HUD is rewritten every frame
  // but the overlay refreshes on `stats.updateInterval`, so at 235 m/s its
  // text can be a hundred metres behind the live value and still be correct.
  // The tolerance is what that staleness is worth; it is nowhere near wide
  // enough to let the odometer through, which is the thing being excluded.
  const stale = finished.maxSpeed * (finished.statsInterval + 0.1);
  const gap = mid.odo - mid.travelled;
  check('the odometer and the stage are far enough apart to tell apart', gap > stale,
    `they differ by ${gap.toFixed(1)} m, against a staleness allowance of `
    + `${stale.toFixed(0)} m`);

  const hudNumbers = numbersIn(mid.hud);
  check('the HUD shows progress through the stage',
    mid.hud.includes(' / ' + finished.length)
      && hudNumbers.some((n) => Math.abs(n - mid.travelled) <= stale),
    `expected about ${Math.round(mid.travelled)} / ${finished.length}, `
    + `HUD reads "${mid.hud.trim()}"`);
  check('the HUD is not showing the odometer',
    !hudNumbers.some((n) => Math.abs(n - mid.odo) <= stale),
    `HUD reads "${mid.hud.trim()}" with the odometer at ${Math.round(mid.odo)}`);

  const odoLine = mid.stats.split(String.fromCharCode(10))
    .find((line) => line.startsWith('odo ')) || '';
  check('the stats overlay calls the odometer an odometer',
    !!odoLine && !mid.stats.includes('dist '),
    `overlay reads "${odoLine.trim()}"`);
  const stageLine = mid.stats.split(String.fromCharCode(10))
    .find((line) => line.startsWith('stage ')) || '';
  check('the stats overlay shows the stage separately',
    stageLine.includes(' / ' + finished.length)
      && numbersIn(stageLine).some((n) => Math.abs(n - mid.travelled) <= stale),
    stageLine ? `overlay reads "${stageLine.trim()}"` : 'no stage line in the overlay');

  console.log('  the run: %s m in %s s = %s m/s = %s km/sa average, top %s km/sa',
    finished.travelled.toFixed(0), finished.time.toFixed(2), avg.toFixed(1),
    Math.round(avg * finished.toKmh), Math.round(finished.topSpeed * finished.toKmh));

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

/**
 * Every integer in a readout, so a check can ask what a line SAYS rather than
 * having to reproduce how it is punctuated. A HUD that changes its separator
 * is a HUD that has been restyled, not one that has started lying.
 * @param {string} text
 * @returns {number[]}
 */
function numbersIn(text) {
  return (text.match(/[0-9]+/g) || []).map(Number);
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
