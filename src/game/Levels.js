import { config } from '../config.js';
import { medalFor } from './Stage.js';

/**
 * Levels - the ten of them, and what a run through them was worth.
 *
 * It owns which level is being ridden, what each finished level scored, and
 * the totals at the end. It owns NO geometry, no camera and no traffic: the
 * arch is world/ThemeGate.js, the difficulty is read out of config by
 * world/Traffic.js, and the five kilometres inside one level are still
 * game/Stage.js. This is the thing that says which level that stage IS.
 *
 * THE SAME SPLIT Stage ALREADY USES. Stage measures one level and knows
 * nothing about there being others; Levels counts the others and knows nothing
 * about metres. A run is Session driving Stage inside Levels, and each layer
 * can be read on its own.
 *
 * WHY `startedAt` EXISTS. The total time and the medal tally are written only
 * for an unbroken run from level one to level ten in one sitting - see
 * game/Progress.js for the argument. A run that began at level seven is a
 * practice run: its levels still record their own best times, and it records
 * no total. The flag is set once, when the run begins, and nothing can set it
 * afterwards.
 */
export class Levels {
  /** @param {import('./Progress.js').Progress} progress */
  constructor(progress) {
    this.progress = progress;
    this.reset(1);
  }

  /**
   * @param {number} [level] which level the run begins on
   */
  reset(level = 1) {
    /** 1-based, the level being ridden now. */
    this.level = clampLevel(level);
    /** Which level the run BEGAN on. Only 1 can produce a road total. */
    this.startedAt = this.level;
    /** Seconds per finished level, sparse by level index. */
    this.times = [];
    /** Medal per finished level, sparse by level index. */
    this.medals = [];
    /** True once level `count` has been finished. */
    this.complete = false;
    /** Set at the end: total seconds, or null for a run that started late. */
    this.total = null;
    /** Whether that total beat the stored one. */
    this.isRecord = false;
  }

  /** @returns {boolean} whether a road total may be written for this run. */
  get unbroken() {
    return this.startedAt === 1;
  }

  /** @returns {boolean} whether the level being ridden is the last one. */
  get onLastLevel() {
    return this.level >= config.levels.count;
  }

  /** @returns {number} the reference time for the level being ridden. */
  get reference() {
    return referenceFor(this.level);
  }

  /** @returns {number} how many levels have been finished this run. */
  get finished() {
    return this.times.filter((value) => typeof value === 'number').length;
  }

  /**
   * How many of each medal this run has collected, for the results card.
   * @returns {{gold: number, silver: number, bronze: number}}
   */
  get tally() {
    const tally = { gold: 0, silver: 0, bronze: 0 };
    for (const medal of this.medals) if (medal && tally[medal] !== undefined) tally[medal]++;
    return tally;
  }

  /**
   * Records a finished level and moves to the next.
   *
   * @param {string} road which road this was, for the stored record
   * @param {number} seconds the level's own clock
   * @returns {{medal: string, level: number, last: boolean}} what it earned
   */
  finishLevel(road, seconds) {
    const level = this.level;
    const medal = medalFor(seconds, referenceFor(level));
    this.times[level - 1] = seconds;
    this.medals[level - 1] = medal;
    // GUARDED, because a Session may be built without a Progress - the tools
    // do exactly that, and a run that cannot write a record must still be a
    // run that finishes.
    if (this.progress) this.progress.finishLevel(road, level, seconds, medal);

    const last = level >= config.levels.count;
    if (last) {
      this.complete = true;
      // THE TOTAL, and only for a run that rode all ten. A practice run has
      // holes in `times` by definition, and summing them would produce a
      // number that looks like a road time and is not one.
      if (this.unbroken) {
        this.total = this.times.reduce((sum, value) => sum + (value || 0), 0);
        this.isRecord = this.progress ? this.progress.finishRoad(road, this.total) : false;
      }
    } else {
      this.level = level + 1;
      if (this.progress) this.progress.enter(road, this.level);
    }

    return { medal, level, last };
  }

  /**
   * Lives handed back on entering a new level: one, capped at the maximum.
   *
   * NOT A REFILL, and config/levels.js says why. Returned rather than applied
   * so Session stays the only thing that writes a life - two writers is how a
   * life counter starts disagreeing with the pips on the HUD.
   * @param {number} lives what the rider has now
   * @returns {number} what they should have
   */
  static livesAfterLevel(lives) {
    return Math.min(config.game.crashesAllowed, lives + config.levels.livesPerLevel);
  }
}

/**
 * The measured reference time for one level.
 *
 * Clamped rather than indexed blindly: `referenceSeconds` is written by
 * tools/level-check.mjs and a table that is short by one entry must not make
 * the last level's medal `undefined`, which compares false against everything
 * and silently awards bronze.
 * @param {number} level 1-based
 * @returns {number}
 */
export function referenceFor(level) {
  const table = config.levels.referenceSeconds;
  const index = Math.max(0, Math.min(table.length - 1, Math.round(level) - 1));
  const value = table[index];
  return Number.isFinite(value) ? value : config.stage.medals.referenceSeconds;
}

/** @param {number} level @returns {number} */
function clampLevel(level) {
  return Math.max(1, Math.min(config.levels.count, Math.round(level) || 1));
}
