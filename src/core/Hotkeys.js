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
