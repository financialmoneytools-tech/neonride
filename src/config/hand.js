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
    // ONE IMAGE, MIRRORED. It was two drawings for a while, one per hand, and
    // that was the wrong call: a mirrored right arm IS an anatomically correct
    // left arm, and every detail matches by construction - the ribbed cuff, the
    // neon piping, the glove proportions, the line weight of the drawing. Two
    // separately generated images never matched, and no amount of regenerating
    // the second one was going to make it match the first.
    //
    // It is right for the hardware too. Mirrored, the brake lever lands where
    // the clutch lever belongs, the bar end goes to the upper left and the
    // switch block ends up inboard, which is exactly where all three are on a
    // real left bar.
    url: {
      glove: 'sprites/glove-right.png',
      // The same hand with two fingers off the grip and over the lever. Keyed
      // as a GROUP with the neutral frame so the two share one crop and one
      // size; cropped separately they would come out different shapes and the
      // hand would jump sideways the instant the brake came on.
      //
      // The RIGHT hand only. Mirrored onto the left it would be a clutch being
      // pulled every time the rider brakes, which is not what a rider does.
      gloveBrake: 'sprites/glove-right-brake.png',
    },

    // Width of the plane in rider units, before the framing profile's
    // handScale. One number, because both hands are now the same image at the
    // same size - two were needed only while they were two drawings framed
    // differently from each other. The aspect is read off the texture once it
    // loads, so the artwork is never stretched by a number that disagrees.
    width: 0.271,

    // From the point on the grip the anchor names, in the anchor's frame:
    // [along the grip, up, back at the rider]. A hand is not in the middle of
    // its own picture - the lever and the switch block take up part of it - so
    // this is what slides the DRAWN hand onto the grip rather than the plane's
    // centre. One set: the mirror takes care of the other side, and x is
    // multiplied by the side's sign.
    offset: [-0.020, 0.012, 0.012],

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
