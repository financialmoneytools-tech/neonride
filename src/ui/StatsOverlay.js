import { config } from '../config.js';

/**
 * StatsOverlay - FPS / draw call / triangle counter in the top left corner.
 * Pure HTML: it adds nothing to the scene and costs nothing to render.
 * When config.stats.enabled is false it is never created (see main.js).
 */
export class StatsOverlay {
  /** @param {HTMLElement} parent */
  constructor(parent = document.body) {
    this.el = document.createElement('div');
    this.el.className = 'stats-overlay';
    this.el.textContent = 'measuring...';
    parent.appendChild(this.el);

    this._acc = 0;
  }

  /**
   * @param {number} dt
   * @param {object} state shared state object owned by Loop
   */
  update(dt, state) {
    // Rewriting the text every frame is pointless DOM traffic; refresh in steps.
    this._acc += dt;
    if (this._acc < config.stats.updateInterval) return;
    this._acc = 0;

    const inp = state.input;
    const lines = [
      'FPS       ' + state.fps.toFixed(1) + '  (' + state.frameMs.toFixed(2) + ' ms)',
      'draw call ' + state.drawCalls,
      'triangle  ' + state.triangles.toLocaleString('en-US'),
      // Flat geometry and texture counts are the acceptance test for "no memory
      // growth": the pools allocate once and never again.
      'geom ' + state.geometries + '  tex ' + state.textures,
    ];

    if (state.distance !== undefined) {
      lines.push(
        'dist ' +
          Math.round(state.distance) +
          '  speed ' +
          (state.speed || 0).toFixed(1) +
          '  lean ' +
          (((state.lean || 0) * 180) / Math.PI).toFixed(1),
      );
    }

    if (inp) {
      lines.push(
        'steer ' +
          inp.steer.toFixed(2) +
          '  thr ' +
          inp.throttle.toFixed(2) +
          '  brk ' +
          inp.brake.toFixed(2),
      );
    }

    this.el.textContent = lines.join('\n');
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
