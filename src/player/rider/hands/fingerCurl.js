import * as THREE from 'three';

/**
 * fingerCurl - closes a hand around a tube.
 *
 * Split out of poseArm.js only because that file was over the project's 300
 * line limit; it is the fourth stage of the same pose and shares its idea:
 * every joint turns about the GRIP AXIS, because wrapping a cylinder IS
 * rotation about that cylinder's axis. No per bone bend axis has to be worked
 * out, and since rotating about an axis cannot move a point along it, curling
 * can never undo the roll that put the fingers across the bar.
 */

const _fwd = new THREE.Vector3();
const _tip = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _parent = new THREE.Quaternion();
const _inverse = new THREE.Quaternion();
const _curlAxis = new THREE.Vector3();

/** World position of a bone. */
function at(bone, target) {
  return target.setFromMatrixPosition(bone.matrixWorld);
}

/** Applies a world space rotation to a bone, in place. See poseArm.js. */
function rotateWorld(bone, q) {
  bone.parent.getWorldQuaternion(_parent);
  _inverse.copy(_parent).invert().multiply(q).multiply(_parent);
  bone.quaternion.premultiply(_inverse);
}

/** Component of (point - origin) perpendicular to the axis. */
function perpendicular(point, origin, axis, target) {
  target.copy(point).sub(origin);
  return target.addScaledVector(axis, -target.dot(axis));
}

/**
 * Curls each finger about the grip axis until its tip sits the configured
 * distance outside the tube.
 *
 * The joint angles keep the configured shape and are scaled together, so a
 * finger still bends most at the middle knuckle; only how far it closes is
 * searched. Scanned rather than bisected because the distance to the axis falls
 * and then rises again as a finger wraps past the tube, and a bisection would
 * happily walk into the far side of that curve.
 */
export function curlFingers(bones, plan, root) {
  if (!bones.fingers || bones.fingers.length === 0) return;

  _curlAxis.copy(plan.axis);
  const sign = curlDirection(bones, plan, root);

  for (const chain of bones.fingers) {
    const thumb = chain.name === 'thumb';
    const profile = thumb ? plan.thumbProfile : plan.profile;
    const wanted = plan.wrap * (thumb ? plan.thumbWrap : 1);

    const saved = chain.bones.map((bone) => bone.quaternion.clone());
    let best = { amount: 0, error: Infinity };

    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const amount = (i / steps) * plan.maxCurl;
      applyChain(chain, profile, amount * sign, saved, root);
      at(chain.bones[chain.bones.length - 1], _tip);
      const error = Math.abs(perpendicular(_tip, plan.target, plan.axis, _fwd).length() - wanted);
      if (error < best.error) best = { amount, error };
    }

    applyChain(chain, profile, best.amount * sign, saved, root);
  }
}

/**
 * Which way round the fingers close. Tried both ways and judged on whether the
 * fingertips end up nearer the bar, because a hand curling outward is the one
 * failure that a number would not catch.
 */
function curlDirection(bones, plan, root) {
  const chain = bones.fingers.find((f) => f.name === 'middle') || bones.fingers[0];
  const saved = chain.bones.map((bone) => bone.quaternion.clone());

  let best = null;
  for (const sign of [1, -1]) {
    applyChain(chain, plan.profile, plan.maxCurl * 0.5 * sign, saved, root);
    at(chain.bones[chain.bones.length - 1], _tip);
    const distance = perpendicular(_tip, plan.target, plan.axis, _fwd).length();
    if (!best || distance < best.distance) best = { sign, distance };
  }

  applyChain(chain, plan.profile, 0, saved, root);
  return best.sign;
}

/** Restores a finger to its rest rotations, then curls it by `amount`. */
function applyChain(chain, profile, amount, saved, root) {
  for (let i = 0; i < chain.bones.length; i++) chain.bones[i].quaternion.copy(saved[i]);
  root.updateMatrixWorld(true);

  if (!amount) return;
  for (let i = 0; i < chain.bones.length; i++) {
    const share = profile[Math.min(i, profile.length - 1)];
    if (!share) continue;
    rotateWorld(chain.bones[i], _q.setFromAxisAngle(_curlAxis, amount * share));
    root.updateMatrixWorld(true);
  }
}

