import * as THREE from 'three';
import { Input } from '../../core/Input.js';

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
  const rawRate = dt > 0 ? (yaw - rig._previousYaw) / dt : 0;
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
  rig.fov = Input.damp(rig.fov, base + (top - base) * speedRatio, cam.fovTau, dt);

  if (Math.abs(rig.fov - rig._appliedFov) > 0.02) {
    rig._appliedFov = rig.fov;
    rig.camera.fov = rig.fov;
    rig.camera.updateProjectionMatrix();
  }
}
