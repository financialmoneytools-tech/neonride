import * as THREE from 'three';
import { paintVertices } from '../../../utils/geometry.js';
import { solid } from './shading.js';

/**
 * blocks - a handful of placed, tilted boxes, for the parts of a vehicle that
 * are not a profile.
 *
 * ================= WHAT THIS IS FOR =================
 *
 * The rider on the motorcycle. Everything else in the fleet is a volume with
 * a side view, and a rider is not: a torso leaning over the tank, a head, two
 * arms reaching down to the bars and a knee either side of the engine. Those
 * are seven small boxes at seven different angles, and no amount of profile
 * describes them.
 *
 * It matters more than it sounds. A motorcycle without a rider is a 2 m by
 * 0.5 m sliver, and the spec is blunt about the result: not recognisable as a
 * motorcycle at all. The RIDER is what reads at distance - a bike is mostly a
 * person, seen from behind - and the tilt is what stops the person being a
 * fence post.
 *
 * A block is `{ x, y, z, size: [w, h, d], tilt, color }`. `tilt` is a lean
 * about X in radians, so a positive tilt puts the top of the box forward,
 * over the tank, which is what a rider does.
 *
 * All of it lands in the BODY geometry with a dark vertex colour, so it costs
 * no draw call and comes out dark whatever paint the bike drew.
 */

const _tilt = new THREE.Matrix4();

/**
 * @param {import('../../../utils/geometry.js').GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix scratch, reused by the caller
 * @param {object[]} blocks
 */
export function addBlocks(builder, matrix, blocks) {
  for (const block of blocks) {
    const [w, h, d] = block.size;
    const geometry = new THREE.BoxGeometry(w, h, d);
    paintVertices(geometry, block.color);
    // Tilt about the box's own centre FIRST, then place it. The other order
    // swings the box around the vehicle's origin instead of leaning it, which
    // on a rider puts the head somewhere behind the number plate.
    matrix.makeTranslation(block.x, block.y, block.z);
    if (block.tilt) matrix.multiply(_tilt.makeRotationX(block.tilt));
    builder.add(solid(geometry, 0.3), matrix);

    // Mirrored, for anything that comes in a pair - an arm, a knee.
    if (block.mirror) {
      const twin = new THREE.BoxGeometry(w, h, d);
      paintVertices(twin, block.color);
      matrix.makeTranslation(-block.x, block.y, block.z);
      if (block.tilt) matrix.multiply(_tilt.makeRotationX(block.tilt));
      builder.add(solid(twin, 0.3), matrix);
    }
  }
}
