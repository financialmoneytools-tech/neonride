import * as THREE from 'three';
import { buildFrame } from './section.js';

/**
 * loftShell - the panel itself.
 *
 * Sweeps the cross section through its stations, breaks the normal at every
 * point marked hard so the faces meet in a crease, and closes both ends. Any
 * face listed as a vent is left out, for ./vents.js to put a pocket behind.
 *
 * See ./section.js for how a section and its stations are authored.
 */

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _hub = new THREE.Vector3();
const _normal = new THREE.Vector3();

/** True when this quad has been taken out of the shell to make a vent. */
function inVent(vents, s, i) {
  for (let v = 0; v < vents.length; v++) {
    const vent = vents[v];
    if (s >= vent.stationFrom && s < vent.stationTo && i >= vent.edgeFrom && i < vent.edgeTo) {
      return true;
    }
  }
  return false;
}

/**
 * Sweeps a section through its stations and closes both ends.
 * @param {import('./section.js').SectionPoint[]} section points running round it
 * @param {import('./section.js').Station[]} stations two or more, along the spine
 * @param {import('./section.js').Vent[]} [vents] faces left out, for ./vents.js
 * @returns {THREE.BufferGeometry}
 */
export function loftShell(section, stations, vents = []) {
  const { n, rings, points, strip } = buildFrame(section, stations);

  const positions = [];
  const normals = [];
  const indices = [];

  const push = (point, normal) => {
    positions.push(point.x, point.y, point.z);
    normals.push(normal.x, normal.y, normal.z);
    return positions.length / 3 - 1;
  };

  // Two slots per crease point, one either side of the break; one slot for a
  // smooth point, carrying the average of the faces that meet there.
  const slotIn = new Int32Array(rings * n);
  const slotOut = new Int32Array(rings * n);

  for (let s = 0; s < rings; s++) {
    for (let i = 0; i < n; i++) {
      const point = points[s * n + i];
      const before = strip[s * n + ((i - 1 + n) % n)];
      const after = strip[s * n + i];

      if (section[i].length > 2 && section[i][2]) {
        slotIn[s * n + i] = push(point, before);
        slotOut[s * n + i] = push(point, after);
      } else {
        _normal.copy(before).add(after).normalize();
        const slot = push(point, _normal);
        slotIn[s * n + i] = slot;
        slotOut[s * n + i] = slot;
      }
    }
  }

  // Which way round a quad has to be listed depends on which way the spine
  // runs, so it is measured rather than assumed: every quad votes on whether
  // the order used agrees with the outward normal, and the majority wins.
  let agreement = 0;

  for (let s = 0; s < rings - 1; s++) {
    for (let i = 0; i < n; i++) {
      if (inVent(vents, s, i)) continue;
      const j = (i + 1) % n;
      const a = slotOut[s * n + i];
      const b = slotIn[s * n + j];
      const c = slotIn[(s + 1) * n + j];
      const d = slotOut[(s + 1) * n + i];
      indices.push(a, b, c, a, c, d);

      _a.fromArray(positions, b * 3).sub(_c.fromArray(positions, a * 3));
      _b.fromArray(positions, c * 3).sub(_c);
      agreement += _c.crossVectors(_a, _b).dot(strip[s * n + i]) >= 0 ? 1 : -1;
    }
  }

  if (agreement < 0) {
    for (let k = 0; k < indices.length; k += 3) {
      const swap = indices[k + 1];
      indices[k + 1] = indices[k + 2];
      indices[k + 2] = swap;
    }
  }

  addCap(points, n, rings, 0, indices, push);
  addCap(points, n, rings, rings - 1, indices, push);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}

/**
 * Closes one end with a flat fan. Flat on purpose: the leading edge of a wing
 * is a cut face on a real fairing, and rounding it would hand back the soft
 * nose this whole file exists to get rid of.
 */
function addCap(points, n, rings, s, indices, push) {
  const inward = s === 0 ? Math.min(1, rings - 1) : Math.max(rings - 2, 0);

  _hub.set(0, 0, 0);
  for (let i = 0; i < n; i++) _hub.add(points[s * n + i]);
  _hub.divideScalar(n);

  // Outward is along the spine and away from the body.
  _normal.set(0, 0, 0);
  for (let i = 0; i < n; i++) _normal.add(_a.copy(points[s * n + i]).sub(points[inward * n + i]));
  _normal.normalize();

  const hub = push(_hub, _normal);
  const ring = new Array(n);
  for (let i = 0; i < n; i++) ring[i] = push(points[s * n + i], _normal);

  _a.copy(points[s * n]).sub(_hub);
  _b.copy(points[s * n + 1]).sub(_hub);
  const forward = _c.crossVectors(_a, _b).dot(_normal) >= 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    if (forward) indices.push(hub, ring[i], ring[j]);
    else indices.push(hub, ring[j], ring[i]);
  }
}

