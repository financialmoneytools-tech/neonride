import { config } from '../config.js';
import { SelectScreen } from './select/SelectScreen.js';

/**
 * BikeScreen - pick one of the four bikes.
 *
 * THE PREVIEW IS THE ACTUAL COCKPIT. The world renders behind this card and the
 * cockpit is parented to the camera, so changing bike repaints the real sprite
 * in front of the real road - four uniform writes, no rebuild, no second
 * renderer and no still image that will quietly stop matching the game. That is
 * why this card lays out around an empty lower middle: the thing being chosen
 * is already on screen, and putting a picture of it on top would be covering
 * the bike with a picture of the bike.
 *
 * The three bars are the honest shape of config/bikes.js and not a sales pitch:
 * every bike is best at one of them and worst at another, and the blurb names
 * the trade rather than only the strength.
 */
export class BikeScreen {
  /**
   * @param {HTMLElement} parent
   * @param {object} handlers
   * @param {(key: string) => void} handlers.onPreview repaint the live cockpit
   * @param {(key: string) => void} handlers.onConfirm
   * @param {() => void} [handlers.onBack]
   * @param {string} [initial] the stored choice
   */
  constructor(parent, handlers, initial) {
    const text = config.ui.bikes;
    const keys = Object.keys(config.bikes);
    const items = keys.map((key) => ({ key, bike: config.bikes[key] }));

    this.screen = new SelectScreen(parent, {
      title: text.title,
      className: 'bike-screen',
      items,
      onBack: handlers.onBack,
      onChange: (item) => handlers.onPreview(item.key),
      onConfirm: (item) => handlers.onConfirm(item.key),
    });

    this._build();
    const start = Math.max(0, keys.indexOf(initial));
    this.screen.select(start);
  }

  _build() {
    const text = config.ui.bikes;
    const body = this.screen.body;

    this.name = document.createElement('div');
    this.name.className = 'bike-name';

    this.blurb = document.createElement('p');
    this.blurb.className = 'bike-blurb';

    const bars = document.createElement('div');
    bars.className = 'bike-bars';
    this.bars = {};
    for (const [key, label] of [
      ['speed', text.speed],
      ['acceleration', text.acceleration],
      ['handling', text.handling],
    ]) {
      const row = document.createElement('div');
      row.className = 'bike-bar';
      const name = document.createElement('span');
      name.className = 'bike-bar-label';
      name.textContent = label;
      const track = document.createElement('span');
      track.className = 'bike-bar-track';
      const fill = document.createElement('span');
      fill.className = 'bike-bar-fill';
      track.append(fill);
      row.append(name, track);
      bars.append(row);
      this.bars[key] = fill;
    }

    // The dots say how many bikes there are, which an arrow on its own does
    // not, and they are the only thing on this card that survives at 740x320
    // as a position indicator.
    this.dots = document.createElement('div');
    this.dots.className = 'select-dots';

    body.append(this.name, bars, this.blurb, this.dots);

    const render = this.screen.render.bind(this.screen);
    this.screen.render = () => {
      render();
      this._render();
    };
  }

  _render() {
    const item = this.screen.current;
    const bike = item.bike;
    const text = config.ui.bikes;

    this.name.textContent = bike.name;
    this.blurb.textContent = (text.blurb && text.blurb[item.key]) || '';
    // The card wears the bike's own colour, so the choice is legible before the
    // eye has travelled down to the cockpit.
    this.screen.el.style.setProperty('--bike-rim', '#' + bike.paint.rim.toString(16).padStart(6, '0'));
    this.screen.el.style.setProperty('--bike-body', '#' + bike.paint.body.toString(16).padStart(6, '0'));

    for (const key of Object.keys(this.bars)) {
      this.bars[key].style.width = Math.round((bike.bars[key] || 0) * 100) + '%';
    }

    this.dots.textContent = '';
    this.screen.items.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'select-dot' + (i === this.screen.index ? ' select-dot-on' : '');
      this.dots.append(dot);
    });
  }

  dispose() {
    this.screen.dispose();
  }
}
