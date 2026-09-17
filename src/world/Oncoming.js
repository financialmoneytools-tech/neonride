import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { createStarTexture } from '../utils/textures.js';
import { applyDistanceFade } from '../utils/distanceFade.js';
import { roadLayout } from './road/layout.js';

/**
 * Oncoming - traffic on the far carriageway, coming the other way.
 *
 * SCENERY, and deliberately so. Nothing here is tested against the player, can
 * be hit, or reports a near miss: it is the other side of a median barrier, and
 * a collision system that reaches across the barrier is a collision system that
 * will one day kill somebody through a wall. world/Traffic.js owns everything
 * the player can touch; this owns everything they can only look at.
 *
 * Two draw calls: a dark body so the shape occludes the road behind it, and one
 * additive mesh carrying both headlights and their glow. From the front that is
 * all a car is at night - two lights and a silhouette - and the whole point of
 * this system is the stream of headlights running the other way, which is what
 * sells a motorway harder than any amount of scenery does.
 *
 * They close at the SUM of the two speeds, so they pass fast and are on screen
 * briefly. That is correct and it is also cheap: a short life means a small
 * pool serves a busy road.
 */

const UP = new THREE.Vector3(0, 1, 0);

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _scale = new THREE.Vector3();

export class Oncoming {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Road.js').Road} road
   */
  constructor(scene, road) {
    const cfg = config.world.oncoming;
    const roadCfg = config.world.road;

    this.scene = scene;
    this.road = road;
    this.enabled = cfg.enabled;
    this.lanes = roadLayout().oncomingCentres;
    this.rng = createRng(cfg.seed);

    this.group = new THREE.Group();
    this.group.name = 'Oncoming';
    scene.add(this.group);

    // ALREADY SCALED. core/Device.js writes the quality preset's trafficScale
    // into cfg.count before anything is built, the same way it thins the stars
    // - there is no config.quality.trafficScale to read, and reading one gave
    // an InstancedMesh a count of NaN, which draws as a grey smear across the
    // middle of the frame and reports NaN triangles.
    const count = Math.max(1, Math.round(cfg.count));
    this.count = count;

    this.bodyGeometry = new THREE.BoxGeometry(cfg.body.width, cfg.body.height, cfg.body.length);
    this.bodyGeometry.translate(0, cfg.body.height * 0.5, 0);
    this.bodyMaterial = new THREE.MeshBasicMaterial({ color: cfg.body.color });
    applyDistanceFade(this.bodyMaterial, roadCfg.surface.neonFadeStart, roadCfg.surface.neonFadeEnd);

    this.lampTexture = createStarTexture(config.sky.stars.texture, cfg.lamp.textureSize);
    this.lampGeometry = Oncoming._buildLamps(cfg);
    this.lampMaterial = new THREE.MeshBasicMaterial({
      map: this.lampTexture,
      color: cfg.lamp.color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      opacity: cfg.lamp.opacity,
    });
    applyDistanceFade(this.lampMaterial, roadCfg.surface.neonFadeStart, roadCfg.surface.neonFadeEnd);

    this.bodies = new THREE.InstancedMesh(this.bodyGeometry, this.bodyMaterial, count);
    this.lamps = new THREE.InstancedMesh(this.lampGeometry, this.lampMaterial, count);

    for (const mesh of [this.bodies, this.lamps]) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      mesh.visible = this.enabled;
      this.group.add(mesh);
    }
    // The lamps are additive and must be drawn after the bodies they sit on.
    this.lamps.renderOrder = 1;

    /** @type {{distance:number, lateral:number, speed:number, scale:number}[]} */
    this.vehicles = [];
    for (let i = 0; i < count; i++) {
      this.vehicles.push({ distance: 0, lateral: this.lanes[0], speed: 0, scale: 1 });
    }
    this._seeded = false;
  }

  /**
   * Two lamp quads, side by side, facing back down the road toward the player.
   * One geometry, so a whole car's lighting is one instance.
   */
  static _buildLamps(cfg) {
    const lamp = cfg.lamp;
    const quad = new THREE.PlaneGeometry(lamp.size, lamp.size);
    const merged = new THREE.BufferGeometry();

    // AT THE FRONT OF THE CAR, not at its origin. The body box is 4.6 long and
    // centred, so a lamp at z = 0 sits inside it: the bodies write depth and
    // swallowed every headlight, which looked exactly like the lamps never
    // being drawn at all. The face pointing at the player is +z local, because
    // the basis these are placed with points +z back down the road.
    const front = cfg.body.length * 0.5 + 0.05;
    const parts = [];
    for (const sign of [-1, 1]) {
      const side = quad.clone();
      side.translate(sign * lamp.spacing * 0.5, lamp.y, front);
      parts.push(side);
    }

    const position = [];
    const uv = [];
    const index = [];
    let base = 0;
    for (const part of parts) {
      const p = part.attributes.position.array;
      const t = part.attributes.uv.array;
      for (let i = 0; i < p.length; i++) position.push(p[i]);
      for (let i = 0; i < t.length; i++) uv.push(t[i]);
      for (const i of part.index.array) index.push(base + i);
      base += part.attributes.position.count;
      part.dispose();
    }
    quad.dispose();

    merged.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
    merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    merged.setIndex(index);
    return merged;
  }

  /** Puts one vehicle back out ahead of the player. */
  _respawn(vehicle, ahead) {
    const cfg = config.world.oncoming;
    const rng = this.rng;
    vehicle.lateral = this.lanes[Math.floor(rng.next() * this.lanes.length)];
    vehicle.speed = rng.range(cfg.speed.min, cfg.speed.max);
    vehicle.scale = 1 + (rng.next() * 2 - 1) * cfg.scaleJitter;
    vehicle.distance = ahead + rng.next() * cfg.spawnJitter;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads state.distance
   */
  update(dt, state) {
    if (!this.enabled) return;

    const cfg = config.world.oncoming;
    const playerDistance = state.distance || 0;
    const maxSpeed = config.player.bike.maxSpeed;

    // Spread the pool over the road the first time, rather than releasing the
    // whole lot from the same point: a convoy leaving the spawn line together
    // is the one thing that reads as a pool.
    if (!this._seeded) {
      this._seeded = true;
      for (let i = 0; i < this.vehicles.length; i++) {
        this._respawn(this.vehicles[i], playerDistance + cfg.spawnAhead * (i / this.vehicles.length));
      }
    }

    for (let i = 0; i < this.vehicles.length; i++) {
      const vehicle = this.vehicles[i];

      // Coming the other way: their distance falls as ours rises, so they close
      // at the sum of the two speeds.
      vehicle.distance -= vehicle.speed * maxSpeed * dt;

      if (playerDistance - vehicle.distance > cfg.recycleBehind) {
        this._respawn(vehicle, playerDistance + cfg.spawnAhead);
      }

      this.road.path.frameAt(vehicle.distance, _position, _tangent, _lateral);
      _forward.crossVectors(_lateral, UP);
      _matrix.makeBasis(_lateral, UP, _forward);
      _matrix.setPosition(
        _position.x + _lateral.x * vehicle.lateral,
        _position.y,
        _position.z + _lateral.z * vehicle.lateral,
      );
      _scale.set(vehicle.scale, vehicle.scale, vehicle.scale);
      _matrix.scale(_scale);

      this.bodies.setMatrixAt(i, _matrix);
      this.lamps.setMatrixAt(i, _matrix);
    }

    this.bodies.instanceMatrix.needsUpdate = true;
    this.lamps.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.bodyGeometry.dispose();
    this.lampGeometry.dispose();
    this.bodyMaterial.dispose();
    this.lampMaterial.dispose();
    this.lampTexture.dispose();
    this.bodies.dispose();
    this.lamps.dispose();

    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
    this.road = null;
  }
}
