import { config } from '../config.js';
import { PHASE } from '../game/Session.js';
import { format } from './Hud.js';
import { ComfortToggle } from './ComfortToggle.js';

/**
 * Panels - the pause card and the game over card.
 *
 * The same object as the title card as far as the eye is concerned: the same
 * type, the same glow, the same dimmed ground over a scene that is still being
 * drawn behind it. They share a stylesheet for that reason rather than by
 * accident.
 *
 * ONE ELEMENT, not two. A pause panel and a game over panel differ by their
 * text, and building two of everything would mean two places to keep the look
 * consistent. What changes is what is written in it and which phase shows it.
 *
 * NOTHING HERE READS INPUT. Which key resumes and which key restarts is a rule
 * about the run, so it lives with the run - see main.js, where one handler
 * decides what a press means from the phase. A panel that listened for its own
 * key would be a second place that knows the rules.
 */
export class Panels {
  /**
   * @param {HTMLElement} parent
   * @param {import('../game/Session.js').Session} session
   * @param {import('../core/Comfort.js').Comfort} [comfort]
   */
  constructor(parent, session, comfort = null) {
    this.session = session;

    this.el = document.createElement('div');
    this.el.className = 'panel';
    this.el.hidden = true;

    this.titleEl = document.createElement('h2');
    this.titleEl.className = 'panel-title';

    this.scoreEl = document.createElement('div');
    this.scoreEl.className = 'panel-score';

    this.bestEl = document.createElement('div');
    this.bestEl.className = 'panel-best';

    this.promptEl = document.createElement('p');
    this.promptEl.className = 'panel-prompt';

    this.el.append(this.titleEl, this.scoreEl, this.bestEl, this.promptEl);

    // Pause is the other place somebody reaches for this, and it is the one
    // that matters most: by then they are already feeling it. Hidden on the
    // game over card, where the run is finished and the offer is noise.
    this.toggle = comfort ? new ComfortToggle(this.el, comfort) : null;

    parent.appendChild(this.el);

    this._shown = null;
  }

  update() {
    const session = this.session;
    // The game over card waits out `overDelay`: the crash flash, the speed loss
    // and the shove are the best part of a second of the shot and a panel
    // dropped over them throws all of it away.
    const shown = session.phase === PHASE.PAUSED ? PHASE.PAUSED
      : session.phase === PHASE.OVER && session.overShown ? PHASE.OVER
        : null;

    if (shown === this._shown) return;
    this._shown = shown;

    if (!shown) {
      this.el.classList.remove('panel-in');
      this.el.hidden = true;
      return;
    }

    const text = config.ui.panel;
    const touch = matchMedia('(hover: none)').matches;

    if (shown === PHASE.PAUSED) {
      this.titleEl.textContent = text.pausedTitle;
      this.scoreEl.textContent = format(session.score);
      this.bestEl.textContent = '';
      this.promptEl.textContent = touch ? text.resumeTouch : text.resumeKey;
    } else {
      this.titleEl.textContent = text.overTitle;
      this.scoreEl.textContent = format(session.score);
      this.bestEl.textContent = session.isRecord
        ? text.record
        : text.best + ' ' + format(session.best);
      this.promptEl.textContent = touch ? text.restartTouch : text.restartKey;
    }

    if (this.toggle) this.toggle.el.hidden = shown !== PHASE.PAUSED;
    this.el.classList.toggle('panel-record', shown === PHASE.OVER && session.isRecord);
    this.el.hidden = false;
    // Forces a reflow so the transition runs from the hidden state rather than
    // the browser collapsing both style changes into one frame and skipping it.
    void this.el.offsetWidth;
    this.el.classList.add('panel-in');
  }

  dispose() {
    if (this.toggle) { this.toggle.dispose(); this.toggle = null; }
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
