import { config } from '../config.js';
import { MODE } from '../game/Session.js';
import { SelectScreen } from './select/SelectScreen.js';

/**
 * ModeScreen - KOŞU or SONSUZ, and it is the first thing anybody chooses.
 *
 * Two cards. It is deliberately the thinnest screen in the flow: a mode is not
 * a thing to browse, and putting it in front of the bike and the road means the
 * two screens behind it are chosen FOR something rather than in the abstract.
 *
 * IT LOOKS LIKE THE ROAD SCREEN ON PURPOSE. Same SelectScreen shell, same card
 * shape, same arrows, same swipe - so the one gesture that works here works on
 * all three, and a player who learns the flow learns it once. The only reason
 * it is a separate class from RoadScreen is that a road card carries a
 * thumbnail and a lock and this carries neither.
 */
export class ModeScreen {
  /**
   * @param {HTMLElement} parent
   * @param {object} handlers
   * @param {(mode: string) => void} handlers.onConfirm a MODE value
   * @param {(mode: string) => void} [handlers.onQuick] HIZLI BAŞLA: start now,
   *   on the stored bike and road, in the highlighted mode
   * @param {string} [initial] a MODE value
   */
  constructor(parent, handlers, initial) {
    const text = config.ui.modes;
    const items = [
      { key: MODE.STAGE, label: text.stage, blurb: text.stageBlurb },
      { key: MODE.ENDLESS, label: text.endless, blurb: text.endlessBlurb },
    ];

    this.screen = new SelectScreen(parent, {
      title: text.title,
      className: 'mode-screen',
      items,
      onChange: () => this._render(),
      onConfirm: (item) => handlers.onConfirm(item.key),
      // HIZLI BAŞLA. It skips the bike and the road, not the MODE: the mode is
      // whatever is highlighted here, so the one thing this screen exists to
      // ask is still answered even by the player who is skipping past it.
      extraLabel: handlers.onQuick ? config.ui.select.quick : undefined,
      onExtra: handlers.onQuick
        ? () => handlers.onQuick(this.screen.current.key)
        : undefined,
    });

    this._build();
    const start = Math.max(0, items.findIndex((item) => item.key === initial));
    this.screen.select(start);
  }

  _build() {
    const body = this.screen.body;
    this.grid = document.createElement('div');
    this.grid.className = 'mode-grid';

    this.cards = this.screen.items.map((item, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mode-card';

      const label = document.createElement('span');
      label.className = 'mode-label';
      label.textContent = item.label;
      const blurb = document.createElement('span');
      blurb.className = 'mode-blurb';
      blurb.textContent = item.blurb;
      card.append(label, blurb);

      // POINTERUP, NOT CLICK, and pointerdown deliberately not stopped - the
      // same two rules the road cards needed. A tap that follows a swipe does
      // not always produce a click, and a card that swallows pointerdown means
      // every swipe starting on a card is never seen as a swipe. Both were
      // real faults on a phone; see ui/select/SelectScreen.js.
      const choose = () => {
        // The pointerup that ended the gesture which BUILT this screen is not
        // a choice - see ui/select/SelectScreen.js. This is what stopped one
        // click on the title card from opening the mode screen and confirming
        // it in the same gesture.
        if (!this.screen.armed) return;
        if (this.screen.consumedSwipe()) return;
        if (this.screen.index === index) this.screen.options.onConfirm(item);
        else this.screen.select(index);
      };
      card.addEventListener('pointerup', (event) => {
        event.stopPropagation();
        choose();
      });
      card.addEventListener('click', (event) => {
        event.stopPropagation();
        if (event.detail === 0) choose();
      });
      this.grid.append(card);
      return card;
    });

    body.append(this.grid);

    const render = this.screen.render.bind(this.screen);
    this.screen.render = () => {
      render();
      this._render();
    };
  }

  _render() {
    if (!this.cards) return;
    this.cards.forEach((card, i) => {
      card.classList.toggle('mode-card-on', i === this.screen.index);
    });
  }

  dispose() {
    this.screen.dispose();
  }
}
