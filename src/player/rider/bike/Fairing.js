import * as THREE from 'three';
import { config } from '../../../config.js';
import { addTube, partMatrix } from '../../../utils/geometry.js';
import { sectionPath } from '../../../utils/loft/section.js';
import { loftShell } from '../../../utils/loft/shell.js';
import { loftVents } from '../../../utils/loft/vents.js';

/**
 * Fairing - the mass the cockpit was missing, with edges on it.
 *
 * Measured before it was built: with only a bar, a fork and a small tank, the
 * rig covered 6.4 per cent of a 16:9 frame and 13 per cent of its lower half.
 * Moving the camera in got that to 26 per cent of the lower half and no
 * further, because there was nothing there to fill it with. What the reference
 * shots have and this did not is bodywork - two wings sweeping out and forward
 * either side of a screen, with a nose between them carrying the cluster.
 *
 * The panels were squashed ellipsoids first. That got the mass right and the
 * SHAPE wrong, and wrong in a way that cost more than the mass was worth: an
 * ellipsoid has no edge on it anywhere, so beside the sharp silhouettes in the
 * references it read as a toy. Four things make those fairings look sculpted,
 * and all four are here now - a crease along the top of each wing, a defined
 * lower edge where the panel ends, vent openings breaking up the mass, and
 * faces flat enough between the edges to be planes.
 *
 * So each panel is lofted instead: one cross section swept through a handful of
 * stations, with the creases marked per point in config. See utils/loft/.
 *
 * MIRRORING. The old ellipsoids were mirrored by placing them at a negative x
 * with two of their euler angles negated, which is a proper rotation, not a
 * reflection - it only lands on the right answer because an ellipsoid is its
 * own mirror image. A lofted section is not, so the left panel is built from a
 * genuinely mirrored section and then placed by the same rotation. Getting this
 * wrong is not subtle: the left wing comes out right-handed, and every crease
 * on it points the wrong way.
 */

const _matrix = new THREE.Matrix4();
const _point = new THREE.Vector3();

/** The section, reflected. Point order is left alone; loft.js reads the winding. */
function mirrorSection(section) {
  const out = new Array(section.length);
  for (let i = 0; i < section.length; i++) {
    const p = section[i];
    out[i] = p.length > 2 ? [-p[0], p[1], p[2]] : [-p[0], p[1]];
  }
  return out;
}

/**
 * Stations in absolute units, optionally reflected with the section.
 * The config authors them normalized, so radii still mean what they meant when
 * these panels were ellipsoids and the numbers carry across unchanged.
 */
function stationsFor(cfg, sign) {
  const [rx, ry, rz] = cfg.radii;
  const out = new Array(cfg.stations.length);

  for (let s = 0; s < cfg.stations.length; s++) {
    const station = cfg.stations[s];
    out[s] = {
      z: station.z * rz,
      offset: [station.offset[0] * rx * sign, station.offset[1] * ry],
      scale: [station.scale[0] * rx, station.scale[1] * ry],
      roll: (station.roll || 0) * sign,
    };
  }
  return out;
}

/**
 * @param {Object<string, import('../../../utils/geometry.js').GeometryBuilder>} builders
 */
export function buildFairing(builders) {
  const cfg = config.player.rider.machine;

  buildPanels(cfg.fairing, builders);
  buildScreen(cfg.screen, builders.mirror, builders.neonLeft);
}

/** A wing either side, and the nose between them. That is the whole fairing. */
function buildPanels(cfg, builders) {
  // A part on the centreline is built once; everything else is built twice,
  // once per side, from a section reflected for the left.
  panel(cfg.wing, builders, 1);
  panel(cfg.wing, builders, -1);
  panel(cfg.nose, builders, 1);
}

/** One lofted panel, its vent pockets, and the trim strip on its crease. */
function panel(cfg, builders, sign) {
  const mirrored = sign < 0;
  const section = mirrored ? mirrorSection(cfg.section) : cfg.section;
  const stations = stationsFor(cfg, sign);
  const vents = cfg.vents || [];

  // partMatrix mirrors the PLACEMENT; the section above mirrors the shape. Both
  // are needed, and the result is a proper rotation either way, so the winding
  // survives and no part needs a two sided material.
  const place = partMatrix(sign, cfg.offset, cfg.rotation, _matrix);

  builders.paint.add(loftShell(section, stations, vents), place);

  const pockets = loftVents(section, stations, vents);
  if (pockets) builders.vent.add(pockets, partMatrix(sign, cfg.offset, cfg.rotation, _matrix));

  if (cfg.trim) buildTrim(builders.neonLeft, cfg, section, stations, sign);
}

/**
 * A lit line laid along one crease of a panel.
 *
 * The path comes out of the loft rather than out of config, so it is on the
 * edge by construction. The tube is centred on the crease and bulges either
 * side of it, which is what piping on a real panel does.
 */
function buildTrim(neon, cfg, section, stations, sign) {
  const trim = cfg.trim;
  const path = sectionPath(section, stations, trim.crease);
  const place = partMatrix(sign, cfg.offset, cfg.rotation, _matrix);

  for (let i = 0; i < path.length; i++) {
    path[i] = _point.fromArray(path[i]).applyMatrix4(place).toArray();
  }

  for (let i = 0; i < path.length - 1; i++) {
    addTube(neon, path[i], path[i + 1], trim.radius, trim.radialSegments);
    // A sphere at every joint, so the strip turns corners instead of showing
    // the open end of one cylinder inside the next.
    if (i > 0) {
      neon.add(
        new THREE.SphereGeometry(trim.radius, trim.radialSegments, 4),
        partMatrix(1, path[i], null, _matrix),
      );
    }
  }
}

/**
 * The bubble screen: a dark panel with a lit edge.
 *
 * Still an ellipsoid, and deliberately so - this is the one part of the
 * bodywork that is genuinely a smooth curve, and putting creases in glass would
 * be as wrong as leaving them out of the panels.
 *
 * The panel is nearly black on purpose. A screen is glass, and glass at night
 * is a rim of light around something you see straight through - painting the
 * whole thing bright would put a slab across the top of every shot.
 */
function buildScreen(cfg, dark, neon) {
  const shell = new THREE.SphereGeometry(1, cfg.segments[0], cfg.segments[1]);
  shell.scale(cfg.radii[0], cfg.radii[1], cfg.radii[2]);
  dark.add(shell, partMatrix(1, cfg.offset, cfg.rotation, _matrix));

  // Built as a unit circle and scaled to the screen's own radii. A torus has
  // one radius and the screen is an ellipse, so a fixed ring either cuts
  // through the panel or floats outside it - and the taller the screen, the
  // further out it floats.
  const edge = cfg.edge;
  const ring = new THREE.TorusGeometry(1, edge.tube, edge.segments[1], edge.segments[0]);
  ring.scale(cfg.radii[0], cfg.radii[1], 1);
  neon.add(ring, partMatrix(1, edge.offset, edge.rotation, _matrix));
}
