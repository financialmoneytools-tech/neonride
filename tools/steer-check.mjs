/**
 * Can the bike reach both outer lanes, on every road?
 *
 *     node tools/steer-check.mjs        # npm run steer
 *
 * ================= WHY THIS EXISTS =================
 *
 * Reported from a phone: on three of the six roads the bike would not steer
 * LEFT at all, while right worked normally. Three roads out of six is a
 * theme problem rather than a Controls problem, and the only way to tell the
 * two apart is to take the input out of the question entirely - which is
 * what this does. It holds full lock one way, then the other, and measures
 * how far the bike actually got.
 *
 * TWO SWEEPS, AND THE SECOND ONE IS WHY THIS FILE WAS WRONG.
 *
 * The REACH sweep stubs `input.update` and writes `input.values` directly,
 * so the steer figure flows through BikePhysics exactly as a thumb would.
 * Nothing simulates the physics: a test that computed where the bike ought
 * to go would agree with itself and prove nothing.
 *
 * But writing `values` starts BELOW `Input`, so that sweep cannot see any
 * fault between a key and that value - and it passed on all six roads while
 * the game could not be steered at all. What it missed: a SelectScreen left
 * open listens for keydown on window in the CAPTURE phase and calls
 * stopPropagation on every arrow, and `Input` listens in the BUBBLE phase,
 * so the key is eaten before `Input` ever sees it. Measured on that build:
 * arrows held, `input._keys` empty, `raw.steer` 0, `lateral` 0, while
 * `update()` ran 267 times.
 *
 * So the KEYS sweep presses real arrow keys through the browser and measures
 * the same reach. It covers the whole stack - the event, the listener, the
 * smoothing, the physics - and it is the one that fails when something
 * swallows the input.
 *
 * THE CRITERION IS LANES, NOT UNITS. `world/road/layout.js` owns the lane
 * centres and the bike has to be able to sit in the outermost one on each
 * side - that is what "the road is four lanes wide" means for a rider. The
 * limit in config is 5.9 and the outer lanes are at -5.4 and 5.4, so there
 * is half a metre of margin and a road that fails this is failing by a lot.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SIZE = { width: 1280, height: 720 };
// Long enough for the bike to cross the whole carriageway and settle against
// the far limit. `lateralTau` is 0.35 s and the full width is under twelve
// metres at 13 units a second, so three seconds is ample.
const HOLD = 3.2;
/** `--flow` walks the road screen instead of using `?theme=`. */
const FLOW = process.argv.includes('--flow');
/**
 * `--prove` opens a selection screen over the running world, which is the
 * fault this check was blind to, and expects to go RED. It exits 0 only when
 * the check fails - see "Every check must be shown to fail" in CLAUDE.md.
 */
const PROVE = process.argv.includes('--prove');
/** One road, for working on the check itself. STEER_ROAD=galaxyRoad npm run steer */
const ONLY = process.env.STEER_ROAD || '';

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
 * @param {string} road a theme key
 * @param {number} index its position on the road screen
 *
 * TWO WAYS IN, and the difference between them is the point. `?theme=` fits
 * the theme as a patch before anything is built, which is the path every
 * tool has used. A PLAYER goes through the road screen, which previews each
 * card with a live ThemeBlend as it is swiped past and then starts the run -
 * a completely different sequence of writes into the same config. A fault
 * that only exists on the second path is invisible to every check that
 * takes the first, which is exactly the shape of the report here.
 */
async function sweep(road, index) {
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`${road}: page error ${e.message}`));
  page.on('framenavigated', (f) => {
    if (f === page.mainFrame()) console.log('  (' + road + ' navigated to ' + f.url() + ')');
  });
  const url = FLOW ? `${server.url}?stats=0` : `${server.url}?theme=${road}&stats=0`;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(SIZE.width - 40, 40);
  await page.waitForTimeout(700);

  let flowReady = false;
  if (FLOW) {
    flowReady = true;
    // title -> mode -> bike -> road -> level -> run, arrowing across the
    // road grid exactly as a thumb would.
    await page.click('.mode-screen .select-confirm');
    await page.waitForTimeout(400);
    await page.click('.bike-screen .select-confirm');
    await page.waitForTimeout(400);
    for (let i = 0; i < index; i++) {
      await page.click('.road-screen .select-arrow-next');
      await page.waitForTimeout(380);
    }
    await page.click('.road-screen .select-confirm');
    await page.waitForTimeout(500);
    if (await page.isVisible('.level-screen').catch(() => false)) {
      await page.click('.level-screen .select-confirm');
      await page.waitForTimeout(600);
    }
    await page.waitForFunction(() => window.NEON.session.phase === 'running',
      null, { timeout: 8000 }).catch(() => {});
  }

  // ============ THE KEYS SWEEP: A REAL KEY, THE WHOLE WAY DOWN ============
  //
  // Nothing is stubbed. The browser sends the keydown, whatever listeners are
  // attached see it in whatever order they are in, and the bike either moves
  // or it does not - which is the question a rider is actually asking.
  const byKey = await (async () => {
    if (!flowReady) {
      await page.evaluate(() => {
        window.NEON.selection.setMode('endless');
        window.NEON.beginRun(1);
      });
      await page.waitForTimeout(1200);
    }
    if (PROVE) {
      // THE BROKEN BUILD. A selection screen open over a running world is the
      // exact fault: it eats every arrow in the capture phase. If the check
      // cannot go red here it is a comment.
      await page.evaluate(() => window.NEON.selectFlow.start());
      await page.waitForTimeout(400);
    }
    const hold = async (code) => {
      await page.keyboard.down(code);
      const extreme = await page.evaluate(async ({ seconds, left }) => {
        const N = window.NEON;
        let best = N.loop.state.lateral || 0;
        await new Promise((done) => {
          const until = performance.now() + seconds * 1000;
          const tick = () => {
            const lat = N.loop.state.lateral || 0;
            if (left ? lat < best : lat > best) best = lat;
            if (performance.now() >= until) done();
            else requestAnimationFrame(tick);
          };
          tick();
        });
        return best;
      }, { seconds: HOLD, left: code === 'ArrowLeft' });
      await page.keyboard.up(code);
      await page.waitForTimeout(250);
      return extreme;
    };
    const right = await hold('ArrowRight');
    const left = await hold('ArrowLeft');
    return { left, right };
  })();

  const result = await page.evaluate(async ({ hold, flow }) => {
    const N = window.NEON;
    if (!flow) {
      N.selection.setMode('endless');
      N.beginRun(1);
    }
    await new Promise((r) => setTimeout(r, 1200));

    // THE INPUT IS TAKEN OUT OF THE QUESTION. Stubbing `update` leaves
    // `values` alone, and the loop assigns `state.input = input.values` by
    // reference - so whatever is written here is what the bike is given,
    // through the ordinary path.
    N.input.update = () => {};

    /**
     * Holds one lock and reports the extreme reached.
     * @param {number} steer -1 full left, 1 full right
     */
    const lock = async (steer) => {
      N.input.values.steer = steer;
      N.input.values.throttle = 1;
      N.input.values.brake = 0;
      let extreme = N.loop.state.lateral || 0;
      let tiltSeen = 0;
      await new Promise((done) => {
        const until = performance.now() + hold * 1000;
        const tick = () => {
          const lat = N.loop.state.lateral || 0;
          if (steer < 0 ? lat < extreme : lat > extreme) extreme = lat;
          tiltSeen = N.loop.state.input ? N.loop.state.input.steer : 0;
          if (performance.now() >= until) done();
          else requestAnimationFrame(tick);
        };
        tick();
      });
      return { extreme, steerSeen: tiltSeen };
    };

    // Right first, then left, so the left sweep starts from the far side and
    // has the whole road to cross - which is the case the report describes.
    const right = await lock(1);
    const left = await lock(-1);
    N.input.values.steer = 0;

    const lanes = N.traffic.lanes.slice();
    return {
      left: left.extreme,
      right: right.extreme,
      steerLeftSeen: left.steerSeen,
      steerRightSeen: right.steerSeen,
      limit: N.config.player.bike.lateralLimit,
      lanes,
      laneWidth: N.config.world.road.carriageway.laneWidth,
      laneCount: N.config.world.road.carriageway.lanes,
      shoulderRight: N.config.world.road.carriageway.shoulderRight,
      // Which road the game thinks it is on, which on the flow path is not
      // necessarily the one the card said.
      live: N.themes.name,
      lateralSpeed: N.config.player.bike.lateralSpeed,
      lateralTau: N.config.player.bike.lateralTau,
    };
  }, { hold: HOLD, flow: FLOW });
  await page.close();
  result.keyLeft = byKey.left;
  result.keyRight = byKey.right;
  return result;
}

const roads = await (async () => {
  const page = await browser.newPage({ viewport: SIZE });
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  const names = await page.evaluate(() => Object.keys(window.NEON.config.themes));
  await page.close();
  return ONLY ? names.filter((n) => n === ONLY) : names;
})();

console.log('');
console.log('  path: %s', FLOW ? 'THROUGH THE ROAD SCREEN' : '?theme= (patch before build)');
console.log('  road              reached left   reached right   by key L / R     outer lanes');
const rows = {};
for (let i = 0; i < roads.length; i++) {
  const road = roads[i];
  const r = await sweep(road, i);
  rows[road] = r;
  const outerLeft = r.lanes[0];
  const outerRight = r.lanes[r.lanes.length - 1];
  console.log('  %s  %s        %s        %s / %s   %s / %s',
    road.padEnd(16),
    r.left.toFixed(2).padStart(6),
    r.right.toFixed(2).padStart(6),
    r.keyLeft.toFixed(2).padStart(6),
    r.keyRight.toFixed(2),
    outerLeft.toFixed(1).padStart(5),
    outerRight.toFixed(1));
}

console.log('');
for (const road of roads) {
  const r = rows[road];
  if (!r) continue;
  const outerLeft = r.lanes[0];
  const outerRight = r.lanes[r.lanes.length - 1];
  // A little slack: the bike eases toward the limit rather than snapping to
  // it, and a tenth of a metre short of a lane centre is still in the lane.
  const slack = 0.25;
  check(`${road}: reaches the left outer lane`, r.left <= outerLeft + slack,
    `got ${r.left.toFixed(2)}, needs ${outerLeft.toFixed(2)} `
    + `(input steer was ${r.steerLeftSeen.toFixed(2)})`);
  check(`${road}: reaches the right outer lane`, r.right >= outerRight - slack,
    `got ${r.right.toFixed(2)}, needs ${outerRight.toFixed(2)} `
    + `(input steer was ${r.steerRightSeen.toFixed(2)})`);

  // AND THE SAME REACH FROM A REAL KEY. The two together say where a fault
  // is: both red is the bike or the road, only these red is everything
  // between the keyboard and `input.values` - a listener that swallows the
  // event, smoothing that never arrives, an autopilot holding the controls.
  check(`${road}: an arrow key reaches the left outer lane`,
    r.keyLeft <= outerLeft + slack,
    `got ${r.keyLeft.toFixed(2)}, needs ${outerLeft.toFixed(2)}`);
  check(`${road}: an arrow key reaches the right outer lane`,
    r.keyRight >= outerRight - slack,
    `got ${r.keyRight.toFixed(2)}, needs ${outerRight.toFixed(2)}`);
}

// THE ROAD GEOMETRY ITSELF, reported per road. If two roads disagree about
// where their lanes are, that is the answer on its own and no amount of
// steering analysis will find it.
console.log('');
console.log('  road              lanes  width  shoulder  lane centres');
for (const road of roads) {
  const r = rows[road];
  if (!r) continue;
  console.log('  %s  %s    %s    %s      %s',
    road.padEnd(16), String(r.laneCount).padStart(2),
    r.laneWidth.toFixed(2), r.shoulderRight.toFixed(2),
    r.lanes.map((v) => v.toFixed(1)).join(', '));
}

// ============ THE TILT NEUTRAL, WHICH THE SWEEP ABOVE CANNOT SEE ============
//
// The reach sweep writes `input.values` directly, so it proves the BIKE can
// reach both lanes and says nothing at all about whether the tilt that feeds
// it is centred. That gap is exactly where the reported fault lived: every
// road passed the sweep while a real phone could not steer left.
//
// core/Controls.js captures the tilt zero on the first usable sensor reading
// and never again except from the pause panel. That reading lands while the
// title card is up, several screens and many seconds before the rider is
// actually riding, and every degree of drift in between is permanent bias.
// So the rule is: STARTING A RUN RE-CAPTURES THE NEUTRAL.
//
// Tested by giving the controls an absurd stale neutral, starting a run and
// asking whether it survived. No sensor is needed - the fault is in when the
// zero is taken, not in what the sensor says.
{
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`tilt: page error ${e.message}`));
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  const tilt = await page.evaluate(async () => {
    const N = window.NEON;
    N.controls.enabled = true;
    N.controls.mode = 'tilt';
    // A pose nothing could produce, so a surviving value is unmistakable.
    N.controls._raw = 7;
    N.controls._neutral = 999;
    N.selection.setMode('endless');
    N.beginRun(1);
    await new Promise((r) => setTimeout(r, 300));
    return { neutral: N.controls._neutral, raw: N.controls._raw };
  });
  await page.close();

  const recentred = tilt.neutral !== 999;
  check('starting a run re-centres the tilt neutral', recentred,
    recentred
      ? `neutral ${tilt.neutral} taken from the pose at the line`
      : `neutral is still ${tilt.neutral} after beginRun - it was captured at `
        + 'page load and never again, so every degree the phone drifted '
        + 'through the menus is permanent steering bias');
}

// ============ THE SEAM AT +/-180, WHICH EVERY PROBE MISSED ============
//
// An angle is a point on a circle and `raw - neutral` is not the distance
// between two of them. Held one way up a phone reads near zero and the plain
// subtraction is right; held the other way it sits on the seam and crosses it
// every frame. Photographed from the overlay trace on a real phone:
//
//   pinned right:  raw  163.9   neutral -173.2   delta  337.1
//   pinned left:   raw -174.0   neutral  167.6   delta -341.6
//
// Twenty-three degrees apart, called 337. Full lock is 22, so every reading
// saturated and the bike snapped between the lateral limits with nothing in
// between.
//
// EVERY REPRODUCTION MISSED THIS, and the reason is worth keeping: a
// synthetic neutral sits at or near 0, where the seam is 180 degrees away and
// can never be reached by a few degrees of lean. The harness was not wrong
// about what it measured, it was measuring the one pose that cannot fail.
// So this drives the neutral ONTO the seam on purpose.
//
// The assertion is PROPORTIONALITY, not reach. Saturation is the symptom: a
// lean of a few degrees against a 22 degree range must produce a fraction of
// full lock, and the broken build produces exactly 1 for any lean at all.
{
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`seam: page error ${e.message}`));
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  const seam = await page.evaluate(async () => {
    const N = window.NEON;
    N.controls.enabled = true;
    N.controls.mode = 'tilt';
    N.controls.live = true;
    N.selection.setMode('endless');
    N.beginRun(1);
    await new Promise((r) => setTimeout(r, 400));

    // The pose the phone was actually in, straight off the report.
    const NEUTRAL = -173.2;
    const out = [];
    for (const lean of [0, 4, 11, 22, -4, -11, -22]) {
      N.controls._neutral = NEUTRAL;
      // Wrapped into the real domain a sensor reports, which is the whole
      // point: NEUTRAL + 11 is 197.8, and no sensor ever says 197.8.
      let raw = NEUTRAL + lean;
      while (raw > 180) raw -= 360;
      while (raw < -180) raw += 360;
      N.controls._raw = raw;
      N.controls._smoothed = 0;
      // Enough steps that the smoothing has settled on the target.
      for (let i = 0; i < 60; i++) N.controls.update(1 / 60);
      out.push({ lean, raw: +raw.toFixed(1), steer: +N.controls.steer.toFixed(3) });
    }
    return out;
  });
  await page.close();

  console.log('');
  console.log('  tilt across the +/-180 seam, neutral -173.2, full lock at 22 deg');
  console.log('  lean deg   raw      steer');
  for (const row of seam) {
    console.log('  %s   %s   %s',
      String(row.lean).padStart(6), String(row.raw).padStart(7),
      row.steer.toFixed(3).padStart(7));
  }

  // At rest it must be still, and a part lean must be a part of full lock.
  const rest = seam.find((r) => r.lean === 0);
  check('tilt at the seam is still when the phone is at its neutral',
    Math.abs(rest.steer) < 0.02,
    `steer ${rest.steer} with the phone held exactly at the neutral`);

  const partial = seam.filter((r) => r.lean === 11 || r.lean === -11);
  const proportional = partial.every((r) => Math.abs(r.steer) > 0.1 && Math.abs(r.steer) < 0.9);
  check('tilt at the seam is proportional, not saturated', proportional,
    partial.map((r) => `${r.lean} deg gave ${r.steer}`).join('; ')
    + ' - half a lock of lean must give about half lock, and a delta that '
    + 'is not wrapped gives full lock for everything');

  const signs = seam.filter((r) => r.lean === 22 || r.lean === -22);
  const bothWays = signs.length === 2 && Math.sign(signs[0].steer) !== Math.sign(signs[1].steer);
  check('tilt at the seam steers both ways', bothWays,
    signs.map((r) => `${r.lean} deg gave ${r.steer}`).join('; '));
}

// ============ WHICH WAY IS RIGHT, IN BOTH LANDSCAPE ORIENTATIONS ============
//
// Both tilt sources document the same contract: POSITIVE means the screen's
// right edge has dipped, which is the direction a rider means "go right". So
// a lean to the right must make `lateral` go UP, and it must do that at
// screen.orientation.angle 90 AND 270 - the two ways a phone can be held in
// landscape, which take opposite signs of `beta` for the same physical roll.
//
// DRIVEN THROUGH THE SENSOR, not through `_raw`: the whole chain that can get
// a sign wrong is screenTilt -> invert -> wrap -> delta -> steer -> lateral,
// and writing `_raw` directly would skip the first two.
//
// AND THE NEUTRAL SITS ON THE SEAM, so this stays a test of the wrap as well.
// A lean one way crosses +/-180 and a lean the other does not; both must
// behave the same.
for (const angle of [90, 270]) {
  const page = await browser.newPage({ viewport: SIZE });
  page.on('pageerror', (e) => failures.push(`tilt ${angle}: page error ${e.message}`));
  await page.addInitScript((a) => {
    try {
      Object.defineProperty(window.screen, 'orientation', {
        configurable: true,
        get: () => ({ angle: a, type: 'landscape', addEventListener() {}, removeEventListener() {} }),
      });
    } catch (e) { /* some contexts refuse */ }
    // A real sensor never reports outside [-180, 180], so neither does this.
    window.__beta = 0;
    window.__wrapBeta = (b) => ((((b + 180) % 360) + 360) % 360) - 180;
    setInterval(() => {
      const init = { alpha: 0, beta: window.__wrapBeta(window.__beta), gamma: 0 };
      let evt;
      if (typeof DeviceOrientationEvent === 'function') {
        evt = new DeviceOrientationEvent('deviceorientation', init);
      } else {
        evt = new Event('deviceorientation');
        Object.assign(evt, init);
      }
      window.dispatchEvent(evt);
    }, 40);
  }, angle);
  await page.goto(`${server.url}?stats=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(SIZE.width - 40, 40);
  await page.waitForTimeout(600);

  const result = await page.evaluate(async (a) => {
    const N = window.NEON;
    N.controls.enabled = true;
    N.controls.mode = 'tilt';
    // ATTACH THE SENSOR LISTENERS. They go on in `request()`, which on a real
    // phone is called from the first touch; a desktop page never calls it, so
    // without this the events are dispatched into nothing and the whole block
    // reads `source null` and a steer of zero - which looks exactly like a
    // fault and is only the harness not plugging itself in.
    await N.controls.request();
    N.selection.setMode('endless');
    N.beginRun(1);
    await new Promise((r) => setTimeout(r, 900));

    // `screenTilt` is -beta at 90 and +beta at 270, so the SAME physical roll
    // is opposite betas. This is what "hold the phone the other way up" means.
    const betaFor = (tilt) => (a === 90 ? -tilt : tilt);
    // A neutral hard on the seam, which is the pose that broke the game.
    const NEUTRAL_TILT = -173.2;

    const settle = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__beta = betaFor(NEUTRAL_TILT);
    await settle(700);
    N.controls.recalibrate();
    await settle(500);
    const start = N.loop.state.lateral || 0;

    // LEAN RIGHT: the documented positive direction.
    window.__beta = betaFor(NEUTRAL_TILT + 16);
    await settle(1600);
    const right = N.loop.state.lateral || 0;
    const steerRight = N.controls.steer;

    // Back to neutral, then LEAN LEFT, which from this neutral crosses the seam.
    window.__beta = betaFor(NEUTRAL_TILT);
    await settle(900);
    const mid = N.loop.state.lateral || 0;
    window.__beta = betaFor(NEUTRAL_TILT - 16);
    await settle(1600);
    const left = N.loop.state.lateral || 0;
    const steerLeft = N.controls.steer;

    return {
      start: +start.toFixed(2),
      right: +right.toFixed(2),
      mid: +mid.toFixed(2),
      left: +left.toFixed(2),
      steerRight: +steerRight.toFixed(3),
      steerLeft: +steerLeft.toFixed(3),
      neutral: +N.controls._neutral.toFixed(1),
      raw: +N.controls._raw.toFixed(1),
      source: N.controls.source,
    };
  }, angle);
  await page.close();

  console.log('');
  console.log('  landscape angle %s  (neutral %s, source %s)',
    angle, result.neutral, result.source);
  console.log('    start %s -> lean right %s (steer %s) -> lean left %s (steer %s)',
    result.start, result.right, result.steerRight, result.left, result.steerLeft);

  check(`tilt at angle ${angle}: leaning right increases lateral`,
    result.right > result.start + 0.5 && result.steerRight > 0.1,
    `lateral went ${result.start} -> ${result.right} with steer ${result.steerRight}`);
  check(`tilt at angle ${angle}: leaning left decreases lateral`,
    result.left < result.mid - 0.5 && result.steerLeft < -0.1,
    `lateral went ${result.mid} -> ${result.left} with steer ${result.steerLeft}`);
}

await browser.close();
server.child.kill();

console.log('');
if (PROVE) {
  // INVERTED. The run was deliberately broken, so a green check here means
  // the check cannot go red and is therefore worth nothing.
  const keyFailures = failures.filter((f) => f.includes('an arrow key'));
  if (keyFailures.length) {
    console.log(`prove: the key sweep went red on ${keyFailures.length} check(s), as it must`);
    for (const failure of keyFailures.slice(0, 4)) console.log('  - ' + failure);
    process.exit(0);
  }
  console.log('prove: THE CHECK DID NOT FAIL on a build with a menu eating every arrow.');
  console.log('       A check that cannot go red is a comment.');
  process.exit(1);
}
if (failures.length) {
  console.log(`${failures.length} failure(s)`);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}
console.log('steer-check: every road steers, by value and by key');
process.exit(0);
