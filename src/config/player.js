import { rider } from './rider.js';

/**
 * NEON RIDE - bike behaviour and the riding camera.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 */

// --- Bike and rider ---
export const player = {
  // Longitudinal motion, drift across the road, and lean.
  bike: {
    startDistance: 200, // one chunk in, so a chunk always sits behind us
    maxSpeed: 108, // units per second at full throttle
    startSpeed: 58,
    acceleration: 26, // units per second squared at full throttle
    brakeForce: 52,
    dragQuadratic: 0.0022, // what actually sets the top speed
    dragLinear: 0.05,
    // Throttle applied when the rider is not touching anything, so the ride
    // never stalls while the cockpit is being tuned. Set to 0 for a real stop.
    throttleFloor: 0.42,
    gears: 6, // fake gear count, only the rev counter uses it

    lateralLimit: 5.4, // how far off the centre line the bike may drift
    lateralSpeed: 8.5, // units per second of drift at full steer and full speed
    lateralReturnTau: 1.4, // seconds to ease back to the centre with no steer
    lateralTau: 0.35, // drift smoothing

    // Lean is the camera roll. leanMax is the hard cap the brief asks for:
    // 0.14 rad is 8 degrees.
    leanMax: 0.14,
    leanFromSteer: 0.115,
    leanFromCurve: 1.35, // radians of lean per radian per second of heading change
    leanTau: 0.24,
    curveTau: 0.3, // smoothing on the measured heading rate
  },

  camera: {
    height: 2.35, // above the road surface
    lookAhead: 22, // the camera aims at the road this far ahead
    fovMax: 88, // core.camera.fov (75) is the low speed end of the range
    fovTau: 0.55, // seconds for the field of view to follow a speed change

    // Bobbing. Amplitudes are in world units and radians; the defaults are
    // deliberately small. Raising `vertical` past about 0.08 starts to read as
    // seasickness rather than as a motorcycle.
    bob: {
      frequency: 2.05, // Hz at full speed
      vertical: 0.032,
      lateral: 0.016,
      roll: 0.0075, // radians, about 0.43 degrees
      floor: 0.22, // fraction of the amplitude still present at a standstill
    },
  },

  rider,
};
