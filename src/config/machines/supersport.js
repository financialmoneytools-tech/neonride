import { TANK_SECTION, fairing, paint, screen } from './supersportBodywork.js';
import { lower } from './supersportLower.js';

/**
 * NEON RIDE - the supersport, one bike definition among several.
 * Part of the single configuration surface; import from ../../config.js, never
 * from this file directly. Reached as config.player.rider.machine once the
 * library in ../machine.js has selected it.
 *
 * Rider space, same as the rest of the rig: origin at the handlebar clamp,
 * +X right, +Y up, -Z forward.
 *
 * The rig is a framing device, not a scale model. It is compressed vertically -
 * the bars sit 0.2 below the eye where a real bike puts them nearer 0.5 - so
 * parts are placed by where they land ON SCREEN rather than by where they would
 * sit on a real machine. The tank in particular reads far higher here than it
 * would in life, because anything that close to the camera drops out of frame
 * fast.
 *
 * What belongs here: only what is visible from the saddle. Tank top, upper
 * fork, headlight and its cowl, the top of the front fender and the sliver of
 * tyre either side of it. No frame rails, no engine, no seat, no rear end.
 *
 * The tank is the one part that does NOT turn with the bars - it is bolted to
 * the chassis - which is why Rider hangs it off its own group.
 */

// --- Visible machine ---
export const supersport = {
  // Top of the fuel tank, filling the very bottom of the frame. Raising `y`
  // brings more of it into view; at -0.06 it occupies roughly the bottom tenth
  // at 16:9 and rather more at 9:16, where the taller frame has room for it.
  // Flat and long, not round. Anything with much height this close to the eye
  // stops reading as a tank and starts reading as a balloon filling the bottom
  // of the frame - the y radius is the value that decides which one you get.
  // Nose down, so it recedes away from the rider the way a real one does.
  tank: {
    // The rear of it must stay IN FRONT of the near plane. With the cockpit
    // this close to the eye a longer tank reaches past the camera, and the near
    // plane then cuts it open: at 16:9 fifty of its vertices were behind the
    // eye and the bottom of the frame showed the inside of the tank. What is
    // behind the rider is never seen anyway, so it is shortened rather than the
    // near plane being lowered, which would cost depth precision everywhere
    // else to fix something nobody can see.
    // Lofted, not an ellipsoid, and for the same reason the fairing is: beside
    // panels with creases on them a smooth lobe reads as a balloon. It was the
    // last rounded shape on the bike, and at 9:16 - where the camera sits lower
    // and looks further down - it filled the bottom third of the frame as one
    // smooth egg.
    section: TANK_SECTION,
    radii: [0.170, 0.070, 0.245], // half extents the section and spine scale to
    // Stations run rear to front, z +1 nearest the rider. Widest just behind
    // the middle and pinched at the front, where it meets the steering head.
    stations: [
      { z: 1.00, offset: [0, -0.02], scale: [0.72, 0.70] },
      { z: 0.45, offset: [0, 0.00], scale: [1.00, 1.00] },
      { z: -0.20, offset: [0, 0.01], scale: [0.95, 0.92] },
      { z: -0.70, offset: [0, 0.00], scale: [0.74, 0.70] },
      { z: -1.00, offset: [0, -0.02], scale: [0.48, 0.46] },
    ],
    // Filler cap, the one piece of detail that says fuel tank rather than panel
    cap: { radius: 0.026, height: 0.009, offset: [0, 0.03, 0.12], segments: 18 },
    // Neon seam down the spine of the tank, matching the glove trim
    seam: { size: [0.009, 0.005, 0.33], offset: [0, 0.032, 0.02] },
  },

  tripleClamp: { size: [0.205, 0.042, 0.08], offset: [0, -0.062, -0.012] },

  // Everything below the bar line: fork sliders, headlight, cowl, fender, tyre.
  //
  // Off for two commits, and that was wrong. It was switched off when the bar
  // assembly was a quarter larger and sitting in open road, where the fork legs
  // read as scaffolding under a cockpit. Since then hardwareScale took the
  // assembly to 0.92 and the 16:9 profile pushed it further from the eye, and
  // what was left without it was worse: the fork tubes stop dead at y -0.198
  // and the triple clamp, the one part that ties the bars to the bike, sits
  // behind the fairing. The handlebars had nothing under them.
  lowerFront: true,

  // The very top of the fork leg, at the bar line. Always built: it is what the
  // clamp holds and what the clip-ons bolt to. The leg itself - stanchion,
  // slider, seal, lug and axle - belongs to `lower` and only exists when
  // lowerFront is on, so `to` here is only reached when it is off.
  forkTop: {
    from: [0.086, -0.078, -0.018],
    to: [0.097, -0.215, -0.092],
    radius: 0.019,
    radialSegments: 14,
  },

  // Fork legs, fender and front wheel; see ./supersportLower.js.
  lower,

  headlight: {
    offset: [0, -0.2, -0.185],
    rotation: [0.28, 0, 0], // nose down, matching the fork rake
    // Lathe profile of the housing, [radius, depth], listed front lip first so
    // the depth increases: that is the order that yields outward normals.
    // Positive depth is toward the rider, so the rider sees the closed back of
    // the bowl bulging at them, not into the reflector.
    profile: [
      [0.084, -0.03],
      [0.082, -0.012],
      [0.074, 0.01],
      [0.056, 0.032],
      [0.03, 0.048],
      [0.0, 0.055],
    ],
    segments: 20,
    rimRadius: 0.087,
    rimDepth: -0.03, // the front lip, where the ring sits
    rimWidth: 0.012,
    rimSegments: 20,
  },

  // Cowl wrapped around the headlight. Only its back is ever seen.
  cowl: {
    offset: [0, -0.19, -0.16],
    rotation: [0.28, 0, 0],
    profile: [
      [0.125, -0.035],
      [0.122, 0.0],
      [0.108, 0.04],
      [0.082, 0.072],
      [0.05, 0.092],
    ],
    segments: 22,
    // Emissive lip around the rim, the cowl's share of the neon treatment
    lip: { radius: 0.127, width: 0.014, depth: -0.035, segments: 22 },
  },


  // Bodywork, paint and glass. Next door, because the two together no longer
  // fit in a file this project allows.
  paint,
  fairing,
  screen,

  // --- Controls ----------------------------------------------------------
  //
  // Everything within reach of the hands, which is where the eye goes. These
  // are small parts that carry most of the "this is a real machine" load,
  // because they sit right beside the gloves at the bottom of the frame.
  controls: {
    // Clip-ons: short stubs from the fork tops out to the grips, angled down
    // and back. They REPLACE the straight bar; the grip anchors do not move,
    // because the hands are posed and baked against them.
    clipOn: {
      from: [0.088, -0.072, -0.02],
      to: [0.268, -0.086, 0.028],
      radius: 0.0135,
      radialSegments: 12,
    },
    // The switch block, the lever perch and the brake master cylinder were
    // here. All three sat below the bar line, and once the bodywork behind them
    // was cut back they read as grey crates floating in open road. See the note
    // in bike/Controls.js. The lever keeps its own perch, up at bar level.
    // Bar end weight, closing the outer end of the grip.
    barEnd: { radius: 0.019, length: 0.022, offset: [0.408, -0.0345, 0.0905] },
  },
};
