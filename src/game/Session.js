import { config } from '../config.js';
import { Stage, CROSSED } from './Stage.js';
import { Levels } from './Levels.js';

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
 * TWO MODES, ONE SET OF RULES. A staged run is ten levels of five kilometres
 * with a finish line at the end of each; an endless run is the original
 * ride-until-you-crash. They share the lives, the scoring, the pause and the
 * fail state, and differ in exactly one thing: whether there is a distance at
 * which the run ENDS WELL. That is why the mode is a field here rather than a
 * second Session subclass - the moment the rules were duplicated they would
 * start to disagree.
 *
 * A LEVEL BOUNDARY IS NOT AN ENDING. Crossing five kilometres on levels one
 * to nine advances the level and changes nothing else: the phase stays
 * RUNNING, the loop is never paused, no card appears and the bike is not
 * touched. The only things that happen are a life handed back, a banner, and
 * the traffic re-tuning. That is what "riding continues without a break in
 * flow" means in code - there is no state to leave and re-enter.
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
 * high score; STAGE is ten levels of five kilometres with a result at the end
 * of each and a celebration at the end of the tenth.
 */
export const MODE = {
  STAGE: 'stage',
  ENDLESS: 'endless',
};

export class Session {
  /**
   * @param {import('./Progress.js').Progress} [progress] per-road records. A
   *   Session without one still runs - every level simply records nothing -
   *   which is what keeps the endless mode and the tools free of storage.
   */
  constructor(progress = null) {
    this.phase = PHASE.TITLE;
    /** A MODE value. Chosen on the title card; god mode ignores it entirely. */
    this.mode = MODE.ENDLESS;
    /** Progress through the LEVEL being ridden. Unread in endless mode. */
    this.stage = new Stage();
    /** Which level that is, and what the ten of them were worth. */
    this.levels = new Levels(progress);
    /** The road being ridden, for the per-road record. Set by `begin`. */
    this.road = '';
    /**
     * Set on the frame a level boundary is crossed, for the banner to read
     * once. Cleared by whoever consumed it; see ui/LevelBanner.js.
     */
    this.levelJustReached = 0;
    /**
     * Whether that crossing actually handed a life back. Published rather
     * than inferred: after the fact the banner sees `lives === 3` and cannot
     * tell a rider who was given their third from one who already had it, and
     * a banner that claims +1 CAN when nothing was given is the game lying
     * about the one resource the player is counting.
     */
    this.levelGainedLife = false;
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
   * @param {object} [run] which road and which level to start on
   * @param {string} [run.road] the road, for the per-road record
   * @param {number} [run.level] the level to begin at, 1 unless replaying
   */
  begin(state, mode, run = {}) {
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
    this.levelJustReached = 0;
    this.levelGainedLife = false;
    if (run.road !== undefined) this.road = run.road;
    this.levels.reset(run.level || 1);
    // Recorded as REACHED on entry rather than on completion, so a rider who
    // gets to level eight and dies there may go back and practise level eight.
    if (this.staged && this.levels.progress) {
      this.levels.progress.enter(this.road, this.levels.level);
    }
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
    // WHICH LEVEL THE TRAFFIC SHOULD BE, and how far into it. Published here
    // rather than reached for, because world/Traffic.js already takes the loop
    // state and giving it a Session would hand the traffic the phase, the
    // lives and the score as well - none of which it may have an opinion on.
    //
    // ZERO MEANS "NO LEVEL", which is endless mode and god mode, and it is
    // what keeps SONSUZ exactly the game it was: the traffic falls back to the
    // shared player model and its original distance-driven ramp.
    state.level = this.staged ? this.levels.level : 0;
    state.levelTravelled = this.staged ? this.stage.travelled : 0;

    // THE ONE THING THE CELEBRATION NEEDS THE BIKE TO DO: stop. Published
    // rather than reached for, so game/Celebration.js still never touches
    // the bike and the rule that it only moves the camera survives.
    //
    // It is needed because `throttleFloor` means a hands-off bike is pulling
    // 42 per cent - correct everywhere else, and here it rode straight past
    // the podium at 150 m/s while the camera waited at it.
    state.coasting = this.phase === PHASE.FINISHED && this.staged;
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
    if (crossed === CROSSED.FINISH) return this._crossLine(state);
    return crossed;
  }

  /**
   * A level's line, crossed. Either the run continues or the road is done.
   *
   * THE CONTINUING CASE TOUCHES ALMOST NOTHING, and that is the requirement
   * rather than an optimisation. The phase stays RUNNING, the loop is never
   * paused, `dt` keeps flowing, the bike and the camera are not spoken to at
   * all. A new Stage clock starts from where the bike already is, a life comes
   * back, and the banner is handed a number. Anything that stopped here -
   * a card, a phase change, a call into the bike - would be a break in the
   * flow, and the whole point of ten levels is that there is not one.
   *
   * @param {object} state loop state
   * @returns {string} a CROSSED value
   */
  _crossLine(state) {
    const result = this.levels.finishLevel(this.road, this.stage.time);

    if (result.last) {
      this._finish();
      return CROSSED.FINISH;
    }

    // ONE LIFE BACK, capped. Not a refill - see config/levels.js.
    const before = this.lives;
    this.lives = Levels.livesAfterLevel(this.lives);
    this.levelGainedLife = this.lives > before;
    this.levelJustReached = this.levels.level;
    // The next level starts HERE, at the line, not at some reset origin: the
    // road is generated from distance travelled and nothing about the world
    // moves when a level changes.
    this.stage.begin(state);
    return CROSSED.LEVEL;
  }

  /**
   * Reached the LAST line - level ten. A different ending from `_end`, with a
   * different card and a different delay; see `resultsDelay` in
   * config/stage.js and the celebration that plays over it.
   */
  _finish() {
    this.phase = PHASE.FINISHED;
    // THE CARD WAITS FOR THE CELEBRATION. `stage.resultsDelay` is 1.4 s and
    // was written when a finish was a flash and a line; the celebration runs
    // for seven and a half, and a card that lands at 1.4 sits over the crane,
    // the podium and the bike for the whole of the shot the scene exists to
    // produce. Photographed: a results card over a screen of confetti with
    // the podium invisible behind it.
    //
    // A staged run is always the road's end now, so it always waits. Endless
    // and the failure path are untouched - see `_end`.
    this._overAt = this.staged
      ? config.celebration.timing.holdSeconds
      : config.stage.resultsDelay;
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
