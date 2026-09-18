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
 *   - any button on the pause card sitting outside the viewport
 *   - tilt steering inverted between the two landscape orientations
 *   - an audio context still suspended after the tap
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

/**
 * Makes the context behave like a phone with an accelerometer.
 *
 * Headless Chromium has no sensors, so tilt always falls back to touch - and
 * ControlsPanel hides the sensitivity and recentre buttons when it does. A
 * viewport check run against that card is checking two buttons out of four and
 * calling the card fine. It also meant the gravity path this whole round was
 * written for had NO automated coverage at all.
 *
 * So the context is given a synthetic devicemotion stream, in the same shape a
 * real one arrives in: accelerationIncludingGravity, about 9.8 in total, in the
 * device's own frame. The roll is swept slowly so a reading is never stale.
 * @param {import('playwright').BrowserContext} context
 */
async function fakeTilt(context) {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('neon-ride.controls',
        JSON.stringify({ mode: 'tilt', sensitivity: 1 }));
    } catch (error) {
      // A context without storage still gets the events below.
    }

    const G = 9.81;
    let phase = 0;
    setInterval(() => {
      phase += 0.12;
      // Landscape: the phone is rolled about the axis running away from the
      // rider, so gravity swings between the device's x and y.
      const lean = Math.sin(phase) * 0.45; // radians, about +/-26 degrees
      const detail = {
        accelerationIncludingGravity: {
          x: Math.sin(lean) * G,
          y: Math.cos(lean) * G,
          z: 0.4,
        },
      };
      let event;
      try {
        event = new window.DeviceMotionEvent('devicemotion', detail);
      } catch (error) {
        // Not constructible everywhere; a plain event with the field on it is
        // read the same way by the listener.
        event = new Event('devicemotion');
        event.accelerationIncludingGravity = detail.accelerationIncludingGravity;
      }
      window.dispatchEvent(event);
    }, 40);
  });
}

/**
 * Which buttons on the pause card are not fully on the screen.
 *
 * A card that OPENS is not the same as a card you can use, and only the first
 * of those was ever being checked. On a landscape phone this one had its
 * control switch, its sensitivity and its recentre button below the bottom
 * edge, with nothing to scroll because the page does not scroll.
 * @param {import('playwright').Page} page
 */
async function panelGeometry(page) {
  return page.evaluate(() => {
    const bad = [];
    let shown = 0;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const el of document.querySelectorAll('.panel button, .panel .controls-btn')) {
      if (el.hidden || el.offsetParent === null) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      shown++;
      // WITH A MARGIN. A button whose edge is exactly on the viewport edge is
      // inside it arithmetically and unreachable with a thumb.
      const M = 8;
      if (r.top < M || r.left < M || r.bottom > h - M || r.right > w - M) {
        bad.push((el.textContent || el.className).trim().slice(0, 28)
          + ' [' + Math.round(r.left) + ',' + Math.round(r.top)
          + ' ' + Math.round(r.right) + ',' + Math.round(r.bottom) + ']');
      }
    }
    return { bad, w, h, buttons: shown };
  });
}

/**
 * The pause card again, in a context the size a landscape phone actually is.
 *
 * A SECOND CONTEXT rather than a resize: setViewportSize is refused inside a
 * mobile emulation context, and 900x414 - the profile everything else runs in -
 * fits the old stacked card with room to spare. A geometry check run only there
 * passes on the exact layout that was reported broken on the hardware.
 * @returns {Promise<string[]>} failures
 */
/**
 * Every pressable thing on a selection screen, against the viewport.
 *
 * Separate from panelGeometry because the pause card and these screens fail
 * differently: the pause card overflows downward when its blocks stack, and
 * these overflow SIDEWAYS when the road cards do not fit. Both end with a
 * control nobody can reach and nothing to scroll.
 */
async function selectGeometry(page, selector, size) {
  const bad = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return [];
    const out = [];
    for (const button of root.querySelectorAll('button')) {
      if (button.disabled) continue;
      const box = button.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;
      if (box.left < -1 || box.top < -1
        || box.right > window.innerWidth + 1
        || box.bottom > window.innerHeight + 1) {
        out.push(`${button.className.split(' ')[0]} at ${Math.round(box.left)},`
          + `${Math.round(box.top)} ${Math.round(box.width)}x${Math.round(box.height)}`);
      }
    }
    return out;
  }, selector);
  return bad.map((line) => `${selector} button outside the ${size.width}x${size.height} viewport: ${line}`);
}

async function checkShortViewport(browser, base) {
  // 740x320, and the size is measured rather than picked. The old stacked card
  // put its lowest button at exactly 360 on a 360 tall viewport - inside by the
  // letter of the test and flush against the bottom edge in practice - and
  // overflowed by 10 at 340 and 20 at 320. A landscape phone with its browser
  // chrome showing is in that range, which is where this was reported from.
  const SHORT = { width: 740, height: 320 };
  const context = await browser.newContext({
    ...devices['Pixel 7'], viewport: SHORT, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
  });
  await fakeTilt(context);
  const page = await context.newPage();
  const failures = [];
  try {
    await page.goto(base, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(700);
    await page.tap('body', { position: { x: 700, y: 60 }, force: true }).catch(() => {});
    await page.waitForTimeout(900);
    // THROUGH THE SELECTION SCREENS. This check is about the PAUSE card's
    // geometry on a short viewport, and the bike and road screens now stand
    // between the title tap and a running game. Walked with the confirm button
    // rather than skipped with stored values, because the walk is also how the
    // two new screens get their own geometry checked at this size.
    for (const selector of ['.bike-screen .select-confirm', '.road-screen .select-confirm']) {
      await page.waitForSelector(selector, { timeout: 5000 }).catch(() => {});
      for (const line of await selectGeometry(page, selector.split(' ')[0], SHORT)) {
        failures.push(line);
      }
      await page.click(selector).catch(() => {});
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(900);
    if (!(await page.isVisible('.pause-button').catch(() => false))) {
      failures.push(`no pause button at ${SHORT.width}x${SHORT.height}`);
      return failures;
    }
    await page.tap('.pause-button', { force: true });
    await page.waitForTimeout(600);
    const result = await panelGeometry(page);
    for (const line of result.bad) {
      failures.push(`pause card button outside the ${SHORT.width}x${SHORT.height} viewport: ${line}`);
    }
    if (result.buttons < 4) {
      failures.push(`pause card showed ${result.buttons} buttons, expected 4 in tilt mode`);
    }

    // THE GRAVITY PATH ITSELF. devicemotion has to be the source that answered,
    // and a phone being rolled has to produce a steering value - the exact
    // thing that was silently doing nothing on the device.
    const tilt = await page.evaluate(() => {
      const c = window.NEON && window.NEON.controls;
      if (!c) return null;
      return { source: c.source, motion: c.motionReadings, mode: c.mode, live: c.live };
    });
    if (!tilt) failures.push('no controls on window.NEON');
    else if (tilt.source !== 'motion') {
      failures.push(`tilt source is ${tilt.source}, expected motion (${tilt.motion} readings)`);
    } else if (tilt.mode !== 'tilt') {
      failures.push(`tilt fell back to ${tilt.mode} with a live motion sensor`);
    }
  } finally {
    await context.close();
  }
  return failures;
}

/**
 * Tilt has to steer the way the rider leans, in BOTH landscape orientations.
 *
 * The device reports gravity in its own portrait frame, so the same physical
 * roll arrives as completely different numbers at angle 90 and at angle 270 -
 * and core/Controls.js rotates them into screen space before reading a sign.
 * That rotation is the thing worth testing: get it wrong and the steering is
 * inverted for riders who happened to turn their phone the other way, which is
 * a bug that reads as "the bike is broken" rather than as an axis error.
 *
 * The roll is defined in SCREEN space and converted into each orientation's
 * device frame, which is exactly what a rider leaning left does. Both must come
 * out with the same sign, and it must be the sign config.controls.tilt.invert
 * asks for.
 * @returns {Promise<string[]>} failures
 */
async function checkTiltDirection(browser, base) {
  const failures = [];
  const readings = {};

  for (const angle of [90, 270]) {
    const context = await browser.newContext({
      ...devices['Pixel 7'], viewport: { width: 900, height: 414 },
      isMobile: true, hasTouch: true,
    });
    await context.addInitScript(([lockAngle]) => {
      try {
        window.localStorage.setItem('neon-ride.controls',
          JSON.stringify({ mode: 'tilt', sensitivity: 1 }));
      } catch (error) { /* the events below still arrive */ }

      // Pin the orientation this run is pretending to be in.
      try {
        Object.defineProperty(window.screen.orientation, 'angle',
          { get: () => lockAngle, configurable: true });
      } catch (error) {
        window.__angleLocked = false;
      }

      const G = 9.81;
      const ROLL = -25 * Math.PI / 180;
      const a = lockAngle * Math.PI / 180;
      const cos = Math.cos(a);
      const sin = Math.sin(a);

      // LEVEL FIRST, THEN LEAN, AND THE TEST SAYS WHEN. The neutral is wherever
      // the phone was being held when the first reading arrived - that is the
      // whole design - so a constant lean IS the neutral and steers nothing.
      // A timer is not good enough either: the game is constructed some way
      // into page load, and if the lean has already started by then the neutral
      // is captured leaning. So the page holds level until the test has
      // confirmed a neutral exists and calls this.
      window.__roll = 0;
      window.__lean = () => { window.__roll = ROLL; };
      setInterval(() => {
        const roll = window.__roll;
        // The rider's roll lives in screen space; the device reports it in the
        // portrait frame, so it is rotated into that frame here - the inverse
        // of what Controls does when it reads it back.
        const sx = Math.sin(roll) * G;
        const sy = Math.cos(roll) * G;
        const x = sx * cos - sy * sin;
        const y = sx * sin + sy * cos;

        let event;
        const detail = { accelerationIncludingGravity: { x, y, z: 0.4 } };
        try {
          event = new window.DeviceMotionEvent('devicemotion', detail);
        } catch (error) {
          event = new Event('devicemotion');
          event.accelerationIncludingGravity = detail.accelerationIncludingGravity;
        }
        window.dispatchEvent(event);
      }, 40);
    }, [angle]);

    const page = await context.newPage();
    try {
      await page.goto(base, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(700);
      await page.tap('body', { position: { x: 800, y: 60 }, force: true }).catch(() => {});

      // Wait for a neutral to exist before leaning, so the zero is the level
      // hold rather than the lean itself.
      await page.waitForFunction(() => {
        const c = window.NEON && window.NEON.controls;
        return !!c && c.live && c._neutral !== null;
      }, null, { timeout: 15000 }).catch(() => null);

      await page.evaluate(() => window.__lean && window.__lean());
      await page.waitForTimeout(1200); // the low pass filter settling

      const state = await page.evaluate(() => {
        const c = window.NEON && window.NEON.controls;
        if (!c) return null;
        return {
          steer: c.steer, source: c.source, mode: c.mode,
          angle: c.angle, locked: window.__angleLocked !== false,
          invert: window.NEON.config.controls.tilt.invert,
          raw: c._raw, neutral: c._neutral, live: c.live,
          reads: c.motionReadings, grav: { x: c.gravity.x, y: c.gravity.y },
        };
      });

      if (!state) { failures.push('no controls on window.NEON'); continue; }
      if (!state.locked || state.angle !== angle) {
        // Not a failure of the game: this browser would not let the test pin
        // the orientation, so it has nothing to say about that orientation.
        console.log(`  (could not pin screen angle ${angle}; skipped)`);
        continue;
      }
      if (state.source !== 'motion') {
        failures.push(`angle ${angle}: tilt source ${state.source}, expected motion`);
        continue;
      }
      readings[angle] = state.steer;
      console.log('  angle ' + angle + ' raw ' + Number(state.raw).toFixed(2)
        + ' neutral ' + Number(state.neutral).toFixed(2)
        + ' steer ' + Number(state.steer).toFixed(3)
        + ' mode ' + state.mode + ' reads ' + state.reads
        + ' g ' + state.grav.x.toFixed(2) + ',' + state.grav.y.toFixed(2));
    } finally {
      await context.close();
    }
  }

  const a = readings[90];
  const b = readings[270];
  if (a === undefined || b === undefined) return failures;

  if (Math.abs(a) < 0.15 || Math.abs(b) < 0.15) {
    failures.push(`a held 25 degree lean barely steered: ${a.toFixed(3)} at 90, `
      + `${b.toFixed(3)} at 270`);
  }
  if (Math.sign(a) !== Math.sign(b)) {
    failures.push(`tilt is INVERTED between landscape orientations: ${a.toFixed(3)} at 90 `
      + `versus ${b.toFixed(3)} at 270 for the same physical lean`);
  }
  return failures;
}

/**
 * Walks the bike and road screens the way a thumb would, and checks the things
 * that only go wrong on a small screen.
 *
 * Every button is checked against the VIEWPORT, not against its own styling: a
 * card whose confirm button sits two pixels below a 320px viewport looks
 * perfect in a screenshot and cannot be pressed, and there is nothing to scroll
 * because the page does not scroll.
 *
 * @returns {Promise<boolean>} whether it reached a running game
 */
async function walkSelection(page, failures) {
  const screens = [
    { name: 'bike', selector: '.bike-screen' },
    { name: 'road', selector: '.road-screen' },
  ];

  for (const screen of screens) {
    await page.waitForTimeout(700);
    if (!(await page.isVisible(screen.selector).catch(() => false))) {
      failures.push(`the ${screen.name} screen never appeared`);
      return false;
    }

    // Every pressable thing has to be inside the frame, with a margin.
    const offscreen = await page.evaluate((selector) => {
      const root = document.querySelector(selector);
      if (!root) return ['no screen'];
      const bad = [];
      for (const button of root.querySelectorAll('button')) {
        if (button.disabled) continue;
        const box = button.getBoundingClientRect();
        if (box.width === 0 && box.height === 0) continue;
        if (box.left < -1 || box.top < -1
          || box.right > window.innerWidth + 1
          || box.bottom > window.innerHeight + 1) {
          bad.push(`${button.className.split(' ')[0]} at `
            + `${Math.round(box.left)},${Math.round(box.top)} `
            + `${Math.round(box.width)}x${Math.round(box.height)}`);
        }
        // A thumb needs something to aim at.
        if (box.height < 28) bad.push(`${button.className.split(' ')[0]} only ${Math.round(box.height)}px tall`);
      }
      return bad;
    }, screen.selector);
    for (const problem of offscreen) {
      failures.push(`${screen.name} screen: ${problem}`);
    }

    // The driving hints are pictures of the brake and the throttle. They must
    // not be sitting across a menu telling somebody how to stop.
    if (await page.isVisible('.hints').catch(() => false)) {
      const shown = await page.evaluate(() => {
        const el = document.querySelector('.hints');
        return el && getComputedStyle(el).opacity !== '0' && !el.hidden;
      });
      if (shown) failures.push(`${screen.name} screen: the driving hints are showing over it`);
    }

    // Change the selection, so the screen is exercised rather than just seen.
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    await page.click(`${screen.selector} .select-confirm`).catch(() => {});
  }

  await page.waitForTimeout(900);
  if (await page.isVisible('.road-screen').catch(() => false)) {
    failures.push('the road screen is still up after confirming - the run never started');
    return false;
  }
  return true;
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
  await page.waitForTimeout(1200);

  // The check that would have caught the above. Everything after this point
  // assumes the card is gone, so a card still on screen has to fail here rather
  // than as a confusing symptom further down.
  if (await page.isVisible('.start-screen').catch(() => false)) {
    failures.push('title card still up after the tap - the flow never started');
  }

  // --- THE SELECTION FLOW: title -> bike -> road -> run -------------------
  //
  // Walked, not skipped. These two screens stand between every player and
  // every run, so a fault in either is a fault in the whole game - and they are
  // the only part of this build whose layout has to survive a 740x320 viewport
  // with a cockpit already occupying the bottom third of it.
  const walked = await walkSelection(page, failures);
  if (walked) await page.waitForTimeout(4000);

  const fault = await pictureFault(page);
  if (fault) failures.push(fault);

  // AUDIO HAS TO BE RUNNING AFTER A GESTURE. Silence on a phone had exactly
  // this shape: a context built inside the tap, coming up suspended, and
  // Audio.start() setting its own _started flag before resuming - so the one
  // attempt was the only attempt and nothing ever tried again.
  const sound = await page.evaluate(() => {
    const a = window.NEON && window.NEON.audio;
    if (!a) return null;
    return { state: a.state, gestures: a.gestures, muted: a.muted, gain: a.gain };
  });
  if (!sound) failures.push('no audio on window.NEON');
  else if (sound.gestures === 0) failures.push('no gesture reached the audio unlock');
  else if (sound.state !== 'running') {
    failures.push(`audio context is ${sound.state} after ${sound.gestures} gestures`);
  }

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
    else {
      // EVERY BUTTON ON THE PAUSE CARD HAS TO BE ON THE SCREEN. A landscape
      // phone is about 360 CSS pixels tall and this card had six stacked
      // blocks in it: on a real handset the control switch, the sensitivity
      // and the recentre button were simply below the bottom edge, with
      // nothing to scroll because the page does not scroll. A card that opens
      // is not the same as a card you can use, and only one of those was
      // being checked.
      const offscreen = await panelGeometry(page);
      for (const line of offscreen.bad) {
        failures.push(`pause card button outside the ${offscreen.w}x${offscreen.h} viewport: ${line}`);
      }
    }
  }

  for (const line of await checkShortViewport(browser, `${base}${query}`)) failures.push(line);
  for (const line of await checkTiltDirection(browser, `${base}${query}`)) failures.push(line);

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
