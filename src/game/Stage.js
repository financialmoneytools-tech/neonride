import { config } from '../config.js';

/**
 * Stage - one level: five kilometres with a line at the end of it.
 *
 * It owns the distance into the level, the clock, which checkpoints have been
 * passed, and nothing else. It owns NO geometry: where the gates physically
 * stand is world/ThemeGate.js, and what a crossing looks like is fx/Flash.js.
 *
 * IT NO LONGER OWNS MEDALS OR RECORDS. A medal is scored against the level's
 * own measured reference and a record belongs to a road across ten of them,
 * and neither is a thing that knows about metres - so both moved to
 * game/Levels.js and game/Progress.js. This measures one level and does not
 * know there are others, which is what lets ten of them be counted without
 * this file changing at all.
 *
 * IT IS DRIVEN BY THE SAME `state.distance` AS EVERYTHING ELSE, and that is
 * what keeps it honest. The road is generated from distance travelled and the
 * traffic recycles against it, so a level that counted its own metres could
 * drift from the world the rider is actually crossing. It records where the
 * level began and measures the difference - the same trick Session already
 * uses for score, and for the same reason.
 *
 * THE CLOCK RUNS ON THE RUN, NOT ON THE WALL. It is advanced by `dt` from the
 * loop, so pausing stops it, a background tab cannot inflate it, and a slow
 * frame costs exactly the time it took. `Date.now()` would fail all three.
 */

/** What a crossing was, handed back by `update` so the caller can react once. */
export const CROSSED = {
  CHECKPOINT: 'checkpoint',
  /** A level's line on levels 1..9: the run carries straight on through it. */
  LEVEL: 'level',
  /** The last level's line. This one ends the run, and well. */
  FINISH: 'finish',
};

export class Stage {
  constructor() {
    this.reset();
  }

  reset() {
    /** Metres into this level, 0 .. length. */
    this.travelled = 0;
    /** Seconds of running time since this level's line. */
    this.time = 0;
    /** How many checkpoints are behind the rider. The finish is not one. */
    this.checkpoints = 0;
    this.finished = false;
    this._startDistance = 0;
  }

  /**
   * Starts a level. Called at the beginning of a run AND at every level
   * boundary, which is the whole reason it takes the state: a level begins
   * wherever the bike happens to be, and the next one begins where this one
   * ended without anything stopping in between.
   * @param {object} state loop state
   */
  begin(state) {
    this.reset();
    this._startDistance = state.distance || 0;
  }

  /**
   * Starts a level with only `remaining` metres left to run.
   *
   * THE DEV HOOKS' ENTRY POINT, and nothing else calls it. `?finish=1` needs
   * to reach the last line in a few seconds rather than in five minutes, and
   * the honest way to do that is to start the level nearly finished - the
   * real gate still arms, the real crossing still happens and Session takes
   * the real path through `_crossLine`. The alternative was reaching in and
   * setting `_startDistance` from outside, which is the same trick with
   * nothing naming it.
   *
   * @param {object} state loop state
   * @param {number} remaining metres still to run
   */
  beginNear(state, remaining) {
    this.begin(state);
    const left = Math.max(0, Math.min(config.stage.length, remaining));
    // Wound back, so `travelled` already reads almost the whole level.
    this._startDistance -= config.stage.length - left;
    // The checkpoints behind that point are counted as passed, or the first
    // frame would report crossing four of them at once.
    this.checkpoints = Math.min(
      this.checkpointCount,
      Math.floor((config.stage.length - left) / config.stage.checkpointEvery),
    );
  }

  /** @returns {number} total checkpoints in a level, the finish excluded. */
  get checkpointCount() {
    return Math.max(0, Math.ceil(config.stage.length / config.stage.checkpointEvery) - 1);
  }

  /** @returns {number} metres still to run in this level. */
  get remaining() {
    return Math.max(0, config.stage.length - this.travelled);
  }

  /**
   * Where the next gate stands, as an ABSOLUTE world distance - which is what
   * arming a gate needs, since the gate is placed on the road and not on the
   * level.
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

  /** @returns {boolean} whether the next gate is this level's finish line. */
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
}

/**
 * Which medal a time earns, against a reference handed in.
 *
 * THE REFERENCE IS A PARAMETER NOW, because there are ten of them: level ten
 * runs roughly twice the traffic level one does, so the same five kilometres
 * genuinely takes longer and one shared threshold would make late gold
 * unreachable while early gold was free. game/Levels.js picks which reference
 * applies; this only divides.
 *
 * The multipliers do not vary by level - see config/levels.js for why gold
 * sits alongside the autopilot rather than behind it.
 *
 * @param {number} seconds
 * @param {number} [reference] the level's measured time
 * @returns {string} 'gold' | 'silver' | 'bronze'
 */
export function medalFor(seconds, reference = config.stage.medals.referenceSeconds) {
  const medals = config.levels.medals;
  if (seconds <= reference * medals.gold) return 'gold';
  if (seconds <= reference * medals.silver) return 'silver';
  return 'bronze';
}
