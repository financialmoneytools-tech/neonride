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
 *
 * WHEN it resolves is the other half of the job, and it used to be wrong. The
 * only trigger was a window resize, so a resolved value outlived every input it
 * was resolved from: edit a profile from the console or over HMR and the frame
 * kept composing from the previous numbers, with nothing anywhere reporting a
 * problem. That is the same failure the NaN in addTube was - a stale value read
 * as a valid result - and it wants the same answer, which is to make the thing
 * that decides look at what it actually depends on. So refresh() compares every
 * number it reads against the numbers it last resolved from, and re-resolves
 * when any of them has moved. It is called once a frame and costs a dozen
 * comparisons; a resize is then merely one of the things that can change them,
 * rather than the only way the result is ever allowed to change.
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
    /** Extra size for the hand sprites, which are sized to read rather than to scale. */
    this.handScale = 1;
    /** How far the hands are pulled toward the centreline, in rider units. */
    this.handInset = 0;

    /** Name of the nearer profile, for tooling and the overlay. */
    this.name = '';

    /** Everything the last resolve read, and a scratch to compare against. */
    this._resolved = [];
    this._probe = [];

    this.update(1);
  }

  /**
   * Re-resolves if, and only if, something it reads has changed since the last
   * time. Safe to call every frame.
   * @param {number} aspect width over height
   * @returns {Framing} this
   */
  refresh(aspect) {
    // A non-finite aspect is refused rather than resolved from. Blending
    // through one produces a NaN field of view, and NaN does not announce
    // itself: every comparison against it is false, so the fov guard in
    // updateFov silently stops applying anything and the camera holds whatever
    // it had. Keeping the last good framing is both the honest answer and the
    // one that looks like nothing happened.
    if (!Number.isFinite(aspect) || aspect <= 0) return this;

    this._read(aspect, this._probe);
    if (this._probe.length === this._resolved.length) {
      let same = true;
      for (let i = 0; i < this._probe.length; i++) {
        if (this._probe[i] !== this._resolved[i]) { same = false; break; }
      }
      if (same) return this;
    }

    return this.update(aspect);
  }

  /**
   * Resolves unconditionally. refresh() is the one to call in a loop; this is
   * for construction and for anywhere the caller knows it has to happen now.
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
    this.handScale = lower.handScale + (upper.handScale - lower.handScale) * t;
    this.handInset = lower.handInset + (upper.handInset - lower.handInset) * t;

    this.riderOrigin.x = lower.riderOrigin.x + (upper.riderOrigin.x - lower.riderOrigin.x) * t;
    this.riderOrigin.y = lower.riderOrigin.y + (upper.riderOrigin.y - lower.riderOrigin.y) * t;
    this.riderOrigin.z = lower.riderOrigin.z + (upper.riderOrigin.z - lower.riderOrigin.z) * t;

    this.name = t < 0.5 ? lower.name : upper.name;

    this._read(aspect, this._resolved);
    return this;
  }

  /**
   * Every input the resolve depends on, flattened. Compared element by element
   * rather than hashed: a hash of a dozen floats can collide, and a collision
   * here is exactly the failure this is here to stop.
   * @param {number} aspect
   * @param {number[]} out reused, so a frame that changes nothing allocates nothing
   */
  _read(aspect, out) {
    const profiles = config.framing.profiles;
    out.length = 0;
    out.push(aspect);

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      out.push(
        profile.aspect,
        profile.fov,
        profile.fovMax,
        profile.pitch,
        profile.riderOrigin.x,
        profile.riderOrigin.y,
        profile.riderOrigin.z,
        profile.handScale,
        profile.handInset,
      );
    }
  }
}
