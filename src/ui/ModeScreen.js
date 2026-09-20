import { config } from '../config.js';
import { MODE } from '../game/Session.js';
import { SelectScreen } from './select/SelectScreen.js';
// The HUD's own formatter, so a best score on this card is grouped exactly the
// way the live score is. Two copies of one rule is two chances to disagree.
import { format as formatScore } from './Hud.js';

/** Seconds as m:ss, which is how a road total reads on the results card. */
function formatClock(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return minutes + ':' + (rest < 10 ? '0' : '') + rest;
}



/**
 * ModeScreen - KOŞU or SONSUZ, and it is the first thing anybody chooses.
 *
 * Two cards. It is deliberately the thinnest screen in the flow: a mode is not
 * a thing to browse, and putting it in front of the bike and the road means the
 * two screens behind it are chosen FOR something rather than in the abstract.
 *
 * IT LOOKS LIKE THE ROAD SCREEN ON PURPOSE. Same SelectScreen shell, same card
 * shape, same arrows, same swipe, and now the same thumbnail box - so the one
 * gesture that works here works on all three, and a player who learns the flow
 * learns it once. It stays a separate class from RoadScreen because a road
 * card carries a lock and a per-road record, and this carries the rules of a
 * mode instead.
 *
 * ================= THE CARD SAYS WHAT THE MODE IS =================
 *
 * It was a name and one line of blurb in a large empty box, which is a poster
 * for a thing rather than a description of it. A mode is a set of RULES and
 * those rules are the only thing being chosen between, so the card carries
 * them: how long it is, what it gives, what it takes away, and - once there
 * is one - what the player has already done in it.
 *
 * Every number comes from config or from the stored records. None of them are
 * typed here: a card that repeated the level count or the life total would go
 * stale the first time either changed, which is the one thing a card like
 * this is guaranteed to do if it is allowed to.
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
    this.stats = handlers.stats ? handlers.stats() : null;
    const items = [
      {
        key: MODE.STAGE,
        label: text.stage,
        blurb: text.stageBlurb,
        thumb: 'thumbs/mode-stage.jpg',
        rows: this._stageRows(),
      },
      {
        key: MODE.ENDLESS,
        label: text.endless,
        blurb: text.endlessBlurb,
        thumb: 'thumbs/mode-endless.jpg',
        rows: this._endlessRows(),
      },
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

  /** KOŞU: ten levels, medals, three lives, and the best road time so far. */
  _stageRows() {
    const text = config.ui.modes.stats;
    const stats = this.stats;
    const rows = [
      text.levels
        .replace('%1', String(config.levels.count))
        .replace('%2', String(Math.round(config.stage.length / 1000))),
      text.medals,
      text.lives.replace('%1', String(config.game.crashesAllowed)),
    ];
    // ONLY IF THERE IS ONE. An empty best row is worse than no row: it says
    // the game measured something and then lost it.
    if (stats && stats.bestTotal !== null && stats.bestTotal !== undefined) {
      rows.push(text.bestRun.replace('%1', formatClock(stats.bestTotal)));
    }
    if (stats && stats.roadsDone > 0) {
      rows.push(text.roadsDone
        .replace('%1', String(stats.roadsDone))
        .replace('%2', String(stats.roadsTotal)));
    }
    return rows;
  }

  /** SONSUZ: no finish, three lives, and the best run so far. */
  _endlessRows() {
    const text = config.ui.modes.stats;
    const stats = this.stats;
    const rows = [
      text.noFinish,
      text.lives.replace('%1', String(config.game.crashesAllowed)),
    ];
    if (stats && stats.bestDistance) {
      rows.push(text.bestDistance.replace('%1', (stats.bestDistance / 1000).toFixed(1)));
    }
    if (stats && stats.bestScore) {
      rows.push(text.bestScore.replace('%1', formatScore(stats.bestScore)));
    }
    return rows;
  }

  _build() {
    const body = this.screen.body;
    this.grid = document.createElement('div');
    this.grid.className = 'mode-grid';

    this.cards = this.screen.items.map((item, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mode-card';

      // The same box the road cards use, filled the same way - a background
      // image rather than an <img>, so it fills a fixed aspect at any size
      // without letterboxing and can never be dragged off the card.
      const shot = document.createElement('span');
      shot.className = 'road-shot mode-shot';
      if (item.thumb) shot.style.backgroundImage = 'url(' + item.thumb + ')';

      const label = document.createElement('span');
      label.className = 'mode-label';
      label.textContent = item.label;
      // NO BLURB ON THIS CARD. "5 KM. BİTİŞ ÇİZGİSİ VE MADALYA." is the three
      // stat rows underneath it in a sentence, and a 320px landscape phone
      // has exactly 210px of card to spend - measured, the card with both
      // overflowed its own border by about 60px, with the rules hanging off
      // the bottom edge. The rows are the better half of the pair: they are
      // the numbers, and they are filled from config rather than written out.
      const rows = document.createElement('span');
      rows.className = 'mode-rows';
      for (const line of item.rows) {
        const row = document.createElement('span');
        row.className = 'mode-row';
        row.textContent = line;
        rows.append(row);
      }

      card.append(shot, label, rows);

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
