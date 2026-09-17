import * as THREE from 'three';
import { config } from '../config.js';
import { createNoise2D } from '../utils/noise.js';
import { createRng } from '../utils/rng.js';
import { planLine } from './autopilot/planLine.js';

/**
 * Autopilot - drives the bike for recording.
 *
 * It produces steer, throttle and brake, and nothing else. It never moves the
 * bike, never touches the camera and never reaches into the physics. That is
 * not tidiness for its own sake: driving through the same input the player uses
 * is what makes it look like a rider rather than a camera on rails, because
 * every lean, bob, shake and field of view ramp is produced by the same code
 * responding to the same kind of signal. It is also why it cannot desync - a
 * second path for the bike to follow is the only thing that could drift from
 * the first, and there isn't one.
 *
 * Each frame it does three things:
 *
 *   read    where the road goes and which vehicles it will reach, in time
 *           rather than distance, so the horizon scales with speed.
 *   choose  a lateral line: on the racing line when the road is clear, through
 *           the largest safe gap when it is not, and deliberately close to a
 *           vehicle when a close pass can be had safely, because that is the
 *           shot worth recording.
 *   steer   toward it with a hand rather than a servo - smoothed, with a slow
 *           wander on the line and fine noise on the steering.
 *
 * The one hard rule is that a chosen line must clear every vehicle it will pass
 * by more than the collision reach. Everything else is preference.
 */
export class Autopilot {
  /**
   * @param {import('../world/road/RoadPath.js').RoadPath} path
   * @param {import('../world/Traffic.js').Traffic} traffic
   * @param {import('./BikePhysics.js').BikePhysics} bike
   */
  constructor(path, traffic, bike) {
    this.path = path;
    this.traffic = traffic;
    this.bike = bike;

    /** What the rest of the project reads, same shape as Input.values. */
    this.values = { steer: 0, throttle: 0, brake: 0 };

    /** The line chosen by the plan, before any lean toward a close pass. */
    this.line = 0;
    /** The line actually being ridden to. */
    this.target = 0;
    this.blocked = false;

    this._steer = 0;
    this._brakeTimer = 0;
    this._time = 0;

    // Two independent noise fields: one for the slow wander of the line, one
    // for the fine corrections on the bars. Fixed seeds, so two recordings of
    // the same run are the same recording.
    this._drift = createNoise2D(createRng(9173));
    this._jitter = createNoise2D(createRng(2851));

    this._position = new THREE.Vector3();
    this._tangent = new THREE.Vector3();
    this._lateral = new THREE.Vector3();
    this._ahead = new THREE.Vector3();

    // Reused every frame: nothing here allocates once it is running.
    this._obstacles = [];
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state
   */
  update(dt, state) {
    const cfg = config.autopilot;
    this._time += dt;

    const racing = this._racingLine(cfg);
    this._collectObstacles(cfg, state);

    const plan = planLine(this, cfg, racing, state);
    this.blocked = plan.blocked;
    this.line = plan.line;

    // The chosen line is slewed, never jumped to. Scored frame by frame, two
    // gaps either side of the road can trade places on the smallest change, and
    // the plan was teleporting between the far left and the far right several
    // times a second. The bike, which lags well behind its target, then spent
    // its whole time sweeping across the middle - through the traffic both gaps
    // were on either side of. Limiting the intention to the speed the bike can
    // actually move makes an indecisive moment cost a small wobble instead of a
    // trip across the road.
    const bike = config.player.bike;
    const authority = 0.35 + 0.65 * (this.bike.speed / bike.maxSpeed);
    const step = bike.lateralSpeed * authority * dt;
    this.target += THREE.MathUtils.clamp(plan.target - this.target, -step, step);

    // Slow wander, so the line breathes instead of being held to the
    // millimetre - but only when there is room for it. The margin the plan
    // works to is a third of a unit and the wander is two thirds of that, so
    // left on while squeezing past a vehicle it is the difference between a
    // close pass and a hit. A rider holds a tighter line in a gap for the same
    // reason, so this costs nothing in how it reads.
    const room = this._roomToSpare(cfg);
    const wander =
      this._drift(this._time * cfg.hands.driftSpeed, 0) *
      cfg.hands.driftAmount *
      THREE.MathUtils.clamp(room / cfg.hands.steadyWithin, 0, 1);

    const error = this.target + wander - this.bike.lateral;
    const wanted = THREE.MathUtils.clamp(error * cfg.hands.steerGain, -1, 1);

    // A hand, not a servo: the steering follows what is asked of it rather
    // than becoming it.
    const blend = 1 - Math.exp(-dt / Math.max(cfg.hands.steerTau, 1e-4));
    this._steer += (wanted - this._steer) * blend;

    const jitter = this._jitter(this._time * cfg.hands.jitterSpeed, 31.7) * cfg.hands.jitterAmount;

    if (plan.blocked) this._brakeTimer = cfg.throttle.brakeHold;
    else this._brakeTimer = Math.max(0, this._brakeTimer - dt);

    // Braking stops at a floor. Without one the bike brakes, falls below the
    // traffic's speed, stops closing on anything, sees an empty road, opens the
    // throttle and does it again - an oscillation that spends the whole clip
    // crawling. Below the floor the answer is to steer, not to slow further.
    // Braking has one job now: when the road has not left a gap, fall back and
    // wait for one. The guard reports how far it still has to move the bike to
    // be clear, and anything past a small correction means the gap the plan
    // chose is not there. Slowing opens every gap ahead, because every arrival
    // is pushed further out.
    const crowded = (state.guardPressure || 0) > cfg.throttle.crowdedAt;
    const floor = config.player.bike.maxSpeed * cfg.throttle.speedFloor;
    const braking = this.bike.speed > floor && (crowded || this._brakeTimer > 0);

    this.values.steer = THREE.MathUtils.clamp(this._steer + jitter, -1, 1);
    this.values.throttle = braking ? 0 : 1;
    this.values.brake = braking ? cfg.throttle.brakeForce : 0;
  }

  /**
   * How much clear air there is beside the bike right now, edge to edge, over
   * the vehicles about to pass it.
   * @returns {number}
   */
  _roomToSpare(cfg) {
    let room = Infinity;
    for (const obstacle of this._obstacles) {
      if (obstacle.time > cfg.hands.steadyBefore) continue;
      const gap = Math.abs(this.bike.lateral - obstacle.lateral) - obstacle.reach;
      if (gap < room) room = gap;
    }
    return room === Infinity ? cfg.hands.steadyWithin : room;
  }

  /**
   * Where the road is going, as a lateral offset the bike should hold.
   *
   * Measured as how far the road has moved across its own starting frame over
   * the lookahead, which is a signed number in the units we already steer in.
   * Curvature and cross products would give the same answer and give it with a
   * sign that is easy to get backwards - this one cannot be.
   *
   * @returns {number}
   */
  _racingLine(cfg) {
    const distance = this.bike.distance;
    this.path.frameAt(distance, this._position, this._tangent, this._lateral);
    this.path.pointAt(distance + cfg.line.lookAhead, this._ahead);

    const bend = this._ahead.sub(this._position).dot(this._lateral);
    const limit = config.player.bike.lateralLimit * cfg.line.reach;
    return THREE.MathUtils.clamp((bend / cfg.line.lookAhead) * cfg.line.gain * 100, -limit, limit);
  }

  /**
   * Every vehicle this bike will draw level with inside the horizon, with where
   * it will be across the road and how much room it needs.
   *
   * Judged in TIME, not distance: a vehicle a hundred units ahead is an
   * immediate problem at a closing speed of eighty and no problem at all at a
   * closing speed of five.
   */
  _collectObstacles(cfg, state) {
    const traffic = config.world.traffic;
    const collision = traffic.collision;
    const list = this._obstacles;
    list.length = 0;

    const distance = this.bike.distance;
    const speed = this.bike.speed;
    const horizon = cfg.traffic.horizon;

    // Traffic stores speed as a FRACTION of the player's maximum, not in units
    // per second - Traffic.update multiplies by it when it advances them. Read
    // straight, it made every vehicle look stationary, so closing speeds came
    // out around two hundred instead of fifteen, every arrival looked ten times
    // sooner than it was, and the planner committed far too late to move.
    const maxSpeed = config.player.bike.maxSpeed;

    for (const fleet of this.traffic.fleets) {
      const halfWidth = fleet.type.size.width * 0.5;
      const halfLength = fleet.type.size.length * 0.5;
      const weave = fleet.type.weave;

      for (const vehicle of fleet.vehicles) {
        if (!vehicle.active) continue;

        // GAP TO THE NEAREST END, not to the centre. A sedan is 4.7 long and
        // the difference hardly shows; a semi is 16, so its centre is eight
        // metres from the part the bike actually meets. Planning against the
        // centre had the bike deciding a lane was clear while the trailer was
        // still in it.
        const centreGap = vehicle.distance - distance;
        const reach = halfLength * vehicle.scale;
        const gap = Math.sign(centreGap) * Math.max(0, Math.abs(centreGap) - reach);
        const closing = speed - vehicle.speed * maxSpeed;

        // Both signs matter. Traffic runs at up to 0.86 of the bike's top
        // speed, so any time the bike is off full throttle something can be
        // FASTER than it, and a vehicle behind is then closing just as surely
        // as one in front. Dividing handles both without a special case: gap
        // and closing share a sign whenever the two are converging, so a
        // positive result is a meeting and a negative one is not.
        const closes = gap / closing;
        const time = closes > 0 ? closes : Infinity;

        // Level with the bike right now: a problem this instant, whatever the
        // arithmetic says about when the two centres will meet.
        // Level with the bike right now. Measured from the near end too, so a
        // long vehicle counts as alongside for the whole time it is.
        const alongside = Math.abs(gap) < cfg.traffic.alongside;

        // Everything else has to be CONVERGING to matter. A blanket "anything
        // within seventy units counts" reads a vehicle that is quietly falling
        // behind as something to plan around, and on a busy road there is one
        // of those beside every lane - which left no legal line anywhere and
        // had the planner reporting itself trapped on 99 per cent of frames.
        if (!alongside && time > horizon) continue;

        list.push({
          // Where it will be, not where it is. A motorcycle weaves 0.85 units
          // either way on a 4.5 second cycle, which is more than twice the
          // safety margin, so planning against its current position is planning
          // against a number that will be wrong by the time it matters.
          lateral: predictLateral(vehicle, weave, Math.min(time, horizon)),
          reach: halfWidth * vehicle.scale + collision.playerHalfWidth,
          time: alongside ? 0 : Math.min(time, horizon),
        });
      }
    }

    // Soonest first: the plan's reachability test only has to look at the one
    // that arrives first, and the graze reward should follow the vehicle the
    // shot will actually be of.
    list.sort(byTime);

    state.autopilotObstacles = list.length;
  }

  dispose() {
    this._obstacles.length = 0;
  }
}

function byTime(a, b) {
  return a.time - b.time;
}

/**
 * Where a vehicle will be across the road in `time` seconds.
 *
 * Weaving is a sine of known amplitude, period and phase, so this is exact
 * rather than an estimate - which is what lets the bike squeeze past a
 * motorcycle at the moment the gap is open instead of treating the whole sweep
 * as solid.
 */
function predictLateral(vehicle, weave, time) {
  if (!weave) return vehicle.lateral;
  const phase = vehicle.weavePhase + (time * Math.PI * 2) / weave.period;
  return vehicle.laneLateral + Math.sin(phase) * weave.amount;
}
