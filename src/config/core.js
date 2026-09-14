/**
 * NEON RIDE - renderer, camera, loop and input settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 */

// --- Render layer ---
export const renderer = {
  antialias: true,
  maxPixelRatio: 2, // anything above this kills performance
  powerPreference: 'high-performance',
  clearColor: 0x020108, // matches the sky base color

  // With bloom on, every extra device pixel costs two more full frame half
  // float buffers. This is the first thing to lower if the frame rate is short
  // on a high density display: 1.5, or 1, before touching any bloom setting.
  // Tone mapping exposure is NOT here; it belongs to the grade pass, at
  // config.postprocess.exposure.
};

// --- Camera ---
export const camera = {
  fov: 75,
  near: 0.1,
  far: 2000,
  position: { x: 0, y: 2.2, z: 6 }, // temporary: phase 4 hands this to the rider
  lookAt: { x: 0, y: 2.2, z: 0 }, // level with the horizon
};

// --- Main loop ---
export const loop = {
  maxDelta: 0.05, // keeps dt sane when the tab goes to the background
};

// --- Measurement overlay ---
export const stats = {
  enabled: true, // when false the overlay is never created
  updateInterval: 0.5, // seconds between counter refreshes
};

// --- Input ---
export const input = {
  // Smoothing time constants in seconds. Smaller = snappier response.
  steerSmoothing: 0.12,
  throttleSmoothing: 0.18,
  brakeSmoothing: 0.08,
  gamepadDeadzone: 0.15,
  gamepadTriggerThreshold: 0.05,
  touchSteerSplit: 0.5, // screen fraction that separates the left/right half
};
