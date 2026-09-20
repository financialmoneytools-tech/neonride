/**
 * A thumbnail for each MODE card, taken from the running game.
 *
 *     node tools/mode-thumbs.mjs        # npm run modethumbs
 *     node tools/mode-thumbs.mjs --one=stage
 *
 * Writes public/thumbs/mode-stage.jpg and public/thumbs/mode-endless.jpg,
 * which are committed and ship with the mode screen. Same rule as the road
 * thumbnails in tools/theme-thumbs.mjs: pictures OF the runtime, produced by a
 * committed script from the game's own renderer.
 *
 * SAME SIZE AND SAME ASPECT AS THE ROAD CARDS, deliberately. The two screens
 * are the same shell with the same card shape, so a mode thumbnail that was a
 * different shape would be the road-thumbnail squash all over again - and
 * `npm run thumbcheck` measures every file in the directory, so a wrong shape
 * here fails the same check.
 *
 * ================= WHY IT IS NOT god MODE =================
 *
 * The road thumbnails are shot in god mode precisely to keep the HUD out of
 * the picture, because a road is a place. A MODE is a set of rules, and the
 * HUD is where the rules are visible: the stage progress and the clock are
 * what KOŞU means, and a big distance is what SONSUZ means. So these are shot
 * with the HUD up, in a real run of the mode they are advertising.
 *
 *   KOŞU     a real staged run, ridden to a level boundary, so the frame has
 *            the lit gate in it and the SEVİYE banner over it.
 *   SONSUZ   a real endless run with a long way already on the clock.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const NL = String.fromCharCode(10);

const SHOT_W = 1920;
const SHOT_H = 1080;
// The shipped size and the band, both copied from tools/theme-thumbs.mjs
// because they must agree: the same `.road-shot` box renders both.
const OUT_W = 1512;
const OUT_H = 420;
const ASPECT = OUT_W / OUT_H; // 3.6
const BAND_W = 1908;
const BAND_H = Math.round(BAND_W / ASPECT); // 530
const BAND_X = Math.round((SHOT_W - BAND_W) / 2);
// Lower than a road's band: the HUD is the subject here and it lives in the
// corners of the frame, so the band has to reach further down to include it
// without falling into the cockpit.
const FOCUS = 0.40;
const TOP = Math.max(0, Math.min(SHOT_H - BAND_H, Math.round(FOCUS * SHOT_H - BAND_H / 2)));

const DIR = 'public/thumbs';
const ONE = (process.argv.find((a) => a.startsWith('--one=')) || '').split('=')[1];
// A road that photographs well and is not the one on the road cards beside it.
const ROAD = 'auroraPass';

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server')), 30000);
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

/**
 * @param {string} name the file, without extension
 * @param {(page: import('playwright').Page) => Promise<string>} drive
 *   sets the run up and resolves once the frame is worth taking
 */
async function shoot(name, drive) {
  const page = await browser.newPage({ viewport: { width: SHOT_W, height: SHOT_H } });
  page.on('pageerror', (e) => console.log('PAGEERROR', name, e.message));
  await page.goto(server.url + '?theme=' + ROAD + '&stats=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  // The title card owns the first gesture.
  await page.mouse.click(SHOT_W / 2, SHOT_H / 2);
  await page.waitForTimeout(700);

  const note = await drive(page);

  await page.screenshot({
    path: DIR + '/' + name + '.jpg',
    type: 'jpeg',
    quality: 92,
    clip: { x: BAND_X, y: TOP, width: BAND_W, height: BAND_H },
  });
  const renderer = await page.evaluate(() => {
    const gl = document.querySelector('#app canvas').getContext('webgl2');
    const d = gl.getExtension('WEBGL_debug_renderer_info');
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  const bad = renderer.includes('SwiftShader');
  console.log('  ' + name.padEnd(14) + note + (bad ? '  SOFTWARE RENDERED - do not ship' : ''));
  await page.close();
  return !bad;
}

const wanted = ONE ? [ONE] : ['stage', 'endless'];
let ok = true;
console.log('band:  ' + BAND_W + 'x' + BAND_H + ' clipped from ' + SHOT_W + 'x' + SHOT_H
  + ', shipped at ' + OUT_W + 'x' + OUT_H + ' (aspect ' + ASPECT.toFixed(2) + ')');

if (wanted.includes('stage')) {
  ok = await shoot('mode-stage', async (page) => {
    // A SHORT LEVEL, so the gate and the banner arrive in seconds rather than
    // in four minutes. Everything else is the real thing: a real staged run
    // reaching a real level boundary, which lights the real gate and raises
    // the real banner. Shortening the level does not simulate any of that -
    // `stage.length` is what drives the finish, the same hook npm run stage
    // and npm run smoke both use.
    await page.evaluate(() => {
      const N = window.NEON;
      N.config.stage.length = 900;
      N.config.levels.rampMeters = 1;
      N.config.autopilot.enabled = true;
      N.selection.setMode('stage');
      N.selection.setRoad('auroraPass');
      N.beginRun(1);
    });
    // Ride until the banner is on screen AND THE FLASH HAS GONE. Waited for,
    // not timed, on both counts.
    //
    // The banner is up for a couple of seconds at a level boundary, so a
    // fixed sleep either misses it or catches it fading. The gate flash peaks
    // on the same frame the banner appears, and the first version of this
    // caught exactly that: a muddy olive wash with a road somewhere behind
    // it. The flash decays faster than the banner lasts, so there is a window
    // where both are true, and this waits for it.
    await page.waitForFunction(() => {
      const el = document.querySelector('.level-banner');
      if (!el) return false;
      const style = getComputedStyle(el);
      const up = style.opacity !== '0' && style.display !== 'none' && !el.hidden;
      if (!up) return false;
      const flash = window.NEON.flash;
      let lit = 0;
      for (const name of Object.keys(flash._level)) lit = Math.max(lit, flash._level[name]);
      return lit < 0.12;
    }, null, { timeout: 60000, polling: 50 });
    return await page.evaluate(() => {
      const N = window.NEON;
      let lit = 0;
      for (const name of Object.keys(N.flash._level)) lit = Math.max(lit, N.flash._level[name]);
      return 'level ' + N.loop.state.level + ', banner up, flash ' + lit.toFixed(2);
    });
  }) && ok;
}

if (wanted.includes('endless')) {
  ok = await shoot('mode-endless', async (page) => {
    await page.evaluate(() => {
      const N = window.NEON;
      N.config.autopilot.enabled = true;
      N.selection.setMode('endless');
      N.selection.setRoad('auroraPass');
      N.beginRun(1);
    });
    await page.waitForTimeout(2200);
    // A LONG WAY ALREADY DONE. The run's distance is measured from where it
    // started, so moving that mark back is the same as having ridden it -
    // and the world is a function of ABSOLUTE distance, which is untouched,
    // so the road in the picture is a road that really is 47 km in.
    await page.evaluate(() => {
      const N = window.NEON;
      N.session._startDistance -= 47000;
    });
    await page.waitForTimeout(1800);
    return await page.evaluate(() => {
      const N = window.NEON;
      return Math.round(N.session.distance) + ' m, score ' + N.session.score;
    });
  }) && ok;
}

await browser.close();
server.child.kill();

// Downscaled with both axes divided by the same number, exactly as the road
// thumbnails are: the band was clipped at 3.6:1 and it ships at 3.6:1.
const script = [
  'import os',
  'from PIL import Image',
  'names = ' + JSON.stringify(wanted.map((w) => 'mode-' + w)),
  "shots = [os.path.join('" + DIR + "', n + '.jpg') for n in names]",
  'for f in shots:',
  '    im = Image.open(f).convert("RGB")',
  '    before = im.size',
  '    im = im.resize((' + OUT_W + ', ' + OUT_H + '), Image.LANCZOS)',
  '    im.save(f, quality=90, optimize=True)',
  '    print("  %-16s %sx%s -> %sx%s  %5.1f KB" % (',
  '        os.path.basename(f), before[0], before[1], im.width, im.height,',
  '        os.path.getsize(f) / 1024))',
].join(NL);

writeFileSync('tools/out/mode-thumb-resize.py', script);
const resize = spawn('python', ['tools/out/mode-thumb-resize.py'], { stdio: 'inherit' });
resize.on('exit', (code) => {
  console.log(code === 0
    ? NL + 'wrote ' + DIR + '/mode-*.jpg at ' + OUT_W + 'x' + OUT_H
    : NL + 'resize failed - the clipped bands are still in ' + DIR);
  process.exit(code === 0 && ok ? 0 : 1);
});
