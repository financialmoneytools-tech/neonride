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
    //
    // It sets the SIZE and only the size; offset below owns the position. That
    // split is what makes either of them solvable, and it is new: it used to be
    // one knob doing both jobs badly. Measured by tools/measure-hands.mjs, this
    // is the width at which the glove spans 26.5 per cent of a 16:9 frame,
    // which is the share it had before the 35 degree redraw. Held on purpose -
    // a redraw should change the drawing, not the size of the bike.
    //
    // It nearly doubled from 0.271 at that redraw with the hand not changing
    // size at all. The new drawing gives far more of its picture over to
    // forearm, so the same glove needs a bigger plane to come out the same on
    // screen; measured at the old width it read 15.4 per cent against 26.5.
    width: 0.4667,

    // From the point on the grip the anchor names: [across, up, back at the
    // rider]. A hand is not in the middle of its own picture - the lever and
    // the switch block take up part of it - so this is what slides the DRAWN
    // hand onto the grip rather than the plane's centre. One set: the mirror
    // takes care of the other side, and x is multiplied by the side's sign.
    //
    // Axis aligned in the rig's space, NOT rotated into the grip's frame. The
    // anchor supplies a full basis and SpriteHands takes only its position,
    // adding these three on top; the comment here said otherwise for as long as
    // nobody had to solve against it.
    //
    // x and y are SOLVED, by tools/measure-hands.mjs --solve: they are what put
    // the knuckles at 20 and 80 per cent across and 85 per cent down a 16:9
    // frame, which is the cockpit framing contract. z is unchanged and is not
    // part of that - it is depth, and depth is size.
    //
    // They moved a long way at the 35 degree redraw, from [-0.020, 0.012],
    // because the drawn hand moved inside its own picture: the knuckles went
    // from 47 per cent across and 42 down the image to 27 and 30. That is the
    // event this offset exists to absorb, and it is precisely why width cannot
    // absorb it. With the knuckles near the middle of the picture, as they were
    // before, scaling the plane grows it around them and barely moves them;
    // with the knuckles up in one corner, scaling the plane MOVES them, and a
    // width solved for a position lands the glove at 5 per cent of the frame.
    // COMPENSATED when the anchor was re-authored onto the drawn grip axis, so
    // that the sprite did not move: the anchor origin went from
    // [0.3274, 0.0286, 0.0597] to [0.2972, 0.0895, 0.0717] and this absorbed
    // the difference exactly. The plane centre is still [0.3904, -0.0261,
    // 0.0717] and the framing is byte for byte what it was - 20.0 and 80.0 per
    // cent across, 85.0 per cent down at 16:9.
    //
    // z is now ZERO, and that is the check that this is right rather than
    // merely consistent: the anchor is a point ON the drawn bar, the drawn bar
    // is painted on this plane, so the plane and the anchor share a depth and
    // there is nothing left for z to carry. It was 0.012 when the anchor was
    // somewhere else.
    offset: [0.0932, -0.1155, 0.0000],

    // 0 is a pure billboard, 1 is welded to the bar. A hand on a bar does turn
    // with it, just not as much as the bar does, because the wrist gives.
    followSteer: 0.45,

    // Braking swaps the right hand for the frame with its fingers on the
    // lever. A cut, not a blend: at the size the hand occupies a cross fade
    // costs a second draw and a sorting problem to buy something nobody can see.
    // The two thresholds are hysteresis - one value would make the hand flicker
    // for as long as the input sat on it.
    brake: { on: 0.30, off: 0.16 },

    // THERE IS NO THROTTLE RESPONSE, and the absence is deliberate enough to
    // be worth a block of its own so that nobody adds one back.
    //
    // There was one: roll 0.30 radians about the grip axis, plus a small
    // translation, and latterly about a pivot on the drawn grip axis. All of it
    // is gone. A throttle rolls a WRIST - the hand turns, the forearm does not -
    // and this sprite is a single rigid plane carrying the hand and the forearm
    // together, so every version of it swung the whole arm. Measured at full
    // throttle on a 16:9 frame, the centre-pivot version moved the knuckles
    // 9.40 per cent of the frame and the sleeve 16.36; the wrist-pivot version
    // got the knuckles to 0.90 and the wrist to 0.00 and pushed the sleeve to
    // 28.47, because a pivot does not stop the swing, it only picks which end
    // swings. An arm moving while the bike sits still reads as wrong at once.
    //
    // The only way to move the hand without the arm is for them to be separate
    // objects, which for a sprite means a second drawn frame - which is exactly
    // how braking is answered above. If throttle is ever wanted, that is the
    // shape of the answer, not a transform.
    //
    // Steering is not affected and should not be: followSteer above still turns
    // both planes with the bars, because when the rider steers the bars really
    // do rotate and the arms really do go with them.

    // Drawn after the cockpit, so the transparent pass sorts against opaque
    // geometry that is already in the buffer.
    renderOrder: 10,
  },
};
