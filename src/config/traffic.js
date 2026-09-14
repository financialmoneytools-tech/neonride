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

  // Where a recycled vehicle reappears, measured from the player. `ahead` sits
  // inside the fog so they resolve out of it rather than popping in, and it has
  // to stay under the road's own neon fade end or a vehicle can appear on a
  // stretch of road that is still dark.
  spawnAhead: 900,
  spawnJitter: 260,
  recycleBehind: 140, // how far past the player before it is sent forward again
  minGap: 26, // along the road, between two vehicles sharing a lane

  // Lane centres, in world units either side of the centre line. The asphalt is
  // 9 units to each side and the player can reach 5.4, so every lane is
  // reachable and the outer ones sit near the edge lines.
  lanes: [-6.1, -2.5, 2.5, 6.1],

  // Speed is per type now; see the table below. It stays a fraction of the
  // PLAYER's maximum, so raising the bike's top speed keeps the overtaking rate
  // roughly where it is.

  // Real automotive paint, dark enough for a night world but far enough apart
  // to tell two vehicles apart. Picked per vehicle on respawn through
  // instanceColor, so variety inside a type is free.
  bodyPalette: [
    0x1b2f5e, // deep blue
    0x5e1b24, // deep red
    0x3a3f4a, // graphite
    0x6b6f78, // silver
    0x1e3c32, // dark green
    0x4a3a1e, // bronze
    0x7a7f88, // light silver
  ],

  // Vehicle types. Each is its own pool and its own set of instanced meshes, so
  // `count` IS the spawn weight.
  //
  // Silhouette has to carry the difference on its own: at 100 units a vehicle
  // is a few dozen pixels, so height and width read and nothing else does. The
  // first version failed because van, SUV and ambulance were all "tall box"
  // within 0.4 units of each other. These are deliberately pushed apart.
  types: [
    {
      name: 'sedan',
      count: 22,
      // Low and wide. The lowest thing on the road by a clear margin.
      size: { length: 4.7, width: 2.1, height: 0.82 },
      cabin: { length: 2.2, width: 1.7, height: 0.52, offset: 0.1, taper: 0.76 },
      speed: { min: 0.4, max: 0.78 },
      stripColor: 0x2de3ff,
    },
    {
      name: 'van',
      count: 10,
      // Tall slab with a flat rear: the cabin is barely a lip, so the profile
      // is one unbroken box.
      size: { length: 5.2, width: 2.15, height: 2.55 },
      cabin: { length: 1.5, width: 2.0, height: 0.12, offset: -1.6, taper: 0.96 },
      speed: { min: 0.3, max: 0.52 },
      stripColor: 0xff8a1f,
    },
    {
      name: 'ambulance',
      count: 5,
      // Box body over a lower cab. That step in the roofline is the shape that
      // says ambulance, and it is legible long before any light is.
      size: { length: 5.9, width: 2.25, height: 1.55 },
      cabin: { length: 1.7, width: 2.05, height: 0.5, offset: -2.0, taper: 0.86 },
      rearBox: { length: 3.6, width: 2.2, height: 1.35, offset: 1.0 },
      bodyColor: 0xc8ccd4, // white, the one type that does not take the palette
      speed: { min: 0.5, max: 0.66 },
      stripColor: 0xff2a3c,
      beacon: {
        // Left lamp is red and right is blue, baked as vertex colours. The
        // instance colour then alternates between red and blue, which lights
        // one lamp and extinguishes the other: proper alternating flash out of
        // a single colour write, no extra geometry and no extra draw call.
        colorA: 0xff2a3c,
        colorB: 0x3a6bff,
        size: [0.5, 0.2, 0.5],
        spacing: 0.66,
        z: -1.9,
        rate: 2.6, // alternations a second
      },
    },
    {
      name: 'jeep',
      count: 14,
      // Raised, NARROW and boxy - the tall-and-thin one. Its ride height lifts
      // the whole body clear of the road, which is visible as a gap underneath.
      size: { length: 4.3, width: 1.78, height: 1.72 },
      cabin: { length: 2.5, width: 1.7, height: 0.78, offset: 0.0, taper: 0.97 },
      rideHeight: 0.38,
      speed: { min: 0.36, max: 0.7 },
      stripColor: 0x39ff88,
    },
    {
      name: 'motorcycle',
      count: 14,
      size: { length: 2.0, width: 0.5, height: 1.15 },
      cabin: { length: 0.7, width: 0.42, height: 0.42, offset: -0.25, taper: 0.7 },
      speed: { min: 0.55, max: 0.86 },
      stripColor: 0xff36c8,
      singleTail: true,
      weave: { amount: 0.85, period: 4.5 },
    },
  ],

  // Shape settings shared by every type.
  vehicle: {
    bodyColor: 0xffffff, // white base; instanceColor carries the real paint
    scaleJitter: 0.08,

    strip: { height: 0.15, inset: 0.02, y: -0.08, lengthScale: 0.86 },

    tail: {
      color: 0xff2a3c,
      width: 0.5,
      height: 0.19,
      spacing: 0.58,
      y: 0.06,
      bar: { width: 1.5, height: 0.2, y: -0.14 },
    },

    rear: {
      outline: { thickness: 0.14, inset: 0.05, depth: 0.05 },
      // Big and bright enough to survive distance, small enough that it does
      // not sit over the body and erase the silhouette - which is exactly what
      // 2.4 by 2.6 at opacity 1.6 did. This is also the largest single fill
      // cost in the traffic system, so it is the first thing to trim for frame
      // rate: it is additive, so every pixel it covers is read and written.
      glow: { widthScale: 1.5, heightScale: 1.55, offset: 0.3, opacity: 0.85 },
    },

    // Ground blob, dimmer than the rear halo. Its relative brightness is baked
    // into vertex colours, so both live in one geometry and one material.
    glow: {
      size: 5,
      y: 0.06,
      groundLevel: 0.18,
      nearFade: 14,
      textureSize: 128,
    },
  },

  // Traffic thins out at the start of a run and builds as it goes, so the
  // opening is clean and the road gets busier the further you get.
  //   fraction = start + (1 - start) * (distance / fullAt) ^ curve
  // An inactive vehicle is scaled to nothing and skipped entirely; it costs no
  // fragments and cannot be collided with.
  //
  // The pools above are large and the road is meant to look busy from early on,
  // so this starts high and fills quickly. Raising the counts costs triangles
  // and nothing else: every type is a handful of InstancedMeshes whatever its
  // count, so the draw call total does not move at all.
  density: {
    start: 0.72, // share of each pool live at distance 0
    fullAt: 9000, // units travelled before every pool is full
    curve: 1.2, // above 1 holds it sparse for longer, then ramps
  },

  // What happens when the player hits one.
  //   'arcade' - speed loss and a screen flash
  //   'off'    - pass straight through, which is what recording wants
  collision: {
    mode: 'arcade',
    playerHalfWidth: 0.62,
    playerHalfLength: 1.2,
    speedLoss: 0.45, // speed is multiplied by this on contact

    // Sideways shove away from whatever was hit. Without it the player can end
    // up travelling at the same speed as a vehicle while occupying the same
    // space, which is both unescapable and invisible - the body surrounds the
    // camera and every face of it is pointing away.
    knockLateral: 2.0,

    flashColor: 0xff3a2a,
    flashStrength: 0.5,
    flashEdge: 0.55, // keep the middle of the frame legible even on a hit
    flashDuration: 0.35, // seconds to decay

    // Refractory period on the FLASH, separate from whether a hit registers.
    // Several hits in quick succession should still read as a pulse rather than
    // re-lighting a full screen tint over and over until it looks permanent.
    flashRefractory: 1.2,
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
