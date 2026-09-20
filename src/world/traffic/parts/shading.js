import * as THREE from 'three';

/**
 * shading - what turns a traffic silhouette into a solid object.
 *
 * ================= WHY A VEHICLE NEEDS THIS =================
 *
 * Traffic is MeshBasicMaterial. There is not one light in the scene, so a
 * body painted a single colour has a correct outline and no interior: the
 * exact failure world/scenery/shading.js was written for, where a set of
 * boulders came back from a lit road as "flat orange polygons, unidentifiable
 * as anything". A car is worse than a boulder here, because a car's read
 * depends entirely on where its planes turn - the break between a roof and a
 * rear screen IS the shape, and without shading the two are one flat area
 * with a line nobody can see.
 *
 * ================= WHY IT IS A SCALAR AND NOT A COLOUR =================
 *
 * The scenery version bakes a colour. This one bakes BRIGHTNESS, because a
 * vehicle body already carries its paint per instance through `instanceColor`
 * and three multiplies the two. Baking a colour would throw the paint away
 * and make every car in the fleet the same; baking a scalar shades whatever
 * colour that vehicle happens to be, including the theme's own override.
 *
 * It MULTIPLIES into whatever colour a part already has, so a part painted
 * dark - a wheel, a window band - comes out dark AND shaded, and a part that
 * set no colour at all starts from white and comes out pure shade.
 *
 * Non-indexed geometry is a requirement, not a detail: a face can only hold
 * one colour if it owns its three vertices, and on indexed geometry this
 * smears the facets into a gradient. ./profile.js already returns non-indexed
 * geometry; a box has to be converted, which is what `faceted` is for.
 */

// High, a little to the left, and BEHIND the vehicle - which is to say in
// front of the rider, shining back at the traffic.
//
// The direction is not a taste choice. +z is a vehicle's REAR, and the rear
// is the face the rider looks at for essentially the whole game. Pointing the
// light forward, as the first version did by copying the scenery light, put
// the deepest shade on exactly that face: photographed, a car eight metres
// ahead was a black shape with a boot lid, a bumper and a plate recess on it
// that could not be told apart. Turning it round costs nothing and lights the
// one face that has to read.
//
// Fixed in the vehicle's own space, which is sound for the same reason it is
// sound for scenery: traffic is only ever turned about Y, by the road's
// heading.
const LIGHT = new THREE.Vector3(-0.34, 0.80, 0.50).normalize();

/**
 * Gives every triangle its own three vertices, so it can hold its own colour.
 * @param {THREE.BufferGeometry} geometry
 * @returns {THREE.BufferGeometry} non-indexed
 */
export function faceted(geometry) {
  return geometry.index ? geometry.toNonIndexed() : geometry;
}

/**
 * Bakes a fixed light per face into the vertex colours, multiplying into
 * whatever is already there.
 *
 * @param {THREE.BufferGeometry} geometry non-indexed; call `faceted` first
 * @param {number} ambient what a face turned fully away still gets, 0..1
 * @returns {THREE.BufferGeometry} the same geometry
 */
export function shadeFaces(geometry, ambient) {
  const position = geometry.attributes.position;
  if (geometry.index) {
    throw new Error('shadeFaces wants non-indexed geometry; call faceted() first');
  }
  const existing = geometry.attributes.color;
  const colors = new Float32Array(position.count * 3);

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const edge = new THREE.Vector3();
  const other = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i);
    b.fromBufferAttribute(position, i + 1);
    c.fromBufferAttribute(position, i + 2);
    edge.subVectors(b, a);
    other.subVectors(c, a);
    normal.crossVectors(edge, other);
    // A degenerate face has no direction to be lit from. It gets the ambient
    // rather than a NaN, which would otherwise travel into the colour buffer
    // and take the whole merged body with it - see utils/assertGeometry.js on
    // why a NaN that renders as nothing is the expensive kind.
    const length = normal.length();
    const lambert = length > 1e-8 ? normal.divideScalar(length).dot(LIGHT) * 0.5 + 0.5 : 0.5;
    const shade = ambient + (1 - ambient) * lambert;

    for (let v = 0; v < 3; v++) {
      const at = (i + v) * 3;
      if (existing) {
        colors[at] = existing.getX(i + v) * shade;
        colors[at + 1] = existing.getY(i + v) * shade;
        colors[at + 2] = existing.getZ(i + v) * shade;
      } else {
        colors[at] = shade;
        colors[at + 1] = shade;
        colors[at + 2] = shade;
      }
    }
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/**
 * Faceted and shaded in one call, which is what almost every caller wants.
 * @param {THREE.BufferGeometry} geometry
 * @param {number} ambient
 * @returns {THREE.BufferGeometry}
 */
export function solid(geometry, ambient) {
  return shadeFaces(faceted(geometry), ambient);
}
