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

      // Pushed back so the bars fit the narrow frame. See the note above about
      // why this is a distance and not a scale.
      riderOrigin: { x: 0, y: -0.63, z: -1.31 },
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
      riderOrigin: { x: 0, y: -0.202, z: -0.6 },
    },
  ],
};
