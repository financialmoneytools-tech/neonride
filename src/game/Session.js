import { config } from '../config.js';
import { Stage, CROSSED } from './Stage.js';

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
 *
 * TWO MODES, ONE SET OF RULES. A staged run is five kilometres with a finish
 * line; an endless run is the original ride-until-you-crash. They share the
 * lives, the scoring, the pause and the fail state, and differ in exactly one
 * thing: whether there is a distance at which the run ENDS WELL. That is why
 * the mode is a field here rather than a second Session subclass - the moment
 * the rules were duplicated they would start to disagree.
 */

export const PHASE = {
  /** Title card up, world running behind it, nothing scored yet. */
  TITLE: 'title',
  RUNNING: 'running',
  PAUSED: 'paused',
  OVER: 'over',
  /** God mode. No HUD, no fail, no pause; the recording is never interrupted. */
  FREE: 'free',
  /** A staged run that reached the line. Not a failure; it has a result. */
  FINISHED: 'finished',
};

/**
 * What kind of run this is. ENDLESS is the original game and still owns the
 * high score; STAGE is five kilometres with a result at the end.
 */
export const MODE = {
  STAGE: 'stage',
  ENDLESS: 'endless',
};

export class Session {
  constructor() {
    this.phase = PHASE.TITLE;
    /** A MODE value. Chosen on the title card; god mode ignores it entirely. */
    this.mode = MODE.ENDLESS;
    /** Progress through a staged run. Untouched, and unread, in endless mode. */
    this.stage = new Stage();
    this.score = 0;
    this.distance = 0;
    this.nearMisses = 0;
    this.best = readBest();
    /** Crashes left before the run ends. Shown on the HUD. */
    this.lives = config.game.crashesAllowed;
    /** Seconds of grace left after a crash; traffic cannot take a life. */
    this.invulnerable = 0;
    /** Counts up per run, so the game over panel can say whether it is a record. */
    this.isRecord = false;

    this._startDistance = 0;
    this._startHits = 0;
    this._startNearMisses = 0;
    this._countedHits = 0;
    this._overAt = 0;
    /** True once the panel should be shown; see `overDelay` in config/game.js. */
    this.overShown = false;
  }

  /** @returns {boolean} true while the run is scoring. */
  get scoring() {
    return this.phase === PHASE.RUNNING;
  }

  /** @returns {boolean} whether this run has a finish line. */
  get staged() {
    return this.mode === MODE.STAGE;
  }

  /**
   * @returns {boolean} whether the run is over, however it ended. Both the
   * failure card and the results card answer to this, so nothing downstream has
   * to remember that there are two ways to stop.
   */
  get ended() {
    return this.phase === PHASE.OVER || this.phase === PHASE.FINISHED;
  }

  /**
   * Starts a run. Called from the title card's gesture and from a restart, and
   * it is the same thing both times.
   * @param {object} state loop state
   * @param {string} [mode] a MODE value; the previous one is kept when omitted,
   *   so a restart repeats the run the player was actually having.
   */
  begin(state, mode) {
    if (mode) this.mode = mode;
    this.phase = PHASE.RUNNING;
    this.score = 0;
    this.distance = 0;
    this.nearMisses = 0;
    this.isRecord = false;
    this.overShown = false;
    this.lives = config.game.crashesAllowed;
    this.invulnerable = 0;
    this._startDistance = state.distance || 0;
    this._startHits = state.hits || 0;
    this._startNearMisses = state.nearMisses || 0;
    this._countedHits = 0;
    this.stage.begin(state);
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
   * Publishes what the rest of the frame needs to know about the run, and
   * nothing else. Called FIRST in the loop, before anything that reads it.
   *
   * It is separate from `update` because update runs LAST - a run has to be
   * scored from the frame that has already happened - and the flash, which has
   * to know whether the run is still going, runs in the middle. Publishing from
   * update would hand every reader the previous frame's answer, which on the
   * one frame that matters, the frame a run ends, is the wrong answer.
   *
   * WHATEVER THE PHASE, and that is the fix rather than a detail.
   * `invulnerable` used to be written only while the run was RUNNING, so the
   * moment the third life went the value FROZE at 1.60 and stayed there for the
   * rest of the session. Anything asking "is the rider inside the grace window"
   * got yes, forever, on a run that was over - measured, and it is what kept
   * the collision flash re-arming behind the game-over panel. A value that
   * stops being updated does not stop being read.
   *
   * @param {object} state shared loop state
   */
  publish(state) {
    state.scoring = this.scoring;
    state.invulnerable = this.phase === PHASE.RUNNING ? this.invulnerable : 0;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads distance, hits and nearMisses
   */
  update(dt, state) {
    // Both endings wait before their card arrives, and they wait different
    // lengths: a crash wants its flash and its shove seen, a finish wants the
    // line crossed. `_overAt` is set by whichever ended the run.
    if (this.ended && !this.overShown) {
      this._overAt -= dt;
      if (this._overAt <= 0) this.overShown = true;
      return null;
    }

    if (this.phase !== PHASE.RUNNING) return null;

    const cfg = config.game;

    this.distance = Math.max(0, (state.distance || 0) - this._startDistance);
    this.nearMisses = (state.nearMisses || 0) - this._startNearMisses;
    this.score = Math.floor(
      this.distance * cfg.pointsPerUnit + this.nearMisses * cfg.nearMissPoints,
    );

    // LIVES, and the invulnerable window is not decoration. Counted, not
    // sampled: `state.impact` is a level that decays over a third of a second,
    // so testing it would either miss a hit between two frames or count one hit
    // several times depending on the frame rate. A total that only goes up
    // cannot do either.
    //
    // The window exists because a collision often leaves the bike still inside
    // the vehicle: without it the next few frames take the second and third
    // life as well, and the game appears to charge three lives for one mistake.
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    state.invulnerable = this.invulnerable;

    const crashes = (state.hits || 0) - this._startHits;
    if (crashes > this._countedHits) {
      this._countedHits = crashes;
      if (this.invulnerable <= 0) {
        this.lives -= 1;
        this.invulnerable = cfg.invulnerable;
        state.invulnerable = this.invulnerable;
        if (this.lives <= 0) {
          this._end();
          return null;
        }
      }
    }

    // THE STAGE IS ADVANCED LAST, after the lives, so a crash on the very
    // frame the line is crossed ends the run rather than finishing it. That is
    // the right way round: the finish is a reward and a third crash is a
    // failure, and a frame that is both is a failure.
    if (this.mode !== MODE.STAGE) return null;
    const crossed = this.stage.update(dt, state);
    if (crossed === CROSSED.FINISH) this._finish();
    return crossed;
  }

  /**
   * Reached the line. A different ending from `_end`, with a different card and
   * a different delay - see `resultsDelay` in config/stage.js.
   */
  _finish() {
    this.phase = PHASE.FINISHED;
    this._overAt = config.stage.resultsDelay;
    this.overShown = false;

    // The endless high score is still written. A staged run is distance and
    // near misses like any other, and a rider who scores well over five
    // kilometres has earned the same entry as one who scored it in one go.
    if (this.score > this.best) {
      this.best = this.score;
      this.isRecord = true;
      writeBest(this.best);
    }
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
