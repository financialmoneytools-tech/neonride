/**
 * NEON RIDE - the gloved hands.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.rider.hand.
 *
 * The hands are two camera facing planes, one drawn image each - see
 * player/rider/hands/SpriteHands.js for why, and ASSETS.md for where the images
 * came from. Everything that used to be in this file described a hand built out
 * of geometry, over six attempts, and none of it survived.
 *
 * Each image carries the grip, the bar end, the lever and the switch block
 * along with the hand, which is why the 3D versions of those are no longer
 * built: the join between a 2D hand and a 3D bar is what would give the trick
 * away, and there is no join if the bar ends inside the picture.
 */

export const hand = {
  sprite: {
    // One image per hand. They were one image mirrored to begin with, which is
    // geometrically what a left hand is, but these two drawings are not each
    // other's reflection - each is posed on its own bar, with its own lever and
    // its own switch block - so each gets its own texture and its own placement.
    url: { right: 'sprites/glove-right.png', left: 'sprites/glove-left.png' },

    // Width of the plane in rider units, before the framing profile's handScale.
    // Each image carries its own aspect, read off the texture once it loads, so
    // the artwork is never stretched and the two may be different shapes.
    // The left drawing carries more bar than the right does, so at the same
    // plane width its hand would come out smaller. These are set so the two
    // HANDS match on screen, not the two images.
    width: { right: 0.271, left: 0.294 },

    // From the point on the grip the anchor names, in the anchor's frame:
    // [along the grip, up, back at the rider]. A hand is not in the middle of
    // its own picture - the lever and the switch block take up part of it - so
    // this is what slides the DRAWN hand onto the grip rather than the plane's
    // centre. Per side, because the two drawings are framed differently.
    offset: {
      right: [-0.020, 0.012, 0.012],
      left: [-0.020, 0.012, 0.012],
    },

    // 0 is a pure billboard, 1 is welded to the bar. A hand on a bar does turn
    // with it, just not as much as the bar does, because the wrist gives.
    followSteer: 0.45,

    // Drawn after the cockpit, so the transparent pass sorts against opaque
    // geometry that is already in the buffer.
    renderOrder: 10,
  },
};
