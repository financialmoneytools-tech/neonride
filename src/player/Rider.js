import * as THREE from 'three';
import { config } from '../config.js';
import { Input } from '../core/Input.js';
import { GeometryBuilder } from '../utils/geometry.js';
import { createNeonMaterial, createRiderMaterial } from './rider/RiderMaterial.js';
import { buildHandlebar } from './rider/Handlebar.js';
import { buildBikeFront } from './rider/BikeFront.js';
import { buildHands } from './rider/Hands.js';
import { Instruments } from './rider/Instruments.js';

/**
 * Rider - the first person cockpit, bolted to the camera.
 *
 * Every part is built once into a handful of shared geometry builders and
 * merged per material, so the whole rig - bars, grips, levers, mirrors, two
 * gloved hands, forks and headlight - costs seven draw calls.
 *
 * Hierarchy:
 *   camera
 *     rig       - holds the field of view compensation and the bob lag
 *       steering - turns about the raked steering head
 *         parts  - shifted back so that rotation happens about the head
 *
 * Everything visible hangs off `steering`, which is exactly right: on a bike
 * the bars, grips, hands, mirrors, forks, headlight and instruments all turn
 * together. That is also why the hands can never come off the grips.
 */
export class Rider {
  /** @param {THREE.PerspectiveCamera} camera */
  constructor(camera) {
    const cfg = config.player.rider;

    this.camera = camera;

    this.group = new THREE.Group();
    this.group.name = 'Rider';
    camera.add(this.group);

    this.steering = new THREE.Group();
    this.steering.name = 'RiderSteering';
    const pivot = cfg.steering.pivot;
    this.steering.position.set(pivot.x, pivot.y, pivot.z);
    this.group.add(this.steering);

    this.parts = new THREE.Group();
    this.parts.name = 'RiderParts';
    this.parts.position.set(-pivot.x, -pivot.y, -pivot.z);
    this.steering.add(this.parts);

    const builders = {
      frame: new GeometryBuilder(),
      grip: new GeometryBuilder(),
      glove: new GeometryBuilder(),
      mirror: new GeometryBuilder(),
      neonLeft: new GeometryBuilder(),
      neonRight: new GeometryBuilder(),
    };

    buildHandlebar(builders);
    buildBikeFront(builders);
    buildHands(builders);

    this.instruments = new Instruments();
    this.instruments.addFrameTo(builders.frame);
    this.parts.add(this.instruments.mesh);

    const presets = cfg.materials;
    this.materials = {
      frame: createRiderMaterial(presets.frame, 'RiderFrame'),
      grip: createRiderMaterial(presets.grip, 'RiderGrip'),
      glove: createRiderMaterial(presets.glove, 'RiderGlove'),
      mirror: createRiderMaterial(presets.mirror, 'RiderMirror'),
      neonLeft: createNeonMaterial(presets.neonLeft, 'RiderNeonLeft'),
      neonRight: createNeonMaterial(presets.neonRight, 'RiderNeonRight'),
    };

    this.meshes = [];
    for (const key of Object.keys(builders)) {
      const builder = builders[key];
      if (builder.isEmpty) continue;

      const mesh = new THREE.Mesh(builder.build('rider-' + key), this.materials[key]);
      mesh.name = 'Rider_' + key;
      // The rig is never behind the camera, and its bounding sphere is small
      // enough that a near miss on the cull test would blink a hand out.
      mesh.frustumCulled = false;
      this.parts.add(mesh);
      this.meshes.push(mesh);
    }

    this._steer = 0;
    this._axis = new THREE.Vector3(0, Math.cos(cfg.steering.rake), Math.sin(cfg.steering.rake));
    this._axis.normalize();

    this._tanBase = Math.tan(THREE.MathUtils.degToRad(config.camera.fov) * 0.5);

    this.update(0, { steer: 0, speed: 0, rpm: 0, bob: 0 });
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads steer, bob, speed and rpm
   */
  update(dt, state) {
    const cfg = config.player.rider;

    this._steer = Input.damp(this._steer, state.steer || 0, cfg.steering.tau, dt);
    // Turning right swings the bars clockwise seen from above, which is a
    // negative rotation about an axis that points up.
    this.steering.quaternion.setFromAxisAngle(this._axis, -this._steer * cfg.steering.maxAngle);

    // As the field of view opens up with speed, everything in the world shrinks
    // on screen. Pulling the rig in and scaling it by the same factor keeps the
    // cockpit exactly the size it was, so the hands stay planted instead of
    // drifting away from the rider.
    const tanNow = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) * 0.5);
    const scale = 1 + (this._tanBase / tanNow - 1) * cfg.fovCompensation;

    const origin = cfg.origin;
    this.group.scale.setScalar(scale);
    this.group.position.set(
      origin.x * scale,
      origin.y * scale - (state.bob || 0) * cfg.bobLag,
      origin.z * scale,
    );

    this.instruments.update(dt, state);
  }

  dispose() {
    for (let i = 0; i < this.meshes.length; i++) this.meshes[i].geometry.dispose();
    this.meshes.length = 0;

    for (const key of Object.keys(this.materials)) this.materials[key].dispose();

    this.instruments.dispose();

    this.camera.remove(this.group);
    this.group.clear();
    this.steering.clear();
    this.parts.clear();
    this.camera = null;
  }
}
