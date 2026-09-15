import * as THREE from 'three';
import { config } from '../../../config.js';
import { addTube, partMatrix } from '../../../utils/geometry.js';

/**
 * Controls - everything within reach of the hands.
 *
 * These are the smallest parts on the bike and they carry most of the load,
 * because they sit directly beside the gloves at the bottom of the frame, which
 * is where the eye goes. A bar with nothing on it reads as a prop however good
 * the bodywork behind it is.
 *
 * Clip-ons replace the straight bar: short stubs from the fork tops out to the
 * grips, angled down and back, which is the single clearest "supersport" cue
 * available at this camera. They end exactly where the grips are, because the
 * hands are built from the grip anchor's own frame: move the anchor and the
 * bars, the grips and the hands all follow it together.
 *
 * The bar end weight is drawn into the hand sprite now, along with the grip it
 * caps and the lever beside it.
 *
 * The switch block, the lever perch and the brake master cylinder used to be
 * here too, and are gone. All three sat BELOW the bar line - y -0.062 to -0.090
 * against a clamp that bottoms out at -0.083 - where the fairing and the tank
 * used to be behind them. With those cut back they stood against open road as
 * three grey crates with nothing holding them up, and at this camera they were
 * the most broken-looking thing in the frame. The lever still has its perch;
 * that one is up at bar level where a perch belongs, and Handlebar.js builds
 * it.
 */

const _matrix = new THREE.Matrix4();

function side(point, sign) {
  return [point[0] * sign, point[1], point[2]];
}

/**
 * @param {Object<string, import('../../../utils/geometry.js').GeometryBuilder>} builders
 */
export function buildControls(builders) {
  const cfg = config.player.rider.machine.controls;
  const frame = builders.frame;

  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;

    const clipOn = cfg.clipOn;
    addTube(frame, side(clipOn.from, sign), side(clipOn.to, sign), clipOn.radius, clipOn.radialSegments);

  }
}
