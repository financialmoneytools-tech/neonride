/**
 * NEON RIDE - central configuration.
 * Rule: every numeric setting in the project lives here.
 * No module keeps its own magic numbers.
 */
export const config = {
  // --- Render layer ---
  renderer: {
    antialias: true,
    maxPixelRatio: 2, // anything above this kills performance
    powerPreference: 'high-performance',
    clearColor: 0x020108, // matches the sky base color
    toneMappingExposure: 1.0,
  },

  // --- Camera ---
  camera: {
    fov: 75,
    near: 0.1,
    far: 2000,
    position: { x: 0, y: 2.2, z: 6 }, // temporary: phase 4 hands this to the rider
    lookAt: { x: 0, y: 2.2, z: 0 }, // level with the horizon
  },

  // --- Main loop ---
  loop: {
    maxDelta: 0.05, // keeps dt sane when the tab goes to the background
  },

  // --- Measurement overlay ---
  stats: {
    enabled: true, // when false the overlay is never created
    updateInterval: 0.5, // seconds between counter refreshes
  },

  // --- Input ---
  input: {
    // Smoothing time constants in seconds. Smaller = snappier response.
    steerSmoothing: 0.12,
    throttleSmoothing: 0.18,
    brakeSmoothing: 0.08,
    gamepadDeadzone: 0.15,
    gamepadTriggerThreshold: 0.05,
    touchSteerSplit: 0.5, // screen fraction that separates the left/right half
  },

  // --- Sky ---
  sky: {
    seed: 1337, // one seed drives stars, bands and nebula shapes

    // Inverted sphere carrying the vertical gradient
    dome: {
      radius: 1500,
      widthSegments: 64,
      heightSegments: 32,
      colorBase: 0x020108, // horizon and below: near black
      colorMid: 0x050310,
      colorTop: 0x0e0824, // the zenith stays dark; purple comes from the glow
      midPoint: 0.55,
      // A single localized pool of purple instead of a global purple wash
      glow: {
        color: 0x4a1a8a,
        azimuth: 2.15, // radians, shares the sky region with the magenta nebulae
        elevation: 0.5,
        intensity: 0.7,
        falloff: 6.0, // higher = tighter pool; 6 gives a roughly 50 degree pool
      },
    },

    stars: {
      textureSize: 64,
      // Star sprite shape as radial gradient stops
      texture: {
        coreStop: 0.08, coreAlpha: 0.95,
        midStop: 0.22, midAlpha: 0.5,
        tailStop: 0.5, tailAlpha: 0.08,
      },

      palette: [
        { color: 0xffffff, weight: 5 }, // white
        { color: 0xffc46a, weight: 3 }, // gold
        { color: 0x8fd0ff, weight: 3 }, // ice blue
      ],

      twinkleAmount: 0.3, // 0 = steady, 1 = full blink
      twinkleSpeed: 1.6,
      trailBrightness: 1.3, // trail stars are boosted so the structure reads

      // Sizes follow size = sizeMin + (sizeMax - sizeMin) * pow(random, exponent).
      // A high exponent keeps most stars small and leaves a few big bright ones.
      layers: [
        {
          name: 'deep',
          count: 24000,
          radius: 1400,
          sizeMin: 1.6, sizeMax: 9, sizeExponent: 4.5,
          brightness: 0.9, opacity: 1,
          rotationSpeed: 0.0022, // rad/s
          tilt: { x: 0, z: 0 }, // the bands carry their own orientation
          galacticFraction: 0.85, // share of stars pulled into the bands
        },
        {
          name: 'mid',
          count: 9000,
          radius: 1320,
          sizeMin: 2.2, sizeMax: 13, sizeExponent: 4,
          brightness: 1, opacity: 1,
          rotationSpeed: 0.0045,
          tilt: { x: 0.1, z: 0.2 },
          galacticFraction: 0,
        },
        {
          name: 'near',
          count: 3000,
          radius: 1240,
          sizeMin: 3.5, sizeMax: 20, sizeExponent: 3,
          brightness: 1.15, opacity: 1,
          rotationSpeed: 0.0075,
          tilt: { x: -0.15, z: 0.05 },
          galacticFraction: 0,
        },
      ],

      // Long exposure star trails: concentric curves wound around one common
      // axis. A star belongs to a line, not to a cluster.
      // Every polarAngle stays away from 90 degrees on purpose: a curve at
      // exactly 90 degrees is a great circle, which contains the antipode of
      // every point on it and therefore mirrors itself about the horizon.
      trails: {
        pole: { azimuth: 2.45, elevation: 0.62 }, // the axis the arcs wind around
        curves: 12,
        polarMin: 0.3, // radians from the pole: innermost arc
        polarMax: 2.5, // outermost arc; arcs wrap past the pole's equator so
        // the whole sky carries structure, leaving only a small empty cap
        polarJitter: 0.045, // per curve offset so the spacing is not machine even
        tiltJitter: 0.05, // per curve rotation so they are only roughly parallel
        jitter: 0.011, // perpendicular scatter of a star off its line
        wobbleAmount: 0.032, // noise bend of the curve
        wobbleScale: 2.2,
        densityScale: 2.6, // noise frequency of the bright knots along a curve
        densityContrast: 1.6,
        densityFloor: 0.45, // high floor: knots brighten the arc, never break it
        weightFalloff: 0.9, // outer curves get progressively fewer stars
        attempts: 6, // rejection sampling budget per star
      },
    },

    nebula: {
      textureSize: 256,
      textureVariants: 3,
      noiseScale: 2.6,
      fbm: { octaves: 5, lacunarity: 2.15, gain: 0.55 },
      contrastLow: 0.34, // smoothstep window applied to the noise
      contrastHigh: 0.86,
      falloffPower: 1.35, // radial fade that hides the sprite edge

      // A sprite spans atan((scale / 2) / distance) either side of its
      // elevation. Anything whose lower edge reaches the horizon smears its
      // soft edge along it and reads as a haze band rather than as a mass,
      // so every cloud keeps its lower edge at least 10 degrees up.
      // Magenta masses cluster near the dome glow; the cool masses sit
      // opposite, in blue and violet rather than green leaning cyan.
      clouds: [
        { azimuth: 2.15, elevation: 0.62, distance: 1150, scale: 900,
          color: 0xff2d6f, opacity: 0.45, rotation: 0.4, breathSpeed: 0.06, breathAmount: 0.22, variant: 0 },
        { azimuth: 1.55, elevation: 0.5, distance: 1150, scale: 760,
          color: 0xff4bd0, opacity: 0.36, rotation: -0.7, breathSpeed: 0.045, breathAmount: 0.25, variant: 2 },
        { azimuth: 2.9, elevation: 0.75, distance: 1150, scale: 820,
          color: 0xd83bff, opacity: 0.3, rotation: 1.1, breathSpeed: 0.07, breathAmount: 0.2, variant: 1 },
        { azimuth: -1.25, elevation: 0.52, distance: 1150, scale: 620,
          color: 0x3f6bff, opacity: 0.42, rotation: 0.15, breathSpeed: 0.035, breathAmount: 0.3, variant: 1 },
        { azimuth: -2.6, elevation: 0.62, distance: 1150, scale: 660,
          color: 0x9d3cf0, opacity: 0.38, rotation: -1.3, breathSpeed: 0.055, breathAmount: 0.24, variant: 0 },
      ],
    },

    // Curtain sitting on the horizon, confined to one arc of the sky
    aurora: {
      radius: 1120,
      height: 1000, // tall enough for the rays to reach ~30 degrees of sky
      baseY: -90, // bottom edge, relative to the camera
      radialSegments: 192,
      colorLow: 0x35ff9b, // green, near the horizon
      colorHigh: 0x9a3dff, // purple, higher up
      warmColor: 0xff7a2f, // warm orange under layer

      intensity: 0.95,
      warmIntensity: 0.18,
      warmHeight: 0.12, // how far up the warm layer reaches (0..1 of height)
      curtainHeight: 0.5, // average curtain height (0..1 of the cylinder)
      curtainVariation: 0.12,
      fadeBottom: 0.04, // softens the bottom rim; must stay below warmHeight

      waveScale: 2.3, // slow channel: bends the top edge of the curtain
      waveSpeed: 0.04,
      rayScale: 26, // fast channel: base frequency of the vertical rays
      rayContrast: 2.0, // higher = thinner, better separated rays
      rayHeight: 0.5, // how much each ray pushes the top edge up or down
      warpScale: 1.9, // domain warp: breaks the even equalizer spacing
      warpAmount: 0.55,
      clusterScale: 4.5, // large scale envelope, whole regions go dark
      clusterFloor: 0.28,
      clusterRange: 0.22, // how quickly a live region reaches full strength

      // The curtain covers one arc instead of wrapping the whole horizon
      arcCenter: -1.6, // world azimuth in radians, the default camera faces it
      arcHalfWidth: 0.7, // about 80 degrees; the horizontal fov is 107.5
      arcSoftness: 0.6, // fraction of the half width used for the fade
      arcDrift: 0.006, // rad/s of slow lateral drift
      warmArcScale: 1.25, // the warm glow spreads a little wider than the rays
      warmFloor: 0.15, // how much warm glow survives between the rays
    },
  },

  // --- World: road, roadside, mountains and the travelling camera ---
  world: {
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
      stationsPerChunk: 5, // pylon pairs per chunk, one every 40 units
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

    // Constant speed dolly along the road.
    // PHASE 4: BikePhysics takes this over and this block goes with it.
    camera: {
      speed: 62, // units per second
      height: 2.35, // above the road surface
      lookAhead: 22, // the camera aims at the road this far ahead
      startDistance: 200, // one chunk in, so a chunk always sits behind us
    },
  },

  // --- Temporary debug helpers (removed once phase 4 owns the camera) ---
  debug: {
    // Off by default: the road camera owns the view. Set this to true (or
    // flip config.debug.freeLook from the console at runtime) to look around.
    freeLook: false,
    lookAroundSpeed: 0.9, // rad/s of camera yaw driven by the steer input
    lookPitchLimit: 1.35, // radians, keeps the debug look from flipping over
  },
};

export default config;
