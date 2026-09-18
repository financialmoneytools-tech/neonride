import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * The rider camera sits at eye height above the road, and this camera's `up`
 * is measured from the ROAD - so the eye height comes back off first. Without
 * it every offset here would silently be 2.35 m higher than it reads.
 */
const riderHeightBias = config.player.camera.height;

/**
 * A third person chase camera, behind and above the bike.
 *
 * ================= IT FOLLOWS, IT DOES NOT DRIVE =================
 *
 * player/BikePhysics.js decides where the bike is, and it does that by writing
 * a transform onto whatever camera it was handed. The probe hands it a HIDDEN
 * camera - the rider's eye, exactly where the first person view would be - and
 * this chases that. So the physics is untouched, the bike goes where it has
 * always gone, and the only thing that has changed is where the picture is
 * taken from.
 *
 * That matters beyond tidiness: it means the collision box, the lateral clamp,
 * the lean and the speed are all still the shipped ones, and a chase camera
 * cannot quietly become a second physics system the way a camera that
 * integrates its own position does.
 *
 * ================= THE LAG IS ON THE YAW, NOT ON THE POSITION ==============
 *
 * The obvious spring - damp the camera's WORLD position toward a point behind
 * the bike - is wrong, and wrong in a way that only shows up at speed. An
 * exponential smoother chasing a target that is itself moving never arrives; it
 * settles at a steady-state error of roughly `speed * lag` behind it. At 139
 * units a second and a 0.16 second lag that is twenty-two metres of extra
 * distance, so the bike shrinks to a dot in the middle of the frame and the
 * faster you go the further away it gets. Measured, in the first shot this
 * probe ever took.
 *
 * So the distance behind the bike is RIGID, and what is damped is the yaw the
 * offset is built from. That gives the thing the spring was wanted for - the
 * camera swinging wide through a corner and settling after it, the bike leading
 * into the turn - with no speed dependent drift at all, because the offset is
 * recomputed from the bike's current position every frame.
 *
 * The FOV ramp is SMALL and slow. That is the brief's "avoid arcade-style
 * effects", and it is also the motion comfort rules in CLAUDE.md: a field of
 * view that opens under acceleration is one of the strongest triggers there is,
 * and the one nobody thinks to name.
 */
export class ChaseCamera {
  /**
   * @param {THREE.PerspectiveCamera} camera the one actually rendered
   * @param {THREE.Object3D} rider the transform BikePhysics writes
   * @param {object} [options]
   */
  constructor(camera, rider, options = {}) {
    this.camera = camera;
    this.rider = rider;

    // Metres behind, above, and how far ahead of the bike it looks. A chase
    // camera that looks AT the bike frames the bike; one that looks past it
    // frames the road, which is what is being ridden.
    this.back = options.back === undefined ? 5.4 : options.back;
    this.up = options.up === undefined ? 2.05 : options.up;
    this.lookAhead = options.lookAhead === undefined ? 14 : options.lookAhead;
    this.lookUp = options.lookUp === undefined ? 0.55 : options.lookUp;

    // Seconds for the camera's heading to catch up with the bike's. This is
    // the only damping in here; see the class note for why it is not on the
    // position.
    this.yawLag = options.yawLag === undefined ? 0.22 : options.yawLag;
    // How much of the bike's sideways position the camera copies. Below 1 the
    // camera hangs back toward the middle of the road as the bike moves out,
    // which is what stops the frame sliding bodily sideways every time the
    // rider changes lane.
    this.lateralFollow = options.lateralFollow === undefined ? 0.82 : options.lateralFollow;

    // THE FOV RAMP. Four degrees across the whole speed range, eased in over
    // most of a second. The shipped game's own ramp is larger; this is smaller
    // on purpose, because a realistic camera is a lens and a lens does not zoom
    // when the rider opens the throttle.
    this.baseFov = config.framing.profiles[0].fov;
    this.fovGain = options.fovGain === undefined ? 4.0 : options.fovGain;
    this.fovLag = options.fovLag === undefined ? 0.8 : options.fovLag;
    this._fov = this.baseFov;

    this._target = new THREE.Vector3();
    this._yaw = 0;
    this._started = false;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads speedRatio
   */
  update(dt, state) {
    const rider = this.rider;

    // THE HEADING, DAMPED. Through the shortest way round, so a bike whose yaw
    // crosses PI does not send the camera the long way about.
    const riderYaw = rider.rotation.y;
    if (!this._started) {
      this._started = true;
      this._yaw = riderYaw;
    } else {
      let delta = riderYaw - this._yaw;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      this._yaw += delta * (1 - Math.exp(-dt / this.yawLag));
    }

    const sin = Math.sin(this._yaw);
    const cos = Math.cos(this._yaw);

    // RIGID DISTANCE BEHIND, recomputed from where the bike is NOW. The bike
    // faces -Z at yaw 0, so behind it is +Z.
    this.camera.position.set(
      rider.position.x + sin * this.back,
      rider.position.y - riderHeightBias + this.up,
      rider.position.z + cos * this.back,
    );
    // THE LATERAL HANG BACK, ABOUT THE ROAD AND NOT ABOUT THE WORLD.
    // `rider.position.x` is a world coordinate that carries the road's own
    // curve in it - this path wanders 70 metres either way - so hanging back
    // by a fraction of THAT would walk the camera off the road every time the
    // road turned. `state.lateral` is the bike's offset from the path centre,
    // which is the only part that should be followed loosely.
    const hang = (state.lateral || 0) * (1 - this.lateralFollow);
    // Right of the bike: forward is (-sin, 0, -cos), so right is (cos, 0, -sin).
    this.camera.position.x -= cos * hang;
    this.camera.position.z += sin * hang;

    this._target.set(
      rider.position.x - sin * this.lookAhead,
      rider.position.y - riderHeightBias + this.lookUp,
      rider.position.z - cos * this.lookAhead,
    );

    // The horizon stays level. A camera that rolled with the lean would put the
    // world on a slope, which is an arcade effect and a comfort problem both.
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this._target);

    const wanted = this.baseFov + this.fovGain * (state.speedRatio || 0);
    this._fov += (wanted - this._fov) * (1 - Math.exp(-dt / this.fovLag));
    if (Math.abs(this.camera.fov - this._fov) > 0.01) {
      this.camera.fov = this._fov;
      this.camera.updateProjectionMatrix();
    }
  }
}
