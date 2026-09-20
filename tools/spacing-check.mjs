/**
 * No two vehicles may ever be inside each other. Zero tolerance.
 *
 *     node tools/spacing-check.mjs        # npm run spacing
 *
 * ================= WHY THIS IS ITS OWN CHECK =================
 *
 * Cars drove through each other for the entire life of this project and
 * nobody caught it, because nothing ever looked. It was found by accident
 * while measuring something else, and the reports it had been generating -
 * traffic that felt wrong, a road that felt too dense - had been attributed
 * to density and tuned against for months.
 *
 * Measured before the fix, in ENDLESS mode, on a build with no levels in it:
 * 2400 overlapping same-lane pairs over 721 frames, worst edge gap -10.7 m.
 * That is not a rare glitch. That is two and a half vehicle pairs inside each
 * other in every frame of the game.
 *
 * So the rule here is ANY, not a rate and not a threshold. One overlapping
 * pair anywhere fails the run. A tolerance is how a defect like this survives:
 * it gets set just above whatever the current number is, and then the number
 * grows into it.
 *
 * ================= WHAT IT COVERS =================
 *
 * Both modes, because the invariant is in the shared traffic model and an
 * invariant that holds in one mode is not one. Every level, because the
 * difficulty curve moves the speed spread and the spacing and those are
 * exactly what stress it. Every road, because the theme mix decides how many
 * sixteen metre semis are on the road and a semi is the hardest case there is.
 *
 * THE RAMP IS SWITCHED OFF. A level normally eases into its density over the
 * first kilometre; here every level starts at its full difficulty, because
 * the worst case is the only case a zero tolerance check is interested in.
 *
 * ================= AND THE DENSITY IS CHURNED ON PURPOSE =================
 *
 * This guard once passed on all six roads while the deep check found TEN
 * overlapping pairs. That is the worst thing a fast guard can do, and the
 * reason was that it sampled a steady road: three seconds a level at a
 * constant density never crosses a POOL BOUNDARY, and crossing one was the
 * entire bug. A vehicle deactivates, keeps its distance while car following
 * ignores it, and the density ramp switches it back on wherever it was left
 * - possibly inside something.
 *
 * So the density is now driven up and down through the whole sample. Every
 * cycle deactivates a batch of vehicles and reactivates them, which is the
 * case that was invisible, and the run reports how many activation events it
 * forced so a sample that churned nothing is visible rather than silently
 * reassuring.
 *
 * It is still FAST - a few seconds a level - so it can run as often as the
 * phone probe does. Depth comes from npm run levels; this is the one that
 * must never be allowed to go red.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { SCAN_SOURCE } from './traffic-scan.mjs';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 1280, height: 720 };
// Seconds of riding sampled per mode per level. Short on purpose; the point is
// breadth across every level and both modes, and an overlap shows up within a
// second or two of one being possible at all.
const SAMPLE = Number(process.env.SPACING_SAMPLE || 3);
// ONE ROAD, for working on the check itself. A full sweep is six roads and
// twelve rides each; finding out whether a change to this file even runs
// should not cost that. SPACING_ROAD=galaxyRoad npm run spacing
const ONLY = process.env.SPACING_ROAD || '';

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
 * Samples one road across endless mode and every level, in one page.
 * @param {string} road a theme key
 */
async function sweep(road) {
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`${road}: page error ${e.message}`));
  page.on('framenavigated', (f) => {
    if (f === page.mainFrame()) console.log('  (navigated to ' + f.url() + ')');
  });
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('  (console error) ' + m.text().slice(0, 200));
  });
  await page.goto(`${server.url}?theme=${road}&stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(SIZE.width - 40, 40);
  await page.waitForTimeout(700);

  return page.evaluate(async ({ src, roadName, sampleMs }) => {
    const N = window.NEON;
    eval(src);

    // FULL DIFFICULTY FROM THE FIRST METRE. The ramp exists so a level does
    // not step under the rider; here it would only hide the hardest traffic
    // behind a kilometre this check does not ride.
    N.config.levels.rampMeters = 1;
    N.selection.setRoad(roadName);
    // Steering only - NOT setAutopilot, which would put the session in `free`
    // and take the levels away with it.
    N.config.autopilot.enabled = true;

    /**
     * Rides one configuration and returns what the traffic did.
     * @param {number} level 0 for endless
     */
    const ride = async (level, which) => {
      N.selection.setMode(level === 0 ? 'endless' : 'stage');
      N.beginRun(level === 0 ? 1 : level);

      // ================= EVERYTHING IS SET AFTER beginRun =================
      //
      // beginRun calls themeBlend.settle(), and settle writes a resolved
      // snapshot of the theme over the WHOLE of config.world - every key,
      // not just the ones a theme names. So anything this check wrote before
      // it was silently reverted before a single frame was sampled: the
      // density pin AND the model pin both. That is the same hazard
      // CLAUDE.md records for ThemeBlend, pointed the other way - there it
      // was one blend's leftovers reaching the next road, here it is a road
      // arriving on top of a measurement's setup.
      //
      // WHICH MODEL. This check turns the autopilot on to get a rider, and
      // that is the same switch that picks the god traffic model, so an
      // endless sample without this pin was the GOD road wearing the label
      // SONSUZ - and the density it churned belonged to a model nothing in
      // that run was reading. Zero activations, on every road, for as long as
      // this check has existed.
      //
      // A level always uses the level model, whoever is steering, so the pin
      // is left off there rather than lying about what was measured.
      N.config.world.traffic.forceModel = level === 0 ? which : null;
      if (level === 0) {
        // Endless ramps to its cap over sixteen kilometres. Pinned to the cap,
        // so this samples the busiest the mode ever gets rather than its
        // opening.
        const density = N.config.world.traffic.models[which].density;
        density.start = density.max;
      }

      // Let the pools fill and the density settle before anything is counted.
      await new Promise((r) => setTimeout(r, 2500));

      // WHERE THE DENSITY LIVES for whichever mode this is. A level reads its
      // own row; endless reads the shared model's start, which was pinned to
      // the cap above.
      const row = level === 0
        ? N.config.world.traffic.models[which].density
        : N.config.levels.rows[level - 1];
      // ================= CHURN THE CAP, NOT THE START =================
      //
      // `start` is where the density ramp BEGINS and it stops mattering the
      // moment the ramp saturates:
      //
      //     fraction = min(max, start + (max - start) * progress^curve)
      //
      // `progress` is the lifetime odometer over `fullAt`, and the odometer
      // runs for the whole page session across every run - so by the time
      // these endless rides happen, after ten level rides on the same page,
      // it is well past `fullAt` on both models. progress^curve is 1,
      // fraction is `max`, and swinging `start` moves nothing at all.
      // Measured on galaxyRoad: start swinging 0.35 to 1.00 with the fraction
      // flat at 1 and all 79 vehicles live for the entire sample.
      //
      // The cap works in both regimes. Saturated, fraction IS max and follows
      // it exactly; unsaturated, max is still one end of the interpolation.
      const key = level === 0 ? 'max' : 'density';
      const base = row[key];

      const countActive = () => {
        let n = 0;
        for (const fleet of N.traffic.fleets) {
          for (const v of fleet.vehicles) if (v.active) n++;
        }
        return n;
      };

      // eslint-disable-next-line no-undef
      const scan = makeScan(N);
      let activations = 0;
      let previous = countActive();
      await new Promise((done) => {
        const began = performance.now();
        const until = began + sampleMs;
        const tick = () => {
          // THE CHURN. A full cycle every 0.8 s, swinging the density between
          // 35 and 100 per cent of this level's own value - enough to switch
          // a large batch of vehicles off and back on many times inside a
          // three second sample. The peak is never ABOVE the level's real
          // density, so nothing here tests a road harder than the road is.
          const t = (performance.now() - began) / 800;
          row[key] = base * (0.675 + 0.325 * Math.sin(t * Math.PI * 2));

          scan.sample();
          const now = countActive();
          activations += Math.abs(now - previous);
          previous = now;

          if (performance.now() >= until) done();
          else requestAnimationFrame(tick);
        };
        tick();
      });
      row[key] = base;

      const shot = scan.snapshot();
      return {
        level,
        which: level === 0 ? which : null,
        frames: shot.frames,
        pairs: shot.pairs,
        overlaps: shot.overlaps,
        minEdgeGap: shot.minEdgeGap,
        noCorridor: shot.noCorridor,
        activations,
      };
    };

    const out = [];
    for (let level = 1; level <= N.config.levels.count; level++) out.push(await ride(level));
    // Endless LAST, because pinning its density mutates the shared model and
    // every staged level reads `gap.base` out of the same object.
    //
    // BOTH ENDLESS ROADS. `player` is what a rider meets in SONSUZ; `god` is
    // what a recording is made on, and it is the road the original 2400
    // overlapping pairs were measured on. The rule this file exists for is
    // that an invariant holding in one mode is not one, so both are swept.
    out.push(await ride(0, 'player'));
    out.push(await ride(0, 'god'));
    N.config.world.traffic.forceModel = null;
    return out;
  }, { src: SCAN_SOURCE, roadName: road, sampleMs: SAMPLE * 1000 });
}

const roads = await (async () => {
  const page = await browser.newPage({ viewport: SIZE });
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  const names = await page.evaluate(() => Object.keys(window.NEON.config.themes));
  await page.close();
  return ONLY ? names.filter((n) => n === ONLY) : names;
})();

let totalPairs = 0;
let totalOverlaps = 0;
let closest = Infinity;

for (const road of roads) {
  console.log('');
  console.log(`=== ${road} ===`);
  console.log('  mode        frames   pairs   activations   overlapping   closest gap   walled');
  const rows = await sweep(road);

  for (const row of rows) {
    const label = row.level === 0 ? 'SONSUZ ' + row.which : 'level ' + row.level;
    totalPairs += row.pairs;
    totalOverlaps += row.overlaps;
    if (row.minEdgeGap !== null && row.minEdgeGap < closest) closest = row.minEdgeGap;
    console.log('  %s  %s   %s   %s   %s   %s m   %s',
      label.padEnd(10),
      String(row.frames).padStart(6),
      String(row.pairs).padStart(7),
      String(row.activations).padStart(11),
      String(row.overlaps).padStart(11),
      (row.minEdgeGap === null ? '-' : row.minEdgeGap.toFixed(2)).padStart(8),
      String(row.noCorridor).padStart(6));
  }

  // A SAMPLE THAT CHURNED NOTHING PROVES NOTHING. If the density swing did
  // not actually switch vehicles on and off, this guard is back to sampling
  // a steady road and is blind to the bug it exists to catch - so that is a
  // failure in its own right rather than a quiet pass.
  const idle = rows.filter((r) => r.activations < 20);
  check(`${road}: the sample actually churned the pool`, idle.length === 0,
    idle.map((r) => `${r.level === 0 ? 'SONSUZ ' + r.which : 'level ' + r.level} saw only `
      + `${r.activations} activations`).join('; '));

  // ANY. Not a rate, not a threshold - see the header.
  const bad = rows.filter((r) => r.overlaps > 0);
  check(`${road}: no two vehicles are ever inside each other`, bad.length === 0,
    bad.map((r) => `${r.level === 0 ? 'SONSUZ ' + r.which : 'level ' + r.level} had `
      + `${r.overlaps} overlapping pairs, worst ${r.minEdgeGap.toFixed(2)} m`).join('; '));

  // The other thing a rider cannot survive, and it comes free from the same
  // sweep: a stretch with no gap wide enough to fit a bike. Same zero rule.
  const walled = rows.filter((r) => r.noCorridor > 0);
  check(`${road}: the rider always has a way through`, walled.length === 0,
    walled.map((r) => `${r.level === 0 ? 'SONSUZ ' + r.which : 'level ' + r.level} was walled `
      + `on ${r.noCorridor} of ${r.frames} frames`).join('; '));
}

await browser.close();
server.child.kill();

console.log('');
console.log('%s same-lane pairs examined across %s road(s), %s overlapping. Closest %s m.',
  totalPairs, roads.length, totalOverlaps,
  closest === Infinity ? '-' : closest.toFixed(2));

if (failures.length) {
  console.log('');
  console.log(`${failures.length} failure(s)`);
  for (const failure of failures) console.log('  - ' + failure);
  console.log('');
  console.log('A vehicle inside another vehicle is not a tuning problem. Start at');
  console.log('config/traffic.js -> follow and Traffic._maintainSpacing, and check');
  console.log('the queue is still resolved FRONT TO BACK.');
  process.exit(1);
}
console.log('spacing-check: nothing is inside anything, in either mode, at every level');
process.exit(0);
