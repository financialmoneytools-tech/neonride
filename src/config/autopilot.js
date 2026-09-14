/**
 * NEON RIDE - self driving settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * The autopilot exists to record footage, not to play the game. It is judged on
 * one thing: whether a clip of it looks like an expert rider. So it is built to
 * drive through the SAME input the player uses - steer, throttle, brake - and
 * not to move the bike itself. Nothing about the physics, the lean, the bob or
 * the camera knows the difference, which is also why it cannot drift out of
 * sync with anything: there is no second path for it to drift from.
 */

export const autopilot = {
  enabled: false,

  // Turning it on also turns on capture mode: overlay off, pixel ratio pinned.
  // That is the whole point of it, so it is the default rather than a choice
  // that has to be remembered at the moment of recording.
  withCapture: true,

  // --- How it is opened -------------------------------------------------
  //
  // Hidden means hidden: no button, no hint, nothing in the overlay. Typing
  // the sequence anywhere opens it, and a console call does the same for
  // anyone driving a recording from a script.
  reveal: {
    sequence: ['KeyG', 'KeyO', 'KeyD'],
    // Seconds allowed between keys before the sequence resets. Long enough to
    // type deliberately, short enough that it will not fire by accident during
    // a run - G, O and D are not driving keys, but a stray order should not
    // accumulate over a minute.
    window: 1.2,
  },

  // --- The line ---------------------------------------------------------
  line: {
    // How far down the road the corner is read. Too short and it turns in
    // late like a novice; too long and it starts cutting before the corner
    // exists, which reads as a camera on rails rather than a rider.
    lookAhead: 150,

    // Units of lateral offset per unit of road bend over the lookahead. The
    // bend is measured as how far the road has moved across its own start
    // frame, which needs no curvature maths and no sign conventions to get
    // backwards.
    gain: 0.55,

    // Share of the reachable band the racing line may use. Left under 1 so
    // there is always somewhere to go when a vehicle appears on the line.
    reach: 0.72,
  },

  // --- Traffic ----------------------------------------------------------
  traffic: {
    // Vehicles further ahead in time than this are not planned around yet.
    // Seconds, not distance, so it scales with speed on its own.
    //
    // This is a trade between safety and how the ride looks, and both ends of
    // it were measured over three minutes. At 7 it is flawless and boring: no
    // collisions, 98 per cent of top speed, and the bike never leaves the
    // middle of the road, because planning against seven seconds of traffic at
    // once leaves the centre as the only place clear of everything. At 2.5 it
    // uses the whole road and hits something. At 5 it is still no collisions,
    // 89 per cent, and it moves.
    horizon: 3,


    // Closer than this along the road and it counts as alongside: a problem
    // now, not in however many seconds the closing speed works out to.
    alongside: 12,


    // Clearance the PLANNER will not go below when choosing a line. Distinct
    // from the guard's floor: this is what it aims to keep, that is what it
    // cannot cross. Keeping them apart means the guard stays a last resort
    // rather than something the plan leans on.
    safety: 0.25,

    // The gap the bike AIMS to pass at, edge to edge, and what wanting it is
    // worth against holding the racing line.
    //
    // This is what makes it thread rather than avoid: an open road to the side
    // costs as much as a vehicle too close, so the bike goes looking for the
    // slot between two of them instead of the space beside all of them. It is
    // only safe to aim this fine because the guard below cannot be crossed -
    // without that, aiming near the floor is aiming at a collision.
    thread: 0.35,
    threadWeight: 4,

    // Cost per unit away from the racing line, and per unit of lateral move
    // from where the bike already is. The second one is what stops it
    // twitching between two nearly equal gaps.
    lineWeight: 1,
    effortWeight: 0.55,

    // A new line has to beat the one being followed by this much before the
    // bike switches. Hysteresis, so it commits to a gap the way a rider does.
    // Measured low: at 0.6 the two gaps either side of a car traded places on
    // the smallest change and the plan flipped from one edge of the road to the
    // other several times a second.
    switchMargin: 2.2,

    // Share of the theoretically reachable lateral move that is treated as
    // actually reachable, so a gap is only chosen if it can be made
    // comfortably rather than at full lock.
    reachSafety: 0.75,

    // When there is nowhere safe at all, how far the bike will move looking
    // for room. Small on purpose: trapped is the moment to shuffle, not to
    // cross the road, because the widest gap on the far side is no use if
    // getting to it means going through everything in between.
    //
    // This one number was the difference between an autopilot that worked and
    // one that did not. Unbounded, a single trapped frame threw the plan to the
    // far side of the road, the bike set off across three lanes of traffic, and
    // being in the middle of them produced more trapped frames: measured, four
    // collisions and 65 per cent of top speed. Bounded at 1.2 it is none and
    // 98 per cent.
    escapeReach: 1.2,

    // Candidate lines tested across the band each frame. 41 is a step of about
    // 27 cm across the reachable width, finer than the margins being judged.
    candidates: 41,
  },

  // --- The guard --------------------------------------------------------
  //
  // The cheat that makes failure impossible. See autopilot/Guard.js.
  guard: {
    enabled: true,

    // Clear air kept between the two, in units, when the guard has to step in.
    // Small: it is a floor, not a margin, and the planner already aims well
    // above it. Big enough that the collision test can never see an overlap.
    floor: 0.05,

    // How far ahead of the actual overlap the guard starts easing the bike
    // clear, as a multiple of the collision length. Well ahead on purpose:
    // inside this window it moves a little each frame, so by the time the real
    // overlap arrives there is usually nothing left to correct. Together with
    // easeRate this is what keeps the guard invisible.
    lead: 3,

    // Units per second the easing may move the bike, and the single number
    // that decides whether the guard can be seen. It has to be fast enough to
    // have finished before the overlap arrives, because whatever it has not
    // finished gets applied whole on the last frame - and since the view is now
    // built from the guarded position, that remainder is a visible jump.
    //
    // Measured over three minutes at this density: at 9 the guard made 68
    // corrections of a tenth of a unit or more and three above 1.2. At 40 it
    // makes none in between and two above 1.2, with everything else under a
    // tenth, which is less than the bike's own bob.
    easeRate: 40,
  },

  // --- Hands ------------------------------------------------------------
  //
  // What stops it looking like a machine. A perfect controller holds a line to
  // the millimetre and corrects with a step; a rider breathes, drifts a little
  // and corrects smoothly.
  hands: {
    // Steer per unit of lateral error. The bike takes a RATE command, so this
    // is a proportional controller on position.
    steerGain: 0.55,

    // Seconds the steering takes to follow a change in what is being asked of
    // it. This is the whole difference between a step and a hand.
    steerTau: 0.16,

    // Slow wander added to the target line, in units and Hz. Small: it should
    // read as a rider not being a robot, not as a rider being unsteady.
    driftAmount: 0.22,
    driftSpeed: 0.08,

    // The wander fades out as the bike closes on a vehicle, reaching nothing
    // when the clear air beside it is gone. It has to: the margin the plan
    // works to is a third of a unit and the wander is two thirds of that, so
    // left running in a gap it is the difference between a close pass and a
    // hit. Only vehicles arriving within steadyBefore seconds count.
    steadyWithin: 1.6,
    steadyBefore: 2,

    // Faster, much smaller noise on the steering itself, for the constant tiny
    // corrections a hand makes.
    jitterAmount: 0.035,
    jitterSpeed: 1.7,
  },

  // --- Throttle ---------------------------------------------------------
  throttle: {
    // Brake only when there is nowhere safe to be. Full commitment otherwise:
    // the footage wants the speed.
    brakeForce: 1,

    // Once braking, keep braking for at least this long, so a single awkward
    // frame does not produce a visible stab at the brakes.
    brakeHold: 0.35,

    // How far the guard can still owe the bike before the throttle comes off.
    // Measured over ten minutes: at 2 the guard still had to make one
    // correction of 3.65 units, which at sixty frames a second is a jump you
    // can see. At 0.6 the largest correction in the whole run is 0.186, and the
    // speed cost is two tenths of one per cent.
    // Past this the gap the plan chose is not there, and slowing is the only
    // thing that helps: it pushes every arrival further out, which opens every
    // gap ahead. Falling back and waiting is also what a rider does, and it is
    // the only honest answer once the view is built from the guarded position -
    // a large silent correction was what made the bike appear to pass through
    // vehicles in the first place.
    crowdedAt: 0.6,

    // Share of top speed below which it will not brake at all, whatever the
    // road looks like. Without a floor the bike brakes, drops under the
    // traffic's speed, stops closing on anything, sees an empty road, opens the
    // throttle and repeats - an oscillation that spent one measured run at an
    // average of 73 per cent of top speed with a low of 2. Below the floor the
    // answer is to steer, not to slow down more.
    speedFloor: 0.62,
  },
};
