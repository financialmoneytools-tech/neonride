import { config } from '../config.js';
import { PHASE } from '../game/Session.js';

/**
 * Hud - the score and distance while a run is going.
 *
 * Pure HTML over the canvas, like StatsOverlay: it adds nothing to the scene,
 * costs no draw call and cannot disturb the render. It is also the only thing
 * in the project that has to be legible against a frame that is mostly bloom,
 * which is what the shadow in the stylesheet is for.
 *
 * IT IS NOT DRAWN EVERY FRAME. Writing to the DOM sixty times a second to
 * change a number that moves by three is pointless traffic, and the score is
 * only legible at a few updates a second anyway. The digits are compared before
 * anything is written, so a frame where nothing changed costs nothing at all.
 *
 * It shows in one phase only. God mode is `free`, which never gets here, so no
 * recording can have a score counter in the corner of it.
 */
export class Hud {
  /**
   * @param {HTMLElement} parent
   * @param {import('../game/Session.js').Session} session
   */
  constructor(parent, session) {
    this.session = session;

    this.el = document.createElement('div');
    this.el.className = 'hud';
    this.el.hidden = true;

    this.scoreEl = document.createElement('div');
    this.scoreEl.className = 'hud-score';

    this.metaEl = document.createElement('div');
    this.metaEl.className = 'hud-meta';

    // Lives, as filled and hollow pips. A number would be read once and then
    // ignored; a row of pips that visibly loses one is read every time it
    // changes, which is the only moment it matters.
    this.livesEl = document.createElement('div');
    this.livesEl.className = 'hud-lives';

    this.el.append(this.scoreEl, this.livesEl, this.metaEl);
    parent.appendChild(this.el);

    this._score = -1;
    this._meta = '';
    this._lives = -1;
  }

  update() {
    const session = this.session;
    // Paused still shows it: the panel is about the pause, and a score that
    // disappears behind it reads as a score that was lost.
    const visible = session.phase === PHASE.RUNNING || session.phase === PHASE.PAUSED;
    // NOT equals. Written as `===` this only assigned when the value was
    // already what it was about to be set to, so the HUD stayed hidden for the
    // whole run - and it stayed hidden silently, because a missing overlay
    // throws nothing and looks like a design decision.
    if (this.el.hidden !== !visible) this.el.hidden = !visible;
    if (!visible) return;

    if (session.score !== this._score) {
      this._score = session.score;
      this.scoreEl.textContent = format(session.score);
    }

    if (session.lives !== this._lives) {
      this._lives = session.lives;
      const text = config.ui.lives;
      const total = config.game.crashesAllowed;
      let pips = '';
      for (let i = 0; i < total; i++) pips += i < session.lives ? text.full : text.empty;
      this.livesEl.textContent = pips;
    }

    const labels = config.ui.hud;
    const meta = Math.floor(session.distance) + labels.distanceUnit
      + (session.nearMisses > 0 ? '   ' + labels.nearMiss + ' ' + session.nearMisses : '');
    if (meta !== this._meta) {
      this._meta = meta;
      this.metaEl.textContent = meta;
    }
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}

/**
 * Thin spaces every three digits. A six figure score with no grouping is a
 * number nobody can read at a glance, and a comma reads as a decimal point in
 * half the world.
 * @param {number} value
 * @returns {string}
 */
export function format(value) {
  return String(Math.max(0, Math.floor(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
