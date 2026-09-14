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
  // Which implementation createHands builds. 'primitive' is the geometry
  // described by everything below; a model backed set will ignore all of it
  // and read only the anchor.
  source: 'primitive',

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
