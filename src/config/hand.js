/**
 * NEON RIDE - hand set settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.rider.hand.
 *
 * `source` chooses which implementation createHands builds. Everything after it
 * describes the primitive hands only: a model backed set will ignore all of it
 * and read nothing but the grip anchor in ./rider.js, which is the whole point
 * of keeping the two apart.
 */

// Hands are authored once, for the RIGHT grip, in a frame aligned to that
// grip: +X runs outward along the grip, +Y is up away from it, +Z points back
// at the rider. The left hand is the same numbers mirrored, so the two can
// never drift apart. Angles around the grip are measured from straight up,
// increasing toward the front: 0 is the top, 1.57 the leading edge, 3.14 the
// bottom.
export const hand = {
  // Which implementation createHands builds.
  //   'primitive' - the geometry described by everything below
  //   'model'     - the loaded GLB, which ignores all of it and reads only the
  //                 grip anchor
  // The B key cycles this at runtime and rebuilds, so the two can be compared
  // side by side in one session.
  source: 'primitive',

  // Loaded hand set. See ASSETS.md for provenance and licence.
  //
  // The pack's own texture is deliberately ignored: it is hand painted retro
  // and would look cheap against the bloom. Only the geometry is taken, and it
  // is given the project's own glove material and neon rim, so the hands belong
  // to this world rather than to the pack they came from.
  //
  // If the file is missing, the primitive hands are built instead, so a fresh
  // clone with nothing downloaded still runs.
  model: {
    url: 'models/wrad-arms.glb',

    // Correction applied on top of the grip anchor frame, derived from the
    // pack's own skeleton rather than tried by eye.
    //
    // Scale: the bind pose bones give three independent readings against real
    // anatomy - upper arm 0.103, forearm 0.112, hand 0.106 - so 0.11 is where
    // they converge. Do NOT derive it from the distance between the wrists
    // instead: the rest pose spreads them 1.03 m apart against our 0.67 m bar,
    // and scaling to close that gap gives child sized hands.
    //
    // Rotation: none needed. The pack is +X right, +Y up, -Z forward, which is
    // exactly the grip anchor frame, so the two already agree.
    //
    // Offset: minus scale times the palm centre in mesh space, the midpoint of
    // wrist.r and finger_middle1.r at (5.045, -3.155, -2.611). That puts the
    // palm on the grip axis rather than the wrist, which is where the tube
    // actually passes through a closed hand.
    scale: 0.11,
    offset: [-0.5549, 0.347, 0.2872],
    rotation: [0, 0, 0],

    // Bones whose geometry survives: a name matching any prefix AND ending in
    // the suffix. Everything else is cut away before the mesh is used. The
    // suffix is what picks a side - Blender names bones '.r' and '.l', and a
    // prefix alone cannot separate them because 'finger_' starts both hands.
    //
    // This is not trimming for performance. The pack is one mesh holding BOTH
    // arms, and its rest pose is an A pose: shoulder to wrist comes out at
    // 0.65 m where a riding position has 0.43 m, so the elbows would have to
    // bend for the arms to reach our grips at all. Nothing above mid forearm
    // can be placed correctly without posing the skeleton, and in a first
    // person view nothing above mid forearm is on screen anyway. So we keep a
    // hand and a stub, and mirror the right side for the left.
    keepBones: {
      prefixes: ['wrist', 'finger_', 'socket', 'forearm.Twist1'],
      suffix: '.r',
    },

    // Material overrides, merged over materials.glove in ./rider.js.
    //
    // The glove preset is tuned for the primitive hands, which are smooth and
    // highly tessellated, so most of what you see faces the camera and the rim
    // stays a thin edge. A low poly hand is the opposite: large flat facets at
    // steep angles, so the same rim term covers nearly the whole surface and
    // the hands come out solid violet. Measured, not guessed - setting
    // rimStrength to 0 turns them black, which is the whole of the effect.
    //
    // So this pack gets a tighter, weaker rim and a stronger key, because on
    // flat facets the key is what makes the form read at all.
    material: {
      rimStrength: 0.14,
      rimPower: 5.0,
      keyStrength: 1.35,
      color: 0x3a4156,
      ambient: 0x2a3050,
    },

    // Which node inside the GLB to take. Empty means the first mesh in the
    // file, which is what a single mesh pack gives you.
    rightNode: '',
  },

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
};
