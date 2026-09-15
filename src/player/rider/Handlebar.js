import * as THREE from 'three';
import { config } from '../../config.js';
import { addTube, partMatrix } from '../../utils/geometry.js';

/**
 * Handlebar - clamp, bars and mirrors.
 *
 * The grips and the brake levers used to be here. They are inside the hand
 * sprite now, which is what removes the join between the drawn hand and the
 * bar it holds; nothing is left for them to be consistent with.
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
    // The grip and the brake lever are drawn into the hand sprite along with
    // the hand itself, so there is no seam between a 2D hand and a 3D bar. They
    // are not built here any more - see hands/SpriteHands.js.
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



/** Stalk, housing and glass. Only the glass goes to the mirror builder. */
function buildMirror(frame, mirrorBuilder, cfg, sign) {
  const from = side(cfg.stalkFrom, sign);
  const to = side(cfg.stalkTo, sign);

  // Tapered: thicker where it is bolted to the clamp, thin where it carries the
  // head. A stalk of one radius end to end is a paddle handle.
  addTube(frame, from, to, cfg.stalkRadius, 8, cfg.stalkTipRadius);

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
