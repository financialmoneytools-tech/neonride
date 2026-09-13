import { config } from '../config.js';

/**
 * StatsOverlay — sol ust kosede FPS / draw call / ucgen sayaci.
 * Tamamen HTML; sahneye hicbir sey eklemez, render maliyeti yoktur.
 * config.stats.enabled false ise hic olusturulmaz (bkz. main.js).
 */
export class StatsOverlay {
  /** @param {HTMLElement} parent */
  constructor(parent = document.body) {
    this.el = document.createElement('div');
    this.el.className = 'stats-overlay';
    this.el.textContent = 'olcum basliyor...';
    parent.appendChild(this.el);

    this._acc = 0;
  }

  /**
   * @param {number} dt
   * @param {object} state Loop'un paylasilan durum nesnesi
   */
  update(dt, state) {
    // Metni her karede yazmak gereksiz DOM trafigi yaratir; araliklarla tazele.
    this._acc += dt;
    if (this._acc < config.stats.updateInterval) return;
    this._acc = 0;

    const inp = state.input;
    const lines = [
      'FPS       ' + state.fps.toFixed(1) + '  (' + state.frameMs.toFixed(2) + ' ms)',
      'draw call ' + state.drawCalls,
      'triangle  ' + state.triangles.toLocaleString('en-US'),
    ];

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
