import { config } from '../config.js';

/**
 * Session - one run: what it scored, whether it is still going, and why it
 * stopped.
 *
 * It owns no geometry, no camera and no physics. It reads the loop state and
 * decides what PHASE the game is in, and everything that shows something -
 * the HUD, the panels - reads that phase back. That is what keeps the rules in
 * one file instead of spread across whatever happened to need them.
 *
 * GOD MODE IS A PHASE OF ITS OWN, not a flag checked in six places. `free` has
 * no HUD, no fail state and no pause, so a recording cannot be interrupted by a
 * panel and cannot be ended by clipping a van in the last second of a take. It
 * is checked once, here, and every consumer gets it for nothing.
 *
 * RESTARTING DOES NOT RESET THE WORLD. The road is infinite and generated from
 * distance travelled, and the traffic recycles relative to the player, so
 * sending distance back to zero would mean rebuilding both for no visible gain.
 * A run records where it began and scores the difference, which is the same
 * number to the player and nothing at all to the rest of the project.
 *
 * SCORE IS DISTANCE PLUS NEAR MISSES. Distance alone would be a score for doing
 * nothing: the bike accelerates on its own from `throttleFloor`. A near miss is
 * the one event here that cannot happen by accident.
 */

export const PHASE = {
  /** Title card up, world running behind it, nothing scored yet. */
  TITLE: 'title',
  RUNNING: 'running',
  PAUSED: 'paused',
  OVER: 'over',
  /** God mode. No HUD, no fail, no pause; the recording is never interrupted. */
  FREE: 'free',
};

export class Session {
  constructor() {
    this.phase = PHASE.TITLE;
    this.score = 0;
    this.distance = 0;
    this.nearMisses = 0;
    this.best = readBest();
    /** Counts up per run, so the game over panel can say whether it is a record. */
    this.isRecord = false;

    this._startDistance = 0;
    this._startHits = 0;
    this._startNearMisses = 0;
    this._overAt = 0;
    /** True once the panel should be shown; see `overDelay` in config/game.js. */
    this.overShown = false;
  }

  /** @returns {boolean} true while the run is scoring. */
  get scoring() {
    return this.phase === PHASE.RUNNING;
  }

  /**
   * Starts a run. Called from the title card's gesture and from a restart, and
   * it is the same thing both times.
   * @param {object} state loop state
   */
  begin(state) {
    this.phase = PHASE.RUNNING;
    this.score = 0;
    this.distance = 0;
    this.nearMisses = 0;
    this.isRecord = false;
    this.overShown = false;
    this._startDistance = state.distance || 0;
    this._startHits = state.hits || 0;
    this._startNearMisses = state.nearMisses || 0;
  }

  /**
   * Hands the run to the autopilot. Irreversible within a session on purpose:
   * god mode is a recording tool, and a recording that can fall back into a
   * scored run halfway through is a recording with a panel in it.
   */
  free() {
    this.phase = PHASE.FREE;
  }

  /** @returns {boolean} whether the pause actually changed anything. */
  togglePause() {
    if (this.phase === PHASE.RUNNING) {
      this.phase = PHASE.PAUSED;
      return true;
    }
    if (this.phase === PHASE.PAUSED) {
      this.phase = PHASE.RUNNING;
      return true;
    }
    return false;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads distance, hits and nearMisses
   */
  update(dt, state) {
    if (this.phase === PHASE.OVER && !this.overShown) {
      this._overAt -= dt;
      if (this._overAt <= 0) this.overShown = true;
      return;
    }

    if (this.phase !== PHASE.RUNNING) return;

    const cfg = config.game;

    this.distance = Math.max(0, (state.distance || 0) - this._startDistance);
    this.nearMisses = (state.nearMisses || 0) - this._startNearMisses;
    this.score = Math.floor(
      this.distance * cfg.pointsPerUnit + this.nearMisses * cfg.nearMissPoints,
    );

    // Counted, not sampled. `state.impact` is a level that decays over a third
    // of a second, so testing it would either miss a hit between two frames or
    // count one hit several times depending on the frame rate. A total that
    // only goes up cannot do either.
    const crashes = (state.hits || 0) - this._startHits;
    if (crashes >= cfg.crashesAllowed) this._end();
  }

  _end() {
    this.phase = PHASE.OVER;
    this._overAt = config.game.overDelay;
    this.overShown = false;

    if (this.score > this.best) {
      this.best = this.score;
      this.isRecord = true;
      writeBest(this.best);
    }
  }
}

/**
 * localStorage can throw outright rather than return nothing - a browser with
 * site data blocked, or private mode on some versions - so this is guarded and
 * the game runs perfectly well without it.
 * @returns {number}
 */
function readBest() {
  try {
    const raw = window.localStorage.getItem(config.game.storageKey);
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    return 0;
  }
}

/** @param {number} value */
function writeBest(value) {
  try {
    window.localStorage.setItem(config.game.storageKey, String(value));
  } catch (error) {
    // A best score that cannot be kept is not a reason to stop the game.
  }
}
