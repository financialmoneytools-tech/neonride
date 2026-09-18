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
  // The autopilot holds 98 per cent of top speed and takes no collisions, so
  // its time is very close to the theoretical floor. Gold therefore is NOT set
  // at the reference: a human who has to actually see the traffic cannot match
  // a machine that knows where all of it is, and a gold nobody can earn is a
  // medal that only says "you are not the computer".
  medals: {
    // MEASURED, not chosen: 5001 units in 26.27 s, autopilot, full length, no
    // collisions, on 2026-09-18. tools/stage-check.mjs re-measures it on every
    // run and FAILS if the configured value has drifted more than 15 per cent
    // from what the game actually does - so a change to top speed or to traffic
    // density cannot quietly make gold unreachable.
    referenceSeconds: 26.3,

    // 29.5 s. The autopilot knows where every vehicle is and never lifts; a
    // rider who has to see the traffic first cannot match it, so gold is set
    // above the machine rather than at it. This is the one threshold here that
    // is a judgement rather than a measurement, and the judgement is that gold
    // should need a clean run with the throttle held through traffic - not a
    // perfect one.
    gold: 1.12,
    // 34.7 s. A good ride that braked for a few things, which is where most
    // finished runs should land.
    silver: 1.32,
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
