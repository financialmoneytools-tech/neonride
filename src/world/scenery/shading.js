import * as THREE from 'three';
import { paintVertices } from '../../utils/geometry.js';

/**
 * shading - how a prop gets its colour, and its form, before it is ever drawn.
 *
 * Scenery is one MeshBasicMaterial per kind and not one light in the scene, so
 * everything that makes a shape read as a solid object has to be baked into
 * its vertex colours here. Three ways, in order of how much they buy:
 *
 *   painted        one flat colour. A silhouette, and enough for anything that
 *                  is meant to be one - a lamp post, a gantry leg.
 *   paintByHeight  two colours split at a height. Snow lying on a tree.
 *   shadeFaces     a fixed light, per face. Volume, for nothing.
 *
 * Split out of props.js, which is now only the shapes.
 */

/** @param {THREE.BufferGeometry} geometry @param {number} color */
export function painted(geometry, color) {
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
export function paintByHeight(geometry, line, top, bottom) {
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
 * Shades a geometry FACE BY FACE from a fixed light, straight into its vertex
 * colours.
 *
 * ================= WHY A FLAT MATERIAL NEEDS THIS =================
 *
 * Scenery is MeshBasicMaterial - one draw call for every prop of a kind, and
 * not one light in the scene. A shape painted a single colour under a flat
 * material is a SILHOUETTE: correct outline, no interior, no volume. On a dark
 * road nobody noticed, because a black silhouette against a black sky is a
 * rock-shaped hole and the eye accepts it. Give the road a lit horizon and the
 * same shape becomes, in the words of the report, "flat orange polygons in
 * mid-air, unidentifiable as anything".
 *
 * Baking the light in costs nothing at all - no material change, no second
 * draw call, no triangle - and it is the difference between a boulder and a
 * sticker. THE LIGHT IS FIXED IN THE PROP'S OWN SPACE, which is sound here
 * because scenery is only ever turned about Y, by the road's heading, and that
 * swings through about ten degrees over a whole run.
 *
 * Non-indexed geometry is a requirement rather than a detail: three's
 * polyhedra give every triangle its own three vertices, so a face can hold one
 * colour and the result is faceted. On indexed geometry this would smear.
 * @param {THREE.BufferGeometry} geometry non-indexed
 * @param {number} color the unlit colour
 * @param {number} ambient how much light a face turned fully away still gets
 */
export function shadeFaces(geometry, color, ambient) {
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const base = new THREE.Color(color);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const edge = new THREE.Vector3();
  const other = new THREE.Vector3();
  const normal = new THREE.Vector3();
  // High and a little to one side, so a rock has a lit cap, a bright flank
  // and a face in shadow - which is the whole read of a boulder.
  const light = new THREE.Vector3(-0.42, 0.84, 0.34).normalize();

  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i);
    b.fromBufferAttribute(position, i + 1);
    c.fromBufferAttribute(position, i + 2);
    edge.subVectors(b, a);
    other.subVectors(c, a);
    normal.crossVectors(edge, other).normalize();

    // Half Lambert: the wrapped term keeps the dark side readable instead of
    // clamping a third of the faces to the same black.
    const lambert = normal.dot(light) * 0.5 + 0.5;
    const shade = ambient + (1 - ambient) * lambert;
    for (let v = 0; v < 3; v++) {
      const at = (i + v) * 3;
      colors[at] = base.r * shade;
      colors[at + 1] = base.g * shade;
      colors[at + 2] = base.b * shade;
    }
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}
