import * as THREE from 'three';
import { config } from '../config.js';

/**
 * RoadCamera - drives the camera forward along the road at a constant speed.
 *
 * It owns camera.position and camera.rotation outright and rewrites both every
 * frame, and it publishes the travelled distance on the shared loop state.
 * Road, Roadside and Mountains all recycle off that one number, so they cannot
 * drift apart from each other or from the view.
 *
 * PHASE 4: BikePhysics replaces this file. Everything downstream reads
 * state.distance, so the swap is local to main.js.
 */

const _position = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _direction = new THREE.Vector3();

export class RoadCamera {
  /**
   * @param {THREE.Camera} camera
   * @param {import('./road/RoadPath.js').RoadPath} path
   */
  constructor(camera, path) {
    this.camera = camera;
    this.path = path;
    this.distance = config.world.camera.startDistance;

    // YXZ keeps yaw and pitch independent, and it is what FreeLook expects when
    // it adds its offsets on top.
    this.camera.rotation.order = 'YXZ';
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; writes state.distance and state.speed
   */
  update(dt, state) {
    const cfg = config.world.camera;

    this.distance += cfg.speed * dt;
    state.distance = this.distance;
    state.speed = cfg.speed;

    this.path.pointAt(this.distance, _position);
    this.path.pointAt(this.distance + cfg.lookAhead, _aim);

    this.camera.position.set(_position.x, _position.y + cfg.height, _position.z);

    // Aim at a point further down the road rather than along the local tangent:
    // it keeps the road centred on screen through a bend and damps the wobble
    // the elevation noise would otherwise put into the pitch.
    _direction
      .set(_aim.x, _aim.y + cfg.height, _aim.z)
      .sub(this.camera.position)
      .normalize();

    this.camera.rotation.set(
      Math.asin(THREE.MathUtils.clamp(_direction.y, -1, 1)),
      Math.atan2(-_direction.x, -_direction.z),
      0,
    );
  }

  dispose() {
    this.camera = null;
    this.path = null;
  }
}
