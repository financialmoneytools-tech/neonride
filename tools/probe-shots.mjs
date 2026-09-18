/**
 * The realism probe, photographed against the current look.
 *
 *     node tools/probe-shots.mjs
 *
 * Two screenshots at 1280x720 from the SAME camera - same eye height, same
 * field of view, same downward pitch - and the counters for each. The cockpit
 * sprite is hidden in both, because the question is what the ROAD looks like
 * and the drawn cockpit would cover the bottom third of the answer.
 *
 * The current look is photographed in god mode with the bike held still, so
 * the two frames are of a road rather than of two different moments.
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

const server = await startServer();
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});

function renderer(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const d = gl.getExtension('WEBGL_debug_renderer_info');
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
}

// --- 1. the current look -------------------------------------------------
const game = await browser.newPage({ viewport: { width: W, height: H } });
game.on('pageerror', (e) => console.log('GAME PAGEERROR', e.message));
await game.goto(`${server.url}?god=1&theme=auroraPass&stats=0`, { waitUntil: 'load' });
await game.waitForFunction(() => window.NEON && window.NEON.rider, null, { timeout: 20000 });
await game.waitForTimeout(6000);
console.log('game renderer:', await renderer(game));

// The cockpit off, so this is a photograph of the ROAD and not of the drawn
// bike. And waited until nothing is sitting in the camera's lap: the first
// attempt caught a semi two metres ahead filling half the frame, which compares
// a truck against a road surface.
await game.evaluate(() => {
  window.NEON.rider.group.visible = false;
});
await game.waitForFunction(() => {
  const t = window.NEON.traffic;
  const d = window.NEON.loop.state.distance || 0;
  for (const fleet of t.fleets) {
    for (const v of fleet.vehicles) {
      if (!v.active) continue;
      const gap = v.distance - d;
      if (gap > -8 && gap < 26) return false;
    }
  }
  return true;
}, null, { timeout: 30000 }).catch(() => console.log('note: never found a clear road'));
await game.waitForTimeout(150);
const gameStats = await game.evaluate(() => {
  const info = window.NEON.engine.renderer.info;
  let bytes = 0;
  const seen = new Set();
  window.NEON.engine.scene.traverse((o) => {
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of mats) {
      for (const k of Object.keys(m)) {
        const v = m[k];
        if (!v || !v.isTexture || seen.has(v.uuid)) continue;
        seen.add(v.uuid);
        const img = v.image;
        if (img && img.width) bytes += img.width * img.height * 4 * 1.333;
      }
    }
  });
  return {
    drawCalls: info.render.calls,
    triangles: info.render.triangles,
    textures: info.memory.textures,
    geometries: info.memory.geometries,
    programs: info.programs ? info.programs.length : 0,
    textureMB: +(bytes / 1024 / 1024).toFixed(1),
    fps: window.NEON.loop && window.NEON.loop.fps ? +window.NEON.loop.fps.toFixed(1) : null,
  };
});
await game.screenshot({ path: `${OUT}/compare-a-current.png` });
console.log('current :', JSON.stringify(gameStats));
await game.close();

// --- 2. the probe --------------------------------------------------------
const probe = await browser.newPage({ viewport: { width: W, height: H } });
probe.on('pageerror', (e) => console.log('PROBE PAGEERROR', e.message));
probe.on('console', (m) => { if (m.type() === 'error') console.log('PROBE CONSOLE', m.text()); });
await probe.goto(`${server.url}probe.html`, { waitUntil: 'load' });
await probe.waitForFunction(() => window.PROBE && window.PROBE.stats && window.PROBE.stats.ready,
  null, { timeout: 40000 });
// Let the frame rate settle and every texture finish decoding.
await probe.waitForTimeout(7000);
console.log('probe renderer:', await renderer(probe));
const probeStats = await probe.evaluate(() => window.PROBE.stats);
await probe.evaluate(() => { document.getElementById('readout').hidden = true; });
await probe.waitForTimeout(400);
await probe.screenshot({ path: `${OUT}/compare-b-probe.png` });
console.log('probe   :', JSON.stringify(probeStats));

// --- 3. the probe, stripped to what a phone might take -------------------
await probe.goto(`${server.url}probe.html?quality=low`, { waitUntil: 'load' });
await probe.waitForFunction(() => window.PROBE && window.PROBE.stats && window.PROBE.stats.ready,
  null, { timeout: 40000 });
await probe.waitForTimeout(6000);
const lowStats = await probe.evaluate(() => window.PROBE.stats);
await probe.evaluate(() => { document.getElementById('readout').hidden = true; });
await probe.waitForTimeout(300);
await probe.screenshot({ path: `${OUT}/compare-c-probe-low.png` });
console.log('probe low:', JSON.stringify(lowStats));

await browser.close();
server.child.kill();
console.log(`\nwrote ${OUT}/compare-*.png`);
process.exit(0);
