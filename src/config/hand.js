/**
 * NEON RIDE - the gloved hands.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.rider.hand.
 *
 * The hands are two camera facing planes carrying one drawn image - see
 * player/rider/hands/SpriteHands.js for why, and ASSETS.md for where the image
 * came from. Everything that used to be here described a hand built out of
 * geometry, over six passes, and none of it survived.
 *
 * The image is authored for the RIGHT hand and the left is the same texture
 * mirrored. It carries the grip, the bar end, the brake lever and the switch
 * block with it, which is why the 3D versions of those are no longer built.
 */

export const hand = {
  sprite: {
    url: 'sprites/glove-right.png',

    // Width of the plane in rider units, before the framing profile's handScale,
    // and the image's own aspect. Height comes from the two, so the artwork is
    // never stretched.
    width: 0.347,
    aspect: 1024 / 998,

    // From the point on the grip the anchor names, in the anchor's frame:
    // [along the grip, up, back at the rider]. The hand is not in the middle of
    // its own picture - the lever and the switch block take up the inboard half
    // - so this is what slides the drawn hand onto the drawn grip's position
    // rather than the plane's centre.
    offset: [-0.020, 0.012, 0.012],

    // 0 is a pure billboard, 1 is welded to the bar. A hand on a bar does turn
    // with it, just not as much as the bar does, because the wrist gives.
    followSteer: 0.45,

    // Drawn after the cockpit, so the transparent pass sorts against opaque
    // geometry that is already in the buffer.
    renderOrder: 10,
  },
};
