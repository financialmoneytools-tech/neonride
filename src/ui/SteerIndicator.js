import { config } from '../config.js';

/**
 * SteerIndicator - the one thing that explains the touch steering.
 *
 * ================= WHY IT EXISTS =================
 *
 * Touch steering is a DRAG, not a button: the left half of the screen steers,
 * where the thumb lands is straight ahead, and the lock comes from how far it
 * is dragged. That is a good control and it is completely invisible. A thumb
 * held still on the left does NOTHING - measured, `steer` 0.000 and `lateral`
 * 0.00, with no throttle either, so the bike does not move at all - and
 * nothing on screen said a drag was wanted. Somebody holding the corner and
 * getting a dead motorcycle has been told the game is broken.
 *
 * ControlHints says WHERE the bands are. This says WHAT THE BAND DOES, and it
 * can only do that while a thumb is actually down, because the whole idea is
 * "here is your zero, here is how far you have moved from it".
 *
 * ================= WHAT IT DRAWS =================
 *
 *   the anchor   a ring at the landing point. This is straight ahead, and it
 *                is the part that teaches the control: it is somewhere the
 *                rider just chose, not somewhere the game decided.
 *   the track    how far the drag has to go for full lock, both ways.
 *   the knob     where the thumb is now, and it rides the track.
 *
 * THE TRACK IS SIZED FROM `touch.dragRange`, the same value core/Input.js
 * divides by. That is the rule ControlHints already follows for the brake: a
 * picture drawn from its own number teaches the wrong gesture the moment the
 * two drift, which is worse than drawing nothing.
 *
 * POINTER-EVENTS NONE, all of it, for the reason ControlHints gives - every
 * touch is classified from coordinates in core/Input.js, and an element that
 * could be pressed would be a second, disagreeing source of truth.
 */
export class SteerIndicator {
  /** @param {HTMLElement} parent */
  constructor(parent) {
    this.el = document.createElement('div');
    this.el.className = 'steer-pad';
    this.el.hidden = true;

    this.track = document.createElement('div');
    this.track.className = 'steer-track';

    this.anchor = document.createElement('div');
    this.anchor.className = 'steer-anchor';

    this.knob = document.createElement('div');
    this.knob.className = 'steer-knob';

    this.el.append(this.track, this.anchor, this.knob);
    parent.appendChild(this.el);

    this._mode = config.controls.defaultMode;
    this._visible = true;
    this._shown = false;
  }

  /** @param {'tilt'|'touch'} mode */
  setMode(mode) {
    this._mode = mode;
  }

  /**
   * Hidden outright for god mode, capture and while a card is up - the same
   * gate ControlHints takes, and for the same reason: nothing of ours in a
   * recording, and no driving furniture over a selection screen.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this._visible = visible;
  }

  /**
   * @param {import('../core/Input.js').Input} input
   */
  update(input) {
    const cfg = config.controls.indicator;
    const pointer = input.steerPointer;
    const wanted = !!pointer && this._visible && cfg.enabled && this._mode === 'touch';

    if (!wanted) {
      if (this._shown) {
        this.el.hidden = true;
        this._shown = false;
      }
      return;
    }

    // SIZED FROM THE SAME NUMBER INPUT DIVIDES BY, every frame rather than
    // once: the frame can change width under a rotating phone or an address
    // bar, and a track measured at construction would then be a lie about a
    // range that is defined as a fraction of the CURRENT width.
    const span = window.innerWidth * config.controls.touch.dragRange;
    const y = pointer.y;

    this.track.style.left = `${pointer.startX - span}px`;
    this.track.style.width = `${span * 2}px`;
    this.track.style.top = `${y}px`;

    this.anchor.style.left = `${pointer.startX}px`;
    this.anchor.style.top = `${y}px`;

    // CLAMPED TO THE TRACK, because the steer itself is clamped. A knob that
    // kept travelling past full lock would say the drag was still doing
    // something when it had stopped.
    const x = Math.max(pointer.startX - span, Math.min(pointer.startX + span, pointer.x));
    this.knob.style.left = `${x}px`;
    this.knob.style.top = `${y}px`;

    if (!this._shown) {
      this.el.hidden = false;
      this._shown = true;
    }
  }

  dispose() {
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
}
