import { config } from '../config.js';
import { ComfortToggle } from './ComfortToggle.js';

/**
 * StartScreen - the title card, and the one user gesture the whole build needs.
 *
 * WHY IT HAS TO EXIST, and why nothing may work around it. Every browser
 * refuses to start an AudioContext until the page has had a real user gesture.
 * Without one the context is created `suspended`, every node runs, every
 * parameter animates, the meters move, and not a single sample reaches the
 * speakers - a silent failure of exactly the kind this project keeps finding.
 * So there is a deliberate entry point instead of a resume bolted onto the
 * first keypress that happens to arrive: a gesture that is ASKED for is a
 * gesture that cannot be missed.
 *
 * IT NEVER APPEARS IN FOOTAGE. It is dismissed before anyone starts recording,
 * which is the whole trick - the gesture happens first and the take happens
 * after. `?god=1` arms the autopilot and capture mode before the card is shown,
 * so one press drops straight into a clean recording run with the overlay off,
 * the pixel ratio pinned and the sound already live.
 *
 * The world runs behind it. A title over a moving scene costs nothing, needs no
 * gate in the loop, and looks like something; a title over a black screen is a
 * loading screen nobody asked for.
 */
export class StartScreen {
  /**
   * @param {HTMLElement} parent
   * @param {() => void} onStart called once, from inside the gesture handler,
   *   so anything that needs the gesture's authority still has it
   * @param {import('../core/Comfort.js').Comfort} [comfort] adds the reduced
   *   motion switch to the card when given
   */
  constructor(parent, onStart, comfort = null) {
    const ui = config.ui.start;

    this.el = document.createElement('div');
    this.el.className = 'start-screen';

    const title = document.createElement('h1');
    title.className = 'start-title';
    title.textContent = ui.title;

    const prompt = document.createElement('p');
    this.prompt = prompt;
    prompt.className = 'start-prompt';
    // Touch and keyboard are different instructions and there is no sense
    // telling a phone to press a key.
    prompt.textContent = matchMedia('(hover: none)').matches ? ui.promptTouch : ui.promptKey;

    this.el.append(title, prompt);

    // The switch goes ON the card rather than in a menu behind it. Somebody who
    // needs it needs it before they start, not after they have been made ill by
    // finding out they needed it.
    this.toggle = comfort ? new ComfortToggle(this.el, comfort) : null;

    parent.appendChild(this.el);

    this._onStart = onStart;
    this._done = false;
    this._start = this._start.bind(this);

    // pointerdown and keydown both count as a gesture. `once` is not used: a
    // key that does not start it - a modifier on its own - must not consume
    // the listener and leave the card up with nothing able to dismiss it.
    window.addEventListener('pointerdown', this._start);
    window.addEventListener('keydown', this._start);
  }

  /** @param {Event} event */
  _start(event) {
    if (this._done) return;
    // A bare modifier is not an intent to start, and on a keyboard it is the
    // first half of a shortcut someone is about to type.
    if (event.type === 'keydown') {
      const key = /** @type {KeyboardEvent} */ (event).key;
      if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return;
    }

    this._done = true;
    window.removeEventListener('pointerdown', this._start);
    window.removeEventListener('keydown', this._start);

    // Called BEFORE the card is torn down, and synchronously, because the
    // browser only honours an AudioContext resume while it can still see the
    // gesture that caused it. An await anywhere in here loses that.
    this._onStart();

    this.el.classList.add('start-leaving');
    const remove = () => this.dispose();
    this.el.addEventListener('transitionend', remove, { once: true });
    // A transition that never fires - reduced motion, a hidden tab - would
    // leave the card on screen for ever.
    this._fallback = setTimeout(remove, config.ui.start.fadeMs + 120);
  }

  /** @returns {boolean} true once the gesture has happened. */
  get started() {
    return this._done;
  }

  dispose() {
    if (this.toggle) { this.toggle.dispose(); this.toggle = null; }
    window.removeEventListener('pointerdown', this._start);
    window.removeEventListener('keydown', this._start);
    clearTimeout(this._fallback);
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
