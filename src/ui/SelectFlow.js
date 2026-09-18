import { config } from '../config.js';
import { BikeScreen } from './BikeScreen.js';
import { RoadScreen } from './RoadScreen.js';

/**
 * SelectFlow - title -> bike -> road -> run, and the way back out.
 *
 * One object owns the sequence so main.js wires a beginning and an end rather
 * than four screens that each know what comes next. A screen that knows the
 * screen after it is a screen that cannot be reordered, and there is already a
 * mode screen going in front of this one in the next phase.
 *
 * THE WORLD IS ALREADY BUILT AND ALREADY RUNNING behind these. That is what
 * makes the bike preview the actual cockpit rather than a picture of one, and
 * it is only possible because a road can now be changed live - see
 * world/ThemeBlend.js. Before that, picking a road meant reloading the page,
 * which would have thrown away the audio gesture the title card exists to
 * collect.
 *
 * NOTHING HERE STARTS A RUN DIRECTLY. It calls back, and main.js decides what
 * beginning a run means. Two entry points into the same rules is how the
 * control banner ended up attached to one of them and not the other.
 */
export class SelectFlow {
  /**
   * @param {HTMLElement} parent
   * @param {import('../game/Selection.js').Selection} selection
   * @param {object} handlers
   * @param {(key: string) => void} handlers.onBikePreview repaint the cockpit
   * @param {(road: string) => void} handlers.onRoadPreview blend the world to it
   * @param {() => void} handlers.onDone
   */
  constructor(parent, selection, handlers) {
    this.parent = parent;
    this.selection = selection;
    this.handlers = handlers;
    this.screen = null;
    /** The road that was live when the flow opened, so BACK can restore it. */
    this._roadOnEntry = selection.road;
  }

  /** Opens at the bike screen. */
  start() {
    this._roadOnEntry = this.selection.road;
    this._showBike();
  }

  /** True while a selection screen is up. main.js gates presses on it. */
  get open() {
    return !!this.screen;
  }

  _clear() {
    if (this.screen) this.screen.dispose();
    this.screen = null;
  }

  _showBike() {
    this._clear();
    this.screen = new BikeScreen(this.parent, {
      onPreview: (key) => {
        // Previewed, not committed. Looking at a bike repaints the cockpit so
        // the choice can be seen; only confirming stores it.
        this.handlers.onBikePreview(key);
      },
      onConfirm: (key) => {
        this.selection.setBike(key);
        this._showRoad();
      },
    }, this.selection.bike);
  }

  _showRoad() {
    this._clear();
    this.screen = new RoadScreen(this.parent, {
      onBack: () => {
        // Put the world back the way it was before anything was previewed, or
        // stepping back out of the road screen leaves the road it was last
        // hovering over.
        this.handlers.onRoadPreview(this._roadOnEntry);
        this._showBike();
      },
      onPreview: (key) => this.handlers.onRoadPreview(key),
      onConfirm: (key) => {
        this.selection.setRoad(key);
        this._clear();
        this.handlers.onDone();
      },
    }, this.selection.road);
  }

  /** Skips the whole flow with whatever is already stored. */
  quickStart() {
    this._clear();
    this.handlers.onDone();
  }

  dispose() {
    this._clear();
  }
}

/**
 * Whether the flow should be offered at all.
 *
 * God mode and `?god=1` never see it: a recording must not have a menu in it,
 * and tools/shot.mjs, god-run.mjs and bot-run.mjs all drive that path.
 * @param {boolean} wantsGod
 * @returns {boolean}
 */
export function flowWanted(wantsGod) {
  return !wantsGod && config.ui.select !== undefined;
}
