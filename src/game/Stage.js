import { config } from '../config.js';

/**
 * Stage - five kilometres with a line at the end of it.
 *
 * It owns the distance into the stage, the clock, which checkpoints have been
 * passed and what medal the time earned. It owns NO geometry: where the gates
 * physically stand is world/ThemeGate.js, and what a crossing looks like is
 * fx/Flash.js. This only knows how far along the rider is.
 *
 * IT IS DRIVEN BY THE SAME `state.distance` AS EVERYTHING ELSE, and that is
 * what keeps it honest. The road is generated from distance travelled and the
 * traffic recycles against it, so a stage that counted its own metres could
 * drift from the world the rider is actually crossing. It records where the
 * stage began and measures the difference - the same trick Session already
 * uses for score, and for the same reason.
 *
 * THE CLOCK RUNS ON THE RUN, NOT ON THE WALL. It is advanced by `dt` from the
 * loop, so pausing stops it, a background tab cannot inflate it, and a slow
 * frame costs exactly the time it took. `Date.now()` would fail all three.
 */

/** What a crossing was, handed back by `update` so the caller can react once. */
export const CROSSED = {
  CHECKPOINT: 'checkpoint',
  FINISH: 'finish',
};

export class Stage {
  constructor() {
    this.reset();
  }

  reset() {
    /** Metres into the stage, 0 .. length. */
    this.travelled = 0;
    /** Seconds of running time since the line. */
    this.time = 0;
    /** How many checkpoints are behind the rider. The finish is not one. */
    this.checkpoints = 0;
    this.finished = false;
    /** 'gold' | 'silver' | 'bronze', or null while the stage is unfinished. */
    this.medal = null;
    /** True when this finish beat the stored time for this road. */
    this.isRecord = false;
    this._startDistance = 0;
  }

  /** @param {object} state loop state */
  begin(state) {
    this.reset();
    this._startDistance = state.distance || 0;
  }

  /** @returns {number} total checkpoints in a stage, the finish excluded. */
  get checkpointCount() {
    return Math.max(0, Math.ceil(config.stage.length / config.stage.checkpointEvery) - 1);
  }

  /** @returns {number} metres still to run. */
  get remaining() {
    return Math.max(0, config.stage.length - this.travelled);
  }

  /**
   * Where the next gate stands, as an ABSOLUTE world distance - which is what
   * arming a gate needs, since the gate is placed on the road and not on the
   * stage.
   * @returns {number}
   */
  get nextGateDistance() {
    const cfg = config.stage;
    const next = Math.min(
      (this.checkpoints + 1) * cfg.checkpointEvery,
      cfg.length,
    );
    return this._startDistance + next;
  }

  /** @returns {boolean} whether the next gate is the finish line. */
  get nextGateIsFinish() {
    return (this.checkpoints + 1) * config.stage.checkpointEvery >= config.stage.length;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads distance
   * @returns {string|null} a CROSSED value on the frame a line is crossed
   */
  update(dt, state) {
    if (this.finished) return null;
    const cfg = config.stage;

    this.time += dt;
    this.travelled = Math.max(0, (state.distance || 0) - this._startDistance);

    if (this.travelled >= cfg.length) {
      this.finished = true;
      this.medal = medalFor(this.time);
      this.isRecord = this._record(state.road);
      return CROSSED.FINISH;
    }

    // COUNTED FROM THE DISTANCE, not accumulated per frame. At 235 units a
    // second a frame covers four metres, so a checkpoint tested as "did we
    // pass exactly 1000" is a checkpoint that is missed whenever the frame
    // lands either side of it. Deriving the count means a dropped frame, a
    // slow frame and a frame during a lag spike all give the same answer.
    const passed = Math.min(
      this.checkpointCount,
      Math.floor(this.travelled / cfg.checkpointEvery),
    );
    if (passed > this.checkpoints) {
      this.checkpoints = passed;
      return CROSSED.CHECKPOINT;
    }
    return null;
  }

  /**
   * Stores the time if it beat what was there for this road.
   * @param {string} road
   * @returns {boolean}
   */
  _record(road) {
    const best = readTimes();
    const previous = best[road];
    if (previous !== undefined && previous <= this.time) return false;
    best[road] = this.time;
    writeTimes(best);
    return true;
  }

  /**
   * @param {string} road
   * @returns {number|null} the stored best time for a road, in seconds.
   */
  static bestFor(road) {
    const best = readTimes();
    return typeof best[road] === 'number' ? best[road] : null;
  }
}

/**
 * Which medal a time earns.
 *
 * Thresholds are multiples of a measured reference rather than absolute
 * seconds - see config/stage.js for why, and tools/stage-check.mjs for where
 * the reference comes from.
 * @param {number} seconds
 * @returns {string}
 */
export function medalFor(seconds) {
  const medals = config.stage.medals;
  const reference = medals.referenceSeconds;
  if (seconds <= reference * medals.gold) return 'gold';
  if (seconds <= reference * medals.silver) return 'silver';
  return 'bronze';
}

/**
 * localStorage can throw outright rather than return nothing - a browser with
 * site data blocked, or private mode on some versions - so this is guarded and
 * the game runs perfectly well without it. Same shape as Session, Selection,
 * Comfort and Controls.
 * @returns {Record<string, number>}
 */
function readTimes() {
  try {
    const raw = window.localStorage.getItem(config.stage.storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

/** @param {Record<string, number>} times */
function writeTimes(times) {
  try {
    window.localStorage.setItem(config.stage.storageKey, JSON.stringify(times));
  } catch (error) {
    // A time that cannot be kept is not a reason to refuse to finish.
  }
}
