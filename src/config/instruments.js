/**
 * NEON RIDE - the instrument cluster.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.rider.instruments.
 *
 * Split out of ./rider.js because that file went past the size a file in this
 * project is allowed to be, and because a dash layout is its own subject: it is
 * the only place in the config that talks in texture pixels.
 */

// Sport bike dash. The tachometer arc is the anchor - see
// player/rider/instruments/dash.js for why it gets the whole panel - with the
// gear in the middle of it and the speed secondary underneath.
//
// Everything from `texture` down is in TEXTURE PIXELS on a 512 x 288 face, so
// the layout can be read here without holding the panel's world size in your
// head. The two are kept at the same ratio (0.180 / 0.101 against 512 / 288)
// so nothing is stretched.
export const instruments = {
  // BEHIND THE BAR AND ABOVE IT. It was [0, 0.052, -0.012], which put it level
  // with the old bar line and only 0.012 beyond it - close enough that the two
  // fought for the same band of the frame. The bar is one tube now, its centre
  // crosses at 77 per cent down, and the cluster sits above and behind that so
  // it is read over the top of the bar rather than through it.
  offset: [0, 0.112, -0.075],
  rotation: [-0.95, 0, 0], // tipped back toward the rider
  // Grown from 0.165 x 0.092 with the dash redesign, and again when the
  // fairing was cut back. An arc needs the height a segment bar did not, and
  // with the bodywork no longer filling the lower frame this is the thing the
  // cockpit is built around rather than a readout tucked between the bars.
  size: [0.200, 0.112, 0.008],
  frameMargin: 0.007,
  frameDepth: 0.012,
  texture: { width: 512, height: 288 },
  // Faster than the old 12, because an arc that steps is worse than a number
  // that steps - the eye follows the sweep.
  updateHz: 20,
  // No label under the gear: a large digit in the middle of a tachometer is
  // not ambiguous, and the label collided with the speed underneath it.
  // KM/SA - kilometre per hour in Turkish. It read KM/S for a long time,
  // which is kilometres per SECOND and is not a unit anything here moves in.
  labels: { speed: 'HIZ', unit: 'KM/SA', rpm: 'DEVIR x1000', neutral: 'N' },

  tach: {
    centre: [256, 214],
    radius: 118,
    width: 22,
    // Start and end of the sweep, in units of PI, canvas angles with y down.
    // 0.86 to 2.14 is 230 degrees: up from below the left, over the top, down
    // to below the right.
    sweep: [0.86, 2.14],
    maxRpm: 16, // what the top of the arc reads, in thousands
    redlineAt: 13,
    shiftAt: 0.90, // fraction of the sweep where the shift light comes on
    fillSlices: 48, // slices the lit part is drawn in, so its colour can ramp
    // What the needle is quantised to before the face is redrawn. 160 steps
    // over 230 degrees is under one and a half degrees, which is finer than
    // the arc can show, and it is what keeps a steady cruise from redrawing
    // and re-uploading the texture every frame.
    steps: 160,
  },

  gear: { y: 180, size: 84 },
  // ================= THE SPEED IS CONVERTED, NOT COPIED =================
  //
  // `state.speed` is in WORLD UNITS PER SECOND and a world unit is a metre -
  // the lanes are 3.8 of them wide and a car is 4.5 of them long, and the
  // whole road layout in config/road.js is written in metres. For a long time
  // this face printed that number raw under a KM/S label, which made the dial
  // disagree with the only other two numbers in the game that are measured in
  // the same units: a five kilometre stage finished in 28 s is 643 km/h, and
  // the dial said 146. The distance and the clock were right; the dial was
  // the one lying, so it now multiplies by 3.6 like any other speedometer.
  //
  // The honest number is large - a bike that covers 229 metres a second is
  // doing 825 km/h - and that is the world this game is set in rather than a
  // fault to be tuned away. tools/stage-check.mjs asserts the three agree.
  speed: {
    y: 250,
    size: 34,
    split: 4, // where the number ends and the unit starts
    // Metres per second to kilometres per hour.
    toKmh: 3.6,
    // WHAT THE FACE IS QUANTISED TO, for the same reason `tach.steps` exists:
    // the dash is a 512x288 canvas that is re-uploaded as a texture whenever
    // any shown value changes, and a steady cruise must not do that every
    // frame. One unit per second is 3.6 km/h, so rounding the converted number
    // to a whole km/h made every hundredth of a unit of throttle noise a
    // redraw. Five is under a per cent of the reading at speed and reads as a
    // digital dash settling, which is what one does.
    step: 5,
  },

  shift: { y: 12, width: 168, height: 16 },

  // Two of these never light. That is deliberate - see dash.js.
  lamps: [
    { kind: 'neutral', at: [62, 22] },
    { kind: 'beam', at: [118, 22] },
    { kind: 'oil', at: [394, 22] },
    { kind: 'temp', at: [450, 22] },
  ],

  colors: {
    background: '#05030c',
    border: '#2de3ff',
    // Not pure white: the face is not tone mapped, so anything at full
    // brightness this close to the camera blooms into a white lozenge and
    // takes the digits with it.
    speed: '#dde6ff',
    // Dimmer than it looks like it should be. At #ffffff the gear digit - the
    // largest and brightest thing on an untone-mapped face - bloomed into a
    // white lozenge with a halo, and took the speed underneath with it.
    gear: '#c6d2f0',
    label: '#7a7fa8',
    tick: '#8e96c4',
    rpmLow: '#2de3ff',
    rpmMid: '#39ff88',
    rpmHigh: '#ff2bd0',
    rpmOff: '#141a2e',
    // Dark. It marks where the redline STARTS; it is not itself lit, and at
    // #5a1030 it bloomed brighter than the lit part of the arc.
    redline: '#39091d',
    neutral: '#39ff88',
    beam: '#4aa8ff',
    shiftOn: '#ff2bd0',
    shiftOff: '#141a2e',
    lampOff: '#242a44',
  },
};
