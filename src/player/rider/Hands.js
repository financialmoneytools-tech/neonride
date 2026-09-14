import * as THREE from 'three';
import { config } from '../../config.js';
import { alignMatrix, partMatrix } from '../../utils/geometry.js';

/**
 * Hands - two gloved hands wrapped around the grips.
 *
 * The hand is authored once, in a frame carried by the right grip, and the left
 * hand is that same hand put through a mirror. Because the frame comes from the
 * grip itself, a hand cannot come off its grip: move the grip in config and the
 * hand follows it, angle and all. That is the structural answer to "hands stay
 * attached to the grips" - there is no separate placement to keep in sync.
 *
 * Frame: +X outward along the grip, +Y up away from it, +Z back at the rider.
 * Angles around the grip are measured from straight up (0), increasing toward
 * the front of the bike, so 1.57 is the leading edge and 3.14 is the bottom.
 */

const UP = new THREE.Vector3(0, 1, 0);

const _matrix = new THREE.Matrix4();
const _local = new THREE.Matrix4();
const _mirror = new THREE.Matrix4().makeScale(-1, 1, 1);

const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _origin = new THREE.Vector3();

const _segment = new THREE.Matrix4();
const _direction = new THREE.Vector3();
const _midpoint = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _unitScale = new THREE.Vector3(1, 1, 1);

/** Point on a circle around the grip axis, at the given angle and distance. */
function around(angle, distance, alongGrip, target) {
  return target.set(alongGrip, Math.cos(angle) * distance, -Math.sin(angle) * distance);
}

/**
 * Builds the frame that the right hand is authored in, taken straight from the
 * grip geometry so the two can never disagree.
 * @returns {THREE.Matrix4}
 */
function gripFrame() {
  const cfg = config.player.rider;

  _from.fromArray(cfg.grip.from);
  _to.fromArray(cfg.grip.to);

  _x.copy(_to).sub(_from).normalize();
  _z.crossVectors(_x, UP).normalize();
  _y.crossVectors(_z, _x);

  _origin.copy(_from).lerp(_to, cfg.hand.alongGrip);
  return new THREE.Matrix4().makeBasis(_x, _y, _z).setPosition(_origin);
}

/**
 * @param {{glove: import('../../utils/geometry.js').GeometryBuilder,
 *          neonLeft: import('../../utils/geometry.js').GeometryBuilder,
 *          neonRight: import('../../utils/geometry.js').GeometryBuilder}} builders
 */
export function buildHands(builders) {
  const base = gripFrame();

  for (let s = 0; s < 2; s++) {
    // s = 0 is the right hand as authored; s = 1 is its mirror image. The
    // builder flips the winding of a mirrored part, so both read correctly.
    const root = s === 0 ? base.clone() : new THREE.Matrix4().multiplyMatrices(_mirror, base);
    const neon = s === 0 ? builders.neonRight : builders.neonLeft;

    buildGlove(builders.glove, root);
    buildTrim(neon, root);
  }
}

/** Palm, knuckles, fingers, thumb and the forearm stub. */
function buildGlove(glove, root) {
  const cfg = config.player.rider.hand;

  const palm = new THREE.BoxGeometry(cfg.palm.size[0], cfg.palm.size[1], cfg.palm.size[2]);
  partMatrix(1, cfg.palm.offset, cfg.palm.rotation, _local);
  glove.add(palm, _matrix.multiplyMatrices(root, _local));

  const fingers = cfg.fingers;
  const knuckles = cfg.knuckles;

  const joints = fingers.joints;

  for (let i = 0; i < fingers.count; i++) {
    const along = fingers.first + fingers.spacing * i;
    const curl = fingers.curlOffsets[i] || 0;

    // Knuckle: the rounded ridge the finger leaves the back of the hand from.
    around(knuckles.angle, knuckles.distance, along, _origin);
    _local.makeTranslation(_origin.x, _origin.y, _origin.z);
    glove.add(new THREE.SphereGeometry(knuckles.radius, 10, 7), _matrix.multiplyMatrices(root, _local));

    // Proximal segment, knuckle to middle joint: a chord across the leading
    // edge of the grip, since both ends sit on arcs around the grip axis.
    around(joints[0][0], joints[0][1], along, _from);
    around(joints[1][0], joints[1][1], along, _to);
    addSegment(glove, root, _from, _to, fingers.radius, fingers.radius * 0.94);

    // Joint bead, so the two segments read as a bend and not as a break.
    _local.makeTranslation(_to.x, _to.y, _to.z);
    glove.add(
      new THREE.SphereGeometry(fingers.radius * 0.98, 8, 6),
      _matrix.multiplyMatrices(root, _local),
    );

    // Distal segment, curling on under the grip toward the palm.
    _from.copy(_to);
    around(joints[2][0] + curl, joints[2][1], along, _to);
    addSegment(glove, root, _from, _to, fingers.radius * 0.94, fingers.radius * fingers.taper);
  }

  const thumb = cfg.thumb;
  _from.fromArray(thumb.offset);
  _to.fromArray(thumb.direction).normalize().multiplyScalar(thumb.length).add(_from);
  addSegment(glove, root, _from, _to, thumb.radius, thumb.radius * thumb.taper);

  const arm = cfg.forearm;
  _from.fromArray(arm.offset);
  _to.fromArray(arm.direction).normalize().multiplyScalar(arm.length).add(_from);
  addSegment(glove, root, _from, _to, arm.radius, arm.radius * arm.flare, arm.radialSegments);
}

/** Emissive seam along the back of the hand, and the cuff ring. */
function buildTrim(neon, root) {
  const rim = config.player.rider.hand.rim;

  const seam = new THREE.BoxGeometry(rim.seamSize[0], rim.seamSize[1], rim.seamSize[2]);
  partMatrix(1, rim.seamOffset, rim.seamRotation, _local);
  neon.add(seam, _matrix.multiplyMatrices(root, _local));

  // Open ended cylinder: the wall alone is exactly a band around the cuff.
  const cuff = new THREE.CylinderGeometry(
    rim.cuffRadius,
    rim.cuffRadius,
    rim.cuffWidth,
    rim.cuffSegments,
    1,
    true,
  );
  alignMatrix(rim.cuffOffset, rim.cuffDirection, _local);
  neon.add(cuff, _matrix.multiplyMatrices(root, _local));
}

/** Adds one tapered tube expressed in hand space, transformed into the rig. */
function addSegment(builder, root, from, to, radius, endRadius, segments = 10) {
  _direction.copy(to).sub(from);
  const length = _direction.length();
  if (length === 0) return;

  _direction.divideScalar(length);
  _quaternion.setFromUnitVectors(UP, _direction);
  _midpoint.copy(from).addScaledVector(_direction, length * 0.5);
  _segment.compose(_midpoint, _quaternion, _unitScale);

  builder.add(
    new THREE.CylinderGeometry(endRadius, radius, length, segments, 1),
    _matrix.multiplyMatrices(root, _segment),
  );
}
