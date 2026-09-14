/**
 * NEON RIDE - world settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 */

// --- World: road, roadside, mountains and the travelling camera ---
export const world = {
  seed: 20260914, // one seed drives the road path and the mountain ridges

  // Distance fog. The color must match what the sky dome paints at the
  // horizon (sky.dome.colorMid), because fogged geometry converges to exactly
  // this value and therefore melts into the sky rather than into a grey band.
  //
  // The density is an artistic knob, NOT the thing that hides a spawning
  // chunk: road.surface.neonFadeEnd does that, and it does it absolutely.
  // Raising the density pulls the wall of fog closer and buries the mountains
  // with it; lowering it opens the view up.
  fog: {
    color: 0x050310,
    density: 0.0013, // road readable to ~500, everything gone by ~1300
  },

  road: {
    chunkLength: 200,
    poolSize: 8, // 8 * 200 = 1600 units of road, far beyond the fog wall
    chunksBehind: 1, // chunks kept alive behind the camera before recycling
    lengthSegments: 48, // rings per chunk, about one every 4.2 units
    widthSegments: 6, // columns across the ribbon
    pointsPerChunk: 4, // curve control points per chunk (spacing 50 units)

    halfWidth: 9, // asphalt half width
    shoulderScale: 1.75, // ribbon half width = halfWidth * shoulderScale

    // Curve generation. Amplitude over wavelength is the knob that decides
    // how sharp the turns get: keep amplitude / wavelength below ~0.08 or
    // the road starts to feel like a slalom.
    path: {
      lateralAmplitude: 70,
      lateralWavelength: 1100,
      lateralStraightBias: 0.62, // pushes small values toward zero -> straights
      elevationAmplitude: 6,
      elevationWavelength: 1500,
      fbm: { octaves: 2, lacunarity: 2, gain: 0.28 },
    },

    surface: {
      asphaltColor: 0x050509, // near black
      voidColor: 0x050310, // shoulder fades to this, same as the fog color
      sheenColor: 0x2a1550, // fake sky reflection picked up at grazing angles
      sheenStrength: 0.55,
      sheenPower: 3.0,

      // Everything the road emits is faded to nothing between these two
      // distances. A chunk is born at (poolSize - chunksBehind - 1) *
      // chunkLength = 1200 units ahead, so as long as neonFadeEnd stays below
      // that, a fresh chunk cannot carry a single lit pixel at the moment it
      // appears - no matter how thin the fog is. That is what lets the fog
      // density be chosen for looks instead of for concealment.
      neonFadeStart: 800,
      neonFadeEnd: 1100,
    },

    edges: {
      leftColor: 0x22f7ff, // cyan
      rightColor: 0xff2bd0, // magenta
      width: 0.03, // in normalized across units (1 = ribbon half width)
      glow: 7.0, // halo reach as a multiple of width
      intensity: 1.15,
      halo: 0.28,
    },

    // Flowing neon strips on the asphalt.
    // patternLength must be an exact multiple of every lane period, and each
    // period is patternLength / repeats, so the whole pattern is periodic.
    // That is what lets the along-distance wrap without a visible jump.
    strips: {
      patternLength: 240,
      wrapCycles: 256, // wrap every 61440 units, keeps float32 precision sane

      // Scroll tied to how fast the bike is actually going, as a fraction of
      // road speed. NEGATIVE carries the pattern back toward the rider, which
      // ADDS to the flow the road already has: at -0.45 the strips appear to
      // approach at 1.45x the true speed. Cheapest speed cue in the project,
      // and it costs nothing per frame. Each lane's own `speed` is a constant
      // added on top of this.
      scrollFromSpeed: -0.45,
      softness: 0.14, // dash edge fade, as a fraction of the dash length
      glow: 5.0, // halo reach as a multiple of the strip width
      halo: 0.35,
      lanes: [
        { offset: -0.40, width: 0.05, color: 0xff8a1f, repeats: 3, duty: 0.42, speed: 0, intensity: 0.9 },
        { offset: -0.15, width: 0.04, color: 0x39ff88, repeats: 5, duty: 0.30, speed: 0, intensity: 0.8 },
        { offset: 0.15, width: 0.04, color: 0x2de3ff, repeats: 4, duty: 0.34, speed: 0, intensity: 0.85 },
        { offset: 0.40, width: 0.05, color: 0xff36c8, repeats: 6, duty: 0.38, speed: 0, intensity: 0.9 },
      ],
    },
  },

  roadside: {
    // Pylon spacing is the strongest speed cue there is, because pylons are the
    // only thing that passes CLOSE to the camera. Rate = speed / spacing: at 20
    // units and 235 units per second that is 11.8 a second, against 2.4 at the
    // old 40 unit spacing and 98 units per second.
    stationsPerChunk: 10, // pylon pairs per chunk, one every 20 units
    offset: 14, // lateral distance from the road center
    postWidth: 0.45,
    postDepth: 0.45,
    postHeight: 5.2,
    postColor: 0x0b0b16,
    tubeWidth: 0.26,
    tubeDepth: 0.26,
    tubeHeight: 3.9,
    tubeLift: 0.7, // tube base above the road
    tubeInset: 0.34, // tube pushed off the post face, toward the road
    leftColor: 0x22f7ff,
    rightColor: 0xff2bd0,
  },

  mountains: {
    slabLength: 2400,
    slabsPerLayer: 2, // two slabs leapfrog each other along the travel axis
    columns: 28,
    baseY: -70, // bottom edge, well below the horizon
    depthJitter: 80, // per column push toward / away from the road
    ridge: { wavelength: 520, octaves: 3, lacunarity: 2.1, gain: 0.5 },

    // A ridge at lateral distance D only enters the frustum once it is more
    // than D / tan(hfov / 2) units ahead, so with the fog reaching about 1300
    // units anything past roughly 850 out is off screen at every moment of
    // its life. Both layers sit inside that limit on purpose; pushing them
    // further away does not make them look more distant, it deletes them.
    layers: [
      { distance: 420, height: 120, floor: 0.3, color: 0x0a0716 },
      { distance: 620, height: 210, floor: 0.35, color: 0x070512 },
    ],
  },
};
