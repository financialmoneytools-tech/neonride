import { config } from '../config.js';

/**
 * Comfort - owns the reduced motion setting: where it starts from, where it is
 * kept, and who is told when it changes.
 *
 * THREE SOURCES, IN ORDER. A choice this person has made before beats a
 * preference their operating system reports, which beats the default. That
 * order matters: somebody who turns the setting back OFF having seen it must
 * not have it turned on again by the system on their next visit, which is what
 * consulting the media query every load would do.
 *
 * Everything that reads `config.comfort.reducedMotion` reads it live, on the
 * frame it needs it, so the toggle takes effect in the middle of a run with no
 * rebuild and nothing to reconcile. That is the whole reason motion comfort is
 * NOT a theme: a person reaching for this is a person who already feels unwell,
 * and "restart for this to take effect" is not an answer.
 */
export class Comfort {
  /** @param {(reduced: boolean) => void} [onChange] */
  constructor(onChange = null) {
    this.onChange = onChange;
    this._listeners = new Set();

    const stored = read();
    if (stored === null) {
      // Nothing chosen yet, so ask the operating system. Someone who has set
      // this at the system level has already answered the question.
      config.comfort.reducedMotion = systemPrefers();
      this.fromSystem = config.comfort.reducedMotion;
    } else {
      config.comfort.reducedMotion = stored;
      this.fromSystem = false;
    }
  }

  /** @returns {boolean} */
  get reduced() {
    return config.comfort.reducedMotion;
  }

  /**
   * @param {boolean} value
   * @returns {boolean} the new value
   */
  set(value) {
    const next = !!value;
    if (next === config.comfort.reducedMotion) return next;
    config.comfort.reducedMotion = next;
    // Written from here on, so the system preference is never consulted again
    // for this person. Their choice is the answer.
    write(next);
    for (const fn of this._listeners) fn(next);
    if (this.onChange) this.onChange(next);
    return next;
  }

  /** @returns {boolean} the new value */
  toggle() {
    return this.set(!config.comfort.reducedMotion);
  }

  /** @param {(reduced: boolean) => void} fn @returns {() => void} unsubscribe */
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  dispose() {
    this._listeners.clear();
    this.onChange = null;
  }
}

/**
 * A multiplier for one motion, live. Every consumer goes through this rather
 * than testing the flag itself, so there is one place that knows what "reduced"
 * means for a given motion and no chance of two of them disagreeing.
 * @param {keyof typeof config.comfort.scale} key
 * @returns {number}
 */
export function motionScale(key) {
  const cfg = config.comfort;
  return cfg.reducedMotion ? cfg.scale[key] : 1;
}

/** @returns {boolean} */
function systemPrefers() {
  try {
    return window.matchMedia(config.comfort.media).matches;
  } catch (error) {
    return false;
  }
}

/**
 * localStorage can throw outright rather than return nothing - site data
 * blocked, or private mode on some versions - so this is guarded and the
 * setting simply does not persist.
 * @returns {boolean|null} null when nothing has been chosen
 */
function read() {
  try {
    const raw = window.localStorage.getItem(config.comfort.storageKey);
    return raw === null ? null : raw === '1';
  } catch (error) {
    return null;
  }
}

/** @param {boolean} value */
function write(value) {
  try {
    window.localStorage.setItem(config.comfort.storageKey, value ? '1' : '0');
  } catch (error) {
    // A setting that cannot be kept is not a reason to refuse to apply it.
  }
}
