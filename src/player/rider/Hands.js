import { createSpriteHands } from './hands/SpriteHands.js';

export { gripAnchorFrame, SIDE_LEFT, SIDE_RIGHT } from './hands/anchors.js';

/**
 * Hands - the one door between the rig and whatever supplies its hands.
 *
 * Rider knows three things and no more: it calls createHands with an anchor,
 * adds the group it gets back, and drives update and dispose. It never learns
 * what the hands are made of. That is the whole point of this file, and it is
 * what made replacing them cheap when they had to be replaced.
 *
 * Three implementations have been behind this door: primitives, a rigged GLB
 * posed by our own IK, and a single lofted fist. None of them read as a hand,
 * and the fourth - two camera facing planes carrying a drawn image - is the one
 * that does. The seam is why swapping them cost nothing outside this file each
 * time, and it is why it stays.
 *
 * The contract a hand set must satisfy:
 *
 *   group    a THREE.Group, added to the rig ONCE and never replaced. An
 *            implementation that loads asynchronously returns an empty group
 *            immediately and fills it in when the load resolves, so nothing
 *            upstream has to wait or re-parent.
 *   meshes   the meshes inside it, for tooling that measures the rig.
 *   update   called every frame with (dt, state). The sprites turn themselves
 *            back to face the camera here.
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
 * @param {object} anchor config.player.rider.anchors.rightGrip
 * @param {{steering: import('three').Group,
 *          framing: import('../../core/Framing.js').Framing}} rig
 * @returns {HandSet}
 */
export function createHands(anchor, rig) {
  return createSpriteHands(anchor, rig);
}
