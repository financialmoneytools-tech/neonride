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

// The grip is 0.0245 in radius and its ribs stand at 0.0265. Every point of the
// fist shell, at every station, stays outside that - measured, not hoped.
//
// Three numbers were wrong the first time and all three read on screen as the
// same complaint, that the hand is a set of lobes rather than a fist:
//
//   WIDTH   0.094 of hand on a 0.137 grip left 16 per cent of lit, cyan rimmed
//           tube sticking out of each end of a near black fist. Now 0.125, so
//           only the bar end weight shows past it.
//   HEIGHT  the fist rose 0.051 above the grip axis - 2.1 times the grip's own
//           radius, against about 3 on a real hand. It read as a sleeve pulled
//           over the bar rather than a hand closed round it.
//   THUMB   its tip ended 0.0215 from the axis and the grip surface is at
//           0.0245, so the last 12.6 mm of a 44 mm thumb was INSIDE the tube.
//           The one element that says the hand is gripping rather than resting
//           on top was the one element buried.

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
    radii: [0.056, 0.062, 0.0625],
    // Sat a touch above and behind the grip axis, the way a fist on a bar
    // actually sits - the bar runs through the hollow of the fingers, not
    // through the middle of the hand.
    offset: [0, 0.004, 0.003],
    // Stations run inboard to outboard along the grip. The four knuckles are
    // the swollen ones and the dips between them are the gaps between fingers,
    // so the top silhouette undulates four times - which is the whole of what
    // reads as a row of knuckles at this distance.
    // The two end stations close the hand by FLATTENING it - scaled hard in y,
    // barely in x. Shrinking them evenly is the obvious way to taper a loft
    // shut and it is the one way that cannot work here: the section is wrapped
    // round a tube, so scaling it toward its own centre drives it into the
    // grip. Flattening pulls the top and bottom in while the front and back
    // stay out past the tube, which closes the silhouette and stays clear.
    stations: [
      { z: -1.00, offset: [0, -0.03], scale: [0.90, 0.56] }, // wrist end
      { z: -0.70, offset: [0, 0.03], scale: [1.00, 1.04] }, // index knuckle
      { z: -0.46, offset: [0, -0.01], scale: [0.96, 0.95] },
      { z: -0.23, offset: [0, 0.03], scale: [1.00, 1.05] }, // middle knuckle
      { z: 0.00, offset: [0, -0.01], scale: [0.96, 0.95] },
      { z: 0.24, offset: [0, 0.02], scale: [0.99, 1.02] }, // ring knuckle
      { z: 0.48, offset: [0, -0.02], scale: [0.94, 0.93] },
      { z: 0.71, offset: [0, 0.00], scale: [0.95, 0.94] }, // little knuckle
      { z: 1.00, offset: [0, -0.04], scale: [0.86, 0.52] }, // outboard end
    ],
  },

  // Laid along the crest of the fist section, sunk far enough that only its
  // crown stands proud. Its stations swell at each knuckle and pinch hard
  // between them, which is what makes one ridge read as four knuckles.
  knuckleRidge: {
    section: RIDGE_SECTION,
    radii: [0.013, 0.0090, 0.0625],
    // OFFSETS HERE ARE IN THE ANCHOR FRAME, not in the loft's own: [along the
    // grip, up, back at the rider]. The first version read the same three
    // numbers as [forward, up, along], which slid the ridge 16 mm outboard and
    // left it sitting at the top-BACK of the fist instead of on the crest,
    // 8 mm under the surface. Only a sliver of it came through, which is why
    // the knuckle line was faint rather than absent.
    //
    // The crest of FIST_SECTION is loft (0.30 * 0.056, 1.00 * 0.062), which
    // after the quarter turn and the fist's own offset is anchor (any, 0.066,
    // -0.0138), 0.0674 from the grip axis. This sits 6 mm inside that, along
    // the same direction, so only the crown stands proud.
    offset: [0, 0.0601, -0.0126],
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

  // The thumb crosses the hand diagonally: from the inboard back, up over the
  // crest, and away forward and outboard. That crossing is the whole point.
  //
  // It has now been wrong three times and the three failures are worth keeping,
  // because each one looked identical on screen - no thumb at all - for a
  // different reason:
  //
  //   1. Aimed at the bar. Its tip ended 0.0215 from the grip axis against a
  //      grip surface at 0.0245, so a third of it was inside the tube.
  //   2. Pulled clear of the tube, then the fist was widened and raised around
  //      it. Centreline at 0.041, shell now at 0.062: buried in the hand.
  //   3. Laid along the top FRONT crease at the right distance. The camera is
  //      above and BEHIND the hand, so the front face is the far side and the
  //      crest occluded the whole thumb.
  //
  // What it needed was not a distance but a path. The points below run along
  // the shell's own surface, about 6 mm inside it, so the top half of the tube
  // stands proud the whole way; and they cross from the back face to the front
  // one, so wherever the camera is, part of the thumb is on the near side.
  // Closest approach to the grip axis is 0.059, which is 32 mm of clearance -
  // this one cannot go back inside the bar.
  thumb: {
    path: [
      [-0.062, 0.048, 0.034], // inboard, on the face the rider sees
      [-0.030, 0.060, 0.004], // over the crest
      [0.004, 0.052, -0.032], // away forward, toward the fingers
    ],
    radius: 0.0125,
    taper: 0.80, // tip radius as a fraction of the base
    segments: 12,
  },

  // Forearm. Three things must hold at once or it stops reading as an arm:
  // thinner than the grip; pointed mostly BACK rather than down, so it
  // foreshortens instead of sweeping across the frame; and long enough to leave
  // the bottom of the screen at every field of view, since an arm ending in mid
  // air reads as a floating block. Keep the inward component small or the arms
  // walk across the instrument panel and the nose of the bike.
  forearm: {
    offset: [-0.046, 0.004, 0.034],
    direction: [-0.14, -0.45, 0.88],
    length: 0.34,
    radius: 0.022,
    // Was 1.22. A cylinder cap is flat, and the far one was catching the rim as
    // a hard purple ellipse in the bottom corner of the frame - a flat disc
    // hanging in the dark, reading as one more loose lobe. It is rounded off
    // now, in GlovedFist.js, and flares less, so what leaves the frame is an
    // arm rather than the end of a pipe.
    flare: 1.08,
    segments: 16,
  },

  // The lit band that ends the glove. A BAND, not a gauntlet: the open end
  // points back up the arm, which from this camera means straight at the eye,
  // so anything with length reads as a funnel you can see down the inside of.
  cuff: {
    offset: [-0.052, -0.012, 0.070],
    direction: [-0.14, -0.45, 0.88],
    radius: 0.0265,
    width: 0.008,
    segments: 20,
  },
};
