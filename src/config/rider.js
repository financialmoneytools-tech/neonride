import { hand } from './hand.js';
import { instruments } from './instruments.js';
import { bike, machine, machines } from './machine.js';

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

  // How much the cockpit resists the speed field of view ramp.
  //   0 - it shrinks in frame as the view opens up, exactly like the world.
  //       This is a real speed cue and is why it is the default.
  //   1 - it keeps the same share of the frame at every speed.
  // Only the size is scaled, never the distance; scaling both would cancel out.
  // Values near 1 grow the rig toward the camera, so check the near plane
  // clearance before shipping anything above about 0.6.
  fovCompensation: 0,
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
    // 'clipOn' drops the crossbar entirely and bike/Controls.js builds the
    // stubs from the fork tops out to the grips instead, which is what a
    // supersport has and the clearest cue available at this camera.
    style: 'clipOn',
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
    stalkTo: [0.262, 0.158, 0.056],
    // Thin, and thinner still at the top. Once the bodywork moved in around
    // them these read as paddles: a stalk of a constant 0.0095 is nearly as
    // thick as a finger, and at this camera the eye reads thickness against
    // the hand right beside it. A real stalk is a stem, so it tapers.
    stalkRadius: 0.0072,
    stalkTipRadius: 0.0042,
    // Small heads, set further outboard, which is what the references have -
    // the head is a chip of glass on the end of a stem, not a plate. Dropping
    // the radius from 0.036 takes roughly half the area off each one.
    headRadius: 0.019,
    headDepth: 0.0055,
    headSegments: 16,
    // The rider's eye is above the head, so the face tips up as well as back.
    // Turned further outboard than the old value: a head angled out shows the
    // rider its edge rather than its full face, which is both what the
    // references look like and less of the road blocked.
    headRotation: { x: -0.35, y: -0.52, z: 0 },
    glassInset: 0.0018,
    glassRadius: 0.0155,
  },

  hand,

  // Everything the rider can see of the machine itself. Lives in its own
  // file; see config/machine.js for why the placements are framing driven.
  //
  // `machine` is the fitted one and is what every builder reads. `machines` is
  // the library it was chosen from; swapping bikes points the first at another
  // entry of the second and rebuilds.
  machine,
  machines,
  bike,

  // The dash. Next door; it is the one part of the rig laid out in texture
  // pixels rather than in rider units.
  instruments,

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
    // The rim term draws an outline around every convex lobe it is given, and
    // at 0.42 it was most of what the old hand looked like: twenty-two lobes,
    // twenty-two purple outlines, a cluster of floating capsules. One closed
    // shell of large flat facets needs the opposite - a rim tight enough to
    // stay on the silhouette, and the key doing the work instead.
    glove: {
      // Lifted off near-black with the rim. The old hand got most of its
      // brightness FROM the rim - twenty-two lobes each with a lit edge - so
      // cutting the rim back left a silhouette with nothing inside it. What
      // replaced that brightness has to be the key and the base, or the hand is
      // a hole in the frame.
      color: 0x1c212f,
      ambient: 0x232a45,
      key: 0x99a3c4,
      keyStrength: 1.25,
      rim: 0xa45cff,
      rimStrength: 0.26,
      rimPower: 4.0,
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
    // The inside of a vent. Unpainted, and much darker than the panel around
    // it - a recess that shades like its own bodywork is not a recess, it is a
    // decal. The rim is what actually makes the opening read at night: the
    // mouth of the pocket catches it at a grazing angle and draws its own edge.
    vent: {
      color: 0x0a0b10,
      ambient: 0x141a2c,
      key: 0x5c6480,
      keyStrength: 0.45,
      rim: 0x2de3ff,
      // Tight and weak, unlike every other rim on the bike. At 0.38 and a power
      // of 2.2 the rim reached right across the floor of the pocket and lit the
      // whole thing teal, which read as a window rather than a hole. Pulled in
      // to this it only catches the mouth, which is the part that should.
      rimStrength: 0.20,
      rimPower: 3.4,
    },
    neonLeft: 0x22f7ff, // matches the left edge line of the road
    neonRight: 0xff2bd0, // matches the right edge line
  },
};
