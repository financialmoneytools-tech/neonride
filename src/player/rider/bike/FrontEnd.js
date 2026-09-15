import * as THREE from 'three';
import { config } from '../../../config.js';
import { addTube, alignMatrix } from '../../../utils/geometry.js';
import { buildWheel } from './FrontWheel.js';

/**
 * FrontEnd - the fork, the fender and the front wheel.
 *
 * Split out of BikeFront.js on the project's 300 line rule, and the seam is the
 * camera: everything here is below the bar line, which means it is only ever
 * seen from the cinematic profile and from the bottom of a 9:16 frame. The
 * cockpit above the bars is a different problem tuned against a different eye.
 *
 * WHAT WAS HERE BEFORE. Two arcs - a CylinderGeometry cut down to its top and
 * laid on its side - one for the fender and one standing in for the tyre. That
 * was built on the assumption that a first person camera never sees the front
 * wheel, which is true of a real sport bike and true of this one at 16:9, and
 * false at 9:16: measured, every sample point on the wheel falls inside the
 * tall profile's frustum and three quarters of them are unobstructed. The
 * vertical frame is the one the footage is cut for.
 *
 * The wheel itself is next door in FrontWheel.js, on the project's 300 line
 * rule. The seam is a real one either way: a wheel is a stack of surfaces of
 * revolution about the axle and the fork and fender are not.
 *
 * THE FENDER IS A SWEPT SECTION, not a cut cylinder. Its cross section runs
 * ACROSS the fender - lower edge, up onto the top plane, over the creased
 * spine, and down the other side - and is carried round the arc. That is the
 * same construction the fairing uses, for the same reason: beside panels with
 * creases on them a bent tube reads as a bent tube.
 */

const _matrix = new THREE.Matrix4();

/** Mirrors a configured point onto the requested side. */
function side(point, sign) {
  return [point[0] * sign, point[1], point[2]];
}

/**
 * @param {{frame: import('../../../utils/geometry.js').GeometryBuilder,
 *          rubber: import('../../../utils/geometry.js').GeometryBuilder,
 *          lowerPaint: import('../../../utils/geometry.js').GeometryBuilder,
 *          lowerNeon: import('../../../utils/geometry.js').GeometryBuilder}} builders
 */
export function buildFrontEnd(builders) {
  const cfg = config.player.rider.machine.lower;
  if (!cfg) return;

  // The split between `frame` and `dark` is polish, not part. A stanchion and
  // a wheel rim are machined and lit down their length; a slider, a lug, a
  // caliper and a spoke are cast and are not. The frame preset's rim light runs
  // strongly enough to draw an edge down anything cylindrical, so putting the
  // cast parts through it made the darkest things on the bike the brightest
  // things in the frame.
  buildFork(builders.frame, builders.dark, cfg.fork);
  buildFender(builders.lowerPaint, builders.lowerNeon, builders.dark, cfg.fender);
  buildWheel(builders, cfg.wheel);
}

/** Stanchion, slider, dust seal, axle lug and axle stub, mirrored per side. */
function buildFork(frame, dark, cfg) {
  for (const sign of [1, -1]) {
    // Dark, like the rest of the leg. A real stanchion is polished and would
    // earn the frame preset's lit edge, but a fork built that way came out as
    // the brightest thing in a frame whose subject is the bodywork: two pale
    // blue tubes hanging under the fairing, drawing the eye straight past the
    // machine. The one highlight the leg keeps is the seal ring below, which is
    // where a photograph puts it anyway.
    const stanchion = cfg.stanchion;
    addTube(dark, side(stanchion.from, sign), side(stanchion.to, sign),
      stanchion.radius, stanchion.radialSegments);

    const slider = cfg.slider;
    addTube(dark, side(slider.from, sign), side(slider.to, sign),
      slider.radius, slider.radialSegments);

    // The bright ring at the mouth of the slider. Without it the step from one
    // diameter to the other reads as a mistake rather than as a seal.
    const seal = cfg.seal;
    const sealGeometry = new THREE.CylinderGeometry(
      seal.radius, seal.radius, seal.length, seal.segments, 1);
    frame.add(sealGeometry, alignMatrix(
      side(seal.offset, sign),
      // Aimed down the leg, so the ring sits square on it rather than level.
      [slider.to[0] - slider.from[0], slider.to[1] - slider.from[1],
        slider.to[2] - slider.from[2]],
      _matrix,
    ));

    const lug = cfg.lug;
    addTube(dark, side(lug.from, sign), side(lug.to, sign),
      lug.radius, lug.radialSegments, lug.endRadius);

    // The axle itself, showing outboard of the lug.
    const stub = cfg.axleStub;
    addTube(dark,
      [stub.from * sign, lug.to[1], lug.to[2]],
      [stub.to * sign, lug.to[1], lug.to[2]],
      stub.radius, stub.segments);
  }
}

/**
 * The fender: a cross section carried round an arc, with an inner skin so it
 * reads as a shell, a neon seam along the crease and a stay each side.
 */
function buildFender(paint, neon, dark, cfg) {
  paint.add(sweptArc(cfg, cfg.section, 0), _matrix.identity());
  // Inner skin, offset inward and wound the other way, so the underside of the
  // fender is a surface rather than the back of a single sheet.
  //
  // UNPAINTED, and that is not a detail. The rider looks at the front wheel
  // from behind and slightly above, straight into the fender's rear opening, so
  // the inside of it is most of what is seen of the part. Painted the same red
  // as the outside it stopped reading as a mudguard over a wheel and became a
  // red drum hanging between the fork legs.
  dark.add(sweptArc(cfg, cfg.section, -cfg.thickness, true), _matrix.identity());

  // The seam sits ON the spine crease, which is the section's middle point.
  const spine = cfg.section[(cfg.section.length - 1) / 2];
  const seam = cfg.seam;
  neon.add(sweptArc(cfg, [
    [-seam.width / 2, spine[1] + seam.lift, 1],
    [0, spine[1] + seam.lift + 0.001, 1],
    [seam.width / 2, spine[1] + seam.lift, 1],
  ], 0), _matrix.identity());

  const stay = cfg.stay;
  for (const sign of [1, -1]) {
    addTube(dark, side(stay.from, sign), side(stay.to, sign),
      stay.radius, stay.radialSegments);
  }
}

/**
 * Sweeps a cross section round the fender's arc.
 *
 * The section is [x across, height above the arc radius, hard]. A HARD point is
 * duplicated so the two faces meeting there get their own normals and the edge
 * stays an edge; a soft one is shared and rounds. That is the same rule the
 * loft utilities use, kept here rather than reached for because this sweeps
 * around an arc instead of along a spine and the two do not share a frame.
 *
 * @param {object} cfg the fender config
 * @param {number[][]} section
 * @param {number} inset moves the whole section toward the axle
 * @param {boolean} [flip] reverses the winding, for an inner skin
 */
function sweptArc(cfg, section, inset, flip = false) {
  const points = [];
  for (let i = 0; i < section.length; i++) {
    const [x, h, hard] = section[i];
    points.push([x, h + inset]);
    // A hard point appears twice, so the faces either side of it do not share
    // a normal. The first and last are already ends and need no double.
    if (hard && i > 0 && i < section.length - 1) points.push([x, h + inset]);
  }

  const rings = cfg.segments + 1;
  const across = points.length;
  const positions = new Float32Array(rings * across * 3);
  const normals = new Float32Array(rings * across * 3);
  const indices = [];

  for (let r = 0; r < rings; r++) {
    const theta = cfg.thetaStart + cfg.thetaLength * (r / cfg.segments);
    // theta 0 points at +Z - BEHIND the axle, since forward is -Z - and a
    // quarter turn is straight up, which is the convention the arc this
    // replaced inherited from CylinderGeometry through its rotateZ. Getting it
    // the other way round builds a fender that sweeps from the top down the
    // back of the wheel instead of over it, and the giveaway is the bounding
    // box: it comes out tall and only 170mm deep where the wheel is 410.
    const uy = Math.sin(theta);
    const uz = Math.cos(theta);

    for (let a = 0; a < across; a++) {
      const [x, h] = points[a];
      const radius = cfg.radius + h;
      const o = (r * across + a) * 3;
      positions[o] = cfg.centre[0] + x;
      positions[o + 1] = cfg.centre[1] + uy * radius;
      positions[o + 2] = cfg.centre[2] + uz * radius;
    }
  }

  // Normals from the faces, so a duplicated point picks up only the face on
  // its own side and the crease survives.
  for (let r = 0; r < cfg.segments; r++) {
    for (let a = 0; a < across - 1; a++) {
      const i0 = r * across + a;
      const i1 = i0 + 1;
      const i2 = i0 + across;
      const i3 = i2 + 1;
      if (flip) indices.push(i0, i1, i2, i1, i3, i2);
      else indices.push(i0, i2, i1, i1, i2, i3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
