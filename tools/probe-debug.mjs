import { spawn } from 'node:child_process';
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
const s = await startServer();
const b = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('console', (m) => console.log('CONSOLE', m.type(), m.text().slice(0, 200)));
p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
p.on('response', (r) => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
await p.goto(s.url + 'probe.html', { waitUntil: 'load' });
await p.waitForTimeout(9000);
const info = await p.evaluate(() => {
  const P = window.PROBE;
  const cam = P.camera;
  let meshes = 0, lit = 0;
  const names = [];
  P.scene.traverse((o) => {
    if (o.isMesh) { meshes++; if (names.length < 8) names.push(o.material.type + ':' + (o.material.map ? (o.material.map.image ? 'img' : 'NOIMG') : 'nomap')); }
    if (o.isLight) lit++;
  });
  return {
    meshes, lights: lit,
    cam: { x: cam.position.x, y: cam.position.y, z: cam.position.z, rx: cam.rotation.x, fov: cam.fov },
    layout: P.built && P.built.layout ? Object.keys(P.built.layout) : null,
    laneCentres: P.built && P.built.layout ? P.built.layout.laneCentres : null,
    mats: names,
    bg: P.scene.background ? P.scene.background.getHexString() : null,
  };
});
console.log(JSON.stringify(info, null, 1));
const px = await p.evaluate(() => {
  const c = document.querySelector('canvas');
  const t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
  return null;
});
await p.screenshot({ path: 'tools/out/probe-debug.png' });
await b.close(); s.child.kill(); process.exit(0);
