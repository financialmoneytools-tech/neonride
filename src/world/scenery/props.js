import * as THREE from 'three';
import { GeometryBuilder, paintVertices } from '../../utils/geometry.js';

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
 * A conifer: trunk, two stacked cones, and snow on the upper one.
 *
 * The snow is a third cone rather than a paler tint on the second, because a
 * tint reads as a lighter tree and a cap reads as snow. It is also the only
 * part of an Aurora Pass roadside that catches any light at all.
 * @param {object} cfg
 */
export function buildPine(cfg) {
  const builder = new GeometryBuilder();
  const sides = cfg.sides;

  builder.add(
    painted(new THREE.CylinderGeometry(cfg.trunkRadius, cfg.trunkRadius * 1.3, cfg.trunkHeight, sides), cfg.trunkColor),
    _matrix.makeTranslation(0, cfg.trunkHeight * 0.5, 0),
  );

  const skirt = cfg.height * 0.62;
  builder.add(
    painted(new THREE.ConeGeometry(cfg.radius, skirt, sides), cfg.needleColor),
    _matrix.makeTranslation(0, cfg.trunkHeight + skirt * 0.5, 0),
  );

  const crown = cfg.height * 0.52;
  builder.add(
    painted(new THREE.ConeGeometry(cfg.radius * 0.66, crown, sides), cfg.needleColor),
    _matrix.makeTranslation(0, cfg.trunkHeight + skirt * 0.78 + crown * 0.5, 0),
  );

  const cap = crown * cfg.snow;
  if (cap > 0.01) {
    builder.add(
      painted(new THREE.ConeGeometry(cfg.radius * 0.66 * cfg.snow, cap, sides), cfg.snowColor),
      _matrix.makeTranslation(0, cfg.trunkHeight + skirt * 0.78 + crown - cap * 0.5, 0),
    );
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
  lampLeft: (cfg) => buildLamp(cfg, 1),
  lampRight: (cfg) => buildLamp(cfg, -1),
};
