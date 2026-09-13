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
    this._clock = new THREE.Clock(false);
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
    this._clock.start();
    this.renderer.setAnimationLoop(this._tick);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this._clock.stop();
    this.renderer.setAnimationLoop(null);
  }

  _tick() {
    const raw = this._clock.getDelta();
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

  /** Frame counter plus renderer.info readout (only valid AFTER render). */
  _measure(raw) {
    const info = this.renderer.info;
    this.state.drawCalls = info.render.calls;
    this.state.triangles = info.render.triangles;
    this.state.programs = info.programs ? info.programs.length : 0;

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
    this._listeners.length = 0;
    this.onRender = null;
    this.renderer = null;
  }
}
