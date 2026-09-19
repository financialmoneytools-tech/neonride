/**
 * One pass over the six roads, serving every picture anybody needs of them.
 *
 *     node tools/road-run.mjs             # npm run roads
 *     node tools/road-run.mjs --one       # the FIRST road only, as a smoke run
 *     node tools/road-run.mjs --one=redPlanet
 *     node tools/road-run.mjs --prove     # put the walls back, expect a failure
 *
 * It replaces tools/road-shots.mjs and tools/skyline-check.mjs, which rode the
 * same six roads separately and between them took ten minutes.
 *
 * ================= WHY IT IS ONE TOOL =================
 *
 * Because the expensive thing is the RIDE, not the measuring, and both tools
 * wanted the same ride. Measured on the old pair: `shots` about four minutes
 * and `skyline` about six, for six roads each.
 *
 * Four things were costing that, and the last is the one that matters:
 *
 *   A PAGE PER ROAD. Six browser pages, six WebGL contexts, six warmups -
 *   about a minute of every run before anything was measured. One page now,
 *   and the road is switched IN PLACE through themes.select() plus
 *   ThemeBlend.settle(), which lands exactly on the theme's own values.
 *
 *   SIX SAMPLES where three answered the same question.
 *
 *   FULL RESOLUTION for measurements that are reduced to a 214x120 grid
 *   before anything is computed. The run is at 640x360 and only the two
 *   frames a person actually looks at are taken at 1280x720.
 *
 *   RIDING FOUR KILOMETRES IN REAL TIME. This is the whole cost and no amount
 *   of rendering faster touches it: the loop is delta-timed, so simulated
 *   time IS wall time and 4000 metres at 235 units a second takes twenty
 *   seconds however many frames go by. So the tool FAST FORWARDS - drag to
 *   zero and the ceiling raised, which covers the ground in about a second
 *   and a half, then everything restored and left to settle before a single
 *   pixel is read. The world is a function of DISTANCE, not of how fast it
 *   was covered, so the road, the scenery and the ridges come out identical.
 *   Traffic is the one thing that is re-placed by the jump, which is why the
 *   settle is a second and a half rather than a frame.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const NL = String.fromCharCode(10);
const DIR = 'tools/out/roads';
const SKY = DIR + '/sky';

/** Small for measuring, big for the two frames a person looks at. */
const MEASURE = { width: 640, height: 360 };
const VIEW = { width: 1280, height: 720 };

/** Metres from the start of each road's ride. The last is the viewer's frame. */
const MARKS = [0, 2000, 4000];

const ONE = process.argv.find((a) => a === '--one' || a.startsWith('--one='));
const ONE_ROAD = ONE && ONE.includes('=') ? ONE.split('=')[1] : null;

/**
 * `--prove` drags the ridges to 70 units and flattens the saddle the road
 * runs out through, which is the geometry the ring replaced. A check written
 * after its own fault was fixed has never been red; this is how it earns the
 * green. It exits 0 only when it fails.
 */
const PROVE = process.argv.includes('--prove');
const PROVE_RADIUS = 70;

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

// ================= WHAT RUNS INSIDE THE PAGE =================

/** Puts a road on without reloading: the selector, then the exact values. */
function fitRoad(road) {
  const N = window.NEON;
  N.themes.select(road);
  N.themeBlend.settle(road);
}

/**
 * Silences everything that tints or blocks the FRAME rather than being the
 * road: the flashes, and the lit arches. Both are deliberate furniture and
 * neither is what any of this measures.
 */
function hush() {
  const N = window.NEON;
  const sources = N.config.flash.sources;
  for (const key of Object.keys(sources)) sources[key].strength = 0;
  for (const gate of [N.gate, N.checkpointGate, N.finishGate]) {
    if (!gate) continue;
    if (gate.disarm) gate.disarm();
    const node = gate.group || gate.mesh;
    if (node) node.visible = false;
  }
}

/**
 * A REAL FREEZE. main.js reassigns `loop.paused` from the session phase every
 * frame, so an external pause is undone before the next tick and the two
 * halves of an ablation become two different moments - see tools/ablate.mjs,
 * where this was measured. Redefining the property is what holds.
 */
function freeze(on) {
  Object.defineProperty(window.NEON.loop, 'paused', {
    get: () => on, set: () => {}, configurable: true,
  });
}

/** Where the true horizon falls, from the camera that is actually rendering. */
function horizonRow() {
  const camera = window.NEON.engine.camera;
  const dir = camera.getWorldDirection(camera.position.clone());
  dir.y = 0;
  if (dir.lengthSq() < 1e-6) return 0.5;
  const point = camera.position.clone().add(dir.normalize().multiplyScalar(100000));
  point.project(camera);
  return (1 - point.y) * 0.5;
}

/**
 * How much the ridge colour varies face to face, read off the COLOUR BUFFER.
 * Three attempts to see this in the picture each measured something else -
 * the vertex gradient, the height profile, then whichever layer stood behind
 * the near one - and a flat black wall passed all three. A silhouette scores
 * exactly 0 here.
 */
function ridgeFaces() {
  const lum = [];
  for (const mesh of window.NEON.mountains.group.children) {
    if (!mesh.visible) continue;
    const c = mesh.geometry.attributes.color;
    for (let i = 0; i < c.count; i += 2) {
      lum.push(0.299 * c.getX(i) + 0.587 * c.getY(i) + 0.114 * c.getZ(i));
    }
  }
  if (lum.length < 8) return 0;
  const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
  if (mean <= 1e-6) return 0;
  let variance = 0;
  for (const value of lum) variance += (value - mean) * (value - mean);
  return Math.sqrt(variance / lum.length) / mean;
}

const FACES_FLOOR = 0.12;

// ================= THE RUN =================

const server = await startServer();
mkdirSync(SKY, { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

// ONE page for the whole run.
const page = await browser.newPage({ viewport: MEASURE });
const notes = [];
page.on('pageerror', (e) => notes.push('page error ' + e.message));
await page.goto(server.url + '?god=1&stats=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON && window.NEON.bike, null, { timeout: 20000 });
await page.waitForTimeout(4000);

const all = await page.evaluate(() => Object.keys(window.NEON.config.themes));
const roads = ONE_ROAD ? [ONE_ROAD] : (ONE ? [all[0]] : all);

/** Covers `metres` in about a second and a half, then puts everything back. */
async function jump(metres) {
  await page.evaluate((m) => {
    const bike = window.NEON.config.player.bike;
    window.__was = {
      maxSpeed: bike.maxSpeed,
      acceleration: bike.acceleration,
      dragQuadratic: bike.dragQuadratic,
      dragLinear: bike.dragLinear,
    };
    bike.maxSpeed = 3000;
    bike.acceleration = 6000;
    bike.dragQuadratic = 0;
    bike.dragLinear = 0;
    window.__target = (window.NEON.loop.state.distance || 0) + m;
  }, metres);
  await page.waitForFunction(
    () => (window.NEON.loop.state.distance || 0) >= window.__target,
    null, { timeout: 40000 },
  ).catch(() => {});
  await page.evaluate(() => {
    Object.assign(window.NEON.config.player.bike, window.__was);
  });
  // Long enough for the speed to fall back under drag and for the traffic the
  // jump scattered to find its spacing again.
  await page.waitForTimeout(1500);
}

const faces = {};
for (const road of roads) {
  await page.evaluate(fitRoad, road);
  if (PROVE) {
    await page.evaluate((radius) => {
      const m = window.NEON.config.world.mountains;
      m.enabled = true;
      m.gap.floor = 1;
      for (const layer of m.layers) layer.distance = radius;
      window.NEON.mountains.applyTheme();
    }, PROVE_RADIUS);
  }
  await page.evaluate(hush);
  await page.waitForTimeout(1200);

  const hasRidges = await page.evaluate(() => window.NEON.mountains.group.visible);
  if (!hasRidges) notes.push(road + ': no mountains (the theme turns them off)');

  for (let i = 0; i < MARKS.length; i++) {
    if (i > 0) await jump(MARKS[i] - MARKS[i - 1]);
    await page.evaluate(hush);

    if (hasRidges) {
      await page.evaluate(freeze, true);
      await page.waitForTimeout(220);
      const row = await page.evaluate(horizonRow);
      notes.push('HORIZON ' + road + ' ' + i + ' ' + row.toFixed(4));
      const spread = await page.evaluate(ridgeFaces);
      faces[road] = Math.min(faces[road] === undefined ? 1 : faces[road], spread);

      await page.screenshot({ path: SKY + '/' + road + '-' + i + '-with.png' });
      await page.evaluate(() => { window.NEON.mountains.group.visible = false; });
      await page.waitForTimeout(200);
      await page.screenshot({ path: SKY + '/' + road + '-' + i + '-without.png' });
      await page.evaluate(() => { window.NEON.mountains.group.visible = true; });
      await page.evaluate(freeze, false);
    }

    // THE TWO FRAMES A PERSON LOOKS AT, and the only ones worth the pixels.
    if (i === 0 || i === MARKS.length - 1) {
      await page.setViewportSize(VIEW);
      // core/Viewport.js debounces a size change before it acts on it.
      await page.waitForTimeout(650);
      await page.screenshot({
        path: DIR + '/' + road + '-' + MARKS[i] + '.jpg', quality: 82, type: 'jpeg',
      });
      await page.setViewportSize(MEASURE);
      await page.waitForTimeout(450);
    }
  }
}

await browser.close();
server.child.kill();

writeFileSync(SKY + '/horizons.txt',
  notes.filter((n) => n.startsWith('HORIZON')).map((n) => n.slice(8)).join(NL) + NL);
for (const n of notes.filter((n) => !n.startsWith('HORIZON'))) console.log('  note: ' + n);

console.log('');
console.log('DO THE RIDGES HAVE FACES?  (spread of the peak colour, 0 = one flat colour)');
console.log('');
let flat = 0;
for (const road of Object.keys(faces)) {
  const ok = faces[road] >= FACES_FLOOR;
  if (!ok) flat++;
  console.log('  ' + road.padEnd(16) + faces[road].toFixed(3).padStart(7)
    + (ok ? '' : '   FLAT - a silhouette, not a range'));
}
console.log('  floor ' + FACES_FLOOR.toFixed(2) + ', and a ridge painted one colour scores 0');

const compare = spawn('python', ['tools/skyline-compare.py',
  SKY, String(MARKS.length), roads.join(' '), 'keep'], { stdio: 'inherit' });
compare.on('exit', (code) => {
  const green = code === 0 && flat === 0;
  if (PROVE) {
    if (!green) {
      console.log('');
      console.log('--prove: the check bites - ridges at ' + PROVE_RADIUS
        + ' units with no saddle are reported as walls');
      process.exit(0);
    }
    console.log('');
    console.log('--prove FAILED: the ridges were dragged to ' + PROVE_RADIUS
      + ' units and nothing was reported. It is not checking anything.');
    process.exit(1);
  }
  if (flat) console.log(flat + ' road(s) have ridges with no faces');
  console.log('');
  console.log('frames for the eye: ' + DIR + '/<road>-0.jpg and -4000.jpg');
  process.exit(green ? 0 : 1);
});
