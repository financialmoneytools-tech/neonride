/**
 * The screen flash, checked against the two faults that shipped.
 *
 *     node tools/flash-probe.mjs            # every case
 *     node tools/flash-probe.mjs collision  # one case by name
 *
 * Exits non-zero on the first failure, so it can be run as a check rather than
 * read as a report.
 *
 * WHY THIS EXISTS. A deep red sky was reported on Galaxy Road. It was not the
 * sky - nothing in Sky, SkyDome, Nebula, Starfield or the fog reads distance,
 * speed or elapsed time, and the gradient at 11 km is byte for byte the
 * gradient at 0. It was the COLLISION FLASH, still firing after the run had
 * ended: Session stopped updating when the phase left RUNNING, so
 * `state.invulnerable` froze at 1.60 and never decayed, while Traffic went on
 * detecting overlaps and went on raising the flash on its own refractory.
 * Measured over one 60 s run before the fix: 31 of 34 flashes fired after the
 * third life was gone, one every ~1.43 s. `edge` 0.55 puts the most light at
 * the periphery, and the periphery of this frame is sky - so it did not read as
 * a flash, it read as a sky that had turned red and stayed that way.
 *
 * THE FIRST VERSION OF THIS CHECK COULD NOT FAIL, which is worth more than the
 * bug. It counted frames where the flash exceeded 0.9 - and `uFlashAmount` is
 * `level * strength`, with the collision's strength being 0.5, so it never
 * exceeds 0.5 and the check reported zero events over a run that lost all three
 * lives. Every threshold here is derived from the source's own configured
 * strength, never from a number typed next to it.
 *
 * A second thing that check taught: holding full throttle for 75 s on the
 * player traffic model produces ZERO collisions, which is the road behaving as
 * tools/bot-run.mjs measured it. To exercise a hit at all, the cases below
 * widen the player's collision box. Nothing about the flash, the refractory,
 * the grace window or the run is touched by that.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const W = 1280;
const H = 720;
const ONLY = process.argv[2] || '';

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

const failures = [];
const notes = [];

function check(name, ok, detail) {
  const line = `${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`;
  console.log(line);
  if (!ok) failures.push(`${name}: ${detail}`);
}

/**
 * Records every frame's flash state from inside the page. Sampling from node
 * would alias badly against a decay measured in tenths of a second.
 */
async function startRecording(page) {
  await page.evaluate(() => {
    window.__flashLog = [];
    const post = window.NEON.post;
    const original = post.update.bind(post);
    post.update = (dt, state) => {
      original(dt, state);
      window.__flashLog.push({
        t: performance.now() / 1000,
        amount: post.gradeMaterial.uniforms.uFlashAmount.value,
        edge: post.gradeMaterial.uniforms.uFlashEdge.value,
        colour: post.gradeMaterial.uniforms.uFlashColor.value.getHex(),
        scoring: !!state.scoring,
        inv: state.invulnerable || 0,
        hits: state.hits || 0,
        lives: window.NEON.session.lives,
        phase: window.NEON.session.phase,
      });
    };
  });
}

async function readLog(page) {
  return page.evaluate(() => window.__flashLog);
}

/** Rises above 80 per cent of the observed peak, which is how an event is told
 * from a decay. Derived, never typed: see the header. */
function events(log) {
  const peak = log.reduce((m, r) => Math.max(m, r.amount), 0);
  if (peak <= 0) return { peak, list: [] };
  const trigger = peak * 0.8;
  const list = [];
  for (let i = 1; i < log.length; i++) {
    if (log[i].amount >= trigger && log[i - 1].amount < trigger) list.push(log[i]);
  }
  return { peak, trigger, list };
}


/**
 * Gets from the title card to a running game.
 *
 * The bike and road screens now stand between the two, so every case here has
 * to walk them - a probe that taps once and then waits for a collision waits
 * for ever, which is exactly what it did the first time this ran after the
 * selection flow landed.
 */
async function startRun(page) {
  // Away from the centre, where the comfort toggle swallows the pointerdown.
  await page.mouse.click(W - 60, 60);
  await page.waitForTimeout(600);
  for (const selector of ['.bike-screen .select-confirm', '.road-screen .select-confirm']) {
    await page.waitForSelector(selector, { timeout: 8000 });
    await page.click(selector);
    await page.waitForTimeout(500);
  }
  await page.waitForFunction(() => window.NEON.session.phase === 'running', null, { timeout: 8000 });
}

const server = await startServer();
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

async function newRun(query) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => failures.push('page error: ' + e.message));
  await page.goto(server.url + query, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON && window.NEON.flash, null, { timeout: 20000 });
  return page;
}

// --- Case 1: the collision caller, and the two gates that were missing -------
if (!ONLY || ONLY === 'collision') {
  const page = await newRun('?theme=galaxyRoad&stats=0');
  await startRun(page);
  await startRecording(page);
  await page.evaluate(() => {
    window.NEON.config.world.traffic.collision.playerHalfWidth = 2.6;
  });
  await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => window.NEON.session.lives <= 0, null, { timeout: 90000 });
  // Keep riding well past the end of the run. This is the window the fault
  // lived in: before the fix the flash re-armed here roughly every 1.43 s.
  await page.waitForTimeout(12000);
  await page.keyboard.up('ArrowUp');

  const log = await readLog(page);
  const { peak, list } = events(log);
  const collision = await page.evaluate(() => window.NEON.config.flash.sources.collision);

  check('collision fires at all', list.length > 0, `${list.length} flashes, peak ${peak.toFixed(3)}`);
  check(
    'collision never exceeds its configured strength',
    peak <= collision.strength + 1e-3,
    `peak ${peak.toFixed(3)} against strength ${collision.strength}`,
  );

  const whileInvulnerable = list.filter((e) => e.inv > 0);
  check(
    'no flash is raised while invulnerable',
    whileInvulnerable.length === 0,
    `${whileInvulnerable.length} of ${list.length} fired inside the grace window`,
  );

  const afterRun = list.filter((e) => !e.scoring);
  check(
    'no flash is raised after the run has ended',
    afterRun.length === 0,
    `${afterRun.length} of ${list.length} fired with the run over`,
  );

  // The frozen value is the other half of the original fault, so it is checked
  // directly rather than only through its consequence.
  const frozen = log.filter((r) => !r.scoring && r.inv > 0);
  check(
    'the grace window does not freeze when the run ends',
    frozen.length === 0,
    `${frozen.length} frames reported an ended run still inside the grace window`,
  );

  const over = log.filter((r) => r.phase === 'over');
  const litAfter = over.filter((r) => r.amount > 0.001).length;
  notes.push(`frames after the run ended: ${over.length}, of which lit: ${litAfter}`);
  await page.close();
}

// --- Case 2: every caller can raise its own flash ---------------------------
// Fired directly rather than waited for. A checkpoint and a theme gate are
// placed by the stage, and a probe that had to ride to one would be testing the
// stage rather than the flash.
if (!ONLY || ONLY === 'callers') {
  const page = await newRun('?theme=galaxyRoad&stats=0');
  await startRun(page);

  const result = await page.evaluate(() => {
    const flash = window.NEON.flash;
    const state = window.NEON.loop.state;
    const out = {};
    for (const name of Object.keys(window.NEON.config.flash.sources)) {
      flash.reset();
      const fired = flash.fire(name, state);
      flash.update(0.0001, state);
      out[name] = {
        fired,
        amount: flash.amount,
        edge: flash.edge,
        colour: flash.color.getHex(),
        expected: window.NEON.config.flash.sources[name],
      };
    }
    flash.reset();
    return out;
  });

  for (const [name, r] of Object.entries(result)) {
    check(`${name} raises a flash`, r.fired === true, r.fired ? '' : 'fire() refused it');
    check(
      `${name} paints its own colour`,
      r.colour === r.expected.color,
      `got ${r.colour.toString(16)}, expected ${r.expected.color.toString(16)}`,
    );
    check(
      `${name} paints its own edge`,
      Math.abs(r.edge - r.expected.edge) < 1e-6,
      `got ${r.edge}, expected ${r.expected.edge}`,
    );
  }

  // Two sources at once: the brighter one wins, which is what makes a hit beat
  // a near miss rather than the two summing into something neither chose.
  const both = await page.evaluate(() => {
    const flash = window.NEON.flash;
    const state = window.NEON.loop.state;
    flash.reset();
    flash.fire('nearMiss', state);
    flash.fire('collision', state);
    flash.update(0.0001, state);
    const r = { colour: flash.color.getHex(), amount: flash.amount };
    flash.reset();
    return r;
  });
  const collisionColour = await page.evaluate(() => window.NEON.config.flash.sources.collision.color);
  check(
    'a hit beats a near miss when both are live',
    both.colour === collisionColour,
    `got ${both.colour.toString(16)}`,
  );
  await page.close();
}

// --- Case 3: the two gates, forced rather than waited for -------------------
// Case 1 rides until it crashes, and whether a second hit happens to land
// inside the grace window is up to the traffic. That makes it a good test of
// the real path and a WEAK test of the rule: run with the gate removed and the
// grace assertion still passed, because the timing never arose. These fire the
// sources directly against a state that has been set to each forbidden
// condition, so the rule is checked rather than sampled.
if (!ONLY || ONLY === 'gates') {
  const page = await newRun('?theme=galaxyRoad&stats=0');
  await startRun(page);

  const r = await page.evaluate(() => {
    const flash = window.NEON.flash;
    const sources = window.NEON.config.flash.sources;
    const attempt = (name, state) => {
      flash.reset();
      const fired = flash.fire(name, state);
      flash.reset();
      return fired;
    };
    const out = { invulnerable: {}, notRunning: {}, control: {} };
    for (const name of Object.keys(sources)) {
      out.control[name] = attempt(name, { scoring: true, invulnerable: 0 });
      out.invulnerable[name] = attempt(name, { scoring: true, invulnerable: 1.6 });
      out.notRunning[name] = attempt(name, { scoring: false, invulnerable: 0 });
    }
    return { out, sources };
  });

  // THE POLICY, not the mechanism. Everything below checks that a source obeys
  // its own flags, which passes whatever those flags happen to say - so on its
  // own it would wave the original fault straight through, since the fault was
  // the flags being absent. These two state what the collision flash is not
  // allowed to be configured as, and they are the check that actually stands
  // between the red sky and a future edit.
  const collisionSource = r.sources.collision;
  check(
    'the collision flash requires a run in progress',
    collisionSource.requiresRun === true,
    'config/flash.js -> sources.collision.requiresRun must be true; this is the '
      + 'flag whose absence kept the sky red behind the game-over panel',
  );
  check(
    'the collision flash is blocked inside the grace window',
    collisionSource.blockedWhileInvulnerable === true,
    'config/flash.js -> sources.collision.blockedWhileInvulnerable must be true; '
      + 'the grace window refuses to take a life and must refuse the light too',
  );

  for (const [name, source] of Object.entries(r.sources)) {
    check(
      `${name} fires when nothing forbids it`,
      r.out.control[name] === true,
      'the control case must fire, or the two below prove nothing',
    );
    check(
      `${name} respects blockedWhileInvulnerable (${source.blockedWhileInvulnerable})`,
      r.out.invulnerable[name] === !source.blockedWhileInvulnerable,
      `fired=${r.out.invulnerable[name]} inside the grace window`,
    );
    check(
      `${name} respects requiresRun (${source.requiresRun})`,
      r.out.notRunning[name] === !source.requiresRun,
      `fired=${r.out.notRunning[name]} with no run in progress`,
    );
  }
  await page.close();
}

// --- Case 4: reduced motion scales it, and does not switch it off -----------
if (!ONLY || ONLY === 'comfort') {
  const page = await newRun('?theme=galaxyRoad&stats=0');
  await page.mouse.click(W - 60, 60);
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const flash = window.NEON.flash;
    const state = window.NEON.loop.state;
    const read = () => {
      flash.reset();
      flash.fire('themeGate', state);
      flash.update(0.0001, state);
      return flash.amount;
    };
    window.NEON.comfort.set(false);
    const full = read();
    window.NEON.comfort.set(true);
    const reduced = read();
    window.NEON.comfort.set(false);
    flash.reset();
    return { full, reduced, scale: window.NEON.config.comfort.scale.flash };
  });
  check('reduced motion scales the flash', r.reduced < r.full * 0.9, `${r.full.toFixed(3)} -> ${r.reduced.toFixed(3)}`);
  check('reduced motion does not switch the flash off', r.reduced > 0, `${r.reduced.toFixed(4)}`);
  check(
    'the reduction matches config.comfort.scale.flash',
    Math.abs(r.reduced - r.full * r.scale) < 1e-4,
    `${r.reduced.toFixed(4)} against ${(r.full * r.scale).toFixed(4)}`,
  );
  await page.close();
}

await browser.close();
server.child.kill();

for (const note of notes) console.log('note: ' + note);
if (failures.length) {
  console.log(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log('\nflash probe: all cases passed');
process.exit(0);
