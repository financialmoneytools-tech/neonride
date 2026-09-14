import * as THREE from 'three';
import { config } from '../../config.js';
import { addTube, latheFromProfile, partMatrix } from '../../utils/geometry.js';

/**
 * BikeFront - what the rider can see of the machine past the bars: the triple
 * clamp, the tops of the fork legs, and the back of the headlight shell.
 *
 * All of it turns with the steering, which is where it lives on a real bike,
 * so it is built into the same group as the handlebar and needs no logic of
 * its own.
 */

const _matrix = new THREE.Matrix4();

/** Mirrors a configured point onto the requested side. */
function side(point, sign) {
  return [point[0] * sign, point[1], point[2]];
}

/**
 * @param {{frame: import('../../utils/geometry.js').GeometryBuilder}} builders
 */
export function buildBikeFront(builders) {
  const cfg = config.player.rider.front;
  const frame = builders.frame;

  const clamp = cfg.tripleClamp;
  frame.add(
    new THREE.BoxGeometry(clamp.size[0], clamp.size[1], clamp.size[2]),
    partMatrix(1, clamp.offset, null, _matrix),
  );

  const fork = cfg.fork;
  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;
    addTube(frame, side(fork.from, sign), side(fork.to, sign), fork.radius, fork.radialSegments);

    // Cap the top of the leg, which is otherwise an open cylinder end seen from
    // directly above.
    frame.add(
      new THREE.SphereGeometry(fork.radius, fork.radialSegments, 6),
      partMatrix(sign, fork.from, null, _matrix),
    );
  }

  buildHeadlight(frame, cfg.headlight);
}

/**
 * The housing is a lathe profile revolved around the axis of the beam, so what
 * the rider sees is the closed back of the bowl rather than the lit face.
 */
function buildHeadlight(frame, cfg) {
  partMatrix(1, cfg.offset, cfg.rotation, _matrix);

  // The profile is authored as [radius, depth] with the beam pointing forward,
  // so the shell is stood up along -Z before being placed.
  const shell = latheFromProfile(cfg.profile, cfg.segments);
  shell.rotateX(Math.PI / 2);
  frame.add(shell, _matrix);

  const rim = new THREE.CylinderGeometry(
    cfg.rimRadius,
    cfg.rimRadius,
    cfg.rimWidth,
    cfg.rimSegments,
    1,
    true,
  );
  rim.rotateX(Math.PI / 2);
  rim.translate(0, 0, cfg.rimDepth);
  frame.add(rim, _matrix);
}
