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
 * / 2 of the way down the frame. As shipped the grips sit at 65 to 72 per cent
 * down and 22 to 78 across, the mirrors at 50 to 57 down.
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
    // The stalk must RISE, not reach out: mostly outward plants the head over
    // the hand, where it blocks the road. Up and back puts the heads at 50 to
    // 57 per cent down while the hands stay at 63 and below, clear of them.
    stalkFrom: [0.205, 0.014, 0.014],
    stalkTo: [0.245, 0.165, 0.06],
    stalkRadius: 0.0095,
    headRadius: 0.036,
    headDepth: 0.012,
    headSegments: 22,
    // The rider's eye is above the head, so the face tips up as well as back.
    headRotation: { x: -0.35, y: -0.45, z: 0 },
    glassInset: 0.0035,
    glassRadius: 0.031,
  },

  // Hands are authored once, for the RIGHT grip, in a frame aligned to that
  // grip: +X runs outward along the grip, +Y is up away from it, +Z points back
  // at the rider. The left hand is the same numbers mirrored, so the two can
  // never drift apart. Angles around the grip are measured from straight up,
  // increasing toward the front: 0 is the top, 1.57 the leading edge, 3.14 the
  // bottom.
  hand: {
    alongGrip: 0.5, // 0 at the inner end of the grip, 1 at the outer end

    // Segment counts: the difference between a hand and a bag of faceted tubes.
    segments: {
      palm: [22, 16],
      knuckle: [14, 10],
      finger: 14,
      bead: [12, 9],
      tip: [10, 8],
      thumb: 14,
      forearm: 16,
    },

    // The palm is an ellipsoid, not a box: a box this size reads as a block
    // whatever it is wrapped around. Its vertical span has to STRADDLE the grip
    // axis - offset minus radius must come out below zero - or the hand sits on
    // top of the tube instead of closing around it, which is exactly how it
    // looked when the offset was 0.019 against a radius of 0.025.
    palm: {
      radii: [0.038, 0.029, 0.033],
      offset: [0, 0.012, 0.007],
      rotation: [0.14, 0, -0.05],
    },

    knuckles: { radius: 0.0138, angle: 0.55, distance: 0.03 },

    fingers: {
      count: 4,
      spacing: 0.0225, // along the grip
      first: -0.0335, // offset of the index finger from the hand centre
      radius: 0.0102,
      taper: 0.84, // tip radius as a fraction of the base radius

      // Three joints - knuckle, middle, tip - each an angle around the grip axis
      // and a distance from it. Placing them ON arcs is what makes the finger
      // wrap; as directions and lengths the tips run out past the grip however
      // the angles are tuned. Distances sit just inside grip plus finger radius,
      // so the fingers press into the rubber rather than hover.
      joints: [
        [0.55, 0.031],
        [1.78, 0.039],
        [3.0, 0.034],
      ],
      // Per finger tweak on the tip angle, so the four do not curl as one
      // machined block. Index first, little finger last.
      curlOffsets: [-0.07, 0.05, 0.03, -0.1],
    },

    // The thumb lies ACROSS the top of the grip, running outward and forward,
    // which is what closes the hand. Its tip distance from the grip axis has to
    // clear grip radius plus thumb radius or the tip disappears into the tube.
    thumb: {
      offset: [-0.032, 0.034, 0.016],
      direction: [0.78, -0.22, -0.58],
      length: 0.05,
      radius: 0.0115,
      taper: 0.85,
    },

    // Forearm. Three things must hold at once or it stops reading as an arm:
    // thinner than the grip (at 0.031 it was fatter, and read as a pipe);
    // pointed mostly BACK rather than down, so it foreshortens instead of
    // sweeping across the frame; and long enough to leave the bottom of the
    // screen at every field of view, since an arm ending in mid air reads as a
    // floating block. Keep the inward component small or the arms walk across
    // the instrument panel and the nose of the bike.
    forearm: {
      offset: [-0.042, 0.008, 0.028],
      direction: [-0.14, -0.45, 0.88],
      length: 0.34,
      radius: 0.02,
      flare: 1.22, // wider toward the elbow
    },

    // Thin emissive trim: a seam over the back of the hand and a cuff ring.
    rim: {
      seamSize: [0.062, 0.0038, 0.0065],
      seamOffset: [0, 0.0425, 0.006],
      seamRotation: [0.14, 0, -0.05],
      // Sits just down the forearm from the wrist, and must stay wider than the
      // arm is at that point or the band sinks into it.
      cuffOffset: [-0.048, -0.012, 0.068],
      cuffDirection: [-0.14, -0.45, 0.88],
      cuffRadius: 0.024,
      cuffWidth: 0.008,
      cuffSegments: 20,
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
