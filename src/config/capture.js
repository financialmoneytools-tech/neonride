/**
 * NEON RIDE - capture mode.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * Everything that has to be true for a clean recording and is not true while
 * playing: no overlay, a pixel ratio that does not depend on which screen the
 * window happens to be on, and optionally a slow drift so a hands off recording
 * still has motion in it.
 */

// --- Capture mode ---
export const capture = {
  enabled: false, // the C key toggles this at runtime

  // Fixed while capturing, so two recordings of the same run match frame for
  // frame whatever display they were made on. 1 keeps the cost predictable;
  // raise it to 2 for a sharper master if the frame rate can carry it.
  pixelRatio: 1,

  hideOverlay: true,

  // Slow automatic weave, so footage recorded with no hands on the keyboard
  // still drifts across the road instead of tracking the centre line dead
  // straight. Fed in as steer, so the bars turn and the bike leans with it.
  //
  // Steer is a VELOCITY command, not a position, so anything sustained pins the
  // bike against lateralLimit and parks there. To weave to an amplitude A over
  // a period T instead, peak steer is about 2*PI*A / (T * lateralSpeed), which
  // at A = 3.5 units and T = 19 s is roughly 0.1. Raising `amount` past about
  // 0.2 just holds the bike on the edge of the road.
  drift: {
    enabled: true,
    amount: 0.12, // peak steer, 1 is full lock
    period: 19, // seconds for a full left-right-left cycle
  },
};
