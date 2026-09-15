import * as THREE from 'three';
import { config } from '../../config.js';
import { addTube, latheFromProfile, partMatrix } from '../../utils/geometry.js';
import { loftShell } from '../../utils/loft/shell.js';
import { buildFrontEnd } from './bike/FrontEnd.js';

/**
 * BikeFront - what the rider can see of the machine: the top of the fuel tank,
 * the triple clamp, the upper fork and its sliders, the headlight and its cowl,
 * the top of the front fender, and the sliver of tyre either side of it.
 *
 * Nothing here is a part a rider could not see from the saddle. No frame, no
 * engine, no rear end - none of it would ever reach the frame.
 *
 * One split matters: the tank is bolted to the CHASSIS and the rest hangs off
 * the steering head. So the tank goes into its own builder, which Rider parents
 * to a group that does not turn, and the bars can swing against a tank that
 * stays put - which is what the movement looks like on a real bike.
 */

const _matrix = new THREE.Matrix4();

/** Mirrors a configured point onto the requested side. */
function side(point, sign) {
  return [point[0] * sign, point[1], point[2]];
}


/**
 * @param {{frame: import('../../utils/geometry.js').GeometryBuilder,
 *          tank: import('../../utils/geometry.js').GeometryBuilder,
 *          neonLeft: import('../../utils/geometry.js').GeometryBuilder}} builders
 */
export function buildBikeFront(builders) {
  const cfg = config.player.rider.machine;

  if (cfg.tank.visible) buildTank(builders.tank, builders.neonLeft, cfg.tank);
  buildSteeringSide(builders.frame, cfg);
  // Fork legs below the clamp, the fender and the wheel. Their own file: they
  // are the parts only the cinematic profile and a 9:16 frame ever see, and
  // they carry enough geometry to push this one past the 300 line limit.
  if (cfg.lowerFront) buildFrontEnd(builders);
}

/**
 * Fuel tank top, filler cap and the neon seam. Chassis, not steering.
 * Off by default - see the note on `visible` in the machine config.
 */
function buildTank(tank, neon, cfg) {
  const [rx, ry, rz] = cfg.radii;
  const stations = cfg.stations.map((station) => ({
    z: station.z * rz,
    offset: [station.offset[0] * rx, station.offset[1] * ry],
    scale: [station.scale[0] * rx, station.scale[1] * ry],
  }));
  tank.add(loftShell(cfg.section, stations), partMatrix(1, cfg.offset, cfg.rotation, _matrix));

  const cap = cfg.cap;
  tank.add(
    new THREE.CylinderGeometry(cap.radius, cap.radius * 0.92, cap.height, cap.segments),
    partMatrix(1, [cfg.offset[0] + cap.offset[0], cfg.offset[1] + cap.offset[1], cfg.offset[2] + cap.offset[2]], cfg.rotation, _matrix),
  );

  const seam = cfg.seam;
  neon.add(
    new THREE.BoxGeometry(seam.size[0], seam.size[1], seam.size[2]),
    partMatrix(1, [cfg.offset[0] + seam.offset[0], cfg.offset[1] + seam.offset[1], cfg.offset[2] + seam.offset[2]], cfg.rotation, _matrix),
  );
}

/**
 * Everything that turns with the bars, down as far as the bar line.
 *
 * The split here is the camera's, not the bike's. The clamp and the fork tops
 * are what the bars are bolted to, they sit at the bar line, and they are
 * always built. Everything BELOW them - the legs, the fender, the wheel, the
 * headlight and its cowl - is behind `lowerFront` and lives in bike/FrontEnd.js.
 *
 * The one part built both ways is the stub of fork between the clamp and where
 * FrontEnd's stanchion starts. With lowerFront off it has to stop somewhere or
 * the bars float; with it on, FrontEnd carries the leg the rest of the way and
 * the stub would be a second cylinder inside the first, so it is skipped.
 */
function buildSteeringSide(frame, cfg) {
  const clamp = cfg.tripleClamp;
  frame.add(
    new THREE.BoxGeometry(clamp.size[0], clamp.size[1], clamp.size[2]),
    partMatrix(1, clamp.offset, null, _matrix),
  );

  const fork = cfg.forkTop;
  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;

    // Cap the top of the leg, which is otherwise an open cylinder end seen from
    // directly above.
    frame.add(
      new THREE.SphereGeometry(fork.radius, fork.radialSegments, 6),
      partMatrix(sign, fork.from, null, _matrix),
    );

    if (cfg.lowerFront) continue;
    addTube(frame, side(fork.from, sign), side(fork.to, sign), fork.radius, fork.radialSegments);
  }

  if (!cfg.lowerFront) return;
  buildHeadlight(frame, cfg.headlight);
  buildCowl(frame, cfg.cowl);
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

/** Cowl around the headlight. Open at both ends: only its back is ever seen. */
function buildCowl(frame, cfg) {
  partMatrix(1, cfg.offset, cfg.rotation, _matrix);

  const shell = latheFromProfile(cfg.profile, cfg.segments);
  shell.rotateX(Math.PI / 2);
  frame.add(shell, _matrix);

  const lip = cfg.lip;
  const ring = new THREE.CylinderGeometry(lip.radius, lip.radius, lip.width, lip.segments, 1, true);
  ring.rotateX(Math.PI / 2);
  ring.translate(0, 0, lip.depth);
  frame.add(ring, _matrix);
}

