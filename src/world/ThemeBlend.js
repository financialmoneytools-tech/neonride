import * as THREE from 'three';
import { config } from '../config.js';
import { applyPatch } from '../utils/patch.js';

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
 * ================= COLOURS ARE NOT NUMBERS =================
 *
 * A colour in this config is a hex integer, and lerping 0x050310 toward
 * 0x16232f as an integer travels through whatever happens to lie between them.
 * Keys ending in `color` are interpolated as colours, in LINEAR space, because
 * the midpoint of two sRGB values is muddy - which on a sky gradient is the
 * only part anybody would look at.
 */

const _a = new THREE.Color();
const _b = new THREE.Color();
const _out = new THREE.Color();

/**
 * A key that holds a colour.
 *
 * BOTH ENDS, and the suffix-only version was a real bug caught by
 * tools/gate-probe.mjs rather than by reading. The sky writes colour as a
 * PREFIX - `colorBase`, `colorMid`, `colorTop`, `colorLow`, `colorHigh` - and
 * the road writes it as a suffix - `asphaltColor`, `sheenColor`, `bodyColor`.
 * Testing only for the suffix left every sky colour being interpolated as a
 * plain integer, so `0x0e0824` travelled to `0x16232f` through whatever
 * integers lie between them: measured, the dome's channels moved 18818 units of
 * RGB across a transition whose endpoints are 60 apart, lurching up to 429 in a
 * single frame. On screen that is a sky flickering through unrelated colours.
 */
function isColorKey(key) {
  return /(^color)|(color$)/i.test(key);
}

/**
 * Deep-resolves a theme into a complete snapshot of config as that theme would
 * leave it. Applied and then undone, so nothing is left behind.
 * @param {object} theme
 * @returns {object}
 */
function resolve(theme) {
  const undo = applyPatch(config, theme);
  const snapshot = JSON.parse(JSON.stringify({
    sky: config.sky,
    world: config.world,
  }));
  applyPatch(config, undo);
  return snapshot;
}

/**
 * Writes the interpolation of `from` and `to` into `target`, in place.
 *
 * Walks `to`, because that is what is being arrived at: a key the destination
 * does not mention is a key this blend has no opinion about, and is left
 * exactly as it is rather than being reset to a base value nobody asked for.
 */
function lerpInto(target, from, to, t) {
  for (const key of Object.keys(to)) {
    const next = to[key];
    const previous = from ? from[key] : undefined;

    if (Array.isArray(next)) {
      if (!Array.isArray(target[key])) continue;
      for (let i = 0; i < next.length && i < target[key].length; i++) {
        const fromItem = Array.isArray(previous) ? previous[i] : undefined;
        if (next[i] !== null && typeof next[i] === 'object') {
          lerpInto(target[key][i], fromItem, next[i], t);
        } else if (typeof next[i] === 'number' && typeof fromItem === 'number') {
          target[key][i] = fromItem + (next[i] - fromItem) * t;
        } else {
          target[key][i] = next[i];
        }
      }
      continue;
    }

    if (next !== null && typeof next === 'object') {
      if (target[key] === null || typeof target[key] !== 'object') continue;
      lerpInto(target[key], previous, next, t);
      continue;
    }

    if (typeof next === 'number' && typeof previous === 'number') {
      if (isColorKey(key)) {
        _a.setHex(previous, THREE.SRGBColorSpace).convertSRGBToLinear();
        _b.setHex(next, THREE.SRGBColorSpace).convertSRGBToLinear();
        _out.copy(_a).lerp(_b, t).convertLinearToSRGB();
        target[key] = _out.getHex();
      } else {
        target[key] = previous + (next - previous) * t;
      }
      continue;
    }

    // Anything that is not a number cannot be interpolated. A boolean, a null
    // weather kind, a string: these SWITCH, and they switch at the halfway
    // point, which is where the gate's flash is brightest. That is what the
    // flash is for - docs/THEMES.md says it is there to make the change feel
    // deliberate, and a value that cannot ramp is exactly the thing it covers.
    if (t >= 0.5) target[key] = next;
  }
}

export class ThemeBlend {
  /**
   * @param {object} modules everything with an applyTheme()
   */
  constructor(modules) {
    this.modules = modules;
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

    this.from = resolve(from || {});
    this.to = resolve(to);
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
  }
}
