/**
 * Are the levels actually getting harder? Measured in crashes, not seconds.
 *
 *     node tools/difficulty-check.mjs           # npm run difficulty
 *     node tools/difficulty-check.mjs --quick   # 1500 m a level
 *
 * ================= WHY THE CLOCK COULD NOT ANSWER THIS =================
 *
 * `referenceSeconds` is measured with the shipped autopilot and the table is
 * FLAT: two per cent from level one to level ten, against a density that
 * nearly doubles. That is not the levels failing; it is the instrument. The
 * shipped bot has perfect information, weaves rather than lifting, and has
 * autopilot/Guard.js behind it making collisions impossible. Twice the
 * traffic costs it almost no time and exactly no crashes.
 *
 * Difficulty in this game is paid in CRASHES. Three of them end a run, and
 * what a harder level takes from a rider is lives, not seconds. So the number
 * that has to rise from level one to level ten is crashes per kilometre, and
 * measuring it needs something that can crash.
 *
 * ================= THE NOVICE =================
 *
 * `config.autopilot.novice` is deliberately mediocre in the four ways a
 * person is: it reacts late, sees less far ahead, will not thread a tight
 * gap, and has no guard. The last is the point - with the guard on this
 * reports zero at every level by construction.
 *
 * IT IS THE SAME BOT OTHERWISE. The novice is a patch over the shipped
 * autopilot rather than a second one, so the difference between the two is
 * exactly the list in config and cannot drift.
 *
 * ================= READING THE RESULT =================
 *
 * The absolute rate means little - it is whatever the novice's reaction time
 * makes it. The SHAPE is the result: level ten should cost meaningfully more
 * crashes per kilometre than level one, on both roads. If it does not, the
 * curve is not doing anything and the density numbers are decoration.
 *
 * Crashes are counted from `state.hits`, which latches per vehicle per pass -
 * one contact is one hit however many frames it lasts. Lives are raised out
 * of the way so a bad level runs to its end instead of ending the run.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 1280, height: 720 };
const QUICK = process.argv.includes('--quick');
const LEVEL_LENGTH = QUICK ? 1500 : 5000;
// Repeats per level. Crashes are rare events and one pass over five
// kilometres is a small sample, so each level is ridden more than once and
// the rates are pooled. Without this the table is noise with a trend in it.
const PASSES = Number(process.env.DIFFICULTY_PASSES || (QUICK ? 2 : 3));

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

/**
 * Rides every level on one road with the novice, several times each.
 * @param {string} road a theme key
 */
async function rideRoad(road) {
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`${road}: page error ${e.message}`));
  await page.goto(`${server.url}?theme=${road}&stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(SIZE.width - 40, 40);
  await page.waitForTimeout(700);

  return page.evaluate(async ({ length, roadName, passes }) => {
    const N = window.NEON;
    N.config.stage.length = length;
    N.config.stage.checkpointEvery = Math.max(200, Math.round(length / 5));
    // FULL DIFFICULTY FROM THE FIRST METRE, or a short level would spend
    // itself ramping and every level would measure the same road.
    N.config.levels.rampMeters = 1;
    // Lives out of the way. A level that crashes the novice nine times has to
    // run to its end and report nine, not end the run at three and report a
    // rate measured over a third of the distance.
    N.config.game.crashesAllowed = 9999;
    N.selection.setMode('stage');
    N.selection.setRoad(roadName);
    N.config.autopilot.enabled = true;
    N.setNovice(true);

    const rows = [];
    for (let level = 1; level <= N.config.levels.count; level++) {
      let hits = 0;
      let metres = 0;
      let seconds = 0;

      for (let pass = 0; pass < passes; pass++) {
        N.beginRun(level);
        // Settle: let the pools fill at this level's density before counting,
        // so the opening of a run is not scored as an easy stretch.
        await new Promise((r) => setTimeout(r, 1500));

        const startHits = N.loop.state.hits || 0;
        const startDistance = N.loop.state.distance || 0;
        const startTime = N.loop.state.elapsed;

        await new Promise((resolve) => {
          const guard = performance.now();
          const tick = () => {
            if (performance.now() - guard > 120000) return resolve();
            // Only this level. `beginRun(level)` starts AT the level, so the
            // run advances past it the moment it finishes - which would pool
            // level four's crashes into level three's row.
            if (N.session.levels.level !== level) return resolve();
            if (N.session.phase !== 'running') return resolve();
            requestAnimationFrame(tick);
          };
          tick();
        });

        hits += (N.loop.state.hits || 0) - startHits;
        metres += (N.loop.state.distance || 0) - startDistance;
        seconds += N.loop.state.elapsed - startTime;
      }

      rows.push({ level, hits, metres, seconds });
    }

    N.setNovice(false);
    return {
      rows,
      reaction: N.config.autopilot.novice.reactionSeconds,
      count: N.config.levels.count,
    };
  }, { length: LEVEL_LENGTH, roadName: road, passes: PASSES });
}

const roads = await (async () => {
  const page = await browser.newPage({ viewport: SIZE });
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  const names = await page.evaluate(() => Object.keys(window.NEON.config.themes));
  await page.close();
  return names;
})();

const perRoad = {};
for (const road of roads) {
  console.log('');
  console.log(`=== ${road} ===  novice bot, ${PASSES} pass(es) a level`);

  // ONE ROAD'S FAILURE MUST NOT TAKE THE OTHER'S DATA WITH IT. A ten minute
  // run once lost its second road to "Execution context was destroyed" - a
  // page navigation under load - and threw away the first road's table on the
  // way out. The numbers already gathered are worth more than a clean exit.
  let result;
  try {
    result = await rideRoad(road);
  } catch (error) {
    failures.push(`${road}: ride failed - ${error.message}`);
    console.log(`  FAILED: ${error.message}`);
    continue;
  }
  perRoad[road] = result;

  console.log('  lvl   crashes   km ridden   crashes / km');
  for (const row of result.rows) {
    const km = row.metres / 1000;
    console.log('  %s   %s   %s   %s',
      String(row.level).padStart(3),
      String(row.hits).padStart(7),
      km.toFixed(2).padStart(9),
      (km > 0 ? row.hits / km : 0).toFixed(2).padStart(12));
  }
}

// ===================== THE SHAPE =====================
console.log('');
console.log('CRASHES PER KILOMETRE  (novice bot, no guard, reaction %s s)',
  Object.values(perRoad)[0] ? Object.values(perRoad)[0].reaction : '-');
const count = Object.values(perRoad)[0] ? Object.values(perRoad)[0].count : 0;
// Only the roads that actually produced a table, so a lost road is absent
// from the comparison rather than silently pooled in as a column of zeroes.
const ridden = roads.filter((road) => perRoad[road]);
const header = ['  lvl'];
for (const road of ridden) header.push(road.padStart(14));
header.push('        pooled');
console.log(header.join(''));

const pooled = [];
for (let i = 0; i < count; i++) {
  const line = ['  ' + String(i + 1).padStart(3)];
  let hits = 0;
  let km = 0;
  for (const road of ridden) {
    const row = perRoad[road].rows[i];
    const roadKm = row.metres / 1000;
    hits += row.hits;
    km += roadKm;
    line.push((roadKm > 0 ? row.hits / roadKm : 0).toFixed(2).padStart(14));
  }
  const rate = km > 0 ? hits / km : 0;
  pooled.push(rate);
  line.push(rate.toFixed(2).padStart(14));
  console.log(line.join(''));
}

// EARLY AGAINST LATE, not level one against level ten. Two single levels are
// two samples and crashes are rare; thirds of the curve is what there is
// enough data to say anything about.
const third = Math.max(1, Math.floor(pooled.length / 3));
const early = pooled.slice(0, third);
const late = pooled.slice(-third);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const earlyRate = mean(early);
const lateRate = mean(late);
const rise = earlyRate > 0 ? (lateRate - earlyRate) / earlyRate : (lateRate > 0 ? Infinity : 0);

console.log('');
console.log('  first %s levels: %s crashes/km', third, earlyRate.toFixed(2));
console.log('  last  %s levels: %s crashes/km', third, lateRate.toFixed(2));
console.log('  rise: %s%%', (rise * 100).toFixed(0));

// THE WHOLE POINT OF THE TOOL. If the late levels do not cost meaningfully
// more crashes than the early ones, the curve is decoration.
check('the levels get harder from the first third to the last',
  rise >= 0.30,
  `${earlyRate.toFixed(2)} -> ${lateRate.toFixed(2)} crashes/km, ${(rise * 100).toFixed(0)}% rise`);

// And the novice has to be crashing at all - a zero everywhere means the
// guard is still on, or the lag is not being applied, and the table is not
// measuring what it says.
const crashing = pooled.some((r) => r > 0);
check('the novice actually crashes', crashing,
  crashing ? '' : 'every level reported zero crashes - is the guard still on?');

await browser.close();
server.child.kill();

console.log('');
if (failures.length) {
  console.log(`${failures.length} failure(s)`);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}
console.log('difficulty-check: the levels cost more the further in they are');
process.exit(0);
