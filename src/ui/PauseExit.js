import { config } from '../config.js';

/**
 * PauseExit - the two ways out of a run, on the pause card.
 *
 * ================= WHY IT HAD TO EXIST =================
 *
 * The pause card had no exit. Once a run started the only ways out were
 * finishing it, crashing three times, or reloading the page. Everything on
 * that card - reduced motion, control mode, the run mode switch - changes how
 * the CURRENT run behaves; nothing left it. So a rider who picked the wrong
 * road, or the wrong level, or simply wanted to stop, had to crash on purpose.
 *
 * ================= THE CONFIRM, AND WHY ONLY ONE OF THEM HAS IT =================
 *
 * ANA MENÜ throws away a run in progress and cannot be undone, and it lives on
 * a card a phone rider reaches by tapping a small button at speed. So it asks
 * twice: the first press arms it and relabels it, the second does it. The
 * arming times out on its own, because a card left open with a live confirm on
 * it is a trap for whoever picks the phone up next.
 *
 * YENİDEN BAŞLA has no confirm and should not have one. It restarts the level
 * that is already being ridden - the worst it can cost is the current attempt,
 * which is the thing the person pressing it has already decided to give up.
 * A confirm on every button teaches people to tap through confirms.
 *
 * ================= EVENTS ARE STOPPED, ALL OF THEM =================
 *
 * The same rule as ui/ComfortToggle.js and for the same reason: the pause card
 * is dismissed by a press ANYWHERE, so a button sitting on it would be
 * dismissed by the very tap that used it. Every event these buttons see is
 * stopped here.
 */
export class PauseExit {
  /**
   * @param {HTMLElement} parent
   * @param {{onRestart: Function, onMenu: Function}} actions
   */
  constructor(parent, actions) {
    this.actions = actions;
    this._armed = false;
    this._timer = 0;

    this.el = document.createElement('div');
    this.el.className = 'pause-exit';

    this.restartEl = this._button('pause-exit-restart', () => {
      this.disarm();
      this.actions.onRestart();
    });
    this.menuEl = this._button('pause-exit-menu', () => {
      if (!this._armed) {
        this.arm();
        return;
      }
      this.disarm();
      this.actions.onMenu();
    });

    this.el.append(this.restartEl, this.menuEl);
    parent.appendChild(this.el);
    this.render();
  }

  /**
   * @param {string} className
   * @param {Function} onActivate
   * @returns {HTMLButtonElement}
   */
  _button(className, onActivate) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'pause-exit-button ' + className;
    el.addEventListener('pointerdown', (event) => event.stopPropagation());
    el.addEventListener('keydown', (event) => {
      event.stopPropagation();
      // Escape belongs to the pause key even while this has focus, and it is
      // also the obvious way to back out of an armed confirm.
      if (event.key === 'Escape') {
        this.disarm();
        el.blur();
      }
    });
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      onActivate();
    });
    return el;
  }

  /** Arms the menu button, for a few seconds. */
  arm() {
    this._armed = true;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._armed = false;
      this.render();
    }, config.ui.panel.exitConfirmSeconds * 1000);
    this.render();
  }

  /** Puts the menu button back to asking. Safe to call at any time. */
  disarm() {
    if (this._timer) clearTimeout(this._timer);
    this._timer = 0;
    if (!this._armed) return;
    this._armed = false;
    this.render();
  }

  render() {
    const text = config.ui.panel;
    this.restartEl.textContent = text.restartLevel;
    this.menuEl.textContent = this._armed ? text.menuConfirm : text.menu;
    this.menuEl.classList.toggle('pause-exit-armed', this._armed);
  }

  /** @param {boolean} visible */
  setVisible(visible) {
    // Never left armed behind a closed card.
    if (!visible) this.disarm();
    this.el.hidden = !visible;
  }

  dispose() {
    if (this._timer) clearTimeout(this._timer);
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
