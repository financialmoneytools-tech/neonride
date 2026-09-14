import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { VehicleMesh } from './traffic/VehicleMesh.js';

/**
 * Traffic - vehicles running the player's way at varied speeds, pooled and
 * recycled exactly like the road chunks.
 *
 * Every vehicle in the pool is live at all times. When one falls far enough
 * behind it is sent back out ahead of the player with a fresh lane, speed and
 * colour; nothing is created or destroyed after the constructor, so the loop
 * allocates nothing.
 *
 * Overtaking is the point. Traffic speed is a fraction of the PLAYER's maximum
 * rather than an absolute, so raising the bike's top speed keeps the overtaking
 * rate about where it was, and the spread across the pool is what stops the
 * road reading as a static formation.
 *
 * Two events are published on the shared loop state, both decaying over time:
 *   state.impact   a collision, when collision.mode is 'arcade'
 *   state.nearMiss a close pass, which is the moment actually worth recording
 * Postprocess turns both into a screen response.
 */

const UP = new THREE.Vector3(0, 1, 0);

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _color = new THREE.Color();

export class Traffic {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Road.js').Road} road
   * @param {import('../player/BikePhysics.js').BikePhysics} bike
   */
  constructor(scene, road, bike) {
    const cfg = config.world.traffic;

    this.scene = scene;
    this.road = road;
    this.bike = bike;

    this.rng = createRng(cfg.seed);
    this.mesh = new VehicleMesh(cfg.count);
    scene.add(this.mesh.group);

    /** Decaying 0..1 event levels, published on the loop state. */
    this.impact = 0;
    this.nearMiss = 0;
    this._nearMissCooldown = 0;

    this.vehicles = [];
    for (let i = 0; i < cfg.count; i++) {
      this.vehicles.push({
        distance: 0,
        lane: 0,
        lateral: 0,
        speed: 0,
        scale: 1,
        // Sign of (player - vehicle) last frame. A change of sign is the frame
        // the player draws level, which is when a near miss is judged.
        wasBehind: true,
        cooldown: 0,
      });
    }

    // Spread the first fill along the road rather than spawning the whole pool
    // at one distance, so the ride does not open with a wall of traffic.
    const start = config.player.bike.startDistance;
    for (let i = 0; i < this.vehicles.length; i++) {
      this._respawn(this.vehicles[i], start + (cfg.spawnAhead * (i + 1)) / cfg.count, i);
    }
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads distance, speed, lateral
   */
  update(dt, state) {
    const cfg = config.world.traffic;

    this.impact = Math.max(0, this.impact - dt / cfg.collision.flashDuration);
    this.nearMiss = Math.max(0, this.nearMiss - dt / cfg.nearMiss.duration);
    this._nearMissCooldown = Math.max(0, this._nearMissCooldown - dt);

    if (!cfg.enabled) {
      this.mesh.group.visible = false;
      state.impact = 0;
      state.nearMiss = 0;
      return;
    }
    this.mesh.group.visible = true;

    const playerDistance = state.distance || 0;
    const playerLateral = state.lateral || 0;
    const maxSpeed = config.player.bike.maxSpeed;

    for (let i = 0; i < this.vehicles.length; i++) {
      const vehicle = this.vehicles[i];

      vehicle.distance += vehicle.speed * maxSpeed * dt;
      vehicle.cooldown = Math.max(0, vehicle.cooldown - dt);

      if (playerDistance - vehicle.distance > cfg.recycleBehind) {
        this._respawn(vehicle, playerDistance + cfg.spawnAhead, i);
      }

      this._test(vehicle, playerDistance, playerLateral, cfg);
      this._place(vehicle, i, playerDistance);
    }

    this.mesh.body.instanceMatrix.needsUpdate = true;
    this.mesh.strip.instanceMatrix.needsUpdate = true;
    this.mesh.tail.instanceMatrix.needsUpdate = true;
    this.mesh.glow.instanceMatrix.needsUpdate = true;

    state.impact = this.impact;
    state.nearMiss = this.nearMiss;
  }

  /** Sends one vehicle back out ahead of the player with fresh properties. */
  _respawn(vehicle, distance, index) {
    const cfg = config.world.traffic;
    const rng = this.rng;

    vehicle.lane = Math.floor(rng.next() * cfg.lanes.length);
    vehicle.lateral = cfg.lanes[vehicle.lane];
    vehicle.speed = rng.range(cfg.speed.min, cfg.speed.max);
    vehicle.scale = 1 + (rng.next() * 2 - 1) * cfg.vehicle.scaleJitter;
    vehicle.distance = distance + rng.next() * cfg.spawnJitter;
    vehicle.wasBehind = true;
    vehicle.cooldown = 0;

    // Keep lanes from stacking. Pushing back rather than re-rolling means this
    // always terminates.
    for (let i = 0; i < this.vehicles.length; i++) {
      const other = this.vehicles[i];
      if (other === vehicle || other.lane !== vehicle.lane) continue;
      if (Math.abs(other.distance - vehicle.distance) < cfg.minGap) {
        vehicle.distance = other.distance + cfg.minGap;
      }
    }

    _color.set(cfg.vehicle.strip.palette[index % cfg.vehicle.strip.palette.length]);
    this.mesh.strip.setColorAt(index, _color);
    if (this.mesh.strip.instanceColor) this.mesh.strip.instanceColor.needsUpdate = true;

    _color.multiplyScalar(0.55);
    this.mesh.glow.setColorAt(index, _color);
    if (this.mesh.glow.instanceColor) this.mesh.glow.instanceColor.needsUpdate = true;
  }

  /** Collision and near miss, both judged in road space rather than world space. */
  _test(vehicle, playerDistance, playerLateral, cfg) {
    const v = cfg.vehicle;
    const c = cfg.collision;

    const alongGap = Math.abs(playerDistance - vehicle.distance);
    const lateralGap = Math.abs(playerLateral - vehicle.lateral);

    const alongReach = v.length * 0.5 * vehicle.scale + c.playerHalfLength;
    const lateralReach = v.width * 0.5 * vehicle.scale + c.playerHalfWidth;

    if (
      c.mode === 'arcade' &&
      vehicle.cooldown <= 0 &&
      alongGap < alongReach &&
      lateralGap < lateralReach
    ) {
      vehicle.cooldown = c.cooldown;
      this.impact = 1;
      this.bike.applyImpact(c.speedLoss);
    }

    // A near miss is judged on the frame the player draws level, so one pass
    // fires once however long it takes.
    const behind = playerDistance < vehicle.distance;
    if (behind !== vehicle.wasBehind) {
      const edgeGap = lateralGap - lateralReach;
      if (edgeGap > 0 && edgeGap < cfg.nearMiss.range && this._nearMissCooldown <= 0) {
        this.nearMiss = 1;
        this._nearMissCooldown = cfg.nearMiss.cooldown;
      }
    }
    vehicle.wasBehind = behind;
  }

  /**
   * Writes one vehicle's transforms into the four instance buffers.
   * @param {object} vehicle
   * @param {number} index
   * @param {number} playerDistance
   */
  _place(vehicle, index, playerDistance) {
    const v = config.world.traffic.vehicle;

    this.road.path.frameAt(vehicle.distance, _position, _tangent, _lateral);

    // Basis: +X across the road, +Y up, +Z back down the road, so the body's
    // local -Z faces the way it is travelling.
    _forward.crossVectors(_lateral, UP);
    _matrix.makeBasis(_lateral, UP, _forward);
    _quaternion.setFromRotationMatrix(_matrix);

    const x = _position.x + _lateral.x * vehicle.lateral;
    const z = _position.z + _lateral.z * vehicle.lateral;

    _scale.setScalar(vehicle.scale);
    _matrix.compose(
      _position.set(x, _position.y + v.height * 0.5 * vehicle.scale, z),
      _quaternion,
      _scale,
    );
    this.mesh.body.setMatrixAt(index, _matrix);
    this.mesh.strip.setMatrixAt(index, _matrix);
    this.mesh.tail.setMatrixAt(index, _matrix);

    // The glow lies on the road, so it takes the road height rather than the
    // body height, and it does not scale with the vehicle. It does shrink away
    // as the player draws level: see the note on glow.nearFade.
    const gap = Math.abs(playerDistance - vehicle.distance);
    const near = THREE.MathUtils.clamp(gap / v.glow.nearFade, 0, 1);
    _matrix.compose(
      _position.set(x, _position.y - v.height * 0.5 * vehicle.scale + v.glow.y, z),
      _quaternion,
      _scale.setScalar(near * near * (3 - 2 * near)),
    );
    this.mesh.glow.setMatrixAt(index, _matrix);
  }

  dispose() {
    this.scene.remove(this.mesh.group);
    this.mesh.dispose();
    this.vehicles.length = 0;
    this.scene = null;
    this.road = null;
    this.bike = null;
  }
}
