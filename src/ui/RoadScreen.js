import { config } from '../config.js';
import { MODE } from '../game/Session.js';
import { SelectScreen } from './select/SelectScreen.js';

/**
 * RoadScreen - pick the road, or ask for all of them.
 *
 * One card per built theme, with a thumbnail taken from the game itself by
 * tools/theme-thumbs.mjs. Then TUM YOLLAR, which cycles every built road
 * through light gates. Then the planned roads, shown LOCKED rather than left
 * out - "there are more roads coming" is worth a card, and an empty grid says
 * the opposite.
 *
 * A LOCKED CARD IS DERIVED, NEVER DECLARED. `config.plannedThemes` lists what
 * is coming, and anything in that list which has since turned up in
 * `config.themes` is shown as built instead of locked. Otherwise the first
 * theme to land would ship with a YAKINDA card advertising itself, and it would
 * take somebody noticing to fix.
 */
export class RoadScreen {
  /**
   * @param {HTMLElement} parent
   * @param {object} handlers
   * @param {(key: string) => void} handlers.onConfirm a theme key, or config.MIXED
   * @param {() => void} [handlers.onBack]
   * @param {(key: string) => void} [handlers.onPreview]
   * @param {string} [handlers.mode] the active MODE, shown on the screen
   * @param {(road: string) => object} [handlers.recordFor] per-road progress,
   *   for the SEVIYE 7 / 10 badge. Omitted in endless mode, where there are
   *   no levels and a badge would be advertising a thing the mode does not do.
   * @param {string} [initial]
   */
  constructor(parent, handlers, initial) {
    const text = config.ui.roads;
    this.mode = handlers.mode;
    const staged = handlers.mode === MODE.STAGE && !!handlers.recordFor;
    const items = [];

    for (const key of Object.keys(config.themes)) {
      items.push({
        key,
        label: (text.name && text.name[key]) || config.themes[key].name,
        blurb: (text.blurb && text.blurb[key]) || '',
        thumb: `thumbs/${key}.jpg`,
        locked: false,
        progress: staged ? handlers.recordFor(key) : null,
      });
    }

    // Only worth offering once there is more than one road to move between.
    if (Object.keys(config.themes).length > 1) {
      // A REAL THUMBNAIL AND A REAL PROGRESS BADGE. It was the one card with
      // neither - a bare gradient with nothing on it, which beside six
      // photographed roads reads as an empty slot rather than as an option.
      // The montage is built by tools/theme-thumbs.mjs out of the same
      // thumbnails the other cards use, so it cannot go stale when a road is
      // added: it is made from whatever roads exist.
      const roads = Object.keys(config.themes);
      const done = staged
        ? roads.filter((key) => handlers.recordFor(key).totalBest !== null).length
        : 0;
      items.push({
        key: config.MIXED,
        label: text.mixed,
        blurb: text.mixedBlurb,
        thumb: 'thumbs/mixed.jpg',
        mixed: true,
        locked: false,
        // COUNTED IN ROADS, not levels. This card means all of them, so a
        // level number would be answering a question nobody asked - which
        // road's level? See config/ui.js.
        combined: staged ? { done, total: roads.length } : null,
      });
    }

    for (const planned of config.plannedThemes) {
      if (config.themes[planned.key]) continue; // it landed; it is above
      items.push({ key: planned.key, label: planned.name, blurb: '', locked: true });
    }

    this.screen = new SelectScreen(parent, {
      title: text.title,
      className: 'road-screen',
      confirmLabel: config.ui.select.start,
      items,
      onBack: handlers.onBack,
      onChange: (item) => {
        this._render();
        if (handlers.onPreview && !item.locked) handlers.onPreview(item.key);
      },
      onConfirm: (item) => handlers.onConfirm(item.key),
    });

    this._build();
    const start = Math.max(0, items.findIndex((item) => item.key === initial));
    this.screen.select(start);
  }

  _build() {
    const text = config.ui.roads;
    const body = this.screen.body;
    this.grid = document.createElement('div');
    this.grid.className = 'road-grid';

    this.cards = this.screen.items.map((item, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'road-card' + (item.locked ? ' road-card-locked' : '')
        + (item.mixed ? ' road-card-mixed' : '');

      const shot = document.createElement('span');
      shot.className = 'road-shot';
      if (item.thumb) {
        // A background image rather than an <img>: it has to fill a fixed card
        // at any aspect without letterboxing, and it must never be draggable.
        shot.style.backgroundImage = `url(${item.thumb})`;
      }
      const label = document.createElement('span');
      label.className = 'road-label';
      label.textContent = item.label;

      // THE DESCRIPTION IS ON THE CARD. It used to be one shared line under
      // the row, which is the right place when seven cards are on screen and
      // the wrong one when there is exactly one: with a single card filling
      // the frame, a caption floating below it reads as a caption for the
      // screen rather than for the road.
      const blurb = document.createElement('span');
      blurb.className = 'road-card-blurb';
      blurb.textContent = item.locked ? '' : (item.blurb || '');

      card.append(shot, label, blurb);

      // HOW FAR INTO THIS ROAD, on the card itself. Ten levels per road means
      // "which road shall I ride" and "how far did I get on it" are the same
      // question, and answering only the first would send a rider into a road
      // with no idea whether they had a level to finish or a road to start.
      if (item.progress || item.combined) {
        const badge = document.createElement('span');
        badge.className = 'road-progress';
        let done = false;
        if (item.combined) {
          done = item.combined.done >= item.combined.total;
          badge.textContent = done
            ? text.done
            : text.mixedProgress
              .replace('%1', String(item.combined.done))
              .replace('%2', String(item.combined.total));
        } else {
          done = item.progress.totalBest !== null;
          badge.textContent = done
            ? text.done
            : text.progress
              .replace('%1', String(item.progress.reached))
              .replace('%2', String(config.levels.count));
        }
        if (done) badge.classList.add('road-progress-done');
        card.append(badge);
      }

      if (item.locked) {
        const lock = document.createElement('span');
        lock.className = 'road-lock';
        lock.textContent = config.ui.select.locked;
        card.append(lock);
        card.disabled = true;
      }

      // POINTERDOWN IS NOT STOPPED HERE, and that is the fix for a swipe that
      // did nothing on the road screen. The card root tracks the gesture, so a
      // card which swallowed the pointerdown meant every swipe STARTING on a
      // card - which is most of the screen - was never seen as a swipe at all.
      const choose = () => {
        // The pointerup that ended the gesture which BUILT this screen is not
        // a choice - see ui/select/SelectScreen.js.
        if (!this.screen.armed) return;
        // A drag that ended on this card is a swipe, not a choice. Without this
        // the swipe would change the selection and then the tap would set it
        // straight back to whatever card the finger happened to lift over.
        if (this.screen.consumedSwipe()) return;
        // First tap selects, and a second tap on the SAME card confirms. On a
        // phone that is what a thumb expects; on a desktop Enter still does it.
        if (this.screen.index === index && !item.locked) this.screen.options.onConfirm(item);
        else this.screen.select(index);
      };
      // POINTERUP, not click - a tap after a swipe does not always produce a
      // click. See SelectScreen._activate. Pointerdown is deliberately NOT
      // stopped, so the card root can still see a swipe that starts here.
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

    // THE ACTIVE MODE, on the last screen before a run. It was invisible
    // everywhere until now: a player who had been through the mode screen had
    // no way at all of checking what they had picked.
    this.modeEl = document.createElement('p');
    this.modeEl.className = 'road-mode';
    if (this.mode) {
      const modes = config.ui.modes;
      const name = this.mode === MODE.ENDLESS ? modes.endless : modes.stage;
      this.modeEl.textContent = modes.label + ': ' + name;
    }
    body.append(this.modeEl, this.grid);

    const render = this.screen.render.bind(this.screen);
    this.screen.render = () => {
      render();
      this._render();
    };
  }

  _render() {
    if (!this.cards) return;
    this.cards.forEach((card, i) => {
      card.classList.toggle('road-card-on', i === this.screen.index);
    });
    // NOTHING TO SCROLL INTO VIEW ANY MORE. Only the selected card is
    // displayed, so the row cannot overflow and the card cannot be off-screen.
  }

  dispose() {
    this.screen.dispose();
  }
}
