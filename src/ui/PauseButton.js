import { config } from '../config.js';

/**
 * PauseButton - the only way into the pause card without a keyboard.
 *
 * The pause card holds the control mode switch and recalibrate, and on a phone
 * there was no way to open it: Escape is a key, and every touch on the canvas
 * is a driving input by design. So the settings existed and could not be
 * reached, which is the same as not existing.
 *
 * A REAL BUTTON, unlike ui/ControlHints.js. It is appended to document.body,
 * and core/Input.js listens on #app - so a touch that lands here never enters
 * the driving path at all and cannot be read as steering or throttle. That is
 * why it can be a button while the brake cannot: the brake sits over the canvas
 * and has to be classified with every other touch.
 *
 * Top centre on purpose. The corners are where thumbs rest, and a pause button
 * under a thumb is a run that ends whenever the phone is gripped harder.
 */
export class PauseButton {
  /**
   * @param {HTMLElement} parent
   * @param {() => void} onPress
   */
  constructor(parent, onPress) {
    this.el = document.createElement('button');
    this.el.type = 'button';
    this.el.className = 'pause-button';
    this.el.setAttribute('aria-label', 'Duraklat');
    this.el.innerHTML = '<span></span><span></span>';

    this._onPress = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onPress();
    };
    this.el.addEventListener('click', this._onPress);
    parent.appendChild(this.el);
  }

  /** @param {boolean} visible */
  setVisible(visible) {
    this.el.hidden = !visible;
  }

  dispose() {
    this.el.removeEventListener('click', this._onPress);
    this.el.remove();
  }
}
