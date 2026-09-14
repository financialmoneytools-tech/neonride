import { config } from '../../config.js';

/**
 * Guard - makes a collision impossible while the autopilot is driving.
 *
 * This is a cheat, and it is meant to be one. The self driving mode exists to
 * produce footage, not to play the game fairly, and a clip is ruined by one
 * contact in ten minutes however well the rest of it went. So the planner is
 * free to thread as close as it likes and this stands behind it as a floor that
 * cannot be crossed.
 *
 * It runs AFTER the bike has moved and BEFORE traffic judges it, which is the
 * only window in the frame where the position the collision test will read can
 * still be corrected.
 *
 * Every vehicle the bike is level with forbids an interval across the road.
 * Those intervals are merged and the bike is put at the nearest point outside
 * all of them - solved outright rather than by pushing it clear of one vehicle
 * at a time, because pushing clear of one can push into another and the two can
 * hand the bike back and forth without ever settling. Merging cannot: whatever
 * is left after the union is free by construction.
 *
 * Two things keep it from reading as a cheat.
 *
 * The planner aims for a gap far wider than this floor, so on an open road it
 * never fires at all. What it corrects is the tail - the frame where a weaving
 * motorcycle and a lagging steering input line up badly.
 *
 * And the correction is carried into the bike's steering target, not written on
 * top of its position. Written on top, the bike would spend the next frames
 * pulling back toward the line it was taken off, and that argument reads as a
 * stutter.
 */
export class Guard {
  /**
   * @param {import('../BikePhysics.js').BikePhysics} bike
   * @param {import('../../world/Traffic.js').Traffic} traffic
   */
  constructor(bike, traffic) {
    this.bike = bike;
    this.traffic = traffic;

    /** Frames spent easing the bike clear of something coming. */
    this.eases = 0;
    /** Frames where a contact was prevented outright on the last frame. */
    this.saves = 0;
    /** The largest such last-frame correction, in units. */
    this.worst = 0;
    /**
     * How far the bike still has to be moved to be clear, this frame. The
     * autopilot brakes on this: falling back is how a rider answers a gap that
     * has not opened yet, and it is the only answer left once the view is built
     * from the guarded position, because there a big correction is a visible
     * jump rather than a silent one.
     */
    this.pressure = 0;
    /** Frames where the road left nowhere legal at all. */
    this.trapped = 0;

    /**
     * Last-frame corrections by size, so "is the guard visible" has an answer
     * rather than an opinion. A few small ones a minute cannot be seen; one
     * large one is a jump, and now that the view is built from the guarded
     * position, a jump is exactly what it would look like.
     */
    this.buckets = [0, 0, 0, 0, 0];

    // Reused every frame: this runs inside the loop and allocates nothing.
    this._blocked = [];
    this._imminent = [];
  }

  /** @param {number} dt @param {object} state shared loop state */
  update(dt, state) {
    if (!config.autopilot.enabled || !config.autopilot.guard.enabled) return;

    const cfg = config.autopilot.guard;
    const limit = config.player.bike.lateralLimit;
    const blocked = this._blocked;
    blocked.length = 0;

    // Two windows. The wide one starts correcting well before contact, a
    // little each frame, so the bike eases out of the way. The true one is the
    // overlap the collision test will actually judge, and inside it the
    // correction is applied whole, because that frame is the last there is.
    //
    // Without the wide window the guard was correct and ugly: it did nothing
    // until the frame of contact and then moved the bike up to five units at
    // once, which is half the road in one frame and reads as a cut.
    this.pressure = 0;
    state.guardPressure = 0;

    this._collect(dt, cfg, blocked, cfg.lead);
    if (blocked.length === 0) return;

    const from = this.bike.lateral;
    const free = nearestFree(from, blocked, limit);
    if (free !== null) {
      this.pressure = Math.abs(free - from);
      state.guardPressure = this.pressure;
    }

    // Urgent means the bike is INSIDE a real overlap right now, not merely
    // that something is level with it. Asking whether the nearest free point
    // differs from where the bike is answers a different question, because that
    // point is always nudged clear of an edge and so never exactly equals it.
    this._imminent.length = 0;
    this._collect(dt, cfg, this._imminent, 1);
    const urgent = inside(from, this._imminent);

    if (free === null) {
      // Nowhere legal on the whole road. Reported as maximum pressure so the
      // autopilot slows down and lets the road open up again, which is the only
      // thing that can help and is what a rider would do.
      this.pressure = Infinity;
      state.guardPressure = Infinity;
      // Nowhere legal on the whole road. Nothing can be done about it here, and
      // it means the traffic is denser than the road can carry rather than that
      // anything is wrong with the guard. Counted, because it is the number
      // that says the density has gone too far.
      this.trapped++;
      state.guardTrapped = this.trapped;
      return;
    }

    const moved = Math.abs(free - from);
    if (!urgent) {
      // Ease toward it rather than snapping. The bounded step is the whole
      // difference between a guard you can see and one you cannot.
      const step = cfg.easeRate * dt;
      if (moved > step) {
        this.bike.placeLateral(from + Math.sign(free - from) * step);
        state.lateral = this.bike.lateral;
        this.eases++;
        state.guardEases = this.eases;
        return;
      }
    }

    if (moved > 1e-6) {
      if (urgent) {
        this.saves++;
        if (moved > this.worst) this.worst = moved;
        const b = moved < 0.1 ? 0 : moved < 0.3 ? 1 : moved < 0.6 ? 2 : moved < 1.2 ? 3 : 4;
        this.buckets[b]++;
      } else {
        this.eases++;
      }
      this.bike.placeLateral(free);

      // The shared state carries the position traffic will judge, and the bike
      // published it before this ran. Moving the bike and not the number it
      // published is moving nothing: the collision test went on reading the
      // line the bike was on before the guard took it off.
      state.lateral = this.bike.lateral;
    }

    state.guardSaves = this.saves;
  }

  /**
   * The lateral interval each vehicle forbids.
   *
   * Vehicles have NOT moved yet this frame - Traffic.update runs after this -
   * so every position is read one step ahead, exactly as Traffic will advance
   * it. Guarding against where they were instead let contacts through: at these
   * closing speeds a vehicle covers a couple of metres a frame, so the bike was
   * being placed in a gap that had already closed by the time anything looked
   * at it.
   */
  _collect(dt, cfg, blocked, lead) {
    const collision = config.world.traffic.collision;
    const step = config.player.bike.maxSpeed * dt;

    for (const fleet of this.traffic.fleets) {
      const halfWidth = fleet.type.size.width * 0.5;
      const halfLength = fleet.type.size.length * 0.5;
      const weave = fleet.type.weave;

      for (const vehicle of fleet.vehicles) {
        if (!vehicle.active) continue;

        const distance = vehicle.distance + vehicle.speed * step;
        const along = Math.abs(this.bike.distance - distance);
        const alongReach = (halfLength * vehicle.scale + collision.playerHalfLength) * lead;
        if (along > alongReach) continue;

        const lateral = weave
          ? vehicle.laneLateral +
            Math.sin(vehicle.weavePhase + (dt * Math.PI * 2) / weave.period) * weave.amount
          : vehicle.lateral;
        const reach = halfWidth * vehicle.scale + collision.playerHalfWidth + cfg.floor;

        blocked.push({ low: lateral - reach, high: lateral + reach });
      }
    }
  }

  dispose() {
    this._blocked.length = 0;
    this._imminent.length = 0;
  }
}

function byLow(a, b) {
  return a.low - b.low;
}

/**
 * The point nearest `from` that is outside every interval and inside the band.
 *
 * The intervals arrive sorted and are merged as they are walked, so the answer
 * is whatever lies between two merged runs, or outside the ends. Null means the
 * merged runs cover the whole band.
 */
function nearestFree(from, blocked, limit) {
  // Already clear: stay put. Without this the function answers a different
  // question - "where is the nearest edge" - and returns one even when the bike
  // is standing in open road. The easing then walks toward that edge, and when
  // it lies on the FAR side of a vehicle the path to it goes straight through
  // the vehicle. That is the pass-through: the guard was not failing to correct
  // the bike, it was steering it into what it was supposed to avoid, for 64 per
  // cent of frames.
  if (!inside(from, blocked)) return from;

  let best = null;
  const consider = (value) => {
    if (value < -limit || value > limit) return;
    if (inside(value, blocked)) return;
    if (best === null || Math.abs(value - from) < Math.abs(best - from)) best = value;
  };

  // Each interval's two edges, nudged out of it, are the only places the answer
  // can be: anywhere else either sits inside something or is further away than
  // the edge of whatever it sits beside.
  const nudge = 1e-4;
  for (const span of blocked) {
    consider(span.low - nudge);
    consider(span.high + nudge);
  }
  consider(-limit);
  consider(limit);

  return best;
}

function inside(value, blocked) {
  for (const span of blocked) {
    if (value > span.low && value < span.high) return true;
  }
  return false;
}
