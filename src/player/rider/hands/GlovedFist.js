import * as THREE from 'three';
import { config } from '../../../config.js';
import { GeometryBuilder, addTube, alignMatrix } from '../../../utils/geometry.js';
import { sectionPath } from '../../../utils/loft/section.js';
import { loftShell } from '../../../utils/loft/shell.js';
import { createNeonMaterial, createRiderMaterial } from '../RiderMaterial.js';
import { gripAnchorFrame, SIDE_LEFT, SIDE_RIGHT } from './anchors.js';

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

// The loft is authored with its spine along +Z and its section in XY; the grip
// runs along the anchor's +X. A quarter turn about Y maps one to the other, and
// after it the section's +x points FORWARD, down the road, and +y points up.
const _toGrip = new THREE.Matrix4().makeRotationY(Math.PI / 2);

const _matrix = new THREE.Matrix4();
const _local = new THREE.Matrix4();
const _offset = new THREE.Matrix4();

const _point = new THREE.Vector3();
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _direction = new THREE.Vector3();
const _midpoint = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _unitScale = new THREE.Vector3(1, 1, 1);
const UP = new THREE.Vector3(0, 1, 0);

/**
 * Stations in absolute units. Config authors them normalized against radii, the
 * same way the fairing does, so the numbers stay readable.
 */
function absolute(radii, stations) {
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

/** The loft's own frame, placed at an offset in the anchor frame. */
function placed(root, offset) {
  _offset.makeTranslation(offset[0], offset[1], offset[2]);
  _local.multiplyMatrices(_offset, _toGrip);
  return _matrix.multiplyMatrices(root, _local);
}

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

/**
 * The thumb, lying across the top of the grip.
 *
 * The one lobe a gripping hand really does have, and it starts INSIDE the fist
 * - the offset is closer to the grip axis than the section is - so it emerges
 * from the mass instead of floating beside it.
 */
function buildThumb(glove, root) {
  const cfg = config.player.rider.hand.thumb;
  _from.fromArray(cfg.offset);
  _to.fromArray(cfg.direction).normalize().multiplyScalar(cfg.length).add(_from);

  segment(glove, root, _from, _to, cfg.radius, cfg.radius * cfg.taper, cfg.segments);
  glove.add(
    new THREE.SphereGeometry(cfg.radius * cfg.taper, 10, 8),
    _matrix.multiplyMatrices(root, _local.makeTranslation(_to.x, _to.y, _to.z)),
  );
}

/** Forearm, running back and down out of the bottom of the frame. */
function buildForearm(glove, root) {
  const cfg = config.player.rider.hand.forearm;
  _from.fromArray(cfg.offset);
  _to.fromArray(cfg.direction).normalize().multiplyScalar(cfg.length).add(_from);
  segment(glove, root, _from, _to, cfg.radius, cfg.radius * cfg.flare, cfg.segments);
}

/** The lit band that ends the glove at the wrist. */
function buildCuff(neon, root) {
  const cfg = config.player.rider.hand.cuff;

  // Open ended cylinder: the wall alone is exactly a band around the cuff.
  const band = new THREE.CylinderGeometry(
    cfg.radius,
    cfg.radius,
    cfg.width,
    cfg.segments,
    1,
    true,
  );
  alignMatrix(cfg.offset, cfg.direction, _local);
  neon.add(band, _matrix.multiplyMatrices(root, _local));
}

/** One tapered tube expressed in hand space, transformed into the rig. */
function segment(builder, root, from, to, radius, endRadius, segments) {
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
