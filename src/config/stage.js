/**
 * NEON RIDE - the staged run: a ride that ends.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as `config.stage`.
 *
 * ================= WHY A RUN NEEDS AN END =================
 *
 * The game had exactly one shape: ride until you crash. That is a score
 * attack, and a score attack has no finish, no result and nothing to have
 * done well AT. Every session ended the same way - badly, by definition - and
 * the only feedback was a number that meant nothing without a previous number
 * to compare it to.
 *
 * A stage is five kilometres with a line at the end of it. You either reach it
 * or you do not, and if you do there is a time and a medal attached. That is a
 * complete game in a shape somebody can finish in under a minute, which is
 * also exactly the length of a short-form video.
 *
 * ENDLESS SURVIVES AS ITS OWN MODE. The old ride-until-you-crash is what the
 * high score belongs to and what the autopilot records, and deleting it to
 * make room for the stage would trade one shape for another rather than
 * adding one. The title offers both.
 */

// --- The staged run ---
export const stage = {
  // Five kilometres. Measured against the two things it has to fit: the
  // autopilot covers it in about half a minute at full speed, and a real rider
  // weaving traffic takes closer to forty seconds. Short enough to retry
  // without resentment, long enough that the last kilometre is a different
  // proposition from the first - by then the lives are usually not all there.
  length: 5000, // world units, which are metres

  // A lit gate every kilometre, so the stage has a rhythm and a rider always
  // knows how much is left without reading the HUD. Four of them, then the
  // finish - the gate at 5000 is the finish line rather than a fifth
  // checkpoint, which is why this divides the length rather than counting.
  checkpointEvery: 1000,

  // Checkpoints do NOT extend a timer and do NOT restore a life. They are a
  // measure of progress, not a mechanic: a stage whose checkpoints hand back
  // resources turns the last kilometre into the only one that matters, and the
  // whole point of a five kilometre stage is that all five count.

  // ================= MEDALS =================
  //
  // Thresholds are MULTIPLES of a measured reference time, not absolute
  // seconds, so that a change to top speed or to traffic density moves them
  // with it instead of silently making gold unreachable. `referenceSeconds` is
  // re-measured by tools/stage-check.mjs, which drives the autopilot over a
  // full stage and prints what it took.
  //
  // The autopilot takes no collisions but it is NOT the theoretical floor: it
  // lifts for traffic it can see, and lands thirteen per cent slower than the
  // same bike over an empty five kilometres. The bands below are anchored to
  // that empty-road floor rather than to the bot, which is what lets gold sit
  // alongside the machine instead of behind it - see the table in `medals`.
  medals: {
    // MEASURED, not chosen: autopilot, full length, no collisions, on
    // 2026-09-19. Three runs gave 26.14, 26.17 and 26.90 s - the spread is the
    // traffic, which the bot has to lift for and which is not the same twice.
    // 26.3 sits in the middle of it, and the 0.76 s between the best and the
    // worst of those runs is worth remembering when reading `gold` below: the
    // machine itself lands either side of that threshold.
    //
    // tools/stage-check.mjs re-measures this on every run and FAILS if the
    // configured value has drifted more than 15 per cent from what the game
    // actually does, so a change to top speed or to traffic density cannot
    // quietly make gold unreachable. It measures on the GAME clock, the same
    // one the stage keeps - it used to measure on the wall clock and hand the
    // number to thresholds applied to the other, which made every medal
    // quietly easier on a machine that dropped frames.
    referenceSeconds: 26.3,

    // ============ WHY GOLD SITS ALONGSIDE THE MACHINE, NOT BEHIND IT ========
    //
    // The first threshold here was 1.12 - 29.5 s - written on the argument
    // that a rider who has to SEE the traffic cannot match one that knows
    // where all of it is. That argument was never measured, and the first
    // human finish broke it: 28.0 s, on a phone, steering by tilt, first time
    // the line was ever reached. A gold that falls on the first finish is not
    // a medal, it is a participation mark.
    //
    // What the measurement actually says. Integrating the bike constants at
    // 2 kHz over a clean five kilometres with NO TRAFFIC AT ALL gives 23.15 s
    // for VOLT (config/bikes.js) - 0.88 of the reference. So the autopilot is
    // thirteen per cent off the physical floor, and it is off it for one
    // reason: its Guard lifts for vehicles instead of threading them. That gap
    // is the room a rider has. Beating the machine here is not beating a
    // perfect line, it is declining to brake where the machine braked.
    //
    // So the bands are set against the floor rather than against the bot:
    //
    //   23.15 s   0.88   no traffic at all, throttle pinned. Unreachable.
    //   26.14 s   1.00   the autopilot, lifting for what it sees.
    //   26.83 s   1.02   GOLD
    //   28.0  s   1.065  the first human finish, mid-silver.
    //   30.25 s   1.15   SILVER
    //
    // Gold is two per cent slower than the machine and sixteen per cent slower
    // than the floor. It asks a rider to match the autopilot, which is a thing
    // that can be done and has to be ridden for - not to out-drive physics.

    // 26.8 s. Near-perfect: the throttle held through traffic the autopilot
    // lifted for. This is the one threshold here that is a judgement rather
    // than a measurement, and the judgement is now anchored to the no-traffic
    // floor above rather than to a feeling about what machines can do.
    gold: 1.02,
    // 30.2 s. A good clean run that braked for a few things, which is where
    // most finished runs should land - the first human finish sits 2.2 s
    // inside it, which is the slack a band wants if it is to mean "good" and
    // not "lucky".
    silver: 1.15,
    // Crossing the line at all is bronze. Deliberately generous: the stage
    // already has a fail state - three crashes - so a finish is itself the
    // achievement and the medal above bronze is the thing to chase.
    bronze: Infinity,
  },

  // How long the finish gate's flash and the run's last moments are allowed to
  // play before the results card arrives. Longer than the crash delay in
  // config/game.js: crossing a finish line is the shot, and a card dropped on
  // top of it throws away the one frame anybody would post.
  resultsDelay: 1.4, // seconds

  // Where the best time per road is kept. Keyed by road, because five
  // kilometres of Aurora Pass and five of Galaxy Road are not the same five
  // kilometres - different traffic mixes and different sight lines.
  storageKey: 'neon-ride.stage',

  // The chosen mode, remembered between sessions like the bike and the road.
  // Somebody who plays staged runs should not have to walk past the mode screen
  // choosing the same thing every time - the screen still appears, it simply
  // opens on what they picked last.
  modeStorageKey: 'neon-ride.mode',
};
