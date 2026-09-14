import * as THREE from 'three';
import { config } from '../../config.js';
import { addTube, alignMatrix, latheFromProfile, partMatrix } from '../../utils/geometry.js';

/**
 * Handlebar - clamp, bars, grips, brake levers and mirrors.
 *
 * Nothing here owns a mesh. Every part is written into one of the shared
 * geometry builders in Rider.js, which merges each builder into a single mesh,
 * so the entire bar assembly costs about three draw calls instead of fifteen.
 *
 * The right half is authored in config and the left half is the same numbers
 * mirrored through the YZ plane, which is what partMatrix does.
 */

const _matrix = new THREE.Matrix4();

/** Mirrors a configured point onto the requested side. */
function side(point, sign) {
  return [point[0] * sign, point[1], point[2]];
}

/**
 * @param {{frame: import('../../utils/geometry.js').GeometryBuilder,
 *          grip: import('../../utils/geometry.js').GeometryBuilder,
 *          mirror: import('../../utils/geometry.js').GeometryBuilder}} builders
 */
export function buildHandlebar(builders) {
  const cfg = config.player.rider;

  buildClamp(builders.frame, cfg.bar);

  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;
    // A supersport has clip-ons, built in bike/Controls.js, and no crossbar.
    if (cfg.bar.style !== 'clipOn') buildBar(builders.frame, cfg.bar, sign);
    buildGrip(builders.grip, cfg.grip, sign);
    buildLever(builders.frame, cfg.lever, sign);
    buildMirror(builders.frame, builders.mirror, cfg.mirror, sign);
  }
}

/** Centre clamp block plus the two bolt caps that sit on top of it. */
function buildClamp(frame, bar) {
  const c = bar.clamp;
  frame.add(
    new THREE.BoxGeometry(c.width, c.height, c.depth),
    partMatrix(1, [0, c.y, 0], null, _matrix),
  );

  const cap = bar.clampCap;
  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;
    frame.add(
      new THREE.CylinderGeometry(cap.radius, cap.radius, cap.length, 10),
      partMatrix(sign, [cap.spacing, c.y + c.height * 0.25, 0], [Math.PI / 2, 0, 0], _matrix),
    );
  }
}

/** Tubes along the configured centreline, with a sphere filling every bend. */
function buildBar(frame, bar, sign) {
  const path = bar.path;

  for (let i = 0; i < path.length - 1; i++) {
    addTube(frame, side(path[i], sign), side(path[i + 1], sign), bar.radius, bar.radialSegments);
  }

  // A bend between two cylinders leaves a wedge shaped gap on the outside of
  // the corner; a sphere of the same radius fills it and reads as a smooth bend.
  for (let i = 1; i < path.length - 1; i++) {
    frame.add(
      new THREE.SphereGeometry(bar.radius, bar.radialSegments, 6),
      partMatrix(sign, path[i], null, _matrix),
    );
  }
}

/** Rubber grip: a slightly fat tube, shallow ribs, and a flared lathe end cap. */
function buildGrip(grip, cfg, sign) {
  const from = side(cfg.from, sign);
  const to = side(cfg.to, sign);

  addTube(grip, from, to, cfg.radius, cfg.radialSegments);

  const direction = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];

  // Ribs are placed across the inner three quarters, leaving the outer end for
  // the cap. They exist to break up the rim light along an otherwise dead tube.
  for (let i = 0; i < cfg.ribs; i++) {
    const t = 0.12 + (0.62 * i) / Math.max(1, cfg.ribs - 1);
    const at = [from[0] + direction[0] * t, from[1] + direction[1] * t, from[2] + direction[2] * t];
    grip.add(
      new THREE.CylinderGeometry(cfg.ribRadius, cfg.ribRadius, cfg.ribWidth, cfg.radialSegments),
      alignMatrix(at, direction, _matrix),
    );
  }

  grip.add(latheFromProfile(cfg.capProfile, cfg.capSegments), alignMatrix(to, direction, _matrix));
}

/** Lever perch on the bar, and the blade reaching forward past the grip. */
function buildLever(frame, cfg, sign) {
  const pivot = side(cfg.pivot, sign);
  const perch = cfg.perch;

  frame.add(
    new THREE.BoxGeometry(perch.width, perch.height, perch.depth),
    partMatrix(sign, cfg.pivot, null, _matrix),
  );

  const direction = side(cfg.direction, sign);
  const length = Math.hypot(direction[0], direction[1], direction[2]);
  const end = [
    pivot[0] + (direction[0] / length) * cfg.length,
    pivot[1] + (direction[1] / length) * cfg.length,
    pivot[2] + (direction[2] / length) * cfg.length,
  ];

  // The blade is a flattened box, so it is built along +Y and then aimed the
  // same way a tube would be.
  const blade = new THREE.BoxGeometry(cfg.width, cfg.length, cfg.thickness);
  blade.translate(0, cfg.length * 0.5, 0);
  frame.add(blade, alignMatrix(pivot, direction, _matrix));

  // Rounded tip, so the blade does not end in a visible rectangle.
  frame.add(
    new THREE.SphereGeometry(cfg.thickness * 1.1, 8, 6),
    partMatrix(1, end, null, _matrix),
  );
}

/** Stalk, housing and glass. Only the glass goes to the mirror builder. */
function buildMirror(frame, mirrorBuilder, cfg, sign) {
  const from = side(cfg.stalkFrom, sign);
  const to = side(cfg.stalkTo, sign);

  addTube(frame, from, to, cfg.stalkRadius, 8);

  const rotation = [cfg.headRotation.x, cfg.headRotation.y, cfg.headRotation.z];
  partMatrix(sign, cfg.stalkTo, rotation, _matrix);

  // CylinderGeometry is built along +Y; the head rotation in config is applied
  // on top of a quarter turn that stands the disc up to face the rider.
  const head = new THREE.CylinderGeometry(cfg.headRadius, cfg.headRadius, cfg.headDepth, cfg.headSegments);
  head.rotateX(Math.PI / 2);
  frame.add(head, _matrix);

  const glass = new THREE.CylinderGeometry(cfg.glassRadius, cfg.glassRadius, cfg.headDepth, cfg.headSegments);
  glass.rotateX(Math.PI / 2);
  glass.translate(0, 0, cfg.glassInset);
  mirrorBuilder.add(glass, _matrix);
}
