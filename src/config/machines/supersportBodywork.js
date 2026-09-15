/**
 * NEON RIDE - the supersport's bodywork.
 * Part of the single configuration surface; import from ../../config.js, never
 * from this file directly. Reached as config.player.rider.machine.
 *
 * Split out of ./supersport.js because it grew past the size a file in this
 * project is allowed to be, and because it is one subject: everything painted,
 * plus the glass above it. The running gear - tank, fork, headlight, fender,
 * controls - stays next door.
 *
 * Rider space, as everywhere: origin at the handlebar clamp, +X right, +Y up,
 * -Z forward.
 */

// --- Panel sections ------------------------------------------------------
//
// Bodywork is lofted, not blobbed: one cross section swept through a list of
// stations. See utils/loft/ for the machinery. A point is [x, y] in a unit
// box, x outboard and y up, and a third entry of 1 marks it HARD - the two
// faces meeting there break into a crease instead of rolling into each other.
//
// Which points are hard IS the design. The reference shots read as sculpted
// because of four things, and three of them live in this list: a crease along
// the top of each wing, a defined edge where the panel stops, and faces flat
// enough between those edges to be planes rather than an ellipsoid's equator.
// The fourth is the vents, further down.

// Side panel: top crease, a flat outer face, and a hard lower edge where the
// wing simply ends. Listed clockwise seen from behind; loft/section.js works out
// which way the section runs on its own, so the order is only a convenience.
const WING_SECTION = [
  [0.10, 1.00, 1], // top crease - the ridge the trim strip is laid along
  [0.86, 0.62, 1], // outer shoulder, where the top plane turns down
  [1.00, -0.04, 0], // widest point of the outer face
  [0.82, -0.66, 1], // lower edge: the wing ENDS here, it does not roll under
  [0.06, -1.00, 1], // underside
  [-0.72, -0.74, 0], // inner underside, against the engine, never seen
  [-0.94, 0.00, 0], // inner face, against the tank
  [-0.50, 0.78, 1], // inner shoulder
];

// Centre section: a flat top for the cluster to sit on, a crease down each
// shoulder, and a keel. Symmetric, because this one is not mirrored - it is
// built once, on the centreline.
const NOSE_SECTION = [
  [0.00, 1.00, 0], // crown, rolling over the centreline
  [0.62, 0.80, 1], // shoulder crease, right
  [1.00, 0.10, 0],
  [0.74, -0.70, 1], // lower edge, right
  [0.00, -1.00, 0], // keel
  [-0.74, -0.70, 1], // lower edge, left
  [-1.00, 0.10, 0],
  [-0.62, 0.80, 1], // shoulder crease, left
];

// --- Paint -------------------------------------------------------------
//
// What separates a machine from a set of shapes. Body panels get a real
// colour with a gloss term, the way a painted surface behaves, rather than
// the flat graphite everything else wears.
// Measured the hard way: at a rim strength of 0.5 and this key, a panel this
// close to the camera stops being painted metal and becomes a flat red blob -
// the same failure the gloves had. Bodywork wants a dark base with the colour
// arriving mostly through the key, and a rim tight enough to stay an edge.
export const paint = {
  color: 0x5e121d, // deep race red
  ambient: 0x1d0a0e,
  key: 0xff9a86,
  // Raised from 0.85 once the panels became planes. On an ellipsoid the key
  // swept smoothly across the surface and the strength barely mattered; on
  // flat faces it is the ONLY thing separating one plane from the next, and
  // at 0.85 two faces a quarter turn apart were within a few per cent of each
  // other. This is what makes the creases visible at a distance.
  keyStrength: 1.05,
  rim: 0xff6a4a,
  rimStrength: 0.22,
  rimPower: 3.6,
};

// --- Fairing -----------------------------------------------------------
//
// The mass the cockpit was missing. From the saddle a supersport is mostly
// this: two wings sweeping out and forward either side of the screen, and a
// nose between them carrying the cluster. Without it the frame's lower half
// is empty road, which is exactly what the reference shots do not look like.
export const fairing = {
  // Swept panel either side. Authored for the right; the left is the same
  // section put through a mirror, which is NOT the same thing as placing the
  // right one at a negative x - see Fairing.js.
  //
  // radii are the half extents the section and the spine are scaled to, so
  // they mean what they meant when this was an ellipsoid. Tall enough to
  // reach the grips: a wing whose top sits well below the bar leaves a band
  // of road between bodywork and glove, and in the reference shots there is
  // none.
  //
  // The grip centre is at y 0.029, so a half height of 0.115 about y -0.075
  // takes the top edge to +0.04 - just past the hand - and the bottom to
  // -0.19, which is below the tank.
  //
  // Stations run rear to front, z +1 nearest the rider. Each one scales,
  // shifts and rolls the section; the roll turning from positive to negative
  // through the middle is what stops the wing reading as an extrusion.
  wing: {
    section: WING_SECTION,
    radii: [0.150, 0.115, 0.250],
    offset: [0.288, -0.074, -0.045],
    rotation: [0.14, -0.26, -0.30],
    // Six of them rather than four, and the two extra are there for the
    // vents: an opening can only be as short as the segment it is cut from,
    // and on four stations the shortest available was a third of the wing.
    stations: [
      { z: 1.00, offset: [-0.06, -0.10], scale: [0.30, 0.34], roll: 0.16 },
      { z: 0.52, offset: [-0.02, -0.03], scale: [0.82, 0.88], roll: 0.08 },
      { z: 0.16, offset: [0.01, 0.00], scale: [0.97, 0.99], roll: 0.03 },
      { z: -0.22, offset: [0.03, 0.02], scale: [1.00, 1.00], roll: -0.03 },
      { z: -0.58, offset: [0.02, 0.04], scale: [0.84, 0.82], roll: -0.10 },
      { z: -1.00, offset: [-0.02, 0.02], scale: [0.44, 0.50], roll: -0.16 },
    ],
    // Openings, not painted-on panels: the faces listed here are taken out of
    // the shell and replaced by a pocket, which is why they still read as
    // holes when the camera leans. Ranges are half open and index the SECTION
    // EDGES - edge 0 runs from section point 0 to point 1.
    //
    // WHICH edges took some finding, and the answer is not the one a side-on
    // photograph suggests. The gills on a real fairing are on the outer
    // flank, and from this camera the outer flank is the side facing away:
    // the rider sits inboard of and above the wing, so what fills the frame
    // is the INNER shoulder, edges 6 and 7, with the top crease as its
    // silhouette. Vents cut into the outer face were measured at exactly
    // zero pixels of the frame. These are where the eye actually is.
    //
    // Both openings are on the same edge with a station segment of bodywork
    // left between them, which is what a louvre pair on a real fairing is.
    // It also avoids the one arrangement that does not work: two pockets that
    // meet along a shared crease leave a divider with no thickness in it.
    // depth is in rider units, along the panel's own normal.
    vents: [
      // A pair of gills in the widest part of the panel, just under the trim.
      { edgeFrom: 7, edgeTo: 8, stationFrom: 1, stationTo: 2, depth: 0.020 },
      { edgeFrom: 7, edgeTo: 8, stationFrom: 3, stationTo: 4, depth: 0.018 },
    ],
    // A bright line laid along a crease, the same trick the tank seam uses: a
    // dark panel against a dark road needs a line on it to be seen. The index
    // is a section point, so the strip is on the edge by construction and
    // cannot drift off it when either one is tuned.
    trim: { crease: 0, radius: 0.0062, radialSegments: 6 },
  },

  // The lower flank, under the wing and outboard of the tank. This is what
  // takes the road out of the bottom corners.
  // Kept clear of the near plane the way the tank is: at this camera the
  // rearmost bodywork is only centimetres from the eye.
  flank: {
    section: WING_SECTION,
    radii: [0.128, 0.120, 0.200],
    offset: [0.250, -0.200, -0.010],
    rotation: [0.10, -0.16, -0.20],
    stations: [
      { z: 1.00, offset: [-0.05, -0.06], scale: [0.42, 0.46], roll: 0.12 },
      { z: 0.30, offset: [0.00, 0.00], scale: [0.96, 1.00], roll: 0.04 },
      { z: -0.40, offset: [0.02, 0.03], scale: [0.92, 0.86], roll: -0.06 },
      { z: -1.00, offset: [0.00, 0.04], scale: [0.50, 0.54], roll: -0.14 },
    ],
    vents: [
      { edgeFrom: 7, edgeTo: 8, stationFrom: 1, stationTo: 2, depth: 0.017 },
    ],
  },

  // Inner shoulder, filling the gap between the wing and the nose. No vents:
  // the hands and the screen cover most of it, so the triangles would be
  // spent on something nobody sees.
  shoulder: {
    section: WING_SECTION,
    radii: [0.112, 0.085, 0.180],
    offset: [0.120, -0.086, -0.130],
    rotation: [0.22, -0.16, -0.20],
    stations: [
      { z: 1.00, offset: [-0.04, -0.08], scale: [0.40, 0.44], roll: 0.14 },
      { z: 0.20, offset: [0.00, 0.00], scale: [1.00, 1.00], roll: 0.02 },
      { z: -1.00, offset: [0.00, 0.04], scale: [0.46, 0.52], roll: -0.12 },
    ],
  },

  // The nose, between the wings and under the screen. Built once on the
  // centreline from a symmetric section, so it is not mirrored at all.
  nose: {
    section: NOSE_SECTION,
    radii: [0.130, 0.082, 0.220],
    offset: [0, -0.112, -0.180],
    rotation: [0.28, 0, 0],
    stations: [
      { z: 1.00, offset: [0, -0.02], scale: [0.72, 0.80], roll: 0 },
      { z: 0.30, offset: [0, 0.00], scale: [1.00, 1.00], roll: 0 },
      { z: -0.40, offset: [0, 0.02], scale: [0.86, 0.80], roll: 0 },
      { z: -1.00, offset: [0, 0.00], scale: [0.50, 0.46], roll: 0 },
    ],
  },
};

// Bubble screen. Short and steeply raked, so it crosses the frame just above
// the cluster without hiding the road.
export const screen = {
  radii: [0.105, 0.085, 0.012],
  offset: [0, -0.012, -0.235],
  rotation: [-0.62, 0, 0],
  segments: [22, 12],
  // The lit edge is what actually reads at night; the panel behind it is
  // nearly black.
  edge: { radius: 0.104, tube: 0.0045, segments: [36, 6], offset: [0, -0.012, -0.235], rotation: [-0.62, 0, 0] },
};
