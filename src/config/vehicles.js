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
};
