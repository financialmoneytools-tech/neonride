import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { config } from '../../../config.js';
import { createNeonMaterial, createRiderMaterial } from '../RiderMaterial.js';
import { gripAnchorFrame, SIDE_LEFT, SIDE_RIGHT } from './anchors.js';

/**
 * ModelHands - hands loaded from a GLB instead of built from primitives.
 *
 * Satisfies the same contract as PrimitiveHands, so Rider cannot tell them
 * apart. See ASSETS.md for the model's source and licence.
 *
 * Two things are deliberate.
 *
 * The pack's own material and texture are thrown away. Only the geometry is
 * taken, and it is given the project's glove material, so the hands are lit by
 * the same fake key and neon rim as the rest of the cockpit rather than by a
 * hand painted texture from somewhere else.
 *
 * Loading is asynchronous and createHands is not, so the group comes back empty
 * and is filled when the load resolves. Nothing upstream waits, and the rest of
 * the cockpit draws from the first frame. If the file is missing the group
 * simply stays empty and the caller is told, so a clone with no asset
 * downloaded still runs rather than throwing on boot.
 */

const _matrix = new THREE.Matrix4();
const _mirror = new THREE.Matrix4().makeScale(-1, 1, 1);

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
  const materials = {
    glove: createRiderMaterial(cfg.materials.glove, 'RiderGloveModel'),
    neonRight: createNeonMaterial(cfg.materials.neonRight, 'RiderNeonRightModel'),
    neonLeft: createNeonMaterial(cfg.materials.neonLeft, 'RiderNeonLeftModel'),
  };

  let disposed = false;

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

      for (const side of [SIDE_RIGHT, SIDE_LEFT]) {
        const root = gripAnchorFrame(anchor, side, new THREE.Matrix4());
        // The model correction sits between the anchor and the geometry: the
        // anchor says where a hand goes, this says how this particular pack has
        // to be turned and scaled to get there.
        _matrix.compose(
          new THREE.Vector3().fromArray(model.offset),
          new THREE.Quaternion().setFromEuler(
            new THREE.Euler(model.rotation[0], model.rotation[1], model.rotation[2], 'XYZ'),
          ),
          new THREE.Vector3(model.scale, model.scale, model.scale),
        );
        root.multiply(_matrix);
        if (side === SIDE_LEFT) root.premultiply(_mirror);

        addSide(source, root, materials.glove, group, meshes);
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
      for (let i = 0; i < meshes.length; i++) meshes[i].geometry.dispose();
      meshes.length = 0;
      for (const key of Object.keys(materials)) materials[key].dispose();
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
 * Clones the source geometry under one anchor frame, wearing our material.
 *
 * A mirrored frame has a negative determinant, which reverses the winding of
 * everything under it: front faces get culled instead of back ones and the hand
 * renders inside out. Two sided rendering on that one side is the cheap fix,
 * and at this triangle count it costs nothing.
 */
function addSide(source, root, material, group, meshes) {
  const mirrored = root.determinant() < 0;

  source.updateWorldMatrix(true, false);

  const use = mirrored ? material.clone() : material;
  if (mirrored) use.side = THREE.DoubleSide;

  const geometry = source.geometry.clone();
  // Bake the node's own transform in, so a pack that parents its mesh under a
  // rotated armature still lands where the anchor says.
  geometry.applyMatrix4(source.matrixWorld);

  const mesh = new THREE.Mesh(geometry, use);
  mesh.name = 'Rider_glove';
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(root);

  group.add(mesh);
  meshes.push(mesh);
}
