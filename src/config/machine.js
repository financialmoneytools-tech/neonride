/**
 * NEON RIDE - the parts of the bike the rider can actually see.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.rider.machine.
 *
 * Rider space, same as the rest of the rig: origin at the handlebar clamp,
 * +X right, +Y up, -Z forward.
 *
 * The rig is a framing device, not a scale model. It is compressed vertically -
 * the bars sit 0.2 below the eye where a real bike puts them nearer 0.5 - so
 * parts are placed by where they land ON SCREEN rather than by where they would
 * sit on a real machine. The tank in particular reads far higher here than it
 * would in life, because anything that close to the camera drops out of frame
 * fast.
 *
 * What belongs here: only what is visible from the saddle. Tank top, upper
 * fork, headlight and its cowl, the top of the front fender and the sliver of
 * tyre either side of it. No frame rails, no engine, no seat, no rear end.
 *
 * The tank is the one part that does NOT turn with the bars - it is bolted to
 * the chassis - which is why Rider hangs it off its own group.
 */

// --- Visible machine ---
export const machine = {
  // Top of the fuel tank, filling the very bottom of the frame. Raising `y`
  // brings more of it into view; at -0.06 it occupies roughly the bottom tenth
  // at 16:9 and rather more at 9:16, where the taller frame has room for it.
  // Flat and long, not round. Anything with much height this close to the eye
  // stops reading as a tank and starts reading as a balloon filling the bottom
  // of the frame - the y radius is the value that decides which one you get.
  // Nose down, so it recedes away from the rider the way a real one does.
  tank: {
    radii: [0.155, 0.036, 0.27], // ellipsoid half extents
    offset: [0, -0.185, 0.05],
    rotation: [0.2, 0, 0],
    segments: [28, 14],
    // Filler cap, the one piece of detail that says fuel tank rather than panel
    cap: { radius: 0.026, height: 0.009, offset: [0, 0.03, 0.12], segments: 18 },
    // Neon seam down the spine of the tank, matching the glove trim
    seam: { size: [0.009, 0.005, 0.33], offset: [0, 0.032, 0.02] },
  },

  tripleClamp: { size: [0.205, 0.042, 0.08], offset: [0, -0.062, -0.012] },

  // Upper fork tubes, then the fatter sliders below them.
  fork: {
    from: [0.086, -0.078, -0.018],
    to: [0.097, -0.215, -0.092],
    radius: 0.019,
    radialSegments: 14,
    slider: {
      from: [0.098, -0.2, -0.085],
      to: [0.108, -0.37, -0.175],
      radius: 0.026,
      radialSegments: 14,
    },
  },

  headlight: {
    offset: [0, -0.2, -0.185],
    rotation: [0.28, 0, 0], // nose down, matching the fork rake
    // Lathe profile of the housing, [radius, depth], listed front lip first so
    // the depth increases: that is the order that yields outward normals.
    // Positive depth is toward the rider, so the rider sees the closed back of
    // the bowl bulging at them, not into the reflector.
    profile: [
      [0.084, -0.03],
      [0.082, -0.012],
      [0.074, 0.01],
      [0.056, 0.032],
      [0.03, 0.048],
      [0.0, 0.055],
    ],
    segments: 20,
    rimRadius: 0.087,
    rimDepth: -0.03, // the front lip, where the ring sits
    rimWidth: 0.012,
    rimSegments: 20,
  },

  // Cowl wrapped around the headlight. Only its back is ever seen.
  cowl: {
    offset: [0, -0.19, -0.16],
    rotation: [0.28, 0, 0],
    profile: [
      [0.125, -0.035],
      [0.122, 0.0],
      [0.108, 0.04],
      [0.082, 0.072],
      [0.05, 0.092],
    ],
    segments: 22,
    // Emissive lip around the rim, the cowl's share of the neon treatment
    lip: { radius: 0.127, width: 0.014, depth: -0.035, segments: 22 },
  },

  // Front fender, seen as an arc over the tyre. thetaStart and thetaLength cut
  // the cylinder down to just the part above the wheel.
  fender: {
    centre: [0, -0.46, -0.44],
    radius: 0.195,
    width: 0.1,
    thetaStart: 0.35,
    thetaLength: 2.1,
    segments: 22,
    thickness: 0.012,
  },

  // The tyre either side of the fender. Dark, and deliberately only the top arc:
  // the rest is below the frame and below the fork.
  wheel: {
    centre: [0, -0.46, -0.44],
    radius: 0.16,
    width: 0.075,
    thetaStart: 0.2,
    thetaLength: 2.5,
    segments: 24,
  },
};
