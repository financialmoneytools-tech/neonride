import { config } from '../../config.js';

/**
 * planLine - chooses where across the road to be.
 *
 * Split out of Autopilot.js so each file has one job: that one reads the world
 * and works the bars, this one makes the single decision between them.
 *
 * The band is sampled across its whole width and every candidate scored.
 * Sampled rather than solved, because what is being optimised is not a well
 * behaved function: it rewards being NEAR a vehicle while forbidding being too
 * near, so there is a peak just outside every vehicle and a hole in the middle
 * of it, and a gradient method would settle into whichever hole it started
 * beside. Forty one samples across eleven units is a step of about 27 cm, finer
 * than any margin being judged, and at this scale it costs nothing.
 *
 * Three things disqualify a candidate outright, checked before anything is
 * scored:
 *
 *   too close   inside a vehicle's collision reach plus the safety margin.
 *               This is the one hard rule in the whole autopilot.
 *   too far     not reachable before that vehicle arrives, judged at a
 *               comfortable fraction of full lock rather than at the limit.
 *   off road    outside what the bike can reach at all.
 *
 * What survives is scored on distance from the racing line and on how far the
 * bike has to move to get there, against a reward for passing close enough to
 * set off a near miss. That reward is what makes the footage: without it the
 * bike takes the widest gap every time and every overtake looks the same.
 */

/**
 * @param {import('../Autopilot.js').Autopilot} autopilot
 * @param {object} cfg config.autopilot
 * @param {number} racing the racing line offset for the current corner
 * @param {object} state shared loop state
 * @returns {{line: number, target: number, blocked: boolean}}
 */
export function planLine(autopilot, cfg, racing, state) {
  const bike = config.player.bike;
  const obstacles = autopilot._obstacles;
  const current = autopilot.bike.lateral;
  const limit = bike.lateralLimit;

  state.autopilotBlocked = false;

  if (obstacles.length === 0) {
    const open = clamp(racing, -limit, limit);
    return { line: open, target: open, blocked: false };
  }

  // How fast the bike can move across. Steering authority falls away at low
  // speed, and the steering commands a RATE which the bike's position then
  // follows through a damped filter, so the first lateralTau of any move is
  // spent getting going.
  const authority = 0.35 + 0.65 * (autopilot.bike.speed / bike.maxSpeed);
  const rate = bike.lateralSpeed * authority * cfg.traffic.reachSafety;

  const steps = Math.max(3, cfg.traffic.candidates | 0);
  const at = (i) => -limit + (2 * limit * i) / (steps - 1);

  // Which vehicles are worth treating as rules, decided before any line is
  // scored. A vehicle no line on the whole road can clear is not a constraint,
  // it is a fact: the bike is already inside its path and will be for the
  // moment it takes to go by. Letting one of those veto rules out every
  // candidate at once, and on a busy road there is nearly always one - measured,
  // the planner called itself trapped on 81 per cent of frames while a legal
  // line was sitting there the whole time. They still count in the cost below,
  // where they push the line away from themselves; they simply cannot veto.
  const avoidable = [];
  for (let k = 0; k < obstacles.length; k++) {
    const obstacle = obstacles[k];
    let reachable = false;
    for (let i = 0; i < steps && !reachable; i++) {
      if (sweptGap(current, at(i), rate, bike.lateralTau, obstacle, cfg) >= cfg.traffic.safety) {
        reachable = true;
      }
    }
    avoidable.push(reachable);
  }

  let best = null;
  let roomiest = null;

  for (let i = 0; i < steps; i++) {
    const candidate = at(i);

    let clearance = Infinity;
    let openness = Infinity;
    let passing = Infinity;

    for (let k = 0; k < obstacles.length; k++) {
      const obstacle = obstacles[k];
      const edgeGap = sweptGap(current, candidate, rate, bike.lateralTau, obstacle, cfg);

      if (avoidable[k] && edgeGap < clearance) clearance = edgeGap;

      // The same gap judged at the DESTINATION rather than along the way. Only
      // used to break a tie when nothing is safe, and it has to be a separate
      // number: a vehicle already alongside gives every candidate an identical
      // swept gap, because the bike cannot get anywhere before it arrives, so
      // ranking on that picks whichever candidate came first in the loop. It
      // once sent the bike to the left edge of the road and into the vehicle it
      // was trying to escape.
      const destination = Math.abs(candidate - obstacle.lateral) - obstacle.reach;
      if (destination < openness) openness = destination;

      // How close this line would pass the vehicle the bike is ABOUT to pass,
      // as opposed to the tightest gap anywhere. Those are different questions
      // and only the first one makes a ride worth watching: with four lanes
      // spaced evenly, the smallest gap anywhere is smallest dead in the
      // middle of the road, so aiming at that sat the bike on the centre line
      // and left it there - a hundred per cent of ten minutes inside one lane
      // width. Aiming to pass the NEXT vehicle closely makes it pick a side,
      // and picking a side over and over is what weaving is.
      if (k === 0) passing = destination;


    }

    // Kept whether or not it is safe, so that when nothing is safe there is
    // still somewhere to aim - but only within reach. When the bike is trapped
    // the answer is to shuffle into whatever room there is, not to dive across
    // the road: the widest gap on the far side is no use if crossing to it
    // means crossing everything in between, and the plan cannot see that once
    // it has given up on safety.
    if (Math.abs(candidate - current) <= cfg.traffic.escapeReach) {
      if (!roomiest || openness > roomiest.clearance) {
        roomiest = { target: candidate, clearance: openness };
      }
    }

    if (clearance < cfg.traffic.safety) continue;

    const cost = score(candidate, racing, current, cfg, passing);
    if (!best || cost < best.cost) best = { target: candidate, cost };
  }

  if (!best) {
    // Nowhere with the full margin. Aim for the roomiest place there is and
    // brake: a squeeze is a far better outcome than a hit, and holding the
    // current line instead - which is what this used to do - turns a gap that
    // was merely tight into one the bike never even tried to take.
    state.autopilotBlocked = true;
    state.autopilotBest = roomiest ? roomiest.clearance : -99;
    const escape = clamp(roomiest ? roomiest.target : current, -limit, limit);
    return { line: escape, target: escape, blocked: true };
  }

  // Hysteresis: stay on the line already being followed unless the new one is
  // clearly better. Without it the bike flicks between two nearly equal gaps
  // every time their scores cross, which no rider does.
  // Hysteresis is judged on the line CHOSEN, never on the line ridden. The
  // graze below moves the ridden line toward a vehicle, and comparing that
  // against a fresh un-nudged candidate next frame made the two disagree by
  // exactly the nudge, every frame, which walked the plan sideways.
  let line = best.target;
  const held = autopilot.line;
  if (Math.abs(held - line) > 1e-3 && viable(held, obstacles, cfg, current, rate, limit)) {
    const heldCost = score(held, racing, current, cfg, heldPassing(held, obstacles));
    if (heldCost - best.cost < cfg.traffic.switchMargin) line = held;
  }

  return { line, target: line, blocked: false };
}

/**
 * What a line costs.
 *
 * The first term is the one that makes the ride: it wants the bike to pass at a
 * particular clearance rather than at the widest one available, so an open road
 * to the side is as wrong as a vehicle too close. That is what threading is -
 * choosing the gap, not avoiding the traffic - and it only works because the
 * guard behind it makes the floor unreachable, so aiming near it is free.
 *
 * `passing` is the gap to the vehicle about to be passed, at the DESTINATION -
 * not the smallest gap anywhere, and not the smallest gap on the way. How close
 * a pass looks is about where the bike will be as that one vehicle goes by;
 * what is safe to attempt is a different question, answered before this is
 * reached.
 */
function score(candidate, racing, current, cfg, passing) {
  const thread = Number.isFinite(passing)
    ? Math.abs(passing - cfg.traffic.thread) * cfg.traffic.threadWeight
    : 0;

  return (
    thread +
    Math.abs(candidate - racing) * cfg.traffic.lineWeight +
    Math.abs(candidate - current) * cfg.traffic.effortWeight
  );
}

/**
 * The closest the bike comes to one vehicle on its way to a candidate line,
 * edge to edge.
 *
 * This is the whole safety test, and it is swept rather than sampled at the
 * destination because the destination is not where the bike will be when the
 * vehicle arrives. By then it has got as far as `reached`, so the bike sweeps
 * the interval between where it is now and there, and the vehicle meets the
 * nearest point of that interval.
 *
 * It answers both awkward cases with the same arithmetic. A vehicle arriving
 * immediately is judged against the line the bike is still on, so a plan cannot
 * pretend to have escaped something it has not. One arriving in five seconds is
 * judged against the line the bike will have reached, so a distant vehicle does
 * not veto a move that will be long finished before it matters - and crossing
 * in front of it is refused for free, because the sweep passes through it.
 */
function sweptGap(current, candidate, rate, tau, obstacle, cfg) {
  const reached =
    current +
    Math.sign(candidate - current) *
      Math.min(Math.abs(candidate - current), rate * Math.max(0, obstacle.time - tau));

  const low = Math.min(current, reached);
  const high = Math.max(current, reached);
  const nearest = obstacle.lateral < low ? low : obstacle.lateral > high ? high : obstacle.lateral;

  return Math.abs(nearest - obstacle.lateral) - obstacle.reach;
}

/** The destination gap a line would have to the vehicle it passes first. */
function heldPassing(target, obstacles) {
  const soonest = obstacles[0];
  return soonest ? Math.abs(target - soonest.lateral) - soonest.reach : Infinity;
}

/** Whether a line already being followed is still allowed. */
function viable(target, obstacles, cfg, current, rate, limit) {
  if (target < -limit || target > limit) return false;
  const tau = config.player.bike.lateralTau;
  for (const obstacle of obstacles) {
    if (sweptGap(current, target, rate, tau, obstacle, cfg) < cfg.traffic.safety) return false;
  }
  return true;
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}
