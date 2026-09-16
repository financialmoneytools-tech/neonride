import * as THREE from 'three';
import { config } from '../config.js';
import { Input } from '../core/Input.js';
import { GeometryBuilder } from '../utils/geometry.js';
import { createNeonMaterial, createRiderMaterial } from './rider/RiderMaterial.js';
import { buildHandlebar } from './rider/Handlebar.js';
import { buildControls } from './rider/bike/Controls.js';
import { buildFairing } from './rider/bike/Fairing.js';
import { buildBikeFront } from './rider/BikeFront.js';
import { createHands } from './rider/Hands.js';
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
 *
 * Placement comes from the aspect aware framing profile, not from a fixed
 * config value, so the cockpit composes at 16:9 and 9:16 alike.
 *
 * The hands are the one part this file does not build. They come from
 * createHands, aligned to a named grip anchor, and Rider only ever adds their
 * group, ticks them and disposes them - so the primitive hands can be swapped
 * for a rigged model without anything here changing. See rider/Hands.js.
 */
export class Rider {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {import('../core/Framing.js').Framing} framing
   */
  constructor(camera, framing) {
    const cfg = config.player.rider;

    this.camera = camera;
    this.framing = framing;

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

    // Everything the rider's hands are on - bars, grips, levers, mirrors, the
    // fork top, and the hands themselves - scaled together by one number.
    //
    // It is one number because the whole assembly was oversized against the
    // bodywork rather than any part of it being wrong on its own: measured, the
    // two gloves covered 11.7 per cent of a 16:9 frame against 5.9 for the
    // entire fairing, while the fist was correctly proportioned to the grip it
    // held - smaller than life, if anything. The hand was not too big for the
    // bar; the bar was too big for the bike. Scaling the parts individually
    // would have meant thirty coupled numbers across two files and a hand that
    // no longer fits its own grip.
    //
    // The cluster is deliberately OUTSIDE it. It is read, not held, so its size
    // is set by legibility rather than by the rider's reach.
    this.hardware = new THREE.Group();
    this.hardware.name = 'RiderHardware';
    this.hardware.scale.setScalar(cfg.hardwareScale);
    this.parts.add(this.hardware);

    // The tank is bolted to the chassis, not to the steering head, so it hangs
    // beside the steering group rather than inside it. Turning the bars then
    // swings the fork against a tank that stays put, the way it does on a bike.
    this.chassis = new THREE.Group();
    this.chassis.name = 'RiderChassis';
    this.group.add(this.chassis);

    const builders = {
      frame: new GeometryBuilder(),
      dark: new GeometryBuilder(),
      mirror: new GeometryBuilder(),
      tank: new GeometryBuilder(),
      paint: new GeometryBuilder(),
      vent: new GeometryBuilder(),
      neonLeft: new GeometryBuilder(),
      // The tyre. Its own material rather than the frame's, because the frame
      // carries a rim light strong enough to draw an outline round every convex
      // shape it is given, and on a tyre that outline is the whole part: a
      // wheel lit that way reads as a pale hoop rather than as rubber.
      rubber: new GeometryBuilder(),
      // The fender's paint and its neon seam. Same materials as the tank's, but
      // they cannot share the tank's merged meshes: the tank is bolted to the
      // chassis and the fender turns with the bars, and a merged mesh can only
      // be parented to one group.
      lowerPaint: new GeometryBuilder(),
      lowerNeon: new GeometryBuilder(),
      // The windscreen panel, for the same reason and in the other direction.
      // It shared the mirrors' builder, which put it on the BARS: a screen that
      // swung with the steering while its own lit edge - built into neonLeft,
      // on the chassis - stayed put, and drew 8 per cent larger than the panel
      // besides, because the bars carry hardwareScale and the chassis does not.
      // Nothing showed it while the screen was a small dark egg. Widening it to
      // fill the mirror gap would have made both halves of that obvious.
      screenPanel: new GeometryBuilder(),
      // Mirror stalks and housings. Same material as the frame, different
      // PARENT: a mirror is bolted to the fairing, so it must not turn with the
      // bars, and a merged mesh can only be parented once.
      mirrorMount: new GeometryBuilder(),
    };

    // Which group each merged mesh belongs to. The tank and the bodywork are
    // bolted to the chassis and stay put; everything else turns with the bars.
    // The vent pockets are cut into the bodywork, so they go wherever it goes -
    // parented anywhere else they would shear off their own panel on a turn.
    const parents = {
      tank: this.chassis,
      paint: this.chassis,
      vent: this.chassis,
      neonLeft: this.chassis,
      // With its lit edge, which lives in neonLeft. A windscreen is bolted to
      // the fairing, not to the bars.
      screenPanel: this.chassis,
      // And the mirrors beside it, for the same reason. `mirror` is the glass,
      // `mirrorMount` the stalk and housing; both are fairing furniture.
      mirror: this.chassis,
      mirrorMount: this.chassis,
    };

    buildHandlebar(builders);
    buildBikeFront(builders);
    buildFairing(builders);
    buildControls(builders);

    this.instruments = new Instruments();
    this.parts.add(this.instruments.group);

    const presets = cfg.materials;
    this.materials = {
      frame: createRiderMaterial(presets.frame, 'RiderFrame'),
      dark: createRiderMaterial(presets.dark, 'RiderDark'),
      mirror: createRiderMaterial(presets.mirror, 'RiderMirror'),
      tank: createRiderMaterial(presets.frame, 'RiderTank'),
      // Bodywork is the one painted surface on the bike. Everything else is
      // graphite; this is what stops the cockpit reading as a set of shapes.
      paint: createRiderMaterial(cfg.machine.paint, 'RiderPaint'),
      vent: createRiderMaterial(presets.vent, 'RiderVent'),
      neonLeft: createNeonMaterial(presets.neonLeft, 'RiderTankTrim'),
      rubber: createRiderMaterial(presets.rubber, 'RiderTyre'),
      lowerPaint: createRiderMaterial(cfg.machine.paint, 'RiderLowerPaint'),
      lowerNeon: createNeonMaterial(presets.neonLeft, 'RiderFenderTrim'),
      // The same glass preset the mirror faces use; only the parent differs.
      screenPanel: createRiderMaterial(presets.mirror, 'RiderScreen'),
      mirrorMount: createRiderMaterial(presets.frame, 'RiderMirrorStalk'),
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
      (parents[key] || this.hardware).add(mesh);
      this.meshes.push(mesh);
    }

    // The hands align themselves to the anchor; this file never places them.
    this.hands = createHands(cfg.anchors.rightGrip, {
      steering: this.steering,
      framing: this.framing,
    });
    this.hardware.add(this.hands.group);

    this._steer = 0;
    this._axis = new THREE.Vector3(0, Math.cos(cfg.steering.rake), Math.sin(cfg.steering.rake));
    this._axis.normalize();

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
    // Screen share of an object is tan(its half angle) / tan(half the fov), so
    // keeping the cockpit the same size on screen as the view opens up means
    // growing it in step with tan(fov / 2). Only the SIZE may scale: scaling the
    // distance as well leaves x / d untouched and does nothing at all, which is
    // what this used to do.
    //
    // The base is the current aspect's RESTING field of view, so a speed ramp is
    // compensated while an aspect change is not - that is what lets the rig
    // genuinely reframe between 16:9 and 9:16.
    const tanBase = Math.tan(THREE.MathUtils.degToRad(this.framing.fov) * 0.5);
    const tanNow = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) * 0.5);
    const scale = 1 + (tanNow / tanBase - 1) * cfg.fovCompensation;

    // The camera profile shifts the whole cockpit relative to the eye, which is
    // how the cinematic view brings the tank, the fork and the wheel into shot.
    // Resolved by Framing, per aspect, because the two aspects do not start
    // from the same distance and a shared push composes for neither.
    const profile = this.framing.camera.rider;
    const origin = this.framing.riderOrigin;
    this.group.scale.setScalar(scale);
    this.group.position.set(
      origin.x + profile.x,
      origin.y + profile.y - (state.bob || 0) * cfg.bobLag,
      origin.z + profile.z,
    );

    this.hands.update(dt, state);
    this.instruments.update(dt, state);
  }

  dispose() {
    for (let i = 0; i < this.meshes.length; i++) this.meshes[i].geometry.dispose();
    this.meshes.length = 0;

    for (const key of Object.keys(this.materials)) this.materials[key].dispose();

    this.hands.dispose();
    this.instruments.dispose();

    this.camera.remove(this.group);
    this.group.clear();
    this.hardware.clear();
    this.chassis.clear();
    this.steering.clear();
    this.parts.clear();
    this.camera = null;
  }
}
