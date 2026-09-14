import * as THREE from 'three';
import { config } from '../../../config.js';
import { addTube, partMatrix } from '../../../utils/geometry.js';

/**
 * Fairing - the mass the cockpit was missing.
 *
 * Measured before it was built: with only a bar, a fork and a small tank, the
 * rig covered 6.4 per cent of a 16:9 frame and 13 per cent of its lower half.
 * Moving the camera in got that to 26 per cent of the lower half and no
 * further, because there was nothing there to fill it with. What the reference
 * shots have and this did not is bodywork - two wings sweeping out and forward
 * either side of a screen, with a nose between them carrying the cluster.
 *
 * The panels are squashed ellipsoids, the same primitive the tank uses. A
 * tapered tube was tried first and read as origami: from the front a cone is a
 * triangle, and two of them meeting in the middle make an arrowhead rather than
 * bodywork. An ellipsoid has no edges to catch the light wrongly and stays a
 * surface from any angle the camera leans to.
 *
 * Everything here is authored for the right side and mirrored, which is what
 * partMatrix's sign argument is for. The mirror is a proper rotation, so the
 * winding survives and no part needs a two sided material.
 */

const _matrix = new THREE.Matrix4();

/** Mirrors a point through the YZ plane. */
function side(point, sign) {
  return [point[0] * sign, point[1], point[2]];
}

/**
 * @param {Object<string, import('../../../utils/geometry.js').GeometryBuilder>} builders
 */
export function buildFairing(builders) {
  const cfg = config.player.rider.machine;
  const paint = builders.paint;
  const neon = builders.neonLeft;

  buildPanels(cfg.fairing, paint, neon);
  buildNose(cfg.fairing.nose, paint);
  buildScreen(cfg.screen, builders.mirror, neon);
}

/** The two wings and the shoulders that join them to the nose. */
function buildPanels(cfg, paint, neon) {
  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;
    panel(paint, cfg.wing, sign);
    panel(paint, cfg.shoulder, sign);
    panel(paint, cfg.flank, sign);

    // A lit line along the top edge of each wing. A dark panel against a dark
    // road has no silhouette at night; this is what gives it one.
    const trim = cfg.trim;
    addTube(neon, side(trim.from, sign), side(trim.to, sign), trim.radius, trim.radialSegments);
  }
}

/** One squashed ellipsoid of bodywork, mirrored by sign. */
function panel(builder, cfg, sign) {
  const shell = new THREE.SphereGeometry(1, cfg.segments[0], cfg.segments[1]);
  shell.scale(cfg.radii[0], cfg.radii[1], cfg.radii[2]);
  builder.add(shell, partMatrix(sign, cfg.offset, cfg.rotation, _matrix));
}

/** The centre section under the screen, carrying the cluster. */
function buildNose(cfg, paint) {
  const body = new THREE.SphereGeometry(1, cfg.segments[0], cfg.segments[1]);
  body.scale(cfg.radii[0], cfg.radii[1], cfg.radii[2]);
  paint.add(body, partMatrix(1, cfg.offset, cfg.rotation, _matrix));
}

/**
 * The bubble screen: a dark panel with a lit edge.
 *
 * The panel is nearly black on purpose. A screen is glass, and glass at night
 * is a rim of light around something you see straight through - painting the
 * whole thing bright would put a slab across the top of every shot.
 */
function buildScreen(cfg, dark, neon) {
  const shell = new THREE.SphereGeometry(1, cfg.segments[0], cfg.segments[1]);
  shell.scale(cfg.radii[0], cfg.radii[1], cfg.radii[2]);
  dark.add(shell, partMatrix(1, cfg.offset, cfg.rotation, _matrix));

  const edge = cfg.edge;
  const ring = new THREE.TorusGeometry(edge.radius, edge.tube, edge.segments[1], edge.segments[0]);
  neon.add(ring, partMatrix(1, edge.offset, edge.rotation, _matrix));
}
