import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * StarBands - generates the galactic structure of the starfield.
 *
 * Each band is built around the equator and then rotated into place, so
 * several bands can cross each other. Three noise channels shape one band:
 *   - density decides where the clumps and the empty gaps sit along it
 *   - curve makes the band line snake instead of drawing a flat circle
 *   - width pinches and widens the strand as it runs
 * On top of that a band is split into parallel filaments, which is what makes
 * it read as flowing trails rather than as one fuzzy stripe.
 */

const TAU = Math.PI * 2;

export class StarBands {
  /**
   * @param {ReturnType<import('../../utils/rng.js').createRng>} rng
   * @param {(x:number, y:number) => number} noise2D
   */
  constructor(rng, noise2D) {
    this.rng = rng;
    this.noise2D = noise2D;

    let total = 0;
    for (const band of config.sky.stars.bands) total += band.share;

    // Cumulative shares let one random number choose the band
    let running = 0;
    this.bands = config.sky.stars.bands.map((settings) => {
      running += settings.share / total;
      return {
        settings,
        threshold: running,
        euler: new THREE.Euler(settings.rotation.x, settings.rotation.y, settings.rotation.z),
      };
    });
  }

  /**
   * Writes a unit direction inside one of the bands.
   * @param {THREE.Vector3} target
   */
  sample(target) {
    const roll = this.rng.next();
    let band = this.bands[this.bands.length - 1];
    for (let i = 0; i < this.bands.length; i++) {
      if (roll <= this.bands[i].threshold) {
        band = this.bands[i];
        break;
      }
    }
    return this._sampleBand(band, target);
  }

  _sampleBand(band, target) {
    const s = band.settings;
    const attempts = config.sky.stars.bandAttempts;
    const maxLatitude = config.sky.stars.maxLatitude;

    let longitude = 0;
    let latitude = 0;

    for (let attempt = 0; attempt < attempts; attempt++) {
      longitude = this.rng.next() * TAU;

      // Sampling the noise on a circle keeps it seamless across longitude 0
      const cx = Math.cos(longitude);
      const cz = Math.sin(longitude);

      // Rejection against the density noise carves real gaps into the band
      let density = 0.5 + 0.5 * this.noise2D(cx * s.densityScale, cz * s.densityScale);
      density = Math.pow(density, s.densityContrast);

      const isLastAttempt = attempt === attempts - 1;
      if (this.rng.next() > density && !isLastAttempt) continue;

      // Two octaves of snaking, so the band line never closes into a circle
      const drift =
        this.noise2D(cx * s.curveScale + 17.3, cz * s.curveScale - 9.1) * 0.7 +
        this.noise2D(cx * s.curveScale * 2.7 - 5.1, cz * s.curveScale * 2.7 + 3.4) * 0.3;

      // The strand breathes: thin in places, wide in others
      const widthNoise =
        0.5 + 0.5 * this.noise2D(cx * s.densityScale * 1.7 + 41.0, cz * s.densityScale * 1.7 - 27.0);
      const thickness =
        s.thickness * (1 - s.thicknessVariation + s.thicknessVariation * 2 * widthNoise);

      // Parallel filaments running alongside each other
      const strand = Math.floor(this.rng.next() * s.filaments);
      const offset =
        s.filaments > 1 ? (strand / (s.filaments - 1) - 0.5) * s.filamentSpread : 0;

      latitude = drift * s.curveAmount + offset + this.rng.gaussian() * thickness;
      break;
    }

    latitude = Math.max(-maxLatitude, Math.min(maxLatitude, latitude));

    const cosLat = Math.cos(latitude);
    target.set(cosLat * Math.cos(longitude), Math.sin(latitude), cosLat * Math.sin(longitude));
    return target.applyEuler(band.euler);
  }
}
