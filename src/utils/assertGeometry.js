import * as THREE from 'three';

/**
 * Sanity checks for generated geometry.
 *
 * These exist because of one specific failure, and the shape of that failure is
 * why they are worth their lines. addTube takes plain arrays; it was handed
 * Vector3 objects, read `point[0]` as undefined, and built a buffer full of
 * NaN. Nothing threw. The geometry rendered as nothing, and a coverage probe
 * measuring it reported 100 per cent - because every comparison against NaN is
 * false, so the tests that were supposed to reject a miss accepted everything.
 *
 * The bug did not break the measurement. It INVERTED it, and produced a
 * confident number pointing the opposite way from the truth. That is the class
 * of failure worth spending code on: not the ones that crash, the ones that
 * come back looking like success.
 *
 * All of this runs once, at construction - no geometry is built in a frame - so
 * a full scan of the buffer costs nothing anyone will ever notice.
 */

const _size = new THREE.Vector3();

/**
 * Rejects anything that is not three finite numbers.
 * @param {number[]} point
 * @param {string} where
 */
export function assertPoint(point, where) {
  if (!Array.isArray(point) || point.length < 3) {
    throw new Error(
      where + ' wants a plain [x, y, z]; got ' +
        (point && point.isVector3 ? 'a Vector3 - call .toArray()' : typeof point),
    );
  }
  for (let i = 0; i < 3; i++) {
    if (!Number.isFinite(point[i])) {
      throw new Error(where + ' has a non-finite component: [' + point.join(', ') + ']');
    }
  }
}

/**
 * Refuses geometry that is not a solid object: a NaN coordinate, an infinite
 * bound, or a box with no extent in some axis. Thrown at construction, where
 * the stack still names the part that produced it.
 *
 * @param {THREE.BufferGeometry} geometry
 * @param {string} name
 */
export function assertSolid(geometry, name) {
  const position = geometry.attributes.position;
  if (!position || position.count === 0) {
    throw new Error('geometry "' + name + '" has no vertices');
  }

  const array = position.array;
  for (let i = 0; i < array.length; i++) {
    if (!Number.isFinite(array[i])) {
      throw new Error(
        'geometry "' + name + '" has a non-finite coordinate at index ' + i +
          '. The usual cause is a helper given a Vector3 where it wanted [x, y, z].',
      );
    }
  }

  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  box.getSize(_size);

  if (!Number.isFinite(_size.x + _size.y + _size.z)) {
    throw new Error('geometry "' + name + '" has a non-finite bounding box');
  }
  // Every axis, because a part flattened in one of them is a part that was
  // scaled by a value that arrived undefined.
  if (_size.x <= 0 || _size.y <= 0 || _size.z <= 0) {
    throw new Error(
      'geometry "' + name + '" is flat: extent ' +
        _size.toArray().map((v) => v.toFixed(6)).join(' x '),
    );
  }
}
