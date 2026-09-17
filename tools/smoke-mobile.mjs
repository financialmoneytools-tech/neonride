/**
 * Does the game actually run on a phone?
 *
 *     npm run smoke        # starts the dev server itself and checks it
 *     node tools/smoke-mobile.mjs http://localhost:5173/   # against a running one
 *
 * This exists because a one-line scope mistake in BikePhysics shipped, and the
 * only symptom on the device was a black screen: the loop threw on its first
 * tick, no frame was ever drawn, and every readout that would have explained it
 * never updated. The desktop build was fine, `npm run build` was fine, and both
 * measure tools passed. Nothing in the repo could see it.
 *
 * So it drives a real browser in a real phone profile - landscape viewport,
 * hasTouch, isMobile - taps through the title card, and fails on any of:
 *
 *   - a console error or a page exception
 *   - a canvas that is still a single flat colour after five seconds
 *   - a title card still on screen, which means the run never started
 *   - a stats overlay still reading "measuring...", which means the loop
 *     never completed a tick
 *   - a pause button that does not open the pause card
 *
 * The black-canvas check is a pixel check on purpose. "Did it throw" and "is
 * anything on screen" are different questions, and the failure this was written
 * for could have been either.
 */

import { spawn } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import { chromium, devices } from 'playwright';

const URL_ARG = process.argv.find((a) => a.startsWith('http'));
// A theme to check, because a theme can break startup on its own: it is a patch
// applied before anything is built, so a bad value in one reaches the
// constructor of whatever reads it and nothing else in the repo would see it.
//     npm run smoke -- auroraPass
const THEME = process.argv.slice(2).find((a) => !a.startsWith('http')) || '';
const PORT = 5173;
const BASE = URL_ARG || `http://localhost:${PORT}/`;
const OWN_SERVER = !URL_ARG;

// Landscape, because the game refuses to run in portrait and would show the
// rotate gate instead of anything worth checking.
const PHONE = {
  ...devices['Pixel 7'],
  viewport: { width: 900, height: 414 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
};

/**
 * Starts the dev server and returns the URL IT ACTUALLY BOUND.
 *
 * Not the one we asked for. Vite hops to the next free port when 5173 is taken
 * and prints the new one, so a test that assumes 5173 quietly checks whichever
 * stale server is squatting there - which is the same trap that sent a
 * Cloudflare tunnel to a 404. The URL is parsed out of its own output.
 */
function startServer() {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(), shell: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  return new Promise((resolve, reject) => {
    const done = setTimeout(
      () => reject(new Error(`dev server did not start. Output:
${out}`)), 30000);
    child.stdout.on('data', (chunk) => {
      out += String(chunk);
      const match = out.replace(/\[[0-9;]*m/g, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (match) {
        clearTimeout(done);
        resolve({ child, url: match[1].trim() });
      }
    });
    child.on('error', reject);
  });
}

/** Minimal 8-bit RGBA PNG reader, enough for a screenshot. */
function decodePng(buffer) {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const chunks = [];
  for (let at = 8; at + 8 <= buffer.length;) {
    const length = buffer.readUInt32BE(at);
    const type = buffer.toString('ascii', at + 4, at + 8);
    if (type === 'IDAT') chunks.push(buffer.subarray(at + 8, at + 8 + length));
    if (type === 'IEND') break;
    at += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const out = new Uint8Array(width * height * 4);
  const line = new Uint8Array(stride);
  const prev = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= 4 ? line[i - 4] : 0;
      const b = prev[i];
      const c = i >= 4 ? prev[i - 4] : 0;
      let value = src[i];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
        value += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      line[i] = value & 0xff;
    }
    out.set(line, y * stride);
    prev.set(line);
  }
  return { width, height, data: out };
}

/**
 * A description of what is wrong with the picture, or null when it looks alive.
 *
 * A SCREENSHOT, not the canvas element. Reading a WebGL canvas with drawImage
 * comes back empty unless the context was made with preserveDrawingBuffer,
 * which this one is not and should not be - so the first version of this check
 * reported a flat canvas on a frame that was rendering perfectly well.
 *
 * Clipped to a patch of sky and road on the right, where none of the DOM
 * overlays sit. Otherwise a black canvas with the HUD on top of it would pass
 * on the strength of the HUD.
 */
async function pictureFault(page) {
  const clip = { x: 520, y: 70, width: 320, height: 110 };
  const png = decodePng(await page.screenshot({ type: 'png', clip }));
  let min = 255;
  let max = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    const lum = (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    if (lum < min) min = lum;
    if (lum > max) max = lum;
  }
  const spread = max - min;
  return spread < 6
    ? `picture is flat (luminance ${min.toFixed(0)}..${max.toFixed(0)}) - nothing rendered`
    : null;
}

/**
 * Kills the server AND its children.
 *
 * spawn with shell:true starts a shell that starts vite, so child.kill() takes
 * down the shell and leaves vite holding the port. They pile up across runs
 * until the next one binds a different port and checks the wrong server.
 */
function stopServer(child) {
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      return;
    } catch (error) {
      // Fall through to the portable path.
    }
  }
  child.kill('SIGTERM');
}

/** The first line of a multi-line message, for a one-line failure. */
function firstLine(text) {
  const s = String(text);
  const at = s.indexOf(String.fromCharCode(10));
  return at < 0 ? s : s.slice(0, at);
}

/** The error panel's text, or null when it is not up. */
async function readErrorPanel(page) {
  const visible = await page.isVisible('.error-panel').catch(() => false);
  return visible ? (await page.textContent('.error-panel').catch(() => '')) : null;
}

async function main() {
  let server = null;
  let base = BASE;
  if (OWN_SERVER) {
    const started = await startServer();
    server = started.child;
    base = started.url;
    console.log(`dev server: ${base}${THEME ? '  theme ' + THEME : ''}`);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();

  const failures = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') failures.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));

  // ?stats=1 so the overlay is up and its text can be read back. It is the
  // cheapest proof that the loop completed a tick.
  const query = '?stats=1' + (THEME ? '&theme=' + THEME : '');
  await page.goto(`${base}${query}`, { waitUntil: 'load', timeout: 30000 });

  // The title card owns the first gesture. Tapped, not clicked: the card
  // listens for pointerdown, and a phone profile should be exercised the way a
  // phone would.
  await page.waitForTimeout(700);

  // CHECKED BEFORE THE TAP. The error panel covers the screen, so a crash during
  // startup makes every later tap time out - and the run then fails with a
  // Playwright TimeoutError that says nothing about the actual fault. Read it
  // first and report what it says.
  const early = await readErrorPanel(page);
  if (early) {
    console.log('error panel:');
    console.log(early);
  }

  // TOP RIGHT, AND NOT THE MIDDLE. The title card carries the reduced-motion
  // toggle at its centre, and that toggle stops the pointerdown from reaching
  // the window listener on purpose, so that changing the setting does not also
  // start the run. A tap at the centre of the frame therefore landed on the
  // toggle every single time: the card stayed up, the run never began, and this
  // test spent five seconds measuring the title screen while flipping reduced
  // motion on and off in storage. Everything below it passed anyway, because
  // the world renders behind the card and the loop ticks behind it too.
  //
  // `force` for a different reason: whatever else is wrong, the tap itself
  // should not be the thing that gets reported.
  await page.tap('body', { position: { x: 750, y: 90 }, force: true }).catch(() => {});
  await page.waitForTimeout(5000);

  // The check that would have caught the above. Everything after this point
  // assumes a running game, so a card still on screen has to fail here rather
  // than as a confusing symptom further down.
  if (await page.isVisible('.start-screen').catch(() => false)) {
    failures.push('title card still up after the tap - the run never started');
  }

  const fault = await pictureFault(page);
  if (fault) failures.push(fault);

  const statsText = await page.textContent('.stats-overlay').catch(() => null);
  if (statsText === null) failures.push('no stats overlay');
  else if (statsText.includes('measuring')) {
    failures.push('stats overlay still reads "measuring..." - the loop never ticked');
  }

  // The pause button is the only way into the card without a keyboard.
  const pauseVisible = await page.isVisible('.pause-button').catch(() => false);
  if (!pauseVisible) failures.push('pause button not visible');
  else {
    await page.tap('.pause-button', { force: true });
    await page.waitForTimeout(600);
    const panelUp = await page.isVisible('.controls-panel').catch(() => false);
    if (!panelUp) failures.push('pause card did not open, or has no control switch');
  }

  const late = await readErrorPanel(page);
  if (late && !early) {
    console.log('error panel:');
    console.log(late);
  }

  console.log(statsText ? statsText.split('\n').slice(0, 4).join('\n') : '(no overlay)');
  await browser.close();
  if (server) stopServer(server);

  if (failures.length) {
    console.log(`\n${failures.length} FAILED:`);
    for (const line of failures) console.log(`  ${line}`);
    process.exit(1);
  }
  console.log('\nsmoke-mobile: ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
