import * as THREE from 'three';
import { alignMatrix, latheFromProfile, partMatrix } from '../../../utils/geometry.js';

/**
 * FrontWheel - the tyre, rim, hub, spokes, brake and the glow ring in the rim.
 *
 * Split from FrontEnd.js on the project's 300 line rule, and the seam is a real
 * one: a wheel is a stack of surfaces of revolution about the axle, where the
 * fork next door is a set of tubes and the fender is a swept panel.
 *
 * EVERYTHING ROUND IS LATHED. A tyre, a rim, a hub and a disc are all surfaces
 * of revolution, so each costs one profile and one revolve rather than a pile
 * of primitives, and each comes out with correct normals for free. Only the
 * five spokes and the caliper are built any other way.
 *
 * Profiles are [radius, x] pairs, so they read in config the way they would be
 * drawn on paper: distance out from the axle, and distance along it.
 */

const _matrix = new THREE.Matrix4();
const _euler = new THREE.Euler();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _position = new THREE.Vector3();

/** Lathe about the axle: the profile's [radius, x] pairs revolve around +X. */
function lathe(profile, segments, centre) {
  const geometry = latheFromProfile(profile, segments);
  // latheFromProfile revolves about +Y with the second column as height, so
  // standing it on +X is what turns "distance along the profile" into
  // "distance along the axle".
  return { geometry, matrix: alignMatrix(centre, [1, 0, 0], _matrix.clone()) };
}

/** Tyre, rim, hub, spokes, disc, caliper and the glow ring inside the rim. */
export function buildWheel(builders, cfg) {
  const { frame, dark, rubber, lowerNeon } = builders;

  const tyre = lathe(cfg.tyre, cfg.segments, cfg.centre);
  rubber.add(tyre.geometry, tyre.matrix);

  const rim = lathe(cfg.rim, cfg.segments, cfg.centre);
  frame.add(rim.geometry, rim.matrix);

  const hub = cfg.hub;
  dark.add(
    new THREE.CylinderGeometry(hub.radius, hub.radius, hub.halfWidth * 2, hub.segments, 1),
    alignMatrix(cfg.centre, [1, 0, 0], _matrix),
  );

  buildSpokes(dark, cfg);

  // Disc and caliper, one pair per side.
  const disc = cfg.disc;
  for (const sign of [1, -1]) {
    // Lathed as a closed annulus, not a RingGeometry: a ring is a single sided
    // disc with no edge, so from the side it disappeared and left the road
    // showing through the middle of the wheel.
    const face = disc.halfThickness;
    const ring = lathe([
      [disc.innerRadius, face],
      [disc.outerRadius, face],
      [disc.outerRadius, -face],
      [disc.innerRadius, -face],
      [disc.innerRadius, face],
    ], disc.segments, [cfg.centre[0] + disc.x * sign, cfg.centre[1], cfg.centre[2]]);
    dark.add(ring.geometry, ring.matrix);

    const caliper = cfg.caliper;
    const box = new THREE.BoxGeometry(caliper.size[0], caliper.size[1], caliper.size[2]);
    dark.add(box, partMatrix(sign, caliper.offset, caliper.rotation, _matrix));
  }

  // A ring of neon set inside the rim. It is the one lit thing on this bike
  // that turns, and in a six second clip a moving light is worth more than
  // another static line.
  const glow = cfg.glow;
  lowerNeon.add(
    latheFromProfile([
      [glow.radius, glow.halfWidth],
      [glow.radius + glow.width, glow.halfWidth],
      [glow.radius + glow.width, -glow.halfWidth],
      [glow.radius, -glow.halfWidth],
    ], glow.segments),
    alignMatrix(cfg.centre, [1, 0, 0], _matrix),
  );
}

/** Five tapered spokes, laid flat in the wheel's plane and spun about the axle. */
function buildSpokes(dark, cfg) {
  const spoke = cfg.spokes;
  const length = spoke.outerRadius - spoke.innerRadius;
  const mid = (spoke.outerRadius + spoke.innerRadius) / 2;

  for (let i = 0; i < spoke.count; i++) {
    const angle = (i / spoke.count) * Math.PI * 2;
    // Tapered: wider where it leaves the hub. A box scaled along its length
    // cannot taper, so this is built from the two widths directly.
    const geometry = new THREE.CylinderGeometry(
      spoke.outerWidth / 2, spoke.innerWidth / 2, length, 4, 1);
    // Four sided, so it reads as a flat blade rather than as a rod, and turned
    // an eighth so a face rather than a corner points at the camera.
    geometry.rotateY(Math.PI / 4);
    geometry.scale(1, 1, spoke.thickness / (spoke.innerWidth / 2) * 0.5);

    _euler.set(angle, 0, 0, 'XYZ');
    _quaternion.setFromEuler(_euler);
    _position.set(
      cfg.centre[0],
      cfg.centre[1] + Math.cos(angle) * mid,
      cfg.centre[2] + Math.sin(angle) * mid,
    );
    // The cylinder is built along +Y; the spoke has to lie along the radius,
    // which for a wheel turning about X is exactly what rotating the default
    // +Y by the spoke's own angle gives.
    dark.add(geometry, _matrix.compose(_position, _quaternion, _scale));
  }
}
