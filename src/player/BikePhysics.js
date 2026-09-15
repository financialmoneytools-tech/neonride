import * as THREE from 'three';
import { config } from '../config.js';
import { updateFov, updateLean } from './bike/response.js';
import { placeView } from './bike/view.js';
import { Input } from '../core/Input.js';
import { createRng } from '../utils/rng.js';
import { createNoise2D } from '../utils/noise.js';

/**
 * BikePhysics - everything that decides where the camera is and which way it
 * is pointing: speed along the road, drift across it, lean, bob and field of
 * view.
 *
 * The road itself is on rails. Steering does not change where the road goes; it
 * moves the bike across the road, leans it, and turns the bars. That keeps the
 * generated path and the rider completely independent of each other, which is
 * what lets Road, Roadside and Mountains all recycle off one number.
 *
 * Published on the shared loop state: distance, speed, speedRatio, steer, lean,
 * lateral, rpm and bob. Everything downstream reads those and nothing reaches back in.
 */

const NEUTRAL = { steer: 0, throttle: 0, brake: 0 };
const _drift = { steer: 0, throttle: 0, brake: 0 };


export class BikePhysics {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {import('../world/road/RoadPath.js').RoadPath} path
   * @param {import('../core/Framing.js').Framing} framing
   */
  constructor(camera, path, framing) {
    const bike = config.player.bike;

    this.camera = camera;
    this.path = path;
    this.framing = framing;

    // Shake is noise driven, not random per frame: white noise at 60 Hz strobes
    // rather than shakes. Three lanes of one 2D noise keep the axes independent.
    this._shakeNoise = createNoise2D(createRng(4177));
    this._shakeTime = 0;

    this.distance = bike.startDistance;
    this.speed = bike.startSpeed;
    this.lateral = 0;
    this.lean = 0;

    this._lateralTarget = 0;
    this._yawRate = 0;
    this._previousYaw = null;
    this._bobPhase = 0;
    this._input = null;

    this.fov = framing.fov;
    this._appliedFov = framing.fov;

    // YXZ applies roll innermost, so rotation.z is a true roll about the view
    // axis rather than a yaw once the camera is pitched.
    this.camera.rotation.order = 'YXZ';
  }

  /**
   * Moves the bike. Does NOT place the camera - see place().
   *
   * The two are separate because something has to be able to correct where the
   * bike is after it has moved and before the view is built from it. The
   * recording guard does exactly that, and while this was one method the guard
   * ran after the camera had already been placed for the frame: the physics
   * threaded the gap correctly and the view went straight through the vehicle,
   * because the view was built from the position the guard was about to
   * replace. Measured, that was 38 apparent pass-throughs a minute with the
   * collision test - correctly - reporting nothing at all.
   *
   * @param {number} dt
   * @param {object} state shared loop state; reads state.input
   */
  step(dt, state) {
    const bike = config.player.bike;
    const input = this._effectiveInput(state.input || NEUTRAL, state);
    this._input = input;

    this._updateSpeed(dt, input, bike);
    const speedRatio = this.speed / bike.maxSpeed;

    this.distance += this.speed * dt;
    this._updateLateral(dt, input, bike, speedRatio);

    state.distance = this.distance;
    state.speed = this.speed;
    state.speedRatio = speedRatio;
    state.lateral = this.lateral;
    // The throttle applied, not the one requested - see _updateSpeed.
    state.drive = this.drive;
  }

  /**
   * Builds the view from wherever the bike now is.
   *
   * Anything that corrects the bike's position must run between step() and
   * this, or it will not be what the camera shows.
   *
   * @param {number} dt
   * @param {object} state shared loop state
   */
  place(dt, state) {
    placeView(this, dt, state);
  }

  /**
   * Both halves, for anything that has nothing to correct in between.
   * @param {number} dt
   * @param {object} state
   */
  update(dt, state) {
    this.step(dt, state);
    this.place(dt, state);
  }

  /**
   * Capture mode feeds in a slow weave so hands off footage still drifts across
   * the road. It is injected as steer rather than applied to the position, so
   * the bars turn and the bike leans with it exactly as if it were being ridden.
   * @param {object} input
   * @param {object} state
   * @returns {object}
   */
  _effectiveInput(input, state) {
    const capture = config.capture;
    if (!capture.enabled || !capture.drift.enabled) return input;

    const phase = (state.elapsed || 0) * ((Math.PI * 2) / capture.drift.period);
    _drift.steer = THREE.MathUtils.clamp(
      input.steer + Math.sin(phase) * capture.drift.amount,
      -1,
      1,
    );
    _drift.throttle = input.throttle;
    _drift.brake = input.brake;
    return _drift;
  }

  /**
   * Knocks the speed down on contact. Traffic calls this rather than writing to
   * the shared state, because a collision is an event and the state is a
   * snapshot - routing it through the state would either lose hits or apply one
   * twice depending on listener order.
   * @param {number} factor speed is multiplied by this
   */
  applyImpact(factor) {
    this.speed *= factor;
  }

  /**
   * Shoves the bike sideways. Traffic uses this to push the player clear of
   * whatever was hit; without it the player can match a vehicle's speed while
   * inside it and never get out.
   * @param {number} amount world units, positive to the rider's right
   */
  knockAside(amount) {
    const bike = config.player.bike;
    this._lateralTarget = THREE.MathUtils.clamp(
      this._lateralTarget + amount,
      -bike.lateralLimit,
      bike.lateralLimit,
    );
    this.lateral = THREE.MathUtils.clamp(
      this.lateral + amount * 0.5,
      -bike.lateralLimit,
      bike.lateralLimit,
    );
  }

  /**
   * Puts the bike at an exact place across the road.
   *
   * The steering target is moved with it, not just the position. Moving the
   * position alone leaves the bike asking to be somewhere it is not, so it
   * spends the following frames pulling back toward the line it was taken off,
   * and that argument reads as a stutter.
   *
   * Only the recording guard uses this - see autopilot/Guard.js. Nothing in
   * ordinary play may place the bike; that is what steering is for.
   *
   * @param {number} value world units, positive to the rider's right
   */
  placeLateral(value) {
    const bike = config.player.bike;
    const placed = THREE.MathUtils.clamp(value, -bike.lateralLimit, bike.lateralLimit);
    this.lateral = placed;
    this._lateralTarget = placed;
  }

  /** Throttle against brake and drag. Drag is what actually caps the speed. */
  _updateSpeed(dt, input, bike) {
    const throttle = Math.max(input.throttle, bike.throttleFloor);

    // Kept, because the throttle the bike is ACTUALLY given is not the throttle
    // the rider asked for and anything downstream that cares needs the real
    // one. `throttleFloor` means a hands-off bike is pulling 42 per cent, and
    // the engine note read the raw input instead: with nothing held it sounded
    // like a permanent overrun while the bike accelerated underneath it.
    this.drive = throttle;

    const drive = throttle * bike.acceleration;
    const braking = input.brake * bike.brakeForce;
    const drag = bike.dragQuadratic * this.speed * this.speed + bike.dragLinear * this.speed;

    this.speed = THREE.MathUtils.clamp(
      this.speed + (drive - braking - drag) * dt,
      0,
      bike.maxSpeed,
    );
  }

  /** Drift across the road, bounded and self centring. */
  _updateLateral(dt, input, bike, speedRatio) {
    // Positive steer is a turn to the right and the road's lateral axis also
    // points right, so the two agree in sign. They were subtracted here while
    // the axis was documented as pointing left, which steered the bike into the
    // opposite side of the road from the one the bars and the lean showed.
    const authority = 0.35 + 0.65 * speedRatio;
    this._lateralTarget += input.steer * bike.lateralSpeed * authority * dt;

    if (Math.abs(input.steer) < 0.05) {
      this._lateralTarget = Input.damp(this._lateralTarget, 0, bike.lateralReturnTau, dt);
    }

    this._lateralTarget = THREE.MathUtils.clamp(
      this._lateralTarget,
      -bike.lateralLimit,
      bike.lateralLimit,
    );
    this.lateral = Input.damp(this.lateral, this._lateralTarget, bike.lateralTau, dt);
  }

  dispose() {
    this.camera = null;
    this.path = null;
  }
}
