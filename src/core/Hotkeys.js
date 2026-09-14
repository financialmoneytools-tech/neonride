/**
 * Hotkeys - one shot keys, kept apart from Input on purpose.
 *
 * Input is a continuous control: it reads what is held down every frame and
 * smooths it. These are discrete, fire once on press, and none of them touch
 * the bike. Mixing the two would mean Input had to track edges it otherwise
 * never needs.
 *
 * Bindings come from config.input.hotkeys, by KeyboardEvent.code, so remapping
 * is a config change rather than a code change.
 */
export class Hotkeys {
  /**
   * @param {Object<string, () => void>} actions keyed by the names in
   *   config.input.hotkeys, e.g. { capture: fn, cameraProfile: fn }
   * @param {Object<string, string>} bindings action name to KeyboardEvent.code
   */
  constructor(actions, bindings) {
    this._byCode = new Map();
    for (const name of Object.keys(bindings)) {
      if (actions[name]) this._byCode.set(bindings[name], actions[name]);
    }

    this._onKeyDown = (event) => {
      // Ignore auto repeat: these are toggles, and holding one should not
      // flap it dozens of times a second.
      if (event.repeat) return;
      const action = this._byCode.get(event.code);
      if (action) action();
    };

    window.addEventListener('keydown', this._onKeyDown);
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    this._byCode.clear();
  }
}

/**
 * KeySequence - fires when a run of keys is typed in order.
 *
 * Here for one reason: something can be opened this way without anything on
 * screen saying it exists. A binding in the hotkey table is discoverable by
 * pressing keys; a sequence is not, which is the point when the thing being
 * opened is meant to stay hidden.
 *
 * The run resets on any key that is not the next one expected, and on a pause
 * longer than the window, so a stray order cannot slowly accumulate into a
 * match over the course of a ride.
 */
export class KeySequence {
  /**
   * @param {Array<string>} codes KeyboardEvent.code values, in order
   * @param {number} window seconds allowed between keys
   * @param {() => void} action
   */
  constructor(codes, window_, action) {
    this.codes = codes;
    this.window = window_;
    this.action = action;
    this._index = 0;
    this._last = 0;

    this._onKeyDown = (event) => {
      if (event.repeat || this.codes.length === 0) return;

      const now = performance.now() / 1000;
      if (this._index > 0 && now - this._last > this.window) this._index = 0;

      if (event.code === this.codes[this._index]) {
        this._index++;
        this._last = now;
        if (this._index >= this.codes.length) {
          this._index = 0;
          this.action();
        }
        return;
      }

      // A wrong key restarts, but it may itself be the start of a new run -
      // typing "gg od" should still work.
      this._index = event.code === this.codes[0] ? 1 : 0;
      this._last = now;
    };

    window.addEventListener('keydown', this._onKeyDown);
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    this.action = null;
  }
}
