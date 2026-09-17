import * as THREE from 'three';
import { GeometryBuilder, paintVertices } from '../../utils/geometry.js';
import { useCell } from './signs.js';

/**
 * props - the low poly shapes that stand beside the road.
 *
 * One geometry per kind, merged from primitives and carrying its colours as
 * VERTEX COLOURS, so a whole tree - dark trunk, dark needles, snow on top - is
 * one material and one draw call for every tree in the world. Instance colour
 * is left alone here on purpose: traffic uses it for paint variety, and scenery
 * wants the opposite, a kind that reads the same everywhere so the eye files it
 * as "pines" and stops looking.
 *
 * SILHOUETTE IS THE WHOLE BUDGET. These are seen at thirty to a hundred metres,
 * usually for under a second, usually in fog. A pine reads as a pine because it
 * is a dark triangle with a pale top, not because it has needles. Every builder
 * here stays under about 120 triangles, and if a shape cannot be made to read
 * inside that it is the wrong shape for this game.
 *
 * Origin is at the BASE, on the ground, y up. Scenery.js places them by putting
 * that origin on the verge.
 */

const _matrix = new THREE.Matrix4();

/** @param {THREE.BufferGeometry} geometry @param {number} color */
function painted(geometry, color) {
  paintVertices(geometry, color);
  return geometry;
}

/**
 * Paints a geometry by height: everything above `line` gets `top`, the rest
 * gets `bottom`.
 *
 * This is how snow gets onto a tree for nothing. A cone built with two height
 * segments has a base ring, a middle ring and an apex, so painting from the
 * middle ring up puts a crisp snow line across the upper half of every tier
 * without adding one triangle. A cap built as its own geometry costs a whole
 * second cone per tier and looks worse, because it reads as a hat rather than
 * as snow lying on the branches.
 * @param {THREE.BufferGeometry} geometry
 * @param {number} line local y above which the top colour applies
 * @param {number} top
 * @param {number} bottom
 */
function paintByHeight(geometry, line, top, bottom) {
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const hot = new THREE.Color(top);
  const cold = new THREE.Color(bottom);
  for (let i = 0; i < position.count; i++) {
    const c = position.getY(i) >= line ? hot : cold;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/**
 * A conifer: a trunk and a stack of tiers, with snow lying on the top of every
 * tier rather than only on the tip.
 *
 * FOUR TIERS, NOT TWO, and snow on each. A single cone with a white point reads
 * as a dark triangle with a highlight; four stacked skirts each carrying snow
 * read as a snowy pine, because the alternating dark-pale banding is the whole
 * silhouette of one. It is the difference between the tree being in the scene
 * and the tree being the scene's subject, and it costs about 160 triangles.
 * @param {object} cfg
 */
export function buildPine(cfg) {
  const builder = new GeometryBuilder();
  const sides = cfg.sides;
  const tiers = cfg.tiers;

  builder.add(
    painted(new THREE.CylinderGeometry(cfg.trunkRadius, cfg.trunkRadius * 1.3, cfg.trunkHeight, sides), cfg.trunkColor),
    _matrix.makeTranslation(0, cfg.trunkHeight * 0.5, 0),
  );

  // Tiers shrink going up and overlap, so the skirts read as one tree rather
  // than as a pile of cones.
  let base = cfg.trunkHeight;
  for (let i = 0; i < tiers; i++) {
    const t = i / Math.max(1, tiers - 1);
    const radius = cfg.radius * (1 - t * cfg.taper);
    const height = (cfg.height / tiers) * (1 + cfg.spire * t);

    const cone = new THREE.ConeGeometry(radius, height, sides, 2);
    // The snow line sits at the middle ring, which for a cone centred on its
    // own origin is y = 0.
    paintByHeight(cone, -height * 0.5 + height * cfg.snowLine, cfg.snowColor, cfg.needleColor);

    builder.add(cone, _matrix.makeTranslation(0, base + height * 0.5, 0));
    base += height * cfg.overlap;
  }

  return builder.build('prop-pine');
}

/** A boulder: one icosahedron, squashed. Twenty triangles. */
export function buildRock(cfg) {
  const geometry = new THREE.IcosahedronGeometry(cfg.radius, 0);
  geometry.scale(1, cfg.squash, 1.15);
  geometry.translate(0, cfg.radius * cfg.squash * 0.75, 0);
  return painted(geometry, cfg.color);
}

/**
 * A motorway lamp: post, a cranked arm over the road, and a lit head.
 *
 * The head is a separate bright vertex colour in the same geometry, which is
 * what lets one draw call carry both the dark post and the thing that glows.
 * @param {object} cfg
 * @param {number} facing +1 when the arm reaches to the rider's right
 */
export function buildLamp(cfg, facing) {
  const builder = new GeometryBuilder();

  builder.add(
    painted(new THREE.BoxGeometry(cfg.postWidth, cfg.height, cfg.postWidth), cfg.postColor),
    _matrix.makeTranslation(0, cfg.height * 0.5, 0),
  );

  // The arm leans over the carriageway, which is what makes a motorway lamp
  // read as one rather than as a streetlight.
  const arm = new THREE.BoxGeometry(cfg.armLength, cfg.postWidth * 0.7, cfg.postWidth * 0.7);
  builder.add(
    painted(arm, cfg.postColor),
    _matrix.makeTranslation(facing * cfg.armLength * 0.5, cfg.height - cfg.postWidth * 0.5, 0),
  );

  builder.add(
    painted(new THREE.BoxGeometry(cfg.headLength, cfg.headHeight, cfg.headWidth), cfg.headColor),
    _matrix.makeTranslation(
      facing * cfg.armLength,
      cfg.height - cfg.postWidth * 0.5 - cfg.headHeight * 0.5,
      0,
    ),
  );

  return builder.build('prop-lamp');
}

/**
 * The light a lamp throws: a soft pool lying on the road under the head, and a
 * small halo around the head itself.
 *
 * A SEPARATE ADDITIVE GEOMETRY, because light is not a surface. The head on its
 * own was an unlit white slab hanging in the air - the post beside it is nearly
 * black, so there was nothing holding it up and nothing coming off it. These
 * two quads are what turn it into a lamp: something bright, and a patch of road
 * that is brighter because of it.
 *
 * Built in the same local space as the lamp and placed with the same instance
 * matrix, so one write moves both.
 * @param {object} cfg
 * @param {number} facing which way the arm reaches
 */
export function buildLampGlow(cfg, facing) {
  const builder = new GeometryBuilder();
  // The kind's own glow block, the same one Scenery reads to build the
  // material. One place, so the pool's colour and the halo's cannot drift.
  const pool = cfg.glow;

  // The pool, lying flat on the road under the head. Lifted a little so it
  // does not fight the road surface for the same depth.
  const ground = new THREE.PlaneGeometry(pool.size, pool.size * pool.stretch);
  ground.rotateX(-Math.PI / 2);
  builder.add(
    painted(ground, pool.color),
    _matrix.makeTranslation(facing * cfg.armLength, pool.lift, 0),
  );

  // The halo at the head. A billboard would be better and is not worth a
  // second material: at the angles this is ever seen from, a quad facing back
  // down the road reads the same.
  const halo = new THREE.PlaneGeometry(pool.haloSize, pool.haloSize);
  builder.add(
    painted(halo, pool.color),
    _matrix.makeTranslation(
      facing * cfg.armLength,
      cfg.height - cfg.postWidth * 0.5 - cfg.headHeight * 0.5,
      0,
    ),
  );

  return builder.build('prop-lamp-glow');
}

/**
 * An overhead sign gantry: two legs outside the carriageway, a beam across it,
 * and the dark plate the lit panels are mounted on.
 *
 * It spans the road rather than standing beside it, so it is the one prop
 * placed on the path centre - see the 'centre' side in world/Scenery.js. The
 * legs stand OUTSIDE the edge lines, which the builder is told rather than
 * guesses, because the carriageway's width is road/layout.js's business.
 * @param {object} cfg
 */
export function buildGantry(cfg) {
  const builder = new GeometryBuilder();
  const span = cfg.span;

  for (const sign of [-1, 1]) {
    builder.add(
      painted(new THREE.BoxGeometry(cfg.legWidth, cfg.height, cfg.legWidth), cfg.legColor),
      _matrix.makeTranslation(sign * span * 0.5, cfg.height * 0.5, 0),
    );
    // A foot, for the same reason the pylons have one: a post that meets the
    // ground at its own width reads as stuck into it rather than standing on
    // it, and at this height that is the difference between a gantry and a
    // pair of lines.
    builder.add(
      painted(new THREE.BoxGeometry(cfg.legWidth * 2.6, cfg.footHeight, cfg.legWidth * 2.6), cfg.legColor),
      _matrix.makeTranslation(sign * span * 0.5, cfg.footHeight * 0.5, 0),
    );
  }

  builder.add(
    painted(new THREE.BoxGeometry(span, cfg.beamHeight, cfg.beamDepth), cfg.legColor),
    _matrix.makeTranslation(0, cfg.height, 0),
  );

  return builder.build('prop-gantry');
}

/**
 * The lit panels under the beam, mapped into the sign atlas.
 *
 * Their own additive mesh, like a lamp's light: a sign at night is not a
 * painted board, it is a board with light coming off it, and the difference is
 * whether it survives being 80 metres away in fog.
 * @param {object} cfg
 */
export function buildGantryGlow(cfg) {
  const builder = new GeometryBuilder();
  const panel = cfg.glow.panel;
  const y = cfg.height - cfg.beamHeight * 0.5 - panel.size * 0.5;

  // Three panels across: the name in the middle, a distance and an arrow
  // either side. The cells are fixed per position rather than chosen at random
  // so that a gantry reads the same every time that stretch is rebuilt.
  const cells = panel.cells;
  for (let i = 0; i < cells.length; i++) {
    const quad = new THREE.PlaneGeometry(panel.size, panel.size);
    useCell(quad, cells[i][0], cells[i][1]);
    paintVertices(quad, panel.color);
    const at = (i - (cells.length - 1) / 2) * (panel.size + panel.gap);
    // Facing the rider: +z local is back down the road.
    builder.add(quad, _matrix.makeTranslation(at, y, cfg.beamDepth * 0.5 + 0.03));
  }

  // Deliberately flat: three coplanar billboards are what a sign is.
  return builder.build('prop-gantry-glow', { flat: true });
}

/** Glow geometry by kind name; a kind without one simply has no second mesh. */
export const GLOW_BUILDERS = {
  lampLeft: (cfg) => buildLampGlow(cfg, 1),
  lampRight: (cfg) => buildLampGlow(cfg, -1),
  gantry: (cfg) => buildGantryGlow(cfg),
};

/**
 * Every builder, by the name a theme uses.
 *
 * The lamp names say which SIDE OF THE ROAD the post stands on, and the arm
 * then reaches the other way, over the carriageway. Local +x is the rider's
 * right - see the basis world/Scenery.js builds - so a post on the left needs
 * its arm at +1 and one on the right at -1. Naming them after the arm instead
 * would put every lamp's head out over the verge.
 */
export const BUILDERS = {
  pine: (cfg) => buildPine(cfg),
  rock: (cfg) => buildRock(cfg),
  gantry: (cfg) => buildGantry(cfg),
  lampLeft: (cfg) => buildLamp(cfg, 1),
  lampRight: (cfg) => buildLamp(cfg, -1),
};
