import { config } from '../config.js';
import { applyPatch } from '../utils/patch.js';
import { resolve, lerpInto } from './theme/blendValues.js';

/**
 * ThemeBlend - drives every continuous value from one road to the next.
 *
 * ================= HOW IT WORKS =================
 *
 * It does NOT hand each module a pair of themes. It resolves both themes into
 * two complete config snapshots, interpolates between them straight into the
 * live `config` object, and then asks each module to copy config onto the GPU
 * through its own `applyTheme()`.
 *
 * That ordering is the whole design and it buys three things. `config` always
 * describes what is actually on screen, so the stats overlay, a console poke
 * and the next blend all agree with the frame. Every module keeps ONE method
 * that reads config, which is also what a load-time theme already does, so
 * there is no second path that can rot. And a value nobody wired up stays at
 * its A value visibly rather than half-transitioning.
 *
 * ================= WHAT IT REFUSES TO TOUCH =================
 *
 * Anything that sizes something. A pool, a buffer, a geometry, a shader define.
 * Those are allocated once at the union over every theme - see
 * maxStationsPerChunk() in world/Roadside.js and maxClouds() in
 * world/sky/Nebula.js - and `tools/theme-check.mjs` fails a theme that tries.
 * A blend that reallocated would stutter, and an InstancedMesh cannot be
 * resized at all.
 *
 * Also the carriageway. Every lateral position in the world derives from
 * world/road/layout.js and no theme may move it, which is what lets traffic
 * keep driving through a road that is changing colour underneath it.
 *
 * ================= WHERE THE ARITHMETIC LIVES =================
 *
 * Next door, in theme/blendValues.js: what a resolved theme snapshot is, and
 * what the midpoint of two of them means for a number, a colour, an array and
 * a boolean. This file owns only the lifecycle - when a change starts, how far
 * through it is, and who is told when it lands.
 */

export class ThemeBlend {
  /**
   * @param {object} modules everything with an applyTheme()
   * @param {import('../utils/patch.js').PatchSelector} [selector] the live
   *   theme selector, used once to recover the no-theme baseline
   */
  constructor(modules, selector = null) {
    this.modules = modules;
    // THE BASELINE, taken once, before this object has blended anything.
    //
    // A theme is already fitted by now - main.js selects one before the world
    // is built - so the baseline is taken by lifting it off, copying, and
    // putting it back. That is the only moment in the process when config is
    // guaranteed to be the plain base: from the first blend onward it holds
    // interpolated values forever, for the reason written over resolve().
    const fitted = selector ? selector.name : null;
    if (selector) selector.restore();
    this.base = JSON.parse(JSON.stringify({ sky: config.sky, world: config.world }));
    if (selector && fitted) selector.select(fitted);
    this.from = null;
    this.to = null;
    this.name = null;
    this.t = 1;
    this.duration = 1;
    this.active = false;
    /** Called with the destination name when a blend finishes. */
    this.onDone = null;
    /** Last applied scenery density per kind, quantised; see push(). */
    this._density = Object.create(null);
  }

  /**
   * Starts a blend from whatever is currently fitted to `name`.
   * @param {string} fromName
   * @param {string} toName
   * @param {number} duration seconds
   * @returns {boolean} whether it started
   */
  start(fromName, toName, duration) {
    const to = config.themes[toName];
    const from = config.themes[fromName];
    if (!to || fromName === toName) return false;

    this.from = resolve(from || {}, this.base);
    this.to = resolve(to, this.base);
    this.name = toName;
    this.duration = Math.max(0.0001, duration);
    this.t = 0;
    this.active = true;
    return true;
  }

  /** Applies a theme outright, with no transition. Used at load. */
  apply(name) {
    const theme = config.themes[name];
    if (!theme) return false;
    applyPatch(config, theme);
    this.push();
    return true;
  }

  /**
   * Ends any blend AT ONCE and leaves `name` fitted exactly, as though it had
   * been loaded into rather than arrived at.
   *
   * ================= WHY A RUN MUST CALL THIS =================
   *
   * The road screen previews a card by starting a real blend toward it - that
   * is the good part, a preview of a place that IS the place. What was missing
   * is anything that finishes one. Confirming a card called straight through
   * to the run with the blend still mid-flight, so the first seconds of a run
   * were spent arriving at the road the rider had already chosen, wearing
   * whatever they had swiped past on the way to it.
   *
   * Measured through the menus, landing on Sunset Highway: at the start line
   * the blend was at t = 0.89 with `sky.aurora.intensity` at 4.24 - a full
   * Aurora Pass curtain - the dome base at 0x701c1b instead of 0xd4562a and
   * the fog deep blue at 0x0d1420. Reported from a phone as three captures of
   * one theme showing "an orange sunset, a deep blue starfield and a teal
   * night", which is Sunset Highway, Galaxy Road and Aurora Pass: the three
   * cards on the way to the one that was picked.
   *
   * Note that it does NOT simply stop the blend. Stopping leaves the mush; the
   * point is to land on the road's own values, which is what resolving over
   * the baseline gives.
   * @param {string} name
   */
  settle(name) {
    this.active = false;
    this.t = 1;
    this.from = null;
    this.to = null;
    this.name = null;
    const theme = config.themes[name];
    if (theme) {
      const exact = resolve(theme, this.base);
      // t = 1, so every value is assigned rather than interpolated - see the
      // colour branch in lerpInto.
      lerpInto({ sky: config.sky, world: config.world }, exact, exact, 1);
    }
    this.push();
  }

  /** @param {number} dt */
  update(dt) {
    if (!this.active) return;
    this.t = Math.min(1, this.t + dt / this.duration);
    // Smoothstep, so the change eases in and out rather than starting and
    // stopping on a hard edge. A linear colour ramp reads as a wipe.
    const eased = this.t * this.t * (3 - 2 * this.t);
    lerpInto({ sky: config.sky, world: config.world }, this.from, this.to, eased);
    this.push();

    if (this.t >= 1) {
      this.active = false;
      if (this.onDone) this.onDone(this.name);
    }
  }

  /** Copies config onto the GPU. Cheap enough to do every frame of a blend. */
  push() {
    const m = this.modules;
    if (m.sky) m.sky.applyTheme();
    if (m.roadMaterial) m.roadMaterial.applyTheme();
    if (m.roadside) m.roadside.applyTheme();
    if (m.median) m.median.applyTheme();
    if (m.mountains) m.mountains.applyTheme();
    if (m.ground) m.ground.applyTheme();
    if (m.fog) {
      m.fog.color.set(config.world.fog.color);
      m.fog.density = config.world.fog.density;
    }
    if (m.weather) {
      const kind = config.world.weather.kind;
      if (kind !== m.weather.kind) m.weather.setKind(kind);
      // Faded by how far into the destination we are, so snow arrives rather
      // than appearing. Weather is the strongest comfort trigger the project
      // has, and a wall of it switching on in one frame is the worst version.
      m.weather.setFade(kind ? (this.active ? this.t : 1) : 0);
    }
    // SCENERY ONLY WHEN THE COUNT ACTUALLY MOVES. A density is quantised into
    // whole props - Scenery rounds `perChunk * density` - so most frames of a
    // blend ask for exactly the trees that are already there, and re-placing
    // every prop in eight chunks sixty times a second to achieve nothing is the
    // one part of this that would show up as a stutter.
    if (m.scenery) {
      // Colour is cheap - a handful of uniform writes - so it goes every
      // frame, unlike the densities below which re-place geometry.
      m.scenery.applyTheme();
      const densities = config.world.scenery.density;
      let changed = false;
      for (const kind of Object.keys(densities)) {
        const live = Math.round((densities[kind] || 0) * 100);
        if (this._density[kind] !== live) {
          this._density[kind] = live;
          changed = true;
        }
      }
      if (changed) m.scenery.refill();
    }
  }

  dispose() {
    this.modules = {};
    this.from = null;
    this.to = null;
    this.base = null;
  }
}
