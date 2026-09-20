import * as THREE from 'three';

/**
 * profile - a vehicle's SIDE VIEW, extruded across its width.
 *
 * ================= WHY THIS IS THE WHOLE PIECE =================
 *
 * Every vehicle in this game was a box with a smaller box on top. That reads
 * as a car at two hundred metres and as a crate at ten, and the ten metre
 * view is the one the rider spends the run in. What a car actually has is a
 * PROFILE: a nose, a raked windscreen, a roof, a rear screen falling to a
 * boot lid, a tail. Those are the lines that say "car" and not one of them
 * survives being approximated by a cuboid.
 *
 * A profile is cheap. Ten points is 40 triangles - two walls fanned from the
 * centroid, plus a rim quad per edge - which is less than the box-plus-cabin
 * it replaces once that had a taper applied to it, and it merges into the
 * same body geometry, so it costs no draw call and no material.
 *
 * ================= THE THIRD NUMBER =================
 *
 * A point is `[z, y]` or `[z, y, widthScale]`. The third number scales the
 * half width AT THAT POINT, which is what turns a prism into a vehicle: a
 * car's greenhouse is narrower than its sills, a bus's roof is narrower than
 * its waist, a motorcycle tank is narrower than its rider. Without it every
 * shape is a slab with a fancy outline, which is the same failure one axis
 * along.
 *
 * ================= ORIENTATION =================
 *
 * `z` runs along the vehicle and +z is its REAR - that is the convention the
 * whole traffic system already uses, because a body's local +z faces the
 * rider. `y` is up, measured from the body's own origin. The winding is
 * sorted out from the polygon's signed area rather than being a rule the
 * caller has to remember, so a profile can be written in whichever direction
 * reads naturally and still come out facing the right way.
 *
 * The result is NON-INDEXED, deliberately: ./shading.js bakes a fixed light
 * per face into the vertex colours, and a face can only hold one colour if it
 * owns its three vertices. On indexed geometry the shading smears and the
 * faceting - which is the entire point - is lost.
 */

/**
 * Signed area of the profile in the z/y plane. Negative is clockwise, which
 * is the winding that puts the right hand wall's faces outward.
 * @param {number[][]} points
 * @returns {number}
 */
function signedArea(points) {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    total += a[0] * b[1] - b[0] * a[1];
  }
  return total * 0.5;
}

/**
 * Extrudes a side profile across the vehicle's width.
 *
 * @param {number[][]} points `[z, y]` or `[z, y, widthScale]`, traced around
 *   the side view in either direction. At least three.
 * @param {number} halfWidth the widest half width, which `widthScale` scales
 * @returns {THREE.BufferGeometry} non-indexed, position and normal only
 */
export function extrudeProfile(points, halfWidth) {
  if (!Array.isArray(points) || points.length < 3) {
    throw new Error('extrudeProfile wants at least three [z, y] points');
  }
  for (const point of points) {
    if (!Array.isArray(point) || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
      throw new Error('extrudeProfile point is not a finite [z, y]: ' + JSON.stringify(point));
    }
  }

  // CLOCKWISE IN z/y, always. A clockwise polygon's centroid fan comes out
  // facing +x, which is the right hand wall's outward direction; the left
  // wall is then the same triangles reversed. Deriving it here rather than
  // demanding it of the caller is what stops a profile written back to front
  // from rendering inside out, which is invisible on a MeshBasicMaterial with
  // backface culling on - the vehicle simply has no right hand side.
  const loop = signedArea(points) > 0 ? points.slice().reverse() : points.slice();
  const n = loop.length;

  const half = (point) => halfWidth * (point.length > 2 ? point[2] : 1);

  // The fan origin. A vehicle profile is star shaped about its centroid - every
  // edge is visible from the middle of the car - so a fan is sound and costs
  // one vertex over a triangulation that would need ear clipping.
  let cz = 0;
  let cy = 0;
  let cw = 0;
  for (const point of loop) {
    cz += point[0];
    cy += point[1];
    cw += half(point);
  }
  cz /= n;
  cy /= n;
  cw /= n;

  // Two walls fanned from the centroid, plus two triangles per rim edge.
  const triangles = n * 4;
  const position = new Float32Array(triangles * 9);
  let at = 0;
  const put = (x, y, z) => {
    position[at++] = x;
    position[at++] = y;
    position[at++] = z;
  };

  for (let i = 0; i < n; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % n];
    const aw = half(a);
    const bw = half(b);

    // Right wall, outward +x.
    put(cw, cy, cz);
    put(aw, a[1], a[0]);
    put(bw, b[1], b[0]);

    // Left wall, the same triangle mirrored and reversed so it faces -x.
    put(-cw, cy, cz);
    put(-bw, b[1], b[0]);
    put(-aw, a[1], a[0]);

    // The rim between them, outward along the edge's own normal.
    put(aw, a[1], a[0]);
    put(bw, b[1], b[0]);
    put(-bw, b[1], b[0]);

    put(aw, a[1], a[0]);
    put(-bw, b[1], b[0]);
    put(-aw, a[1], a[0]);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.computeVertexNormals();
  return geometry;
}
