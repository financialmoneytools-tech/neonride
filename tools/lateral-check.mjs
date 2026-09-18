/**
 * Does the bike stay on its own carriageway at full speed and full lock?
 *
 *     node tools/lateral-check.mjs        # npm run lateral
 *
 * Reported as "lateral +6.60 again - I rode outside the lanes onto the
 * shoulder". 6.60 is the clamp in config/player.js, so the question is whether
 * the clamp holds and whether 6.60 is actually the shoulder.
 */
import { spawn } from 'node:child_process';
import { chromium, devices } from 'playwright';
const ANSI = new RegExp(String.fromCharCode(27) + '\[[0-9;]*m', 'g');
function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('no server')), 30000);
    child.stdout.on('data', (c) => { text += String(c);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(t); res({ child, url: m[1].trim() }); } });
  });
}
const s = await startServer();
const b = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const ctx = await b.newContext({ ...devices['Pixel 7'], viewport: { width: 740, height: 320 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto(s.url + '?god=1&theme=auroraPass&stats=0', { waitUntil: 'load' });
await p.waitForFunction(() => window.NEON, null, { timeout: 20000 });
await p.waitForTimeout(4000);

const geom = await p.evaluate(() => {
  const c = window.NEON.config;
  return { limit: c.player.bike.lateralLimit, half: c.world.traffic.collision.playerHalfWidth };
});

// Full throttle and full lock, both ways, driven through the ordinary input
// path rather than by writing lateral directly - a clamp that only holds when
// it is set by hand is not a clamp.
const worst = await p.evaluate(async () => {
  const N = window.NEON;
  let max = 0;
  const seen = [];
  for (const dir of [1, -1, 1, -1]) {
    const until = performance.now() + 2500;
    while (performance.now() < until) {
      N.loop.state.input = { steer: dir, throttle: 1, brake: 0 };
      await new Promise((r) => requestAnimationFrame(r));
      const lat = Math.abs(N.bike.lateral);
      if (lat > max) max = lat;
    }
    seen.push(+N.bike.lateral.toFixed(3));
  }
  return { max: +max.toFixed(3), seen, speed: +N.bike.speed.toFixed(1) };
});
await b.close(); s.child.kill();

const layout = {
  laneCentres: [-5.7, -1.9, 1.9, 5.7],
  laneWidth: 3.8,
  edgeLine: 7.6,
  shoulderEdge: 10.2,
};
const outerLaneOuter = layout.laneCentres[3] + layout.laneWidth / 2;
console.log(`\nclamp            +/-${geom.limit}`);
console.log(`worst |lateral|   ${worst.max}   at ${worst.speed} u/s, full lock both ways`);
console.log(`settled          ${JSON.stringify(worst.seen)}`);
console.log(`\noutermost lane   ${layout.laneCentres[3] - layout.laneWidth / 2} .. ${outerLaneOuter}`);
console.log(`edge line        ${layout.edgeLine}`);
console.log(`hard shoulder    ${layout.edgeLine} .. ${layout.shoulderEdge}`);
console.log(`bike half width  ${geom.half}  -> at the clamp the bike spans `
  + `${(geom.limit - geom.half).toFixed(2)} .. ${(geom.limit + geom.half).toFixed(2)}`);

const failures = [];
if (worst.max > geom.limit + 0.01) {
  failures.push(`the clamp leaked: |lateral| reached ${worst.max} against a limit of ${geom.limit}`);
}
if (geom.limit + geom.half > layout.edgeLine) {
  failures.push(`at the clamp the bike's outer edge reaches ${(geom.limit + geom.half).toFixed(2)}, `
    + `past the edge line at ${layout.edgeLine} - it is on the shoulder`);
}
console.log('');
if (failures.length) {
  for (const f of failures) console.log('FAIL  ' + f);
  process.exit(1);
}
console.log('lateral-check: the clamp holds and the bike stays inside the edge line');
process.exit(0);
