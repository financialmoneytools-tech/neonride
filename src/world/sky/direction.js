import * as THREE from 'three';

/**
 * direction - the two azimuth conventions the sky is built on, in one place.
 *
 * ================= WHY THERE ARE TWO =================
 *
 * The dome, the nebula clouds, the star trail pole and the aurora arc all
 * place things with a MATHS azimuth: measured from +X, turning toward +Z.
 * Zero is off to the RIGHT of a camera looking down -Z, and dead ahead is
 * -PI/2, which is why config/sky.js writes the aurora's arc centre as -1.6.
 *
 * The celestial bodies place things with a RIDER azimuth: zero is dead ahead,
 * down the road, and it turns toward +X. That is the useful one for a sun,
 * because "dead ahead" is the thing a theme actually wants to say.
 *
 * ================= WHAT IT COST =================
 *
 * Sunset Highway asked for its dome glow at azimuth 0 and its sun at azimuth
 * 0, on the reasonable assumption that those were the same place. They are
 * NINETY DEGREES apart. Photographed at the start line: the retro sun in the
 * centre of the frame and the entire orange sunset pooled against the right
 * edge of it, a sky lit from somewhere the sun was not.
 *
 * So neither convention is written out by hand any more. Both live here, both
 * are named for whose azimuth they take, and anything that needs to point at
 * a body asks for it by the body's own convention rather than converting.
 */

/**
 * Maths azimuth: 0 is +X, off to the right. Used by the dome glow's own
 * azimuth, the nebula clouds, the star trail pole and the aurora arc.
 * @param {number} azimuth radians
 * @param {number} elevation radians above the horizon
 * @param {THREE.Vector3} [target]
 * @returns {THREE.Vector3} unit vector
 */
export function skyDirection(azimuth, elevation, target = new THREE.Vector3()) {
  const cosEl = Math.cos(elevation);
  return target.set(
    cosEl * Math.cos(azimuth),
    Math.sin(elevation),
    cosEl * Math.sin(azimuth),
  ).normalize();
}

/**
 * Rider azimuth: 0 is dead ahead, down -Z. Used by every celestial body, and
 * by anything anchored to one.
 * @param {number} azimuth radians
 * @param {number} elevation radians above the horizon
 * @param {THREE.Vector3} [target]
 * @returns {THREE.Vector3} unit vector
 */
export function bodyDirection(azimuth, elevation, target = new THREE.Vector3()) {
  const cosEl = Math.cos(elevation);
  return target.set(
    Math.sin(azimuth) * cosEl,
    Math.sin(elevation),
    -Math.cos(azimuth) * cosEl,
  ).normalize();
}
