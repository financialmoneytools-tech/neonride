import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { config } from '../../../config.js';
import { createNeonMaterial, createRiderMaterial } from '../RiderMaterial.js';
import { collectArmBones } from './armBones.js';
import { buildCuff, cuffFrame } from './cuff.js';
import { bakeSkin } from './bakeSkin.js';
import { poseArm } from './poseArm.js';
import { trimSkinnedGeometry } from './trimSkin.js';
import { GeometryBuilder } from '../../../utils/geometry.js';

/**
 * ModelHands - arms and hands loaded from a GLB instead of built from
 * primitives. Satisfies the same contract as PrimitiveHands, so Rider cannot
 * tell them apart. See ASSETS.md for the model's source and licence.
 *
 * The load does four things, in this order, and all of them once:
 *
 *   pose   the rest pose is an A pose with a flat open hand. It is put into a
 *          riding grip by rotating the joints it was rigged with - see
 *          poseArm.js. Nothing else can fix it; placement never could.
 *   bake   the posed skin is frozen into static geometry. The arm never moves
 *          again, so paying for skinning every frame would buy nothing.
 *   trim   one arm's bones are kept and the rest thrown away. The pack holds
 *          both arms in a single mesh, so without this you get four.
 *   dress  the pack's material and texture are discarded and the geometry gets
 *          the project's own glove shader, so the arms are lit by the same key
 *          and neon rim as the rest of the cockpit.
 *
 * The right arm is mirrored for the left, which is correct because the pack is
 * modelled symmetrically and means only one arm's geometry is kept.
 *
 * Loading is asynchronous and createHands is not, so the group comes back empty
 * and is filled when the load resolves. Nothing upstream waits. If the file is
 * missing the caller is told, so a clone with no asset still runs.
 */

const _correction = new THREE.Matrix4();
const _inverse = new THREE.Matrix4();
const _mirror = new THREE.Matrix4().makeScale(-1, 1, 1);
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();

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
  const trim = createNeonMaterial(cfg.materials.neonRight, 'RiderCuffRim');

  let disposed = false;
  let geometry = null;
  let rimGeometry = null;

  if (!loader) loader = new GLTFLoader();

  loader.load(
    model.url,
    (gltf) => {
      // The set may have been torn down while the request was in flight, on a
      // hot reload or a source switch. Dropping the result is the whole point
      // of checking: adding to a group nobody owns any more leaks it.
      if (disposed) return;

      const source = pickSource(gltf.scene, model.rightNode);
      if (!source || !source.skeleton) {
        if (onFailure) onFailure('no skinned mesh found in ' + model.url);
        return;
      }

      buildCorrection(cfg, model, _correction);
      poseArm(collectArmBones(source.skeleton), plan(cfg, model), source.skeleton.bones[0]);

      const baked = bakeSkin(source);
      geometry = trimSkinnedGeometry(baked, source.skeleton.bones, model.keepBones);
      if (geometry !== baked) baked.dispose();

      if (geometry.attributes.position.count === 0) {
        if (onFailure) onFailure('keepBones matched no geometry in ' + model.url);
        return;
      }

      // Bake the node's own transform in first, so a pack that parents its mesh
      // under a rotated armature still lands where the anchors say, then the
      // correction that puts the model's units and origin into ours.
      source.updateWorldMatrix(true, false);
      geometry.applyMatrix4(source.matrixWorld);
      geometry.applyMatrix4(_correction);

      // We keep a copy of the geometry and nothing else, so the loaded scene
      // goes now rather than lingering behind the GLTFLoader's result. Its
      // texture in particular is one we never render and never want uploaded.
      releaseScene(gltf.scene);

      // The hand is cut at the wrist, so it needs an end. The cuff is placed
      // from the POSED skeleton rather than authored, because the cut is
      // wherever this pack happens to put its wrist joint.
      const frame = cuffFrame(collectArmBones(source.skeleton), _correction);
      if (frame) {
        const cuff = buildCuff(frame.wrist, frame.inward, model.cuff);
        geometry = new GeometryBuilder().add(geometry).add(cuff.body).build('hand-with-cuff');
        rimGeometry = cuff.rim;
      }

      // The hand is posed to hold the grip, so it is already where it belongs:
      // the only transform left is the mirror that makes the other side.
      addSide(geometry, new THREE.Matrix4(), glove, group, meshes);
      addSide(geometry, _mirror.clone(), gloveMirrored, group, meshes);
      if (rimGeometry) {
        addSide(rimGeometry, new THREE.Matrix4(), trim, group, meshes);
        addSide(rimGeometry, _mirror.clone(), trim, group, meshes);
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

    /** Nothing to animate: the pose is baked, by design. */
    update() {},

    dispose() {
      disposed = true;
      // Both sides share one geometry, so it is freed here rather than per mesh.
      if (geometry) geometry.dispose();
      if (rimGeometry) rimGeometry.dispose();
      geometry = null;
      rimGeometry = null;
      meshes.length = 0;
      glove.dispose();
      gloveMirrored.dispose();
      trim.dispose();
      group.clear();
    },
  };
}

/**
 * Model space to rig space: scale to our units, then put the model's origin -
 * which is the clavicle root - on the shoulder anchor.
 */
function buildCorrection(cfg, model, target) {
  const shoulder = cfg.anchors.rightShoulder;
  return target.compose(
    new THREE.Vector3(
      shoulder[0] + model.offset[0],
      shoulder[1] + model.offset[1],
      shoulder[2] + model.offset[2],
    ),
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(model.rotation[0], model.rotation[1], model.rotation[2], 'XYZ'),
    ),
    new THREE.Vector3(model.scale, model.scale, model.scale),
  );
}

/**
 * The pose targets, converted from rig space into the model's own space.
 *
 * Posing happens before the correction is applied, because a skeleton's bind
 * matrices are written in the model's space and moving the whole scene first
 * would have the correction counted twice.
 */
function plan(cfg, model) {
  _inverse.copy(_correction).invert();

  const grip = cfg.anchors.rightGrip;
  _from.fromArray(grip.from);
  _to.fromArray(grip.to);

  const target = _from.clone().lerp(_to, grip.along).applyMatrix4(_inverse);
  // Directions, so the translation does not apply and the uniform scale leaves
  // a normalised direction unchanged - the same vector in both spaces.
  const axis = _to.clone().sub(_from).normalize();

  return {
    target,
    axis,
    up: new THREE.Vector3(0, 1, 0),
    pole: new THREE.Vector3().fromArray(model.elbowPole).normalize(),
    profile: model.curlProfile,
    thumbProfile: model.thumbCurlProfile,
    // A length in the model's own units, which is where the search happens.
    wrap: (grip.radius * model.wrapClearance) / model.scale,
    thumbWrap: model.thumbWrap,
    maxCurl: model.maxCurl,
    wristRoll: model.wristRoll,
    passes: model.passes,
  };
}

/**
 * Finds the geometry to use. A named node wins; otherwise the first mesh in the
 * file is taken, which is what a single mesh pack gives you.
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
 * Places one shared geometry under one transform, wearing our material.
 *
 * A mirrored matrix has a negative determinant, which reverses winding - front
 * faces get culled instead of back ones and the arm renders inside out - so
 * that side gets a two sided material. At this triangle count it costs nothing,
 * and the shader flips normals on back faces so it lights the same as the
 * other arm.
 */
function addSide(geometry, matrix, material, group, meshes) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Rider_glove';
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(matrix);

  group.add(mesh);
  meshes.push(mesh);
}
