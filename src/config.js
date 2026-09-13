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
    lookAt: { x: 0, y: 1.0, z: 0 },
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

  // --- Temporary debug scene (removed in phase 2) ---
  debug: {
    grid: {
      size: 200,
      divisions: 100,
      colorCenter: 0xff2fd0, // magenta
      colorGrid: 0x0a3a4a, // dim cyan
    },
    cube: {
      size: 1.5,
      position: { x: 0, y: 1.2, z: 0 },
      spinSpeed: { x: 1.5, y: 2.0 }, // rad/s
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.6,
    },
  },
};

export default config;
