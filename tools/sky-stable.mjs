/**
 * Does a road still look like itself five kilometres later - and does it look
 * the same whichever way you got to it?
 *
 *     node tools/sky-stable.mjs             # npm run sky
 *     node tools/sky-stable.mjs --theme=X   # one road
 *
 * ================= WHY =================
 *
 * Reported from a phone: three captures of ONE theme in ONE run showed an
 * orange sunset, a deep blue starfield and a teal night. A road that cannot
 * hold its own sky for the length of a run cannot have an identity, and "all
 * the roads look the same" turned out to be the symptom rather than the
 * disease - none of them held one long enough to have one.
 *
 * ================= WHY IT WALKS THE MENUS =================
 *
 * The fault was NOT reachable through `?theme=`, which is the path every tool
 * in this directory had ever taken. `?theme=` fits a theme as a patch before
 * the world is built. A PLAYER goes through the road screen, which previews
 * each card by starting a real ThemeBlend toward it as the card is swiped
 * past - and nothing finished the last one, so a run began mid-blend, wearing
 * the roads on the way to the one that was chosen.
 *
 * Measured, landing on Sunset Highway after swiping past Galaxy Road and
 * Aurora Pass: at the start line the blend was at t = 0.89, `aurora.intensity`
 * was 4.24 and the fog was 0x0d1420. Deep blue starfield, teal night, orange
 * sunset - the rider's three captures, in the order the cards are in.
 *
 * So this rides BOTH paths and holds them to each other. A check that took
 * only `?theme=` would have passed this bug every time, which is the same
 * lesson as the old `npm run bright`: a check that exercises one path proves
 * something about that path and nothing about the game.
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const W = 960;
const H = 540;
const DIR = 'tools/out/sky';
const SIZE = { width: W, height: H };
const ONE = (process.argv.find((a) => a.startsWith('--theme=')) || '').split('=')[1];

/**
 * `--prove` puts the bug back and expects this tool to say so.
 *
 * It stubs out `ThemeBlend.settle`, which IS the fix, so a run again starts
 * mid-blend wearing the roads that were swiped past on the way to it. A green
 * run of a check written after its own fault was already fixed proves nothing
 * at all; this is how the green is earned. It exits 0 only when it fails.
 */
const PROVE = process.argv.includes('--prove');

// The band ABOVE the horizon. The horizon sits near the middle of the frame,
// so the top third is sky and nothing else - no road, no verge, no cockpit,
// and no level banner, which is centred.
const SKY_BOTTOM = 0.34;

// WHERE TO PHOTOGRAPH, in metres from the first frame of the capture.
//
// INSIDE ONE LEVEL on both paths. A level line sits at 5000 m and the menu
// path starts its clock a few hundred metres in, so a mark at 4800 landed
// PAST the line, with the level's gate and banner in shot. 4000 is clear of
// it either way, and 0 and 4000 are the two captures this was asked to
// produce anyway.
const MARKS = [0, 2000, 4000];

// SEVERAL FRAMES PER MARK, because one frame is luck. The nebula breathes, the
// stars twinkle and the road turns; a single capture of a perfectly stable sky
// still differs from the next one. Averaging leaves what is true of the ROAD.
const FRAMES = 3;
const FRAME_GAP = 800;

// The two numbers the verdict is made from. What they mean and why the
// threshold is relative to a measured noise floor rather than fixed is
// written where the arithmetic is, in tools/sky-compare.py.
const FLOOR = 8.0;
const NOISE_MULTIPLE = 1.5;

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
const all = await probe.evaluate(() => Object.keys(window.NEON.config.themes));
await probe.close();
const roads = ONE ? [ONE] : all;
const skyHeight = Math.round(H * SKY_BOTTOM);

/**
 * Everything about the sky that a theme decides, as one string.
 *
 * The blend leak lasts about a second and a half, and the photographs below
 * cannot see it - they settle first, deliberately, because an unsettled frame
 * is a photograph of the reveal fade. So the pictures measure DRIFT OVER
 * DISTANCE, which is what they are good at, and this measures the FIRST
 * FRAME, which is where that fault lived and which it answers exactly.
 *
 * Read from config rather than off the screen because that is where the fault
 * was. `config.sky` is what every module copies onto the GPU, so two runs of
 * one road whose config agrees cannot look different.
 */
function skyPrint() {
  const s = window.NEON.config.sky;
  const d = s.dome;
  const parts = [
    d.colorBase, d.colorMid, d.colorTop,
    d.glow.color, d.glow.intensity.toFixed(3), d.glow.falloff.toFixed(3),
    d.glow.azimuth.toFixed(3), d.glow.elevation.toFixed(3),
    s.stars.twinkleAmount.toFixed(3), s.stars.trailBrightness.toFixed(3),
    s.aurora.intensity.toFixed(3), s.aurora.warmIntensity.toFixed(3),
    window.NEON.config.world.fog.color,
    window.NEON.config.world.fog.density.toFixed(5),
  ];
  for (const b of (s.bodies.list || [])) {
    parts.push('body', b.radius.toFixed(2), b.elevation.toFixed(4),
      b.azimuth.toFixed(4), b.color, b.opacity.toFixed(3));
  }
  for (const c of (s.nebula.clouds || [])) {
    parts.push('cloud', c.color, c.opacity.toFixed(3), c.scale.toFixed(1));
  }
  return parts.join(' ');
}

/**
 * Silences everything that tints the whole FRAME rather than the sky - the
 * checkpoint, finish and gate flashes. They were the first suspect here and
 * they are innocent, but a photograph taken inside one is a photograph of the
 * flash, and this check is about the sky.
 */
function hushFlashes() {
  const N = window.NEON;
  const sources = N.config.flash.sources;
  for (const key of Object.keys(sources)) sources[key].strength = 0;
  // THE GATES GO TOO, and for exactly the same reason as the flashes: a lit
  // arch spanning the road is temporary furniture, not the sky. Measured with
  // them in shot, Galaxy Road's sky band read (11,12,19) at one mark and
  // (100,42,45) at the next - a black sky apparently turning red, which is a
  // finish gate at a level line, photographed.
  for (const gate of [N.gate, N.checkpointGate, N.finishGate]) {
    if (!gate) continue;
    if (gate.disarm) gate.disarm();
    const node = gate.group || gate.mesh;
    if (node) node.visible = false;
  }
}

/**
 * Photographs the sky at every mark of one run.
 * @param {import('playwright').Page} page
 * @param {string} tag which path produced it, for the filenames
 * @param {string} road
 */
async function capture(page, tag, road) {
  // THE FRAME, NOT THE SCREEN. Everything that is not the canvas - the HUD,
  // the banner, the reveal fade - is DOM on top of it, and none of it is the
  // sky. Hidden rather than cropped around, because a banner moves and a crop
  // does not.
  await page.evaluate(() => {
    for (const el of document.body.children) {
      if (el.tagName !== 'CANVAS' && !el.querySelector('canvas')) el.style.display = 'none';
    }
  });
  const start = await page.evaluate(() => window.NEON.loop.state.distance || 0);
  for (const mark of MARKS) {
    await page.waitForFunction(
      (args) => (window.NEON.loop.state.distance || 0) - args[0] >= args[1],
      [start, mark], { timeout: 120000 },
    ).catch(() => {});
    for (let f = 0; f < FRAMES; f++) {
      if (f > 0) await page.waitForTimeout(FRAME_GAP);
      // Re-hushed every frame: a staged run ARMS its gates again as it goes,
      // so silencing them once only silences the first one.
      await page.evaluate(hushFlashes);
      await page.screenshot({
        path: DIR + '/' + road + '-' + tag + '-' + mark + '-' + f + '.png',
        clip: { x: 0, y: 0, width: W, height: skyHeight },
      });
    }
  }
}

/** The path every tool has always taken: a patch fitted before the build. */
async function viaTheme(road) {
  const page = await browser.newPage({ viewport: SIZE });
  await page.goto(server.url + '?god=1&stats=0&theme=' + road, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON && window.NEON.bike, null, { timeout: 20000 });
  await page.waitForTimeout(2500);
  const print = await page.evaluate(skyPrint);
  await page.evaluate(hushFlashes);
  await capture(page, 'patch', road);
  await page.close();
  return print;
}

/**
 * The path a RIDER takes: mode, bike, road, level - swiping across the whole
 * road grid on the way, which is what leaves preview blends half finished.
 */
async function viaFlow(road) {
  const page = await browser.newPage({ viewport: SIZE });
  const errors = [];
  page.on('pageerror', (e) => errors.push('page error ' + e.message));
  await page.goto(server.url + '?stats=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(W - 40, 40);
  await page.waitForTimeout(700);
  await page.click('.mode-screen .select-confirm');
  await page.waitForTimeout(400);
  await page.click('.bike-screen .select-confirm');
  await page.waitForTimeout(400);

  // A FULL LAP FIRST, then walk to the card. The lap is the point: every road
  // gets previewed, so whatever a preview leaves behind is at its worst by the
  // time the chosen one is confirmed.
  for (let i = 0; i < all.length; i++) {
    await page.click('.road-screen .select-arrow-next');
    await page.waitForTimeout(260);
  }
  // BY THE THEME THAT IS FITTED, not by `selection.road`. The road screen
  // previews a card by fitting it; `selection.road` does not move until the
  // card is CONFIRMED. Reading the wrong one walked past the target every
  // time and confirmed whichever card the guard ran out on - measured, three
  // roads in a row all started on Nebula Coast.
  let found = false;
  for (let guard = 0; guard < all.length * 2; guard++) {
    if (await page.evaluate(() => window.NEON.themes.name) === road) { found = true; break; }
    await page.click('.road-screen .select-arrow-next');
    await page.waitForTimeout(260);
  }
  if (!found) errors.push('never reached the ' + road + ' card on the road screen');
  if (PROVE) {
    await page.evaluate(() => { window.NEON.themeBlend.settle = () => {}; });
  }
  await page.click('.road-screen .select-confirm');
  await page.waitForTimeout(500);
  if (await page.isVisible('.level-screen').catch(() => false)) {
    await page.click('.level-screen .select-confirm');
    await page.waitForTimeout(600);
  }
  await page.waitForFunction(() => window.NEON.session.phase === 'running',
    null, { timeout: 10000 }).catch(() => {});

  // THE FIRST FRAME OF THE RUN, read before anything has had time to settle.
  // This is the measurement the whole fault turned on.
  const print = await page.evaluate(skyPrint);
  const blend = await page.evaluate(() => ({
    active: window.NEON.themeBlend.active,
    t: window.NEON.themeBlend.t,
  }));
  const atLine = { print, blending: blend.active, blendT: blend.t };

  // SETTLE BEFORE THE FIRST MARK. A run opens with the reveal fade and the
  // level banner over it, and a capture taken inside either is a capture of a
  // black screen or of a word. Measured before this wait: a noise floor of
  // 120 mean RGB between frames at ONE mark, which is larger than any real
  // difference between two roads and made the whole table meaningless.
  await page.waitForTimeout(2600);

  const landed = await page.evaluate(() => {
    const N = window.NEON;
    // THE BOT DRIVES, not god mode. God mode's phase is `free`, which is a
    // different run with no levels in it; this is the rider's own staged run
    // with somebody competent at the bars - see tools/level-check.mjs.
    N.config.autopilot.enabled = true;
    return N.themes.name;
  }).catch(() => null);
  await page.evaluate(hushFlashes);
  await capture(page, 'menu', road);
  await page.close();
  if (landed && landed !== road) errors.push('landed on ' + landed + ', not ' + road);
  return { errors, atLine };
}

const problems = [];
const lines = [];
for (const road of roads) {
  const expected = await viaTheme(road);
  const result = await viaFlow(road);
  for (const e of result.errors) problems.push(road + ': ' + e);

  const atLine = result.atLine;
  const same = atLine.print === expected;
  lines.push({ road, same, blending: atLine.blending, t: atLine.blendT });
  if (atLine.blending) {
    problems.push(road + ': a blend was STILL RUNNING at the start line (t = '
      + atLine.blendT.toFixed(2) + '), so the run opens by arriving at its own road');
  }
  if (!same) {
    problems.push(road + ': the sky at the start line is not this road sky'
      + '\n        through the menus: ' + atLine.print
      + '\n        by ?theme=       : ' + expected);
  }
}

console.log('');
console.log('THE FIRST FRAME OF A RUN, entered through the menus');
console.log('');
console.log('  ' + 'road'.padEnd(16) + 'blending'.padEnd(12) + 'sky matches ?theme=');
for (const l of lines) {
  const blending = l.blending ? 'YES t=' + l.t.toFixed(2) : 'no';
  console.log('  ' + l.road.padEnd(16) + blending.padEnd(12) + (l.same ? 'yes' : 'NO'));
}

await browser.close();
server.child.kill();
for (const p of problems) console.log('FAIL  ' + p);

// The picture half lives in tools/sky-compare.py - a hundred lines of Pillow,
// which is already this project's image toolchain. Its settings are passed in
// rather than repeated, so the two halves cannot disagree about what a mark
// is or where the captures are.
const compare = spawn('python', ['tools/sky-compare.py',
  DIR, String(FRAMES), FLOOR.toFixed(1), NOISE_MULTIPLE.toFixed(2),
  MARKS.join(','), roads.join(' ')], { stdio: 'inherit' });
compare.on('exit', (code) => {
  const green = code === 0 && !problems.length;
  if (PROVE) {
    // Inverted: the fix was stubbed out, so silence is the failure.
    if (!green) {
      console.log('');
      console.log('--prove: the check bites - ' + problems.length
        + ' problem(s) with the fix removed');
      process.exit(0);
    }
    console.log('');
    console.log('--prove FAILED: ThemeBlend.settle was stubbed out and this tool '
      + 'reported nothing. It is not checking anything.');
    process.exit(1);
  }
  process.exit(green ? 0 : 1);
});
