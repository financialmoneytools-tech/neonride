import { config } from '../config.js';
import { applyPatch } from '../utils/patch.js';

/**
 * Selection - what the player chose, and where it is kept.
 *
 * The bike and the road are two stored strings and nothing more. This owns
 * reading them, writing them, validating them against what actually exists, and
 * applying the bike's patch - so main.js wires screens to a model rather than
 * to localStorage, and the URL parameters, the stored values and the screens
 * all arrive through one door.
 *
 * VALIDATED ON THE WAY IN, EVERY TIME. A stored name is user data that has
 * outlived the build that wrote it: a bike that has been renamed or a road that
 * has been removed must fall back rather than leave the game pointing at
 * nothing. That is not defensive programming, it is the normal case the first
 * time a theme is renamed.
 */
export class Selection {
  constructor() {
    this.bike = read(config.bikeStorageKey, config.bike);
    this.road = read(config.themeStorageKey, config.theme);
    // MIXED is a request to keep changing rather than a road, so it is valid
    // here and never handed to the patch selector as a theme name.
    if (!config.bikes[this.bike]) this.bike = config.bike;
    if (this.road !== config.MIXED && !config.themes[this.road]) this.road = config.theme;
    /** Undo for the fitted bike's patch, so bikes never stack. */
    this._undo = null;
  }

  /** @returns {boolean} whether anything has ever been chosen on this device. */
  get chosen() {
    return has(config.bikeStorageKey) && has(config.themeStorageKey);
  }

  /** The road to BUILD. The mixed road has to start somewhere real. */
  get startingRoad() {
    return this.road === config.MIXED ? firstTheme() : this.road;
  }

  /** @returns {boolean} whether the road keeps changing as the run goes on. */
  get mixed() {
    return this.road === config.MIXED;
  }

  /**
   * Fits a bike: stores the name and applies its patch over config.
   * @param {string} name
   */
  setBike(name) {
    if (!config.bikes[name]) return;
    this.bike = name;
    write(config.bikeStorageKey, name);
    this.applyBike();
  }

  /**
   * Applies the fitted bike's patch, undoing the previous one first so two
   * bikes can never stack into a machine that is neither.
   */
  applyBike() {
    if (this._undo) applyPatch(config, this._undo);
    const bike = config.bikes[this.bike];
    this._undo = bike && bike.patch ? applyPatch(config, bike.patch) : null;
  }

  /** @param {string} name a theme key, or config.MIXED */
  setRoad(name) {
    if (name !== config.MIXED && !config.themes[name]) return;
    this.road = name;
    write(config.themeStorageKey, name);
  }
}

/** The first built road, which is where a mixed run starts. */
function firstTheme() {
  const names = Object.keys(config.themes);
  return names.includes(config.theme) ? config.theme : names[0];
}

/**
 * localStorage can throw outright - a browser with site data blocked, or
 * private mode on some versions - so every access is guarded and the game runs
 * perfectly well without it. Same shape as Comfort, Controls and Session.
 */
function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : raw;
  } catch (error) {
    return fallback;
  }
}

function has(key) {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch (error) {
    return false;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    // A choice that cannot be kept is not a reason to refuse to apply it.
  }
}
