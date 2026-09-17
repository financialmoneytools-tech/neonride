import { config } from '../config.js';

/**
 * ControlHints - where to put your thumbs, and the one notice tilt can produce.
 *
 * POINTER-EVENTS NONE, all of it. Every touch in the game is classified from
 * coordinates in core/Input.js, including the brake. If these elements could be
 * touched they would become a second, disagreeing source of truth, and the
 * first symptom would be multi-touch breaking: a thumb held on a real button
 * does not appear in the other element's event stream.
 *
 * The brake is positioned FROM THE SAME CONFIG Input reads, so the picture and
 * the hit region cannot drift. A hint drawn anywhere else is worse than no hint
 * at all - it teaches the wrong place to press.
 *
 * They fade out after a while. Someone who has been riding for ten seconds has
 * understood where the throttle is, and a recording wants the frame clean; a
 * mode change brings them back, because that is exactly when the layout has
 * changed under them.
 */
export class ControlHints {
  /** @param {HTMLElement} parent */
  constructor(parent) {
    this.el = document.createElement('div');
    this.el.className = 'hints';

    this.left = document.createElement('div');
    this.left.className = 'hint hint-left';

    this.right = document.createElement('div');
    this.right.className = 'hint hint-right';

    this.brake = document.createElement('div');
    this.brake.className = 'hint hint-brake';
    this.brake.textContent = config.ui.controls.hintBrake;

    this.el.append(this.left, this.right, this.brake);
    parent.appendChild(this.el);

    this.noticeEl = document.createElement('div');
    this.noticeEl.className = 'control-notice';
    this.noticeEl.hidden = true;
    parent.appendChild(this.noticeEl);

    this._age = 0;
    this._faded = false;
    this._mode = null;
    this._visible = true;
    this._noticeTimer = null;
    this.setMode(config.controls.defaultMode);
  }

  /** @param {'tilt'|'touch'} mode */
  setMode(mode) {
    if (mode === this._mode) return;
    this._mode = mode;
    const tilt = mode === 'tilt';

    // The brake is a button only in touch mode; in tilt mode the whole left
    // half is the brake, so drawing a small box would be a lie.
    //
    // It used to be detached rather than hidden, because `.hint` sets display
    // flex and that author rule beat the browser's own `[hidden]` - the brake
    // stayed on screen with none of its positioning applied, as a clipped FREN
    // in the top left corner. index.html now carries one global
    // `[hidden] { display: none !important }`, so .hidden is enough here.
    this.brake.hidden = tilt;
    if (!tilt) {
      const b = config.controls.touch.brake;
      this.brake.style.left = `${b.x * 100}%`;
      this.brake.style.top = `${b.y * 100}%`;
      this.brake.style.width = `${b.width * 100}%`;
      this.brake.style.height = `${b.height * 100}%`;
    }

    const text = config.ui.controls;
    this.left.textContent = tilt ? text.hintBrake : text.hintSteer;
    this.right.textContent = text.hintThrottle;
    this.left.style.width = `${(tilt ? 0.5 : config.controls.touch.steerHalf) * 100}%`;
    this.right.style.width = `${(1 - (tilt ? 0.5 : config.controls.touch.steerHalf)) * 100}%`;

    // A layout that has just changed is worth showing again.
    this._age = 0;
    this._faded = false;
    this.el.classList.remove('hints-faded');
  }

  /** Hidden outright for god mode and capture, so footage stays clean. */
  setVisible(visible) {
    this._visible = visible;
    this.el.hidden = !visible || !config.controls.hints.enabled;
  }

  /**
   * Announces which control scheme is live, for a few seconds at the start of
   * every run.
   *
   * At the start of EVERY run, not only when it changes. Tilt and touch feel
   * completely different and the mode is remembered across sessions, so a rider
   * coming back tomorrow has no way of knowing which one they left behind
   * except by trying to steer - and on a phone that means finding out in
   * traffic.
   * @param {'tilt'|'touch'} mode
   */
  banner(mode) {
    const text = config.ui.controls;
    this.notice(mode === 'tilt' ? text.bannerTilt : text.bannerTouch,
      text.bannerSeconds * 1000);
  }

  /**
   * Says something once, briefly. Used for the mode banner, and when tilt is
   * asked for and refused.
   * @param {string} text
   * @param {number} [ms] how long to leave it up
   */
  notice(text, ms = 5200) {
    this.noticeEl.textContent = text;
    this.noticeEl.hidden = false;
    clearTimeout(this._noticeTimer);
    this._noticeTimer = setTimeout(() => { this.noticeEl.hidden = true; }, ms);
  }

  /** @param {number} dt */
  update(dt) {
    if (this._faded || !this._visible) return;
    const after = config.controls.hints.fadeAfter;
    if (!after) return;
    this._age += dt;
    if (this._age < after) return;
    this._faded = true;
    this.el.classList.add('hints-faded');
  }

  dispose() {
    clearTimeout(this._noticeTimer);
    this.el.remove();
    this.noticeEl.remove();
  }
}
