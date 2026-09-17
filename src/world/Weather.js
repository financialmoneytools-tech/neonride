import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { motionScale } from '../core/Comfort.js';

/**
 * Weather - snow, rain and dust, all out of one buffer.
 *
 * LINE SEGMENTS, NOT POINTS. A point sprite is an axis aligned square, so it
 * cannot streak, and a streak is most of what weather at speed looks like: the
 * same flake is a dot when the bike is stopped and a forty centimetre dash at
 * two hundred. Each particle is one segment from where it is to where it just
 * was, which tilts with the real velocity for free and costs two vertices.
 * One draw call for the whole sky.
 *
 * NOTHING IS SPAWNED OR DESTROYED. The particles live in a box kept centred on
 * the camera and wrap when they leave it, the same trick the sky group uses to
 * let the rider travel forever. The flow through that box is the bike's own
 * velocity, so weather streams past at the speed of the world rather than at a
 * speed of its own.
 *
 * STARS STAY VISIBLE THROUGH IT. The box is small and near - tens of metres,
 * not the fifteen hundred the sky dome sits at - so weather is a near field
 * layer between the rider and a sky that is never dimmed. That is a rule from
 * the concept, not an accident of the numbers: the galactic sky is what the
 * game is, and a theme that loses it is a different game.
 *
 * IT GOES THROUGH motionScale('weather'). See config/comfort.js - this is the
 * strongest nausea trigger in the project, and the scale is read live every
 * frame rather than baked, so the toggle works on the next frame.
 */

const _forward = new THREE.Vector3();
const _flow = new THREE.Vector3();

export class Weather {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(scene, camera) {
    const cfg = config.world.weather;

    this.scene = scene;
    this.camera = camera;
    this.rng = createRng(cfg.seed);

    this.count = cfg.count;
    this.box = cfg.box;

    // Two vertices per particle: the head, and the tail it is dragging.
    this._points = new Float32Array(this.count * 3);
    this._velocity = new Float32Array(this.count * 3);
    this._vertices = new Float32Array(this.count * 6);

    const half = { x: this.box[0] * 0.5, y: this.box[1] * 0.5, z: this.box[2] * 0.5 };
    this._half = half;

    for (let i = 0; i < this.count; i++) {
      this._points[i * 3] = (this.rng.next() * 2 - 1) * half.x;
      this._points[i * 3 + 1] = (this.rng.next() * 2 - 1) * half.y;
      this._points[i * 3 + 2] = (this.rng.next() * 2 - 1) * half.z;
    }

    this.geometry = new THREE.BufferGeometry();
    const attribute = new THREE.BufferAttribute(this._vertices, 3);
    attribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', attribute);

    // Colour and opacity belong to the KIND, not to the system, and setKind
    // writes them. White at full opacity here so the material is never
    // constructed with undefined - three warns on that and the theme that
    // happens to be fitted first should not decide whether it does.
    this.material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });

    this.lines = new THREE.LineSegments(this.geometry, this.material);
    this.lines.name = 'Weather';
    // The box moves with the camera, so nothing in it is ever outside the
    // frustum in a way a bounding test could usefully find.
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 5;
    this.lines.visible = false;
    scene.add(this.lines);

    this.kind = null;
    this.setKind(config.world.weather.kind);
  }

  /**
   * Picks which weather is falling, or none.
   * @param {'snow'|'rain'|'dust'|null} kind
   */
  setKind(kind) {
    const preset = kind && config.world.weather.kinds[kind];
    this.kind = preset ? kind : null;
    this.preset = preset || null;
    this.lines.visible = !!preset;
    if (!preset) return;

    this.material.color.set(preset.color);
    this.material.opacity = preset.opacity;

    // Per particle velocity, scattered so the fall is not a single sheet.
    for (let i = 0; i < this.count; i++) {
      const at = i * 3;
      this._velocity[at] = preset.drift[0] * (0.4 + this.rng.next() * 1.2);
      this._velocity[at + 1] = -preset.fall * (0.6 + this.rng.next() * 0.8);
      this._velocity[at + 2] = preset.drift[1] * (this.rng.next() * 2 - 1);
    }
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads state.speed
   */
  update(dt, state) {
    if (!this.preset) return;

    const comfort = motionScale('weather');
    const preset = this.preset;
    const half = this._half;
    const points = this._points;
    const velocity = this._velocity;
    const vertices = this._vertices;

    // The box rides with the camera. Position only, not rotation: weather that
    // rolled with the bike's lean would read as the sky tipping over.
    this.camera.getWorldPosition(this.lines.position);

    // Flow is the bike's own velocity, pushed back through the box. The camera
    // looks roughly where it is going, so its forward axis is the travel axis.
    this.camera.getWorldDirection(_forward);
    const speed = state.speed || 0;
    _flow.copy(_forward).multiplyScalar(-speed);

    // How long a streak is. streakMin is a floor rather than a starting point
    // for a reason: at rest the speed term is zero, and a zero length segment
    // draws nothing at all, so a stopped bike would be standing in clear air.
    const streak = preset.streakMin + speed * preset.streakFromSpeed * comfort;

    // A thinned fall, rather than a stopped one: the reduced setting parks the
    // surplus outside the box instead of changing the buffer, which cannot be
    // resized mid run.
    const live = Math.max(1, Math.round(this.count * (comfort < 1 ? comfort : 1)));

    for (let i = 0; i < this.count; i++) {
      const at = i * 3;
      const out = i * 6;

      if (i >= live) {
        // Collapsed to a zero length segment: no fragments, no branch in the
        // shader, and nothing to see.
        vertices[out] = 0; vertices[out + 1] = 0; vertices[out + 2] = 0;
        vertices[out + 3] = 0; vertices[out + 4] = 0; vertices[out + 5] = 0;
        continue;
      }

      let x = points[at] + (velocity[at] + _flow.x) * dt;
      let y = points[at + 1] + velocity[at + 1] * dt;
      let z = points[at + 2] + (velocity[at + 2] + _flow.z) * dt;

      // Wrap rather than respawn. A particle leaving one face enters the
      // opposite one and keeps its velocity, so the field never thins and
      // never needs a spawner.
      if (x > half.x) x -= half.x * 2; else if (x < -half.x) x += half.x * 2;
      if (y > half.y) y -= half.y * 2; else if (y < -half.y) y += half.y * 2;
      if (z > half.z) z -= half.z * 2; else if (z < -half.z) z += half.z * 2;

      points[at] = x;
      points[at + 1] = y;
      points[at + 2] = z;

      // The tail points back along the particle's own velocity through the
      // world, which is the fall plus the flow - so a flake hangs when the bike
      // is stopped and lies almost flat at speed, with no special case for
      // either.
      const vx = velocity[at] + _flow.x;
      const vy = velocity[at + 1];
      const vz = velocity[at + 2] + _flow.z;
      const length = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
      const k = streak / length;

      vertices[out] = x;
      vertices[out + 1] = y;
      vertices[out + 2] = z;
      vertices[out + 3] = x - vx * k;
      vertices[out + 4] = y - vy * k;
      vertices[out + 5] = z - vz * k;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.lines);
    this.scene = null;
    this.camera = null;
  }
}
