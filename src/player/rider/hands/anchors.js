import * as THREE from 'three';
import { partMatrix } from '../../../utils/geometry.js';

/**
 * Grip anchor maths - the contract between the rig and whatever supplies the
 * hands.
 *
 * An anchor names a place on a grip and the frame a hand is aligned in:
 *   +X runs outward along the grip
 *   +Y points up away from it
 *   +Z points back at the rider
 *
 * The frame is derived from the grip geometry itself, so a hand inherits the
 * grip's real angle rather than a second, hand written copy of it. On top of
 * that sits the anchor's own offset, rotation and scale, which exist for a
 * loaded model whose origin or units are not ours.
 *
 * The left anchor is never authored: it is the right one mirrored through the
 * YZ plane. That mirror has a negative determinant, which GeometryBuilder
 * already compensates for by reversing the winding of anything built through
 * it; a loaded model placed under a mirrored matrix needs the same treatment,
 * or its faces come out inside first.
 */

export const SIDE_RIGHT = 1;
export const SIDE_LEFT = -1;

const UP = new THREE.Vector3(0, 1, 0);

const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _origin = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _adjust = new THREE.Matrix4();
const _mirror = new THREE.Matrix4().makeScale(-1, 1, 1);

/**
 * Builds the transform a hand set should be placed under.
 * @param {object} anchor config.player.rider.anchors.rightGrip
 * @param {number} side SIDE_RIGHT as authored, SIDE_LEFT for the mirror
 * @param {THREE.Matrix4} [target]
 * @returns {THREE.Matrix4}
 */
export function gripAnchorFrame(anchor, side, target = new THREE.Matrix4()) {
  _from.fromArray(anchor.from);
  _to.fromArray(anchor.to);

  _x.copy(_to).sub(_from).normalize();
  _z.crossVectors(_x, UP).normalize();
  _y.crossVectors(_z, _x);

  _origin.copy(_from).lerp(_to, anchor.along);
  target.makeBasis(_x, _y, _z).setPosition(_origin);

  // Correction for a model that does not share our origin, orientation or
  // units. Neutral values leave the frame exactly as the grip defines it.
  partMatrix(1, anchor.offset, anchor.rotation, _adjust);
  if (anchor.scale !== 1) _adjust.scale(_scale.setScalar(anchor.scale));
  target.multiply(_adjust);

  if (side === SIDE_LEFT) target.premultiply(_mirror);
  return target;
}

/**
 * Length of the grip the anchor sits on, in rig units. A loaded model is scaled
 * against this and the anchor radius rather than against a magic number.
 * @param {object} anchor
 * @returns {number}
 */
export function gripLength(anchor) {
  return _from.fromArray(anchor.from).distanceTo(_to.fromArray(anchor.to));
}
