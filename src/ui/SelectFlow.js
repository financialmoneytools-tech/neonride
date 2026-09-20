import { config } from '../config.js';
import { BikeScreen } from './BikeScreen.js';
import { ModeScreen } from './ModeScreen.js';
import { RoadScreen } from './RoadScreen.js';
import { LevelScreen } from './LevelScreen.js';
import { MODE } from '../game/Session.js';

/**
 * SelectFlow - title -> mode -> bike -> road -> level -> run, and the way
 * back out.
 *
 * THE LEVEL SCREEN ONLY EXISTS IN STAGED MODE. SONSUZ goes straight from the
 * road to the run, which is why the step is a branch inside `_showRoad`'s
 * confirm rather than another link in a fixed chain - a flow with a step that
 * is sometimes skipped is a flow that has to know which mode it is in
 * somewhere, and here is the one place that already does.
 *
 * One object owns the sequence so main.js wires a beginning and an end rather
 * than four screens that each know what comes next. A screen that knows the
 * screen after it is a screen that cannot be reordered, and there is already a
 * mode screen in front of it, which went in exactly that way.
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
   * @param {(level: number) => void} handlers.onDone the level to start on; 1
   *   in endless mode, where it is ignored
   * @param {(road: string) => object} handlers.recordFor this road's progress
   */
  constructor(parent, selection, handlers) {
    this.parent = parent;
    this.selection = selection;
    this.handlers = handlers;
    this.screen = null;
    /** The road that was live when the flow opened, so BACK can restore it. */
    this._roadOnEntry = selection.road;
  }

  /** Opens at the mode screen, which is the first choice. */
  start() {
    this._roadOnEntry = this.selection.road;
    this._showMode();
  }

  /** True while a selection screen is up. main.js gates presses on it. */
  get open() {
    return !!this.screen;
  }

  _clear() {
    if (this.screen) this.screen.dispose();
    this.screen = null;
  }

  _showMode() {
    this._clear();
    this.screen = new ModeScreen(this.parent, {
      onConfirm: (mode) => {
        this.selection.setMode(mode);
        this._showBike();
      },
      // HIZLI BAŞLA: the mode is still committed, the other two screens are
      // skipped and whatever is stored for them is used.
      onQuick: (mode) => {
        this.selection.setMode(mode);
        this.selection.applyBike();
        this.quickStart();
      },
      // WHAT THE CARDS SAY ABOUT WHAT HAS BEEN DONE. The flow already carries
      // `recordFor` for the road screen; the mode cards want the same records
      // read a different way - the best across all roads rather than one - and
      // the endless best, which lives on the session.
      stats: this.handlers.modeStats,
    }, this.selection.mode);
  }

  _showBike() {
    this._clear();
    this.screen = new BikeScreen(this.parent, {
      onBack: () => this._showMode(),
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
        if (this.selection.mode === MODE.STAGE) this._showLevel();
        else {
          this._clear();
          this.handlers.onDone(1);
        }
      },
      // The active mode, shown here so the last screen before a run says what
      // kind of run it is about to be.
      mode: this.selection.mode,
      // Per-road progress, so each card can say SEVIYE 7 / 10. Only read in
      // staged mode; see ui/RoadScreen.js.
      recordFor: this.handlers.recordFor,
    }, this.selection.road);
  }

  _showLevel() {
    this._clear();
    // THE STARTING ROAD, not the stored one. A mixed run has to ask about a
    // real road's progress, and `startingRoad` is what the run will actually
    // begin on.
    const road = this.selection.startingRoad;
    const record = this.handlers.recordFor(road);
    this.screen = new LevelScreen(this.parent, {
      onBack: () => this._showRoad(),
      onConfirm: (level) => {
        this._clear();
        this.handlers.onDone(level);
      },
      record,
      reached: record.reached,
    });
  }

  /**
   * Skips the whole flow with whatever is already stored.
   *
   * ALWAYS FROM LEVEL ONE. The quick start means "the run I usually have", and
   * the run somebody usually has is the one that counts for a road total. A
   * quick start that silently resumed at level seven would hand out a
   * practice run to a player who asked for a race.
   */
  quickStart() {
    this._clear();
    this.handlers.onDone(1);
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
