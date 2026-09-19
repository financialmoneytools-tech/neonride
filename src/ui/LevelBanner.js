import { config } from '../config.js';

/**
 * LevelBanner - "SEVIYE 2", and deliberately not a card.
 *
 * THIS IS THE WHOLE MECHANISM FOR A LEVEL BOUNDARY and it was the easiest
 * thing in the feature to get wrong. The obvious build is a panel: pause, show
 * the level, wait for a press, resume. That is four interruptions to the one
 * thing ten levels exist to protect, which is that the riding does not stop.
 *
 * So this takes NO input, pauses nothing, and is not a phase. It is text over
 * a world that is still moving, it fades itself out, and the rider can be
 * mid-overtake through the whole of it. The only way to know it happened is to
 * have seen it, which is correct: a level boundary is a landmark, not an
 * event to acknowledge.
 *
 * IT IS DRIVEN BY A NUMBER, NOT BY A CALL. Session sets `levelJustReached` on
 * the frame the line is crossed and this consumes it. A method called from the
 * crossing would mean the crossing knew about the UI, and there are already
 * two things that react to it - the flash and the gate.
 *
 * NOT IN A RECORDING. God mode's phase is `free` and never reaches a level, so
 * `levelJustReached` stays zero and this never shows. Same guarantee the HUD
 * and the results card have.
 */
export class LevelBanner {
  /**
   * @param {HTMLElement} parent
   * @param {import('../game/Session.js').Session} session
   */
  constructor(parent, session) {
    this.session = session;

    this.el = document.createElement('div');
    this.el.className = 'level-banner';
    this.el.hidden = true;

    this.labelEl = document.createElement('div');
    this.labelEl.className = 'level-banner-label';
    this.labelEl.textContent = config.ui.levelBanner.label;

    this.numberEl = document.createElement('div');
    this.numberEl.className = 'level-banner-number';

    // Only when a life actually came back. At three lives nothing is handed
    // over, and a banner that said +1 CAN anyway would be the game lying
    // about the one resource the player is counting.
    this.lifeEl = document.createElement('div');
    this.lifeEl.className = 'level-banner-life';

    this.el.append(this.labelEl, this.numberEl, this.lifeEl);
    parent.appendChild(this.el);

    this._remaining = 0;
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    const session = this.session;

    const reached = session.levelJustReached;
    if (reached) {
      // CONSUMED, so a frame that runs twice cannot show it twice and a
      // frame that is missed cannot lose it - the flag stays set until
      // somebody takes it.
      session.levelJustReached = 0;
      this._show(reached, session.levelGainedLife);
    }

    if (this._remaining <= 0) return;
    // ON GAME TIME, like everything else here that has a duration. A banner
    // measured on the wall clock would keep counting down behind a pause and
    // be gone by the time the rider came back.
    this._remaining -= dt;
    if (this._remaining > 0) return;
    this.el.classList.remove('level-banner-in');
    this.el.hidden = true;
  }

  /**
   * @param {number} level
   * @param {boolean} gainedLife whether a life was actually handed back
   */
  _show(level, gainedLife) {
    this.numberEl.textContent = String(level);
    this.lifeEl.textContent = gainedLife ? config.ui.levelBanner.life : '';
    this.lifeEl.hidden = !gainedLife;

    this._remaining = config.levels.bannerSeconds;
    this.el.hidden = false;
    // Forces a reflow so the transition runs from the hidden state rather
    // than the browser collapsing both style changes into one frame.
    void this.el.offsetWidth;
    this.el.classList.add('level-banner-in');
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
