import { config } from '../config.js';

/**
 * FreeLook - TEMPORARY development camera.
 * Steer looks left and right, throttle and brake look up and down.
 *
 * It runs after RoadCamera and ADDS its offsets to whatever rotation the road
 * camera just wrote, so it is a look-around on top of the ride rather than a
 * replacement for it. RoadCamera rewrites the rotation from scratch every
 * frame, which is what makes adding safe and keeps this stateless.
 *
 * It is installed but idle by default. Set config.debug.freeLook to true - in
 * the config file or straight from the browser console - to switch it on; the
 * offsets reset whenever it is off, so the view snaps back to the road.
 *
 * Phase 4 removes this by deleting src/debug/ and the two FreeLook lines in
 * main.js. Nothing else in the project references it.
 */
export class FreeLook {
  /**
   * Creates the controller and registers it with the loop.
   * @param {import('../core/Loop.js').Loop} loop
   * @param {import('three').Camera} camera
   * @param {import('../core/Input.js').Input} input
   * @returns {FreeLook}
   */
  static install(loop, camera, input) {
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
  }

  /** @param {number} dt */
  update(dt) {
    if (!config.debug.freeLook) {
      this.yaw = 0;
      this.pitch = 0;
      return;
    }

    const speed = config.debug.lookAroundSpeed;
    const limit = config.debug.lookPitchLimit;
    const values = this.input.values;

    this.yaw -= values.steer * speed * dt;
    this.pitch += (values.throttle - values.brake) * speed * dt;
    this.pitch = Math.max(-limit, Math.min(limit, this.pitch));

    this.camera.rotation.x += this.pitch;
    this.camera.rotation.y += this.yaw;
  }

  dispose() {
    if (this._loop && this._listener) this._loop.remove(this._listener);
    this._loop = null;
    this._listener = null;
    this.camera = null;
    this.input = null;
  }
}
