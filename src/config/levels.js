/**
 * NEON RIDE - ten levels to a road.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as `config.levels`.
 *
 * ================= WHY TEN LEVELS AND NOT ONE STAGE =================
 *
 * A single five kilometre stage ends just as a rider settles into it. Half a
 * minute is long enough to prove the road works and too short for it to say
 * anything: there is no point at which the ride has changed, because nothing
 * about it changes. So a road is now TEN levels of five kilometres, ridden
 * continuously, and each one is harder than the last.
 *
 * NOTHING STOPS AT A LEVEL BOUNDARY. The gate lights, a banner says which
 * level this now is, the traffic re-tunes and the riding carries on. A run has
 * exactly one interruption and it is the end of the run - either the third
 * crash or the celebration at the end of level ten.
 *
 * ================= THE PART THAT IS NOT NEGOTIABLE =================
 *
 * `config/traffic.js` documents the guaranteed escape lane, the no-walls rule
 * and the speed aware spacing as the things that make the road playable, and
 * says they were measured to get there. Difficulty rises AROUND them. It does
 * not rise through them. `floor` below is that promise written as numbers and
 * tools/level-check.mjs asserts every one of them over a real ten level run
 * rather than trusting this comment.
 *
 * The one that looks like a difficulty knob and is not is `escape.window` -
 * the stretch of road over which two vehicles count as being level with each
 * other. Shrinking it would let two staggered pairs block all four lanes
 * across forty five metres, which at two hundred metres a second is 0.22 s
 * apart: the player commits to a gap and the gap closes before they arrive.
 * That is the definition of unfair, so the window is fixed at every level.
 */

/**
 * The curve, as the two ends of it. The per-level rows below were generated
 * from these and are then free to be nudged one at a time - which is the whole
 * reason they are written out rather than interpolated at runtime. A formula
 * is one decision; a table is ten, and level seven being half a second mean is
 * a thing somebody should be able to fix without moving nine other levels.
 */
export const curveEnds = {
  density: [0.30, 0.62],
  gapReaction: [0.55, 0.34],
  truckShare: [0.60, 1.00],
  speedSpread: [0.55, 0.80],
  weaveScale: [0.40, 0.75],
  laneChangeRate: [0, 0.020],
};

/**
 * ================= THE TRIM THAT WAS TRIED AND REVERTED =================
 *
 * Levels nine and ten were once cut to 0.54/0.39/0.74 and 0.56/0.38/0.76, on
 * the belief that the top of the curve was unfair. Two measurements killed it:
 *
 *   1. It was never unfair. The evidence was a "trapped" count that turned
 *      out to be a proxy miscounting - it read occupied LANE CENTRES, and the
 *      bike's lateral position is continuous and rides between lanes. The
 *      corridor test that replaced it reads zero on every level, both roads,
 *      both modes.
 *   2. The trim removed the top end rather than softening it. Measured with
 *      the novice bot on galaxyRoad, level ten fell from 4.10 crashes per
 *      kilometre to 1.42 - BELOW levels seven, eight and nine. A level ten
 *      that is easier than level seven is not a top end.
 *
 * Level ten is the one level where both roads agreed closely before the trim
 * (4.10 and 3.90), which makes it the most trustworthy number in the table
 * and the last one to go cutting at.
 */

// --- Ten levels ---
export const levels = {
  count: 10,

  // A level is `config.stage.length` long - five kilometres - and that stays
  // in config/stage.js because it is what drives the finish and what
  // tools/stage-check.mjs shortens to test one. A level is a stage; ten of
  // them are a road.

  // How far into a level the difficulty takes to arrive. The traffic does not
  // step from one level's density to the next on the frame the gate is
  // crossed: it ramps over the first kilometre, so a level begins by getting
  // harder rather than by being harder.
  rampMeters: 1000,

  // How long the level banner stays up. Long enough to read at 220, short
  // enough that it is gone before the next thing worth looking at - it sits
  // over a road that has not stopped moving, so it cannot outstay a corner.
  bannerSeconds: 2.2,

  // ================= LIVES =================
  //
  // ONE BACK PER LEVEL, capped at three. Not a refill, and the difference
  // matters: a refill means the only level that can end a run is the one you
  // are on, and the ten of them stop being a journey. One back means a rider
  // who arrives at level eight on one life can climb back to two by level
  // nine, but never buys their way out of a bad run in a single gate.
  livesPerLevel: 1,
  // Capped at `config.game.crashesAllowed`, read at runtime rather than
  // duplicated here, so the two cannot disagree.

  // ================= THE DIFFICULTY CURVE =================
  //
  // `config/traffic.js` -> `models.player` is the LEVEL ONE BASELINE. Every
  // row here replaces the corresponding field for the level it names, and
  // anything not named here is the shared model and is not per level.
  //
  // What the numbers mean, against the 79 vehicle pool:
  //
  //   density      share of every pool live. L1 is about 24 vehicles spread
  //                over the kilometre ahead, L10 about 49. Today's game caps
  //                at 0.5 (~40), so LEVEL ONE IS EASIER THAN THE GAME IS NOW
  //                and level ten is meaningfully harder. That is deliberate:
  //                ten levels that all start at the old difficulty would be
  //                ten levels with nowhere to go.
  //
  //   gapReaction  the speed aware spacing, `gap.base + reaction * speed`.
  //                `gap.base` is fixed at 30. At 200 m/s that is 140 m at L1
  //                and 98 m at L10 - 0.70 s of reaction time falling to 0.49.
  //                It never goes below `floor.minReactionSeconds`.
  //
  //   truckShare   multiplies the THEME's mix, and only for types carrying
  //                `type.truck` - boxTruck and semi. A truck is the widest
  //                thing on the road and the thing worth overtaking, so
  //                thinning them is the single largest relief available early
  //                and restoring them is the largest late.
  //
  //   speedSpread  how far each type's speed range opens from its midpoint.
  //                Wider is less predictable. It stops at 0.80 rather than
  //                reaching god mode's 1.0, which config/traffic.js calls
  //                closing speeds a player cannot plan around.
  //
  //   weaveScale   how far a motorcycle wanders inside its lane.
  //
  //   laneChange   changes per vehicle per second. ZERO AT LEVEL ONE - the
  //                mechanic does not exist for a rider who has just started -
  //                rising to one change per vehicle per fifty seconds, which
  //                across a full road is about one a second somewhere in
  //                sight. See `laneChange` below for the rules it obeys.
  rows: [
    // lvl                density  gapReaction  truckShare  speedSpread  weaveScale  laneChange
    /*  1 */ { density: 0.30, gapReaction: 0.55, truckShare: 0.60, speedSpread: 0.55, weaveScale: 0.40, laneChange: 0.000 },
    /*  2 */ { density: 0.34, gapReaction: 0.53, truckShare: 0.64, speedSpread: 0.58, weaveScale: 0.44, laneChange: 0.002 },
    /*  3 */ { density: 0.37, gapReaction: 0.50, truckShare: 0.69, speedSpread: 0.61, weaveScale: 0.48, laneChange: 0.004 },
    /*  4 */ { density: 0.41, gapReaction: 0.48, truckShare: 0.73, speedSpread: 0.64, weaveScale: 0.52, laneChange: 0.007 },
    /*  5 */ { density: 0.44, gapReaction: 0.46, truckShare: 0.78, speedSpread: 0.66, weaveScale: 0.55, laneChange: 0.009 },
    /*  6 */ { density: 0.48, gapReaction: 0.43, truckShare: 0.82, speedSpread: 0.69, weaveScale: 0.59, laneChange: 0.011 },
    /*  7 */ { density: 0.51, gapReaction: 0.41, truckShare: 0.87, speedSpread: 0.72, weaveScale: 0.63, laneChange: 0.013 },
    /*  8 */ { density: 0.55, gapReaction: 0.39, truckShare: 0.91, speedSpread: 0.75, weaveScale: 0.67, laneChange: 0.016 },
    /*  9 */ { density: 0.58, gapReaction: 0.36, truckShare: 0.96, speedSpread: 0.77, weaveScale: 0.71, laneChange: 0.018 },
    /* 10 */ { density: 0.62, gapReaction: 0.34, truckShare: 1.00, speedSpread: 0.80, weaveScale: 0.75, laneChange: 0.020 },
  ],

  // ================= THE FAIRNESS FLOOR =================
  //
  // Identical at every level, including ten. tools/level-check.mjs drives the
  // autopilot through a whole road and asserts each of these against what the
  // traffic actually did, not against what this file says - a constant that is
  // only read by the code that sets it proves nothing.
  floor: {
    maxAbreast: 2, // occupied lanes allowed in one stretch, of four
    trucksAbreast: 1,
    escapeWindow: 58, // metres counted as "level with each other"
    gapBase: 30,
    // Reaction time at the bike's top speed, in seconds, below which the road
    // is unfair whatever else is true. L10 lands at 0.49 against this.
    minReactionSeconds: 0.45,
  },

  // ================= LANE CHANGES =================
  //
  // The one genuinely new traffic behaviour, and the one with the most ways to
  // quietly break the guarantee. Until this, a vehicle picked a lane when it
  // respawned and stayed in it; only a motorcycle moved, and only inside its
  // own lane.
  //
  // A change may begin only when ALL of these hold, and world/Traffic.js
  // checks every one of them:
  //   - the destination passes `_admits()` - the escape guarantee is
  //     RE-CHECKED at the moment of the move, never assumed from spawn time
  //   - the vehicle is at least one full speed aware gap AHEAD of the player,
  //     so a cut in always carries the same reaction time a static obstacle
  //     would
  //   - the destination respects the type's `minLane`
  //
  // And while it is moving it occupies BOTH lanes for the purposes of
  // `_admits()`, so nothing can fill the lane it is leaving. That is the
  // detail that stops lane changes from breaking the no-walls rule without
  // anybody seeing it happen.
  laneChange: {
    // Blinks before it moves, so the move is readable rather than sudden. The
    // strip's instance colour alternates to amber - the same trick the
    // ambulance beacon uses, which costs no geometry and no draw call.
    signalSeconds: 0.8,
    signalColor: 0xffb42a,
    signalRate: 3.2, // blinks a second
    // How long the lateral move takes. Long enough to read as a decision.
    seconds: 1.4,
  },

  // ================= MEDALS =================
  //
  // One medal per level, against THAT LEVEL'S OWN measured reference time. A
  // shared reference would be wrong in the only direction that matters: level
  // ten runs 49 vehicles against level one's 24, so the same five kilometres
  // genuinely takes longer, and a single threshold would make late gold
  // unreachable while early gold was free.
  //
  // The multipliers are the ones config/stage.js already argues for and they
  // do not change per level - what changes is what they are multiplied by.
  medals: { gold: 1.02, silver: 1.15, bronze: Infinity },

  // MEASURED BY tools/level-check.mjs - autopilot, full length, no collisions,
  // one entry per level. It re-measures on every run and FAILS if any entry
  // has drifted more than 15 per cent, the same rule config/stage.js has had.
  //
  // MEASURED 2026-09-19, full length, both roads averaged, autopilot driving
  // a real staged run with no collisions.
  //
  // IT IS FLAT, AND THAT IS THE MEASUREMENT RATHER THAN A FAILURE TO TUNE.
  // The bot's level one to level ten difference is 2 per cent. It has perfect
  // information and it WEAVES rather than lifting, so twice the traffic costs
  // it almost no time at all - which makes it the wrong instrument for asking
  // whether a level is harder, and the right one for the only thing these
  // numbers are for: the floor a human's time is measured against.
  //
  // The extra difficulty of level ten is real and it is paid in CRASHES, not
  // in seconds. A rider who never touches anything should be able to run a
  // late level at close to the pace of an early one; a rider who does not
  // will lose lives, and the lives are what ends the run.
  //
  // Seeding these by guesswork was worse than useless: the guessed table rose
  // to 30.2 s at level ten against a measured 25.4, so gold at level ten
  // would have been handed to anyone who finished.
  referenceSeconds: [24.9, 23.0, 24.7, 24.3, 24.4, 23.1, 25.7, 24.8, 23.9, 25.4],

  // Where per-road progress is kept. Replaces the bare `{road: seconds}` that
  // config/stage.js used to write; see game/Progress.js for the shape and for
  // the migration that reads the old value as level one's time.
  storageKey: 'neon-ride.roads',
};

/**
 * The tuning for one level, clamped so a level number from storage or a URL
 * can never index past the table.
 * @param {number} level 1-based
 * @returns {object} a row from `levels.rows`
 */
export function levelRow(level) {
  const rows = levels.rows;
  const index = Math.max(0, Math.min(rows.length - 1, Math.round(level) - 1));
  return rows[index];
}
