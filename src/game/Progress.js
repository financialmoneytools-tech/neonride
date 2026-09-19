import { config } from '../config.js';

/**
 * Progress - how far a rider has got on each road, and what it was worth.
 *
 * ONE RECORD PER ROAD, because five kilometres of Aurora Pass and five of
 * Galaxy Road are not the same five kilometres - different traffic mixes and
 * different sight lines - and ten levels of each are ten different roads
 * again. The record is what the road screen reads to say SEVIYE 7/10 and what
 * the level select reads to decide what may be started.
 *
 * WHAT IS KEPT, and the split is the whole design:
 *
 *   reached      the highest level ever STARTED on this road, so the level
 *                select knows what to offer. Practising level 7 does not make
 *                level 8 available; reaching it does.
 *   levelTimes   the best time for each level, whenever it was ridden.
 *   levelMedals  the medal that time earned.
 *   totalBest    the best time for a WHOLE ROAD, and it is written only for
 *                an unbroken run from level one to level ten in one sitting.
 *
 * THAT LAST RULE IS WHY REPLAY IS SAFE. A level may be replayed from anywhere
 * that has been reached, because ten levels is five or six minutes of riding
 * and sending a rider who failed at level nine back to level one means
 * re-riding forty kilometres they have already proven. What a start-from-one
 * rule actually protects is the meaning of the total - so the total is
 * protected directly instead, and everything else is free.
 *
 * localStorage can throw outright rather than return nothing - a browser with
 * site data blocked, or private mode on some versions - so every access is
 * guarded and the game runs perfectly well without it. Same shape as Session,
 * Selection, Comfort and Controls.
 */

/** @returns {object} an empty record, which is also the shape of a real one. */
export function emptyRecord() {
  return {
    reached: 1,
    levelTimes: [],
    levelMedals: [],
    totalBest: null,
  };
}

export class Progress {
  constructor() {
    this._roads = readAll();
  }

  /**
   * @param {string} road
   * @returns {object} this road's record; always a record, never undefined.
   */
  for(road) {
    const found = this._roads[road];
    return found || emptyRecord();
  }

  /**
   * The highest level that may be started on a road. Always at least 1, never
   * past the last level - a stored value has outlived the build that wrote it
   * and a road that shipped with eight levels may now have ten, or six.
   * @param {string} road
   * @returns {number}
   */
  reached(road) {
    const value = this.for(road).reached;
    return Math.max(1, Math.min(config.levels.count, Math.round(value) || 1));
  }

  /** @param {string} road @returns {boolean} whether the road has been finished. */
  complete(road) {
    return this.for(road).totalBest !== null;
  }

  /**
   * Records that a level has been STARTED, which is what unlocks the next one
   * for replay. Called on entry rather than on completion so that a rider who
   * reaches level eight and dies there may practise level eight.
   * @param {string} road
   * @param {number} level
   */
  enter(road, level) {
    const record = this.for(road);
    if (level <= record.reached) return;
    record.reached = Math.min(config.levels.count, level);
    this._write(road, record);
  }

  /**
   * Records a level that was completed.
   * @param {string} road
   * @param {number} level 1-based
   * @param {number} seconds
   * @param {string} medal
   * @returns {boolean} whether this beat the stored time for that level
   */
  finishLevel(road, level, seconds, medal) {
    const record = this.for(road);
    const index = level - 1;
    const previous = record.levelTimes[index];
    const better = typeof previous !== 'number' || seconds < previous;
    if (better) {
      record.levelTimes[index] = seconds;
      record.levelMedals[index] = medal;
      this._write(road, record);
    }
    return better;
  }

  /**
   * Records a whole road. ONLY called for an unbroken run - game/Levels.js
   * owns that judgement and will not call this otherwise, which is what keeps
   * the total meaning what it says.
   * @param {string} road
   * @param {number} seconds total across all ten levels
   * @returns {boolean} whether it beat the stored total
   */
  finishRoad(road, seconds) {
    const record = this.for(road);
    const previous = record.totalBest;
    if (previous !== null && previous <= seconds) return false;
    record.totalBest = seconds;
    this._write(road, record);
    return true;
  }

  /** @param {string} road @param {object} record */
  _write(road, record) {
    this._roads[road] = record;
    writeAll(this._roads);
  }
}

/**
 * Reads every road's record, MIGRATING the old shape on the way through.
 *
 * config/stage.js used to write `{road: seconds}` - one best time for the one
 * five kilometre stage that existed. That number is level one's time and
 * nothing else, so it is read as exactly that rather than thrown away: a
 * player who had a good stage time keeps it as their level one time.
 * @returns {Record<string, object>}
 */
function readAll() {
  const roads = {};

  // The old key first, so a record written under the new one always wins.
  const old = readKey(config.stage.storageKey);
  if (old && typeof old === 'object') {
    for (const [road, seconds] of Object.entries(old)) {
      if (typeof seconds !== 'number' || !Number.isFinite(seconds)) continue;
      const record = emptyRecord();
      record.levelTimes[0] = seconds;
      roads[road] = record;
    }
  }

  const current = readKey(config.levels.storageKey);
  if (current && typeof current === 'object') {
    for (const [road, record] of Object.entries(current)) {
      const clean = sanitise(record);
      if (clean) roads[road] = clean;
    }
  }

  return roads;
}

/**
 * A stored record is user data that has outlived the build that wrote it, so
 * every field is checked rather than trusted. Same reasoning as Selection's
 * validation of a stored bike or road name.
 * @param {*} record
 * @returns {object|null}
 */
function sanitise(record) {
  if (!record || typeof record !== 'object') return null;
  const clean = emptyRecord();
  if (Number.isFinite(record.reached)) {
    clean.reached = Math.max(1, Math.min(config.levels.count, Math.round(record.reached)));
  }
  if (Array.isArray(record.levelTimes)) {
    clean.levelTimes = record.levelTimes
      .slice(0, config.levels.count)
      .map((value) => (Number.isFinite(value) && value > 0 ? value : undefined));
  }
  if (Array.isArray(record.levelMedals)) {
    clean.levelMedals = record.levelMedals
      .slice(0, config.levels.count)
      .map((value) => (typeof value === 'string' ? value : undefined));
  }
  if (Number.isFinite(record.totalBest) && record.totalBest > 0) {
    clean.totalBest = record.totalBest;
  }
  return clean;
}

/** @param {string} key @returns {*} */
function readKey(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

/** @param {Record<string, object>} roads */
function writeAll(roads) {
  try {
    window.localStorage.setItem(config.levels.storageKey, JSON.stringify(roads));
  } catch (error) {
    // Progress that cannot be kept is not a reason to refuse to make any.
  }
}
