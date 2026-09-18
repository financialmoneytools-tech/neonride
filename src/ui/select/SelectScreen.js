import { config } from '../../config.js';

/**
 * SelectScreen - the shape both selection screens share.
 *
 * A card over the running world: a title, a row of options, a back button and a
 * confirm button, driven by arrows, by tapping, or by swiping. The world keeps
 * rendering behind it, which is the whole reason the bike screen needs no
 * preview widget - the preview is the actual cockpit, repainted live.
 *
 * EVERY EVENT IS STOPPED HERE. main.js listens on the window for a press and
 * decides what it means from the run's phase; it does not know these screens
 * exist. A button that let its pointerdown through would be dismissed by the
 * very tap that used it - the same trap ui/ComfortToggle.js documents, and the
 * same one that made the smoke test flip reduced motion for weeks instead of
 * starting a run. `pointerdown` is STOPPED rather than merely prevented,
 * because the window listeners fire on pointerdown regardless of preventDefault.
 *
 * IT IS NOT A LIST OF BUTTONS ON A PAGE THAT SCROLLS. The game does not scroll,
 * and a landscape phone is about 320 CSS pixels tall. Everything here is laid
 * out to fit 740x320 with the cockpit still visible underneath, and the short
 * viewport rules in index.html are part of the component rather than a polish
 * pass somebody does later.
 */
export class SelectScreen {
  /**
   * @param {HTMLElement} parent
   * @param {object} options
   * @param {string} options.title heading, already Turkish
   * @param {string} options.className extra class on the root
   * @param {Array<object>} options.items each needs `key`; `locked` disables it
   * @param {(item: object, index: number) => void} options.onChange
   * @param {(item: object) => void} options.onConfirm
   * @param {() => void} [options.onBack] omitted means no back button
   */
  constructor(parent, options) {
    const text = config.ui.select;
    this.options = options;
    this.items = options.items;
    this.index = 0;
    this._disposed = false;

    this.el = document.createElement('div');
    this.el.className = 'select-screen ' + (options.className || '');

    const head = document.createElement('div');
    head.className = 'select-head';
    const title = document.createElement('h2');
    title.className = 'select-title';
    title.textContent = options.title;
    head.append(title);

    this.body = document.createElement('div');
    this.body.className = 'select-body';

    const foot = document.createElement('div');
    foot.className = 'select-foot';

    this.hint = document.createElement('p');
    this.hint.className = 'select-hint';
    // A phone is told to swipe and a desktop is told which keys. Matched on
    // hover rather than on width: a small window on a laptop still has a
    // keyboard, and a large tablet still does not.
    this.hint.textContent = matchMedia('(hover: none)').matches
      ? text.hintTouch
      : text.hintKeys;

    this.backButton = null;
    if (options.onBack) {
      this.backButton = this._button(text.back, 'select-back', () => options.onBack());
      foot.append(this.backButton);
    }
    foot.append(this.hint);
    this.confirmButton = this._button(
      options.confirmLabel || text.next,
      'select-confirm',
      () => this._confirm(),
    );
    foot.append(this.confirmButton);

    this.el.append(head, this.body, foot);
    parent.appendChild(this.el);

    this._onKey = this._onKey.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    // On the CARD, not the window: this screen only ever answers for itself.
    this.el.addEventListener('pointerdown', this._onPointerDown);
    this.el.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('keydown', this._onKey, true);

    this._swipeFrom = null;
  }

  /** A real button, so a keyboard and a screen reader both reach it. */
  _button(label, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'controls-btn ' + className;
    button.textContent = label;
    const stop = (event) => event.stopPropagation();
    button.addEventListener('pointerdown', stop);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  /** @param {number} index clamped, skipping nothing - a locked item may be looked at. */
  select(index) {
    const count = this.items.length;
    this.index = ((index % count) + count) % count;
    this.render();
    if (this.options.onChange) this.options.onChange(this.items[this.index], this.index);
  }

  move(step) {
    this.select(this.index + step);
  }

  get current() {
    return this.items[this.index];
  }

  _confirm() {
    const item = this.current;
    // A locked item is shown rather than hidden - "there will be more roads" is
    // worth saying - but it cannot be ridden.
    if (item.locked) return;
    this.options.onConfirm(item);
  }

  _onKey(event) {
    if (this._disposed) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      this.move(-1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      this.move(1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      this._confirm();
    } else if (event.key === 'Escape' && this.options.onBack) {
      this.options.onBack();
    } else {
      return;
    }
    // Stopped, and stopped in the CAPTURE phase, so the window listener that
    // starts and restarts runs never sees the key that was meant for a menu.
    event.preventDefault();
    event.stopPropagation();
  }

  _onPointerDown(event) {
    event.stopPropagation();
    this._swipeFrom = { x: event.clientX, y: event.clientY };
  }

  _onPointerUp(event) {
    event.stopPropagation();
    if (!this._swipeFrom) return;
    const dx = event.clientX - this._swipeFrom.x;
    const dy = event.clientY - this._swipeFrom.y;
    this._swipeFrom = null;
    // A swipe is horizontal and long enough to be meant. Below that it is a
    // tap, and a tap on an option picks that option - which is what a thumb
    // does first on a screen of cards.
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      this.move(dx < 0 ? 1 : -1);
    }
  }

  /** Subclasses build their own body; this only keeps the shared state right. */
  render() {
    this.confirmButton.disabled = !!(this.current && this.current.locked);
  }

  dispose() {
    this._disposed = true;
    this.el.removeEventListener('pointerdown', this._onPointerDown);
    this.el.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('keydown', this._onKey, true);
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
