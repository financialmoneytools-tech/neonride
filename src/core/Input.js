import { config } from '../config.js';

/**
 * Input - reduces keyboard, touch and gamepad input to a single
 * normalized output object:
 *   { steer: -1..1, throttle: 0..1, brake: 0..1 }
 *
 * Raw input is written to "target" values first, then eased toward the
 * current values with exponential smoothing inside update(dt).
 *
 * Touch scheme, laid out for a phone held sideways in two hands:
 *   - Bottom left corner    -> steer left
 *   - Bottom right corner   -> steer right
 *   - Both at once          -> brake
 *   - Any touch             -> throttle on
 *
 * Steering lives in the bottom band only, because that is where thumbs are when
 * both hands are holding the phone, and because a control anywhere else is a
 * hand over the road. Touches above the band still drive but do not steer, so
 * grabbing the top of the phone to steady it does nothing unexpected.
 */
export class Input {
  /** @param {HTMLElement|Window} target Element the listeners are attached to */
  constructor(target = window) {
    this.target = target;

    /** Smoothed values exposed to the rest of the project. */
    this.values = { steer: 0, throttle: 0, brake: 0 };
    /** Raw targets before smoothing. */
    this.raw = { steer: 0, throttle: 0, brake: 0 };

    this._keys = new Set();
    this._touchSteer = 0;
    this._touchThrottle = 0;
    this._touchBrake = 0;
    this._gamepadIndex = null;

    /**
     * Called once, on the first touch. A user gesture is the only moment a
     * browser will accept a fullscreen request, and this is the only place that
     * reliably sees one on a device with no keyboard. Set by main.js.
     * @type {(() => void)|null}
     */
    this.onFirstTouch = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onTouch = this._onTouch.bind(this);
    this._onGamepadConnected = this._onGamepadConnected.bind(this);
    this._onGamepadDisconnected = this._onGamepadDisconnected.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
    window.addEventListener('gamepadconnected', this._onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this._onGamepadDisconnected);

    const touchOpts = { passive: false };
    this.target.addEventListener('touchstart', this._onTouch, touchOpts);
    this.target.addEventListener('touchmove', this._onTouch, touchOpts);
    this.target.addEventListener('touchend', this._onTouch, touchOpts);
    this.target.addEventListener('touchcancel', this._onTouch, touchOpts);
  }

  // --- Keyboard ---

  _onKeyDown(e) {
    if (Input.SCROLL_KEYS.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    this._keys.add(e.code);
  }

  _onKeyUp(e) {
    this._keys.delete(e.code);
  }

  /** Keys must not stay stuck when the tab loses focus. */
  _onBlur() {
    this._keys.clear();
    this._touchSteer = 0;
    this._touchThrottle = 0;
    this._touchBrake = 0;
  }

  // --- Touch ---

  _onTouch(e) {
    e.preventDefault();

    if (this.onFirstTouch && e.type === 'touchstart') {
      const handler = this.onFirstTouch;
      this.onFirstTouch = null;
      handler();
    }

    const cfg = config.touch;
    const touches = e.touches;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // The band is measured from the bottom of the frame, and each thumb zone
    // from its own outside edge, so the layout holds at any aspect without a
    // second set of numbers for portrait.
    const bandTop = height * (1 - cfg.band.height);
    const leftEdge = width * cfg.band.width;
    const rightEdge = width * (1 - cfg.band.width);
    const split = width * cfg.steerSplit;

    let left = false;
    let right = false;
    let any = false;

    for (let i = 0; i < touches.length; i++) {
      const x = touches[i].clientX;
      const y = touches[i].clientY;
      any = true;
      if (y < bandTop) continue;
      if (x <= leftEdge) left = true;
      else if (x >= rightEdge) right = true;
      // Between the two zones, fall back to the halves, so a thumb that lands
      // short of the corner still steers the way it points.
      else if (x < split) left = true;
      else right = true;
    }

    if (left && right && cfg.bothSidesBrake) {
      this._touchSteer = 0;
      this._touchThrottle = 0;
      this._touchBrake = 1;
    } else {
      this._touchSteer = left ? -1 : right ? 1 : 0;
      this._touchThrottle = cfg.autoThrottle && any ? 1 : right ? 1 : 0;
      this._touchBrake = 0;
    }
  }

  // --- Gamepad ---

  _onGamepadConnected(e) {
    this._gamepadIndex = e.gamepad.index;
  }

  _onGamepadDisconnected(e) {
    if (this._gamepadIndex === e.gamepad.index) this._gamepadIndex = null;
  }

  /** @returns {{steer:number, throttle:number, brake:number}|null} */
  _readGamepad() {
    if (!navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    const pad = this._gamepadIndex !== null ? pads[this._gamepadIndex] : null;
    if (!pad || !pad.connected) return null;

    const dead = config.input.gamepadDeadzone;
    const trig = config.input.gamepadTriggerThreshold;

    // Left stick horizontal axis, rescaled outside the deadzone
    let steer = pad.axes.length > 0 ? pad.axes[0] : 0;
    steer = Math.abs(steer) < dead ? 0 : (steer - Math.sign(steer) * dead) / (1 - dead);

    // D-pad (14 left / 15 right in the standard mapping) can stand in for the stick
    if (steer === 0) {
      if (Input.isPressed(pad.buttons[14])) steer = -1;
      else if (Input.isPressed(pad.buttons[15])) steer = 1;
    }

    // RT (7) is throttle, LT (6) is brake; A (0) also counts as throttle
    let throttle = Input.buttonValue(pad.buttons[7]);
    if (throttle < trig && Input.isPressed(pad.buttons[0])) throttle = 1;
    const brake = Input.buttonValue(pad.buttons[6]);

    return {
      steer: Input.clamp(steer, -1, 1),
      throttle: Input.clamp(throttle, 0, 1),
      brake: Input.clamp(brake, 0, 1),
    };
  }

  // --- Loop ---

  /**
   * Called by Loop on every frame.
   * @param {number} dt delta time in seconds
   */
  update(dt) {
    const keys = this._keys;

    // Keyboard
    let steer = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) steer -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) steer += 1;
    let throttle = keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0;
    let brake = keys.has('KeyS') || keys.has('ArrowDown') || keys.has('Space') ? 1 : 0;

    // Touch (takes over while the keyboard is neutral)
    if (steer === 0) steer = this._touchSteer;
    throttle = Math.max(throttle, this._touchThrottle);
    brake = Math.max(brake, this._touchBrake);

    // Gamepad (wins when it carries a stronger signal than keyboard/touch)
    const pad = this._readGamepad();
    if (pad) {
      if (Math.abs(pad.steer) > Math.abs(steer)) steer = pad.steer;
      throttle = Math.max(throttle, pad.throttle);
      brake = Math.max(brake, pad.brake);
    }

    this.raw.steer = Input.clamp(steer, -1, 1);
    this.raw.throttle = Input.clamp(throttle, 0, 1);
    this.raw.brake = Input.clamp(brake, 0, 1);

    const s = config.input;
    this.values.steer = Input.damp(this.values.steer, this.raw.steer, s.steerSmoothing, dt);
    this.values.throttle = Input.damp(
      this.values.throttle,
      this.raw.throttle,
      s.throttleSmoothing,
      dt,
    );
    this.values.brake = Input.damp(this.values.brake, this.raw.brake, s.brakeSmoothing, dt);

    return this.values;
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
    window.removeEventListener('gamepadconnected', this._onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this._onGamepadDisconnected);
    this.target.removeEventListener('touchstart', this._onTouch);
    this.target.removeEventListener('touchmove', this._onTouch);
    this.target.removeEventListener('touchend', this._onTouch);
    this.target.removeEventListener('touchcancel', this._onTouch);
    this._keys.clear();
  }

  // --- Helpers ---

  /** Frame-rate independent exponential approach. tau = time constant (s). */
  static damp(current, target, tau, dt) {
    if (tau <= 0) return target;
    return current + (target - current) * (1 - Math.exp(-dt / tau));
  }

  static clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  static isPressed(button) {
    return !!button && button.pressed;
  }

  static buttonValue(button) {
    if (!button) return 0;
    return button.pressed ? Math.max(button.value, 1) : button.value;
  }
}

/** Keys that scroll the page: their default behavior is suppressed. */
Input.SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
