/**
 * Ten levels: how long each one takes, and whether any of them is unfair.
 *
 *     node tools/level-check.mjs           # npm run levels
 *     node tools/level-check.mjs --quick   # 1200 m a level, for a fast pass
 *
 * ================= 1. THE REFERENCE TIMES =================
 *
 * Every level's medal is a multiple of that level's own measured time, so
 * there are ten references and they have to be measured rather than guessed.
 *
 * MEASURED FROM A REAL STAGED RUN. The autopilot steers - so there are no
 * collisions and the line is the same every time - but the SESSION is an
 * ordinary staged run, which means the level's own traffic model, its own
 * gates and its own clock. This is why world/Traffic.js picks its model from
 * the run rather than from `config.autopilot.enabled`: a bot driving the god
 * model would be measuring a road nobody plays.
 *
 * ================= 2. FAIR, WHICH IS NOT THE SAME AS EASY ==============
 *
 * config/levels.js promises that the escape guarantee, the no-walls rule and
 * the speed aware spacing hold identically at level ten. Measuring that
 * turned up something worth writing down rather than asserting around:
 *
 *   THE GUARANTEE IS A PLACEMENT FILTER, NOT AN INVARIANT. `Traffic._admits`
 *   runs once, when a vehicle respawns. Nothing maintains spacing afterwards,
 *   so two vehicles in one lane close at their speed difference and end up
 *   inside each other. Measured in ENDLESS mode on a build with no levels in
 *   it at all: 1402 overlapping same-lane pairs over 421 frames, worst edge
 *   gap -10.74 m, four lanes abreast seen. That is the shipped game, not
 *   something levels introduced.
 *
 * So this check does three separate things, and only the first is a failure:
 *
 *   HARD     no overlapping pairs, anywhere, ever - zero tolerance, and
 *            tools/spacing-check.mjs is the fast permanent version of it.
 *   HARD     the rider always has a FREE CORRIDOR: somewhere across the
 *            carriageway, inside their reaction distance, wide enough to fit
 *            a bike. That is what "never unfair" means and it is measured
 *            laterally, because the bike rides between lanes as often as in
 *            them - see tools/traffic-scan.mjs for why counting occupied
 *            lanes was the wrong test and what it did instead.
 *   REPORTED how crowded each level got, and the lane-count proxy, so a level
 *            getting busier is visible without being a pass or a fail.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { SCAN_SOURCE, rates } from './traffic-scan.mjs';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 1280, height: 720 };
const QUICK = process.argv.includes('--quick');
// A full pass is ten levels of five kilometres per road, about four and a half
// minutes of riding each. --quick SHORTENS the levels rather than skipping
// any: all ten still run with their own traffic, so the floor is still checked
// on every one of them. The density ramp is shortened with them, or a 1200 m
// level would spend all of itself ramping and never reach its own difficulty.
const LEVEL_LENGTH = QUICK ? 1200 : 5000;
const RAMP = Math.round(1000 * (LEVEL_LENGTH / 5000));

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
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`);
  if (!ok) failures.push(`${name}: ${detail}`);
}

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });

/** Dismisses the title card, away from the centre where the toggle sits. */
async function open(road) {
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`${road}: page error ${e.message}`));
  await page.goto(`${server.url}?theme=${road}&stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(SIZE.width - 40, 40);
  await page.waitForTimeout(700);
  return page;
}

/**
 * THE CONTROL. Endless mode on the same build: the player traffic model with
 * the escape guarantee on and no levels at all. Everything the levels are
 * compared against comes from here rather than from a number written down
 * once, so the comparison stays true as the shared model changes.
 * @param {string} road
 * @param {number} seconds
 */
async function rideEndless(road, seconds) {
  const page = await open(road);
  const result = await page.evaluate(async ({ src, ms }) => {
    const N = window.NEON;
    eval(src);
    N.selection.setMode('endless');
    // PINNED AT ITS CAP. The shipped model ramps to `density.max` over sixteen
    // kilometres, which is about ninety seconds of riding - so a control that
    // simply started and waited would be measuring the opening of a run and
    // calling it the baseline. What the levels have to be compared against is
    // the hardest the game has ever been, which is this model at its cap.
    N.config.world.traffic.models.player.density.start =
      N.config.world.traffic.models.player.density.max;
    // Steering only. NOT main.js's setAutopilot, which also calls
    // `session.free()` - correct for a recording, wrong here.
    N.config.autopilot.enabled = true;
    N.beginRun(1);
    await new Promise((r) => setTimeout(r, 4000));
    // eslint-disable-next-line no-undef
    const scan = makeScan(N);
    await new Promise((done) => {
      const until = performance.now() + ms;
      const tick = () => {
        scan.sample();
        if (performance.now() >= until) done();
        else requestAnimationFrame(tick);
      };
      tick();
    });
    return { level: N.loop.state.level, ...scan.snapshot() };
  }, { src: SCAN_SOURCE, ms: seconds * 1000 });
  await page.close();
  return result;
}

/**
 * Drives one road from level 1 to level 10 and reports every level.
 * @param {string} road a theme key
 */
async function rideRoad(road) {
  const page = await open(road);
  const result = await page.evaluate(async ({ src, length, ramp, roadName }) => {
    const N = window.NEON;
    eval(src);
    N.config.stage.length = length;
    N.config.stage.checkpointEvery = Math.max(200, Math.round(length / 5));
    N.config.levels.rampMeters = ramp;
    N.selection.setMode('stage');
    N.selection.setRoad(roadName);
    N.config.autopilot.enabled = true;
    N.beginRun(1);

    const levels = [];
    // eslint-disable-next-line no-undef
    let scan = makeScan(N);

    await new Promise((resolve) => {
      let level = 1;
      const guard = performance.now();
      const record = () => levels.push({
        level,
        seconds: N.session.levels.times[level - 1],
        ...scan.snapshot(),
      });
      const tick = () => {
        // Bailing out rather than hanging: a run that stops advancing is a
        // failure to report, not a test that never finishes.
        if (performance.now() - guard > 1200000) return resolve();
        if (N.session.phase !== 'running') {
          if (N.session.phase === 'finished') record();
          return resolve();
        }
        scan.sample();
        const now = N.session.levels.level;
        if (now !== level) {
          record();
          // eslint-disable-next-line no-undef
          scan = makeScan(N);
          level = now;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });

    return {
      levels,
      phase: N.session.phase,
      total: N.session.levels.total,
      configured: N.config.levels.referenceSeconds.slice(),
      floor: { ...N.config.levels.floor },
      count: N.config.levels.count,
      lanes: N.traffic.lanes.length,
      scale: length / 5000,
    };
  }, { src: SCAN_SOURCE, length: LEVEL_LENGTH, ramp: RAMP, roadName: road });
  await page.close();
  return result;
}

const roadNames = await (async () => {
  const page = await browser.newPage({ viewport: SIZE });
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  const names = await page.evaluate(() => Object.keys(window.NEON.config.themes));
  await page.close();
  return names;
})();

// ===================== THE CONTROL, FIRST =====================
console.log('');
console.log('ENDLESS CONTROL  (player model at its density cap, escape on, no levels)');
const control = await rideEndless(roadNames[0], QUICK ? 12 : 25);
const controlRate = rates(control);
console.log('  %s frames   no corridor %s   four abreast %s   lanes full %s   overlaps %s/frame',
  control.frames,
  (controlRate.noCorridor * 100).toFixed(2) + '%',
  (controlRate.fourAbreast * 100).toFixed(1) + '%',
  (controlRate.trapped * 100).toFixed(1) + '%',
  controlRate.overlaps.toFixed(2));
check('endless always leaves a way through', control.noCorridor === 0,
  `no corridor on ${control.noCorridor} of ${control.frames} frames`);
console.log('  worst: %s lanes abreast, %s trucks abreast, closest edge gap %s m',
  control.maxAbreast, control.maxTrucksAbreast,
  control.minEdgeGap === null ? '-' : control.minEdgeGap.toFixed(1));

const perRoad = {};
for (const road of roadNames) {
  console.log('');
  console.log(`=== ${road} ===`);
  const result = await rideRoad(road);
  perRoad[road] = result;

  check(`${road}: the road is ridden to the end`,
    result.phase === 'finished' && result.levels.length === result.count,
    `phase ${result.phase}, ${result.levels.length} of ${result.count} levels`);

  console.log('  lvl    time   no corridor   4-abreast   lanes full   overlaps/f  worst gap');
  for (const e of result.levels) {
    const r = rates(e);
    console.log('  %s  %s s   %s      %s      %s       %s       %s m',
      String(e.level).padStart(3),
      (e.seconds / result.scale).toFixed(2).padStart(6),
      ((r.noCorridor * 100).toFixed(2) + '%').padStart(7),
      ((r.fourAbreast * 100).toFixed(1) + '%').padStart(6),
      ((r.trapped * 100).toFixed(1) + '%').padStart(6),
      r.overlaps.toFixed(2).padStart(6),
      e.minEdgeGap === null ? '   -' : e.minEdgeGap.toFixed(1).padStart(6));
  }

  // ============ HARD: the rider always has somewhere to go ============
  const walled = result.levels.filter((e) => e.noCorridor > 0);
  check(`${road}: the rider always has a way through`,
    walled.length === 0,
    walled.map((e) => `level ${e.level} had no corridor on ${e.noCorridor} of `
      + `${e.frames} frames`).join(', '));
}

// ============ CAR FOLLOWING, WHICH IS WHY THE ABOVE PASSES ============
//
// Before it existed the guarantee was placement-only: 2400 overlapping pairs
// over 721 frames in endless mode, worst edge gap -10.7 m, and a level at a
// LOWER density than endless measured six times more crowded because a wider
// speed spread simply made the decay faster. This is the assertion that the
// invariant is actually held, and it is checked in endless mode as well as in
// the levels - an invariant that holds in one mode is not one.
console.log('');
console.log('CAR FOLLOWING  (config/traffic.js -> follow)');
console.log('  endless: %s overlapping pairs over %s frames, closest edge gap %s m',
  control.overlaps, control.frames,
  control.minEdgeGap === null ? '-' : control.minEdgeGap.toFixed(1));
// ZERO, not a rate. tools/spacing-check.mjs is the fast permanent version of
// this same rule and says why a tolerance is how a defect like this survives.
check('endless keeps its own spacing', control.overlaps === 0,
  `${control.overlaps} overlapping pairs, closest `
  + `${control.minEdgeGap === null ? '-' : control.minEdgeGap.toFixed(2)} m`);
for (const [road, result] of Object.entries(perRoad)) {
  const worst = result.levels.reduce((sum, e) => sum + e.overlaps, 0);
  const closest = Math.min(...result.levels.map((e) => (e.minEdgeGap === null ? 0 : e.minEdgeGap)));
  check(`${road}: every level keeps its own spacing`, worst === 0,
    `${worst} overlapping pairs across ten levels, closest ${closest.toFixed(2)} m`);
}

// ===================== THE REFERENCE TABLE =====================
console.log('');
console.log('REFERENCE TIMES  (autopilot, staged run, no collisions)');
const roads = Object.values(perRoad).filter((r) => r.levels.length);
const count = roads.length ? roads[0].count : 0;
const measured = [];
for (let i = 0; i < count; i++) {
  const samples = roads
    .map((r) => r.levels[i] && r.levels[i].seconds / r.scale)
    .filter((v) => Number.isFinite(v));
  measured.push(samples.reduce((a, b) => a + b, 0) / Math.max(1, samples.length));
}

const configured = roads.length ? roads[0].configured : [];
console.log('  lvl   measured   configured   drift    gold     silver');
let worstDrift = 0;
for (let i = 0; i < measured.length; i++) {
  const want = configured[i];
  const drift = want ? Math.abs(measured[i] - want) / want : 1;
  worstDrift = Math.max(worstDrift, drift);
  console.log('  %s   %s s   %s s   %s%%   %s s  %s s',
    String(i + 1).padStart(3),
    measured[i].toFixed(2).padStart(6),
    (want || 0).toFixed(2).padStart(6),
    (drift * 100).toFixed(0).padStart(4),
    (measured[i] * 1.02).toFixed(1).padStart(5),
    (measured[i] * 1.15).toFixed(1).padStart(5));
}
console.log('');
console.log('  paste into config/levels.js -> referenceSeconds:');
console.log('  [' + measured.map((v) => v.toFixed(1)).join(', ') + ']');

// The same 15 per cent rule config/stage.js has always had.
check('every level reference matches the measured time', worstDrift <= 0.15,
  `worst level is ${(worstDrift * 100).toFixed(0)}% out`);

// REPORTED, NOT ASSERTED. The autopilot has perfect information and weaves
// rather than lifting, so density costs it far less time than it costs a
// person - a flat table here does not mean the levels are not getting harder,
// it means the bot is the wrong instrument for measuring that. What the bot
// IS the right instrument for is the floor a medal is measured against, which
// is all `referenceSeconds` is for.
if (measured.length >= 2) {
  const rise = (measured[measured.length - 1] - measured[0]) / measured[0];
  console.log('  bot time from level 1 to level %s: %s%%  (expected to be small - '
    + 'the bot weaves rather than lifting)', measured.length, (rise * 100).toFixed(0));
}

await browser.close();
server.child.kill();

console.log('');
if (failures.length) {
  console.log(`${failures.length} failure(s)`);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}
console.log('level-check: ten levels ridden, nobody trapped, references measured');
process.exit(0);
