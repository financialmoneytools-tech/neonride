/**
 * A thumbnail per built road, taken from the running game.
 *
 *     node tools/theme-thumbs.mjs            # npm run thumbs
 *     node tools/theme-thumbs.mjs --one=sunsetHighway
 *
 * Writes public/thumbs/<theme>.jpg, which ARE committed - they ship with the
 * road selection screen. Everything else this project puts on screen is
 * generated at runtime; these are pictures OF the runtime, produced by a
 * committed script from the game's own renderer, so the step from source to
 * shipped file stays repeatable rather than being a remembered manual export.
 * There is an ASSETS.md row for them.
 *
 * Not rendered live on the card. Six small live viewports would each want a
 * scene, a camera and a composer, on a phone already budgeted to the frame -
 * and the screen has to be readable before the first frame of the world has
 * been drawn, which a live preview by definition cannot be.
 *
 * god mode, so no title card, no HUD and no pause button land in the picture.
 *
 * ================= WHAT WAS WRONG WITH THE OLD ONES =================
 *
 * SQUASHED. The capture was clipped to 1280x446 - 2.87:1 - and then resized
 * to 480x270, which is 1.78:1. That is a NON-UNIFORM scale, so every circle
 * in the frame came out a vertical oval; the retro sun on Sunset Highway was
 * reported as exactly that. Nothing here scales non-uniformly now: the band
 * is CLIPPED at the final aspect by the browser, which is a crop, and then
 * downscaled with both axes divided by the same number.
 *
 * BLURRY. 480x270 was a quarter of what the card needs. The card fills most
 * of a phone and a phone renders at a device pixel ratio of 3, so the
 * thumbnail box measures 1317x366 real pixels there and 1496x416 at 16:9 on
 * a dpr 2 laptop. Anything smaller is an upscale, which is the soft look.
 *
 * A FRAME OF EMPTY ROAD SELLS NOTHING. Each road now says where in the frame
 * its own subject is - the sun, the aurora, the skyline - and the band is cut
 * around that rather than from the middle every time.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const NL = String.fromCharCode(10);

// Rendered big and shipped smaller, because this scene is mostly thin bright
// lines and a road rendered straight to card size aliases every one of them
// into a dashed mess.
const SHOT_W = 1920;
const SHOT_H = 1080;

/**
 * THE SHIPPED SIZE, and it is derived rather than chosen.
 *
 * `.road-shot` in index.html is a fixed 3.6:1 box on every viewport - see the
 * comment there for why 3.6 and not 16/9. Measured, that box is 1317x366
 * device pixels on a 740x320 phone at dpr 3, and 1496x416 at 16:9 on a dpr 2
 * screen. 1512x420 clears both, so the card never upscales.
 */
const OUT_W = 1512;
const OUT_H = 420;
const ASPECT = OUT_W / OUT_H; // 3.6

// The clipped band, at exactly the shipped aspect so the downscale below is
// uniform on both axes. 1908 keeps it inside the 1920 frame after centring.
const BAND_W = 1908;
const BAND_H = Math.round(BAND_W / ASPECT); // 530
const BAND_X = Math.round((SHOT_W - BAND_W) / 2);

const DIR = 'public/thumbs';
// Long enough for the bike to be at speed and for traffic to be in shot.
const SETTLE = 7000;
/**
 * HOW FAR DOWN THE ROAD EACH ONE IS SHOT, where the default frames badly.
 *
 * The sign gantries are road furniture and belong in these pictures, but at
 * 7 seconds on Sunset Highway one lands squarely across the retro sun - and
 * the sun is the entire reason that road looks like that. The world is a
 * function of DISTANCE, so riding a little further moves the furniture
 * without changing anything else.
 */
const SETTLE_BY_ROAD = {
  sunsetHighway: Number(process.env.THUMB_SETTLE || 10600),
};
const ONE = (process.argv.find((a) => a.startsWith('--one=')) || '').split('=')[1];

/**
 * WHERE EACH ROAD KEEPS ITS SUBJECT, as a fraction of the frame height that
 * the band is centred on.
 *
 * The cockpit owns the bottom 38 per cent, so nothing below about 0.62 is
 * worth photographing. Above that, what matters is different per road: the
 * sun and the planet sit just over the horizon, the aurora is higher, and the
 * city's whole point is the wet asphalt under the skyline, which is lower.
 * A road with no entry gets the default, which is a band of horizon.
 */
const FOCUS = {
  sunsetHighway: 0.34, // the retro sun, centred 11 degrees up
  auroraPass: 0.30, // the curtain reaches well above the ridge
  nebulaCoast: 0.32, // the two moons
  redPlanet: 0.34, // the planet on the horizon
  neonMetropolis: 0.42, // skyline AND the reflections under it
  galaxyRoad: 0.36, // the band of stars
};
const DEFAULT_FOCUS = 0.36;

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
mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

// Which roads exist is read from the game, not typed here, so a new theme gets
// a thumbnail by existing rather than by being remembered.
const probe = await browser.newPage({ viewport: { width: 640, height: 360 } });
await probe.goto(server.url + '?god=1', { waitUntil: 'load' });
await probe.waitForFunction(() => window.NEON, null, { timeout: 20000 });
const all = await probe.evaluate(() => Object.keys(window.NEON.config.themes));
await probe.close();
const names = ONE ? all.filter((n) => n === ONE) : all;
console.log('roads:', names.join(', '));
console.log('band:  ' + BAND_W + 'x' + BAND_H + ' clipped from ' + SHOT_W + 'x' + SHOT_H
  + ', shipped at ' + OUT_W + 'x' + OUT_H + ' (aspect ' + ASPECT.toFixed(2) + ')');

let software = false;
for (const name of names) {
  const page = await browser.newPage({ viewport: { width: SHOT_W, height: SHOT_H } });
  page.on('pageerror', (e) => console.log('PAGEERROR', name, e.message));
  await page.goto(`${server.url}?god=1&theme=${name}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON && window.NEON.bike, null, { timeout: 20000 });
  const settle = SETTLE_BY_ROAD[name] === undefined ? SETTLE : SETTLE_BY_ROAD[name];
  await page.waitForTimeout(settle);
  const renderer = await page.evaluate(() => {
    const gl = document.querySelector('#app canvas').getContext('webgl2');
    const d = gl.getExtension('WEBGL_debug_renderer_info');
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });

  const focus = FOCUS[name] === undefined ? DEFAULT_FOCUS : FOCUS[name];
  // Centred on this road's own subject, and kept inside the frame.
  const top = Math.max(0, Math.min(SHOT_H - BAND_H, Math.round(focus * SHOT_H - BAND_H / 2)));

  // CLIPPED, NOT SCALED. A clip is a crop: the pixels that survive are the
  // pixels that were rendered, at the aspect they will ship at.
  await page.screenshot({
    path: `${DIR}/${name}.jpg`,
    type: 'jpeg',
    quality: 92,
    clip: { x: BAND_X, y: top, width: BAND_W, height: BAND_H },
  });
  const bad = renderer.includes('SwiftShader');
  if (bad) software = true;
  console.log('  ' + name.padEnd(16) + ' focus ' + focus.toFixed(2)
    + '  settle ' + settle
    + '  band y ' + top + '..' + (top + BAND_H)
    + (bad ? '  SOFTWARE RENDERED - do not ship' : ''));
  await page.close();
}

await browser.close();
server.child.kill();

// THE DOWNSCALE, AND THE MIXED CARD'S MONTAGE.
//
// Both axes are divided by the same number, which is the whole point of this
// step: the band was clipped at 3.6:1 and it ships at 3.6:1.
//
// TUM YOLLAR cannot have a photograph, because it is not one place. What it
// gets instead is a vertical slice of every road that exists, in order, which
// is literally what the option does - and each slice is CROPPED from its
// road's thumbnail rather than resized into place, so nothing is distorted
// there either.
const script = [
  'import glob, os',
  'from PIL import Image',
  // ONLY WHAT THIS RUN CAPTURED. It used to glob the directory, so
  // `--one` resized the OTHER five as well - taking already-shipped 480x270
  // files and stretching them to 3.6:1, which is the exact distortion this
  // rewrite exists to remove. A smoke run must not be able to damage the
  // roads it did not shoot.
  'names = ' + JSON.stringify(names),
  "shots = [os.path.join('" + DIR + "', n + '.jpg') for n in names]",
  'for f in shots:',
  '    im = Image.open(f).convert("RGB")',
  '    before = im.size',
  '    im = im.resize((' + OUT_W + ', ' + OUT_H + '), Image.LANCZOS)',
  '    im.save(f, quality=90, optimize=True)',
  '    print("  %-16s %sx%s -> %sx%s  %5.1f KB" % (',
  '        os.path.basename(f), before[0], before[1], im.width, im.height,',
  '        os.path.getsize(f) / 1024))',
  // The montage is built from EVERY road on disk, not just this run's, or a
  // single-road run would rebuild TUM YOLLAR out of one road.
  "allshots = sorted(f for f in glob.glob('" + DIR + "/*.jpg') if 'mixed' not in f)",
  'if allshots:',
  '    montage = Image.new("RGB", (' + OUT_W + ', ' + OUT_H + '))',
  '    n = len(allshots)',
  '    for i, f in enumerate(allshots):',
  '        im = Image.open(f).convert("RGB")',
  '        x0 = round(i * ' + OUT_W + ' / n)',
  '        x1 = round((i + 1) * ' + OUT_W + ' / n)',
  '        w = x1 - x0',
  '        cx = (im.width - w) // 2',
  '        montage.paste(im.crop((cx, 0, cx + w, im.height)), (x0, 0))',
  "    out = os.path.join('" + DIR + "', 'mixed.jpg')",
  '    montage.save(out, quality=90, optimize=True)',
  '    print("  %-16s %sx%s  %5.1f KB  (%d roads)" % (',
  '        "mixed.jpg", montage.width, montage.height, os.path.getsize(out) / 1024, n))',
].join(NL);

writeFileSync('tools/out/thumb-resize.py', script);
const resize = spawn('python', ['tools/out/thumb-resize.py'], { stdio: 'inherit' });
resize.on('exit', (code) => {
  if (software) console.log(NL + 'SOFTWARE RENDERED somewhere above - do not ship these');
  console.log(code === 0
    ? NL + 'wrote ' + DIR + '/*.jpg at ' + OUT_W + 'x' + OUT_H
    : NL + 'resize failed - the clipped bands are still in ' + DIR);
  process.exit(code === 0 && !software ? 0 : 1);
});
