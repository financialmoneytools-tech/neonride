import { config } from '../config.js';

/**
 * Input — klavye + dokunmatik + gamepad girdilerini tek bir
 * normalize edilmis cikti nesnesine indirger:
 *   { steer: -1..1, throttle: 0..1, brake: 0..1 }
 *
 * Ham girdiler once "hedef" degerlere yazilir, sonra update(dt) icinde
 * ustel yumusatma ile mevcut degerlere yaklastirilir.
 *
 * Dokunmatik semasi:
 *   - Sol yarim ekrana dokunma  -> sola don
 *   - Sag yarim ekrana dokunma  -> saga don
 *   - Herhangi bir dokunma      -> gaz acik
 *   - Iki yarima ayni anda dokunma -> fren (gaz kapali, direksiyon notr)
 */
export class Input {
  /** @param {HTMLElement|Window} target Olay dinleyicilerinin baglanacagi hedef */
  constructor(target = window) {
    this.target = target;

    /** Disariya verilen yumusatilmis degerler. */
    this.values = { steer: 0, throttle: 0, brake: 0 };
    /** Yumusatma oncesi ham hedefler. */
    this.raw = { steer: 0, throttle: 0, brake: 0 };

    this._keys = new Set();
    this._touchSteer = 0;
    this._touchThrottle = 0;
    this._touchBrake = 0;
    this._gamepadIndex = null;

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

  // --- Klavye ---

  _onKeyDown(e) {
    if (Input.SCROLL_KEYS.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    this._keys.add(e.code);
  }

  _onKeyUp(e) {
    this._keys.delete(e.code);
  }

  /** Sekme degisince tuslar basili kalmasin. */
  _onBlur() {
    this._keys.clear();
    this._touchSteer = 0;
    this._touchThrottle = 0;
    this._touchBrake = 0;
  }

  // --- Dokunmatik ---

  _onTouch(e) {
    e.preventDefault();

    const touches = e.touches;
    const split = window.innerWidth * config.input.touchSteerSplit;
    let left = false;
    let right = false;

    for (let i = 0; i < touches.length; i++) {
      if (touches[i].clientX < split) left = true;
      else right = true;
    }

    if (left && right) {
      // Iki yarim birden -> fren
      this._touchSteer = 0;
      this._touchThrottle = 0;
      this._touchBrake = 1;
    } else if (left || right) {
      this._touchSteer = left ? -1 : 1;
      this._touchThrottle = 1;
      this._touchBrake = 0;
    } else {
      this._touchSteer = 0;
      this._touchThrottle = 0;
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

    // Sol cubuk yatay ekseni, olu bolge disinda yeniden olceklenir
    let steer = pad.axes.length > 0 ? pad.axes[0] : 0;
    steer = Math.abs(steer) < dead ? 0 : (steer - Math.sign(steer) * dead) / (1 - dead);

    // D-pad (standart eslemede 14 sol / 15 sag) cubugun yerine gecebilir
    if (steer === 0) {
      if (Input.isPressed(pad.buttons[14])) steer = -1;
      else if (Input.isPressed(pad.buttons[15])) steer = 1;
    }

    // RT (7) gaz, LT (6) fren; A (0) da gaz olarak kabul edilir
    let throttle = Input.buttonValue(pad.buttons[7]);
    if (throttle < trig && Input.isPressed(pad.buttons[0])) throttle = 1;
    const brake = Input.buttonValue(pad.buttons[6]);

    return {
      steer: Input.clamp(steer, -1, 1),
      throttle: Input.clamp(throttle, 0, 1),
      brake: Input.clamp(brake, 0, 1),
    };
  }

  // --- Dongu ---

  /**
   * Loop tarafindan her karede cagrilir.
   * @param {number} dt saniye cinsinden delta
   */
  update(dt) {
    const keys = this._keys;

    // Klavye
    let steer = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) steer -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) steer += 1;
    let throttle = keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0;
    let brake = keys.has('KeyS') || keys.has('ArrowDown') || keys.has('Space') ? 1 : 0;

    // Dokunmatik (klavye notrken devreye girer)
    if (steer === 0) steer = this._touchSteer;
    throttle = Math.max(throttle, this._touchThrottle);
    brake = Math.max(brake, this._touchBrake);

    // Gamepad (klavye/dokunmatikten daha guclu bir sinyal varsa onu kullan)
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

  // --- Yardimcilar ---

  /** Frame hizindan bagimsiz ustel yaklasma. tau = zaman sabiti (sn). */
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

/** Sayfayi kaydiran tuslar: varsayilan davranislari engellenir. */
Input.SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
