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
    // Speed. The number on the dial is not what makes a ride feel fast - what
    // does is how much motion crosses the frame per second - but a low ceiling
    // caps every other cue, so this comes first. Drag is what actually sets the
    // top speed: solve dragQuadratic * v^2 + dragLinear * v = acceleration.
    maxSpeed: 235, // units per second at full throttle
    startSpeed: 120,
    acceleration: 52, // units per second squared at full throttle
    brakeForce: 96,
    dragQuadratic: 0.00073, // tops out around 235
    dragLinear: 0.05,
    // Throttle applied when the rider is not touching anything, so the ride
    // never stalls while the cockpit is being tuned. Set to 0 for a real stop.
    throttleFloor: 0.42,
    gears: 6, // fake gear count, only the rev counter uses it

    lateralLimit: 5.4, // how far off the centre line the bike may drift
    lateralSpeed: 13, // units per second of drift at full steer and full speed
    lateralReturnTau: 0.5, // seconds to ease back to the centre with no steer
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
    // The field of view and its ramp are per aspect now; see config/framing.js.
    fovTau: 0.55, // seconds for the field of view to follow a speed change

    // Which camera profile is in use. The NUMBERS are in config/framing.js,
    // one set per aspect, because the same offsets do not compose at 16:9 and
    // at 9:16 - see the note at the top of that file. This is the selector and
    // nothing else; the V key cycles it at runtime.
    profile: 'ride',

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

    // Speed shake. Noise driven rather than random per frame, or it strobes
    // instead of shaking. The exponent keeps it out of the way at cruise and
    // brings it in near the top of the range: at 2.0 half speed is a quarter of
    // the amplitude. Raise `amount` past about 0.06 and it stops reading as
    // speed and starts reading as a loose handlebar.
    shake: {
      amount: 0.03, // world units of translation at full speed
      exponent: 2.0,
      frequency: 11, // Hz of the underlying noise
      roll: 0.006, // radians of roll at full speed
    },
  },

  rider,
};
