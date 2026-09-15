import { createGlovedFist } from './hands/GlovedFist.js';

export { gripAnchorFrame, gripLength, SIDE_LEFT, SIDE_RIGHT } from './hands/anchors.js';

/**
 * Hands - the one door between the rig and whatever supplies its hands.
 *
 * Rider knows three things and no more: it calls createHands with an anchor,
 * adds the group it gets back, and drives update and dispose. It never learns
 * what the hands are made of. That is the whole point of this file, and it is
 * what made replacing them cheap when they had to be replaced.
 *
 * There used to be two implementations behind here and a config switch to
 * choose between them: these, and a rigged GLB posed onto the grip by our own
 * IK. The model is gone. It was a 1,200 triangle first person SHOOTER arms
 * pack, authored around a rifle, and closing its fingers on a 26 mm tube needed
 * per finger IK against a cylinder plus edge loops at the knuckles that it did
 * not have. Rendered side by side it sat beside the bar gripping nothing, which
 * was further from the reference than the primitives it was meant to replace.
 * The one thing it offered over a well shaped fist is finger separation on an
 * OPEN hand, and this hand is never open.
 *
 * The seam stays, because the next thing that wants to supply hands should not
 * have to touch Rider either.
 *
 * The contract a hand set must satisfy:
 *
 *   group    a THREE.Group, added to the rig ONCE and never replaced. An
 *            implementation that loads asynchronously returns an empty group
 *            immediately and fills it in when the load resolves, so nothing
 *            upstream has to wait or re-parent.
 *   meshes   the meshes inside it, for tooling that measures the rig.
 *   update   called every frame with (dt, state). The fist ignores it; anything
 *            that poses itself would read state.steer and the brake here.
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
 * @returns {HandSet}
 */
export function createHands(anchor) {
  return createGlovedFist(anchor);
}
