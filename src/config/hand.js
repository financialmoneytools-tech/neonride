/**
 * NEON RIDE - gloved hand settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.rider.hand.
 *
 * The hand is authored once, for the RIGHT grip, in a frame aligned to that
 * grip: +X runs outward along the grip, +Y is up away from it, +Z points back
 * at the rider. The left hand is the same geometry under a mirrored frame, so
 * the two can never drift apart.
 *
 * It is ONE lofted mass, not a set of parts - see player/rider/hands/
 * GlovedFist.js for why, and for what the twenty-two separate solids that came
 * before it looked like. The section wraps the grip and the spine runs along
 * it, so the two things that matter are both structural rather than tuned: the
 * section never comes closer to the grip axis than the grip's own radius, so
 * the tube is always hidden, and there is nothing to come apart because there
 * is only one piece.
 */

// The grip is 0.0245 in radius. Every section point below, once multiplied by
// its radii, sits further from the axis than that - the closest is the heel at
// about 0.042 - which is what "the grip is mostly hidden behind the hand"
// means in numbers rather than in hope.

// Cross section of a closed fist, looking down the grip. Normalized to a unit
// box: x is FORWARD, down the road, y is up. A third entry of 1 marks the point
// hard, so the faces meeting there break into a crease instead of rolling into
// each other; that is what keeps the hand from going back to being a blob.
const FIST_SECTION = [
  [-0.62, 0.86, 1], // back of the hand, wrist corner
  [0.30, 1.00, 1], // crest, where the knuckle ridge is laid in
  [0.86, 0.62, 1], // front of the knuckles, turning down
  [1.00, 0.00, 0], // leading edge, facing the wind
  [0.80, -0.62, 1], // fingers turning under the grip
  [0.18, -0.96, 1], // fingertips, tucked underneath
  [-0.60, -0.80, 0], // heel of the hand
  [-0.94, -0.10, 0], // rear of the hand
];

// The knuckle ridge: a small rounded bar swept along the same axis and sunk
// into the back of the fist. All points smooth - a knuckle is the one part of a
// hand with no edge on it.
const RIDGE_SECTION = [
  [0.00, 1.00, 0],
  [0.72, 0.70, 0],
  [1.00, 0.00, 0],
  [0.72, -0.70, 0],
  [0.00, -1.00, 0],
  [-0.72, -0.70, 0],
  [-1.00, 0.00, 0],
  [-0.72, 0.70, 0],
];

export const hand = {
  // The fist. radii are the half extents the section and the spine are scaled
  // to: x forward, y up, z along the grip.
  fist: {
    section: FIST_SECTION,
    radii: [0.045, 0.047, 0.047],
    // Sat a touch above and behind the grip axis, the way a fist on a bar
    // actually sits - the bar runs through the hollow of the fingers, not
    // through the middle of the hand.
    offset: [0, 0.004, 0.003],
    // Stations run inboard to outboard along the grip. The four knuckles are
    // the swollen ones and the dips between them are the gaps between fingers,
    // so the top silhouette undulates four times - which is the whole of what
    // reads as a row of knuckles at this distance.
    stations: [
      { z: -1.00, offset: [0, -0.04], scale: [0.84, 0.82] }, // wrist end
      { z: -0.70, offset: [0, 0.03], scale: [1.00, 1.04] }, // index knuckle
      { z: -0.46, offset: [0, -0.01], scale: [0.96, 0.95] },
      { z: -0.23, offset: [0, 0.03], scale: [1.00, 1.05] }, // middle knuckle
      { z: 0.00, offset: [0, -0.01], scale: [0.96, 0.95] },
      { z: 0.24, offset: [0, 0.02], scale: [0.99, 1.02] }, // ring knuckle
      { z: 0.48, offset: [0, -0.02], scale: [0.94, 0.93] },
      { z: 0.71, offset: [0, 0.00], scale: [0.95, 0.96] }, // little knuckle
      { z: 1.00, offset: [0, -0.05], scale: [0.78, 0.76] }, // outboard end
    ],
  },

  // Laid along the crest of the fist section, sunk far enough that only its
  // crown stands proud. Its stations swell at each knuckle and pinch hard
  // between them, which is what makes one ridge read as four knuckles.
  knuckleRidge: {
    section: RIDGE_SECTION,
    radii: [0.011, 0.0074, 0.047],
    // The crest of FIST_SECTION is at (0.30 * 0.045, 1.00 * 0.047) = (0.0135,
    // 0.047) plus the fist's own offset. This sits 0.006 inside that.
    offset: [0.0130, 0.0432, 0.003],
    stations: [
      // The dips were 0.42 against a 1.00 crest to begin with. That is a real
      // knuckle row's proportion on a bare hand, and on a GLOVED one it came
      // out as a sawtooth: the trim line along the crest turned every valley
      // into a spike. A glove fills the gaps in, so the ridge only has to
      // undulate, not break.
      { z: -0.86, offset: [0, 0], scale: [0.44, 0.42] },
      { z: -0.70, offset: [0, 0], scale: [1.00, 1.00] },
      { z: -0.46, offset: [0, 0], scale: [0.76, 0.68] },
      { z: -0.23, offset: [0, 0], scale: [1.00, 1.04] },
      { z: 0.00, offset: [0, 0], scale: [0.76, 0.68] },
      { z: 0.24, offset: [0, 0], scale: [0.96, 0.98] },
      { z: 0.48, offset: [0, 0], scale: [0.74, 0.66] },
      { z: 0.71, offset: [0, 0], scale: [0.86, 0.88] },
      { z: 0.86, offset: [0, 0], scale: [0.42, 0.40] },
    ],
    // A thin lit line along the crest. Without it the hand is a silhouette with
    // nothing inside it at the size it actually occupies in frame - the ridge
    // is there, but at night there is no light on it to see it by.
    trim: { crease: 0, radius: 0.0024, radialSegments: 5 },
  },

  // The thumb lies ACROSS the top of the grip, running outward and forward,
  // which is what closes the hand. It starts INSIDE the fist - 0.042 from the
  // grip axis against a section that is never closer than 0.042 - so it grows
  // out of the mass instead of floating beside it.
  thumb: {
    offset: [-0.030, 0.030, 0.014],
    direction: [0.70, -0.30, -0.62],
    length: 0.044,
    radius: 0.0118,
    taper: 0.82,
    segments: 12,
  },

  // Forearm. Three things must hold at once or it stops reading as an arm:
  // thinner than the grip; pointed mostly BACK rather than down, so it
  // foreshortens instead of sweeping across the frame; and long enough to leave
  // the bottom of the screen at every field of view, since an arm ending in mid
  // air reads as a floating block. Keep the inward component small or the arms
  // walk across the instrument panel and the nose of the bike.
  forearm: {
    offset: [-0.040, 0.004, 0.030],
    direction: [-0.14, -0.45, 0.88],
    length: 0.34,
    radius: 0.021,
    flare: 1.22, // wider toward the elbow
    segments: 16,
  },

  // The lit band that ends the glove. A BAND, not a gauntlet: the open end
  // points back up the arm, which from this camera means straight at the eye,
  // so anything with length reads as a funnel you can see down the inside of.
  cuff: {
    offset: [-0.046, -0.010, 0.066],
    direction: [-0.14, -0.45, 0.88],
    radius: 0.025,
    width: 0.008,
    segments: 20,
  },
};
