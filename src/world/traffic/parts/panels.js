import * as THREE from 'three';
import { paintVertices } from '../../../utils/geometry.js';
import { solid } from './shading.js';

/**
 * panels - the flat hardware bolted to a body: roof rails, rear door seams
 * and a rear bumper.
 *
 * None of this changes a silhouette and all of it changes what a vehicle IS.
 * A tall box with a seam down the back and rails along the roof is a van; the
 * same box without them is a crate. They are the cheapest detail in the
 * project - a seam is one flattened cuboid - and they are the difference
 * between the van and the jeep reading as two vehicles rather than as one
 * shape at two sizes.
 *
 * Everything here goes in the BODY geometry with a dark vertex colour, so it
 * costs no draw call and comes out dark whatever paint the vehicle drew.
 * ../truckParts.js does the same job for the two lorries; that one is kept
 * separate because a lorry's hardware is a different set - mud flaps, a
 * five axle bogie - and lumping them would make one file that serves neither.
 */

/** @param {THREE.BufferGeometry} geometry @param {number} color */
function painted(geometry, color) {
  paintVertices(geometry, color);
  return geometry;
}

/**
 * Two rails down the roof.
 * @param {import('../../../utils/geometry.js').GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix
 * @param {object} rails `{ out, height, thickness, from, to, color }`
 * @param {number} roofY local y of the roof the rails sit on
 */
export function addRoofRails(builder, matrix, rails, roofY) {
  const length = rails.to - rails.from;
  for (const sign of [-1, 1]) {
    builder.add(
      solid(painted(
        new THREE.BoxGeometry(rails.thickness, rails.height, length), rails.color), 0.36),
      matrix.makeTranslation(
        sign * rails.out,
        roofY + rails.height * 0.5,
        rails.from + length * 0.5,
      ),
    );
  }
}

/**
 * A vertical split down the rear face, with hinge bars down both edges.
 *
 * Proud of the face rather than cut into it: a recess needs geometry the
 * silhouette cannot spare, and at night a seam reads as a line either way.
 * That is the same call ../truckParts.js made and it held up.
 * @param {import('../../../utils/geometry.js').GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix
 * @param {object} doors `{ seam, depth, top, bottom, hinges, inset, hingeWidth, color }`
 * @param {number} halfWidth
 * @param {number} rearZ local z of the face
 */
export function addRearDoors(builder, matrix, doors, halfWidth, rearZ) {
  const height = doors.top - doors.bottom;
  const middle = doors.bottom + height * 0.5;
  const z = rearZ + doors.depth * 0.5;
  const bar = (x, y, w, h) => builder.add(
    solid(painted(new THREE.BoxGeometry(w, h, doors.depth), doors.color), 0.4),
    matrix.makeTranslation(x, y, z),
  );

  bar(0, middle, doors.seam, height);
  const hingeX = halfWidth - doors.inset;
  for (let i = 0; i < doors.hinges; i++) {
    const t = (i + 0.5) / doors.hinges;
    const y = doors.top - height * (0.08 + t * 0.84);
    for (const sign of [-1, 1]) bar(sign * hingeX, y, doors.hingeWidth, doors.seam);
  }
}

/**
 * A rear bumper: one bar across the tail.
 * @param {import('../../../utils/geometry.js').GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix
 * @param {object} bumper `{ height, depth, y, widthScale, color }`
 * @param {number} halfWidth
 * @param {number} rearZ
 */
export function addRearBumper(builder, matrix, bumper, halfWidth, rearZ) {
  builder.add(
    solid(painted(
      new THREE.BoxGeometry(halfWidth * 2 * bumper.widthScale, bumper.height, bumper.depth),
      bumper.color), 0.36),
    matrix.makeTranslation(0, bumper.y, rearZ + bumper.depth * 0.5),
  );
}
