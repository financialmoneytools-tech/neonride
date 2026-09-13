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
      bandBrightness: 1.3, // band stars are boosted so the structure reads

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

      // Curved bands the clustered stars follow. Each band is generated around
      // the equator and then rotated into place, so the bands cross each other.
      bandAttempts: 8, // rejection sampling budget per star
      maxLatitude: 0.75, // hard clamp so band stars stay inside a band
      bands: [
        {
          share: 0.72,
          rotation: { x: 0.34, y: 0.0, z: -0.12 },
          thickness: 0.03, // radians, gaussian spread around the band line
          thicknessVariation: 0.8, // noise driven widening and pinching
          curveAmount: 0.14, // radians, how far the band line snakes
          curveScale: 1.4, // noise frequency of the snaking
          densityScale: 3.2, // noise frequency of the clumps and gaps
          densityContrast: 2.4, // higher = harder gaps between clumps
          filaments: 4, // parallel strands inside the band
          filamentSpread: 0.09,
        },
        {
          share: 0.28,
          rotation: { x: -0.55, y: 1.1, z: 0.3 },
          thickness: 0.045,
          thicknessVariation: 0.6,
          curveAmount: 0.2,
          curveScale: 2.0,
          densityScale: 4.5,
          densityContrast: 2.6,
          filaments: 3,
          filamentSpread: 0.13,
        },
      ],
    },

    nebula: {
      textureSize: 256,
      textureVariants: 3,
      noiseScale: 2.6,
      fbm: { octaves: 5, lacunarity: 2.15, gain: 0.55 },
      contrastLow: 0.34, // smoothstep window applied to the noise
      contrastHigh: 0.86,
      falloffPower: 1.35, // radial fade that hides the sprite edge

      // Magenta masses cluster near the dome glow, turquoise sits opposite
      clouds: [
        { azimuth: 2.15, elevation: 0.42, distance: 1150, scale: 1050,
          color: 0xff2d6f, opacity: 0.45, rotation: 0.4, breathSpeed: 0.06, breathAmount: 0.22, variant: 0 },
        { azimuth: 1.55, elevation: 0.18, distance: 1150, scale: 900,
          color: 0xff4bd0, opacity: 0.36, rotation: -0.7, breathSpeed: 0.045, breathAmount: 0.25, variant: 2 },
        { azimuth: 2.9, elevation: 0.75, distance: 1150, scale: 820,
          color: 0xd83bff, opacity: 0.3, rotation: 1.1, breathSpeed: 0.07, breathAmount: 0.2, variant: 1 },
        { azimuth: -1.25, elevation: 0.3, distance: 1150, scale: 980,
          color: 0x1fd6c8, opacity: 0.34, rotation: 0.15, breathSpeed: 0.035, breathAmount: 0.3, variant: 1 },
        { azimuth: -2.6, elevation: 0.12, distance: 1150, scale: 1100,
          color: 0x19b8e0, opacity: 0.3, rotation: -1.3, breathSpeed: 0.055, breathAmount: 0.24, variant: 0 },
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
      arcHalfWidth: 1.05, // about 120 degrees in total
      arcSoftness: 0.6, // fraction of the half width used for the fade
      arcDrift: 0.006, // rad/s of slow lateral drift
      warmArcScale: 1.3, // the warm glow spreads a little wider than the rays
    },
  },

  // --- Temporary debug helpers (removed once phase 4 owns the camera) ---
  debug: {
    freeLook: true, // set false to drop the development camera entirely
    lookAroundSpeed: 0.9, // rad/s of camera yaw driven by the steer input
    lookPitchLimit: 1.35, // radians, keeps the debug look from flipping over
  },
};

export default config;
