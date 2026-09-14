import * as THREE from 'three';
import { GeometryBuilder, addTube } from '../../../utils/geometry.js';

/**
 * cuff - the thing that ends a glove.
 *
 * The hand is cut at the wrist, because with the camera at the bars an arm is
 * outside the frame and every first person bike game solves the arm problem by
 * not having arms. A cut leaves an open ring of triangles, though, and a hollow
 * hand is worse than a floating one. This closes it.
 *
 * It is built rather than taken from the pack, for the same reason the pose is
 * solved rather than configured: the cut is wherever that pack happens to put
 * its wrist joint, so the cuff has to be placed from the posed skeleton at load
 * rather than authored against one particular model.
 *
 * Two pieces. A short tapered tube, which sinks into the hand far enough that
 * no seam shows and flares slightly at the open end the way a gauntlet does.
 * And a thin band around that end, emissive, which is what makes it read
 * against a dark road instead of disappearing into it.
 */

const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _knuckle = new THREE.Vector3();

/**
 * @param {THREE.Vector3} wrist where the hand was cut, in the space the
 *   geometry is already in
 * @param {THREE.Vector3} inward unit vector from the wrist back up the arm
 * @param {object} cfg config.player.rider.hand.model.cuff
 * @returns {{body: THREE.BufferGeometry, rim: THREE.BufferGeometry}}
 */
export function buildCuff(wrist, inward, cfg) {
  _axis.copy(inward).normalize();

  // Starts inside the hand and runs back up the arm. The overlap is what hides
  // the join: the pack's wrist is not a clean circle, so butting up against it
  // would show a gap on one side or the other.
  _from.copy(wrist).addScaledVector(_axis, -cfg.sink);
  _to.copy(wrist).addScaledVector(_axis, cfg.length);

  // addTube takes plain arrays, the way every part in config is authored.
  const body = new GeometryBuilder();
  addTube(body, _from.toArray(), _to.toArray(), cfg.radius, cfg.segments, cfg.radius * cfg.flare);

  // The band sits just inside the open end, so the cuff's own edge still reads
  // as the silhouette and the light is a line on it rather than its outline.
  const rim = new GeometryBuilder();
  _from.copy(wrist).addScaledVector(_axis, cfg.length - cfg.rim.inset - cfg.rim.width);
  _to.copy(wrist).addScaledVector(_axis, cfg.length - cfg.rim.inset);
  const bandRadius = cfg.radius * cfg.flare * cfg.rim.radius;
  addTube(rim, _from.toArray(), _to.toArray(), bandRadius, cfg.segments);

  return { body: body.build('cuff'), rim: rim.build('cuff-rim') };
}

/**
 * Where to put it: the wrist joint, and the direction back up the arm.
 *
 * Taken from the skeleton after posing, so it follows whatever the solver did
 * rather than assuming a rest orientation.
 *
 * @param {object} bones from collectArmBones
 * @param {THREE.Matrix4} correction model space to rig space
 * @returns {{wrist: THREE.Vector3, inward: THREE.Vector3}|null}
 */
export function cuffFrame(bones, correction) {
  if (!bones.wrist) return null;

  const wrist = new THREE.Vector3().setFromMatrixPosition(bones.wrist.matrixWorld);
  const inward = new THREE.Vector3();

  if (bones.forearm) {
    inward.setFromMatrixPosition(bones.forearm.matrixWorld).sub(wrist);
  } else {
    // No forearm bone to point at: back up the arm is the opposite of the way
    // the fingers leave the wrist, which is the same axis on any hand.
    const finger = bones.fingers.find((f) => f.name === 'middle') || bones.fingers[0];
    if (!finger) return null;
    inward.copy(wrist).sub(_knuckle.setFromMatrixPosition(finger.bones[0].matrixWorld));
  }

  if (inward.lengthSq() < 1e-9) return null;
  inward.normalize();

  wrist.applyMatrix4(correction);
  // A direction, so only the rotation and the uniform scale apply; normalising
  // after removes the scale and leaves the rotation.
  inward.transformDirection(correction).normalize();

  return { wrist, inward };
}
