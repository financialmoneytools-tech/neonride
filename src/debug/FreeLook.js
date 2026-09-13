import { config } from '../config.js';

/**
 * FreeLook - TEMPORARY development camera.
 * Lets the sky be inspected in every direction before the rider owns the
 * camera: steer looks left and right, throttle and brake look up and down.
 *
 * Phase 4 removes this by deleting src/debug/ and the two FreeLook lines in
 * main.js. Nothing else in the project references it.
 */
export class FreeLook {
  /**
   * Creates the controller and registers it with the loop, but only when
   * config.debug.freeLook is on.
   * @param {import('../core/Loop.js').Loop} loop
   * @param {import('three').Camera} camera
   * @param {import('../core/Input.js').Input} input
   * @returns {FreeLook|null} null when the flag is off
   */
  static install(loop, camera, input) {
    if (!config.debug.freeLook) return null;

    const freeLook = new FreeLook(camera, input);
    freeLook._listener = loop.add((dt) => freeLook.update(dt));
    freeLook._loop = loop;
    return freeLook;
  }

  constructor(camera, input) {
    this.camera = camera;
    this.input = input;

    this.yaw = 0;
    this.pitch = 0;

    this._loop = null;
    this._listener = null;

    // YXZ keeps yaw and pitch independent, which is what a look control wants
    this._previousOrder = camera.rotation.order;
    camera.rotation.order = 'YXZ';
  }

  /** @param {number} dt */
  update(dt) {
    const speed = config.debug.lookAroundSpeed;
    const limit = config.debug.lookPitchLimit;
    const values = this.input.values;

    this.yaw -= values.steer * speed * dt;
    this.pitch += (values.throttle - values.brake) * speed * dt;
    this.pitch = Math.max(-limit, Math.min(limit, this.pitch));

    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }

  dispose() {
    if (this._loop && this._listener) this._loop.remove(this._listener);
    this.camera.rotation.order = this._previousOrder;
    this._loop = null;
    this._listener = null;
    this.camera = null;
    this.input = null;
  }
}
