import * as THREE from 'three';
import { config } from '../config.js';
import { updateFov, updateLean } from './bike/response.js';
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

const TWO_PI = Math.PI * 2;
const NEUTRAL = { steer: 0, throttle: 0, brake: 0 };
const _drift = { steer: 0, throttle: 0, brake: 0 };

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _aimTangent = new THREE.Vector3();
const _aimLateral = new THREE.Vector3();
const _direction = new THREE.Vector3();

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

    this.fov = framing.fov;
    this._appliedFov = framing.fov;

    // YXZ applies roll innermost, so rotation.z is a true roll about the view
    // axis rather than a yaw once the camera is pitched.
    this.camera.rotation.order = 'YXZ';
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads state.input, writes the rest
   */
  update(dt, state) {
    const bike = config.player.bike;
    const cam = config.player.camera;
    const profile = cam.profiles[cam.profile];
    const input = this._effectiveInput(state.input || NEUTRAL, state);

    this._updateSpeed(dt, input, bike);
    const speedRatio = this.speed / bike.maxSpeed;

    this.distance += this.speed * dt;
    this._updateLateral(dt, input, bike, speedRatio);

    // --- bob -------------------------------------------------------------
    const bob = cam.bob;
    const strength = bob.floor + (1 - bob.floor) * speedRatio;
    this._bobPhase += dt * TWO_PI * bob.frequency * strength;
    // The half rate terms mean the pattern only repeats every two cycles, so
    // the phase is wrapped at 4 PI rather than 2 PI.
    if (this._bobPhase > TWO_PI * 2) this._bobPhase -= TWO_PI * 2;

    const bobVertical = Math.sin(this._bobPhase) * bob.vertical * strength;
    const bobLateral = Math.sin(this._bobPhase * 0.5 + 1.1) * bob.lateral * strength;
    const bobRoll = Math.sin(this._bobPhase * 0.5 + 0.4) * bob.roll * strength;

    // --- speed shake -----------------------------------------------------
    const shake = cam.shake;
    this._shakeTime += dt * shake.frequency;
    const shakeAmount = shake.amount * Math.pow(speedRatio, shake.exponent);
    const shakeLateral = this._shakeNoise(this._shakeTime, 0) * shakeAmount;
    const shakeVertical = this._shakeNoise(this._shakeTime, 17.3) * shakeAmount;
    const shakeRoll =
      this._shakeNoise(this._shakeTime * 0.7, 41.7) * shake.roll * Math.pow(speedRatio, shake.exponent);

    // --- placement -------------------------------------------------------
    this.path.frameAt(this.distance, _position, _tangent, _lateral);

    const across = this.lateral + bobLateral + shakeLateral;
    this.camera.position.set(
      _position.x + _lateral.x * across,
      _position.y + cam.height + profile.heightOffset + bobVertical + shakeVertical,
      _position.z + _lateral.z * across,
    );

    // Aim at a point further down the road, carried across by the same lateral
    // offset. Without that shift the view would angle in toward the centre line
    // whenever the bike is off to one side.
    this.path.frameAt(this.distance + cam.lookAhead, _aim, _aimTangent, _aimLateral);
    _direction
      .set(
        _aim.x + _aimLateral.x * across,
        _aim.y + cam.height + profile.heightOffset,
        _aim.z + _aimLateral.z * across,
      )
      .sub(this.camera.position)
      .normalize();

    // The framing pitch trades sky for road. A tall frame with a level camera
    // is half empty sky, so the narrower the aspect the further this tips down.
    const pitch =
      Math.asin(THREE.MathUtils.clamp(_direction.y, -1, 1)) + this.framing.pitch + profile.pitchOffset;
    const yaw = Math.atan2(-_direction.x, -_direction.z);

    updateLean(this, dt, input, bike, yaw);

    this.camera.rotation.set(pitch, yaw, -this.lean + bobRoll + shakeRoll);

    updateFov(this, dt, cam, speedRatio);

    state.distance = this.distance;
    state.speed = this.speed;
    state.speedRatio = speedRatio;
    state.steer = input.steer;
    state.lean = this.lean;
    state.lateral = this.lateral;
    state.bob = bobVertical;
    state.rpm = BikePhysics.revs(speedRatio, bike.gears);
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

  /**
   * Fake rev counter: the speed range is cut into gears, and the needle sweeps
   * across each one, so accelerating reads as a series of pulls rather than one
   * slow climb.
   * @param {number} speedRatio
   * @param {number} gears
   * @returns {number} 0..1
   */
  static revs(speedRatio, gears) {
    const span = 1 / gears;
    const withinGear = (speedRatio % span) / span;
    return 0.25 + 0.75 * withinGear;
  }

  dispose() {
    this.camera = null;
    this.path = null;
  }
}
