import * as THREE from 'three';
import { config } from '../../config.js';
import { addTube, latheFromProfile, partMatrix } from '../../utils/geometry.js';

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
 * Partial tube for a fender or a tyre: a cylinder cut down to an arc and laid
 * on its side so the arc runs over the top of the wheel.
 */
function arc(radius, width, thetaStart, thetaLength, segments) {
  const geometry = new THREE.CylinderGeometry(
    radius,
    radius,
    width,
    segments,
    1,
    true,
    thetaStart,
    thetaLength,
  );
  // Built around +Y; the wheel spins about X, so stand it up on that axis.
  geometry.rotateZ(Math.PI / 2);
  return geometry;
}

/**
 * @param {{frame: import('../../utils/geometry.js').GeometryBuilder,
 *          tank: import('../../utils/geometry.js').GeometryBuilder,
 *          neonLeft: import('../../utils/geometry.js').GeometryBuilder}} builders
 */
export function buildBikeFront(builders) {
  const cfg = config.player.rider.machine;

  buildTank(builders.tank, builders.neonLeft, cfg.tank);
  buildSteeringSide(builders.frame, cfg);
}

/** Fuel tank top, filler cap and the neon seam. Chassis, not steering. */
function buildTank(tank, neon, cfg) {
  const body = new THREE.SphereGeometry(1, cfg.segments[0], cfg.segments[1]);
  body.scale(cfg.radii[0], cfg.radii[1], cfg.radii[2]);
  tank.add(body, partMatrix(1, cfg.offset, cfg.rotation, _matrix));

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

/** Everything that turns with the bars. */
function buildSteeringSide(frame, cfg) {
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

    const slider = fork.slider;
    addTube(
      frame,
      side(slider.from, sign),
      side(slider.to, sign),
      slider.radius,
      slider.radialSegments,
    );
  }

  buildHeadlight(frame, cfg.headlight);
  buildCowl(frame, cfg.cowl);
  buildFenderAndWheel(frame, cfg);
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

/** Fender arc, and the tyre showing either side of it. */
function buildFenderAndWheel(frame, cfg) {
  const fender = cfg.fender;
  frame.add(
    arc(fender.radius, fender.width, fender.thetaStart, fender.thetaLength, fender.segments),
    partMatrix(1, fender.centre, null, _matrix),
  );
  // Inner skin, so the fender reads as a shell rather than as paper.
  frame.add(
    arc(
      fender.radius - fender.thickness,
      fender.width,
      fender.thetaStart,
      fender.thetaLength,
      fender.segments,
    ),
    partMatrix(1, fender.centre, null, _matrix),
  );

  const wheel = cfg.wheel;
  frame.add(
    arc(wheel.radius, wheel.width, wheel.thetaStart, wheel.thetaLength, wheel.segments),
    partMatrix(1, wheel.centre, null, _matrix),
  );
}
