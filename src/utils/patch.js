/**
 * patch - apply a partial object over a live one, and be able to take it back.
 *
 * This is the machinery behind every "library + selector + rebuild" in the
 * project: road themes now, and bikes and maps next. It exists so that pattern
 * is written once rather than three times, because three copies of it would be
 * three chances to forget the part that actually matters - the undo.
 *
 * WHY AN UNDO AT ALL. A patch applied over a config that has already been
 * patched does not give you the second theme, it gives you the second theme on
 * top of whatever the first one happened to leave behind. Anything the first
 * set and the second does not mention simply stays, and the bug that produces
 * is the worst kind: everything looks right until somebody switches in an order
 * nobody tried. So a patch records what it displaced and selecting a new one
 * restores the original first. The base config is the only truth; a theme is
 * never more than a layer over it.
 *
 * ARRAYS ARE REPLACED, NOT MERGED. A theme that lists two strip lanes means two
 * lanes, not two lanes merged index-wise over the four that were there. Merging
 * them would leave lanes 3 and 4 in place, which is precisely the surprise this
 * file exists to stop.
 */

/** @param {unknown} value @returns {boolean} true for a plain object, not an array */
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deep-assigns `patch` onto `target`, returning what it displaced in the same
 * shape - so the return value is itself a patch that puts everything back.
 *
 * @param {object} target the live object, usually part of config
 * @param {object} patch the partial to lay over it
 * @returns {object} an undo patch
 */
export function applyPatch(target, patch) {
  const undo = {};
  if (!isPlainObject(patch)) return undo;

  for (const key of Object.keys(patch)) {
    const next = patch[key];
    const current = target[key];

    if (isPlainObject(next) && isPlainObject(current)) {
      undo[key] = applyPatch(current, next);
      continue;
    }

    // Arrays and primitives are replaced wholesale. The old value is kept by
    // reference rather than cloned: nothing else holds it once it has been
    // replaced, and restoring it puts the original object back rather than a
    // copy that merely looks like it.
    undo[key] = current;
    target[key] = next;
  }

  return undo;
}

/**
 * A selector over a library of patches. Applying a new one takes the previous
 * one back FIRST, so entries never stack and the order they are selected in
 * cannot matter.
 *
 * It holds no opinion about what is being selected. Road themes use it today;
 * a bike library and a map library are the same shape.
 */
export class PatchSelector {
  /**
   * @param {object} target the live object the patches are laid over
   * @param {Record<string, object>} library named patches
   * @param {string} initial
   */
  constructor(target, library, initial) {
    this.target = target;
    this.library = library;
    this.name = null;
    this._undo = null;
    this.select(initial);
  }

  /** @returns {string[]} */
  get names() {
    return Object.keys(this.library);
  }

  /**
   * @param {string} name
   * @returns {boolean} false when there is no such entry, and nothing changed
   */
  select(name) {
    if (!Object.prototype.hasOwnProperty.call(this.library, name)) return false;
    if (name === this.name) return true;

    // Back to the base first, always. Laying one patch over another is how a
    // theme ends up wearing half of the one before it.
    if (this._undo) applyPatch(this.target, this._undo);

    this._undo = applyPatch(this.target, this.library[name]);
    this.name = name;
    return true;
  }

  /** Steps to the next entry, wrapping. @returns {string} the new name */
  cycle() {
    const names = this.names;
    const next = names[(names.indexOf(this.name) + 1) % names.length];
    this.select(next);
    return next;
  }

  /** Puts the target back exactly as it was found. */
  restore() {
    if (this._undo) applyPatch(this.target, this._undo);
    this._undo = null;
    this.name = null;
  }
}
