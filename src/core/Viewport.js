import { config } from '../config.js';

/**
 * Viewport - decides what size the frame actually is, on a device where that is
 * not a simple question.
 *
 * On a phone the page grows and shrinks under you while you play: the address
 * bar retracts on the first scroll-like gesture and comes back on the next, and
 * some browsers animate it over several hundred milliseconds. Each intermediate
 * size, taken at face value, is a renderer resize plus two composer buffer
 * reallocations, so a single bar animation can cost dozens of them and a
 * visible stutter in the middle of a run.
 *
 * Three things fix it, and all three are needed:
 *
 *   visualViewport   reports the area actually visible. window.innerHeight lags
 *                    it and on some browsers never catches up at all, leaving a
 *                    strip of canvas hidden under the chrome.
 *   a debounce       collapses an animating bar into one resize at the end.
 *   a dead band      throws away changes too small to be the address bar, which
 *                    is most of what a browser reports while settling.
 *
 * Orientation changes skip the debounce: they are a single discrete event and
 * waiting makes the game visibly late to a turn of the phone.
 */
export class Viewport {
  /** @param {(width: number, height: number) => void} onChange */
  constructor(onChange) {
    this.onChange = onChange;
    this.width = 0;
    this.height = 0;

    this._timer = 0;
    this._pending = false;

    this._onResize = this._schedule.bind(this);
    this._onOrientation = this._immediate.bind(this);

    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onOrientation);

    this._visual = config.viewport.useVisualViewport ? window.visualViewport : null;
    if (this._visual) {
      this._visual.addEventListener('resize', this._onResize);
      // A pinch zoom scrolls the visual viewport without resizing it. The frame
      // does not change shape, so nothing here has to react.
    }

    this._apply(true);
  }

  /** @returns {{width: number, height: number}} */
  measure() {
    if (this._visual) {
      return { width: Math.round(this._visual.width), height: Math.round(this._visual.height) };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }

  /** @returns {boolean} true when the frame is wider than it is tall */
  get landscape() {
    return this.width >= this.height;
  }

  _schedule() {
    this._pending = true;
    this._timer = config.viewport.resizeDebounce;
  }

  _immediate() {
    this._pending = true;
    this._timer = 0;
  }

  /** Driven from the main loop, so the debounce shares the one clock. */
  update(dt) {
    if (!this._pending) return;
    this._timer -= dt;
    if (this._timer > 0) return;
    this._pending = false;
    this._apply(false);
  }

  _apply(force) {
    const size = this.measure();
    if (size.width <= 0 || size.height <= 0) return;

    const min = config.viewport.minChange;
    const moved =
      Math.abs(size.width - this.width) >= min || Math.abs(size.height - this.height) >= min;
    if (!force && !moved) return;

    this.width = size.width;
    this.height = size.height;
    this.onChange(this.width, this.height);
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onOrientation);
    if (this._visual) this._visual.removeEventListener('resize', this._onResize);
    this.onChange = null;
  }
}

/**
 * Fullscreen - the better answer to the address bar, when the player will have
 * it: no chrome means nothing to grow and shrink.
 *
 * It needs a user gesture, so it can only be offered. Everything here is
 * allowed to fail: fullscreen is refused on iOS phones outright, and the
 * orientation lock is unsupported almost everywhere. A refusal is not an error
 * and must never reach the console as one - the game plays either way.
 */
export const Fullscreen = {
  /** @returns {boolean} */
  supported() {
    return !!(document.documentElement.requestFullscreen || document.fullscreenElement !== undefined)
      && typeof document.documentElement.requestFullscreen === 'function';
  },

  /** @returns {boolean} */
  active() {
    return !!document.fullscreenElement;
  },

  /** Enters fullscreen and, if it is allowed, locks the orientation. */
  request() {
    if (!Fullscreen.supported() || Fullscreen.active()) return;
    const element = document.documentElement;
    const entering = element.requestFullscreen();
    if (!entering || !entering.then) return;

    entering
      .then(() => {
        const lock = config.viewport.fullscreen.lockOrientation;
        if (!lock || !screen.orientation || !screen.orientation.lock) return;
        // Returns a promise that rejects on every desktop browser and most
        // mobile ones. Swallowed on purpose.
        return screen.orientation.lock(lock).catch(() => {});
      })
      .catch(() => {});
  },

  exit() {
    if (Fullscreen.active() && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  },

  toggle() {
    if (Fullscreen.active()) Fullscreen.exit();
    else Fullscreen.request();
  },
};
