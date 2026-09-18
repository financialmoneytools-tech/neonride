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
   * @param {string} [options.extraLabel] label for an optional extra action
   * @param {() => void} [options.onExtra] the optional extra action
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

    // ARROWS, EITHER SIDE, and they are not decoration. A screen whose only
    // control is a swipe has an invisible control: nothing on it says a swipe
    // is possible, and when the swipe stopped working there was no second way
    // in. On a phone this screen did nothing at all and the fault was invisible
    // on a desktop, where the arrow KEYS go to a window listener.
    this.prevButton = this._arrow('‹', 'select-arrow-prev', -1);
    this.nextButton = this._arrow('›', 'select-arrow-next', 1);

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

    // An OPTIONAL extra action, between the hint and the confirm. The mode
    // screen uses it for HIZLI BAŞLA; nothing else has needed one yet, which is
    // why it is an option rather than a fixed slot.
    this.extraButton = null;
    if (options.onExtra && options.extraLabel) {
      this.extraButton = this._button(options.extraLabel, 'select-extra', () => options.onExtra());
      foot.append(this.extraButton);
    }

    this.confirmButton = this._button(
      options.confirmLabel || text.next,
      'select-confirm',
      () => this._confirm(),
    );
    foot.append(this.confirmButton);

    this.el.append(head, this.body, foot, this.prevButton, this.nextButton);
    parent.appendChild(this.el);

    this._onKey = this._onKey.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    // On the CARD, not the window: this screen only ever answers for itself.
    this.el.addEventListener('pointerdown', this._onPointerDown);
    this.el.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('keydown', this._onKey, true);

    this._swipeFrom = null;
    this._swiped = false;

    // ================= NOT ARMED UNTIL THIS SCREEN OWNS A GESTURE =========
    //
    // A screen can be BUILT IN THE MIDDLE OF SOMEBODY ELSE'S GESTURE. The
    // title card dismisses on POINTERDOWN, so the first screen in the flow is
    // constructed while a finger or a button is still down, and the POINTERUP
    // that ends that gesture lands on whatever is now underneath it. On the
    // mode screen that was the pre-selected card, and a tap on the card that is
    // already selected is a CONFIRM - so one click opened the mode screen and
    // destroyed it, and the flow looked like title -> bike -> road with no mode
    // step at all.
    //
    // It reproduced on a MOUSE and not under a thumb, which is why it looked
    // intermittent and why the first test written for it passed. A touch
    // pointer is implicitly captured to the element that received `touchstart`,
    // so a tap's pointerup goes to the body it started on however much has been
    // built over it; a mouse pointerup hit-tests live against whatever is under
    // the cursor at that instant.
    //
    // So a pointerup can only activate anything once this screen has seen the
    // matching pointerDOWN. Keyboard is deliberately not gated: it never has a
    // half-finished gesture to inherit, and gating it would mean a screen that
    // can never be driven by the keyboard at all.
    this._armed = false;
  }

  /**
   * @returns {boolean} whether a pointerup may act. False until this screen has
   * seen the start of a gesture of its own - see the note in the constructor.
   */
  get armed() {
    return this._armed;
  }

  /**
   * True once, if the gesture that just finished was a swipe. Reading it clears
   * it, so a later click is a click.
   * @returns {boolean}
   */
  consumedSwipe() {
    const swiped = this._swiped;
    this._swiped = false;
    return swiped;
  }

  /**
   * One of the two big side arrows. A real button, sized in CSS to a thumb.
   * @param {string} glyph
   * @param {string} className
   * @param {number} step
   */
  _arrow(glyph, className, step) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'select-arrow ' + className;
    button.textContent = glyph;
    button.setAttribute('aria-label', step < 0 ? 'previous' : 'next');
    this._activate(button, () => this.move(step));
    return button;
  }

  /**
   * Wires a control to fire on POINTERUP, not on click.
   *
   * A tap does not always become a `click`. Measured, with a real touch stream:
   * a tap that follows a swipe closely receives pointerdown, touchstart,
   * pointerup and touchend and NO click at all, so a button that works
   * perfectly in isolation does nothing as the second half of a gesture. On a
   * screen whose whole purpose is swipe-then-tap that is not an edge case, it
   * is the normal way it gets used.
   *
   * `click` is still handled, but only when `detail` is 0 - which is what a
   * keyboard-synthesised click looks like and what a pointer-driven one never
   * does. So a thumb goes through pointerup, a keyboard goes through click, and
   * neither can fire the action twice.
   * @param {HTMLElement} button
   * @param {() => void} action
   */
  _activate(button, action) {
    const stop = (event) => {
      event.stopPropagation();
      // A pointerdown on a button is still the start of a gesture this screen
      // owns, and the root listener never sees it because it is stopped here.
      this._armed = true;
    };
    button.addEventListener('pointerdown', stop);
    button.addEventListener('pointerup', (event) => {
      event.stopPropagation();
      // The pointerup that ended the gesture which BUILT this screen is not a
      // press of this button. See the constructor.
      if (!this._armed) return;
      action();
    });
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (event.detail === 0) action();
    });
  }


  /** A real button, so a keyboard and a screen reader both reach it. */
  _button(label, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'controls-btn ' + className;
    button.textContent = label;
    this._activate(button, onClick);
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
    this._armed = true;
    this._swipeFrom = { x: event.clientX, y: event.clientY };
  }

  _onPointerUp(event) {
    event.stopPropagation();
    // Inherited from the gesture that built this screen; not ours to act on.
    if (!this._armed) {
      this._swipeFrom = null;
      return;
    }
    if (!this._swipeFrom) return;
    const dx = event.clientX - this._swipeFrom.x;
    const dy = event.clientY - this._swipeFrom.y;
    const from = this._swipeFrom;
    this._swipeFrom = null;

    // A swipe is horizontal and long enough to be meant. The threshold is a
    // fraction of the WIDTH rather than a fixed 40 px: this screen is 740 px
    // wide on the phone it is designed for and over 1900 on a desktop, and the
    // same absolute distance is a flick on one and a twitch on the other.
    const width = this.el ? this.el.clientWidth || 1 : 1;
    const far = Math.abs(dx) > Math.max(28, width * 0.06);
    if (far && Math.abs(dx) > Math.abs(dy)) {
      // Flagged so the click that follows a drag can be ignored by whatever it
      // landed on - see RoadScreen, where lifting a swipe over a card would
      // otherwise select that card and undo the swipe.
      this._swiped = true;
      this.move(dx < 0 ? 1 : -1);
      return;
    }

    // NOT A SWIPE, SO IT IS A TAP - and a tap on the left or right of the card
    // moves the selection too. Three ways to change it now: the arrows, a
    // swipe, and the card itself. The middle third does nothing on purpose, so
    // reaching for the confirm button cannot change what is about to be
    // confirmed.
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const x = from.x - this.el.getBoundingClientRect().left;
      if (x < width * 0.34) this.move(-1);
      else if (x > width * 0.66) this.move(1);
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
