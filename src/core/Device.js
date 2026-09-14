import { config } from '../config.js';

/**
 * Device - works out what is running the game, and patches config to suit it
 * BEFORE anything is built.
 *
 * It has to run first because most of what it changes cannot be changed
 * afterwards: the renderer reads antialias once at construction, the star field
 * allocates its buffers from the counts, the traffic pools size themselves on
 * creation. Anything that can be changed live belongs in a module's update, not
 * here.
 *
 * Detection is deliberately cautious in one direction only. A touch screen with
 * a small short edge is a phone and gets the mobile treatment; the memory and
 * core hints can then move it down again, but nothing here can move a desktop
 * down, because those hints are missing or wrong often enough that a machine
 * that never reports them would otherwise be quietly penalised.
 */
export class Device {
  constructor() {
    const coarse = Device.hasCoarsePointer();
    const shortEdge = Math.min(window.innerWidth, window.innerHeight);

    /** True for a touch screen without a mouse. */
    this.coarsePointer = coarse;
    /** True for a touch screen small enough to be a phone. */
    this.phone = coarse && shortEdge < config.quality.auto.phoneShortEdge;
    /** The preset actually in force. */
    this.preset = Device.resolvePreset(this.phone, coarse);

    this.apply();
  }

  /** @returns {boolean} */
  static hasCoarsePointer() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
    // Older iOS reports no pointer media query but does report touch points.
    return navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches;
  }

  /**
   * @param {boolean} phone
   * @param {boolean} coarse
   * @returns {string} a key of config.quality.presets
   */
  static resolvePreset(phone, coarse) {
    const chosen = config.quality.preset;
    if (chosen !== 'auto') return config.quality.presets[chosen] ? chosen : 'high';
    if (!coarse) return 'high';

    const auto = config.quality.auto;
    // Both hints are optional and both lie on some browsers, so they are only
    // allowed to confirm a decision already made by the screen.
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const weak =
      (typeof memory === 'number' && memory <= auto.lowMemory) ||
      (typeof cores === 'number' && cores <= auto.lowCores);

    if (phone) return weak ? 'low' : 'medium';
    return weak ? 'medium' : 'high';
  }

  /**
   * Writes the resolved preset into config.
   *
   * The scale factors multiply, so the values they scale are snapshotted the
   * first time through and every later call works from that snapshot. Without
   * it, cycling presets to compare them would compound each one on top of the
   * last and the third press would empty the road.
   */
  apply() {
    const preset = config.quality.presets[this.preset];
    if (!preset) return;

    if (!this._base) {
      const density = config.world.traffic.density;
      this._base = {
        trafficStart: density.start,
        trafficFullAt: density.fullAt,
        starCounts: config.sky.stars.layers.map((layer) => layer.count),
      };
    }

    config.renderer.maxPixelRatio = preset.maxPixelRatio;
    config.renderer.antialias = preset.antialias;

    // The whole chain, not the bloom pass alone: without the grade there is no
    // tone curve either, which is why only the manual preset does this.
    config.postprocess.enabled = preset.postprocess;
    config.postprocess.bloom.resolutionScale = preset.bloomScale;

    // Fewer vehicles live at once. The pools keep their shape, so nothing about
    // spawning or collision changes - there is simply less of it on screen.
    const density = config.world.traffic.density;
    density.start = this._base.trafficStart * preset.trafficScale;
    density.fullAt = this._base.trafficFullAt / preset.trafficScale;

    // Stars are the single largest vertex count in the scene and the cheapest
    // thing to thin out: at a phone's screen size most of the deep layer is
    // below one pixel anyway.
    const layers = config.sky.stars.layers;
    for (let i = 0; i < layers.length; i++) {
      layers[i].count = Math.round(this._base.starCounts[i] * preset.starScale);
    }
  }

  /** For the overlay. @returns {string} */
  describe() {
    return this.preset + (this.phone ? ' (phone)' : this.coarsePointer ? ' (touch)' : '');
  }
}
