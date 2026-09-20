/**
 * One capture of every vehicle type, from close behind, plus a frame of
 * mixed traffic - and what each type costs.
 *
 *     node tools/vehicle-shots.mjs          # npm run vehicles
 *     node tools/vehicle-shots.mjs --one=bus
 *
 * ================= WHY IT IS ONE PAGE =================
 *
 * The same rule the road tools learned: a browser page per subject is six
 * WebGL contexts and six warmups before anything is measured. This opens one
 * page, and rather than RIDING until a bus happens to appear - which for a
 * type mixed to 0.15 is a long wait and sometimes never - it parks the run
 * and places one vehicle of the wanted type directly behind the camera's
 * view. The world is already still; only the subject moves.
 *
 * The cost table is read off the live meshes, not off the config, so it
 * counts what the GPU is actually asked to draw.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\[[0-9;]*m', 'g');
const NL = String.fromCharCode(10);
const DIR = 'tools/out/vehicles';
const ONE = (process.argv.find((a) => a.startsWith('--one=')) || '').split('=')[1];
const W = 1280;
const H = 720;

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server')), 40000);
    child.stdout.on('data', (c) => {
      text += String(c);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve({ child, url: m[1].trim() }); }
    });
  });
}

const server = await startServer();
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(server.url + '?god=1&stats=0&theme=sunsetHighway', { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON && window.NEON.bike, null, { timeout: 20000 });
await page.waitForTimeout(3000);

mkdirSync(DIR, { recursive: true });

// THE MIXED FRAME FIRST, while the road is still being ridden normally, so it
// is the real traffic rather than an arrangement of it.
//
// WAITED FOR, not timed. Three seconds after load the density ramp has barely
// started and the shot came out as an empty road with a gantry on it - a
// truthful picture of nothing. This holds until the road ahead actually has
// vehicles of at least three different types on it, which is what the word
// "mixed" is doing in the deliverable.
const mixed = await page.waitForFunction(() => {
  const N = window.NEON;
  const at = N.loop.state.distance || 0;
  const kinds = new Set();
  let near = 0;
  for (const fleet of N.traffic.fleets) {
    for (const vehicle of fleet.vehicles) {
      if (!vehicle.active) continue;
      const gap = vehicle.distance - at;
      if (gap > 6 && gap < 55) { near++; kinds.add(fleet.type.name); }
    }
  }
  if (near < 4 || kinds.size < 3) return false;
  // PAUSED INSIDE THE TEST, deliberately. At 200 m/s the road moves 40 m
  // while a screenshot is taken, so a frame captured after the check has
  // already driven through the traffic the check was waiting for - which is
  // why the first version of this came back as an empty road again.
  N.loop.paused = true;
  return true;
}, null, { timeout: 90000, polling: 100 }).catch(() => null);
await page.waitForTimeout(120);
await page.screenshot({ path: DIR + '/mixed.png' });
console.log(DIR + '/mixed.png   mixed traffic' + (mixed ? '' : '  (never filled up)'));

const cost = await page.evaluate(() => {
  const N = window.NEON;
  const rows = [];
  for (const fleet of N.traffic.fleets) {
    let triangles = 0;
    let calls = 0;
    for (const mesh of fleet.mesh.meshes) {
      triangles += mesh.geometry.index.count / 3;
      calls++;
    }
    rows.push({ name: fleet.type.name, triangles, calls, pool: fleet.vehicles.length });
  }
  return rows;
});

const names = ONE ? [ONE] : cost.map((r) => r.name);
for (const name of names) {
  // PARK THE RUN, then put one of these where the camera can see it. Pausing
  // first means the subject is the only thing that moves, so every capture is
  // the same road at the same place and the vehicle is the only difference.
  await page.evaluate((wanted) => {
    const N = window.NEON;
    N.loop.paused = true;
    const at = N.loop.state.distance || 0;
    for (const fleet of N.traffic.fleets) {
      for (let i = 0; i < fleet.vehicles.length; i++) {
        const vehicle = fleet.vehicles[i];
        if (fleet.type.name !== wanted || i > 0) {
          vehicle.active = false;
          continue;
        }
        // OFF THE VEHICLE'S OWN LENGTH, and one WHOLE lane over.
        //
        // The first version put every type at a fixed 1.9 m of lateral, which
        // is half a lane - so a 2.5 m wide bus had its flank 0.65 m from the
        // camera centreline and the capture came out from inside it. A lane
        // is 3.6 m and the offset has to be one, not a number that happens to
        // clear a car.
        //
        // The gap behind is scaled too: 12 m behind a sedan frames it, and 12
        // m behind a 16 m semi frames a wall.
        vehicle.active = true;
        // CLOSE BEHIND, which is what the spec asks these captures to show.
        // Scaled by length so a semi is framed rather than filling the shot.
        const gap = 5 + fleet.type.size.length * 0.85;
        vehicle.distance = at + fleet.type.size.length * 0.5 + gap;
        // NEARLY DEAD AHEAD. The spec asks whether each type is identifiable
        // FROM BEHIND, so the rear is the shot; a small offset keeps it clear
        // of the cockpit sprite without turning it into a flank view. A full
        // lane over put a 2.5 m wide vehicle half outside the frame at this
        // range, and a semi filled it.
        const across = (window.NEON.loop.state.lateral || 0) + 1.2;
        vehicle.lane = 2;
        vehicle.lateral = across;
        vehicle.laneLateral = across;
      }
    }
    // One frame, by hand, so the parked world still writes the new matrices.
    N.traffic.update(0.0001, N.loop.state);
  }, name);
  await page.waitForTimeout(150);
  await page.screenshot({ path: DIR + '/' + name + '.png' });
  const row = cost.find((r) => r.name === name);
  console.log(DIR + '/' + name + '.png   ' + row.triangles + ' triangles, '
    + row.calls + ' draw calls, pool ' + row.pool);
}

const lines = ['type          triangles  draw calls  pool  fleet triangles'];
let total = 0;
for (const row of cost) {
  total += row.triangles * row.pool;
  lines.push(row.name.padEnd(13)
    + String(row.triangles).padStart(9)
    + String(row.calls).padStart(12)
    + String(row.pool).padStart(6)
    + String(row.triangles * row.pool).padStart(17));
}
lines.push('');
lines.push('whole fleet, every pool live: ' + total + ' triangles, '
  + cost.reduce((n, r) => n + r.calls, 0) + ' draw calls');
console.log(NL + lines.join(NL));
writeFileSync(DIR + '/cost.txt', lines.join(NL) + NL);

await browser.close();
if (process.platform === 'win32') {
  spawn('taskkill', ['/pid', String(server.child.pid), '/T', '/F'], { stdio: 'ignore' });
} else server.child.kill('SIGTERM');
