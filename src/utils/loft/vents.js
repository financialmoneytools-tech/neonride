import * as THREE from 'three';
import { buildFrame } from './section.js';

/**
 * loftVents - the pockets behind the openings ./shell.js left in the surface.
 *
 * Fed the same section and stations as the shell, so the mouth of a pocket sits
 * exactly on the hole it fills. Both read ./section.js, which is what makes that
 * true rather than nearly true.
 */

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _normal = new THREE.Vector3();

/**
 * The pockets behind the openings loftShell left in the surface.
 *
 * A separate geometry because it wants a separate material: the inside of a
 * fairing is not painted, and a recess that shades like the panel around it is
 * not a recess, it is a decal. Flat normals throughout, since every face in
 * here is a cut edge.
 *
 * @param {import('./section.js').SectionPoint[]} section as the shell had it
 * @param {import('./section.js').Station[]} stations as the shell had them
 * @param {import('./section.js').Vent[]} vents
 * @returns {THREE.BufferGeometry|null} null when there are no vents
 */
export function loftVents(section, stations, vents) {
  if (!vents || vents.length === 0) return null;

  const { n, points, strip } = buildFrame(section, stations);
  const positions = [];
  const normals = [];

  // A vent may run to the last edge of the section, and the far corner of that
  // edge is section point 0 again - not point n, which is the NEXT station's
  // first point. Reading it unwrapped does not throw, it quietly builds the
  // pocket out of the wrong ring.
  const at = (s, i) => points[s * n + (i % n)];

  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const p3 = new THREE.Vector3();
  const look = new THREE.Vector3();
  const inside = new THREE.Vector3();

  /**
   * Where a corner of the opening sinks to. A corner between two strips
   * averages them, so a pocket spanning more than one face has a continuous
   * floor instead of a fold down the middle of it.
   */
  const sink = (vent, s, i, target) => {
    if (i > vent.edgeFrom && i < vent.edgeTo) {
      _normal.copy(strip[s * n + i - 1]).add(strip[s * n + i]).normalize();
    } else {
      _normal.copy(strip[s * n + (i === vent.edgeFrom ? vent.edgeFrom : vent.edgeTo - 1)]);
    }
    return target.copy(at(s, i)).addScaledVector(_normal, -vent.depth);
  };

  for (let v = 0; v < vents.length; v++) {
    const vent = vents[v];

    // A point inside the pocket, so its walls can be told which way to face.
    inside.set(0, 0, 0);
    let corners = 0;
    for (let s = vent.stationFrom; s <= vent.stationTo; s++) {
      for (let i = vent.edgeFrom; i <= vent.edgeTo; i++) {
        inside.add(sink(vent, s, i, p0));
        corners++;
      }
    }
    inside.divideScalar(corners);

    // Floor: the faces that were removed, sunk along their own normals, so the
    // pocket keeps the shape of the panel instead of becoming a flat lid.
    for (let s = vent.stationFrom; s < vent.stationTo; s++) {
      for (let i = vent.edgeFrom; i < vent.edgeTo; i++) {
        sink(vent, s, i, p0);
        sink(vent, s, i + 1, p1);
        sink(vent, s + 1, i + 1, p2);
        sink(vent, s + 1, i, p3);
        look.copy(p0).add(strip[s * n + i]);
        quad(positions, normals, p0, p1, p2, p3, look);
      }
    }

    // Walls down the two section edges of the opening...
    for (let k = 0; k < 2; k++) {
      const i = k === 0 ? vent.edgeFrom : vent.edgeTo;
      for (let s = vent.stationFrom; s < vent.stationTo; s++) {
        p0.copy(at(s, i));
        p1.copy(at(s + 1, i));
        sink(vent, s + 1, i, p2);
        sink(vent, s, i, p3);
        quad(positions, normals, p0, p1, p2, p3, inside);
      }
    }

    // ...and across its two ends.
    for (let k = 0; k < 2; k++) {
      const s = k === 0 ? vent.stationFrom : vent.stationTo;
      for (let i = vent.edgeFrom; i < vent.edgeTo; i++) {
        p0.copy(at(s, i));
        p1.copy(at(s, i + 1));
        sink(vent, s, i + 1, p2);
        sink(vent, s, i, p3);
        quad(positions, normals, p0, p1, p2, p3, inside);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return geometry;
}

/** Two flat triangles, both facing the same way. */
function quad(positions, normals, a, b, c, d, towards) {
  triangle(positions, normals, a, b, c, towards);
  triangle(positions, normals, a, c, d, towards);
}

/**
 * One flat triangle, wound so that its face turns toward `towards` - a point
 * on the side the triangle is meant to be seen from. Only the sign of the dot
 * product is read, so a direction offset from the first corner serves just as
 * well as a real point, which is how the floor quads aim themselves.
 */
function triangle(positions, normals, a, b, c, towards) {
  _a.copy(b).sub(a);
  _b.copy(c).sub(a);
  _normal.crossVectors(_a, _b).normalize();

  const flipped = _normal.dot(_c.copy(towards).sub(a)) < 0;
  if (flipped) _normal.negate();

  const order = flipped ? [a, c, b] : [a, b, c];
  for (let k = 0; k < 3; k++) {
    positions.push(order[k].x, order[k].y, order[k].z);
    normals.push(_normal.x, _normal.y, _normal.z);
  }
}

