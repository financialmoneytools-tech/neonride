import { config } from '../config.js';

/**
 * Input - reduces keyboard, touch and gamepad input to a single
 * normalized output object:
 *   { steer: -1..1, throttle: 0..1, brake: 0..1 }
 *
 * Raw input is written to "target" values first, then eased toward the
 * current values with exponential smoothing inside update(dt).
 *
 * TWO TOUCH SCHEMES, for a phone held sideways in two hands. Which one is live
 * is core/Controls.js; this file only reads coordinates.
 *
 *   TILT   steering comes from the sensor, not from here.
 *          right half held -> throttle, left half held -> brake, neither coasts.
 *   TOUCH  left thumb dragged horizontally -> steer, RELATIVE to where it
 *          landed. Right half held -> throttle, with a brake button above it.
 *
 * What both replace is a zone scheme: bottom-left corner meant full left,
 * bottom-right meant full right, both at once meant brake, and any touch at all
 * meant full throttle. It was binary - the steer value was only ever -1, 0 or
 * +1 - and only felt analogue because Input smooths everything on the way out.
 *
 * EVERY TOUCH IS READ FROM COORDINATES, including the brake button. The button
 * on screen is drawn by ui/ControlHints.js with pointer-events none, so it is a
 * picture of where to put a thumb and can never swallow a gesture or break the
 * multi-touch below.
 *
 * MULTI-TOUCH IS THE POINT. Steering and throttle are different thumbs and have
 * to work at the same time, so every live touch is classified on every event
 * rather than the last one winning. The steering thumb is tracked BY IDENTIFIER
 * across events, which is what makes a drag relative to its own landing point
 * rather than to wherever the finger happens to be.
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
     * The steering thumb in TOUCH mode: which touch it is and where it landed.
     * Kept across events so the drag is measured from its own start, which is
     * what lets a thumb come down anywhere on the left and still mean straight.
     */
    this._steerTouch = null;

    /**
     * Set by main.js. Input asks it which scheme to read rather than owning the
     * choice, because the mode is also a stored preference and a pause panel.
     * @type {import('./Controls.js').Controls|null}
     */
    this.controls = null;

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
    // Every game touch is ours: no scrolling, no pinch zoom, no text selection,
    // no double-tap zoom. index.html blocks most of that with touch-action and
    // user-select; this is what stops the rest.
    e.preventDefault();

    if (this.onFirstTouch && e.type === 'touchstart') {
      const handler = this.onFirstTouch;
      this.onFirstTouch = null;
      handler();
    }

    const cfg = config.controls;
    const touches = e.touches;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const tilt = this.controls && this.controls.mode === 'tilt';

    let throttle = 0;
    let brake = 0;

    if (tilt) {
      // Halves, and nothing else. Steering is the sensor's job, so a thumb has
      // only to say go or stop and can land anywhere on its own side.
      for (let i = 0; i < touches.length; i++) {
        const right = touches[i].clientX >= width * 0.5;
        if (right === (cfg.halves.throttle === 'right')) throttle = 1;
        else brake = 1;
      }
      this._steerTouch = null;
      this._touchSteer = 0;
    } else {
      const t = cfg.touch;
      const steerEdge = width * t.steerHalf;
      const b = t.brake;
      const inBrake = (x, y) => x >= width * b.x && x <= width * (b.x + b.width)
        && y >= height * b.y && y <= height * (b.y + b.height);

      // The tracked steering thumb first, by identifier. Finding it again is
      // what makes the drag relative; matching by position would hand steering
      // to whichever finger happened to be furthest left this frame.
      let steerTouch = null;
      for (let i = 0; i < touches.length; i++) {
        if (this._steerTouch && touches[i].identifier === this._steerTouch.id) {
          steerTouch = touches[i];
          break;
        }
      }

      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        if (steerTouch && touch.identifier === steerTouch.identifier) continue;
        const x = touch.clientX;
        const y = touch.clientY;
        if (!steerTouch && x < steerEdge) {
          // A new thumb on the left takes over steering, and where it lands is
          // straight ahead.
          this._steerTouch = { id: touch.identifier, startX: x, x, y };
          steerTouch = touch;
          continue;
        }
        if (inBrake(x, y)) brake = 1;
        else if (x >= steerEdge) throttle = 1;
      }

      if (steerTouch) {
        const span = Math.max(1, width * t.dragRange);
        const drag = (steerTouch.clientX - this._steerTouch.startX) / span;
        this._touchSteer = Math.max(-1, Math.min(1, drag));
        // Where the thumb is NOW, for ui/SteerIndicator.js. Kept here rather
        // than recomputed there because this is the only place that knows
        // which of several touches is the steering one.
        this._steerTouch.x = steerTouch.clientX;
        this._steerTouch.y = steerTouch.clientY;
      } else {
        // Lifted: straight ahead, and the next thumb down starts a new drag.
        this._steerTouch = null;
        this._touchSteer = 0;
      }
    }

    this._touchThrottle = throttle;
    this._touchBrake = brake;
  }

  /**
   * The steering thumb, or null when none is down.
   *
   * READ ONLY, and the live object rather than a copy: it is read once a
   * frame by one drawer and copying it would allocate sixty times a second
   * for nothing. Anything that writes to it is writing to the control state.
   * @returns {{startX: number, x: number, y: number}|null}
   */
  get steerPointer() {
    return this._steerTouch;
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

    // Touch and tilt take over while the keyboard is neutral, so a desktop
    // with a phone plugged in loses nothing and the keyboard always wins.
    if (steer === 0) {
      const tilt = this.controls ? this.controls.update(dt) : 0;
      steer = this.controls && this.controls.mode === 'tilt' ? tilt : this._touchSteer;
    }
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
