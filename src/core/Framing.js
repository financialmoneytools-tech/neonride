import { config } from '../config.js';

/**
 * Framing - resolves the aspect aware framing profile for the current frame
 * shape, and hands the result to whoever needs it.
 *
 * Everything that has to change between 16:9 and 9:16 is resolved in one place:
 * the field of view and its speed ramp, the downward pitch that trades sky for
 * road, and where the cockpit sits. BikePhysics and Rider read the result and
 * neither of them knows what shape the window is.
 *
 * Profiles are interpolated rather than switched. Dragging a browser window
 * between shapes passes through every aspect in between, and a hard switch
 * would pop the cockpit and the horizon on the way.
 */
export class Framing {
  constructor() {
    /** Current frame aspect, width over height. */
    this.aspect = 1;

    /** Vertical field of view at rest, in degrees. */
    this.fov = 75;
    /** Vertical field of view at full speed, in degrees. */
    this.fovMax = 90;
    /** Radians of downward pitch added on top of the road following aim. */
    this.pitch = 0;
    /** Cockpit placement in camera space. */
    this.riderOrigin = { x: 0, y: 0, z: -1 };

    /** Name of the nearer profile, for tooling and the overlay. */
    this.name = '';

    this.update(1);
  }

  /**
   * @param {number} aspect width over height
   * @returns {Framing} this
   */
  update(aspect) {
    const profiles = config.framing.profiles;
    this.aspect = aspect;

    let lower = profiles[0];
    let upper = profiles[profiles.length - 1];

    for (let i = 0; i < profiles.length - 1; i++) {
      if (aspect >= profiles[i].aspect && aspect <= profiles[i + 1].aspect) {
        lower = profiles[i];
        upper = profiles[i + 1];
        break;
      }
    }

    // Outside the authored range both ends resolve to the same profile, which
    // makes the blend a no-op and clamps rather than extrapolating.
    if (aspect <= profiles[0].aspect) upper = profiles[0];
    if (aspect >= profiles[profiles.length - 1].aspect) lower = profiles[profiles.length - 1];

    const span = upper.aspect - lower.aspect;
    const t = span > 0 ? (aspect - lower.aspect) / span : 0;

    this.fov = lower.fov + (upper.fov - lower.fov) * t;
    this.fovMax = lower.fovMax + (upper.fovMax - lower.fovMax) * t;
    this.pitch = lower.pitch + (upper.pitch - lower.pitch) * t;

    this.riderOrigin.x = lower.riderOrigin.x + (upper.riderOrigin.x - lower.riderOrigin.x) * t;
    this.riderOrigin.y = lower.riderOrigin.y + (upper.riderOrigin.y - lower.riderOrigin.y) * t;
    this.riderOrigin.z = lower.riderOrigin.z + (upper.riderOrigin.z - lower.riderOrigin.z) * t;

    this.name = t < 0.5 ? lower.name : upper.name;
    return this;
  }
}
