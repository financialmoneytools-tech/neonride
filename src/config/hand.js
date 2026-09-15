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
    url: {
      right: 'sprites/glove-right.png',
      left: 'sprites/glove-left.png',
      // The right hand with two fingers off the grip and over the lever. Keyed
      // as a GROUP with the neutral frame so the two share one crop and one
      // size; cropped separately they would come out different shapes and the
      // hand would jump sideways the instant the brake came on.
      rightBrake: 'sprites/glove-right-brake.png',
    },

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
      // Pulled further inboard than the left. The right drawing reaches closer
      // to the edge of the frame, so more of it was being clipped away at 16:9
      // than at 9:16 - that hand measured 4.4 per cent of a wide frame against
      // 5.7 of a tall one, where the left sat at 5.1 in both. Moving it in
      // recovers the difference without making the hand a different size.
      right: [-0.034, 0.012, 0.012],
      left: [-0.020, 0.012, 0.012],
    },

    // 0 is a pure billboard, 1 is welded to the bar. A hand on a bar does turn
    // with it, just not as much as the bar does, because the wrist gives.
    followSteer: 0.45,

    // Braking swaps the right hand for the frame with its fingers on the
    // lever. A cut, not a blend: at the size the hand occupies a cross fade
    // costs a second draw and a sorting problem to buy something nobody can see.
    // The two thresholds are hysteresis - one value would make the hand flicker
    // for as long as the input sat on it.
    brake: { on: 0.30, off: 0.16 },

    // Throttle needs no drawn frame. Opening it rolls the grip and the wrist
    // rolls with it, and the sprite is a plane in 3D, so it can turn about the
    // REAL grip axis rather than being faked in 2D. What that costs is
    // foreshortening: a plane rotated about an axis lying in its own surface
    // gets shorter rather than turning, which at this angle is 4 per cent and
    // is the right answer anyway - past about 25 degrees it would start to read
    // as squashing, which is why roll stops well short of it.
    throttle: {
      roll: 0.30, // radians at full throttle
      offset: [0, -0.009, 0.011], // the wrist drops and comes back with it
      tau: 0.10, // seconds of smoothing, so a stab of throttle is not a snap
    },

    // Drawn after the cockpit, so the transparent pass sorts against opaque
    // geometry that is already in the buffer.
    renderOrder: 10,
  },
};
