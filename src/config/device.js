/**
 * NEON RIDE - device, quality and touch settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * A phone is not a small desktop. It has a fraction of the fill rate, a display
 * dense enough to ask for four times the pixels, a browser chrome that grows
 * and shrinks under the page while you play, and no keyboard. Each of those is
 * handled here rather than being guessed at by the module that trips over it.
 */

// --- Quality presets ---
//
// A preset is a patch applied over the rest of config before anything is
// built. Only the settings that actually cost frames are listed: pixel ratio
// first, because with bloom on every extra device pixel costs two more full
// frame half float buffers, then the passes, then how much world is drawn.
//
// The numbers are chosen against fill rate, not against a device list, so a
// phone that turns out to be quick is not held back by its category.
export const quality = {
  // 'auto' picks from what the browser reports; the rest force a preset.
  // Cycled at runtime by the hotkey in ./core.js.
  preset: 'auto',

  presets: {
    high: {
      // What the project was tuned against. A desktop GPU.
      maxPixelRatio: 2,
      antialias: true,
      postprocess: true,
      bloomScale: 0.5,
      trafficScale: 1,
      starScale: 1,
    },

    medium: {
      // A recent phone, or a laptop on integrated graphics. The pixel ratio is
      // the whole difference at this level: 1.5 on a 3x display is a third of
      // the fragments of 2, and on a small screen the edges are already too
      // small to see.
      maxPixelRatio: 1.5,
      antialias: true,
      postprocess: true,
      bloomScale: 0.5,
      trafficScale: 0.8,
      starScale: 0.8,
    },

    low: {
      // A mid range phone. Antialiasing goes before bloom does, because bloom
      // is what the game looks like and MSAA on a 400 pixel wide frame is not.
      maxPixelRatio: 1,
      antialias: false,
      postprocess: true,
      bloomScale: 0.35,
      trafficScale: 0.6,
      starScale: 0.55,
    },

    minimum: {
      // The last resort, for when even low will not hold 30. This drops the
      // whole post chain, so there is no bloom and no tone curve and the game
      // stops looking like itself. Nothing picks it automatically; it is a
      // manual choice.
      maxPixelRatio: 1,
      antialias: false,
      postprocess: false,
      bloomScale: 0.35,
      trafficScale: 0.5,
      starScale: 0.4,
    },
  },

  // What 'auto' resolves to. Touch plus a small screen means a phone; the
  // memory and core hints are advisory and often absent, so they can only move
  // an already mobile device down, never move a desktop down.
  auto: {
    // Below this many CSS pixels on the short edge, treat it as a phone rather
    // than a tablet.
    phoneShortEdge: 500,
    // navigator.deviceMemory in GB, and hardwareConcurrency, under which a
    // touch device drops from medium to low.
    lowMemory: 4,
    lowCores: 6,
  },
};

// --- Touch controls ---
export const touch = {
  // Steering is the bottom band only. The old scheme took the whole screen,
  // which meant a thumb resting anywhere - or a tap meant for nothing in
  // particular - was a steering input. Holding a phone in landscape puts both
  // thumbs in the bottom corners, and that is the only place a control can be
  // without the hand covering the road.
  band: {
    // Share of the frame height, measured up from the bottom, that steers.
    // Above it, touches still drive but do not steer, so grabbing the top of
    // the phone to steady it does nothing unexpected.
    height: 0.55,
    // Share of the frame width at the outside edge that each thumb owns.
    width: 0.4,
  },

  // Screen fraction that separates left from right for touches outside the
  // thumb zones.
  steerSplit: 0.5,

  // Holding both sides brakes. A rider brakes far more often than they need
  // both thumbs on the same side, so this stays the gesture.
  bothSidesBrake: true,

  // Touch alone means full throttle, which is right for a game played with two
  // thumbs, but it also means the bike never coasts. Off, throttle has to be
  // held on the right and the left is steering only.
  autoThrottle: true,
};

// --- Viewport ---
export const viewport = {
  // Mobile browsers grow and shrink the page as the address bar hides and
  // shows, and each change is a full renderer resize plus two composer buffer
  // reallocations. Debouncing means a scroll driven chrome animation costs one
  // resize at the end instead of one per frame.
  resizeDebounce: 0.15, // seconds

  // Changes smaller than this many CSS pixels on either edge are ignored
  // entirely. The address bar is far larger than this; a scrollbar or a
  // rounding difference is not.
  minChange: 2,

  // visualViewport reports the area actually visible, which is what the address
  // bar changes. window.innerHeight lags it and on some browsers never catches
  // up, leaving a strip of canvas under the chrome.
  useVisualViewport: true,

  // Fullscreen hides the browser chrome outright, which is both the better
  // picture and the end of the resize problem. It needs a user gesture, so it
  // can only be offered, not taken.
  fullscreen: {
    // Ask on the first touch. Desktop is left alone: a browser going
    // fullscreen because someone clicked the page is hostile.
    onFirstTouchWhenCoarse: true,
    // Also try to lock the orientation once fullscreen. Widely unsupported and
    // allowed to fail silently; the game plays in both orientations anyway.
    lockOrientation: 'landscape',
  },
};
