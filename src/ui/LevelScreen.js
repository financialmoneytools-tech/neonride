import { config } from '../config.js';
import { SelectScreen } from './select/SelectScreen.js';
import { formatTime } from './Results.js';

/**
 * LevelScreen - which of the ten to start on.
 *
 * It only appears in staged mode, after the road. SONSUZ never sees it: there
 * are no levels there and a screen offering them would be a promise the mode
 * does not keep.
 *
 * ================= WHY REPLAY IS ALLOWED AT ALL =================
 *
 * Ten levels is five or six minutes of continuous riding on three lives.
 * Failing at level nine and being sent back to level one means re-riding forty
 * kilometres already proven, and the entire reason levels exist is that the
 * run ENDED TOO SOON - shipping the opposite failure would be perverse. There
 * is also a standing requirement in CLAUDE.md that footage be capturable, and
 * the best shot in the game is at the end of level ten.
 *
 * What a start-from-one rule actually protects is the meaning of the TOTAL, so
 * game/Progress.js protects that directly instead: a total is written only for
 * an unbroken run from level one. Everything else is free, and the first card
 * here - BASTAN BASLA - is the one that earns it.
 *
 * A LEVEL IS OFFERED ONCE IT HAS BEEN REACHED, not once it has been beaten.
 * Session records the level on ENTRY, so a rider who got to level eight and
 * died there may go back and practise level eight. Being beaten by a level is
 * the normal way to meet it, and having to beat it to practise it is backwards.
 */
export class LevelScreen {
  /**
   * @param {HTMLElement} parent
   * @param {object} handlers
   * @param {(level: number) => void} handlers.onConfirm
   * @param {() => void} [handlers.onBack]
   * @param {object} handlers.record this road's record from game/Progress.js
   * @param {number} handlers.reached the highest level that may be started
   */
  constructor(parent, handlers) {
    const text = config.ui.levels;
    const record = handlers.record;
    const reached = handlers.reached;

    const items = [];
    for (let level = 1; level <= config.levels.count; level++) {
      const time = record.levelTimes[level - 1];
      items.push({
        key: level,
        level,
        label: text.label + ' ' + level,
        medal: record.levelMedals[level - 1] || '',
        best: typeof time === 'number' ? formatTime(time) : '',
        // The first card is always open. Everything past what has been
        // reached is locked, and shown rather than hidden - a grid that grows
        // as you play says "there is more of this", and a grid that is simply
        // short says nothing at all.
        locked: level > reached,
      });
    }

    this.screen = new SelectScreen(parent, {
      title: text.title,
      className: 'level-screen',
      confirmLabel: config.ui.select.start,
      items,
      onBack: handlers.onBack,
      onChange: () => this._render(),
      onConfirm: (item) => handlers.onConfirm(item.level),
    });

    this._build();
    // OPENS ON LEVEL ONE, not on the highest reached. The default has to be
    // the run that counts: somebody who wants the road total should get it by
    // pressing start, and somebody who wants to practise level nine is
    // already looking for it.
    this.screen.select(0);
  }

  _build() {
    const text = config.ui.levels;
    const body = this.screen.body;
    this.grid = document.createElement('div');
    this.grid.className = 'level-grid';

    this.cards = this.screen.items.map((item, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'level-card' + (item.locked ? ' level-card-locked' : '');

      const number = document.createElement('span');
      number.className = 'level-card-number';
      number.textContent = String(item.level);

      const medal = document.createElement('span');
      medal.className = 'level-card-medal';
      if (item.medal) {
        medal.textContent = config.ui.results.medalPip;
        medal.dataset.medal = item.medal;
      }

      const best = document.createElement('span');
      best.className = 'level-card-best';
      best.textContent = item.locked ? text.locked : item.best;

      card.append(number, medal, best);
      if (item.locked) card.disabled = true;

      // Same gesture contract as ui/RoadScreen.js, and for the same reasons
      // written out there: pointerup rather than click, pointerdown left
      // alone so the root still sees a swipe, and a drag that ended on a card
      // is a swipe rather than a choice.
      const choose = () => {
        if (!this.screen.armed) return;
        if (this.screen.consumedSwipe()) return;
        if (this.screen.index === index && !item.locked) this.screen.options.onConfirm(item);
        else this.screen.select(index);
      };
      card.addEventListener('pointerup', (event) => {
        event.stopPropagation();
        choose();
      });

      this.grid.append(card);
      return card;
    });

    body.append(this.grid);
    this._render();
  }

  _render() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].classList.toggle('level-card-on', i === this.screen.index);
    }
  }

  /** @returns {HTMLElement} */
  get el() {
    return this.screen.el;
  }

  dispose() {
    this.screen.dispose();
  }
}
