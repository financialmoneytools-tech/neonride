/**
 * Is everything beside the road standing ON something?
 *
 *     node tools/grounded-check.mjs        # npm run grounded
 *
 * ================= WHY =================
 *
 * Reported from a phone, on Sunset Highway: "flat orange polygons hang in
 * mid-air above the horizon, unidentifiable as anything" and "mountains sit
 * above the ground with a visible gap".
 *
 * The props were never misplaced. world/Scenery.js puts every origin on the
 * path's own height and world/scenery/props.js builds every prop with its base
 * at that origin. What was missing was the GROUND: there was a road ribbon
 * about twenty metres across and, beyond its rim, the sky dome. Every road was
 * a strip of tarmac in the sky and everything beside it hung in the same sky.
 * It went unseen for as long as every sky was black - a boulder floating in
 * black night is a boulder at night - and Sunset Highway's lit horizon made it
 * obvious in one frame.
 *
 * So this asks three questions that together mean "there is a world here":
 *
 *   1. THE GROUND EXISTS and reaches past the furthest thing standing on it.
 *   2. EVERY PROP'S BASE IS ON OR IN IT. Read from the instance matrices that
 *      are actually on the GPU and the geometry's own bounding box - not from
 *      the placement code, which is what was already believed to be correct.
 *   3. EVERY MOUNTAIN RIDGE REACHES BELOW IT, so a ridge emerges from the
 *      ground rather than hovering over it.
 *
 * BELOW the terrain is fine and is often right: a boulder sits a quarter of
 * its depth into the ground because one resting exactly on a plane reads as
 * dropped there. Only ABOVE is a failure.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 1280, height: 720 };

/**
 * `--prove` breaks the world on purpose and expects this tool to say so.
 *
 * A check that has never failed is not a check, and the two assertions here
 * are exactly the kind that can be quietly inert - both were written after the
 * fault they describe had already been fixed, so a green run proves nothing
 * about whether they can go red. With this flag the ground is hidden and every
 * scenery instance is lifted five units, and the run is expected to FAIL. It
 * exits 0 only when it does.
 *
 * Measured: 1 road, 272 instances, all 272 reported floating at 5.03.
 */
const PROVE = process.argv.includes('--prove');

// How far a base may sit above the terrain before it is floating. The ground
// is sunk `world.ground.sink` below the path so the carriageway wins its own
// pixels, so a prop standing exactly on the path is already this far up by
// design. A tenth of a unit on top of it covers the difference between a
// straight-line ground row and the curve it samples.
const TOLERANCE = 0.25;

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
/**
 * `detail` is what went WRONG and is printed only when something did. Every
 * other tool in here has made the same mistake at least once - a PASS line
 * reading "the ground is off or missing" is worse than no line at all.
 */
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  - ' + detail}`);
  if (!ok) failures.push(`${name}: ${detail}`);
}

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });

const probe = await browser.newPage({ viewport: SIZE });
await probe.goto(server.url + '?god=1', { waitUntil: 'load' });
await probe.waitForFunction(() => window.NEON, null, { timeout: 20000 });
const roads = await probe.evaluate(() => Object.keys(window.NEON.config.themes));
await probe.close();

/**
 * Reads every live scenery instance off the GPU buffers and measures its base
 * against the ground under it.
 * @param {string} road
 */
async function measure(road) {
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`${road}: page error ${e.message}`));
  await page.goto(server.url + '?god=1&stats=0&theme=' + road, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON && window.NEON.bike, null, { timeout: 20000 });
  // Long enough that the chunk pool has recycled at least once, so the
  // instances measured are ones that were RE-placed rather than only the ones
  // laid down at build time.
  await page.waitForTimeout(9000);

  if (PROVE) {
    await page.evaluate(() => {
      const N = window.NEON;
      N.ground.mesh.visible = false;
      for (const kind of N.scenery.kinds) {
        const array = kind.mesh.instanceMatrix.array;
        for (let i = 0; i < kind.mesh.count; i++) array[i * 16 + 13] += 5;
        kind.mesh.instanceMatrix.needsUpdate = true;
      }
    });
  }

  return page.evaluate((tolerance) => {
    const N = window.NEON;
    const THREE = N.engine.three || null;
    const ground = N.ground;
    const kinds = [];
    let worst = null;
    let floating = 0;
    let counted = 0;

    // A matrix is sixteen numbers; the pieces needed here are the translation
    // (elements 12, 13, 14) and the Y scale, which is the length of the
    // second basis column. Read directly rather than through Matrix4.decompose
    // so this makes no assumption about how Scenery composed it.
    const yScaleOf = (e, at) => Math.hypot(e[at + 4], e[at + 5], e[at + 6]);

    for (const kind of N.scenery.kinds) {
      const mesh = kind.mesh;
      if (!mesh.visible) continue;
      const geometry = kind.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const localBase = geometry.boundingBox.min.y;
      const array = mesh.instanceMatrix.array;
      let kindWorst = null;
      let kindLive = 0;

      for (let i = 0; i < mesh.count; i++) {
        const at = i * 16;
        const x = array[at + 12];
        const y = array[at + 13];
        const z = array[at + 14];
        // Parked instances are flung a million units away; they are not in
        // the world and must not be judged as though they were.
        if (Math.abs(x) > 100000 || Math.abs(z) > 100000) continue;
        kindLive++;
        counted++;

        const base = y + localBase * yScaleOf(array, at);
        // The path runs down -Z from the origin, so distance along it is -z.
        // Close enough for a height: the road's lateral swing is 70 units
        // against an elevation wavelength of 1500.
        const terrain = ground.heightAt(-z);
        const above = base - terrain;
        if (kindWorst === null || above > kindWorst.above) {
          kindWorst = { above, base, terrain, z };
        }
        if (above > tolerance) floating++;
      }

      if (!kindLive) continue;
      kinds.push({
        name: kind.name,
        live: kindLive,
        localBase,
        above: kindWorst ? kindWorst.above : 0,
      });
      if (kindWorst && (worst === null || kindWorst.above > worst.above)) {
        worst = { ...kindWorst, kind: kind.name };
      }
    }

    // The ground itself: does it exist, is it on, and does it reach past the
    // furthest thing that is meant to be standing on it?
    const cfg = N.config.world;
    const layers = cfg.mountains.enabled ? cfg.mountains.layers : [];
    const reach = layers.length ? Math.max(...layers.map((l) => l.distance)) : 0;

    // Every ridge has to start below the ground, or it hovers over it.
    const ridgeBase = cfg.mountains.baseY;
    const groundAtRider = ground.heightAt(N.loop.state.distance || 0);

    return {
      kinds,
      counted,
      floating,
      worst,
      groundOn: !!(ground && ground.mesh.visible),
      halfWidth: cfg.ground.halfWidth,
      mountainReach: reach,
      ridgeBase,
      groundAtRider,
      unused: THREE ? 1 : 0,
    };
  }, TOLERANCE);
}

console.log('');
console.log('  road              props   floating   worst base above terrain');
const rows = {};
for (const road of roads) {
  const r = await measure(road);
  rows[road] = r;
  console.log('  %s  %s   %s     %s',
    road.padEnd(16),
    String(r.counted).padStart(5),
    String(r.floating).padStart(8),
    r.worst ? `${r.worst.above.toFixed(3)} (${r.worst.kind})` : 'no scenery');
}

console.log('');
for (const road of roads) {
  const r = rows[road];
  if (!r) continue;

  check(`${road}: the ground is there`, r.groundOn,
    'world/Ground.js is off or missing, so everything beside the road is in the sky');

  check(`${road}: the ground reaches past the furthest ridge`,
    r.halfWidth >= r.mountainReach,
    `ground reaches ${r.halfWidth} and the outer ridge is at ${r.mountainReach}, `
    + 'so the ridge stands beyond the edge of the world');

  check(`${road}: every ridge starts below the ground`,
    r.ridgeBase < r.groundAtRider - 1,
    `ridges start at y ${r.ridgeBase} and the ground under the rider is at `
    + `${r.groundAtRider.toFixed(2)}`);

  check(`${road}: no prop floats`, r.floating === 0,
    r.worst
      ? `${r.floating} of ${r.counted} instances are above the terrain, worst `
        + `${r.worst.above.toFixed(3)} on ${r.worst.kind} (base ${r.worst.base.toFixed(2)}, `
        + `terrain ${r.worst.terrain.toFixed(2)})`
      : `${r.floating} of ${r.counted}`);
}

// PER KIND, reported rather than asserted. props.js promises every prop's
// origin is at its base; a kind whose geometry starts well above zero is
// either breaking that promise or is meant to be off the ground, and either
// way it is worth seeing in a table rather than discovering in a screenshot.
console.log('');
console.log('  the shape of each kind  (local base = lowest point of the geometry, origin at 0)');
const seen = new Set();
for (const road of roads) {
  for (const kind of (rows[road] ? rows[road].kinds : [])) {
    const key = `${kind.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log('  %s  local base %s', kind.name.padEnd(12), kind.localBase.toFixed(3).padStart(7));
  }
}

await browser.close();
server.child.kill();

console.log('');
if (PROVE) {
  // Inverted: the world was broken deliberately, so silence is the failure.
  if (failures.length) {
    console.log(`--prove: the check bites - ${failures.length} failure(s) on a broken world`);
    process.exit(0);
  }
  console.log('--prove FAILED: the ground was hidden and every prop lifted five '
    + 'units, and this tool reported nothing. It is not checking anything.');
  process.exit(1);
}
if (failures.length) {
  console.log(`${failures.length} failure(s)`);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}
console.log('grounded-check: every road has a floor and everything is standing on it');
process.exit(0);
