import * as THREE from 'three';
import { config } from '../config.js';

/**
 * Loop - the single animation loop of the project.
 * No module opens its own requestAnimationFrame; each one registers an
 * update(dt, state) listener here instead.
 */
export class Loop {
  /**
   * @param {THREE.WebGLRenderer} renderer owner of setAnimationLoop
   * @param {{ onRender?: (dt:number, state:object) => void, state?: object }} options
   */
  constructor(renderer, { onRender = null, state = {} } = {}) {
    this.renderer = renderer;
    this.onRender = onRender;
    this.running = false;

    this._listeners = [];

    // THREE.Clock is deprecated since r183; Timer is the supported replacement.
    // connect() lets it use the Page Visibility API, so a hidden tab reports a
    // zero delta instead of one huge catch up frame.
    this._timer = new THREE.Timer();
    this._timer.connect(document);

    this._tick = this._tick.bind(this);

    // FPS sampling window
    this._frames = 0;
    this._elapsedSinceSample = 0;

    /** Live state object shared by every module. */
    this.state = Object.assign(state, {
      dt: 0,
      elapsed: 0,
      frame: 0,
      fps: 0,
      frameMs: 0,
      drawCalls: 0,
      triangles: 0,
      programs: 0,
      // Live resource counts. They are the cheapest leak detector there is:
      // in a pooled scene they must stay flat once the first frame is drawn.
      geometries: 0,
      textures: 0,
    });
  }

  /** @param {(dt:number, state:object) => void} fn */
  add(fn) {
    if (typeof fn === 'function' && !this._listeners.includes(fn)) this._listeners.push(fn);
    return fn;
  }

  /** @param {(dt:number, state:object) => void} fn */
  remove(fn) {
    const i = this._listeners.indexOf(fn);
    if (i !== -1) this._listeners.splice(i, 1);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._timer.reset();
    this.renderer.setAnimationLoop(this._tick);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  /** @param {number} timestamp provided by setAnimationLoop */
  _tick(timestamp) {
    this._timer.update(timestamp);

    const raw = this._timer.getDelta();
    const dt = Math.min(raw, config.loop.maxDelta);

    const state = this.state;
    state.dt = dt;
    state.elapsed += dt;
    state.frame++;

    // A listener may mutate the list during update, so iterate over a copy
    const listeners = this._listeners.slice();
    for (let i = 0; i < listeners.length; i++) listeners[i](dt, state);

    if (this.onRender) this.onRender(dt, state);

    this._measure(raw);
  }

  /**
   * Frame counter plus renderer.info readout. Only valid AFTER render, and with
   * post processing on the counts cover every pass in the frame, not just the
   * scene: Postprocess takes over the reset so they add up instead of being
   * overwritten by the last full screen quad.
   */
  _measure(raw) {
    const info = this.renderer.info;
    this.state.drawCalls = info.render.calls;
    this.state.triangles = info.render.triangles;
    this.state.programs = info.programs ? info.programs.length : 0;
    this.state.geometries = info.memory.geometries;
    this.state.textures = info.memory.textures;

    this._frames++;
    this._elapsedSinceSample += raw;

    const interval = config.stats.updateInterval;
    if (this._elapsedSinceSample >= interval) {
      this.state.fps = this._frames / this._elapsedSinceSample;
      this.state.frameMs = (this._elapsedSinceSample * 1000) / this._frames;
      this._frames = 0;
      this._elapsedSinceSample = 0;
    }
  }

  dispose() {
    this.stop();
    this._timer.dispose();
    this._listeners.length = 0;
    this.onRender = null;
    this.renderer = null;
  }
}
