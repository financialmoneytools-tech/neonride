/**
 * ErrorPanel - uncaught errors, on the screen.
 *
 * There is no console on a phone and no keyboard to open one with, so an
 * exception during startup is a black screen and nothing else: the loop stops,
 * no frame is drawn, and every readout that would have explained it never
 * updates. That is exactly how a one-line scope mistake in BikePhysics read as
 * "the game is broken on Android".
 *
 * Installed FIRST, before anything else in main.js, because the errors worth
 * catching are the ones thrown while the rest is still being built.
 *
 * It shows the message and the stack, and keeps counting repeats rather than
 * growing - a throw inside the animation loop arrives sixty times a second and
 * a panel that appended each one would be its own denial of service.
 */
export class ErrorPanel {
  /** @param {HTMLElement} parent */
  constructor(parent = document.body) {
    this.el = document.createElement('div');
    this.el.className = 'error-panel';
    this.el.hidden = true;
    parent.appendChild(this.el);

    this._first = null;
    this._count = 0;

    this._onError = (event) => {
      const error = event.error || event.reason;
      const text = error && error.stack
        ? error.stack
        : String((error && error.message) || event.message || error || 'unknown error');
      this.show(text);
    };
    window.addEventListener('error', this._onError);
    window.addEventListener('unhandledrejection', this._onError);
  }

  /** @param {string} text */
  show(text) {
    this._count++;
    // Only the FIRST is kept. Later ones are usually the same fault arriving
    // again from the next frame, and the first is the one with the cause in it.
    if (this._first === null) this._first = text;
    this.el.textContent = this._first
      + (this._count > 1 ? `\n\n(x${this._count})` : '');
    this.el.hidden = false;
  }

  dispose() {
    window.removeEventListener('error', this._onError);
    window.removeEventListener('unhandledrejection', this._onError);
    this.el.remove();
  }
}
