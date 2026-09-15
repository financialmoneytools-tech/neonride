/**
 * NEON RIDE - the run: scoring, failure and pause.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * SCORE IS DISTANCE PLUS NEAR MISSES, and the second half is the whole design.
 * Distance alone rewards holding the throttle open, which the bike does by
 * itself - `throttleFloor` means it accelerates with nobody touching it - so a
 * distance-only score is a score for doing nothing. A near miss is the one
 * thing in this game that can only happen on purpose: threading a gap at speed
 * rather than sitting in an empty lane. Paying for it is what makes the traffic
 * worth being near.
 */

// --- The run ---
export const game = {
  // Points per world unit travelled. One, so the number on screen and the
  // distance under the bike are the same thing and a player can read either.
  pointsPerUnit: 1,

  // A near miss is worth 120 units of road, which at top speed is about half a
  // second. Enough that threading traffic beats going round it; not so much
  // that the distance stops mattering.
  nearMissPoints: 120,

  // How many collisions end the run. One: with the speed loss and the sideways
  // shove a crash already costs a great deal, and a game that ends on the first
  // mistake is what makes the near miss bonus a decision rather than a freebie.
  // The autopilot manages ten minutes without a single hit, so it is survivable.
  crashesAllowed: 1,

  // Where the best score is kept. localStorage can throw outright - a browser
  // with site data blocked, or private mode on some versions - so every access
  // is guarded and the game runs without it.
  storageKey: 'neon-ride.best',

  // A collision is not the end of the shot. The crash flash, the speed loss and
  // the shove all want to be seen before a panel covers them, so the run is
  // over immediately - no score accrues - and the panel arrives after this.
  overDelay: 0.9,

  // Fade for the pause and game over panels, in milliseconds. Matches the
  // title card, because they are the same object as far as the eye is
  // concerned.
  fadeMs: 420,
};
