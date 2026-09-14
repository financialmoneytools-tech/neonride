import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { config } from '../../../config.js';
import { createRiderMaterial } from '../RiderMaterial.js';
import { gripAnchorFrame, SIDE_LEFT, SIDE_RIGHT } from './anchors.js';
import { trimSkinnedGeometry } from './trimSkin.js';

/**
 * ModelHands - hands loaded from a GLB instead of built from primitives.
 *
 * Satisfies the same contract as PrimitiveHands, so Rider cannot tell them
 * apart. See ASSETS.md for the model's source and licence.
 *
 * Three things are deliberate.
 *
 * The pack's own material and texture are thrown away. Only the geometry is
 * taken, and it is given the project's glove material, so the hands are lit by
 * the same fake key and neon rim as the rest of the cockpit rather than by a
 * hand painted texture from somewhere else.
 *
 * Only the bones named in hand.model.keepBones survive. An arm pack ships whole
 * arms, both of them, in one mesh; a cockpit needs one hand and a stub of
 * forearm, mirrored. Cutting the rest away is not an optimisation, it is what
 * makes the pack usable at all - see the note on rest poses in config/hand.js.
 *
 * Loading is asynchronous and createHands is not, so the group comes back empty
 * and is filled when the load resolves. Nothing upstream waits, and the rest of
 * the cockpit draws from the first frame. If the file is missing the caller is
 * told, so a clone with no asset downloaded still runs rather than throwing.
 */

const _matrix = new THREE.Matrix4();

let loader = null;

/**
 * @param {object} anchor config.player.rider.anchors.rightGrip
 * @param {(reason: string) => void} [onFailure] called if the model cannot load
 * @returns {import('../Hands.js').HandSet}
 */
export function createModelHands(anchor, onFailure) {
  const cfg = config.player.rider;
  const model = cfg.hand.model;

  const group = new THREE.Group();
  group.name = 'Hands';

  const meshes = [];
  // The pack gets the glove preset with its own overrides on top: a low poly
  // surface needs different rim and key values from a smooth one to read.
  const preset = Object.assign({}, cfg.materials.glove, model.material);
  const glove = createRiderMaterial(preset, 'RiderGloveModel');
  const gloveMirrored = glove.clone();
  gloveMirrored.name = 'RiderGloveModelMirrored';
  gloveMirrored.side = THREE.DoubleSide;

  let disposed = false;
  let trimmed = null;

  if (!loader) loader = new GLTFLoader();

  loader.load(
    model.url,
    (gltf) => {
      // The set may have been torn down while the request was in flight, on a
      // hot reload or a source switch. Dropping the result is the whole point
      // of checking: adding to a group nobody owns any more leaks it.
      if (disposed) return;

      const source = pickSource(gltf.scene, model.rightNode);
      if (!source) {
        if (onFailure) onFailure('no mesh found in ' + model.url);
        return;
      }

      const bones = source.skeleton ? source.skeleton.bones : [];
      trimmed = trimSkinnedGeometry(source.geometry, bones, model.keepBones);
      source.updateWorldMatrix(true, false);
      // Bake the node's own transform in, so a pack that parents its mesh under
      // a rotated armature still lands where the anchor says.
      trimmed.applyMatrix4(source.matrixWorld);
      // We keep a copy of the geometry and nothing else, so the loaded scene
      // goes now rather than lingering behind the GLTFLoader's result. Its
      // texture in particular is one we never render and never want uploaded.
      releaseScene(gltf.scene);

      if (trimmed.attributes.position.count === 0) {
        if (onFailure) onFailure('keepBones matched no geometry in ' + model.url);
        return;
      }

      // The correction sits between the anchor and the geometry: the anchor
      // says where a hand goes, this says how this particular pack has to be
      // turned and scaled to get there.
      _matrix.compose(
        new THREE.Vector3().fromArray(model.offset),
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(model.rotation[0], model.rotation[1], model.rotation[2], 'XYZ'),
        ),
        new THREE.Vector3(model.scale, model.scale, model.scale),
      );

      for (const side of [SIDE_RIGHT, SIDE_LEFT]) {
        const root = gripAnchorFrame(anchor, side, new THREE.Matrix4());
        root.multiply(_matrix);
        addSide(trimmed, root, side === SIDE_LEFT ? gloveMirrored : glove, group, meshes);
      }
    },
    undefined,
    () => {
      if (!disposed && onFailure) onFailure('could not load ' + model.url);
    },
  );

  return {
    group,
    meshes,

    /** Nothing to animate yet: the geometry is taken posed, not skinned. */
    update() {},

    dispose() {
      disposed = true;
      // Both sides share one geometry, so it is freed here rather than per mesh.
      if (trimmed) trimmed.dispose();
      trimmed = null;
      meshes.length = 0;
      glove.dispose();
      gloveMirrored.dispose();
      group.clear();
    },
  };
}

/**
 * Finds the geometry to use. A named node wins; otherwise the first mesh in the
 * file is taken, which is what a single arm pack gives you.
 * @returns {THREE.Object3D|null}
 */
function pickSource(scene, nodeName) {
  scene.updateMatrixWorld(true);

  if (nodeName) {
    const named = scene.getObjectByName(nodeName);
    if (named) return named;
  }

  let first = null;
  scene.traverse((object) => {
    if (!first && object.isMesh) first = object;
  });
  return first;
}

/**
 * Frees everything the loader built. The pack's own materials and textures are
 * never rendered - the geometry wears ours - so holding them costs memory for
 * nothing.
 */
function releaseScene(scene) {
  scene.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && value.isTexture) value.dispose();
      }
      material.dispose();
    }
  });
}

/**
 * Places one shared geometry under one anchor frame, wearing our material.
 *
 * The left side is the right one mirrored. That is correct for this pack
 * because it is modelled symmetrically, and it means only one arm's worth of
 * geometry is kept. A mirrored frame has a negative determinant, which reverses
 * winding - front faces get culled instead of back ones and the hand renders
 * inside out - so that side gets a two sided material. At this triangle count
 * it costs nothing.
 */
function addSide(geometry, root, material, group, meshes) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Rider_glove';
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(root);

  group.add(mesh);
  meshes.push(mesh);
}
