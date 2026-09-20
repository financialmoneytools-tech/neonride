/**
 * NEON RIDE - vehicle SHAPES.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. config/traffic.js spreads these into its types, so
 * a type is still one object at runtime.
 *
 * ================= WHY THE SHAPES LEFT config/traffic.js =================
 *
 * That file is the traffic MODEL - density, spacing, the escape lane, the
 * car following that stops vehicles driving through each other - and every
 * one of those numbers was measured. It was already 485 lines. Putting eight
 * silhouettes in it would bury the invariants under the styling, and the
 * styling is the part that gets fiddled with.
 *
 * ================= HOW A SHAPE IS WRITTEN =================
 *
 * `profile` is the SIDE VIEW, `[z, y]` per point, where +z is the vehicle's
 * REAR and y is measured from the body's own origin - which sits half the
 * type's `size.height` above the road, plus its `rideHeight`. So the road is
 * at `-size.height / 2 - rideHeight` and an underside written above that is
 * the gap the wheels show through.
 *
 * `cabin` is a SECOND extrusion, narrower, sitting on the body. Two
 * extrusions rather than one profile with a width taper, because a taper
 * applied inside one shape creases the flank along the fan - and a car's
 * flank is the flattest panel on it. The greenhouse is where the rake lives:
 * the windscreen, the roof and the rear screen falling onto the boot lid are
 * four points of the cabin profile and they are the whole read of a car from
 * behind.
 *
 * Triangles are 4 per profile point. Nothing here needs to be smooth; it
 * needs to be RIGHT at ten metres, which is where the rider spends the run.
 */

export const vehicles = {
  // A saloon. The lower body is deliberately flat sided and almost straight -
  // all the shape is in the greenhouse and the wheels.
  sedan: {
    profile: [
      [-2.35, -0.22], [-2.28, 0.10], [-1.62, 0.24], [-0.62, 0.30],
      [1.50, 0.32], [2.18, 0.28], [2.35, 0.14], [2.35, -0.22],
    ],
    cabin: {
      widthScale: 0.84,
      points: [
        [-0.62, 0.30], [-0.04, 0.84], [0.86, 0.86], [1.52, 0.38], [1.52, 0.30],
      ],
    },
    wheels: {
      radius: 0.34, width: 0.24, inset: 0.09, axles: [-1.48, 1.44],
      color: 0x0a0a0d,
      arch: { height: 0.2, spread: 0.18, out: 0.004, thickness: 0.03, color: 0x15151c },
    },
    // A boot lid needs a lip or the rear is one unbroken face. Low, and it is
    // also what the plate sits under.
    rear: {
      bumper: { height: 0.16, depth: 0.14, y: -0.12, widthScale: 0.9, color: 0x15151c },
      // The plate goes in the TAIL geometry, whose vertex colours are absolute
      // - the body mesh would multiply it by the car's paint and a white plate
      // would come out red on a red car.
      plate: { width: 0.44, height: 0.15, x: 0, y: -0.06, color: 0xdfe6ee },
      recess: { width: 0.56, height: 0.23, y: -0.06, depth: 0.05, color: 0x101016 },
    },
  },

  // A tall slab with a raked screen at the front and a flat back. Its whole
  // job is to be the tall one, so nothing softens the roof line.
  van: {
    profile: [
      [-2.60, -1.05], [-2.52, -0.42], [-2.16, 0.80], [-1.72, 1.24],
      [2.60, 1.24], [2.60, -1.05],
    ],
    wheels: {
      radius: 0.38, width: 0.26, inset: 0.09, axles: [-1.7, 1.62],
      color: 0x0a0a0d,
      arch: { height: 0.24, spread: 0.2, out: 0.004, thickness: 0.03, color: 0x15151c },
    },
    rails: { out: 0.62, height: 0.07, thickness: 0.08, from: -1.5, to: 2.35, color: 0x16161d },
    doors: { seam: 0.05, depth: 0.035, top: 1.1, bottom: -0.72, hinges: 3, inset: 0.18,
      hingeWidth: 0.26, color: 0x101016 },
    rear: {
      bumper: { height: 0.18, depth: 0.14, y: -0.86, widthScale: 0.92, color: 0x15151c },
      plate: { width: 0.44, height: 0.15, x: 0, y: -0.62, color: 0xdfe6ee },
      recess: { width: 0.56, height: 0.23, y: -0.62, depth: 0.05, color: 0x101016 },
    },
  },

  // Raised, NARROW and upright. Against the van it has to stay obviously
  // thinner and obviously shorter in the body, or the two are one vehicle at
  // two scales - which is what config/traffic.js already warns about.
  jeep: {
    profile: [
      [-2.15, -0.78], [-2.08, -0.16], [-1.58, 0.02], [-1.38, 0.82],
      [2.15, 0.82], [2.15, -0.78],
    ],
    wheels: {
      radius: 0.42, width: 0.28, inset: 0.05, axles: [-1.34, 1.36],
      color: 0x0a0a0d,
      arch: { height: 0.26, spread: 0.24, out: 0.006, thickness: 0.04, color: 0x15151c },
    },
    rails: { out: 0.56, height: 0.07, thickness: 0.08, from: -1.2, to: 1.95, color: 0x16161d },
    doors: { seam: 0.05, depth: 0.035, top: 0.7, bottom: -0.5, hinges: 2, inset: 0.16,
      hingeWidth: 0.24, color: 0x101016 },
    rear: {
      bumper: { height: 0.16, depth: 0.14, y: -0.6, widthScale: 0.94, color: 0x15151c },
      plate: { width: 0.4, height: 0.14, x: 0, y: -0.38, color: 0xdfe6ee },
      recess: { width: 0.52, height: 0.22, y: -0.38, depth: 0.05, color: 0x101016 },
    },
  },

  // A box body over a LOWER cab, and that step in the roofline is the whole
  // read - it is legible at a hundred metres, long before any light is.
  // The cab is a separate bite out of the profile rather than a taper, so the
  // windscreen rakes and the box front stands square behind it.
  ambulance: {
    profile: [
      [-2.95, -0.55], [-2.88, 0.04], [-2.50, 0.30], [-1.98, 0.74],
      [-1.32, 0.76], [-1.18, 2.13], [2.95, 2.13], [2.95, -0.55],
    ],
    wheels: {
      radius: 0.42, width: 0.28, inset: 0.1, axles: [-1.9, 1.75],
      color: 0x0a0a0d,
      arch: { height: 0.24, spread: 0.2, out: 0.004, thickness: 0.03, color: 0x2a2d34 },
    },
    doors: { seam: 0.06, depth: 0.04, top: 1.9, bottom: -0.2, hinges: 3, inset: 0.2,
      hingeWidth: 0.3, color: 0x3a3f48 },
    rear: {
      bumper: { height: 0.18, depth: 0.15, y: -0.42, widthScale: 0.92, color: 0x2a2d34 },
      plate: { width: 0.44, height: 0.15, x: 0, y: -0.2, color: 0xdfe6ee },
    },
  },

  // A cab and a cargo body, with a real notch between them. A box truck is
  // two objects on one chassis and the notch is what says so; the old shape
  // was one box with a lip on it and read as a crate.
  boxTruck: {
    profile: [
      [-4.30, -1.00], [-4.24, -0.30], [-3.88, 0.02], [-3.30, 0.96],
      [-2.62, 0.98], [-2.48, 0.34], [-2.30, 0.34], [-2.30, 2.60],
      [4.30, 2.60], [4.30, -1.00],
    ],
    skirts: { from: -1.6, to: 3.6, top: -0.5, bottom: -1.0, out: 0.06,
      thickness: 0.05, color: 0x101016 },
  },

  // A TRACTOR AND A TRAILER, with the gap between them visible. Sixteen
  // metres of one unbroken box is the single least truck-like thing in the
  // fleet; the dip behind the cab is what the eye reads as articulation.
  semi: {
    profile: [
      [-8.00, -1.45], [-7.92, -0.72], [-7.52, -0.30], [-6.92, 1.20],
      [-5.94, 1.25], [-5.72, -0.20], [-5.00, -0.20], [-5.00, 1.65],
      [8.00, 1.65], [8.00, -1.45],
    ],
    skirts: { from: -3.4, to: 6.2, top: -0.85, bottom: -1.45, out: 0.06,
      thickness: 0.05, color: 0x101016 },
  },

  // ================= THE BUS =================
  //
  // The eighth type, and the one the fleet had no equivalent of: long, tall,
  // FLAT SIDED and slow. A semi is longer and a box truck is as tall, but
  // both are hardware - wheels, flaps, skirts, a notch behind the cab - and a
  // bus is a single smooth volume with a band of glass down it. That band is
  // its entire read. A slab this long with no glass in it is a shipping
  // container, which is what it would be without the flank panels below.
  //
  // The doors are on ONE side, the right, because they face the kerb. That is
  // not decoration: it is the detail that makes a bus passed on the left look
  // different from the same bus passed on the right, and the rider does both.
  bus: {
    profile: [
      [-5.75, -1.15], [-5.70, -0.55], [-5.58, -0.28], [-5.18, 1.33],
      [-4.86, 1.52], [5.54, 1.52], [5.75, 1.32], [5.75, -1.15],
    ],
    wheels: {
      radius: 0.46, width: 0.3, inset: 0.1, axles: [-3.9, 3.5],
      color: 0x0a0a0d,
      arch: { height: 0.26, spread: 0.22, out: 0.004, thickness: 0.04, color: 0x15151c },
    },
    flanks: [
      // The window band. Dark, because at night a bus's glass is darker than
      // its paint unless the interior is lit, and a pale band would read as a
      // white stripe rather than as windows.
      { from: -4.9, to: 5.3, top: 1.16, bottom: 0.34, out: 0.01,
        thickness: 0.04, color: 0x12161d },
      // Two kerbside doors, cut through the band down to the sill.
      { from: -4.75, to: -3.85, top: 1.16, bottom: -0.62, out: 0.005,
        thickness: 0.05, color: 0x0d1016, side: 'right' },
      { from: 1.15, to: 2.05, top: 1.16, bottom: -0.62, out: 0.005,
        thickness: 0.05, color: 0x0d1016, side: 'right' },
    ],
    roofPods: [
      { z: -2.6, length: 2.2, width: 1.5, height: 0.16, color: 0x16161d },
      { z: 2.4, length: 1.6, width: 1.3, height: 0.14, color: 0x16161d },
    ],
    doors: { seam: 0.05, depth: 0.035, top: 1.1, bottom: 0.0, hinges: 0, inset: 0.2,
      hingeWidth: 0.26, color: 0x12161d },
    rear: {
      bumper: { height: 0.2, depth: 0.15, y: -0.95, widthScale: 0.94, color: 0x15151c },
      plate: { width: 0.44, height: 0.15, x: 0, y: -0.74, color: 0xdfe6ee },
      recess: { width: 0.56, height: 0.23, y: -0.74, depth: 0.05, color: 0x101016 },
    },
  },
};
