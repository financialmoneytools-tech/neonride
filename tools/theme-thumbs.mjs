/**
 * A thumbnail per built road, taken from the running game.
 *
 *     node tools/theme-thumbs.mjs
 *
 * Writes public/thumbs/<theme>.jpg, which ARE committed - they ship with the
 * road selection screen. Everything else this project puts on screen is
 * generated at runtime; these are pictures OF the runtime, produced by a
 * committed script from the game's own renderer, so the step from source to
 * shipped file stays repeatable rather than being a remembered manual export.
 * There is an ASSETS.md row for them.
 *
 * Not rendered live on the card. Four small live viewports would each want a
 * scene, a camera and a composer, on a phone that is already budgeted to the
 * frame - and the screen has to be readable before the first frame of the world
 * has been drawn, which a live preview by definition cannot be.
 *
 * god mode, so no title card, no HUD and no pause button land in the picture.
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
// Shot large and downscaled, so the neon survives: a thumbnail rendered
// directly at card size aliases every edge line in the scene into a dashed mess.
const SHOT_W = 1280;
const SHOT_H = 720;
const OUT_W = 480;
const OUT_H = 270;
const DIR = 'public/thumbs';
// Long enough for the bike to be at speed and for traffic to be in shot; a
// thumbnail of an empty road sells nothing.
const SETTLE = 7000;

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
const names = await probe.evaluate(() => Object.keys(window.NEON.config.themes));
await probe.close();
console.log('roads:', names.join(', '));

for (const name of names) {
  const page = await browser.newPage({ viewport: { width: SHOT_W, height: SHOT_H } });
  page.on('pageerror', (e) => console.log('PAGEERROR', name, e.message));
  await page.goto(`${server.url}?god=1&theme=${name}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.NEON && window.NEON.bike, null, { timeout: 20000 });
  await page.waitForTimeout(SETTLE);
  const renderer = await page.evaluate(() => {
    const gl = document.querySelector('#app canvas').getContext('webgl2');
    const d = gl.getExtension('WEBGL_debug_renderer_info');
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  // The TOP of the frame. The bottom 38 per cent is cockpit, and every road
  // would get a thumbnail of the same motorcycle.
  await page.screenshot({
    path: `${DIR}/${name}.jpg`,
    type: 'jpeg',
    quality: 82,
    clip: { x: 0, y: 0, width: SHOT_W, height: Math.round(SHOT_H * 0.62) },
  });
  console.log(`  ${name}  ${renderer.includes('SwiftShader') ? 'SOFTWARE RENDERED - do not ship' : 'ok'}`);
  await page.close();
}

await browser.close();
server.child.kill();

// SHOT LARGE, SHIPPED SMALL. The downscale happens here rather than by clipping
// a small viewport, because this scene is mostly thin bright lines and a road
// rendered straight to card size aliases every one of them into a dashed mess.
// Pillow is already a dependency of the two cockpit tools, so this is the same
// toolchain rather than a new one.
// AND THE MIXED CARD'S MONTAGE. TUM YOLLAR was the one card with no picture
// on it - a bare gradient beside six photographed roads, which reads as an
// empty slot rather than as an option. It cannot have a photograph, because
// it is not one place; what it gets instead is a vertical slice of every
// road that exists, in order, which is literally what the option does.
//
// BUILT FROM WHATEVER ROADS EXIST rather than from a list, so adding a
// seventh road updates this card by existing - the same rule the rest of
// this tool follows.
const script = [
  'import glob, os',
  'from PIL import Image',
  "shots = sorted(f for f in glob.glob('" + DIR + "/*.jpg') if 'mixed' not in f)",
  'for f in shots:',
  '    im = Image.open(f).convert("RGB")',
  '    im = im.resize((' + OUT_W + ', ' + OUT_H + '), Image.LANCZOS)',
  '    im.save(f, quality=86, optimize=True)',
  '    print("  %-16s %5.1f KB" % (os.path.basename(f), os.path.getsize(f) / 1024))',
  'if shots:',
  '    montage = Image.new("RGB", (' + OUT_W + ', ' + OUT_H + '))',
  '    n = len(shots)',
  '    for i, f in enumerate(shots):',
  '        im = Image.open(f).convert("RGB")',
  '        x0 = round(i * ' + OUT_W + ' / n)',
  '        x1 = round((i + 1) * ' + OUT_W + ' / n)',
  '        w = x1 - x0',
  '        cx = (im.width - w) // 2',
  '        montage.paste(im.crop((cx, 0, cx + w, im.height)), (x0, 0))',
  "    out = os.path.join('" + DIR + "', 'mixed.jpg')",
  '    montage.save(out, quality=86, optimize=True)',
  '    print("  %-16s %5.1f KB  (%d roads)" % ("mixed.jpg", os.path.getsize(out) / 1024, n))',
].join('\n');

const resize = spawn('python', ['-c', script], { stdio: 'inherit' });
resize.on('exit', (code) => {
  console.log(code === 0
    ? `\nwrote ${DIR}/*.jpg at ${OUT_W}x${OUT_H}`
    : `\nresize failed - the full size shots are still in ${DIR}`);
  process.exit(code === 0 ? 0 : 1);
});
