/**
 * Are the mountains a horizon, or a wall?
 *
 *     node tools/skyline-check.mjs          # npm run skyline
 *     node tools/skyline-check.mjs --shots  # keep the ablation pairs
 *
 * ================= WHY =================
 *
 * Reported from captures of the finished roads: "a solid near-black wedge
 * with a hard straight edge taking a third of the frame" - on the right of
 * Sunset Highway and Red Planet, on the left of Neon Metropolis, and absent
 * from Galaxy Road, which is the one road with no mountains at all.
 *
 * ================= WHAT IT MEASURES, AND WHY BY ABLATION =================
 *
 * A wedge in a screenshot is a shape somebody has to recognise. Ablation
 * turns it into a number: photograph the frame, hide `mountains.group`,
 * photograph it again, and every pixel that changed IS the mountains. No
 * colour matching, no edge detection, no guessing which dark thing is which.
 * It is the idiom tools/ablate.mjs already uses, including its hard-won
 * freeze - see below.
 *
 * Three numbers come out of the mask, and each one is a different way for a
 * ridge to be wrong:
 *
 *   coverage   how much of the frame the mountains take. A range on the
 *              horizon takes a strip. A wall takes a third.
 *   reach      how far BELOW the horizon line the mask descends, as a
 *              fraction of the frame under it. This is the slab test. Distant
 *              mountains sit ON the horizon and stop; a wall beside the lens
 *              runs from the skyline to the bottom edge.
 *   relief     the spread of brightness inside the mask. A one-colour
 *              silhouette has none, and against a lit horizon that is the
 *              same fault as the flat orange rocks were - see
 *              world/scenery/shading.js.
 *
 * ================= WHAT ABLATION CANNOT SEE =================
 *
 * It measures DIFFERENCE, not area, so a ridge that fills the whole frame in
 * a colour close to the fog behind it scores low on both numbers. That is
 * the opposite extreme from the fault this exists for - a dark mass against
 * a lit sky, which is the largest difference there is - and it shows up in
 * `--prove`, where a wall at 70 units is caught on four of the six roads and
 * slips through on the two whose ridges are nearly the fog colour already.
 *
 * ================= SIX POINTS, NOT ONE =================
 *
 * The fault only appears where the road happens to curve toward a ridge, so a
 * single frame per road proves nothing. This samples along a run and reports
 * the WORST of them, which is the only number a rider cares about.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const W = 1280;
const H = 720;
const DIR = 'tools/out/skyline';
const SHOTS = process.argv.includes('--shots');

/**
 * `--prove` puts a wall back and expects this tool to say so.
 *
 * It drags the near ridge in to `PROVE_RADIUS` and flattens the saddle the
 * road runs out through, which is the geometry the ring replaced: a ridge
 * close enough that turning toward it fills the frame. A check written after
 * its own fault was fixed has never been red, and this is how the green is
 * earned. It exits 0 only when it fails.
 */
const PROVE = process.argv.includes('--prove');
const PROVE_RADIUS = 70;

/** A newline, spelled this way because the project's editing does not survive escapes. */
const NL = String.fromCharCode(10);

/** Metres between samples, and how many. */
const SAMPLES = 6;
const SAMPLE_GAP = 700;

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

const server = await startServer();
mkdirSync(DIR, { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

const probe = await browser.newPage({ viewport: { width: 640, height: 360 } });
await probe.goto(server.url + '?god=1', { waitUntil: 'load' });
await probe.waitForFunction(() => window.NEON, null, { timeout: 20000 });
const roads = await probe.evaluate(() => Object.keys(window.NEON.config.themes));
await probe.close();

/**
 * A REAL FREEZE, and the reason it is written this way is in tools/ablate.mjs:
 * main.js reassigns `loop.paused` from the session phase every frame, so an
 * external pause is undone before the next tick and the two halves of an
 * ablation end up being two different moments on two different stretches of
 * road. Redefining the property is what holds.
 */
function freeze(on) {
  Object.defineProperty(window.NEON.loop, 'paused', {
    get: () => on, set: () => {}, configurable: true,
  });
}

/**
 * Where the true horizon falls in the frame, in pixels from the top.
 *
 * Computed rather than assumed: the camera pitches, the fov changes with the
 * frame's shape through core/Framing.js, and the cinematic profile moves both.
 * A point straight ahead at the camera's own height, pushed far enough away
 * to be the horizon, projected through the camera that is actually rendering.
 */
function horizonRow() {
  const camera = window.NEON.engine.camera;
  // Vectors are borrowed by cloning the camera's own, so this needs no
  // handle on THREE - the debug object does not carry one.
  const dir = camera.getWorldDirection(camera.position.clone());
  dir.y = 0;
  if (dir.lengthSq() < 1e-6) return 0.5;
  const point = camera.position.clone().add(dir.normalize().multiplyScalar(100000));
  point.project(camera);
  return (1 - point.y) * 0.5;
}

/**
 * How much the ridge colour varies from face to face, as a coefficient of
 * variation over the peak row of every visible ring.
 *
 * ================= WHY THIS IS READ OFF THE MESH =================
 *
 * Because three attempts to see it in the picture all measured something
 * else. Over the whole ablation mask it reads the vertex gradient from peak
 * colour down to fog, which every curtain has ever had; averaged per column
 * it reads the height profile, because a tall column spans more of that
 * gradient than a short one; along the crest it reads whichever layer
 * happens to be behind the near one. A flat black wall scored well on all
 * three.
 *
 * The question is simply whether the ridge is painted one colour, and the
 * colour buffer answers it exactly. A silhouette scores 0. It is the same
 * move tools/grounded-check.mjs makes when it reads instance matrices off
 * the GPU rather than trusting the code that wrote them.
 */
function ridgeFaces() {
  const lum = [];
  for (const mesh of window.NEON.mountains.group.children) {
    if (!mesh.visible) continue;
    const c = mesh.geometry.attributes.color;
    // Peak, base, peak, base - so the peaks are the even vertices. The feet
    // are all the fog colour by design and would only dilute this.
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

/**
 * The floor for it. A one-colour ridge is exactly 0; the shading in
 * world/mountains/shade.js puts every road above 0.30, so this is set well
 * clear of both and will catch a theme that turns the shading off by setting
 * `ambient` to 1.
 */
const FACES_FLOOR = 0.12;

const faces = {};
const notes = [];
for (const road of roads) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => notes.push(road + ': page error ' + e.message));
  await page.goto(server.url + '?god=1&stats=0&theme=' + road, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON && window.NEON.bike, null, { timeout: 20000 });
  await page.waitForTimeout(6000);

  if (PROVE) {
    await page.evaluate((radius) => {
      const m = window.NEON.config.world.mountains;
      m.enabled = true;
      m.gap.floor = 1;
      for (const layer of m.layers) layer.distance = radius;
      window.NEON.mountains.applyTheme();
    }, PROVE_RADIUS);
    await page.waitForTimeout(400);
  }

  const has = await page.evaluate(() => window.NEON.mountains.group.visible);
  if (!has) {
    notes.push(road + ': no mountains (the theme turns them off)');
    await page.close();
    continue;
  }

  const start = await page.evaluate(() => window.NEON.loop.state.distance || 0);
  for (let i = 0; i < SAMPLES; i++) {
    await page.waitForFunction(
      (args) => (window.NEON.loop.state.distance || 0) - args[0] >= args[1],
      [start, i * SAMPLE_GAP], { timeout: 120000 },
    ).catch(() => {});

    await page.evaluate(freeze, true);
    await page.waitForTimeout(260);
    const row = await page.evaluate(horizonRow);
    await page.screenshot({ path: DIR + '/' + road + '-' + i + '-with.png' });
    await page.evaluate(() => { window.NEON.mountains.group.visible = false; });
    await page.waitForTimeout(260);
    await page.screenshot({ path: DIR + '/' + road + '-' + i + '-without.png' });
    await page.evaluate(() => { window.NEON.mountains.group.visible = true; });
    await page.evaluate(freeze, false);
    await page.waitForTimeout(120);
    notes.push('HORIZON ' + road + ' ' + i + ' ' + row.toFixed(4));
    const spread = await page.evaluate(ridgeFaces);
    faces[road] = Math.min(faces[road] === undefined ? 1 : faces[road], spread);
  }
  await page.close();
}

await browser.close();
server.child.kill();

// Beside the captures, so tools/skyline-compare.py can be re-run against
// kept shots: moving a threshold must not cost another ride round six roads.
writeFileSync(DIR + '/horizons.txt',
  notes.filter((n) => n.startsWith('HORIZON'))
    .map((n) => n.slice('HORIZON '.length)).join(NL) + NL);
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
console.log('');
console.log('  floor ' + FACES_FLOOR.toFixed(2) + ', and a ridge painted one colour scores 0');

const compare = spawn('python', ['tools/skyline-compare.py',
  DIR, String(SAMPLES), roads.join(' '), SHOTS ? 'keep' : 'drop'],
{ stdio: 'inherit' });
compare.on('exit', (code) => {
  const green = code === 0 && flat === 0;
  if (PROVE) {
    // Inverted: a wall was put back on purpose, so silence is the failure.
    if (!green) {
      console.log('');
      console.log('--prove: the check bites - a ridge at ' + PROVE_RADIUS
        + ' units with no saddle is reported as a wall');
      process.exit(0);
    }
    console.log('');
    console.log('--prove FAILED: the ridges were dragged to ' + PROVE_RADIUS
      + ' units and this tool reported nothing. It is not checking anything.');
    process.exit(1);
  }
  if (flat) console.log(flat + ' road(s) have ridges with no faces');
  process.exit(green ? 0 : 1);
});
