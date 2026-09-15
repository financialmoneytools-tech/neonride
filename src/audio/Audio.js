import { config } from '../config.js';
import { noiseBuffer } from './sources.js';
import { Engine } from './Engine.js';
import { Wind } from './Wind.js';
import { TrafficVoices } from './TrafficVoices.js';

/**
 * Audio - the context, the master chain, and the one place that owns them.
 *
 * NOTHING IS BUILT UNTIL start() IS CALLED, and start() is only ever called
 * from inside a user gesture. A browser will not run an AudioContext without
 * one, and - this is the part that makes it dangerous rather than merely
 * annoying - an AudioContext created without a gesture does not fail. It is
 * created `suspended`, every node runs, every parameter animates, nothing
 * throws, and not one sample reaches the speakers. So the graph is built inside
 * the gesture rather than resumed from it, and update() does nothing at all
 * until then.
 *
 * CAPTURE MODE. Sound is pinned the way the pixel ratio is pinned, for the same
 * reason: two recordings of one run have to match. That means the level is
 * fixed, the noise is seeded from the world's own generator, and - the one that
 * actually bites - NOTHING DUCKS ON BLUR. Input.js already listens for blur to
 * release held keys, and it would be natural to mute alongside it, which would
 * mean a stray click on another window silently drops the audio out of the
 * middle of a take.
 *
 * A limiter sits at the output. The mix is built to run under it; it is there
 * so that a handful of doppler passes arriving on the same frame cannot clip a
 * recording, which is not something that can be fixed afterwards.
 */
export class Audio {
  constructor() {
    this.ctx = null;
    this.engine = null;
    this.wind = null;
    this.traffic = null;
    this.muted = false;
    this._started = false;
  }

  /** @returns {boolean} */
  get running() {
    return this._started && !!this.ctx && this.ctx.state === 'running';
  }

  /**
   * Builds the whole graph. MUST be called synchronously from inside a user
   * gesture handler - an await before this point loses the gesture and the
   * context comes up suspended and silent.
   * @param {import('../world/Traffic.js').Traffic} [traffic]
   */
  start(traffic) {
    if (this._started || !config.audio.enabled) return;

    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      console.info('[audio] no Web Audio in this browser; running silent');
      return;
    }

    this._started = true;
    const ctx = new Ctor({ latencyHint: 'interactive' });
    this.ctx = ctx;

    const cfg = config.audio.master;

    this.master = ctx.createGain();
    this.master.gain.value = 0;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = cfg.limiter.threshold;
    limiter.knee.value = cfg.limiter.knee;
    limiter.ratio.value = cfg.limiter.ratio;
    limiter.attack.value = cfg.limiter.attack;
    limiter.release.value = cfg.limiter.release;

    this.master.connect(limiter);
    limiter.connect(ctx.destination);
    this.limiter = limiter;

    const noise = noiseBuffer(ctx, 2, config.world.seed);
    this.engine = new Engine(ctx, this.master, noise);
    this.wind = new Wind(ctx, this.master, noise);
    if (traffic) this.traffic = new TrafficVoices(ctx, this.master, noise, traffic);

    // Fades in rather than barking. The ramp starts from the current time
    // explicitly, because a value set with .value is not on the automation
    // timeline and a later ramp would jump from wherever it happens to be.
    this.master.gain.setValueAtTime(0, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(cfg.gain, ctx.currentTime + cfg.startFade);

    // Some browsers still hand back a suspended context from inside a gesture.
    // Resuming is harmless when it is already running.
    if (ctx.state === 'suspended') ctx.resume();
  }

  /** Toggles the master mute. The M key. @returns {boolean} muted */
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) {
      const cfg = config.audio.master;
      this.master.gain.setTargetAtTime(this.muted ? 0 : cfg.gain, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state
   */
  update(dt, state) {
    if (!this._started || !this.ctx) return;
    this.engine.update(dt, state);
    this.wind.update(dt, state);
    if (this.traffic) this.traffic.update(dt, state);
  }

  dispose() {
    if (!this.ctx) return;
    if (this.engine) this.engine.dispose();
    if (this.wind) this.wind.dispose();
    if (this.traffic) this.traffic.dispose();
    this.master.disconnect();
    this.limiter.disconnect();
    this.ctx.close();
    this.ctx = null;
    this._started = false;
  }
}
