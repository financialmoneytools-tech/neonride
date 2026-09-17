import { config } from '../config.js';

/**
 * Controls - which control mode is live, and the tilt sensor behind one of them.
 *
 * Two modes, both for a phone: 'tilt' steers from the accelerometer, 'touch'
 * steers from a thumb dragged on the left half. The choice is stored, so a
 * rider who has picked one keeps it; a phone that has never chosen gets
 * config.controls.defaultMode. Desktop never asks - core/Input.js reads the
 * keyboard without consulting any of this.
 *
 * THE NEUTRAL IS WHEREVER YOU WERE HOLDING IT. There is no correct angle to
 * hold a phone at: sitting up, lying down and slouched are all normal and all
 * different, and a fixed neutral makes two of them unplayable. So the first
 * usable reading becomes zero and everything after it is a delta. `recalibrate`
 * does the same thing again on demand, which is the answer to shifting in a
 * seat mid-run.
 *
 * AXIS MAPPING IS NOT OPTIONAL. beta and gamma are reported in the device's own
 * frame, which is portrait's, and the game is landscape - so which of them
 * means "tilted left" depends on which way the phone was turned to get there.
 * screen.orientation.angle says which, and the two landscape angles need
 * opposite signs. Without it the steering is inverted for half of all riders,
 * and it is inverted in a way that feels like a bug in the bike.
 *
 * PERMISSION IS A GESTURE. iOS 13 and later refuse DeviceOrientationEvent
 * unless it is asked for from inside a user gesture, so request() is called
 * from the start card's tap and nowhere else. A refusal is not an error: the
 * mode falls back to touch and says so once.
 */

function read() {
  try {
    const raw = window.localStorage.getItem(config.controls.storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    // Private mode, blocked site data, or a value someone else wrote. A
    // preference that cannot be read is not a reason to fail to start.
    return null;
  }
}

function write(value) {
  try {
    window.localStorage.setItem(config.controls.storageKey, JSON.stringify(value));
  } catch (error) {
    // Nothing to do and nothing worth saying; the session still works.
  }
}

/**
 * The tilt that reads as "leaned left or right ON SCREEN", from a reading given
 * in the device's portrait frame.
 *
 * Rotating the (beta, gamma) pair into screen space. The two landscape angles
 * are 90 and 270 and they take opposite signs, which is the whole reason this
 * function exists rather than a single axis being picked.
 * @param {number} beta rotation about the device's X axis
 * @param {number} gamma rotation about its Y axis
 * @param {number} angle screen.orientation.angle
 */
export function screenTilt(beta, gamma, angle) {
  switch (((angle % 360) + 360) % 360) {
    case 90: return -beta;
    case 180: return -gamma;
    case 270: return beta;
    default: return gamma;
  }
}

export class Controls {
  /**
   * @param {boolean} enabled whether this device is driven by touch at all.
   *   False on a desktop, where the keyboard is the only input and the whole
   *   mode question is meaningless - without this the tilt timeout below fires
   *   on every desktop load and announces a fallback nobody asked about.
   */
  constructor(enabled = true) {
    this.enabled = !!enabled;
    const stored = read() || {};
    /** @type {'tilt'|'touch'} */
    this.mode = stored.mode === 'touch' || stored.mode === 'tilt'
      ? stored.mode : config.controls.defaultMode;
    config.controls.tilt.sensitivity = typeof stored.sensitivity === 'number'
      ? stored.sensitivity : config.controls.tilt.sensitivity;

    /** -1..1, read by Input while the mode is 'tilt'. */
    this.steer = 0;
    /** True once a reading has arrived; false means no usable sensor. */
    this.live = false;
    /** Set when tilt was asked for and could not be had. */
    this.fellBack = false;
    /** Called with a short line the first time tilt is refused. */
    this.onNotice = null;
    /** Called whenever the mode changes, so the UI can follow. */
    this.onChange = null;

    this._neutral = null;
    this._raw = 0;
    this._smoothed = 0;
    this._waited = 0;
    this._listening = false;

    this._onReading = this._onReading.bind(this);
  }

  /** @returns {boolean} whether the device can be asked at all. */
  static get supported() {
    return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
  }

  /**
   * Asks for the sensor. MUST be called from inside a user gesture - see the
   * note at the top - which in this build means the start card's tap.
   * @returns {Promise<boolean>} whether readings are now allowed
   */
  async request() {
    if (!this.enabled) return false;
    if (!Controls.supported) return this._fallback('Bu cihazda egim sensoru yok.');

    const Sensor = window.DeviceOrientationEvent;
    if (typeof Sensor.requestPermission === 'function') {
      try {
        const answer = await Sensor.requestPermission();
        if (answer !== 'granted') return this._fallback('Egim izni verilmedi.');
      } catch (error) {
        // Called outside a gesture, or refused outright.
        return this._fallback('Egim izni alinamadi.');
      }
    }
    this._listen();
    return true;
  }

  _listen() {
    if (this._listening) return;
    window.addEventListener('deviceorientation', this._onReading);
    this._listening = true;
  }

  _onReading(event) {
    if (event.beta === null && event.gamma === null) return;
    const angle = (window.screen && window.screen.orientation
      && window.screen.orientation.angle) || window.orientation || 0;
    this._raw = screenTilt(event.beta || 0, event.gamma || 0, angle);
    if (this._neutral === null) this._neutral = this._raw;
    this.live = true;
  }

  /** Takes the current holding position as the new zero. */
  recalibrate() {
    this._neutral = this._raw;
    this._smoothed = 0;
    this.steer = 0;
  }

  /** @param {'tilt'|'touch'} mode @returns {'tilt'|'touch'} */
  setMode(mode) {
    const next = mode === 'tilt' ? 'tilt' : 'touch';
    if (next === this.mode) return next;
    this.mode = next;
    // A mode arrived at deliberately clears the fallback, so choosing tilt
    // again after a refusal asks the sensor again rather than silently
    // refusing on the strength of an old answer.
    if (next === 'tilt') {
      this.fellBack = false;
      this._neutral = null;
      if (this._listening) this.recalibrate();
    }
    this._save();
    if (this.onChange) this.onChange(next);
    return next;
  }

  /** Steps the sensitivity through its list and stores it. */
  cycleSensitivity() {
    const steps = config.controls.tilt.sensitivitySteps;
    const at = steps.indexOf(config.controls.tilt.sensitivity);
    config.controls.tilt.sensitivity = steps[(at + 1) % steps.length];
    this._save();
    return config.controls.tilt.sensitivity;
  }

  _save() {
    write({ mode: this.mode, sensitivity: config.controls.tilt.sensitivity });
  }

  _fallback(message) {
    this.fellBack = true;
    this.mode = 'touch';
    this._save();
    if (this.onNotice) this.onNotice(message + ' Dokunmatik kontrole gecildi.');
    if (this.onChange) this.onChange(this.mode);
    return false;
  }

  /**
   * @param {number} dt
   * @returns {number} steer, -1..1, or 0 when tilt is not the live mode
   */
  update(dt) {
    if (!this.enabled || this.mode !== 'tilt') return 0;

    // A mode that was asked for and never produced a reading is not a mode.
    // Waited out rather than failed immediately, because a permission dialog
    // can sit on screen for seconds before the first event arrives.
    if (!this.live) {
      this._waited += dt;
      if (this._listening && this._waited > config.controls.tilt.timeout) {
        this._fallback('Egim sensorundan veri gelmedi.');
      }
      return 0;
    }

    const cfg = config.controls.tilt;
    const delta = this._raw - (this._neutral === null ? this._raw : this._neutral);
    const dead = Math.sign(delta) * Math.max(0, Math.abs(delta) - cfg.deadZone);
    const range = Math.max(1, cfg.range * cfg.sensitivity);
    const target = Math.max(-1, Math.min(1, dead / range));

    // Smoothed here rather than leaning on Input's steerSmoothing: that one is
    // tuned for a key that goes down and stays down, and a sensor held still
    // still jitters.
    const k = cfg.tau > 0 ? 1 - Math.exp(-dt / cfg.tau) : 1;
    this._smoothed += (target - this._smoothed) * k;
    this.steer = this._smoothed;
    return this.steer;
  }

  dispose() {
    if (this._listening) window.removeEventListener('deviceorientation', this._onReading);
    this._listening = false;
    this.onNotice = null;
    this.onChange = null;
  }
}
