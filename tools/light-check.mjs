/**
 * Do a vehicle's lights stay attached to the vehicle?
 *
 *     node tools/light-check.mjs            # npm run lights
 *     node tools/light-check.mjs 40         # watch for 40 seconds
 *
 * Exits non-zero if any light mesh's world-space box leaves its own vehicle's
 * body box by more than a tolerance.
 *
 * ================= WHY THIS EXISTS =================
 *
 * Tail lights were reported floating clear of their vehicles: a lit rear panel
 * in mid air with the body drawn separately behind it. The same fault was
 * reported once before, on a truck, and was recorded as fixed - it was not, it
 * was HIDDEN, by setting that one type's `outlineGain` to 0 so the offending
 * mesh was never built. Switching a symptom off is how a fault survives being
 * fixed, and it is why this measures instead of trusting the picture.
 *
 * ================= WHAT IT MEASURES, AND WHY THAT =================
 *
 * A vehicle is four InstancedMeshes sharing one instance matrix per vehicle:
 * body, strip (flank lights and the rear outline), tail (lamps, bar, plate) and
 * glow (the pool under it and the rear halo). Because the matrix is shared, a
 * separation CANNOT come from the matrices - and that is the point. It has to
 * come from a geometry built in the wrong place, or from a per-mesh scale
 * applied about the wrong origin, and both of those show up as a world-space
 * box that has left the body.
 *
 * TWO CHECKS, because there are two ways to detach.
 *
 * 1. THE TRANSFORM. Every light mesh must carry the SAME instance matrix as the
 *    body. If one is transformed differently, any part of its geometry that is
 *    offset from the origin swings away - and the further it was offset, the
 *    further it goes. This is the exact check that catches a per-mesh scale
 *    applied about the wrong origin, which is the fault that was found here.
 * 2. THE GEOMETRY. `strip`, `tail` and `beacon` are hardware bolted to the
 *    vehicle, so their world boxes must stay inside the body's. This catches a
 *    part built at the wrong place - the truck rear outline that framed the
 *    CHASSIS while the cargo box sat above it.
 *
 * `glow` is deliberately exempt from the second check and not from the first.
 * It is a pool of LIGHT on the road and a halo in the air, both intentionally
 * larger than the vehicle that casts them; a light pool the size of the car
 * would be the bug. What it may not do is move independently of the car.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
const SECONDS = Number(process.argv[2] || 25);

// How far a light may stick out of the body box, in metres.
//
// NOT ZERO, and the reason is geometric rather than lenient: a tail lamp is
// MEANT to sit on the rear face, and a face is the boundary of the box, so a
// lamp with any thickness at all pokes through it by half that thickness. The
// rear outline sits deliberately just proud of the face as well. Measured on
// the shipped types, the honest overhang is under 0.1; a quarter of a metre is
// comfortably past anything intentional and far short of the metres a detached
// light travels.
const TOLERANCE = 0.25;

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server')), 30000);
    child.stdout.on('data', (chunk) => {
      text += String(chunk);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve({ child, url: m[1].trim() }); }
    });
  });
}

const server = await startServer();
const browser = await chromium.launch({
  args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

// god mode: the dense traffic model, so every type is on the road and close.
await page.goto(`${server.url}?god=1&theme=auroraPass&stats=0`, { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON && window.NEON.traffic, null, { timeout: 20000 });
await page.waitForTimeout(3000);

// The measurement itself, written against three's own classes reached through
// the live objects rather than through an import, because this page is the
// built app and not a module of it.
await page.evaluate(() => {
  const traffic = window.NEON.traffic;
  // Every geometry's own box, computed once.
  for (const fleet of traffic.fleets) {
    for (const key of ['body', 'strip', 'tail', 'glow', 'beacon']) {
      const mesh = fleet.mesh[key];
      if (mesh && mesh.geometry && !mesh.geometry.boundingBox) {
        mesh.geometry.computeBoundingBox();
      }
    }
  }
  window.__worst = {};
  window.__samples = 0;

  const Matrix4 = window.NEON.engine.camera.matrixWorld.constructor;
  const Vector3 = window.NEON.engine.camera.position.constructor;
  const m = new Matrix4();
  const m2 = new Matrix4();
  const corner = new Vector3();

  window.__probeLights = () => {
    const out = window.__worst;
    window.__samples++;
    for (const fleet of traffic.fleets) {
      const type = fleet.type.name;
      const body = fleet.mesh.body;
      if (!body.geometry.boundingBox) continue;

      for (let i = 0; i < fleet.vehicles.length; i++) {
        if (!fleet.vehicles[i].active) continue;
        body.getMatrixAt(i, m);

        // The body's world box.
        const bb = body.geometry.boundingBox;
        let bminx = Infinity, bminy = Infinity, bminz = Infinity;
        let bmaxx = -Infinity, bmaxy = -Infinity, bmaxz = -Infinity;
        for (let c = 0; c < 8; c++) {
          corner.set(
            c & 1 ? bb.max.x : bb.min.x,
            c & 2 ? bb.max.y : bb.min.y,
            c & 4 ? bb.max.z : bb.min.z,
          ).applyMatrix4(m);
          bminx = Math.min(bminx, corner.x); bmaxx = Math.max(bmaxx, corner.x);
          bminy = Math.min(bminy, corner.y); bmaxy = Math.max(bmaxy, corner.y);
          bminz = Math.min(bminz, corner.z); bmaxz = Math.max(bmaxz, corner.z);
        }

        for (const key of ['strip', 'tail', 'glow', 'beacon']) {
          const mesh = fleet.mesh[key];
          if (!mesh || !mesh.geometry || !mesh.geometry.boundingBox) continue;
          mesh.getMatrixAt(i, m2);

          // --- 1. the transform ---------------------------------------------
          let drift = 0;
          for (let e = 0; e < 16; e++) {
            drift = Math.max(drift, Math.abs(m2.elements[e] - m.elements[e]));
          }

          // --- 2. the geometry, for hardware only ---------------------------
          let over = 0;
          let axis = '';
          if (key !== 'glow') {
            const gb = mesh.geometry.boundingBox;
            for (let c = 0; c < 8; c++) {
              corner.set(
                c & 1 ? gb.max.x : gb.min.x,
                c & 2 ? gb.max.y : gb.min.y,
                c & 4 ? gb.max.z : gb.min.z,
              ).applyMatrix4(m2);
              const dx = Math.max(bminx - corner.x, corner.x - bmaxx, 0);
              const dy = Math.max(bminy - corner.y, corner.y - bmaxy, 0);
              const dz = Math.max(bminz - corner.z, corner.z - bmaxz, 0);
              if (dx > over) { over = dx; axis = 'across'; }
              if (dy > over) { over = dy; axis = 'up'; }
              if (dz > over) { over = dz; axis = 'along'; }
            }
          }

          const id = type + ' / ' + key;
          const previous = out[id];
          if (!previous || over > previous.over || drift > previous.drift) {
            out[id] = {
              over: Math.max(over, previous ? previous.over : 0),
              drift: Math.max(drift, previous ? previous.drift : 0),
              axis: over > (previous ? previous.over : 0) ? axis : (previous ? previous.axis : axis),
              type, part: key,
            };
          }
        }
      }
    }
  };
});

// Sampled every frame from inside the loop, so a fault that only appears at a
// particular range is caught rather than missed between polls.
await page.evaluate(() => {
  const loop = window.NEON.loop;
  loop.add(() => window.__probeLights());
});

await page.waitForTimeout(SECONDS * 1000);
const worst = await page.evaluate(() => ({ worst: window.__worst, samples: window.__samples }));
await browser.close();
server.child.kill();

const rows = Object.entries(worst.worst).sort((a, b) => b[1].drift - a[1].drift || b[1].over - a[1].over);
console.log(`
${worst.samples} frames sampled, ${rows.length} type/part pairs seen
`);
console.log(`${'type / part'.padEnd(24)} ${'transform drift'.padStart(15)} ${'overhang'.padStart(11)}   axis`);

// A matrix is the body's or it is not; this is float noise, not a budget.
const DRIFT_LIMIT = 1e-4;
const failures = [];
for (const [id, row] of rows) {
  const movedBox = row.over > TOLERANCE;
  const movedMatrix = row.drift > DRIFT_LIMIT;
  console.log(`${id.padEnd(24)} ${row.drift.toFixed(4).padStart(15)} ${row.over.toFixed(3).padStart(8)} m   `
    + `${row.axis || '-'}${movedMatrix ? '   TRANSFORMED APART' : ''}${movedBox ? '   OUTSIDE BODY' : ''}`);
  if (movedMatrix) {
    failures.push(`${id}: instance matrix differs from the body's by ${row.drift.toFixed(4)} - `
      + 'anything in that mesh offset from the origin swings away from the vehicle');
  }
  if (movedBox) {
    failures.push(`${id}: ${row.over.toFixed(3)} m outside its body box, ${row.axis}`);
  }
}

if (!rows.length) {
  console.log('nothing was measured - no active vehicles were seen');
  process.exit(1);
}
if (failures.length) {
  console.log(`
${failures.length} problem(s)`);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}
console.log(`
light-check: every light shares its vehicle's transform and stays on it`);
process.exit(0);
