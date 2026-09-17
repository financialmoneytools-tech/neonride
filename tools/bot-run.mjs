/**
 * Is the road survivable by a PLAYER?
 *
 *     node tools/bot-run.mjs 3 start   # 3 km at the opening density
 *     node tools/bot-run.mjs 1 max     # 1 km at the capped maximum
 *
 * tools/god-run.mjs answers a different question. The autopilot has a guard
 * standing behind it that makes a collision impossible - it is a cheat, and it
 * is meant to be one - so a zero from that tool says nothing at all about
 * whether a human can ride the same road. This one drives with NO guard, using
 * the ordinary input path, and counts how often it is hit.
 *
 * The bot is deliberately simple: full throttle, and steer toward whichever
 * lane has the most clear road ahead. It is not meant to be good. A road that a
 * dumb bot can hold at full speed is a road a person has room to make decisions
 * on; a road that needs finesse to survive at all is one that needs less
 * traffic, not a better bot.
 *
 * crashesAllowed is lifted for the run, so one hit does not end it and the
 * figure is crashes per kilometre rather than distance-to-first-crash.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const KM = Number(process.argv[2] || 3);
const LEVEL = process.argv[3] === 'max' ? 'max' : 'start';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const NEWLINE = String.fromCharCode(10);

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('no dev server:' + NEWLINE + text)), 30000,
    );
    child.stdout.on('data', (chunk) => {
      text += String(chunk);
      const match = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve({ child, url: match[1].trim() });
      }
    });
    child.on('error', reject);
  });
}

function stop(child) {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

const server = await startServer();
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const failures = [];
page.on('pageerror', (error) => failures.push('pageerror: ' + error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') failures.push('console: ' + msg.text());
});

await page.goto(server.url + '?stats=1', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(900);
await page.mouse.click(640, 360); // the title card owns the first gesture
await page.waitForTimeout(1200);

await page.evaluate(([level]) => {
  const NEON = window.NEON;
  const traffic = NEON.traffic;
  const model = NEON.config.world.traffic.models.player;

  // One hit must not end the run, or the answer is "how far to the first
  // crash" rather than "how often does it crash".
  NEON.config.game.crashesAllowed = 1e9;

  // At the maximum, the ramp starts where it would otherwise end up.
  if (level === 'max') model.density.start = model.density.max;

  const bot = { hits: 0, startDistance: NEON.loop.state.distance || 0, lanes: traffic.lanes };
  window.__bot = bot;

  // THE INPUT PATH, not the physics. Wrapping update() means the bot's values
  // go through exactly the smoothing, the throttle floor and the lateral limit
  // a thumb would - a bot that wrote straight to the bike would be testing a
  // road nobody plays on.
  const input = NEON.input;
  const original = input.update.bind(input);
  input.update = (dt) => {
    const values = original(dt);
    const state = NEON.loop.state;
    const distance = state.distance || 0;
    const lateral = state.lateral || 0;

    // How much clear road each lane has ahead of it.
    const clear = bot.lanes.map(() => 900);
    for (const fleet of traffic.fleets) {
      const halfLength = fleet.type.size.length * 0.5;
      for (const vehicle of fleet.vehicles) {
        if (!vehicle.active) continue;
        const gap = vehicle.distance - halfLength - distance;
        if (gap < -10 || gap > 900) continue;
        const lane = vehicle.lane;
        if (gap < clear[lane]) clear[lane] = Math.max(0, gap);
      }
    }

    // The freest lane, with a small bias toward staying put so the bot does
    // not oscillate between two lanes that are equally clear.
    let best = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < clear.length; i++) {
      const cost = Math.abs(bot.lanes[i] - lateral) * 6;
      const score = clear[i] - cost;
      if (score > bestScore) { bestScore = score; best = i; }
    }

    const want = bot.lanes[best];
    values.steer = Math.max(-1, Math.min(1, (want - lateral) * 0.5));
    values.throttle = 1;
    values.brake = 0;
    return values;
  };

  // Count collisions as they are logged rather than sampling a decaying level.
  let lastHits = NEON.loop.state.hits || 0;
  NEON.loop.add(() => {
    const hits = NEON.loop.state.hits || 0;
    if (hits > lastHits) bot.hits += hits - lastHits;
    lastHits = hits;
  });
}, [LEVEL]);

// Wait for the distance rather than the clock: the figure is per kilometre.
const target = KM * 1000;
const deadline = Date.now() + Math.max(60000, KM * 40000);
let result = null;
while (Date.now() < deadline) {
  result = await page.evaluate(() => {
    const NEON = window.NEON;
    const bot = window.__bot;
    return {
      travelled: (NEON.loop.state.distance || 0) - bot.startDistance,
      hits: bot.hits,
      speed: NEON.loop.state.speed || 0,
      live: NEON.traffic.fleets.reduce(
        (n, f) => n + f.vehicles.filter((v) => v.active).length, 0,
      ),
    };
  });
  if (result.travelled >= target) break;
  await page.waitForTimeout(500);
}

await browser.close();
stop(server.child);

const km = result.travelled / 1000;
const perKm = km > 0 ? result.hits / km : 0;

console.log('');
console.log('bot run  ' + LEVEL + ' density');
console.log('  distance        ' + km.toFixed(2) + ' km of ' + KM);
console.log('  crashes         ' + result.hits);
console.log('  crashes per km  ' + perKm.toFixed(2));
console.log('  live vehicles   ' + result.live);
console.log('  speed at end    ' + result.speed.toFixed(0));

if (failures.length) {
  console.log('');
  console.log(failures.length + ' page errors:');
  for (const line of failures.slice(0, 6)) console.log('  ' + line);
}

// The bar: it has to COVER the distance, and it has to do it without being hit
// more than once a kilometre on average.
if (km < KM * 0.98 || perKm > 1 || failures.length) process.exit(1);
