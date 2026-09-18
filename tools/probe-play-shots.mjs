/**
 * Screenshots of the PLAYABLE realism probe, and what it costs to draw.
 *
 *     node tools/probe-play-shots.mjs
 *
 * Branch `probe/realism` only. It rides for a few seconds before shooting, so
 * the frames have traffic in them and the bike is at speed rather than pulling
 * away from a standstill - a realistic look is easiest to flatter with an empty
 * road, and an empty road is not what the game is.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\[[0-9;]*m', 'g');
const W = 1280;
const H = 720;
const OUT = 'tools/out';

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

mkdirSync(OUT, { recursive: true });
const server = await startServer();
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

const shots = [
  { name: 'chase', query: '' },
  { name: 'first-person', query: '?fp=1' },
  { name: 'low', query: '?quality=low' },
  { name: 'ungraded', query: '?raw=1' },
];

for (const shot of shots) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.log('PAGEERROR', shot.name, e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await page.goto(`${server.url}probe-play.html${shot.query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.PROBE, null, { timeout: 25000 });
  // Ridden, not posed: long enough to be at speed and to have traffic in shot.
  await page.waitForTimeout(9000);

  const stats = await page.evaluate(() => {
    const P = window.PROBE;
    return {
      speed: Math.round((P.loop.state.speed || 0) * 3.6),
      distance: Math.round(P.loop.state.distance || 0),
      hits: P.loop.state.hits || 0,
      nearMisses: P.loop.state.nearMisses || 0,
      score: P.session.score,
      lives: P.session.lives,
      phase: P.session.phase,
      drawCalls: P.renderer.info.render.calls,
      triangles: P.renderer.info.render.triangles,
      textures: P.renderer.info.memory.textures,
      programs: P.renderer.info.programs ? P.renderer.info.programs.length : 0,
    };
  });
  console.log(shot.name, JSON.stringify(stats));
  await page.screenshot({ path: `${OUT}/probe-play-${shot.name}.png` });
  await page.close();
}

await browser.close();
server.child.kill();
console.log(`wrote ${OUT}/probe-play-*.png at ${W}x${H}`);
process.exit(0);
