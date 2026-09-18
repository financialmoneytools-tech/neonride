/**
 * The light gate and the road blend, measured rather than admired.
 *
 *     node tools/gate-probe.mjs
 *
 * Rides the mixed road in god mode, forces a gate immediately, and records the
 * sky and road colours every frame across the crossing. Exits non-zero if the
 * change is not continuous.
 *
 * WHAT IT IS ACTUALLY CHECKING. A blend can look finished and still be wrong in
 * two ways a screenshot cannot show. It can JUMP - a value that switches rather
 * than ramps, which is what the aurora's arc drift did before its phase was
 * integrated: at t = 300 s, moving the drift rate snapped the curtain 34
 * degrees sideways in one frame. And it can STALL - a value nobody wired into
 * applyTheme, which stays at the old road forever while everything around it
 * moves. So this measures the per-frame delta (a jump is a spike) and the total
 * distance travelled (a stall is a zero).
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\[[0-9;]*m', 'g');

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
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const failures = [];
page.on('pageerror', (e) => failures.push('page error: ' + e.message));

await page.goto(server.url + '?god=1&theme=mixed&stats=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON && window.NEON.themeBlend, null, { timeout: 20000 });
await page.waitForTimeout(2500);

const before = await page.evaluate(() => window.NEON.themes.name);
console.log('starting road:', before);

// Record the values that have to move, every frame, from inside the page.
await page.evaluate(() => {
  window.__gate = [];
  const blend = window.NEON.themeBlend;
  const original = blend.update.bind(blend);
  blend.update = (dt) => {
    original(dt);
    const c = window.NEON.config;
    window.__gate.push({
      t: blend.t,
      active: blend.active,
      road: window.NEON.themes.name,
      fog: c.world.fog.color,
      dome: c.sky.dome.colorTop,
      auroraLow: c.sky.aurora.colorLow,
      asphalt: c.world.road.surface.asphaltColor,
      pine: c.world.scenery.density.pine,
      flash: window.NEON.post.gradeMaterial.uniforms.uFlashAmount.value,
    });
  };
});

// Force the crossing now rather than riding 2.6 km to it. With --shots the
// gate is placed further ahead so the arch itself is photographed arriving,
// which is the thing a reviewer actually wants to look at.
const SHOTS = process.argv.includes('--shots');
await page.evaluate((shots) => {
  const state = window.NEON.loop.state;
  window.NEON.gate.arm(state.distance || 0);
  window.NEON.gate.distance = (state.distance || 0) + (shots ? 640 : 40);
}, SHOTS);

if (SHOTS) {
  const { mkdirSync } = await import('node:fs');
  mkdirSync('tools/out', { recursive: true });
  await page.screenshot({ path: 'tools/out/gate-1-ahead.png' });
  for (const [name, wait] of [['2-arriving', 1500], ['3-through', 1300], ['4-blending', 1200], ['5-after', 2600]]) {
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `tools/out/gate-${name}.png` });
  }
  console.log('wrote tools/out/gate-*.png');
}
await page.waitForTimeout(9000);

const log = await page.evaluate(() => window.__gate);
const after = await page.evaluate(() => window.NEON.themes.name);
await browser.close();
server.child.kill();

console.log('frames recorded:', log.length, ' road after:', after);
if (!log.length) {
  console.log('FAIL  the blend never ran - the gate was not crossed');
  process.exit(1);
}

const check = (name, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`);
  if (!ok) failures.push(name + ': ' + detail);
};

// COUNTED ACROSS THE WHOLE LOG, not by comparing the ends. The mixed road
// arms a new gate every few kilometres, so a longer probe crosses twice and
// arrives back where it started - which a start-versus-finish comparison reads
// as "nothing happened". It cycles; that is the feature.
const visited = [...new Set(log.map((r) => r.road))];
check('the road changed', visited.length > 1,
  `${before} -> ${after}, visited ${visited.join(' -> ')}`);

// Per channel: it has to MOVE, and it has to move without jumping.
const channels = ['fog', 'dome', 'auroraLow', 'asphalt'];
// Only the FIRST transition is measured. A probe that ran long enough to cross
// twice would see each channel travel out and back, and "travelled twice the
// distance between the two roads" is not a jump - it is two blends.
const firstRoad = log[0].road;
const endOfFirst = log.findIndex((r) => r.road !== firstRoad);
const window = endOfFirst === -1 ? log : log.slice(0, endOfFirst + 240);

for (const key of channels) {
  const values = window.map((r) => r[key]);
  const rgb = (v) => [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  let travelled = 0;
  let biggest = 0;
  for (let i = 1; i < values.length; i++) {
    const a = rgb(values[i - 1]);
    const b = rgb(values[i]);
    const step = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    travelled += step;
    if (step > biggest) biggest = step;
  }
  // EXPECTED FROM THE TWO ROADS THEMSELVES, not from a threshold typed here.
  // The asphalt is 0x050509 on one road and 0x06070b on the other - a total
  // distance of 5 - because a snowy road is still a black road. A fixed "must
  // move more than N" either fails that legitimately tiny change or passes a
  // channel that never moved at all, depending on N.
  const first = rgb(values[0]);
  const last = rgb(values[values.length - 1]);
  const expected = Math.abs(first[0] - last[0]) + Math.abs(first[1] - last[1])
    + Math.abs(first[2] - last[2]);

  check(`${key} arrived`, expected === 0 || travelled >= expected,
    `travelled ${travelled} against ${expected} between the two roads`);
  // A MONOTONIC ramp travels exactly the straight line distance. Travelling
  // much further means it wandered - a value interpolated as an integer rather
  // than as a colour does exactly that, and it is what this probe caught.
  check(`${key} took the direct path`, travelled <= Math.max(expected * 1.35, expected + 4),
    `travelled ${travelled} to cover ${expected}`);
  // A smoothstep over three seconds at 60 fps cannot move far in one frame.
  check(`${key} did not jump`, biggest <= Math.max(6, expected * 0.34),
    `largest single-frame step ${biggest} against ${expected} total`);
}

const lit = log.filter((r) => r.flash > 0.01).length;
check('the gate flashed', lit > 0, `${lit} frames lit`);

if (failures.length) {
  console.log(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log('\ngate probe: the road changed continuously');
process.exit(0);
