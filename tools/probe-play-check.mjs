/**
 * Does the GAMEPLAY still work under the realistic renderer?
 *
 *     node tools/probe-play-check.mjs
 *
 * Branch `probe/realism` only. The probe's whole claim is that the look is a
 * material and lighting layer over untouched gameplay, and a claim like that is
 * worth exactly what it is checked with. So this drives real input at the real
 * modules and asserts the things a rider would notice: that steering moves the
 * bike, that the lateral clamp still holds it on the road, that distance and
 * score accrue, and that the traffic is still solid.
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

const failures = [];
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`);
  if (!ok) failures.push(`${name}: ${detail}`);
}

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => failures.push('page error: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') failures.push('console: ' + m.text()); });

await page.goto(`${server.url}probe-play.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.PROBE, null, { timeout: 25000 });
await page.waitForTimeout(2500);

// --- the bike moves under its own throttle floor -------------------------
const rolling = await page.evaluate(() => ({
  speed: window.PROBE.loop.state.speed,
  distance: window.PROBE.loop.state.distance,
}));
check('the bike is rolling', rolling.speed > 1 && rolling.distance > 1,
  `${Math.round(rolling.speed)} u/s, ${Math.round(rolling.distance)} m`);

// --- steering moves it, and the clamp still holds ------------------------
const before = await page.evaluate(() => window.PROBE.loop.state.lateral);
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(2500);
const steered = await page.evaluate(() => window.PROBE.loop.state.lateral);
await page.keyboard.up('ArrowRight');
check('steering moves the bike', Math.abs(steered - before) > 0.5,
  `lateral ${before.toFixed(2)} -> ${steered.toFixed(2)}`);

await page.keyboard.down('ArrowRight');
await page.waitForTimeout(4000);
await page.keyboard.up('ArrowRight');
const clamped = await page.evaluate(() => ({
  lateral: window.PROBE.loop.state.lateral,
  limit: window.PROBE.bike.constructor.name ? null : null,
}));
// THE BRANCH'S OWN LIMIT, read from config rather than written here, so this
// does not have to be edited every time the clamp moves on main.
const limit = await page.evaluate(() => window.NEON_LIMIT
  || window.PROBE.loop.state.lateralLimit || 6.6);
check('the lateral clamp still holds', Math.abs(clamped.lateral) <= limit + 0.1,
  `worst |lateral| ${Math.abs(clamped.lateral).toFixed(2)} against a limit of ${limit}`);

// --- the traffic is still solid ------------------------------------------
// Ridden long enough, with weaving, that the shipped collision and near miss
// detection has to have had something to say. If neither ever fires, the
// traffic has become scenery and the look has quietly eaten the game.
await page.evaluate(async () => {
  const P = window.PROBE;
  const began = performance.now();
  let steer = 1;
  await new Promise((resolve) => {
    const tick = () => {
      // Weave across the lanes, which is what puts the bike near traffic.
      steer = Math.sin((performance.now() - began) / 900);
      P.loop.state.input.steer = steer;
      P.loop.state.input.throttle = 1;
      if (performance.now() - began > 25000) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  });
});

const played = await page.evaluate(() => ({
  hits: window.PROBE.loop.state.hits || 0,
  nearMisses: window.PROBE.loop.state.nearMisses || 0,
  distance: Math.round(window.PROBE.loop.state.distance || 0),
  score: window.PROBE.session.score,
  lives: window.PROBE.session.lives,
  phase: window.PROBE.session.phase,
}));
console.log('  after weaving:', JSON.stringify(played));
check('the traffic is still solid', played.hits + played.nearMisses > 0,
  `${played.hits} hits, ${played.nearMisses} near misses over ${played.distance} m`);
check('the run is still scored', played.score > 0, `score ${played.score}`);

// --- and the look is actually applied ------------------------------------
const look = await page.evaluate(() => {
  const P = window.PROBE;
  let lit = 0;
  let basic = 0;
  let shadowCasters = 0;
  P.scene.traverse((o) => {
    if (o.isLight) lit++;
    if (o.isMesh && o.material && o.material.isMeshBasicMaterial) basic++;
    if (o.isMesh && o.castShadow) shadowCasters++;
  });
  const roadMesh = P.road.chunks[0].mesh;
  return {
    lights: lit,
    basicMaterials: basic,
    shadowCasters,
    roadMaterial: roadMesh.material.type,
    shadowsOn: P.renderer.shadowMap.enabled,
    toneMapping: P.renderer.toneMapping,
  };
});
console.log('  look:', JSON.stringify(look));
check('the scene is lit', look.lights >= 3, `${look.lights} lights`);
check('the road is a PBR material', look.roadMaterial === 'MeshStandardMaterial',
  look.roadMaterial);
check('shadows are on and something casts them', look.shadowsOn && look.shadowCasters > 0,
  `${look.shadowCasters} casters`);
// THREE.ACESFilmicToneMapping is 4.
check('ACES tone mapping is on', look.toneMapping === 4, `toneMapping ${look.toneMapping}`);

await browser.close();
server.child.kill();
console.log('');
if (failures.length) {
  console.log(`${failures.length} failure(s)`);
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
console.log('probe-play-check: the gameplay still works under the realistic renderer');
process.exit(0);
