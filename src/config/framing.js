/**
 * NEON RIDE - aspect aware framing.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * A PerspectiveCamera's fov is VERTICAL, so a fixed fov means the horizontal
 * view collapses as the frame gets narrower: 114 degrees at 16:9 becomes 52 at
 * 9:16, which throws the handlebars 37 per cent of the frame width off each
 * edge. Widening the vertical fov alone cannot recover that - the ratios are
 * too far apart - so each aspect also gets its own cockpit placement.
 *
 * The knob that resizes the cockpit is riderOrigin.z, NOT a scale. The rig is
 * scaled and moved together by the field of view compensation in Rider, and
 * scaling a thing and its distance by the same factor leaves its angular size
 * exactly where it was. Pushing it further from the camera is the only way to
 * make it occupy less of the frame.
 *
 * Profiles are interpolated on aspect rather than switched, so dragging a
 * browser window between shapes blends instead of popping.
 *
 * THE CAMERA PROFILES LIVE HERE TOO, one set per aspect, and they have to. They
 * were a single set of offsets applied on top of whichever framing profile was
 * resolved, which quietly meant the SAME push in world units at both shapes -
 * and the two shapes do not start from the same place. The tall profile already
 * sits the cockpit at z -0.600 against the wide one's -0.375, so a shared
 * cinematic push of -0.30 took it to -0.90 and left a 9:16 frame two thirds
 * empty with a small bike floating in the middle of it. Which profile is
 * SELECTED is still one global switch; only the numbers are per aspect.
 */

// --- Aspect aware framing ---
export const framing = {
  // Must stay sorted by aspect, ascending. Anything narrower than the first or
  // wider than the last clamps to that profile.
  profiles: [
    {
      name: 'tall', // 9:16, the short form video shape
      aspect: 0.5625,

      // Wider than the wide profile on purpose: it buys back some of the
      // horizontal view the aspect takes away. Past about 100 the distortion
      // at the top and bottom of a tall frame starts to read as a fisheye.
      fov: 90,
      fovMax: 106, // at full speed

      // Radians of downward pitch added to the road following aim. A tall frame
      // with a level camera is half empty sky; this trades sky for road.
      // Negative is down.
      pitch: -0.24,

      // Close in, the way the reference shots frame it: bodywork fills the
      // bottom of the picture and the arms are simply outside it.
      //
      // Measured on the rendered frame - cockpit drawn, cockpit hidden, the two
      // differenced in one frozen frame - this covers 90 per cent of the lower
      // third and 65 per cent of the lower half. Both numbers move with BOTH
      // knobs: pulling the rig in without raising it sends the tank off the
      // bottom faster than the bodywork grows, which is why coverage fell the
      // first time this was tried at a fixed height.
      // Solved against the same targets as the wide profile, and it needs its
      // own numbers: a 9:16 frame is half the horizontal field of view, so the
      // same rig lands the hands 7 per cent further out and 13 per cent higher.
      //
      // It reaches the HAND and TANK targets and it cannot reach the mirror and
      // screen ones, which is a property of the two frames rather than of these
      // numbers. The geometry is shared and only the framing differs, so with
      // the hands at 82 per cent down the mirrors land at 62 and the screen top
      // at 48 - a 93 degree vertical field of view over a frame nearly twice as
      // tall puts a fixed height much lower in it. The acceptance percentages
      // are a 16:9 contract; 9:16 is held to looking right, not to matching
      // them, and forcing it would mean a second set of mirrors and screens.
      riderOrigin: { x: 0, y: -0.46, z: -0.686 },

      // The hands are sprites and do not have to shrink with the rest of the
      // cockpit. Everything else here is a camera decision and applies to all
      // of it at once; this is the one part that is sized for legibility
      // instead, and a tall frame needs it larger to hold the same share of the
      // picture as a wide one does.
      handScale: 1.10,

      // And pulled toward the centreline. The hands sit at a fixed place on the
      // bars, but a tall frame's horizontal field of view is half a wide one's
      // - 29 degrees against 54 - so the same world position lands much further
      // out in it. Measured, the hands ran off both edges of a 9:16 frame with
      // an 11 per cent gap left between them in the middle, where at 16:9 they
      // frame the cluster with margins of 7 and 11 per cent and almost meet.
      // This is in rider units, applied inboard on each side.
      handInset: 0.049,

      // A tall frame needs far less of a push than a wide one. It is already
      // the further of the two, and it has the least road to give away: every
      // unit the machine recedes is answered by black at the bottom of the
      // picture rather than by more scenery.
      cameras: {
        ride: { height: 0, pitch: 0, rider: { x: 0, y: 0, z: 0 } },
        cinematic: { height: 0.22, pitch: -0.05, rider: { x: 0, y: 0.03, z: -0.05 } },
      },
    },
    {
      name: 'wide', // 16:9, the values phase 4 was tuned against
      aspect: 1.7778,
      // Left at 75 on purpose: it is the value the phase 4 cockpit was tuned
      // and signed off against, so at rest 16:9 frames exactly as it did. Only
      // the ramp above it is new.
      fov: 75,
      fovMax: 104,
      pitch: 0,
      // The eye. Pulled back in to -0.375 after a spell at -0.435: pushing it
      // out fixed a cockpit that was too big, and then left the frame with
      // nothing under the cluster but road. Closer is what the references have,
      // and the answer to a cockpit that is too big is a smaller cockpit, not a
      // further one. y moves with z so the cockpit stays where it sits in the
      // frame rather than climbing toward the horizon as it recedes.
      //
      // The two profiles had drifted apart. Measured with each part marked and
      // counted in a full frame, 16:9 showed the bodywork at 5.9 per cent of
      // the picture against 3.6 at 9:16, and the gloves at 11.7 against 7.4 -
      // the same 0.6 ratio for both, because it is the whole cockpit and not
      // any one part of it. 16:9 comes down to meet 9:16 rather than the other
      // way round: growing the tall profile would eat road, and vertical has
      // the least road to spare.
      // Solved against the reference framing rather than chosen. The target
      // is measured in percentages of the frame - hands at 20 and 80 per cent
      // across and 85 per cent down - and these are the two numbers that put
      // them there. NOT pitch and not camera height: the rig is a CHILD of the
      // camera, so pitching the camera rotates the cockpit with it and moves it
      // in frame by nothing at all. Measured, -0.12 rad of ride pitch moved the
      // hands by one tenth of one per cent. Only riderOrigin moves the machine.
      riderOrigin: { x: 0, y: -0.2245, z: -0.385 },
      handScale: 1.0,
      handInset: 0,

      // Most of the cinematic framing is height and pitch, not distance.
      // Pushing the cockpit away brings the machine into shot and shrinks it in
      // the same move; looking DOWN at it from a raised eye brings it into shot
      // and fills the lower half of the picture with it, which is the shot.
      cameras: {
        ride: { height: 0, pitch: 0, rider: { x: 0, y: 0, z: 0 } },
        cinematic: { height: 0.46, pitch: -0.26, rider: { x: 0, y: 0.07, z: -0.30 } },
      },
    },
  ],
};
