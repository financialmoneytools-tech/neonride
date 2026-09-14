/**
 * NEON RIDE - traffic.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * Every vehicle is an instance of the same four meshes - body, light strips,
 * tail lights, ground glow - so the whole system is four draw calls no matter
 * how many vehicles are in it. Raising `count` costs triangles and a handful of
 * matrix writes per frame, and nothing else.
 */

// --- Traffic ---
export const traffic = {
  enabled: true,
  seed: 90210,

  // Pool size. Every one of these is live at all times; they recycle from
  // behind the player to ahead of it, exactly like the road chunks.
  count: 16,

  // Where a recycled vehicle reappears, measured from the player. `ahead` sits
  // inside the fog so they resolve out of it rather than popping in, and it has
  // to stay under the road's own neon fade end or a vehicle can appear on a
  // stretch of road that is still dark.
  spawnAhead: 900,
  spawnJitter: 260,
  recycleBehind: 140, // how far past the player before it is sent forward again
  minGap: 42, // along the road, between two vehicles sharing a lane

  // Lane centres, in world units either side of the centre line. The asphalt is
  // 9 units to each side and the player can reach 5.4, so every lane is
  // reachable and the outer ones sit near the edge lines.
  lanes: [-6.1, -2.5, 2.5, 6.1],

  // Speed as a fraction of the player's maximum, so raising player top speed
  // keeps the overtaking rate roughly the same. A wide spread is what makes the
  // road feel busy: identical speeds read as a static formation.
  speed: { min: 0.32, max: 0.74 },

  // Body is a box with a tapered cabin on top; these are the overall extents.
  vehicle: {
    length: 4.6,
    width: 1.95,
    height: 1.15,
    cabin: { length: 2.3, width: 1.62, height: 0.62, offset: 0.15 },
    // A flat unlit box has no form, so the body reads purely as a silhouette.
    // Too dark and it vanishes into the road; this sits just above the asphalt
    // so the shape registers while the emissive parts do the talking.
    bodyColor: 0x191d2b,
    scaleJitter: 0.14, // per vehicle size variation, purely for variety

    // Emissive side strips. Each vehicle draws one colour from this list.
    strip: {
      height: 0.15,
      inset: 0.02,
      y: -0.08,
      lengthScale: 0.86,
      palette: [0x2de3ff, 0xff36c8, 0x39ff88, 0xff8a1f, 0xa45cff],
    },

    // The rider only ever sees a vehicle from behind, so the rear is where the
    // read has to come from. Generous on purpose: at 200 units a small lamp is
    // a sub pixel speck and the vehicle disappears.
    tail: {
      color: 0xff2a3c,
      width: 0.52,
      height: 0.19,
      spacing: 0.62,
      y: 0.06,
      // Thin bar joining the two lamps, which is what makes the width of the
      // vehicle legible at distance.
      bar: { width: 1.5, height: 0.05, y: -0.12 },
    },

    // Additive blob on the road under the vehicle. Sold by the texture, not by
    // geometry: one quad each.
    glow: {
      size: 5,
      // Sixteen additive blobs lying down the road add up fast; this is the
      // value to lower first if the road washes out.
      opacity: 0.15,
      y: 0.06, // above the road, or it z-fights with it
      textureSize: 128,
      // A quad this size lying on the road fills the entire frame once the
      // player draws level with it, washing everything additively. Shrinking it
      // away over the last stretch fixes that, and it is what you would see
      // anyway: you cannot look at the glow under a car you are alongside.
      nearFade: 22,
    },
  },

  // What happens when the player hits one.
  //   'arcade' - speed loss and a screen flash
  //   'off'    - pass straight through, which is what recording wants
  collision: {
    mode: 'arcade',
    playerHalfWidth: 0.62,
    playerHalfLength: 1.2,
    speedLoss: 0.45, // speed is multiplied by this on contact
    flashColor: 0xff3a2a,
    flashStrength: 0.55,
    flashEdge: 0.25, // a hit is worth most of the frame
    flashDuration: 0.45, // seconds to decay
    cooldown: 0.8, // no second hit from the same vehicle while this runs
  },

  // Passing close without touching. This is the moment worth recording, so it
  // gets its own response: a brief widening of the chromatic aberration and a
  // cool flash, both far softer than a collision.
  // Near misses happen CONSTANTLY on a four lane road - the player passes
  // several vehicles a second and the inner lanes sit barely a metre off the
  // shoulder, so a generous range keeps the effect permanently lit and washes
  // the frame. Two things keep it an event rather than a state: a tight range,
  // and a cooldown.
  //
  // The response is also pushed out to the edges of the frame rather than
  // tinting the whole image. A full screen tint at this rate reads as a colour
  // grade fault; an edge pulse reads as something rushing past.
  nearMiss: {
    // Must be SMALLER than the gap the player gets by sitting in the middle of
    // the road while a vehicle passes in an inner lane, or every overtake fires
    // and the effect becomes a permanent tint. With lanes at 2.5 and a combined
    // half width of about 1.6 that gap is 0.9, so this has to stay under it: a
    // near miss should mean the player chose to squeeze past, not that a car
    // went by.
    range: 0.6, // lateral gap, edge to edge, that counts
    cooldown: 1.5, // seconds before another can fire
    flashColor: 0x9ad8ff,
    flashStrength: 0.38,
    flashEdge: 1, // 0 fills the frame, 1 hugs the edges
    duration: 0.4,
    aberrationBoost: 0.004,
  },
};
