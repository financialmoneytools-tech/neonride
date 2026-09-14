/**
 * NEON RIDE - the supersport, one bike definition among several.
 * Part of the single configuration surface; import from ../../config.js, never
 * from this file directly. Reached as config.player.rider.machine once the
 * library in ../machine.js has selected it.
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
export const supersport = {
  // Top of the fuel tank, filling the very bottom of the frame. Raising `y`
  // brings more of it into view; at -0.06 it occupies roughly the bottom tenth
  // at 16:9 and rather more at 9:16, where the taller frame has room for it.
  // Flat and long, not round. Anything with much height this close to the eye
  // stops reading as a tank and starts reading as a balloon filling the bottom
  // of the frame - the y radius is the value that decides which one you get.
  // Nose down, so it recedes away from the rider the way a real one does.
  tank: {
    // The rear of it must stay IN FRONT of the near plane. With the cockpit
    // this close to the eye a longer tank reaches past the camera, and the near
    // plane then cuts it open: at 16:9 fifty of its vertices were behind the
    // eye and the bottom of the frame showed the inside of the tank. What is
    // behind the rider is never seen anyway, so it is shortened rather than the
    // near plane being lowered, which would cost depth precision everywhere
    // else to fix something nobody can see.
    radii: [0.170, 0.082, 0.245], // ellipsoid half extents
    offset: [0, -0.170, -0.025],
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

  // --- Paint -------------------------------------------------------------
  //
  // What separates a machine from a set of shapes. Body panels get a real
  // colour with a gloss term, the way a painted surface behaves, rather than
  // the flat graphite everything else wears.
  // Measured the hard way: at a rim strength of 0.5 and this key, a panel this
  // close to the camera stops being painted metal and becomes a flat red blob -
  // the same failure the gloves had. Bodywork wants a dark base with the colour
  // arriving mostly through the key, and a rim tight enough to stay an edge.
  paint: {
    color: 0x5e121d, // deep race red
    ambient: 0x1d0a0e,
    key: 0xff9a86,
    keyStrength: 0.85,
    rim: 0xff6a4a,
    rimStrength: 0.22,
    rimPower: 3.6,
  },

  // --- Fairing -----------------------------------------------------------
  //
  // The mass the cockpit was missing. From the saddle a supersport is mostly
  // this: two wings sweeping out and forward either side of the screen, and a
  // nose between them carrying the cluster. Without it the frame's lower half
  // is empty road, which is exactly what the reference shots do not look like.
  fairing: {
    // Swept panel either side. Authored for the right, mirrored for the left.
    // A squashed ellipsoid: see Fairing.js for why not a cone.
    // Tall enough to reach the grips. A wing whose top sits well below the bar
    // leaves a band of road between bodywork and glove, and in the reference
    // shots there is none: the wings sweep out and forward until they meet the
    // hands, and they are as much of the silhouette as the screen is.
    //
    // The grip centre is at y 0.029, so a half height of 0.115 about y -0.075
    // takes the top edge to +0.04 - just past the hand - and the bottom to
    // -0.19, which is below the tank.
    wing: {
      radii: [0.150, 0.115, 0.250],
      offset: [0.288, -0.074, -0.045],
      rotation: [0.14, -0.26, -0.30],
      segments: [24, 14],
    },

    // The lower flank, under the wing and outboard of the tank. This is what
    // takes the road out of the bottom corners.
    // Kept clear of the near plane the way the tank is: at this camera the
    // rearmost bodywork is only centimetres from the eye.
    flank: {
      radii: [0.128, 0.120, 0.200],
      offset: [0.250, -0.200, -0.010],
      rotation: [0.10, -0.16, -0.20],
      segments: [20, 12],
    },
    // Inner shoulder, filling the gap between the wing and the nose.
    shoulder: {
      radii: [0.112, 0.085, 0.180],
      offset: [0.120, -0.086, -0.130],
      rotation: [0.22, -0.16, -0.20],
      segments: [20, 12],
    },
    // The nose, between the wings and under the screen.
    nose: {
      radii: [0.130, 0.082, 0.220],
      offset: [0, -0.112, -0.180],
      rotation: [0.28, 0, 0],
      segments: [26, 14],
    },
    // A bright edge along the top of each wing, the same trick the tank seam
    // uses: a dark panel against a dark road needs a line on it to be seen.
    trim: {
      from: [0.115, 0.010, 0.105],
      to: [0.395, -0.055, -0.195],
      radius: 0.006,
      radialSegments: 8,
    },
  },

  // Bubble screen. Short and steeply raked, so it crosses the frame just above
  // the cluster without hiding the road.
  screen: {
    radii: [0.105, 0.085, 0.012],
    offset: [0, -0.012, -0.235],
    rotation: [-0.62, 0, 0],
    segments: [22, 12],
    // The lit edge is what actually reads at night; the panel behind it is
    // nearly black.
    edge: { radius: 0.104, tube: 0.0045, segments: [36, 6], offset: [0, -0.012, -0.235], rotation: [-0.62, 0, 0] },
  },

  // --- Controls ----------------------------------------------------------
  //
  // Everything within reach of the hands, which is where the eye goes. These
  // are small parts that carry most of the "this is a real machine" load,
  // because they sit right beside the gloves at the bottom of the frame.
  controls: {
    // Clip-ons: short stubs from the fork tops out to the grips, angled down
    // and back. They REPLACE the straight bar; the grip anchors do not move,
    // because the hands are posed and baked against them.
    clipOn: {
      from: [0.088, -0.072, -0.02],
      to: [0.268, -0.086, 0.028],
      radius: 0.0135,
      radialSegments: 12,
    },
    // The levers themselves stay in ./handlebar's section - this file does not
    // build two of them - but the perch that carries each one was missing, and
    // a lever starting in mid air beside the glove is exactly the sort of thing
    // that reads as a prototype.
    perch: { size: [0.030, 0.026, 0.034], offset: [0.258, -0.082, 0.014] },
    // Switch blocks, inboard of the grips.
    switchgear: { size: [0.034, 0.030, 0.052], offset: [0.245, -0.090, 0.050] },
    // Bar end weight, closing the outer end of the grip.
    barEnd: { radius: 0.019, length: 0.022, offset: [0.408, -0.0345, 0.0905] },
    // Front brake master cylinder and its reservoir, right side only.
    master: { size: [0.030, 0.034, 0.042], offset: [0.228, -0.062, 0.030] },
  },
};
