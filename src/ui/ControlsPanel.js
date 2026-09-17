import { config } from '../config.js';

/**
 * ControlsPanel - the control-mode switch, inside the pause card.
 *
 * Three buttons: which mode, how sensitive tilt is, and recalibrate. It lives
 * in the pause panel because that is the only place a rider can reach without
 * a keyboard and without ending their run, and because the moment somebody
 * wants to change how steering works is the moment steering is annoying them.
 *
 * RECALIBRATE IS NOT A SETTING, it is a button you press mid-run. Shifting in a
 * seat moves the neutral, and without this the only fix is to reload. It is
 * shown for tilt only; in touch mode there is nothing to calibrate.
 *
 * These ARE real buttons, unlike ui/ControlHints.js. They sit on a panel that
 * only exists while the game is paused, so there is no multi-touch to protect
 * and nothing behind them to steer.
 */
export class ControlsPanel {
  /**
   * @param {HTMLElement} parent the pause card
   * @param {import('../core/Controls.js').Controls} controls
   */
  constructor(parent, controls) {
    this.controls = controls;

    this.el = document.createElement('div');
    this.el.className = 'controls-panel';

    this.modeBtn = document.createElement('button');
    this.modeBtn.type = 'button';
    this.modeBtn.className = 'controls-btn';

    this.sensBtn = document.createElement('button');
    this.sensBtn.type = 'button';
    this.sensBtn.className = 'controls-btn';

    this.calBtn = document.createElement('button');
    this.calBtn.type = 'button';
    this.calBtn.className = 'controls-btn';
    this.calBtn.textContent = 'MERKEZI SIFIRLA';

    this.el.append(this.modeBtn, this.sensBtn, this.calBtn);
    parent.appendChild(this.el);

    // Every one of these stops the event. The pause card sits under a global
    // pointerdown listener that resumes the run - without this, changing the
    // mode would also unpause, and the button would appear not to work.
    this._onMode = (e) => {
      e.stopPropagation();
      controls.setMode(controls.mode === 'tilt' ? 'touch' : 'tilt');
      this.refresh();
    };
    this._onSens = (e) => {
      e.stopPropagation();
      controls.cycleSensitivity();
      this.refresh();
    };
    this._onCal = (e) => {
      e.stopPropagation();
      controls.recalibrate();
      this.calBtn.textContent = 'SIFIRLANDI';
      clearTimeout(this._calTimer);
      this._calTimer = setTimeout(() => { this.calBtn.textContent = 'MERKEZI SIFIRLA'; }, 1400);
    };
    for (const [el, fn] of [[this.modeBtn, this._onMode], [this.sensBtn, this._onSens],
      [this.calBtn, this._onCal]]) {
      el.addEventListener('click', fn);
      el.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    this.refresh();
  }

  refresh() {
    const tilt = this.controls.mode === 'tilt';
    this.modeBtn.textContent = tilt ? 'KONTROL: EGIM' : 'KONTROL: DOKUNMATIK';
    this.sensBtn.textContent = 'HASSASIYET: ' + config.controls.tilt.sensitivity.toFixed(1);
    // Sensitivity and calibration only mean anything while tilt is steering.
    this.sensBtn.hidden = !tilt;
    this.calBtn.hidden = !tilt;
  }

  /** @param {boolean} visible */
  setVisible(visible) {
    this.el.hidden = !visible;
    if (visible) this.refresh();
  }

  dispose() {
    clearTimeout(this._calTimer);
    this.modeBtn.removeEventListener('click', this._onMode);
    this.sensBtn.removeEventListener('click', this._onSens);
    this.calBtn.removeEventListener('click', this._onCal);
    this.el.remove();
  }
}
