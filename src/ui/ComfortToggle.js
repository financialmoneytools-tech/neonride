import { config } from '../config.js';

/**
 * ComfortToggle - the reduced motion switch, on the title card and in the
 * pause panel.
 *
 * TWO TAPS, NOT A SETTINGS TREE. Somebody reaching for this is somebody who has
 * started to feel unwell, and the moment they feel it they are either on the
 * title card or they have just paused. Those are the two places it lives, and
 * there is no third place to go looking.
 *
 * IT MUST NOT START OR RESUME THE GAME. Both cards are dismissed by a press
 * anywhere - that is how the title card captures the gesture the AudioContext
 * needs - so a button sitting on top of one would be dismissed by the very tap
 * that used it, and the person would be thrown into a run by the act of asking
 * not to be. Every event it handles is stopped here. That also means the tap on
 * this button is NOT the gesture that unlocks audio, which is correct: the
 * person has not asked to start yet.
 *
 * A real <button>, so it is reachable by keyboard and announced by a screen
 * reader. The keydown that activates it is stopped for the same reason the
 * pointer event is.
 */
export class ComfortToggle {
  /**
   * @param {HTMLElement} parent
   * @param {import('../core/Comfort.js').Comfort} comfort
   */
  constructor(parent, comfort) {
    this.comfort = comfort;

    this.el = document.createElement('button');
    this.el.type = 'button';
    this.el.className = 'comfort-toggle';

    this._onPointerDown = (event) => {
      // Stopped, not merely defaulted: the window level handlers that dismiss
      // the card listen for pointerdown, and they run whether or not the
      // default action happens.
      event.stopPropagation();
    };
    this._onKeyDown = (event) => {
      event.stopPropagation();
      // Escape belongs to the pause key even while this has focus.
      if (event.key === 'Escape') this.el.blur();
    };
    this._onClick = (event) => {
      event.stopPropagation();
      this.comfort.toggle();
      this.render();
    };

    this.el.addEventListener('pointerdown', this._onPointerDown);
    this.el.addEventListener('keydown', this._onKeyDown);
    this.el.addEventListener('click', this._onClick);
    parent.appendChild(this.el);

    this._unsubscribe = comfort.subscribe(() => this.render());
    this.render();
  }

  render() {
    const text = config.ui.comfort;
    const on = this.comfort.reduced;
    this.el.textContent = (on ? text.on : text.off) + '  ' + text.label;
    this.el.classList.toggle('comfort-on', on);
    this.el.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  dispose() {
    if (this._unsubscribe) this._unsubscribe();
    this.el.removeEventListener('pointerdown', this._onPointerDown);
    this.el.removeEventListener('keydown', this._onKeyDown);
    this.el.removeEventListener('click', this._onClick);
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
