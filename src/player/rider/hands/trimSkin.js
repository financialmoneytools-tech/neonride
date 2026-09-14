import * as THREE from 'three';

/**
 * Cuts a skinned mesh down to the bones we actually want to see.
 *
 * A first person viewmodel only ever shows forearms and hands; everything above
 * the elbow is behind the camera. An arm pack ships the whole limb, and the
 * part we cannot see is also the part whose rest pose is most wrong for a
 * riding position, so cutting it off removes geometry and a problem at once.
 *
 * A vertex belongs to the bone carrying most of its weight. That is exact
 * enough here because the seams we cut at - mid forearm, and the centre line
 * between the two arms - are nowhere near a blend between a kept and a dropped
 * bone. A triangle survives only if all three of its vertices do, so the cut
 * follows the existing edges and leaves no stray fragments.
 */

/**
 * @param {THREE.BufferGeometry} geometry source, with skinIndex and skinWeight
 * @param {Array<THREE.Bone>} bones skeleton bones, in skin index order
 * @param {{prefixes: Array<string>, suffix: string}} keep bones to keep: a name
 *   matching any prefix AND ending in the suffix survives. Blender names sides
 *   with a '.r' / '.l' suffix, so the suffix is what separates the two arms -
 *   a prefix alone cannot, because 'finger_' is the start of both hands.
 * @returns {THREE.BufferGeometry} a new geometry, skinning attributes removed
 */
export function trimSkinnedGeometry(geometry, bones, keep) {
  const source = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  if (!keep || !keep.prefixes || keep.prefixes.length === 0) return stripSkin(source);

  const skinIndex = source.attributes.skinIndex;
  const skinWeight = source.attributes.skinWeight;
  if (!skinIndex || !skinWeight) return stripSkin(source);

  // GLTFLoader runs every node name through PropertyBinding.sanitizeNodeName,
  // which strips the characters the animation path syntax reserves - the dot
  // included. So the bone the file calls 'wrist.r' arrives here as 'wristr'.
  // Running the configured names through the same function means config can
  // keep the names the file actually uses, and we cannot drift from three's
  // rule by copying it out by hand.
  const clean = (name) => THREE.PropertyBinding.sanitizeNodeName(name);
  const suffix = clean(keep.suffix || '');
  const keepBone = bones.map(
    (bone) =>
      bone.name.slice(bone.name.length - suffix.length) === suffix &&
      keep.prefixes.some((prefix) => bone.name.indexOf(clean(prefix)) === 0),
  );

  const count = source.attributes.position.count;
  const keepVertex = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    let best = -1;
    let bestWeight = -1;
    for (let k = 0; k < 4; k++) {
      const weight = skinWeight.getComponent(i, k);
      if (weight > bestWeight) {
        bestWeight = weight;
        best = skinIndex.getComponent(i, k);
      }
    }
    keepVertex[i] = best >= 0 && keepBone[best] ? 1 : 0;
  }

  const keepTriangle = [];
  for (let t = 0; t < count; t += 3) {
    if (keepVertex[t] && keepVertex[t + 1] && keepVertex[t + 2]) keepTriangle.push(t);
  }

  return build(source, keepTriangle);
}

/** Copies the kept triangles into a fresh geometry. */
function build(source, triangles) {
  const out = new THREE.BufferGeometry();
  const names = ['position', 'normal', 'uv'];

  for (const name of names) {
    const from = source.attributes[name];
    if (!from) continue;
    const size = from.itemSize;
    const data = new Float32Array(triangles.length * 3 * size);
    let write = 0;
    for (let i = 0; i < triangles.length; i++) {
      for (let v = 0; v < 3; v++) {
        const index = triangles[i] + v;
        for (let k = 0; k < size; k++) data[write++] = from.getComponent(index, k);
      }
    }
    out.setAttribute(name, new THREE.BufferAttribute(data, size));
  }

  source.dispose();
  out.computeBoundingBox();
  out.computeBoundingSphere();
  return out;
}

/** Drops the skinning attributes: nothing downstream reads them. */
function stripSkin(geometry) {
  geometry.deleteAttribute('skinIndex');
  geometry.deleteAttribute('skinWeight');
  return geometry;
}
