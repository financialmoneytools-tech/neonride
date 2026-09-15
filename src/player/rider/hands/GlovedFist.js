import * as THREE from 'three';
import { config } from '../../../config.js';
import { GeometryBuilder, addTube } from '../../../utils/geometry.js';
import { sectionPath } from '../../../utils/loft/section.js';
import { loftShell } from '../../../utils/loft/shell.js';
import { createNeonMaterial, createRiderMaterial } from '../RiderMaterial.js';
import { gripAnchorFrame, SIDE_LEFT, SIDE_RIGHT } from './anchors.js';
import { buildCuff, buildForearm, buildThumb, buildThumbTrim } from './extremities.js';
import { absolute, placed } from './handSpace.js';

/**
 * GlovedFist - a closed hand around the grip, built as one mass.
 *
 * What this replaced was a palm ellipsoid, four knuckle spheres, eight finger
 * cylinders, eight joint beads and a thumb - twenty-two separate solids with
 * air between them. It failed for two reasons and only one of them was shape:
 *
 *   SHAPE    nothing was joined to anything, and the finger arcs never closed,
 *            so the grip ran straight through the hand unoccluded.
 *   SHADING  the rim term draws an outline around every convex lobe it is
 *            given. Twenty-two lobes, twenty-two purple outlines, and the hand
 *            read as a cluster of floating capsules - which is exactly what it
 *            was.
 *
 * Both are fixed by the same decision: ONE closed shell. A hand gripping a bar
 * is a swept section - the fingers do not move independently, they are a single
 * closed mass wrapped around a tube - so it lofts the way the fairing does.
 * Section runs round the grip, spine runs ALONG it, and the four knuckles are
 * stations where the section swells rather than four spheres sitting on top.
 * One shell means one silhouette, so the rim outlines the hand instead of its
 * parts, and the section encloses the grip at every station, so the tube is
 * genuinely hidden behind the hand rather than nearly hidden.
 *
 * What it gives up is articulated fingers. A closed fist does not have any, so
 * there is nothing to give up.
 *
 * Authored once for the RIGHT grip, in the frame the anchor carries: +X out
 * along the grip, +Y up, +Z back at the rider. The left hand is the same
 * geometry under the mirrored anchor frame - a real reflection this time, not a
 * rotation, which is right because a left hand IS a mirrored right hand.
 */

const _point = new THREE.Vector3();

/**
 * @param {object} anchor config.player.rider.anchors.rightGrip
 * @returns {import('../Hands.js').HandSet}
 */
export function createGlovedFist(anchor) {
  const presets = config.player.rider.materials;

  const builders = {
    glove: new GeometryBuilder(),
    neonRight: new GeometryBuilder(),
    neonLeft: new GeometryBuilder(),
  };

  for (const side of [SIDE_RIGHT, SIDE_LEFT]) {
    // The anchor frame for the left side carries a reflection, which reverses
    // the winding of everything under it; GeometryBuilder already puts that
    // back, so both hands work with a single sided material.
    const root = gripAnchorFrame(anchor, side, new THREE.Matrix4());
    const neon = side === SIDE_RIGHT ? builders.neonRight : builders.neonLeft;
    buildFist(builders.glove, root);
    buildThumb(builders.glove, root);
    buildThumbTrim(neon, root);
    buildForearm(builders.glove, root);
    buildKnuckleTrim(neon, root);
    buildCuff(neon, root);
  }

  const materials = {
    glove: createRiderMaterial(presets.glove, 'RiderGlove'),
    neonRight: createNeonMaterial(presets.neonRight, 'RiderNeonRight'),
    neonLeft: createNeonMaterial(presets.neonLeft, 'RiderNeonLeft'),
  };

  const group = new THREE.Group();
  group.name = 'Hands';

  const meshes = [];
  for (const key of Object.keys(builders)) {
    const mesh = new THREE.Mesh(builders[key].build('hand-' + key), materials[key]);
    mesh.name = 'Rider_' + key;
    // The rig is never behind the camera, and these bounds are small enough
    // that a near miss on the cull test would blink a hand out.
    mesh.frustumCulled = false;
    group.add(mesh);
    meshes.push(mesh);
  }

  return {
    group,
    meshes,

    /** Nothing to animate: the fist is welded to the bar, which is where it is. */
    update() {},

    dispose() {
      for (let i = 0; i < meshes.length; i++) meshes[i].geometry.dispose();
      for (const key of Object.keys(materials)) materials[key].dispose();
      group.clear();
    },
  };
}

/**
 * The mass itself, and the knuckle ridge laid into its back.
 *
 * The ridge is a second, much smaller loft rather than four spheres: the
 * references show a continuous row, swelling at each knuckle and dipping
 * between them, not four separate lumps. It is sunk into the fist so only its
 * crown stands proud, which is what makes it read as a ridge ON the hand rather
 * than as something resting on top of it.
 */
function buildFist(glove, root) {
  const cfg = config.player.rider.hand;

  const fist = cfg.fist;
  glove.add(
    loftShell(fist.section, absolute(fist.radii, fist.stations)),
    placed(root, fist.offset),
  );

  const ridge = cfg.knuckleRidge;
  glove.add(
    loftShell(ridge.section, absolute(ridge.radii, ridge.stations)),
    placed(root, ridge.offset),
  );
}

/**
 * A lit line along the crest of the knuckle ridge.
 *
 * The same trick the fairing crease uses, and needed for the same reason: a
 * dark shape against a dark road has no interior, only an outline, and at the
 * size the hands take up in frame the knuckles were being lost entirely. The
 * path is read out of the ridge loft rather than authored beside it, so it is
 * on the crest by construction and dips and swells with it.
 */
function buildKnuckleTrim(neon, root) {
  const cfg = config.player.rider.hand.knuckleRidge;
  const trim = cfg.trim;
  const path = sectionPath(cfg.section, absolute(cfg.radii, cfg.stations), trim.crease);
  const place = placed(root, cfg.offset);

  for (let i = 0; i < path.length; i++) {
    path[i] = _point.fromArray(path[i]).applyMatrix4(place).toArray();
  }
  for (let i = 0; i < path.length - 1; i++) {
    addTube(neon, path[i], path[i + 1], trim.radius, trim.radialSegments);
  }
}
