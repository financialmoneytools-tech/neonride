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
    clearColor: 0x05030f, // deep navy-black, matches the sky base color
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
      colorBase: 0x05030f, // horizon and below
      colorMid: 0x120a33, // mid sky
      colorTop: 0x2a1160, // zenith
      midPoint: 0.52, // where colorMid sits on the 0..1 vertical ramp
    },

    stars: {
      textureSize: 64,

      // Pick weights decide how often each star color shows up
      palette: [
        { color: 0xffffff, weight: 6 }, // white
        { color: 0xffd9a0, weight: 2 }, // gold
        { color: 0xa8dcff, weight: 3 }, // ice blue
      ],

      twinkleAmount: 0.25, // 0 = steady, 1 = full blink
      twinkleSpeed: 1.6,

      // Three layers, each with its own size and parallax speed
      layers: [
        {
          name: 'deep',
          count: 7000,
          radius: 1400,
          size: 1.7, // pixels before the device pixel ratio is applied
          sizeJitter: 0.6,
          opacity: 0.9,
          rotationSpeed: 0.0022, // rad/s
          tilt: { x: 0.34, z: -0.12 },
          galacticFraction: 0.72, // share of stars pulled into the band
        },
        {
          name: 'mid',
          count: 3500,
          radius: 1320,
          size: 2.8,
          sizeJitter: 0.8,
          opacity: 0.95,
          rotationSpeed: 0.0045,
          tilt: { x: 0.1, z: 0.2 },
          galacticFraction: 0,
        },
        {
          name: 'near',
          count: 1500,
          radius: 1240,
          size: 4.4,
          sizeJitter: 1.0,
          opacity: 1.0,
          rotationSpeed: 0.0075,
          tilt: { x: -0.15, z: 0.05 },
          galacticFraction: 0,
        },
      ],

      // Shape of the galactic band the clustered stars follow
      band: {
        thickness: 0.085, // radians, gaussian spread around the band line
        curveAmount: 0.3, // radians, noise driven drift of the band line
        curveScale: 1.35, // noise frequency along the band
        densityScale: 2.1, // noise frequency of the gaps along the band
        densityFloor: 0.25, // keeps the band from breaking apart completely
        maxLatitude: 0.62, // hard clamp so band stars stay inside a band
        attempts: 6, // rejection sampling budget per star
      },
    },

    nebula: {
      textureSize: 256,
      textureVariants: 3,
      noiseScale: 2.6,
      fbm: { octaves: 4, lacunarity: 2.1, gain: 0.52 },

      // Five clouds placed by azimuth / elevation on the sky sphere
      clouds: [
        {
          azimuth: 0.9,
          elevation: 0.22,
          distance: 1150,
          scale: 1000,
          color: 0xff2d6f, // crimson magenta
          opacity: 0.26,
          rotation: 0.4,
          breathSpeed: 0.06,
          breathAmount: 0.3,
          variant: 0,
        },
        {
          azimuth: -1.4,
          elevation: 0.35,
          distance: 1150,
          scale: 880,
          color: 0x1fd6c8, // turquoise
          opacity: 0.2,
          rotation: -0.7,
          breathSpeed: 0.045,
          breathAmount: 0.35,
          variant: 1,
        },
        {
          azimuth: 2.6,
          elevation: 0.62,
          distance: 1150,
          scale: 760,
          color: 0xd83bff, // magenta violet
          opacity: 0.18,
          rotation: 1.1,
          breathSpeed: 0.07,
          breathAmount: 0.25,
          variant: 2,
        },
        {
          azimuth: -0.3,
          elevation: 0.12,
          distance: 1150,
          scale: 1150,
          color: 0x19b8e0, // cold turquoise
          opacity: 0.15,
          rotation: 0.15,
          breathSpeed: 0.035,
          breathAmount: 0.4,
          variant: 1,
        },
        {
          azimuth: 1.9,
          elevation: 0.95,
          distance: 1150,
          scale: 700,
          color: 0xff3b5c, // deep crimson
          opacity: 0.22,
          rotation: -1.3,
          breathSpeed: 0.055,
          breathAmount: 0.28,
          variant: 0,
        },
      ],
    },

    // Waving curtain sitting on the horizon line
    aurora: {
      radius: 1120,
      height: 420,
      baseY: -70, // bottom edge, relative to the camera
      radialSegments: 128,
      colorLow: 0x3dff9e, // green, near the horizon
      colorHigh: 0x8a3dff, // purple, higher up
      warmColor: 0xff7a2f, // warm orange under layer
      intensity: 0.5,
      warmIntensity: 0.3,
      warmHeight: 0.16, // how far up the warm layer reaches (0..1 of height)
      curtainHeight: 0.42, // average curtain height (0..1 of the cylinder)
      curtainVariation: 0.3,
      fadeBottom: 0.16, // softens the bottom rim into the horizon
      waveScale: 2.3, // slow channel: bends the top edge of the curtain
      waveSpeed: 0.035,
      rayScale: 22, // fast channel: how many vertical rays run around the ring
      rayFloor: 0.18, // lowest ray brightness, keeps gaps from going black
      rayContrast: 1.7,
      rayHeight: 0.22, // how much each ray pushes the top edge up or down
    },
  },

  // --- Temporary debug helpers (removed once phase 4 owns the camera) ---
  debug: {
    lookAroundSpeed: 0.9, // rad/s of camera yaw driven by the steer input
    lookPitchLimit: 1.35, // radians, keeps the debug look from flipping over
  },
};

export default config;
