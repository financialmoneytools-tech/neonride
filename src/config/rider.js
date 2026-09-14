/**
 * NEON RIDE - rider rig geometry, placement and shading.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.rider.
 *
 * Rider space: the rig is a child of the camera, so every coordinate below is
 * measured from the camera itself. +X right, +Y up, -Z forward (into the
 * screen). The origin of the rig sits at the centre of the handlebar clamp;
 * every part is placed relative to that, which is why moving `origin` moves the
 * whole cockpit without disturbing anything inside it.
 *
 * To judge a placement on screen: at depth d the visible half height is
 * d * tan(fov / 2), so a part at height y appears (1 - y / (d * tan(fov / 2)))
 * / 2 of the way down the frame. As shipped the rig occupies 56 to 88 per cent
 * down and 22 to 78 per cent across, with the grips at 66 to 74 per cent down.
 */

export const rider = {
  origin: { x: 0, y: -0.202, z: -0.6 },

  // 1 keeps the cockpit exactly the same size on screen as the field of view
  // opens up, by pulling it in and shrinking it by the same factor. 0 lets it
  // shrink away with the rest of the world, which reads as more speed but
  // makes the hands feel detached.
  fovCompensation: 1,
  bobLag: 0.3, // share of the camera bob the rig does NOT follow

  // The bars turn about the steering head, which is raked back like a real
  // one, so the ends swing fore and aft rather than sliding sideways.
  steering: {
    pivot: { x: 0, y: -0.16, z: -0.16 },
    rake: 0.44, // radians the steering axis leans back from vertical
    maxAngle: 0.19, // radians of bar rotation at full steer
    tau: 0.09,
  },

  // Handlebar centreline for the right half, mirrored for the left.
  // Points are joined by tubes with a sphere at every bend.
  bar: {
    radius: 0.0155,
    radialSegments: 10,
    path: [
      [0.05, 0.0, 0.0],
      [0.17, 0.008, 0.006],
      [0.29, 0.026, 0.04],
      [0.395, 0.034, 0.086],
    ],
    clamp: { width: 0.115, height: 0.048, depth: 0.062, y: 0.004 },
    clampCap: { radius: 0.021, length: 0.05, spacing: 0.038 },
  },

  grip: {
    from: [0.272, 0.024, 0.037],
    to: [0.398, 0.0345, 0.0885],
    radius: 0.0245,
    radialSegments: 14,
    ribs: 5, // shallow rings along the grip, purely to catch the rim light
    ribRadius: 0.0265,
    ribWidth: 0.006,
    // Flared bar end, built as a lathe profile of [radius, distance] pairs.
    // Lathe profiles must be listed with the distance increasing, which is
    // what gives outward facing normals; both ends close at radius 0 so the
    // cap is solid from every angle.
    capProfile: [
      [0.0, 0.0],
      [0.019, 0.001],
      [0.026, 0.006],
      [0.028, 0.016],
      [0.024, 0.021],
      [0.0, 0.024],
    ],
    capSegments: 14,
  },

  lever: {
    pivot: [0.258, 0.019, 0.016],
    length: 0.125,
    // Direction the blade runs: outward along the bar and forward past it.
    direction: [0.72, 0.04, -0.69],
    thickness: 0.0075,
    width: 0.021,
    perch: { width: 0.03, height: 0.036, depth: 0.034 },
  },

  mirror: {
    // The stalk has to lift the head clear of the bar or the mirror reads as
    // a lump sitting on it. Raising stalkTo.y pushes the head up the screen;
    // at 0.105 the pair sit between 56 and 65 per cent down, just under the
    // centre line, which is about where they sit on a real bike.
    stalkFrom: [0.128, 0.006, -0.008],
    stalkTo: [0.295, 0.105, 0.012],
    stalkRadius: 0.0085,
    headRadius: 0.04,
    headDepth: 0.013,
    headSegments: 18,
    // Rotation of the mirror head, so its face turns back toward the rider.
    headRotation: { x: -0.22, y: -0.55, z: 0 },
    glassInset: 0.0035,
    glassRadius: 0.0345,
  },

  // Hands are authored once, for the RIGHT grip, in a frame aligned to that
  // grip: +X runs outward along the grip, +Y is up away from it, +Z points
  // back at the rider. The left hand is the same numbers put through a
  // mirror, so the two can never drift out of agreement.
  //
  // Angles around the grip are measured from straight up, increasing toward
  // the front of the bike: 0 is the top of the grip, 1.57 is the leading
  // edge, 3.14 is the bottom.
  hand: {
    alongGrip: 0.44, // 0 at the inner end of the grip, 1 at the outer end

    palm: {
      size: [0.088, 0.05, 0.076],
      offset: [0, 0.019, 0.012],
      rotation: [0.16, 0, -0.05],
    },

    knuckles: { radius: 0.0155, angle: 0.55, distance: 0.031 },

    fingers: {
      count: 4,
      spacing: 0.0235, // along the grip
      first: -0.0345, // offset of the index finger from the hand centre
      radius: 0.0112,
      taper: 0.84, // tip radius as a fraction of the base radius

      // Three joints - knuckle, middle, tip - each given as an angle around
      // the grip axis and a distance from it. Placing the joints ON arcs
      // around the grip is what makes the finger wrap it; expressing them as
      // directions and lengths instead sends the tips out past the grip, no
      // matter how the angles are tuned.
      //
      // Distances sit a little inside grip radius plus finger radius on
      // purpose, so the fingers press into the rubber rather than hover.
      joints: [
        [0.55, 0.032],
        [1.75, 0.041],
        [2.78, 0.036],
      ],
      // Per finger tweak on the tip angle, so the four do not curl as one
      // machined block. Index first, little finger last.
      curlOffsets: [-0.07, 0.05, 0.03, -0.1],
    },

    thumb: {
      offset: [-0.034, 0.024, 0.02],
      direction: [0.55, -0.2, -0.81],
      length: 0.058,
      radius: 0.0132,
      taper: 0.88,
    },

    // Short forearm stub so the gloves do not read as floating props. It
    // leaves the frame at the bottom, the way real arms do.
    forearm: {
      offset: [-0.045, 0.012, 0.03],
      direction: [-0.42, -0.24, 0.87],
      length: 0.115,
      radius: 0.031,
      flare: 1.18, // the cuff end is wider than the wrist
      radialSegments: 12,
    },

    // Thin emissive trim: a seam along the back of the hand and a cuff ring.
    rim: {
      seamSize: [0.078, 0.004, 0.007],
      seamOffset: [0, 0.0435, 0.008],
      seamRotation: [0.16, 0, -0.05],
      cuffOffset: [-0.0765, 0.0045, 0.0555],
      cuffDirection: [-0.42, -0.24, 0.87],
      cuffRadius: 0.0375,
      cuffWidth: 0.009,
      cuffSegments: 16,
    },
  },

  // Everything ahead of the bars. All of it turns with the steering.
  front: {
    tripleClamp: { size: [0.205, 0.042, 0.08], offset: [0, -0.062, -0.012] },
    fork: {
      from: [0.086, -0.078, -0.018],
      to: [0.097, -0.215, -0.092],
      radius: 0.019,
      radialSegments: 12,
    },
    headlight: {
      offset: [0, -0.2, -0.185],
      rotation: [0.28, 0, 0], // nose down, matching the fork rake
      // Lathe profile of the housing, [radius, depth], listed front lip
      // first so the depth increases: that is the order that yields outward
      // normals. Positive depth is toward the rider, so the rider sees the
      // closed back of the bowl bulging at them, not into the reflector.
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
  },

  // Small neon gauge cluster in the middle of the bars.
  instruments: {
    offset: [0, 0.052, -0.012],
    rotation: [-0.95, 0, 0], // tipped back toward the rider
    size: [0.165, 0.092, 0.008],
    frameMargin: 0.007,
    frameDepth: 0.012,
    texture: { width: 256, height: 144 },
    updateHz: 12, // the canvas is only redrawn when a shown value changes
    labels: { speed: 'HIZ', unit: 'KM/S', rpm: 'DEVIR' },
    rpmSegments: 18,
    colors: {
      background: '#05030c',
      border: '#2de3ff',
      speed: '#ffffff',
      label: '#7a7fa8',
      rpmLow: '#2de3ff',
      rpmMid: '#39ff88',
      rpmHigh: '#ff2bd0',
      rpmOff: '#141a2e',
    },
  },

  // Fake lighting for the whole rig. There are no lights in the scene, so
  // every rider surface is shaded by this one model instead: a key from above
  // and to the left, a cool ambient, and a rim that picks up the neon world.
  // Directions are in view space, so the shading does not swim when the
  // camera rolls.
  materials: {
    keyDirection: { x: -0.35, y: 0.72, z: 0.6 },
    frame: {
      color: 0x14161f,
      ambient: 0x1a2038,
      key: 0x9aa6c8,
      keyStrength: 0.85,
      rim: 0x4ad9ff,
      rimStrength: 0.5,
      rimPower: 2.6,
    },
    grip: {
      color: 0x0c0d12,
      ambient: 0x161a2c,
      key: 0x6f7590,
      keyStrength: 0.55,
      rim: 0x2de3ff,
      rimStrength: 0.3,
      rimPower: 3.2,
    },
    glove: {
      color: 0x101219,
      ambient: 0x1b2138,
      key: 0x8890ad,
      keyStrength: 0.7,
      rim: 0xa45cff,
      rimStrength: 0.42,
      rimPower: 2.9,
    },
    mirror: {
      color: 0x070a14,
      ambient: 0x121a30,
      key: 0xb9c6e8,
      keyStrength: 1.15,
      rim: 0x9a6cff,
      rimStrength: 0.75,
      rimPower: 1.7,
    },
    neonLeft: 0x22f7ff, // matches the left edge line of the road
    neonRight: 0xff2bd0, // matches the right edge line
  },
};
