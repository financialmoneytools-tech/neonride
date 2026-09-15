import * as THREE from 'three';

/**
 * Hand space - how a piece of hand is placed in the grip anchor's frame.
 *
 * The anchor frame is +X out along the grip, +Y up, +Z back at the rider (see
 * ./anchors.js). Two of the three things here exist because the lofted parts
 * are authored in a DIFFERENT frame - the loft sweeps along its own +Z with its
 * section in XY - and something has to map one onto the other. Getting that
 * mapping wrong is not loud: the knuckle ridge was once offset along the grip
 * instead of forward, which slid it 16 mm sideways and 8 mm under the surface,
 * and all it looked like was a faint line.
 */

// A quarter turn about Y takes the loft's spine onto the grip. After it the
// section's +x points FORWARD, down the road, and its +y points up.
const _toGrip = new THREE.Matrix4().makeRotationY(Math.PI / 2);

const _matrix = new THREE.Matrix4();
const _local = new THREE.Matrix4();
const _offset = new THREE.Matrix4();

const _direction = new THREE.Vector3();
const _midpoint = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _unitScale = new THREE.Vector3(1, 1, 1);
const UP = new THREE.Vector3(0, 1, 0);

/**
 * Loft stations in absolute units. Config authors them normalized against
 * radii, the same way the fairing does, so the numbers stay readable.
 * @param {number[]} radii
 * @param {Array<{z: number, offset: number[], scale: number[]}>} stations
 */
export function absolute(radii, stations) {
  const out = new Array(stations.length);
  for (let s = 0; s < stations.length; s++) {
    const station = stations[s];
    out[s] = {
      z: station.z * radii[2],
      offset: [station.offset[0] * radii[0], station.offset[1] * radii[1]],
      scale: [station.scale[0] * radii[0], station.scale[1] * radii[1]],
      roll: station.roll || 0,
    };
  }
  return out;
}

/**
 * The loft's own frame, placed at an offset in the anchor frame.
 * The offset is in ANCHOR coordinates: [along the grip, up, back at the rider].
 * @param {THREE.Matrix4} root the anchor frame
 * @param {number[]} offset
 * @returns {THREE.Matrix4} reused; apply it before calling again
 */
export function placed(root, offset) {
  _offset.makeTranslation(offset[0], offset[1], offset[2]);
  _local.multiplyMatrices(_offset, _toGrip);
  return _matrix.multiplyMatrices(root, _local);
}

/**
 * One tapered tube between two points in the anchor frame.
 * @param {import('../../../utils/geometry.js').GeometryBuilder} builder
 * @param {THREE.Matrix4} root
 * @param {THREE.Vector3} from
 * @param {THREE.Vector3} to
 */
export function segment(builder, root, from, to, radius, endRadius, segments) {
  _direction.copy(to).sub(from);
  const length = _direction.length();
  if (length === 0) return;

  _direction.divideScalar(length);
  _quaternion.setFromUnitVectors(UP, _direction);
  _midpoint.copy(from).addScaledVector(_direction, length * 0.5);
  _local.compose(_midpoint, _quaternion, _unitScale);

  builder.add(
    new THREE.CylinderGeometry(endRadius, radius, length, segments, 1),
    _matrix.multiplyMatrices(root, _local),
  );
}
