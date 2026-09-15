import { config } from '../config.js';
import { noiseSource } from './sources.js';

/**
 * Wind - noise through a bandpass that opens and brightens with speed.
 *
 * The one sound in the project that genuinely is just filtered noise, so there
 * is nothing cleverer to do here and nothing gained by pretending otherwise.
 *
 * The level goes with the SQUARE of speed, which is roughly what wind noise
 * does, and getting that exponent right matters more than it sounds: a linear
 * ramp is too loud at a crawl and has nothing left to give across the top third
 * of the range, which is where this game spends its life.
 */
export class Wind {
  /**
   * @param {AudioContext} ctx
   * @param {AudioNode} destination
   * @param {AudioBuffer} noise
   */
  constructor(ctx, destination, noise) {
    const cfg = config.audio.wind;
    this.ctx = ctx;

    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(destination);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'bandpass';
    this.filter.frequency.value = cfg.low;
    this.filter.Q.value = cfg.q;
    this.filter.connect(this.out);

    this.noise = noiseSource(ctx, noise);
    this.noise.connect(this.filter);
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads speedRatio
   */
  update(dt, state) {
    const cfg = config.audio.wind;
    const now = this.ctx.currentTime;
    const tau = config.audio.master.tau;

    const speed = clamp01(state.speedRatio || 0);

    this.filter.frequency.setTargetAtTime(cfg.low + (cfg.high - cfg.low) * speed, now, tau);
    const level = cfg.gain * (cfg.floor + (1 - cfg.floor) * Math.pow(speed, cfg.exponent));
    this.out.gain.setTargetAtTime(level, now, tau);
  }

  dispose() {
    this.noise.stop();
    this.out.disconnect();
  }
}

function clamp01(value) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
