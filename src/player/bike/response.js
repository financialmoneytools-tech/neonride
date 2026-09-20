import * as THREE from 'three';
import { Input } from '../../core/Input.js';
import { motionScale } from '../../core/Comfort.js';
import { wrapRadians } from '../../utils/angle.js';

/**
 * response - how the bike answers a steering input, beyond where it goes.
 *
 * Split out of BikePhysics.js only because that file passed the project's 300
 * line limit. These two belong together: both are about what the RIDE feels
 * like rather than where the bike is, and both are damped rather than set, so
 * neither can ever step.
 *
 * They take the physics object rather than being methods on it, so nothing here
 * can quietly grow state of its own.
 */

/**
 * Lean is positive to the right and is applied as a negative camera roll.
 * It comes from two places: what the rider is asking for, and how hard the
 * road itself is turning, so a long sweeper banks the view even hands off.
 */
export function updateLean(rig, dt, input, bike, yaw) {
  if (rig._previousYaw === null) rig._previousYaw = yaw;
  // WRAPPED, the same fault core/Controls.js shipped with. `yaw` comes from
  // atan2 and so lives in (-PI, PI]: the frame the road's heading crosses that
  // seam, a plain subtraction reads about 2*PI of turn in one frame instead of
  // a fraction of a degree, which is a yaw RATE two orders of magnitude out
  // and a lean spike straight into the camera roll.
  //
  // Found by audit rather than by report - the road's heading stays near zero
  // in normal riding, so this one has probably never fired. It is the same
  // line of code as the bug that made the game unplayable, and leaving it
  // because it has not bitten yet is how the first one survived for months.
  const rawRate = dt > 0 ? wrapRadians(yaw - rig._previousYaw) / dt : 0;
  rig._previousYaw = yaw;
  rig._yawRate = Input.damp(rig._yawRate, rawRate, bike.curveTau, dt);

  // A rising yaw is a turn to the left, which leans left, which is negative.
  const target = THREE.MathUtils.clamp(
    input.steer * bike.leanFromSteer - rig._yawRate * bike.leanFromCurve,
    -bike.leanMax,
    bike.leanMax,
  );
  rig.lean = Input.damp(rig.lean, target, bike.leanTau, dt);
}

/** Field of view opens up with speed, and only touches the projection when
 *  the change is big enough to see. */
export function updateFov(rig, dt, cam, speedRatio) {
  const base = rig.framing.fov;
  const top = rig.framing.fovMax;
  // A field of view that opens up under acceleration is one of the strongest
  // speed cues there is and one of the strongest nausea triggers, and it is the
  // one almost nobody thinks to name when they say a game made them unwell. The
  // comfort setting keeps the ramp rather than removing it: at rest the framing
  // is unchanged either way, and it is the CHANGE that does the damage.
  const ramp = speedRatio * motionScale('fovRamp');
  rig.fov = Input.damp(rig.fov, base + (top - base) * ramp, cam.fovTau, dt);

  if (Math.abs(rig.fov - rig._appliedFov) > 0.02) {
    rig._appliedFov = rig.fov;
    rig.camera.fov = rig.fov;
    rig.camera.updateProjectionMatrix();
  }
}
