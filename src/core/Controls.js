import { config } from '../config.js';

/**
 * Controls - which control mode is live, and the tilt sensor behind one of them.
 *
 * Two modes, both for a phone: 'tilt' steers from the phone's own angle,
 * 'touch' steers from a thumb dragged on the left half. The choice is stored,
 * so a rider who has picked one keeps it; a phone that has never chosen gets
 * config.controls.defaultMode. Desktop never asks - core/Input.js reads the
 * keyboard without consulting any of this.
 *
 * GRAVITY FIRST, ORIENTATION SECOND, AND THAT IS THE WHOLE POINT OF THIS FILE.
 * `deviceorientation` is the obvious API and on a great many Android phones it
 * delivers NOTHING: Chrome builds it on a fused rotation-vector sensor, and a
 * handset without a gyroscope - or with one the fusion declines to use - simply
 * never fires the event. There is no error and no permission prompt; the
 * listener is just silent, which is indistinguishable from a sensor that is
 * switched off. That is exactly what happened here: motion sensors allowed,
 * auto-rotate working, tilt doing nothing.
 *
 * `devicemotion` with accelerationIncludingGravity needs only an accelerometer,
 * which every phone that can auto-rotate has. So that is the primary source and
 * the roll is computed from where gravity is pointing. Orientation is kept as a
 * fallback for the devices where it is the one that works.
 *
 * THE NEUTRAL IS WHEREVER YOU WERE HOLDING IT. There is no correct angle to
 * hold a phone at: sitting up, lying down and slouched are all normal and all
 * different, and a fixed neutral makes two of them unplayable. So the first
 * usable reading becomes zero and everything after it is a delta. `recalibrate`
 * does the same thing again on demand, which is the answer to shifting in a
 * seat mid-run.
 *
 * AXIS MAPPING IS NOT OPTIONAL. Both sources report in the device's own frame,
 * which is portrait's, and the game is landscape - so which way is "leaned
 * left" depends on which way the phone was turned to get there.
 * screen.orientation.angle says which, and the two landscape angles need
 * opposite treatment. Without it the steering is inverted for half of all
 * riders, and inverted in a way that feels like a bug in the bike.
 *
 * PERMISSION IS A GESTURE. iOS 13 and later refuse both events unless they are
 * asked for from inside a user gesture, so request() is called from the start
 * card's tap and nowhere else. A refusal is not an error: the mode falls back
 * to touch and says so once.
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

/** @returns {number} screen.orientation.angle, however this browser spells it */
export function screenAngle() {
  const orientation = window.screen && window.screen.orientation;
  if (orientation && typeof orientation.angle === 'number') return orientation.angle;
  return window.orientation || 0;
}

/**
 * The roll the rider is applying, in DEGREES, from a gravity reading.
 *
 * accelerationIncludingGravity points UP: a phone flat on a table reads about
 * +9.8 on z, because the table is pushing it up. So when the screen is held
 * level the vector lies along the screen's own +Y, and the angle it leans away
 * from that is the roll.
 *
 * The device frame is rotated into the SCREEN's frame first, by the plain 2D
 * rotation that screen.orientation.angle describes. Doing it as a rotation
 * rather than as four hand written cases is what keeps 90 and 270 from
 * disagreeing about a sign.
 *
 * @param {number} x device frame, toward the right edge in portrait
 * @param {number} y device frame, toward the top edge in portrait
 * @param {number} angle screen.orientation.angle
 * @returns {number} degrees; POSITIVE means the screen's right edge has dipped,
 *   which is the direction a rider means "go right"
 */
export function gravityTilt(x, y, angle) {
  const radians = ((((angle % 360) + 360) % 360) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const screenX = x * cos + y * sin;
  const screenY = -x * sin + y * cos;

  // Rolling the right edge down carries the up-vector toward screen -X, so the
  // raw angle runs the wrong way for steering and is negated here.
  return (-Math.atan2(screenX, screenY) * 180) / Math.PI;
}

/**
 * The same thing from a deviceorientation reading, for the devices where that
 * is the source that works. beta and gamma are reported in the device's
 * portrait frame, and the two landscape angles take opposite signs.
 * @param {number} beta rotation about the device's X axis
 * @param {number} gamma rotation about its Y axis
 * @param {number} angle screen.orientation.angle
 */
export function screenTilt(beta, gamma, angle) {
  switch ((((angle % 360) + 360) % 360)) {
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
    /** True once a usable reading has arrived from either source. */
    this.live = false;
    /** Which source is answering: 'motion', 'orientation', or null. */
    this.source = null;
    /** Set when tilt was asked for and could not be had. */
    this.fellBack = false;
    /** Why, in one line, for the stats overlay and the notice. */
    this.fallbackReason = '';

    // DIAGNOSTICS, all of it read on the device because there is no console on
    // a phone and no keyboard to open one with. ui/StatsOverlay.js prints these
    // and public/sensor-test.html prints the same set without any game code.
    /** Raw event counts, per source, since the listeners were attached. */
    this.motionEvents = 0;
    this.orientationEvents = 0;
    /** Events carrying usable numbers, which is not the same thing. */
    this.motionReadings = 0;
    this.orientationReadings = 0;
    /** Events a second, per source, over the last window. */
    this.motionRate = 0;
    this.orientationRate = 0;
    /** The last gravity vector, in the device's own frame. */
    this.gravity = { x: 0, y: 0, z: 0 };
    /** The last screen orientation angle seen with a reading. */
    this.angle = screenAngle();
    /** Whether the page is allowed to have sensors at all. */
    this.secure = typeof window !== 'undefined' && window.isSecureContext !== false;

    /** Called with a short line the first time tilt is refused. */
    this.onNotice = null;
    /** Called whenever the mode changes, so the UI can follow. */
    this.onChange = null;

    this._neutral = null;
    this._raw = 0;
    this._smoothed = 0;
    this._waited = 0;
    this._listening = false;
    // The timeout is measured from the START TAP, not from load. Android
    // attaches its listeners at construction so readings are already flowing by
    // the time anyone taps, but update() also runs from the first frame -
    // behind a title card that is up for seconds on a phone - so a clock
    // started at load would expire before the rider had done anything.
    this._armed = false;
    /** Set when a requestPermission call said no. Advisory; see request(). */
    this._denied = false;
    this._rateWindow = 0;
    this._motionWindow = 0;
    this._orientationWindow = 0;

    this._onMotion = this._onMotion.bind(this);
    this._onOrientation = this._onOrientation.bind(this);

    // ATTACH IMMEDIATELY AND ALWAYS. This used to be gated on
    // Controls.needsPermission, on the reasoning that iOS will not deliver
    // events before they are asked for - true, but the gate also skipped every
    // browser that merely EXPOSES requestPermission while granting by default,
    // and there are more of those than there used to be. Attaching costs
    // nothing when no events come, and it means readings are already flowing by
    // the time anyone taps - which on a phone is several seconds after load,
    // behind a certificate warning and possibly a rotate prompt.
    if (this.enabled) this._listen();
  }

  /**
   * @returns {boolean} true where the sensors have to be asked for from inside
   *   a user gesture. Used to decide whether to ASK, never to decide whether to
   *   listen - listening is free and the data is the only real test.
   */
  static get needsPermission() {
    if (typeof window === 'undefined') return false;
    const motion = window.DeviceMotionEvent;
    const orientation = window.DeviceOrientationEvent;
    return (!!motion && typeof motion.requestPermission === 'function')
      || (!!orientation && typeof orientation.requestPermission === 'function');
  }

  /** @returns {boolean} whether either event exists on this device at all. */
  static get supported() {
    return typeof window !== 'undefined'
      && ('DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window);
  }

  /**
   * Asks for the sensors. MUST be called from inside a user gesture - see the
   * note at the top - which in this build means the start card's tap.
   * @returns {Promise<boolean>} whether readings are now allowed
   */
  async request() {
    if (!this.enabled) return false;
    if (!this.secure) {
      return this._fallback(config.ui.controls.tiltInsecure);
    }
    if (!Controls.supported) return this._fallback(config.ui.controls.tiltMissing);

    // DATA IS THE TEST, NOT THE ANSWER TO THIS QUESTION. Both events are asked
    // for, because a device may gate them separately and motion is the one this
    // build steers from - but a refusal is recorded and NOT acted on. A browser
    // that exposes requestPermission and answers anything other than 'granted'
    // may still deliver events perfectly well, and treating its answer as final
    // switched tilt off on hardware where it works. If the refusal was real,
    // nothing arrives, and the two second timeout below says so with this
    // reason attached.
    this._denied = false;
    for (const Sensor of [window.DeviceMotionEvent, window.DeviceOrientationEvent]) {
      if (!Sensor || typeof Sensor.requestPermission !== 'function') continue;
      try {
        const answer = await Sensor.requestPermission();
        if (answer !== 'granted') this._denied = true;
      } catch (error) {
        // Called outside a gesture, or refused outright.
        this._denied = true;
      }
    }

    this._listen();
    this._armed = true;
    this._waited = 0;
    return true;
  }

  _listen() {
    if (this._listening) return;
    window.addEventListener('devicemotion', this._onMotion);
    window.addEventListener('deviceorientation', this._onOrientation);
    this._listening = true;
    // THE CLOCK STARTS HERE. It used to start at load, and update() runs from
    // the first frame - behind the title card, which on a phone is up for
    // seconds. So by the time the tap arrived the budget was long gone and the
    // fallback fired on the very next frame, before the sensor could possibly
    // have answered. That is a timeout measuring the wrong interval, and it
    // made tilt look unsupported on hardware that supports it.
    this._waited = 0;
  }

  /** The primary source: where gravity is pointing. */
  _onMotion(event) {
    this.motionEvents++;
    this._motionWindow++;

    const g = event.accelerationIncludingGravity;
    // An event with no gravity in it is not a reading. Some browsers fire
    // devicemotion for the rotation rate alone, and counting those as readings
    // is how a silent sensor looks live.
    if (!g || (g.x === null && g.y === null && g.z === null)) return;

    const x = g.x || 0;
    const y = g.y || 0;
    const z = g.z || 0;
    // A vector of no length is not pointing anywhere; free fall or a stub.
    if (Math.abs(x) + Math.abs(y) + Math.abs(z) < 0.5) return;

    this.motionReadings++;
    this.gravity.x = x;
    this.gravity.y = y;
    this.gravity.z = z;
    this.angle = screenAngle();

    // Orientation only gets to answer while motion has said nothing at all.
    if (this.source === 'orientation' && this.motionReadings < 2) return;
    this.source = 'motion';

    const sign = config.controls.tilt.invert ? -1 : 1;
    this._raw = gravityTilt(x, y, this.angle) * sign;
    if (this._neutral === null) this._neutral = this._raw;
    this.live = true;
  }

  /** The fallback, used only while devicemotion has produced nothing. */
  _onOrientation(event) {
    this.orientationEvents++;
    this._orientationWindow++;
    if (event.beta === null && event.gamma === null) return;

    this.orientationReadings++;
    this.lastBeta = event.beta || 0;
    this.lastGamma = event.gamma || 0;

    // Motion wins whenever it is answering. This is the whole fallback rule.
    if (this.source === 'motion') return;

    this.angle = screenAngle();
    this.source = 'orientation';
    const sign = config.controls.tilt.invert ? -1 : 1;
    this._raw = screenTilt(event.beta || 0, event.gamma || 0, this.angle) * sign;
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
      this.fallbackReason = '';
      this._neutral = null;
      this._waited = 0;
      if (this._listening) this.recalibrate();
      else if (this.enabled) this.request();
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
    this.fallbackReason = message;
    this.mode = 'touch';
    // NOT SAVED. A sensor that did not answer this time is not a choice the
    // rider made, and writing it made a transient failure permanent: once the
    // timeout misfired, every later load read 'touch' out of storage and never
    // tried the sensor again. The stored preference stays whatever was chosen,
    // so a reload retries.
    if (this.onNotice) this.onNotice(message);
    if (this.onChange) this.onChange(this.mode);
    return false;
  }

  /**
   * Why tilt is not working, in one line, for the notice and the overlay.
   * @returns {string}
   */
  _diagnose() {
    const ui = config.ui.controls;
    if (!this.secure) return ui.tiltInsecure;
    if (!Controls.supported) return ui.tiltMissing;
    // A refusal only becomes the explanation once nothing has arrived, which is
    // exactly the point at which it stops being a guess.
    if (this._denied) return ui.tiltDenied;
    if (this.motionEvents === 0 && this.orientationEvents === 0) return ui.tiltSilent;
    // Events arriving with nothing in them is a different fault from no events
    // at all, and it is the one that looks like a working sensor.
    return ui.tiltEmpty;
  }

  /**
   * @param {number} dt
   * @returns {number} steer, -1..1, or 0 when tilt is not the live mode
   */
  update(dt) {
    // The rates are diagnostics and have to keep running whatever the mode is,
    // or switching to touch to look at them blanks the thing being looked at.
    this._rateWindow += dt;
    if (this._rateWindow >= 1) {
      this.motionRate = this._motionWindow / this._rateWindow;
      this.orientationRate = this._orientationWindow / this._rateWindow;
      this._motionWindow = 0;
      this._orientationWindow = 0;
      this._rateWindow = 0;
    }

    if (!this.enabled || this.mode !== 'tilt') return 0;

    // A mode that was asked for and never produced a reading is not a mode.
    // Waited out rather than failed immediately, because a permission dialog
    // can sit on screen for seconds before the first event arrives.
    if (!this.live) {
      // Only while listening, and only once the rider has actually started.
      if (!this._listening || !this._armed) return 0;
      this._waited += dt;
      if (this._waited > config.controls.tilt.timeout) {
        this._fallback(this._diagnose());
      }
      return 0;
    }

    const cfg = config.controls.tilt;
    const delta = this._raw - (this._neutral === null ? this._raw : this._neutral);
    const dead = Math.sign(delta) * Math.max(0, Math.abs(delta) - cfg.deadZone);
    const range = Math.max(1, cfg.range * cfg.sensitivity);
    const target = Math.max(-1, Math.min(1, dead / range));

    // Smoothed here rather than leaning on Input's steerSmoothing: that one is
    // tuned for a key that goes down and stays down, and an accelerometer held
    // still still jitters. This is the low pass filter on the gravity vector.
    const k = cfg.tau > 0 ? 1 - Math.exp(-dt / cfg.tau) : 1;
    this._smoothed += (target - this._smoothed) * k;
    this.steer = this._smoothed;
    return this.steer;
  }

  dispose() {
    if (this._listening) {
      window.removeEventListener('devicemotion', this._onMotion);
      window.removeEventListener('deviceorientation', this._onOrientation);
    }
    this._listening = false;
    this.onNotice = null;
    this.onChange = null;
  }
}
