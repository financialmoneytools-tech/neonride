/**
 * NEON RIDE - the supersport below the bar line.
 * Part of the single configuration surface; import from ../../config.js, never
 * from this file directly. Merged into the machine definition by
 * ./supersport.js and reached as config.player.rider.machine.lower.
 *
 * Split out of supersport.js because the two together pass the project's 300
 * line limit, and the seam is a real one: everything here is only ever seen
 * from the CINEMATIC camera profile and from the bottom of a 9:16 frame. The
 * cockpit above the bar line is seen constantly and is tuned against a much
 * closer eye.
 *
 * Rider space, same as everywhere else in the rig: origin at the handlebar
 * clamp, +X right, +Y up, -Z forward. The front wheel turns about +X.
 *
 * WHY THIS EXISTS AT ALL. The fender and the "wheel" used to be two bare arcs -
 * a cylinder cut down to its top and laid on its side - on the assumption that
 * nothing below the fender ever reaches the frame. Measured, that assumption
 * holds at 16:9 and fails at 9:16: with the tall profile's 90 degree resting
 * field of view and its lower eye, every sample point on the wheel lands inside
 * the frustum and three quarters of them are unobstructed by bodywork. The
 * vertical frame is the one the footage is cut for, so the part that is only
 * visible there is not the part to leave unbuilt.
 */

// The axle. Everything round on the front end is concentric with this, so it is
// named once and the parts below are all offsets from it.
const AXLE = [0, -0.478, -0.452];

export const lower = {
  axle: AXLE,

  // --- Fork ----------------------------------------------------------------
  //
  // Upper stanchion, then the fatter slider below it, then the parts that make
  // the join read as a fork rather than as two cylinders of different widths:
  // a dust seal at the mouth of the slider and a lug at the bottom carrying the
  // axle. The seal is the detail that does the most work for its cost - it is
  // the bright ring every photograph of a fork has, and without it the step
  // from stanchion to slider looks like a modelling mistake.
  fork: {
    stanchion: {
      from: [0.086, -0.078, -0.018],
      to: [0.099, -0.222, -0.096],
      radius: 0.019,
      radialSegments: 14,
    },
    slider: {
      from: [0.099, -0.210, -0.090],
      to: [0.110, -0.452, -0.218],
      radius: 0.026,
      radialSegments: 14,
    },
    // Ring at the mouth of the slider, where the stanchion disappears into it.
    seal: {
      offset: [0.099, -0.212, -0.091],
      radius: 0.0295,
      length: 0.014,
      segments: 16,
    },
    // The lug that carries the axle, reaching down and forward from the bottom
    // of the slider. Two tubes rather than a box: a box here reads as a bracket
    // bolted on, and a fork lug is cast in one piece with the slider.
    lug: {
      from: [0.110, -0.450, -0.216],
      to: [0.106, -0.478, -0.252],
      radius: 0.023,
      endRadius: 0.019,
      radialSegments: 12,
    },
    // Stub of axle showing outboard of the lug.
    axleStub: {
      radius: 0.011,
      from: 0.092, // x of the inner end
      to: 0.124, // x of the outer face
      segments: 12,
    },
  },

  // --- Fender --------------------------------------------------------------
  //
  // A creased panel, not a bent sheet. The cross section below runs ACROSS the
  // fender - from one lower edge, over the spine, to the other - and is swept
  // around the arc. Hard points give it the same language as the fairing: a
  // crease down the spine and a defined edge where the panel stops, instead of
  // a tube cut in half.
  //
  // [x across, height above the arc radius, hard]
  fender: {
    centre: AXLE,
    // Wider and heavier than a race fender, which is what the reference has:
    // at this camera the fender is one of the few parts read in silhouette
    // against the road, and a thin blade over a fat tyre reads as a bicycle.
    // It overhangs the tyre either side, the way a road fender does.
    radius: 0.212,
    // Starts well up the back of the wheel, not down behind it. The rider's
    // eye is above and behind the front tyre and looks straight into whatever
    // opening the fender leaves, so the rear edge is tucked up where the fork
    // and the bodywork cover it.
    thetaStart: 0.78,
    thetaLength: 1.94,
    segments: 20,
    thickness: 0.017,
    section: [
      [-0.078, -0.030, 1], // lower edge, one side
      [-0.070, 0.002, 1], // turn up onto the top plane
      [-0.040, 0.014, 0],
      [0.000, 0.021, 1], // spine, creased
      [0.040, 0.014, 0],
      [0.070, 0.002, 1],
      [0.078, -0.030, 1], // lower edge, the other side
    ],
    // Neon seam laid along the spine crease, the same trim the tank carries.
    seam: { width: 0.010, lift: 0.0045 },
    // Stays from the slider down to the fender edge, one pair per side.
    stay: {
      from: [0.104, -0.404, -0.196],
      to: [0.082, -0.404, -0.322],
      radius: 0.006,
      radialSegments: 8,
    },
  },

  // --- Wheel ---------------------------------------------------------------
  //
  // Lathed about the axle, so the tyre, the rim and the hub are all surfaces of
  // revolution and each costs one profile. Profiles are [radius, x] pairs and
  // are authored from the outboard face inward, which is the order that yields
  // outward normals.
  wheel: {
    centre: AXLE,
    segments: 28,

    // Tread across the crown, then a shoulder falling away to the bead. A
    // motorcycle tyre is round in section - that shoulder is what it rolls onto
    // in a corner - and flattening it is the single thing that makes a rendered
    // wheel look like a wheel from a spreadsheet.
    tyre: [
      [0.148, 0.048], // bead, outboard
      [0.172, 0.043],
      [0.186, 0.030],
      [0.191, 0.000], // crown
      [0.186, -0.030],
      [0.172, -0.043],
      [0.148, -0.048], // bead, inboard
    ],

    // The rim inside it, with a lip at each edge.
    rim: [
      [0.128, 0.044],
      [0.146, 0.046], // outer lip
      [0.146, 0.038],
      [0.128, 0.034],
      [0.128, -0.034],
      [0.146, -0.038],
      [0.146, -0.046], // inner lip
      [0.128, -0.044],
    ],

    hub: { radius: 0.036, halfWidth: 0.046, segments: 16 },

    // Five spokes, which is what most sport bikes wear and reads as a wheel at
    // a glance where three does not. Tapered, wider at the hub.
    spokes: {
      count: 5,
      innerRadius: 0.034,
      outerRadius: 0.130,
      innerWidth: 0.034,
      outerWidth: 0.020,
      thickness: 0.016,
    },

    // Brake disc and caliper, outboard on the right and mirrored to the left.
    // Small, dark and cheap, and the caliper is the part that says "front brake"
    // rather than "wheel with a plate on it".
    // A closed annulus, lathed like everything else round here. It was a
    // RingGeometry, which is a single sided disc with no edge: seen from the
    // side it vanished completely and the wheel had a hole through the middle
    // of it with the road showing through.
    disc: {
      // Small. At 0.122 it was all but the diameter of the rim, so it covered
      // the spokes and the hub and the wheel came out as a black plate with a
      // tyre round it. A disc is meant to sit well inside the rim with the
      // wheel visible around it.
      x: 0.052,
      outerRadius: 0.094,
      innerRadius: 0.044,
      halfThickness: 0.002,
      segments: 24,
    },
    caliper: {
      // Straddling the disc BEHIND the axle, not above it: above is where the
      // fender is, and a caliper buried inside a mudguard is geometry nobody
      // will ever see.
      offset: [0.056, -0.418, -0.342],
      size: [0.026, 0.064, 0.046],
      rotation: [-0.5, 0, 0],
    },

    // A ring of neon set inside the rim. Every other lit edge on this bike is
    // road-coloured; this is the one that spins, and a turning light is worth
    // more in a six second clip than another static line.
    // Thin, and it has to be. At a half width of 0.030 this was a 60mm barrel
    // of pure emissive inside the rim, and through the bloom it stopped being a
    // ring and became the wheel - a cyan disc with a tyre round it.
    glow: { radius: 0.120, width: 0.005, halfWidth: 0.011, segments: 28 },
  },
};
