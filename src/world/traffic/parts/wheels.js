import * as THREE from 'three';
import { paintVertices } from '../../../utils/geometry.js';
import { solid } from './shading.js';

/**
 * wheels - road wheels and the arches over them.
 *
 * "Wheels visible under the body" is in the spec for the car and it is the
 * single cheapest thing that stops a vehicle reading as a crate: a box
 * touching the road is a box, and the same box lifted on four dark discs is a
 * vehicle. The arch matters nearly as much and costs a sixth of the
 * triangles - it is the dark band on the flank that tells the eye the wheel
 * belongs to the body rather than being parked under it.
 *
 * Eight sides. At the distance traffic is read from, a wheel is a dark
 * ellipse; sixteen is twice the triangles for a rounder edge nobody resolves.
 * The truck hardware in ../truckParts.js settled on eight for the same reason
 * and this stays consistent with it.
 *
 * All of it lands in the BODY geometry, painted dark through vertex colours,
 * so a wheel costs no draw call and comes out dark whatever paint the vehicle
 * drew from the palette.
 */

/**
 * @typedef {object} WheelSpec
 * @property {number} radius
 * @property {number} width
 * @property {number} halfWidth half the body width; wheels sit inside it
 * @property {number} inset how far in from the flank
 * @property {number} ground local y of the road under this body
 * @property {number[]} axles local z of each axle
 * @property {number} color
 * @property {number} [sides]
 * @property {object} [arch] `{ height, spread, out, thickness, color }`
 */

/**
 * Adds wheels, and an arch over each one if the spec asks for it.
 * @param {import('../../../utils/geometry.js').GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix scratch, reused by the caller
 * @param {WheelSpec} spec
 */
export function addWheels(builder, matrix, spec) {
  const sides = spec.sides || 8;
  const x = spec.halfWidth - spec.inset;
  const y = spec.ground + spec.radius;

  for (const z of spec.axles) {
    for (const sign of [-1, 1]) {
      // A cylinder is built along +Y, so it turns a quarter turn about Z to
      // lie across the vehicle.
      const wheel = new THREE.CylinderGeometry(spec.radius, spec.radius, spec.width, sides);
      wheel.rotateZ(Math.PI / 2);
      paintVertices(wheel, spec.color);
      // Shaded like everything else: an unshaded disc is a black hole in the
      // flank, and the point of an arch is to have something to be darker
      // than.
      builder.add(solid(wheel, 0.34), matrix.makeTranslation(sign * x, y, z));

      const arch = spec.arch;
      if (!arch) continue;
      const band = new THREE.BoxGeometry(
        arch.thickness,
        arch.height,
        spec.radius * 2 + arch.spread,
      );
      paintVertices(band, arch.color);
      builder.add(
        solid(band, 0.3),
        matrix.makeTranslation(sign * (spec.halfWidth + arch.out), y + spec.radius * 0.35, z),
      );
    }
  }
}
