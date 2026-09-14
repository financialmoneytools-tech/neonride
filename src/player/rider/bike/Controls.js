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
 * available at this camera. They end exactly where the grips already are,
 * because the grip anchor may not move - the hands are posed against it and
 * baked, so bars come to the hands rather than the other way round.
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
  const dark = builders.mirror;

  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;

    const clipOn = cfg.clipOn;
    addTube(frame, side(clipOn.from, sign), side(clipOn.to, sign), clipOn.radius, clipOn.radialSegments);

    // The perch the lever is carried on. The lever itself belongs to the
    // handlebar section and is built there; what was missing is the thing it
    // comes out of, without which it starts in mid air beside the glove.
    const perch = cfg.perch;
    frame.add(
      new THREE.BoxGeometry(perch.size[0], perch.size[1], perch.size[2]),
      partMatrix(sign, perch.offset, null, _matrix),
    );

    const sw = cfg.switchgear;
    frame.add(
      new THREE.BoxGeometry(sw.size[0], sw.size[1], sw.size[2]),
      partMatrix(sign, sw.offset, null, _matrix),
    );

    // Closes the outer end of the grip, which otherwise stops dead.
    const end = cfg.barEnd;
    const weight = new THREE.CylinderGeometry(end.radius, end.radius, end.length, 14);
    weight.rotateZ(Math.PI * 0.5);
    dark.add(weight, partMatrix(sign, end.offset, null, _matrix));
  }

  // Right side only, the way a bike has it: the front brake master cylinder.
  const master = cfg.master;
  frame.add(
    new THREE.BoxGeometry(master.size[0], master.size[1], master.size[2]),
    partMatrix(1, master.offset, null, _matrix),
  );
}
