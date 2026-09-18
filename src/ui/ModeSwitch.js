import { config } from '../config.js';
import { MODE } from '../game/Session.js';

/**
 * ModeSwitch - which kind of run this is, and how to change it, in the pause
 * panel.
 *
 * ================= WHY IT IS HERE AND NOT IN A SETTINGS SCREEN ============
 *
 * The mode was chosen once on a screen the player then never saw again, and
 * there was no way at all to find out afterwards which one was active - a run
 * either had a finish line in it or it did not, and that was the only clue. The
 * pause panel is the one screen reachable mid-session without ending anything,
 * which makes it the place this belongs.
 *
 * IT CHANGES THE NEXT RUN, NOT THIS ONE. A staged run that quietly became
 * endless while it was being ridden would throw away the distance already
 * covered and the clock already running, and an endless run that grew a finish
 * line five kilometres back would end on the spot. So the switch stores the
 * choice, says that it applies to the next run, and `beginRun` in main.js picks
 * it up - which is also why the label shows the CURRENT run's mode when the two
 * disagree, rather than pretending the change has already happened.
 *
 * EVERY EVENT IS STOPPED, for the reason ui/ComfortToggle.js documents at
 * length: the panel is dismissed by a press anywhere, so a button sitting on it
 * would be dismissed by the very tap that used it.
 */
export class ModeSwitch {
  /**
   * @param {HTMLElement} parent
   * @param {import('../game/Selection.js').Selection} selection what the next
   *   run will use
   * @param {import('../game/Session.js').Session} session the run in progress
   */
  constructor(parent, selection, session) {
    this.selection = selection;
    this.session = session;

    this.el = document.createElement('button');
    this.el.type = 'button';
    this.el.className = 'controls-btn mode-switch';

    this._onPointerDown = (event) => {
      // Stopped, not merely defaulted: the window handlers that dismiss the
      // panel listen for pointerdown and run whatever the default action does.
      event.stopPropagation();
    };
    this._onKeyDown = (event) => {
      event.stopPropagation();
      // Escape belongs to the pause key even while this has focus.
      if (event.key === 'Escape') this.el.blur();
    };
    this._onClick = (event) => {
      event.stopPropagation();
      this.selection.setMode(
        this.selection.mode === MODE.STAGE ? MODE.ENDLESS : MODE.STAGE,
      );
      this.render();
    };

    this.el.addEventListener('pointerdown', this._onPointerDown);
    this.el.addEventListener('keydown', this._onKeyDown);
    this.el.addEventListener('click', this._onClick);
    parent.appendChild(this.el);

    this.note = document.createElement('span');
    this.note.className = 'mode-switch-note';
    parent.appendChild(this.note);

    this.render();
  }

  /** @param {string} mode */
  static name(mode) {
    const text = config.ui.modes;
    return mode === MODE.ENDLESS ? text.endless : text.stage;
  }

  render() {
    const text = config.ui.modes;
    const chosen = this.selection.mode;
    this.el.textContent = text.label + ': ' + ModeSwitch.name(chosen);
    this.el.setAttribute('aria-label', text.change);

    // Only says "next run" when it would actually be a change. A note that is
    // always there is a note nobody reads on the one occasion it matters.
    const running = this.session && this.session.mode;
    const differs = running && running !== chosen;
    this.note.textContent = differs ? text.nextRun : '';
    this.el.classList.toggle('mode-switch-pending', !!differs);
  }

  dispose() {
    this.el.removeEventListener('pointerdown', this._onPointerDown);
    this.el.removeEventListener('keydown', this._onKeyDown);
    this.el.removeEventListener('click', this._onClick);
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    if (this.note.parentNode) this.note.parentNode.removeChild(this.note);
    this.el = null;
    this.note = null;
  }
}
