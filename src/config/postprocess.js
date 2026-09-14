/**
 * NEON RIDE - post processing settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * The chain is: scene -> bloom -> grade. Bloom ADDS into a linear HDR buffer
 * and the tone mapping happens after it, in the grade pass. That order is what
 * lets a neon strip glow hard without going white: the excess lands above 1.0
 * where ACES can roll it off, instead of clipping on the way in.
 */

// --- Post processing ---
export const postprocess = {
  // The whole chain, on or off. With it off the renderer draws straight to the
  // screen with no tone mapping at all, which is exactly the phase 4 image -
  // the first elimination test for anything that looks wrong after this phase.
  enabled: true,

  // ACES is applied once, here, and nowhere else: the renderer is left on
  // NoToneMapping so no material can quietly map a second time.
  //
  // Exposure is the master brightness and the first thing to reach for. Mind
  // the scale: three's ACES multiplies by exposure / 0.6 before the curve, so
  // 0.6 is unity gain and the default here is about a 13 per cent lift. 1.0 is
  // already 1.67x and washes this scene out.
  exposure: 0.68,

  // ACES buys its highlight roll off with saturation, and in a scene built out
  // of coloured light that is the wrong trade. This puts it back after the
  // curve. 1.0 is raw ACES; lower the value if the neon starts to look inked.
  saturation: 1.12,

  // Nothing in this scene exceeds a linear luminance of about 1.0, so the
  // threshold only does anything below that - set it to 1.1 and the bloom
  // switches off completely. That also means the threshold cannot separate
  // "neon" from "everything else" the way it would in a scene with real
  // highlights, which is why strength and radius are kept low: at 0.9 and 0.5
  // the edge lines stop being lines and become a wash that swallows the hands.
  bloom: {
    strength: 0.45,
    radius: 0.3,
    threshold: 0.8, // luminance a pixel must beat before it glows at all

    // Bloom runs at this fraction of the frame, and UnrealBloomPass halves it
    // again internally, so 0.5 means the glow is built at a quarter of the
    // width. Drop it to 0.35 first if the frame rate is short; it costs the
    // glow almost nothing because it is blurred anyway.
    resolutionScale: 0.5,

    // Added to strength at full speed.
    speedGain: 0.15,
  },

  // Darkening toward the edges. `start` is where it begins, as a fraction of
  // the distance from the centre to a corner, so the middle of the frame - and
  // the instrument panel sitting in it - is never touched.
  vignette: {
    strength: 0.34,
    start: 0.45,
  },

  // Red and blue are pulled apart radially. The value IS the offset at the
  // corner in UV units, so multiply by the frame width for pixels: 0.0015 on a
  // 1920 wide frame is about 3 pixels. `power` keeps the centre clean - at 2.6
  // the middle third of the frame has essentially none, which is what keeps the
  // panel digits crisp.
  aberration: {
    amount: 0.0015,
    speedGain: 0.002, // added at full speed
    power: 2.6,
  },
};
