import * as THREE from 'three';
import { curlFingers } from './fingerCurl.js';

/**
 * poseArm - puts a rest pose arm into a riding grip.
 *
 * The pack ships an A pose: the arm is nearly straight and the hand is flat and
 * open. Nothing about that can be fixed by placing it, only by rotating the
 * joints it was rigged with, which is what this does. It runs once at load and
 * bakeSkin then freezes the result, so none of it costs anything per frame.
 *
 * Four stages, in order, because each one depends on the last:
 *
 *   1. Aim the clavicle at the grip, which swings the whole arm into the right
 *      plane and buys the reach the rest pose does not have.
 *   2. Two bone IK on upper arm and forearm so the wrist lands exactly on the
 *      grip. Analytic, not iterative - with two bones and a target the law of
 *      cosines gives the answer outright.
 *   3. Roll the hand about the forearm. The IK fixes where the wrist is and
 *      says nothing about which way up it is, and getting this wrong is what
 *      makes fingers point ALONG the bar instead of across it.
 *   4. Curl the fingers about the GRIP AXIS. That is the trick that makes the
 *      rest of it easy: wrapping a cylinder IS rotation about that cylinder's
 *      axis, so no per bone bend axis has to be worked out, and - because
 *      rotating about an axis cannot change a point's position along it - the
 *      curl cannot undo the roll. The two stages are independent, which is why
 *      each can be solved on its own.
 *
 * Stages 3 and 4 are searched rather than configured. The angles that put a
 * particular pack's fingers on a particular tube are not values anyone can know
 * by looking, and a hand that curls the wrong way or grips thin air is obvious
 * in a screenshot and invisible in a number. Config says what the hand should
 * achieve - how far outside the tube the fingertips sit - and the search finds
 * the angles that achieve it.
 *
 * Everything works in world space and writes back through each bone's parent,
 * so none of it cares how the skeleton is nested or scaled.
 */

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _up = new THREE.Vector3();
const _tip = new THREE.Vector3();
const _axisUp = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _parent = new THREE.Quaternion();
const _inverse = new THREE.Quaternion();

/** World position of a bone. */
function at(bone, target) {
  return target.setFromMatrixPosition(bone.matrixWorld);
}

/**
 * Applies a world space rotation to a bone, in place.
 *
 * A bone's world orientation is parentWorld * local, so to get a world rotation
 * q the local one has to be parentWorld-inverse * q * parentWorld * local.
 */
function rotateWorld(bone, q) {
  bone.parent.getWorldQuaternion(_parent);
  _inverse.copy(_parent).invert().multiply(q).multiply(_parent);
  bone.quaternion.premultiply(_inverse);
}

/** Turns a bone so that `child` ends up pointing at `target`. */
function aim(bone, child, target, root) {
  at(child, _a);
  at(bone, _b);
  _a.sub(_b).normalize();
  _fwd.copy(target).sub(_b).normalize();
  if (_a.lengthSq() < 0.5 || _fwd.lengthSq() < 0.5) return;
  rotateWorld(bone, _q.setFromUnitVectors(_a, _fwd));
  root.updateMatrixWorld(true);
}

/** Component of (point - origin) perpendicular to the axis. */
function perpendicular(point, origin, axis, target) {
  target.copy(point).sub(origin);
  return target.addScaledVector(axis, -target.dot(axis));
}

/**
 * @param {object} bones from collectArmBones
 * @param {object} plan target, axis, up, pole, wrap, profiles, wristRoll
 * @param {THREE.Object3D} root the skeleton root, for matrix updates
 */
export function poseArm(bones, plan, root) {
  root.updateMatrixWorld(true);

  // The IK aims the WRIST, but a bar does not sit against the wrist - it sits
  // in the hollow the closed fingers make, a hand's thickness further on. So
  // the whole pose is run more than once, each pass moving the wrist goal by
  // however far that hollow missed the bar last time. Two or three passes are
  // enough because the hand barely changes orientation between them.
  const goal = plan.target.clone();

  for (let pass = 0; pass < plan.passes; pass++) {
    // 1. Clavicle. Aiming it at the target costs nothing and buys reach:
    // without it the upper arm starts wherever the rest pose left it, which
    // here is far enough out that the hand cannot reach the bar at all.
    if (bones.shoulder && bones.wrist) aim(bones.shoulder, bones.wrist, goal, root);

    if (bones.bicep && bones.forearm && bones.wrist) solveElbow(bones, plan, goal, root);
    if (bones.forearm && bones.wrist) solveRoll(bones, plan, root);

    curlFingers(bones, plan, root);

    if (pass < plan.passes - 1) goal.add(gripError(bones, plan));
  }
}

/**
 * How far the hollow of the closed hand is from the bar.
 *
 * The grip should end up midway between the knuckles and the fingertips,
 * because that is the space curled fingers enclose. Only the part across the
 * bar is returned: where the hand sits ALONG the bar is the roll solver's
 * business, and correcting it here would fight that.
 */
function gripError(bones, plan) {
  const knuckles = new THREE.Vector3();
  const tips = new THREE.Vector3();
  let count = 0;

  for (const finger of bones.fingers) {
    if (finger.name === 'thumb') continue;
    knuckles.add(at(finger.bones[0], _tip));
    tips.add(at(finger.bones[finger.bones.length - 1], _tip));
    count++;
  }
  if (count === 0) return new THREE.Vector3();

  const middle = knuckles.divideScalar(count).add(tips.divideScalar(count)).multiplyScalar(0.5);
  const error = plan.target.clone().sub(middle);
  return error.addScaledVector(plan.axis, -error.dot(plan.axis));
}

/** Two bone IK: places the elbow, then aims both bones through it. */
function solveElbow(bones, plan, goal, root) {
  const A = at(bones.bicep, new THREE.Vector3());
  const B = at(bones.forearm, new THREE.Vector3());
  const C = at(bones.wrist, new THREE.Vector3());
  const l1 = A.distanceTo(B);
  const l2 = B.distanceTo(C);

  // Clamped rather than failed: a target out of reach should straighten the
  // arm, not throw. The gap then shows up as the hand sitting short of the bar,
  // which is visible and therefore fixable.
  const reach = A.distanceTo(goal);
  const d = Math.min(Math.max(reach, Math.abs(l1 - l2) + 1e-4), l1 + l2 - 1e-4);

  const cos = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const angle = Math.acos(Math.min(Math.max(cos, -1), 1));

  _fwd.copy(goal).sub(A).normalize();
  _up.copy(plan.pole).addScaledVector(_fwd, -plan.pole.dot(_fwd));
  if (_up.lengthSq() < 1e-8) _up.set(0, 1, 0).addScaledVector(_fwd, -_fwd.y);
  _up.normalize();

  const elbow = new THREE.Vector3()
    .copy(A)
    .addScaledVector(_fwd, l1 * Math.cos(angle))
    .addScaledVector(_up, l1 * Math.sin(angle));

  aim(bones.bicep, bones.forearm, elbow, root);
  aim(bones.forearm, bones.wrist, goal, root);
}

/**
 * Finds the roll about the forearm that puts the fingers across the bar.
 *
 * Scored on how far the fingertips sit ALONG the grip axis from the anchor,
 * which is the one thing the later curl cannot change. Two rolls half a turn
 * apart score the same - both lay the fingers across the tube, one with the
 * knuckles above it and one below - so a roll is only accepted while the
 * knuckles are on the upper side, which is the hand that can close around a
 * bar rather than under it.
 */
function solveRoll(bones, plan, root) {
  const wrist = bones.wrist;
  at(wrist, _a);
  at(bones.forearm, _b);
  const forearmAxis = _a.clone().sub(_b).normalize();
  const saved = wrist.quaternion.clone();

  // The "up" side of the tube, in the plane the fingers actually wrap in.
  _axisUp.copy(plan.up).addScaledVector(plan.axis, -plan.up.dot(plan.axis)).normalize();

  const knuckle = knuckleBone(bones);
  const steps = 180;
  let best = null;
  let fallback = null;

  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    wrist.quaternion.copy(saved);
    rotateWorld(wrist, _q.setFromAxisAngle(forearmAxis, theta));
    root.updateMatrixWorld(true);

    let error = 0;
    for (const finger of bones.fingers) {
      if (finger.name === 'thumb') continue;
      at(finger.bones[finger.bones.length - 1], _tip);
      error += Math.abs(_tip.sub(plan.target).dot(plan.axis));
    }

    if (!fallback || error < fallback.error) fallback = { theta, error };
    if (knuckle) {
      at(knuckle, _tip);
      if (perpendicular(_tip, plan.target, plan.axis, _fwd).dot(_axisUp) <= 0) continue;
    }
    if (!best || error < best.error) best = { theta, error };
  }

  const chosen = (best || fallback).theta + plan.wristRoll;
  wrist.quaternion.copy(saved);
  rotateWorld(wrist, _q.setFromAxisAngle(forearmAxis, chosen));
  root.updateMatrixWorld(true);
}

/** The middle finger's base joint, or any finger's, as the knuckle reference. */
function knuckleBone(bones) {
  const middle = bones.fingers.find((finger) => finger.name === 'middle');
  const any = bones.fingers.find((finger) => finger.name !== 'thumb');
  const chain = middle || any;
  return chain ? chain.bones[0] : null;
}
