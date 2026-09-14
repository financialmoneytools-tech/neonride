import * as THREE from 'three';

/**
 * bakeSkin - freezes a posed SkinnedMesh into ordinary static geometry.
 *
 * The arm is posed once at load and never moves again, so paying for skinning
 * every frame - a second set of attributes, a bone texture, a different shader
 * - buys nothing. This walks the vertices once, through three's own
 * applyBoneTransform so the blend matches what the GPU would have produced, and
 * hands back a plain BufferGeometry.
 *
 * Normals are skinned by transforming a point a short step along the normal and
 * taking the difference. That reuses the same tested path instead of rebuilding
 * the blended matrix by hand, and it is exact for the rigid transforms a pose
 * is made of.
 */

const _position = new THREE.Vector3();
const _offset = new THREE.Vector3();

// Mesh units, not metres: far enough to survive single precision, short enough
// that the difference is still the tangent.
const STEP = 0.01;

/**
 * @param {THREE.SkinnedMesh} mesh posed, with its matrices already updated
 * @returns {THREE.BufferGeometry} a new geometry in the mesh's own space
 */
export function bakeSkin(mesh) {
  mesh.updateMatrixWorld(true);
  mesh.skeleton.update();

  const source = mesh.geometry;
  const geometry = source.clone();
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;

  for (let i = 0; i < position.count; i++) {
    _position.fromBufferAttribute(position, i);

    if (normal) {
      _offset.fromBufferAttribute(normal, i).multiplyScalar(STEP).add(_position);
      mesh.applyBoneTransform(i, _offset);
    }

    mesh.applyBoneTransform(i, _position);
    position.setXYZ(i, _position.x, _position.y, _position.z);

    if (normal) {
      _offset.sub(_position).normalize();
      normal.setXYZ(i, _offset.x, _offset.y, _offset.z);
    }
  }

  position.needsUpdate = true;
  if (normal) normal.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
