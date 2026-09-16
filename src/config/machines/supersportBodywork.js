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

// Fuel tank: a flat top with a crease down its spine, hard shoulders where the
// top turns into the flanks, and a keel. Symmetric, built once on the
// centreline. It is the one panel a rider looks straight down at, so the top
// plane is wide and the creases either side of it are what catch the key.
export const TANK_SECTION = [
  [0.00, 1.00, 1], // spine
  [0.55, 0.88, 1], // shoulder, where the top plane turns down
  [0.95, 0.30, 1], // flank
  [0.80, -0.55, 1], // lower edge
  [0.00, -0.95, 0], // keel, under the rider's knees and never seen
  [-0.80, -0.55, 1],
  [-0.95, 0.30, 1],
  [-0.55, 0.88, 1],
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
// A cluster surround, and wings that sweep out from it toward the hands.
//
// It was four panels a side reaching from the centreline out to the grips and
// down past the bars - measured, 20.5 per cent of a 16:9 frame and 41 per cent
// of its lower half, with its top edge 62 per cent down the frame and its
// lowest point at y -0.320 against a bar line at about -0.03. That is not what
// a fairing looks like from a saddle; it is what a wall looks like. The `flank`
// and `shoulder` panels are gone entirely and the wing is roughly half its
// former height.
//
// The first cut at this went too far the other way - 2.3 per cent of a 16:9
// frame and 4.4 of its lower half, which is not a fairing either, it is a chip
// of red under the cluster. Between a wall and nothing there is a fairing, and
// it is the one the references show: wings sweeping out from beside the screen
// toward the hands, and stopping there. Measured target for this pass was 5 to
// 6 per cent of the frame and 11 to 13 of its lower half.
//
// The rule that replaced the tuning: NOTHING below the bar line. The triple
// clamp bottoms out at y -0.083, so every panel here stops above roughly -0.09,
// and what the camera sees below the bars is road.
export const fairing = {
  // The panel either side of the cluster. Authored for the right; the left is
  // the same section put through a mirror, which is NOT the same thing as
  // placing the right one at a negative x - see Fairing.js.
  //
  // Stations run rear to front, z +1 nearest the rider. Each one scales, shifts
  // and rolls the section; the roll turning from positive to negative through
  // the middle is what stops the wing reading as an extrusion.
  wing: {
    section: WING_SECTION,
    // radii are the half extents the section and the spine are scaled to, and
    // three passes have been spent on them. Broad and shallow, not long and
    // thin: the panel was once three times longer than it was tall and pointed
    // away from the eye, so it foreshortened into a lump standing beside the
    // cluster like an ear. A fairing top seen from the saddle is the opposite -
    // wide across the frame, shallow, only as long as it needs to reach the
    // screen.
    //
    // The half height of 0.067 puts the bottom edge at -0.076, which IS the bar
    // line: the triple clamp, scaled with the rest of the hardware, bottoms out
    // at -0.076 too. Nothing hangs below it. The half width of 0.167 about
    // x 0.158 sends it OUT past where the grips start and under the hands,
    // which is where a fairing goes - it is much wider than the bars.
    //
    // Both grew by about a quarter when the bar assembly was scaled down and
    // the 16:9 profile pushed out. That is not a change to how the panel looks:
    // those two took its measured share of the frame from 5.9 per cent to 3.2
    // as a side effect, and this puts it back. Move hardwareScale or the 16:9
    // riderOrigin and this has to move with them.
    radii: [0.167, 0.067, 0.210],
    // Pushed forward from -0.095. The wings reached back to z +0.115, which is
    // level with the rider's knees and exactly where the tank has to be seen -
    // so the bottom of every frame was fairing, and the tank, which is the
    // nearest part of the bike, was behind it. A fairing surrounds the cluster
    // and stops; it does not come back to the saddle.
    offset: [0.158, -0.009, -0.190],
    rotation: [0.12, -0.34, -0.16],
    stations: [
      { z: 1.00, offset: [-0.08, -0.06], scale: [0.40, 0.44], roll: 0.14 },
      { z: 0.46, offset: [-0.02, -0.02], scale: [0.90, 0.92], roll: 0.06 },
      { z: 0.02, offset: [0.02, 0.01], scale: [1.00, 1.00], roll: -0.02 },
      { z: -0.50, offset: [0.03, 0.03], scale: [0.88, 0.86], roll: -0.09 },
      { z: -1.00, offset: [0.00, 0.02], scale: [0.50, 0.56], roll: -0.15 },
    ],
    // One opening, not two. Ranges are half open and index the SECTION EDGES -
    // edge 0 runs from section point 0 to point 1 - and edge 7 is the inner
    // shoulder, which is the face this camera actually sees: the rider sits
    // inboard of and above the wing, so the outer flank, where the gills go on
    // a real bike, points away and measured zero pixels of the frame.
    // depth is in rider units, along the panel's own normal.
    vents: [
      { edgeFrom: 7, edgeTo: 8, stationFrom: 1, stationTo: 2, depth: 0.017 },
    ],
    // A bright line laid along a crease, the same trick the tank seam uses: a
    // dark panel against a dark road needs a line on it to be seen. The index
    // is a section point, so the strip is on the edge by construction and
    // cannot drift off it when either one is tuned.
    trim: { crease: 0, radius: 0.0062, radialSegments: 6 },
  },

  // The centre section, under the screen and carrying the cluster. Built once
  // on the centreline from a symmetric section, so it is not mirrored at all.
  // No vents: the cluster covers most of it.
  nose: {
    section: NOSE_SECTION,
    radii: [0.109, 0.050, 0.196],
    offset: [0, -0.026, -0.172],
    rotation: [0.28, 0, 0],
    stations: [
      { z: 1.00, offset: [0, -0.02], scale: [0.72, 0.80], roll: 0 },
      { z: 0.30, offset: [0, 0.00], scale: [1.00, 1.00], roll: 0 },
      { z: -0.40, offset: [0, 0.02], scale: [0.86, 0.80], roll: 0 },
      { z: -1.00, offset: [0, 0.00], scale: [0.50, 0.46], roll: 0 },
    ],
  },
};

// Bubble screen. THE FURTHEST FORWARD PART OF THE COCKPIT, and therefore the
// smallest thing in it.
//
// It has been wrong in both directions. It began as a narrow egg hiding between
// the mirrors; the correction widened it AND pulled it in from 0.62 to 0.47 of
// the eye, which fixed the width by making the screen the nearest object on the
// bike. It then covered the cluster, the bars and the road - 43 per cent of the
// frame across and 53 down, a yellow wall with the whole cockpit behind it.
//
// Both mistakes were the same mistake: sizing the screen against other parts of
// the FRAME instead of placing it in DEPTH. A windscreen is bolted to the nose,
// ahead of everything, and a thing that far away is small. So it is placed
// first - 0.315 ahead of the rig origin, the furthest part of the cockpit - and
// its size follows from the distance rather than from what it ought to cover.
//
// Measured, it spans 42 to 58 per cent across and 45 to 58 down, which clears
// the top of the cluster at 60 and is nowhere near the bars or the hands.
export const screen = {
  radii: [0.153, 0.086, 0.015],
  offset: [0, 0.208, -0.315],
  rotation: [-0.62, 0, 0],
  segments: [22, 12],
  // The lit edge is what actually reads at night; the panel behind it is
  // nearly black.
  //
  // It traces the screen's own outline. Built as a unit circle and scaled to
  // `radii`, because the screen is an ellipse and a torus is not: at a fixed
  // radius the ring either cut through the panel or floated well outside it,
  // and the taller the screen got the worse that was.
  //
  // It no longer carries its own copy of offset and rotation. The two copies
  // were identical and had to stay identical - a ring placed anywhere but on
  // the panel is not an edge - so every change to the screen was a change that
  // had to be made twice, correctly, or the lit outline came adrift from the
  // glass. buildScreen reads the screen's own placement instead.
  edge: { tube: 0.0045, segments: [36, 6] },
};
