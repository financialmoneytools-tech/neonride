import { config } from '../../config.js';
import { createPrimitiveHands } from './hands/PrimitiveHands.js';

export { gripAnchorFrame, gripLength, SIDE_LEFT, SIDE_RIGHT } from './hands/anchors.js';

/**
 * Hands - the one door between the rig and whatever supplies its hands.
 *
 * Rider knows three things and no more: it calls createHands with an anchor,
 * adds the group it gets back, and drives update and dispose. It never learns
 * what the hands are made of. That is the whole point of this file: the
 * primitive hands can be replaced by a rigged model without a single line
 * changing anywhere else in the cockpit.
 *
 * The contract a hand set must satisfy:
 *
 *   group    a THREE.Group, added to the rig ONCE and never replaced. An
 *            implementation that loads asynchronously returns an empty group
 *            immediately and fills it in when the load resolves, so nothing
 *            upstream has to wait or re-parent.
 *   meshes   the meshes inside it, for tooling that measures the rig.
 *   update   called every frame with (dt, state). The primitive hands ignore
 *            it; a rigged model will pose fingers and wrists from state.steer,
 *            state.speed and the brake input here.
 *   dispose  releases everything the set created. Whatever a set allocates, it
 *            frees; Rider never reaches inside.
 *
 * Alignment is the anchor's job, not the hand set's - see hands/anchors.js.
 *
 * @typedef {object} HandSet
 * @property {import('three').Group} group
 * @property {Array<import('three').Mesh>} meshes
 * @property {(dt: number, state: object) => void} update
 * @property {() => void} dispose
 */

/**
 * Builds the hand set named by config.player.rider.hand.source.
 * @param {object} anchor config.player.rider.anchors.rightGrip
 * @returns {HandSet}
 */
export function createHands(anchor) {
  const source = config.player.rider.hand.source;

  switch (source) {
    case 'primitive':
      return createPrimitiveHands(anchor);
    default:
      // Fall back rather than throw: a bad source value should cost the rider
      // its good looks, not the whole ride.
      console.warn('[rider] unknown hand source "' + source + '", using primitive');
      return createPrimitiveHands(anchor);
  }
}
