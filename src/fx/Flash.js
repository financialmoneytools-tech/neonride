import * as THREE from 'three';
import { config } from '../config.js';
import { motionScale } from '../core/Comfort.js';

/**
 * Flash - the one screen flash, and the only thing allowed to raise one.
 *
 * Four callers: a collision, a near miss, a checkpoint gate and a theme gate.
 * Each names a source in config/flash.js and this owns everything else - the
 * decay, the refractory, which source wins when two are live, the comfort
 * scale, and the two gates that were missing entirely.
 *
 * WHY IT IS ITS OWN OBJECT. The collision flash used to be raised in
 * world/traffic/TrafficEvents.js, decayed in world/Traffic.js, configured in
 * config/traffic.js and resolved in fx/Postprocess.js. No file owned it, so
 * nothing was in a position to ask the two questions that mattered: is the run
 * still going, and is the rider inside the grace window. The answer to both was
 * no and nobody asked, which is how a run that had already ended went on
 * painting the sky deep red every 1.43 seconds behind the game-over panel. See
 * the header of config/flash.js for the measurements.
 *
 * TRAFFIC NO LONGER RAISES ANYTHING. It publishes `state.hits` and
 * `state.nearMisses`, which are totals that only ever go up - a shape the
 * project already trusts for the fail state, and for the same reason: a level
 * that decays has to be sampled at the right moment and will either miss an
 * event between two frames or count one event several times depending on the
 * frame rate. This watches those totals rise. The gates call `fire()` directly,
 * because a gate is not a thing that can be counted after the fact.
 */
export class Flash {
  constructor() {
    /** The resolved flash for this frame, read by Postprocess. */
    this.color = new THREE.Color(0xffffff);
    this.amount = 0;
    this.edge = 0;
    this.aberrationBoost = 0;

    /** Live level per source, 1 at the moment it fires and decaying to 0. */
    this._level = Object.create(null);
    /** Seconds left before a source may fire again. */
    this._refractory = Object.create(null);
    for (const name of Object.keys(config.flash.sources)) {
      this._level[name] = 0;
      this._refractory[name] = 0;
    }

    // Totals as of the previous frame. Watching the DELTA is what turns a
    // monotonic counter back into an event without any of a decaying level's
    // sampling problems.
    this._hits = 0;
    this._nearMisses = 0;
    /** Set once a state has been seen, so the first frame is not one big event. */
    this._seeded = false;

    /** Counted for the probe tool: fires that were refused, and why. */
    this.blocked = { notRunning: 0, invulnerable: 0, refractory: 0, disabled: 0 };
    /** Counted for the probe tool: fires that were allowed, per source. */
    this.fired = Object.create(null);
  }

  /**
   * Raises a flash, if that source is allowed to fire right now.
   *
   * @param {string} name a key of config.flash.sources
   * @param {object} [state] the loop state; omitted only by callers that have
   *   already been told the run is irrelevant to them
   * @returns {boolean} whether it actually fired
   */
  fire(name, state) {
    const cfg = config.flash;
    const source = cfg.sources[name];
    if (!source) return false;

    if (!cfg.enabled) {
      this.blocked.disabled++;
      return false;
    }
    // THE TWO GATES THAT DID NOT EXIST. Order matters only for the counters;
    // either one refusing is enough.
    if (source.requiresRun && !(state && state.scoring)) {
      this.blocked.notRunning++;
      return false;
    }
    if (source.blockedWhileInvulnerable && state && (state.invulnerable || 0) > 0) {
      this.blocked.invulnerable++;
      return false;
    }
    if (this._refractory[name] > 0) {
      this.blocked.refractory++;
      return false;
    }

    this._level[name] = 1;
    this._refractory[name] = source.refractory;
    this.fired[name] = (this.fired[name] || 0) + 1;
    return true;
  }

  /**
   * Decays every live source, picks the winner and publishes it.
   *
   * @param {number} dt
   * @param {object} state shared loop state; reads hits, nearMisses, scoring
   *   and invulnerable
   */
  update(dt, state) {
    const cfg = config.flash;
    const sources = cfg.sources;

    for (const name of Object.keys(sources)) {
      const duration = sources[name].duration || 0.001;
      this._level[name] = Math.max(0, this._level[name] - dt / duration);
      this._refractory[name] = Math.max(0, this._refractory[name] - dt);
    }

    // Traffic's totals, turned back into events. Seeded on the first frame so a
    // restart - which does not reset the totals, because the world is never
    // rebuilt - cannot arrive as a burst.
    const hits = (state && state.hits) || 0;
    const nearMisses = (state && state.nearMisses) || 0;
    if (!this._seeded) {
      this._hits = hits;
      this._nearMisses = nearMisses;
      this._seeded = true;
    }
    if (hits > this._hits) {
      this._hits = hits;
      this.fire('collision', state);
    }
    if (nearMisses > this._nearMisses) {
      this._nearMisses = nearMisses;
      this.fire('nearMiss', state);
    }

    // THE WINNER IS THE BRIGHTEST, with priority breaking a tie. A hit beats a
    // near miss when both are live, which is right: if you touched something,
    // that is the thing worth showing.
    const comfort = motionScale('flash');
    let best = null;
    let bestLevel = 0;
    let bestPriority = -1;
    for (const name of Object.keys(sources)) {
      const level = this._level[name];
      if (level <= 0) continue;
      const source = sources[name];
      const lit = level * source.strength;
      if (lit > bestLevel || (lit === bestLevel && source.priority > bestPriority)) {
        best = source;
        bestLevel = lit;
        bestPriority = source.priority;
      }
    }

    if (best) {
      this.color.set(best.color);
      this.amount = bestLevel * cfg.gain * comfort;
      this.edge = best.edge;
    } else {
      this.amount = 0;
      this.edge = 0;
    }

    // The near miss widens the fringes whether or not it won the light, because
    // it is a different channel and losing the flash is not losing the event.
    const near = sources.nearMiss;
    this.aberrationBoost = this._level.nearMiss * (near.aberrationBoost || 0) * comfort;
  }

  /**
   * Clears every live flash. Called when a run begins, so a crash in the last
   * second of the previous run cannot bleed into the first frame of the next.
   */
  reset() {
    for (const name of Object.keys(this._level)) {
      this._level[name] = 0;
      this._refractory[name] = 0;
    }
    this.amount = 0;
    this.edge = 0;
    this.aberrationBoost = 0;
    this._seeded = false;
  }

  dispose() {
    this._level = Object.create(null);
    this._refractory = Object.create(null);
  }
}
