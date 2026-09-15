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
      riderOrigin: { x: 0, y: -0.33, z: -0.70 },
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
      // Pushed out from z -0.34, and dropped from y -0.170 to match, which
      // keeps the cockpit where it was in the frame while making it smaller.
      //
      // The two profiles had drifted apart. Measured with each part marked and
      // counted in a full frame, 16:9 showed the bodywork at 5.9 per cent of
      // the picture against 3.6 at 9:16, and the gloves at 11.7 against 7.4 -
      // the same 0.6 ratio for both, because it is the whole cockpit and not
      // any one part of it. 16:9 comes down to meet 9:16 rather than the other
      // way round: growing the tall profile would eat road, and vertical has
      // the least road to spare.
      riderOrigin: { x: 0, y: -0.226, z: -0.435 },
    },
  ],
};
