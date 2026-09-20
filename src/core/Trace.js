/**
 * Trace - who wrote `state.lateral` and `steer` this frame, read off the
 * running game rather than off a reproduction of it.
 *
 * ================= WHY THIS EXISTS =================
 *
 * A fault was reported from a phone - tilt mode, `steer` stuck at 0.98,
 * `lateral` pinned at +5.90, which is `player.bike.lateralLimit` exactly -
 * and four separate harness reproductions came back green: desktop keys,
 * phone touch drag, phone tilt at both landscape angles, and the densest
 * level with full traffic. Reproductions that pass while the game is
 * unplayable are worth nothing, and several rounds of them cost more than
 * this file does.
 *
 * So this instruments the real thing. `lateral` has FOUR writers - the
 * physics, two in the escape guard, and the view - and a value that will not
 * come down is one of them winning every frame. Printing all four, with what
 * each one wrote, says which in one screenshot. The steer half says the same
 * for the value feeding it: which of keyboard, tilt, touch or gamepad
 * produced `raw.steer`, and what the tilt maths was doing when it did.
 *
 * ================= WHAT IT COSTS =================
 *
 * Nothing that matters and nothing that allocates. Every slot is preallocated
 * and written as a number; the strings are built ONLY by ui/StatsOverlay.js,
 * only while the overlay is actually up, and the overlay is already off in
 * god mode and capture mode - so no recording can contain any of it.
 *
 * ================= WHY FRAME STAMPS, NOT A RESET =================
 *
 * A reset needs a place that is guaranteed to run before every writer, and
 * getting that wrong silently blanks the evidence - which is the same class
 * of fault as the check that could not go red. Each write is stamped with
 * `state.frame` instead, and the overlay shows only the slots stamped with
 * the frame it is drawing. Nothing has to run first, and a writer that did
 * NOT run this frame is visibly absent rather than showing a stale value.
 */

/** The four things that assign `state.lateral`, in the order they can run. */
export const LATERAL = {
  PHYSICS: 0,
  GUARD_EASE: 1,
  GUARD_SAVE: 2,
  VIEW: 3,
};

const LATERAL_NAMES = ['phys', 'gEase', 'gSave', 'view'];
const COUNT = LATERAL_NAMES.length;

const values = new Float64Array(COUNT);
const frames = new Int32Array(COUNT).fill(-1);
const order = new Int32Array(COUNT);
let seq = 0;

/**
 * Records one write of `state.lateral`.
 * @param {number} slot one of LATERAL
 * @param {number} value what was written
 * @param {number} frame state.frame
 */
export function markLateral(slot, value, frame) {
  values[slot] = value;
  frames[slot] = frame;
  order[slot] = ++seq;
}

/**
 * The steer chain, as plain numbers on one preallocated object.
 *
 * `from` is which branch of core/Input.js produced `raw`, which is the single
 * most useful field here: a phone in tilt mode that reads `key` or `pad` is a
 * different fault from one that reads `tilt`.
 */
export const steer = {
  frame: -1,
  from: '-',
  key: 0,
  tilt: 0,
  touch: 0,
  pad: 0,
  raw: 0,
  value: 0,
  // What the physics actually steered with, which is not always what Input
  // produced - see _effectiveInput in player/BikePhysics.js.
  used: 0,
  target: 0,
  keys: '',
};

/** The tilt maths, when tilt is the source. */
export const tilt = {
  frame: -1,
  raw: 0,
  neutral: 0,
  delta: 0,
  dead: 0,
  range: 0,
  out: 0,
};

/**
 * One line naming every writer of `state.lateral` this frame and its value,
 * newest last. Built only when the overlay draws.
 * @param {number} frame
 * @returns {string}
 */
export function lateralLine(frame) {
  let out = '';
  let last = '-';
  let lastOrder = -1;
  for (let i = 0; i < COUNT; i++) {
    if (frames[i] !== frame) continue;
    out += (out ? '  ' : '') + LATERAL_NAMES[i] + ' '
      + (values[i] >= 0 ? '+' : '') + values[i].toFixed(2);
    if (order[i] > lastOrder) {
      lastOrder = order[i];
      last = LATERAL_NAMES[i];
    }
  }
  if (!out) return 'lat  (nobody wrote lateral this frame)';
  return 'lat  ' + out + '   last ' + last;
}
