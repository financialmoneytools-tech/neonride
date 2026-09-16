import { config } from '../config.js';

/**
 * Orientation - the game is landscape only, and this is what says so.
 *
 * Three jobs, in the order a browser will actually let them happen:
 *
 * 1. ASK for landscape. screen.orientation.lock only works from inside a
 *    fullscreen document on the browsers that support it at all, and on iOS it
 *    does not exist. So it is attempted, allowed to fail, and never relied on.
 * 2. DETECT portrait regardless, because 1 usually fails.
 * 3. GATE the game behind a prompt while portrait, and tell the caller, so the
 *    run can be paused rather than continuing unseen behind the card.
 *
 * WHY A GATE AND NOT A LETTERBOX. The cockpit is one drawn image built for
 * 16:9, the road is framed for it, and the touch controls assume two thumbs in
 * the bottom corners of a wide screen. A portrait frame is not a worse version
 * of that, it is a different one, and the honest answer is to ask for the phone
 * to be turned rather than to ship something that composes for nobody.
 *
 * It measures the VIEWPORT, not screen.orientation. The two disagree: a phone
 * held in landscape with the keyboard open, a desktop window dragged narrow,
 * and a tablet in a split view are all portrait-shaped without the device
 * having rotated, and it is the shape of the frame the game has to draw into
 * that matters. That also means this works on desktop, where a narrow window
 * gets the same prompt and the same pause.
 */
export class Orientation {
  /**
   * @param {HTMLElement} parent
   * @param {() => {width: number, height: number}} measure the live frame size
   */
  constructor(parent, measure) {
    const cfg = config.orientation;
    this.measure = measure;
    this.portrait = false;
    /** Called with true when the game should hold, false when it may run. */
    this.onChange = null;

    this.el = document.createElement('div');
    this.el.className = 'rotate-gate';
    this.el.setAttribute('role', 'alertdialog');
    this.el.setAttribute('aria-live', 'assertive');

    const icon = document.createElement('div');
    icon.className = 'rotate-icon';
    // A phone outline that turns, drawn rather than written, so the prompt says
    // what to do to somebody who does not read the line under it.
    icon.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true">'
      + '<rect x="22" y="6" width="20" height="36" rx="3"/>'
      + '<path d="M14 46a24 24 0 0 0 36 0" />'
      + '<path d="M50 38v9h-9" />'
      + '</svg>';

    const title = document.createElement('div');
    title.className = 'rotate-title';
    title.textContent = cfg.title;

    const body = document.createElement('div');
    body.className = 'rotate-body';
    body.textContent = cfg.body;

    this.el.append(icon, title, body);
    parent.appendChild(this.el);

    this._onResize = () => this.refresh();
    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', this._onResize);

    this.refresh();
  }

  /**
   * Asks the browser for landscape. Must be called from inside a user gesture,
   * and is expected to fail on most of them - see the note at the top.
   * @returns {Promise<void>}
   */
  static request() {
    try {
      const orientation = window.screen && window.screen.orientation;
      if (!orientation || !orientation.lock) return Promise.resolve();
      return orientation.lock(config.orientation.lock).catch(() => {});
    } catch (error) {
      // Some browsers throw synchronously rather than rejecting. A refused
      // lock is not an error condition; the gate below covers it either way.
      return Promise.resolve();
    }
  }

  /** Re-reads the frame shape and shows or hides the gate. */
  refresh() {
    const { width, height } = this.measure();
    if (!width || !height) return;
    const cfg = config.orientation;
    // Hysteresis, because a phone rotating passes through shapes near square
    // and an address bar sliding can cross a single threshold twice in a
    // second. Two thresholds mean the gate cannot flicker on the way.
    const aspect = width / height;
    const portrait = this.portrait ? aspect < cfg.leave : aspect < cfg.enter;
    if (portrait === this.portrait) return;

    this.portrait = portrait;
    this.el.classList.toggle('rotate-gate-on', portrait);
    if (this.onChange) this.onChange(portrait);
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', this._onResize);
    this.el.remove();
    this.onChange = null;
  }
}
