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

  // Vehicle types. Each is its own pool and its own set of instanced meshes,
  // so `count` IS the spawn weight: raising one type's count puts more of them
  // on the road. Four draw calls per type, plus one for the ambulance beacons.
  //
  // Silhouette is what distinguishes them at distance, not detail: height and
  // width read from 200 units away, a wing mirror does not.
  types: [
    {
      name: 'sedan',
      count: 6,
      size: { length: 4.6, width: 1.95, height: 1.0 },
      cabin: { length: 2.3, width: 1.62, height: 0.6, offset: 0.15, taper: 0.82 },
      speed: { min: 0.4, max: 0.78 },
      stripColor: 0x2de3ff,
    },
    {
      name: 'van',
      count: 3,
      size: { length: 5.4, width: 2.1, height: 2.25 },
      // Boxy: the cabin is the whole body, so the profile is a slab.
      cabin: { length: 1.9, width: 2.0, height: 0.3, offset: -1.4, taper: 0.94 },
      speed: { min: 0.3, max: 0.52 },
      stripColor: 0xff8a1f,
    },
    {
      name: 'ambulance',
      count: 1,
      size: { length: 5.8, width: 2.2, height: 2.45 },
      cabin: { length: 1.9, width: 2.05, height: 0.35, offset: -1.6, taper: 0.9 },
      speed: { min: 0.5, max: 0.66 },
      stripColor: 0xffffff,
      // Roof beacons. Their own instanced mesh, alternating red and blue.
      beacon: {
        colorA: 0xff2a3c,
        colorB: 0x3a6bff,
        size: [0.42, 0.16, 0.42],
        spacing: 0.62,
        z: -1.7,
        rate: 3.4, // alternations a second
      },
    },
    {
      name: 'suv',
      count: 4,
      // Wide and raised: sits higher off the road than anything else.
      size: { length: 5.0, width: 2.3, height: 1.65 },
      cabin: { length: 2.9, width: 2.05, height: 0.72, offset: 0.05, taper: 0.88 },
      rideHeight: 0.28,
      speed: { min: 0.36, max: 0.7 },
      stripColor: 0x39ff88,
    },
    {
      name: 'motorcycle',
      count: 4,
      size: { length: 2.1, width: 0.62, height: 0.95 },
      cabin: { length: 0.8, width: 0.5, height: 0.5, offset: -0.3, taper: 0.7 },
      speed: { min: 0.55, max: 0.86 },
      stripColor: 0xff36c8,
      singleTail: true,
      // Slow lateral weave within its lane, which is what a bike does and what
      // makes one readable as a bike rather than a small car.
      weave: { amount: 0.85, period: 4.5 },
    },
  ],

  // Shared shape settings, applied to every type.
  vehicle: {
    bodyColor: 0x191d2b,
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
      // Additive halo behind the rear face, merged into the same mesh as the
      // ground blob below so the pair is one draw call rather than two.
      // A soft gradient mips down to its own average, and at 200 units a
      // vehicle is only a few pixels tall - so a gentle halo averages away to
      // nothing and the vehicle reads only as a dark gap in the road. The halo
      // therefore has to be BIG relative to the body and genuinely bright:
      // additive can and should exceed 1.
      glow: { widthScale: 2.4, heightScale: 2.6, offset: 0.3, opacity: 1.6 },
    },

    // Ground blob, dimmer than the rear halo. Its relative brightness is baked
    // into vertex colours, so both live in one geometry and one material.
    glow: {
      size: 5,
      y: 0.06,
      groundLevel: 0.18, // vertex colour multiplier against the rear halo
      nearFade: 14, // shared by both quads now that they are one mesh
      textureSize: 128,
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
