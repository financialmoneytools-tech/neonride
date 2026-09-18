/**
 * NEON RIDE - the screen flash, and every source allowed to raise one.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.flash.
 *
 * ONE FLASH, FOUR CALLERS. There used to be two flashes - a collision and a
 * near miss - raised inside world/traffic/TrafficEvents.js, decayed inside
 * world/Traffic.js and resolved inside fx/Postprocess.js, with the numbers in
 * config/traffic.js. Three files owned a piece of it and none owned the whole,
 * and that is precisely how the fault below survived.
 *
 * THE FAULT, measured with tools/flash-probe.mjs before any of this was
 * written: the collision flash kept firing after the run had ENDED. Session
 * stops updating when the phase leaves RUNNING, so `state.invulnerable` froze
 * at 1.60 and never decayed, while Traffic went on detecting overlaps and went
 * on raising the flash on its own 1.2 s refractory. Measured over one 60 s run:
 * 31 of 34 flashes fired after the third life was gone, one every ~1.43 s, for
 * as long as the game-over panel was up. The sky is the periphery of the frame
 * and `edge` puts the most light exactly there, so what a player sees is not a
 * flash at all - it is a sky that has turned deep red and stayed that way.
 * Measured on Galaxy Road: the sky band goes from RGB 7,12,19 to 142,18,17.
 *
 * Neither of the two things that should have stopped it existed. Nothing asked
 * whether the rider was inside the grace window, and nothing asked whether the
 * run was still going. Both are properties of the RUN, not of traffic, which is
 * why they are stated here once and enforced in fx/Flash.js once, rather than
 * being remembered at four call sites.
 *
 * EVERY FLASH GOES THROUGH motionScale('flash'). CLAUDE.md requires it of
 * anything new that moves or pulses, and a full frame pulse several times a
 * minute is the most obvious trigger the project has added since the weather.
 */

export const flash = {
  enabled: true,

  /**
   * Scale applied to every source at once, so a theme or a capture profile can
   * turn the whole response down without reaching into four separate numbers.
   */
  gain: 1,

  /**
   * THE SOURCES. Each one is a complete description of a flash: what colour,
   * how bright, how far out toward the edge, how long it lasts, how soon it may
   * happen again, and - the part that was missing - when it is not allowed to
   * happen at all.
   *
   * `edge` 0 fills the frame evenly, 1 hugs the periphery. Remember which part
   * of this frame the periphery is: on a motorcycle at speed, the middle is
   * road and the outside is sky.
   *
   * `requiresRun` - only while the run is actually scoring. A flash raised by
   *   traffic belongs to the run and must stop when the run does.
   * `blockedWhileInvulnerable` - the grace window after a crash. The window
   *   exists because a collision often leaves the bike inside the vehicle; a
   *   flash that ignores it charges the eye for a mistake the game has already
   *   decided not to charge the player for.
   */
  sources: {
    // A hit. The deepest red the renderer can produce, and deliberately so -
    // but it is one pulse per mistake now, not one per contact.
    collision: {
      color: 0xff3a2a,
      strength: 0.5,
      edge: 0.55, // keep the middle of the frame legible even on a hit
      duration: 0.35,
      refractory: 1.2,
      priority: 3,
      requiresRun: true,
      blockedWhileInvulnerable: true,
    },

    // Passing close without touching: the moment worth recording, so it gets a
    // cool flash far softer than a collision, plus a widening of the fringes.
    nearMiss: {
      color: 0x9ad8ff,
      strength: 0.38,
      edge: 1, // hugs the edges; a near miss happens several times a minute
      duration: 0.4,
      refractory: 0,
      priority: 1,
      requiresRun: true,
      // A near miss judged while the bike is inside a vehicle is not a near
      // miss, it is the same collision being measured from within.
      blockedWhileInvulnerable: true,
      // Extra chromatic aberration while it is live. Not light, so it is not
      // part of `strength`, but it belongs to the same event.
      aberrationBoost: 0.004,
    },

    // Passing a checkpoint gate. Warm and brief: an arrival, not an alarm, and
    // it must never be mistaken for the collision red.
    checkpoint: {
      color: 0x7dffc4,
      strength: 0.30,
      edge: 0.7,
      duration: 0.30,
      refractory: 0,
      priority: 2,
      requiresRun: true,
      blockedWhileInvulnerable: false,
    },

    // The road changing under a light gate. The one source that is NOT a run
    // event: god mode rides through these for footage, with no run at all, and
    // a gate that does not flash on a recording is a gate that was built for
    // nobody.
    themeGate: {
      color: 0xffffff,
      strength: 0.42,
      edge: 0.25, // across the whole frame; this one is meant to cover a change
      duration: 0.55,
      refractory: 0,
      priority: 4,
      requiresRun: false,
      blockedWhileInvulnerable: false,
    },
  },
};
