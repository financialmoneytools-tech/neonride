/**
 * NEON RIDE - framing.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * ONE PROFILE. This file used to carry two - 9:16 and 16:9 - with everything
 * that differs between them resolved by blending on aspect: field of view, the
 * downward pitch that trades sky for road, where the cockpit sits, and a hand
 * scale and inset to keep the gloves in frame at both shapes. The game is
 * landscape only now, so there is nothing to blend and nothing to choose.
 *
 * The LIST stays a list, and Framing still blends across it, because that costs
 * nothing with one entry and is how a second shape would come back if one ever
 * does. What has gone is the second set of numbers, which had to be kept in
 * step with this one by hand and was a standing invitation to fix a thing in
 * one profile and not the other.
 *
 * handScale and handInset are kept at their neutral 1 and 0. They exist for the
 * primitive cockpit's sprite hands - config.player.cockpit.source 'geometry' -
 * which still reads them; with one profile they are constants rather than a
 * per aspect correction.
 *
 * THE CAMERA PROFILES live here too: one set of offsets for the riding view and
 * one for the cinematic one, selected by config.player.camera.profile.
 */

// --- Aspect aware framing ---
export const framing = {
  // Must stay sorted by aspect, ascending. Anything narrower than the first or
  // wider than the last clamps to that profile.
  profiles: [
    {
      name: 'wide', // 16:9, the values phase 4 was tuned against
      aspect: 1.7778,
      // Left at 75 on purpose: it is the value the phase 4 cockpit was tuned
      // and signed off against, so at rest 16:9 frames exactly as it did. Only
      // the ramp above it is new.
      fov: 75,
      fovMax: 104,
      // Radians of downward pitch added to the road-following aim. Negative is
      // down, and pitching down raises the HORIZON in frame - which is the only
      // way to open a road band between the horizon and the top of the cockpit.
      //
      // 0 before, which put the horizon at exactly 50 per cent, level with the
      // middle of the frame and 2.5 per cent above a cockpit that started at
      // 52.5. Solved: the horizon sits where tan(pitch) / tan(fov/2) puts it,
      // so 43.5 per cent down wants tan(pitch) = 0.13 * tan(37.5 deg).
      //
      // It moves ONLY the world. The cockpit sprite is a child of the camera,
      // so it pitches with it and stays exactly where it was in screen space -
      // which is why this is a separate knob from the two above and not a third
      // way of moving the bike.
      pitch: -0.0994,
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
