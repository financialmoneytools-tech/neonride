import { hand } from './hand.js';

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

/**
 * Named attachment point for a pair of hands, and the ONLY thing that connects
 * hands to the rest of the rig. A hand set - the primitive one here, or a
 * loaded model later - is aligned to this and to nothing else.
 *
 * The grip geometry below is built from these same numbers rather than from a
 * second copy of them, so an anchor and the tube it belongs to cannot drift
 * apart. Only the right grip is named: the left is its mirror through the YZ
 * plane, produced in hands/anchors.js.
 *
 * from / to / radius describe the tube a hand has to close around, which is
 * what a loaded model needs in order to be scaled to it. offset, rotation and
 * scale are the correction applied on top of the anchor frame, for a model
 * whose own origin, orientation or units are not ours; the primitive hands
 * need none of it and leave them neutral.
 */
const rightGrip = {
  from: [0.272, 0.024, 0.037],
  to: [0.398, 0.0345, 0.0885],
  radius: 0.0245,
  along: 0.5, // where along the grip the hand sits: 0 inner end, 1 outer end
  offset: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
};

export const rider = {
  // The anchor frame is +X outward along the grip, +Y up away from it, +Z back
  // at the rider. Anything aligned here inherits the grip's own angle.
  anchors: { rightGrip },

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
    from: rightGrip.from,
    to: rightGrip.to,
    radius: rightGrip.radius,
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

  hand,

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
