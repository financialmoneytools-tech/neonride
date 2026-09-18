import { config } from '../config.js';
import { PHASE } from '../game/Session.js';
import { Stage } from '../game/Stage.js';
import { format } from './Hud.js';

/**
 * Results - how a run ended, whichever way it ended.
 *
 * It replaced the game over panel outright rather than sitting beside it. There
 * are now two ways for a run to stop - the third crash, and the finish line -
 * and a card that only knew about one of them would have meant the other
 * growing its own, with two places to keep the look and the wording consistent.
 * The old panel's job was to say "you fell over, here is a number"; this says
 * what happened, how it compares, and what there is to beat.
 *
 * THREE THINGS TO SAY, and the failure case is the one that had to be got
 * right. It leads with the distance REACHED, not with the failure: how far you
 * got is the thing to beat next time, and a card that only says DÜŞTÜN gives a
 * player nothing to aim at. A staged failure also shows the line it fell short
 * of, because 3600 of 5000 is a different feeling from 3600 of nothing.
 *
 * NOTHING HERE READS INPUT, like the panels it replaced. Which press restarts
 * is a rule about the run and lives in main.js, where one handler decides what
 * a press means from the phase.
 */
export class Results {
  /**
   * @param {HTMLElement} parent
   * @param {import('../game/Session.js').Session} session
   * @param {() => string} roadName what road the run was on, for the best time
   */
  constructor(parent, session, roadName) {
    this.session = session;
    this.roadName = roadName;

    this.el = document.createElement('div');
    this.el.className = 'panel results';
    this.el.hidden = true;

    this.titleEl = document.createElement('h2');
    this.titleEl.className = 'panel-title';

    // The medal, as a word AND a pip. A medal told by colour alone is a medal a
    // colour blind player cannot read, and this is the one screen in the game
    // whose entire purpose is to be read.
    this.medalEl = document.createElement('div');
    this.medalEl.className = 'results-medal';

    this.headlineEl = document.createElement('div');
    this.headlineEl.className = 'panel-score';

    this.detailEl = document.createElement('div');
    this.detailEl.className = 'panel-best';

    this.promptEl = document.createElement('p');
    this.promptEl.className = 'panel-prompt';

    const read = document.createElement('div');
    read.className = 'panel-read';
    read.append(this.titleEl, this.medalEl, this.headlineEl, this.detailEl, this.promptEl);
    this.el.append(read);
    parent.appendChild(this.el);

    this._shown = false;
  }

  update() {
    const session = this.session;
    const shown = session.ended && session.overShown;
    if (shown === this._shown) return;
    this._shown = shown;

    if (!shown) {
      this.el.classList.remove('panel-in');
      this.el.hidden = true;
      return;
    }

    const text = config.ui.results;
    const touch = matchMedia('(hover: none)').matches;
    const finished = session.phase === PHASE.FINISHED;

    this.titleEl.textContent = finished ? text.finishedTitle : text.failedTitle;
    this.promptEl.textContent = touch ? text.againTouch : text.againKey;

    if (finished) this._finished(text);
    else this._failed(text);

    this.el.classList.toggle('results-finished', finished);
    this.el.hidden = false;
    // Forces a reflow so the transition runs from the hidden state rather than
    // the browser collapsing both style changes into one frame and skipping it.
    void this.el.offsetWidth;
    this.el.classList.add('panel-in');
  }

  /** @param {object} text config.ui.results */
  _finished(text) {
    const stage = this.session.stage;
    const medal = stage.medal || 'bronze';
    this.medalEl.textContent = text.medalPip + ' ' + text.medal[medal];
    this.medalEl.dataset.medal = medal;
    this.medalEl.hidden = false;

    this.headlineEl.textContent = text.time + ' ' + formatTime(stage.time);

    // The stored best is read back rather than remembered from the finish,
    // because the finish has already written it - so on a record these would
    // be the same number and the card would say "new record" next to a best
    // that is this run's own time. Reading it back and comparing is what makes
    // the two lines say different things.
    const best = Stage.bestFor(this.roadName());
    this.detailEl.textContent = stage.isRecord
      ? text.record
      : best !== null ? text.best + ' ' + formatTime(best) : '';
  }

  /** @param {object} text config.ui.results */
  _failed(text) {
    const session = this.session;
    this.medalEl.hidden = true;
    this.medalEl.textContent = '';
    delete this.medalEl.dataset.medal;

    if (session.staged) {
      // LEADS WITH HOW FAR, and against the line it fell short of. A bare
      // distance is a number; a distance out of five kilometres is a position.
      this.headlineEl.textContent = Math.floor(session.stage.travelled)
        + text.of + config.stage.length + config.ui.stageHud.unit;
      this.detailEl.textContent = text.reached;
      return;
    }

    // Endless: the score is the result, and the best score is what it is
    // measured against. This is the old game over card's content, kept because
    // it was right for the mode it belonged to.
    this.headlineEl.textContent = format(session.score);
    this.detailEl.textContent = session.isRecord
      ? text.record
      : config.ui.panel.best + ' ' + format(session.best);
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}

/**
 * Seconds as a rider reads them. Under a minute is the normal case for a five
 * kilometre stage, so it stays as seconds with one decimal rather than becoming
 * 0:31.4 - a leading zero minute is noise on a number nobody will ever see go
 * past two figures.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '-';
  if (seconds < 60) return seconds.toFixed(1);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return minutes + ':' + (rest < 10 ? '0' : '') + rest.toFixed(1);
}
