import * as THREE from 'three';
import { config } from '../../config.js';
import { updateFov, updateLean } from './response.js';
import { resolveGear } from './gearbox.js';

/**
 * view - turns where the bike is into where the camera is.
 *
 * Split out of BikePhysics.js because that file passed the project's 300 line
 * limit, and the seam is the right one: this is the half that must run AFTER
 * anything allowed to correct the bike's position. While it was inside the
 * move, the recording guard corrected a position the frame had already been
 * drawn from, and the bike appeared to pass through vehicles the physics had
 * threaded correctly.
 *
 * Bob, shake and the aim point all ride on top of the bike's own lateral
 * offset, so the view leans and breathes without the bike having moved.
 */

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _aimTangent = new THREE.Vector3();
const _aimLateral = new THREE.Vector3();
const _direction = new THREE.Vector3();

const TWO_PI = Math.PI * 2;
const NEUTRAL = { steer: 0, throttle: 0, brake: 0 };
const _drive = { gear: 0, rpm: 0 };

/**
 * @param {import('../BikePhysics.js').BikePhysics} rig
 * @param {number} dt
 * @param {object} state shared loop state
 */
export function placeView(rig, dt, state) {

  const bike = config.player.bike;
  const cam = config.player.camera;
  // Resolved per aspect by Framing, not looked up here: the same offsets do
  // not compose at 16:9 and 9:16, and a lookup in two places is how the two
  // copies drift apart.
  const profile = rig.framing.camera;
  const input = rig._input || NEUTRAL;
  const speedRatio = rig.speed / bike.maxSpeed;

  // --- bob -------------------------------------------------------------
  const bob = cam.bob;
  const strength = bob.floor + (1 - bob.floor) * speedRatio;
  rig._bobPhase += dt * TWO_PI * bob.frequency * strength;
  // The half rate terms mean the pattern only repeats every two cycles, so
  // the phase is wrapped at 4 PI rather than 2 PI.
  if (rig._bobPhase > TWO_PI * 2) rig._bobPhase -= TWO_PI * 2;

  const bobVertical = Math.sin(rig._bobPhase) * bob.vertical * strength;
  const bobLateral = Math.sin(rig._bobPhase * 0.5 + 1.1) * bob.lateral * strength;
  const bobRoll = Math.sin(rig._bobPhase * 0.5 + 0.4) * bob.roll * strength;

  // --- speed shake -----------------------------------------------------
  const shake = cam.shake;
  rig._shakeTime += dt * shake.frequency;
  const shakeAmount = shake.amount * Math.pow(speedRatio, shake.exponent);
  const shakeLateral = rig._shakeNoise(rig._shakeTime, 0) * shakeAmount;
  const shakeVertical = rig._shakeNoise(rig._shakeTime, 17.3) * shakeAmount;
  const shakeRoll =
    rig._shakeNoise(rig._shakeTime * 0.7, 41.7) * shake.roll * Math.pow(speedRatio, shake.exponent);

  // --- placement -------------------------------------------------------
  rig.path.frameAt(rig.distance, _position, _tangent, _lateral);

  const across = rig.lateral + bobLateral + shakeLateral;
  rig.camera.position.set(
    _position.x + _lateral.x * across,
    _position.y + cam.height + profile.height + bobVertical + shakeVertical,
    _position.z + _lateral.z * across,
  );

  // Aim at a point further down the road, carried across by the same lateral
  // offset. Without that shift the view would angle in toward the centre line
  // whenever the bike is off to one side.
  rig.path.frameAt(rig.distance + cam.lookAhead, _aim, _aimTangent, _aimLateral);
  _direction
    .set(
      _aim.x + _aimLateral.x * across,
      _aim.y + cam.height + profile.height,
      _aim.z + _aimLateral.z * across,
    )
    .sub(rig.camera.position)
    .normalize();

  // The framing pitch trades sky for road. A tall frame with a level camera
  // is half empty sky, so the narrower the aspect the further this tips down.
  const pitch =
    Math.asin(THREE.MathUtils.clamp(_direction.y, -1, 1)) + rig.framing.pitch + profile.pitch;
  const yaw = Math.atan2(-_direction.x, -_direction.z);

  updateLean(rig, dt, input, bike, yaw);

  rig.camera.rotation.set(pitch, yaw, -rig.lean + bobRoll + shakeRoll);

  updateFov(rig, dt, cam, speedRatio);

  state.steer = input.steer;
  state.lean = rig.lean;
  state.lateral = rig.lateral;
  state.bob = bobVertical;
  // One call for both, so the needle dropping and the number going up cannot
  // disagree - they used to be two functions splitting the speed range the
  // same way, which is two chances to split it differently.
  resolveGear(speedRatio, bike.gearbox, _drive);
  state.rpm = _drive.rpm;
  state.gear = _drive.gear;
}

