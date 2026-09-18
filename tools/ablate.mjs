/**
 * Which element actually lights the shoulder?
 *
 * Toggled from ONE FROZEN FRAME. A first version reloaded the page between
 * shots, which put the bike at a different point on the road each time - and
 * every ablation then produced the same drop, because what was being measured
 * was the reload, not the change.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
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
const theme = process.argv[2] || 'auroraPass';
const s = await startServer();
mkdirSync('tools/out', { recursive: true });
const b = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto(`${s.url}?god=1&theme=${theme}&stats=0`, { waitUntil: 'load' });
await p.waitForFunction(() => window.NEON, null, { timeout: 20000 });
await p.waitForTimeout(7000);
  // A REAL FREEZE. Setting `loop.paused = true` from outside does NOT work:
// main.js has a loop step that reassigns it from the session phase on every
// frame, so an external pause is undone before the next tick. Measured, the
// bike covered 476 units in 1.9 seconds while supposedly paused and 74 per
// cent of the pixels changed - which silently turned every before/after
// comparison into two different roads. Redefining the property is what
// actually holds, because the assignment in main.js then does nothing.
await p.evaluate(() => {
  Object.defineProperty(window.NEON.loop, 'paused', {
    get: () => true, set: () => {}, configurable: true,
  });
});
await p.waitForTimeout(500);
await p.screenshot({ path: `tools/out/ab-${theme}-base.png` });

const names = ['edges', 'markings', 'roadside', 'bloom', 'sheen', 'oncoming', 'banks', 'ground', 'streaks'];
for (const name of names) {
  await p.evaluate((which) => {
    const road = window.NEON.config.world.road;
    const N = window.NEON;
    window.__undo = [];
    if (which === 'edges') {
      const e = road.edges; const i = e.intensity; const h = e.halo;
      e.intensity = 0; e.halo = 0; N.road.surface.applyTheme();
      window.__undo.push(() => { e.intensity = i; e.halo = h; N.road.surface.applyTheme(); });
    } else if (which === 'markings') {
      const m = road.markings; const i = m.intensity;
      m.intensity = 0; N.road.surface.applyTheme();
      window.__undo.push(() => { m.intensity = i; N.road.surface.applyTheme(); });
    } else if (which === 'roadside') {
      N.roadside.group.visible = false;
      window.__undo.push(() => { N.roadside.group.visible = true; });
    } else if (which === 'bloom') {
      // THE CONFIG, not the pass. Postprocess.update reassigns
      // bloom.strength from config on EVERY frame, so setting it on the pass
      // is undone before the next tick - the same trap as loop.paused.
      const b = N.config.postprocess.bloom;
      const st = b.strength; const sg = b.speedGain;
      b.strength = 0; b.speedGain = 0;
      window.__undo.push(() => { b.strength = st; b.speedGain = sg; });
    } else if (which === 'sheen') {
      const v = road.surface.sheenStrength; road.surface.sheenStrength = 0; N.road.surface.applyTheme();
      window.__undo.push(() => { road.surface.sheenStrength = v; N.road.surface.applyTheme(); });
    } else if (which === 'streaks') {
      const st = N.config.postprocess.streaks; const v = st.strength;
      st.strength = 0;
      window.__undo.push(() => { st.strength = v; });
    } else if (which === 'banks') {
      const su = road.surface; const c = su.bankColor; const w = su.bankWidth;
      su.bankColor = 0x000000; su.bankWidth = 0; N.road.surface.applyTheme();
      window.__undo.push(() => { su.bankColor = c; su.bankWidth = w; N.road.surface.applyTheme(); });
    } else if (which === 'ground') {
      const su = road.surface; const c = su.groundColor;
      su.groundColor = 0x000000; N.road.surface.applyTheme();
      window.__undo.push(() => { su.groundColor = c; N.road.surface.applyTheme(); });
    } else if (which === 'oncoming') {
      N.oncoming.group.visible = false;
      window.__undo.push(() => { N.oncoming.group.visible = true; });
    }
  }, name);
  await p.waitForTimeout(350);
  await p.screenshot({ path: `tools/out/ab-${theme}-no-${name}.png` });
  await p.evaluate(() => { for (const fn of window.__undo) fn(); });
  await p.waitForTimeout(250);
}
await b.close(); s.child.kill(); process.exit(0);
