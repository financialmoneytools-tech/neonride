import * as THREE from 'three';

/**
 * Lofted panels - the shared frame every lofted part is measured from.
 *
 * Bodywork that has edges on it.
 *
 * A squashed ellipsoid has no edge anywhere on it, and that is exactly what
 * makes a fairing built out of one read as a toy: the light rolls smoothly all
 * the way round and there is never a line for the eye to catch. A sport bike
 * fairing is the opposite - flat-ish planes meeting at creases, with a defined
 * edge where the panel stops rather than a fade into round.
 *
 * So a panel is authored here the way a real one is drawn: one CROSS SECTION
 * and a list of STATIONS to sweep it through. Each station scales, shifts and
 * rolls the section, which is enough to send a wing out and forward and pinch
 * it off at both ends.
 *
 * A section point marked hard is given two normals instead of one, so the two
 * faces meeting there break apart instead of rolling into each other. That is
 * the whole trick, and it is a per point decision in config: hard points are
 * creases, smooth points are curvature.
 *
 * Section space is XY and the spine runs along Z. The caller places the result
 * with a part matrix like any other primitive; nothing here knows about a bike.
 *
 * This file holds only what both ./shell.js and ./vents.js need: where every
 * point of every station lands, and which way the surface faces there. They
 * must agree on both to the last bit, because one cuts the holes the other
 * fills.
 *
 * @typedef {number[]} SectionPoint
 *   [x, y] or [x, y, hard]. A non-zero third entry makes the point a crease.
 * @typedef {{z: number, scale: number[], offset?: number[], roll?: number}} Station
 *   Absolute units. scale multiplies the section, offset shifts it in its own
 *   plane, roll turns it about the spine. Applied in that order.
 * @typedef {{edgeFrom: number, edgeTo: number, stationFrom: number,
 *            stationTo: number, depth: number}} Vent
 *   A half open rectangle of the surface - section edges edgeFrom up to but not
 *   including edgeTo, station segments stationFrom up to but not including
 *   stationTo - taken out of the shell and replaced by a pocket `depth` deep.
 */

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/** Places every section point of every station. Absolute; section space is XY. */
function stationPoints(section, stations) {
  const n = section.length;
  const points = new Array(stations.length * n);

  for (let s = 0; s < stations.length; s++) {
    const station = stations[s];
    const roll = station.roll || 0;
    const cos = Math.cos(roll);
    const sin = Math.sin(roll);
    const ox = station.offset ? station.offset[0] : 0;
    const oy = station.offset ? station.offset[1] : 0;

    for (let i = 0; i < n; i++) {
      const x = section[i][0] * station.scale[0];
      const y = section[i][1] * station.scale[1];
      points[s * n + i] = new THREE.Vector3(
        ox + x * cos - y * sin,
        oy + x * sin + y * cos,
        station.z,
      );
    }
  }
  return points;
}

/** Twice the signed area of the section. Its SIGN is which way round it runs. */
function shoelace(section) {
  let sum = 0;
  for (let i = 0; i < section.length; i++) {
    const a = section[i];
    const b = section[(i + 1) % section.length];
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return sum;
}

/**
 * Positions plus one outward normal per face strip.
 *
 * The normal of the strip between section points i and i+1 is the spine
 * direction crossed with the section edge: perpendicular to the surface by
 * construction, but on an arbitrary side of it. Which side is settled ONCE for
 * the whole shell, by comparing the first strip against the exact outward
 * direction of the first section edge, which the winding of the section gives
 * for nothing. Settling it once rather than face by face is what stops a shell
 * coming out with some of its faces inside out.
 */
export function buildFrame(section, stations) {
  const n = section.length;
  const rings = stations.length;
  const points = stationPoints(section, stations);
  const strip = new Array(rings * n);

  for (let s = 0; s < rings; s++) {
    const before = Math.max(s - 1, 0);
    const after = Math.min(s + 1, rings - 1);

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      // Spine direction, averaged over the two ends of the strip so a station
      // that twists does not tilt the normal off the surface.
      _a.copy(points[after * n + i]).sub(points[before * n + i]);
      _b.copy(points[after * n + j]).sub(points[before * n + j]);
      _a.add(_b);
      _b.copy(points[s * n + j]).sub(points[s * n + i]);
      strip[s * n + i] = new THREE.Vector3().crossVectors(_a, _b).normalize();
    }
  }

  // Outward for edge 0 as drawn: its tangent turned a quarter turn, the way the
  // section runs. Positive scale and a roll cannot change which way that is.
  const winding = shoelace(section) >= 0 ? 1 : -1;
  const tx = points[1].x - points[0].x;
  const ty = points[1].y - points[0].y;
  if (strip[0].x * ty * winding - strip[0].y * tx * winding < 0) {
    for (let k = 0; k < strip.length; k++) strip[k].negate();
  }

  return { n, rings, points, strip };
}

/**
 * The line one section point traces along the spine, for laying a neon strip
 * exactly along a crease. Taking it from the same numbers the surface is built
 * from is the whole point: a trim line authored separately drifts off its own
 * edge the moment either one is tuned.
 *
 * @param {SectionPoint[]} section
 * @param {Station[]} stations
 * @param {number} index which section point to follow
 * @returns {number[][]} one [x, y, z] per station
 */
export function sectionPath(section, stations, index) {
  const points = stationPoints(section, stations);
  const path = new Array(stations.length);
  for (let s = 0; s < stations.length; s++) {
    path[s] = points[s * section.length + index].toArray();
  }
  return path;
}
