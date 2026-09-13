import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * StarTrails - the galactic structure of the starfield.
 *
 * The model is long exposure star trails: a set of concentric curves wound
 * around one common axis, each at its own angular distance from that axis.
 * A star belongs to a line, not to a cluster. It is scattered ALONG its curve
 * with only a small perpendicular jitter, so the field reads as sweeping arcs
 * of dotted stars rather than as isolated blobs.
 *
 * Two properties matter here:
 *
 * - The curves are small circles, not great circles. A great circle contains
 *   the antipode of every point on it, so its elevation distribution is
 *   exactly symmetric about the horizon. That is what made the previous
 *   version look mirrored top to bottom. A small circle at polar angle psi
 *   maps under that reflection to polar angle PI - psi, which is a different
 *   curve, so keeping every psi away from 90 degrees breaks the symmetry.
 *
 * - The density noise only brightens knots along a curve; it never breaks it.
 *   densityFloor sets how continuous the arc stays.
 */

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);

export class StarTrails {
  /**
   * @param {ReturnType<import('../../utils/rng.js').createRng>} rng
   * @param {(x:number, y:number) => number} noise2D
   */
  constructor(rng, noise2D) {
    this.rng = rng;
    this.noise2D = noise2D;

    const t = config.sky.stars.trails;

    // The common axis every curve winds around
    const pole = new THREE.Vector3(
      Math.cos(t.pole.elevation) * Math.cos(t.pole.azimuth),
      Math.sin(t.pole.elevation),
      Math.cos(t.pole.elevation) * Math.sin(t.pole.azimuth),
    ).normalize();

    const poleRotation = new THREE.Quaternion().setFromUnitVectors(UP, pole);
    const tiltEuler = new THREE.Euler();
    const tiltQuaternion = new THREE.Quaternion();

    this.curves = [];
    let weightSum = 0;

    for (let i = 0; i < t.curves; i++) {
      const span = t.curves > 1 ? i / (t.curves - 1) : 0.5;
      const polarAngle =
        t.polarMin + (t.polarMax - t.polarMin) * span + rng.gaussian() * t.polarJitter;

      // Only roughly parallel: each curve gets a small rotation of its own
      tiltEuler.set(
        rng.gaussian() * t.tiltJitter,
        rng.gaussian() * t.tiltJitter,
        rng.gaussian() * t.tiltJitter,
      );
      tiltQuaternion.setFromEuler(tiltEuler);

      // A wider curve is longer, so it needs proportionally more stars to
      // keep the same number of stars per degree of arc.
      const weight = Math.sin(polarAngle) * Math.pow(t.weightFalloff, i);
      weightSum += weight;

      this.curves.push({
        polarAngle,
        weight,
        cumulative: weightSum,
        quaternion: poleRotation.clone().multiply(tiltQuaternion),
        noiseOffset: rng.range(-100, 100),
        wobbleOffset: rng.range(-100, 100),
      });
    }

    this.weightSum = weightSum;
  }

  /**
   * Writes a unit direction lying on one of the trail curves.
   * @param {THREE.Vector3} target
   */
  sample(target) {
    const t = config.sky.stars.trails;

    const roll = this.rng.next() * this.weightSum;
    let curve = this.curves[this.curves.length - 1];
    for (let i = 0; i < this.curves.length; i++) {
      if (roll <= this.curves[i].cumulative) {
        curve = this.curves[i];
        break;
      }
    }

    // Walk along the curve. The density noise decides where the bright knots
    // sit; the floor keeps the arc from ever breaking into separate blobs.
    let longitude = 0;
    for (let attempt = 0; attempt < t.attempts; attempt++) {
      longitude = this.rng.next() * TAU;

      // Sampling on a circle keeps the noise seamless across longitude 0
      const cx = Math.cos(longitude) * t.densityScale + curve.noiseOffset;
      const cz = Math.sin(longitude) * t.densityScale + curve.noiseOffset;

      const raw = 0.5 + 0.5 * this.noise2D(cx, cz);
      const density = t.densityFloor + (1 - t.densityFloor) * Math.pow(raw, t.densityContrast);

      const isLastAttempt = attempt === t.attempts - 1;
      if (this.rng.next() > density && !isLastAttempt) continue;
      break;
    }

    const wx = Math.cos(longitude) * t.wobbleScale + curve.wobbleOffset;
    const wz = Math.sin(longitude) * t.wobbleScale + curve.wobbleOffset;

    // The curve bends gently, and each star sits a hair off the line
    const psi =
      curve.polarAngle + this.noise2D(wx, wz) * t.wobbleAmount + this.rng.gaussian() * t.jitter;

    const sinPsi = Math.sin(psi);
    target.set(sinPsi * Math.cos(longitude), Math.cos(psi), sinPsi * Math.sin(longitude));
    return target.applyQuaternion(curve.quaternion);
  }
}
