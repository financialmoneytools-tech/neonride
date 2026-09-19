import { config } from '../config.js';
import { PHASE } from '../game/Session.js';
import { format } from './Hud.js';
import { ComfortToggle } from './ComfortToggle.js';
import { ControlsPanel } from './ControlsPanel.js';
import { ModeSwitch } from './ModeSwitch.js';
import { PauseExit } from './PauseExit.js';

/**
 * Panels - the pause card.
 *
 * The same object as the title card as far as the eye is concerned: the same
 * type, the same glow, the same dimmed ground over a scene that is still being
 * drawn behind it. They share a stylesheet for that reason rather than by
 * accident.
 *
 * IT USED TO BE THE GAME OVER CARD TOO. It is not any more: a run can now end
 * by reaching a finish line as well as by falling over, and those two have a
 * result to show rather than a score to report. ui/Results.js owns both
 * endings, and this owns the one state that is neither.
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
   * @param {import('../core/Controls.js').Controls} [controls] adds the control
   *   mode switch to the pause card when given
   * @param {import('../game/Selection.js').Selection} [selection] adds the run
   *   mode switch when given
   * @param {{onRestart: Function, onMenu: Function}} [exits] adds the two ways
   *   out of a run when given
   */
  constructor(parent, session, comfort = null, controls = null, audio = null,
    selection = null, exits = null) {
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

    // TWO COLUMNS, because a landscape phone is 360 CSS pixels tall and this
    // card had six stacked blocks in it. On a real handset the bottom of it -
    // the control mode switch, the sensitivity and the recentre button - was
    // simply below the screen and unreachable, with nothing to scroll. What is
    // read goes left, what is pressed goes right; the stylesheet folds them
    // back into one column when there is height for it.
    this.readEl = document.createElement('div');
    this.readEl.className = 'panel-read';
    this.readEl.append(this.titleEl, this.scoreEl, this.bestEl, this.promptEl);

    this.actionsEl = document.createElement('div');
    this.actionsEl.className = 'panel-actions';

    this.el.append(this.readEl, this.actionsEl);

    // Pause is the other place somebody reaches for this, and it is the one
    // that matters most: by then they are already feeling it. Hidden on the
    // game over card, where the run is finished and the offer is noise.
    this.toggle = comfort ? new ComfortToggle(this.actionsEl, comfort) : null;

    // The control mode switch, for the same reason and in the same place: it is
    // the only screen a rider can reach without a keyboard and without ending
    // the run. Pause only - a game over card is not where anybody retunes
    // steering.
    this.controlsPanel = controls ? new ControlsPanel(this.actionsEl, controls, audio) : null;

    // WHICH KIND OF RUN THIS IS, and how to change it for the next one. The
    // pause panel is the only screen reachable mid-session without ending
    // anything, and until this there was no way to find out which mode was
    // active at all - see ui/ModeSwitch.js.
    this.modeSwitch = selection ? new ModeSwitch(this.actionsEl, selection, session) : null;

    // LAST IN THE COLUMN, deliberately. Everything above changes the run that
    // is being ridden; these two end it, and the one that cannot be undone is
    // the furthest from the thumb that just reached for pause.
    this.exit = exits ? new PauseExit(this.actionsEl, exits) : null;

    parent.appendChild(this.el);

    this._shown = null;
  }

  update() {
    const session = this.session;
    // PAUSE ONLY. How a run ENDED is ui/Results.js now: there are two endings,
    // the third crash and the finish line, and a card that knew about one of
    // them would have meant the other growing its own.
    const shown = session.phase === PHASE.PAUSED ? PHASE.PAUSED : null;

    if (shown === this._shown) return;
    this._shown = shown;

    if (!shown) {
      this.el.classList.remove('panel-in');
      this.el.hidden = true;
      // An armed confirm must not survive the card closing.
      if (this.exit) this.exit.setVisible(false);
      return;
    }

    const text = config.ui.panel;
    const touch = matchMedia('(hover: none)').matches;

    this.titleEl.textContent = text.pausedTitle;
    this.scoreEl.textContent = format(session.score);
    this.bestEl.textContent = '';
    this.promptEl.textContent = touch ? text.resumeTouch : text.resumeKey;

    if (this.toggle) this.toggle.el.hidden = false;
    if (this.controlsPanel) this.controlsPanel.setVisible(true);
    // Re-rendered every time the card opens, because the run it is comparing
    // against changes underneath it.
    if (this.modeSwitch) this.modeSwitch.render();
    if (this.exit) this.exit.setVisible(true);
    this.el.hidden = false;
    // Forces a reflow so the transition runs from the hidden state rather than
    // the browser collapsing both style changes into one frame and skipping it.
    void this.el.offsetWidth;
    this.el.classList.add('panel-in');
  }

  dispose() {
    if (this.toggle) { this.toggle.dispose(); this.toggle = null; }
    if (this.controlsPanel) { this.controlsPanel.dispose(); this.controlsPanel = null; }
    if (this.modeSwitch) { this.modeSwitch.dispose(); this.modeSwitch = null; }
    if (this.exit) { this.exit.dispose(); this.exit = null; }
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
