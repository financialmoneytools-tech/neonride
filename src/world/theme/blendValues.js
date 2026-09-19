import * as THREE from 'three';
import { applyPatch } from '../../utils/patch.js';

/**
 * blendValues - how two complete config snapshots are interpolated into one.
 *
 * Split out of world/ThemeBlend.js, which owns the LIFECYCLE of a road change
 * - when one starts, how far through it is, who gets told when it lands. This
 * owns the arithmetic underneath it: what a snapshot of a theme is, and what
 * the halfway point between two of them means for a number, a colour, an
 * array and a boolean. The two are separated because the answers here are
 * subtle and hard won, and they read better away from the state machine.
 */

const _a = new THREE.Color();
const _b = new THREE.Color();
const _out = new THREE.Color();

/**
 * A key that holds a colour.
 *
 * BOTH ENDS, and the suffix-only version was a real bug caught by
 * tools/gate-probe.mjs rather than by reading. The sky writes colour as a
 * PREFIX - `colorBase`, `colorMid`, `colorTop`, `colorLow`, `colorHigh` - and
 * the road writes it as a suffix - `asphaltColor`, `sheenColor`, `bodyColor`.
 * Testing only for the suffix left every sky colour being interpolated as a
 * plain integer, so `0x0e0824` travelled to `0x16232f` through whatever
 * integers lie between them: measured, the dome's channels moved 18818 units of
 * RGB across a transition whose endpoints are 60 apart, lurching up to 429 in a
 * single frame. On screen that is a sky flickering through unrelated colours.
 */
function isColorKey(key) {
  return /(^color)|(color$)/i.test(key);
}

/**
 * Deep-resolves a theme into a complete snapshot of config as that theme would
 * leave it - over the BASELINE, never over what is currently on screen.
 *
 * IT USED TO RESOLVE AGAINST THE LIVE CONFIG, applying the patch and undoing
 * it, and that is the single line this whole file's worst bug came out of.
 * `lerpInto` below writes into `config` directly, and it walks the resolved
 * snapshot, which names EVERY key under sky and world - not just the ones some
 * theme happens to mention. So one blend leaves the live config full of
 * interpolated values, and the next blend then resolves its endpoints over
 * THOSE. Nothing a theme does not name ever finds its way home again, and
 * utils/patch.js's undo cannot bring it back either: the undo restores the keys
 * the patch displaced, and these are the other ones.
 *
 * Resolving over a frozen baseline makes a road's appearance a pure function of
 * its theme. Ride any sequence of roads in any order and Sunset Highway is the
 * same Sunset Highway every time, which is the property the whole file is for.
 * @param {object} theme
 * @param {object} base the no-theme snapshot
 * @returns {object}
 */
export function resolve(theme, base) {
  const snapshot = JSON.parse(JSON.stringify(base));
  applyPatch(snapshot, theme);
  return snapshot;
}

/**
 * Writes the interpolation of `from` and `to` into `target`, in place.
 *
 * Walks `to`, because that is what is being arrived at: a key the destination
 * does not mention is a key this blend has no opinion about, and is left
 * exactly as it is rather than being reset to a base value nobody asked for.
 */
export function lerpInto(target, from, to, t) {
  for (const key of Object.keys(to)) {
    const next = to[key];
    const previous = from ? from[key] : undefined;

    if (Array.isArray(next)) {
      if (!Array.isArray(target[key])) continue;
      for (let i = 0; i < next.length && i < target[key].length; i++) {
        const fromItem = Array.isArray(previous) ? previous[i] : undefined;
        if (next[i] !== null && typeof next[i] === 'object') {
          lerpInto(target[key][i], fromItem, next[i], t);
        } else if (typeof next[i] === 'number' && typeof fromItem === 'number') {
          target[key][i] = fromItem + (next[i] - fromItem) * t;
        } else {
          target[key][i] = next[i];
        }
      }
      continue;
    }

    if (next !== null && typeof next === 'object') {
      if (target[key] === null || typeof target[key] !== 'object') continue;
      lerpInto(target[key], previous, next, t);
      continue;
    }

    if (typeof next === 'number' && typeof previous === 'number') {
      if (isColorKey(key)) {
        // THE LAST FRAME IS ASSIGNED, NOT INTERPOLATED. sRGB -> linear -> sRGB
        // -> hex does not round-trip: measured, a destination of 0xff4f9a came
        // out of a completed blend as 0xf541a2, so a road was a slightly
        // different colour after being blended to than after being loaded
        // into. Over a session of gates that error accumulates.
        if (t >= 1) {
          target[key] = next;
        } else {
          _a.setHex(previous, THREE.SRGBColorSpace).convertSRGBToLinear();
          _b.setHex(next, THREE.SRGBColorSpace).convertSRGBToLinear();
          _out.copy(_a).lerp(_b, t).convertLinearToSRGB();
          target[key] = _out.getHex();
        }
      } else {
        target[key] = previous + (next - previous) * t;
      }
      continue;
    }

    // Anything that is not a number cannot be interpolated. A boolean, a null
    // weather kind, a string: these SWITCH, and they switch at the halfway
    // point, which is where the gate's flash is brightest. That is what the
    // flash is for - docs/THEMES.md says it is there to make the change feel
    // deliberate, and a value that cannot ramp is exactly the thing it covers.
    if (t >= 0.5) target[key] = next;
  }
}
