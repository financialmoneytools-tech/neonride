/**
 * NEON RIDE - control modes.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.controls.
 *
 * Two ways to ride a phone, chosen in the pause panel and remembered:
 *
 *   'tilt'  - steer by tilting, throttle and brake by holding a screen half.
 *   'touch' - steer by dragging the left thumb, throttle with the right.
 *
 * Desktop is untouched by all of it. The keyboard path in core/Input.js does
 * not consult any of this.
 */

export const controls = {
  // 'tilt' | 'touch'. What a phone gets before anyone chooses; a stored choice
  // always wins. Desktop ignores the mode entirely.
  defaultMode: 'tilt',
  // Written on every change, read once at load. Same shape as the comfort key.
  storageKey: 'neon-ride.controls',

  tilt: {
    // Degrees of tilt away from neutral for full lock. Smaller is twitchier.
    // Multiplied by the stored sensitivity below.
    range: 22,
    // Degrees either side of neutral that do nothing. A hand is never still,
    // and without this the bike wanders under a thumb that is not moving.
    deadZone: 2.5,
    // Multiplier on `range`, adjustable in the pause panel and stored with the
    // mode. Above 1 is gentler (a wider range for full lock), below 1 twitchier.
    sensitivity: 1,
    sensitivitySteps: [0.6, 0.8, 1, 1.3, 1.7],
    // Seconds of smoothing on the raw sensor before it becomes steering. The
    // accelerometer is noisy and Input's own steerSmoothing is tuned for a key
    // going down, not for a signal that jitters while being held still.
    tau: 0.09,
    // If no reading arrives within this long after the start tap, there is no
    // usable sensor and the mode falls back, saying which fault it was.
    timeout: 2, // seconds

    // Flips the steering direction. It exists because the one thing that can
    // still be wrong after all of this is a SIGN: iOS reports
    // accelerationIncludingGravity with the opposite polarity to Android, and
    // the neutral is captured by calibration, so an inverted axis does not
    // break tilt - it just steers the wrong way. One flag beats one edit.
    // TRUE, measured on the device: with it false, tilting left steered right.
    // The neutral is captured by calibration and the delta is what steers, so
    // an inverted axis never broke tilt - it just drove the wrong way, and one
    // flag was always going to be the fix.
    //
    // It is a single sign applied AFTER the screen rotation, so it is correct
    // in both landscape orientations by construction rather than by luck: 90
    // and 270 go through the same rotation and come out agreeing.
    // tools/smoke-mobile.mjs checks exactly that.
    invert: true
  },

  touch: {
    // Left of this fraction of the width steers; right of it drives.
    steerHalf: 0.5,
    // How far the thumb travels for full lock, as a fraction of frame WIDTH.
    // Relative to where it landed, so where on the left it starts is free.
    dragRange: 0.20,
    // The brake, as fractions of the frame: it sits above the right thumb
    // rather than beside it, so reaching for it never crosses the throttle.
    brake: { x: 0.74, y: 0.30, width: 0.22, height: 0.26 },
  },

  // Holding a half of the screen, for TILT mode. Right drives, left brakes,
  // neither coasts.
  halves: { throttle: 'right', brake: 'left' },

  // The throttle floor, per control mode. player.bike.throttleFloor is 0.42 so
  // a desktop ride never stalls while the cockpit is being tuned; on a phone
  // that means letting go of the gas does nothing, which makes the throttle
  // half of both touch schemes meaningless. A mode not named here keeps the
  // bike's own value, which is what the keyboard gets.
  floorByMode: { tilt: 0, touch: 0 },

  // On-screen hints. They are drawn with pointer-events none - every touch is
  // read from coordinates in core/Input.js, so a visible control is only ever a
  // picture of where to put a thumb and can never swallow a gesture.
  hints: {
    enabled: true,
    // Faded out once someone has clearly understood them, and brought back by
    // a mode change. 0 keeps them up for ever.
    fadeAfter: 12, // seconds of play
  },
};
