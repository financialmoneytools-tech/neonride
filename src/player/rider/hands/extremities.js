import * as THREE from 'three';
import { config } from '../../../config.js';
import { addTube, alignMatrix } from '../../../utils/geometry.js';
import { segment } from './handSpace.js';

/**
 * The parts of the hand that are tubes rather than lofted shells: the thumb and
 * its lit line, the forearm, and the cuff that ends the glove.
 *
 * Split out of ./GlovedFist.js because that file went past the size a file in
 * this project is allowed to be. The division is real, not arbitrary: the fist
 * and its knuckle ridge are swept sections wrapped around the grip, and these
 * are tubes laid along paths on top of that - different machinery, different
 * failure modes.
 */

const _matrix = new THREE.Matrix4();
const _local = new THREE.Matrix4();
const _point = new THREE.Vector3();
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();

/**
 * The thumb, crossing the back of the hand and away over the crest.
 *
 * A path rather than a direction and a length, because a straight tube between
 * the two ends it wants cuts the corner: measured, a chord from the back face
 * to the front one passes 0.0165 from the grip axis, which is inside the tube.
 * A thumb goes AROUND a bar, so it is built the way it bends.
 *
 * It starts and ends sunk into the shell, so it grows out of the mass at the
 * web and dies back into it at the tip rather than stopping in mid air.
 */
export function buildThumb(glove, root) {
  const cfg = config.player.rider.hand.thumb;
  const path = cfg.path;

  for (let i = 0; i < path.length - 1; i++) {
    const from = i / (path.length - 1);
    const to = (i + 1) / (path.length - 1);
    _from.fromArray(path[i]);
    _to.fromArray(path[i + 1]);
    segment(
      glove,
      root,
      _from,
      _to,
      cfg.radius * (1 - from * (1 - cfg.taper)),
      cfg.radius * (1 - to * (1 - cfg.taper)),
      cfg.segments,
    );

    // A bead at every bend, so two segments read as a joint rather than as a
    // break, and a cap at the tip so it does not end on a flat disc.
    const radius = cfg.radius * (1 - to * (1 - cfg.taper));
    glove.add(
      new THREE.SphereGeometry(radius, cfg.segments, 8),
      _matrix.multiplyMatrices(root, _local.makeTranslation(_to.x, _to.y, _to.z)),
    );
  }
}

/**
 * The lit line along the thumb.
 *
 * Laid on the thumb's crown rather than its centreline: each path point is
 * pushed away from the grip axis by the thumb's own radius there, less the
 * strip's, so the strip sits in the surface instead of floating over it or
 * sinking inside it.
 */
export function buildThumbTrim(neon, root) {
  const cfg = config.player.rider.hand.thumb;
  const trim = cfg.trim;
  const path = cfg.path;
  const lifted = new Array(path.length);

  for (let i = 0; i < path.length; i++) {
    const at = i / (path.length - 1);
    const radius = cfg.radius * (1 - at * (1 - cfg.taper));
    // Outward from the grip axis, which runs along +X through the origin of
    // this frame, so the axis contributes nothing to the direction.
    _point.set(0, path[i][1], path[i][2]).normalize().multiplyScalar(radius - trim.radius);
    _point.x += path[i][0];
    _point.y += path[i][1];
    _point.z += path[i][2];
    lifted[i] = _point.clone().applyMatrix4(root).toArray();
  }
  for (let i = 0; i < lifted.length - 1; i++) {
    addTube(neon, lifted[i], lifted[i + 1], trim.radius, trim.radialSegments);
  }
}

/**
 * Forearm, running back and down out of the bottom of the frame.
 *
 * Rounded off at the far end. A cylinder cap is flat, and flat is what an arm
 * leaving frame must not be: the rim term caught it as a hard ellipse in the
 * bottom corner, which read as one more loose lobe rather than as an arm
 * continuing past the edge of the picture.
 */
export function buildForearm(glove, root) {
  const cfg = config.player.rider.hand.forearm;
  _from.fromArray(cfg.offset);
  _to.fromArray(cfg.direction).normalize().multiplyScalar(cfg.length).add(_from);

  const endRadius = cfg.radius * cfg.flare;
  segment(glove, root, _from, _to, cfg.radius, endRadius, cfg.segments);
  glove.add(
    new THREE.SphereGeometry(endRadius, cfg.segments, 10),
    _matrix.multiplyMatrices(root, _local.makeTranslation(_to.x, _to.y, _to.z)),
  );
}

/** The lit band that ends the glove at the wrist. */
export function buildCuff(neon, root) {
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

