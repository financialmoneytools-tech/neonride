import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { VehicleMesh } from './traffic/VehicleMesh.js';
import { testVehicle } from './traffic/TrafficEvents.js';

/**
 * Traffic - vehicles running the player's way at varied speeds, pooled per type
 * and recycled like the road chunks. Nothing is created after the constructor.
 *
 * One pool per type, not one shared pool: an InstancedMesh has fixed geometry,
 * so sharing would mean swapping geometry at runtime, the one thing instancing
 * cannot do. A type's `count` is therefore also its spawn weight.
 *
 * Publishes two decaying levels on the loop state: state.impact for a collision
 * and state.nearMiss for a close pass, which Postprocess turns into light.
 *
 * A collision LATCHES on the vehicle hit and releases only once the player has
 * fully separated. A timer is what let a hit repeat forever: a player can match
 * a vehicle's speed while inside it, and every expiry fired again, so the flash
 * never cleared - and the vehicle looked absent, because from inside it every
 * face points away.
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
    this.group = new THREE.Group();
    this.group.name = 'Traffic';
    scene.add(this.group);

    this.impact = 0;
    this.nearMiss = 0;
    // Running totals for the run's score and its fail state. The two above are
    // decaying levels for the post chain; these are events.
    this.hits = 0;
    this.nearMisses = 0;
    this._nearMissCooldown = 0;
    this._impactRefractory = 0;
    this._beaconPhase = 0;

    /** One fleet per type: its meshes and its own pool of vehicles. */
    this.fleets = [];
    const start = config.player.bike.startDistance;
    let spread = 0;
    const total = cfg.types.reduce((sum, type) => sum + type.count, 0);

    for (const type of cfg.types) {
      const mesh = new VehicleMesh(type, type.count);
      this.group.add(mesh.group);

      const vehicles = [];
      for (let i = 0; i < type.count; i++) {
        vehicles.push({
          distance: 0,
          lane: 0,
          lateral: 0,
          laneLateral: 0,
          speed: 0,
          scale: 1,
          weavePhase: 0,
          wasBehind: true,
          hit: false,
          active: true,
        });
      }

      const fleet = { type, mesh, vehicles };
      this.fleets.push(fleet);

      // Spread the opening fill so the ride does not start with a wall.
      for (let i = 0; i < vehicles.length; i++) {
        spread++;
        this._respawn(fleet, vehicles[i], start + (cfg.spawnAhead * spread) / total, i);
      }
    }
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads distance, speed, lateral
   */
  /**
   * Phase of the roof beacons, in seconds. Public so the siren can alternate
   * off the same clock the lights flash on rather than keeping a second one
   * that would drift against it.
   * @returns {number}
   */
  get beaconPhase() {
    return this._beaconPhase;
  }

  update(dt, state) {
    const cfg = config.world.traffic;

    this.impact = Math.max(0, this.impact - dt / cfg.collision.flashDuration);
    this.nearMiss = Math.max(0, this.nearMiss - dt / cfg.nearMiss.duration);
    this._nearMissCooldown = Math.max(0, this._nearMissCooldown - dt);
    this._impactRefractory = Math.max(0, this._impactRefractory - dt);
    this._beaconPhase += dt;

    if (!cfg.enabled) {
      this.group.visible = false;
      state.impact = 0;
      state.nearMiss = 0;
      state.hits = this.hits;
      state.nearMisses = this.nearMisses;
      return;
    }
    this.group.visible = true;

    const playerDistance = state.distance || 0;
    const playerLateral = state.lateral || 0;
    const maxSpeed = config.player.bike.maxSpeed;

    // Density ramp: the road starts sparse and fills out as the run goes on.
    const density = cfg.density;
    const progress = THREE.MathUtils.clamp(playerDistance / density.fullAt, 0, 1);
    const fraction = density.start + (1 - density.start) * Math.pow(progress, density.curve);

    for (let f = 0; f < this.fleets.length; f++) {
      const fleet = this.fleets[f];
      const vehicles = fleet.vehicles;

      // An inactive vehicle is scaled to nothing, so it costs no fragments, and
      // is skipped entirely so it cannot be collided with either.
      const liveCount = Math.max(1, Math.round(vehicles.length * fraction));

      for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];
        const live = i < liveCount;

        // A vehicle coming out of the pool appears wherever it was left, and
        // the density ramp can bring one back while the player is standing on
        // that spot. Nothing else in the frame can catch it: the recording
        // guard has already run and skipped it as inactive, so it materialises
        // inside the bike. Sent forward instead, which is where a new vehicle
        // belongs anyway.
        if (live && !vehicle.active && Math.abs(playerDistance - vehicle.distance) < cfg.spawnClear) {
          this._respawn(fleet, vehicle, playerDistance + cfg.spawnAhead, i);
        }
        vehicle.active = live;

        if (!vehicle.active) {
          _matrix.makeScale(0, 0, 0);
          fleet.mesh.body.setMatrixAt(i, _matrix);
          fleet.mesh.strip.setMatrixAt(i, _matrix);
          fleet.mesh.tail.setMatrixAt(i, _matrix);
          fleet.mesh.glow.setMatrixAt(i, _matrix);
          if (fleet.mesh.beacon) fleet.mesh.beacon.setMatrixAt(i, _matrix);
          continue;
        }

        vehicle.distance += vehicle.speed * maxSpeed * dt;

        // A motorcycle drifts within its lane, which is what makes one read as
        // a bike rather than as a very small car.
        const weave = fleet.type.weave;
        if (weave) {
          vehicle.weavePhase += dt * ((Math.PI * 2) / weave.period);
          vehicle.lateral = vehicle.laneLateral + Math.sin(vehicle.weavePhase) * weave.amount;
        }

        if (playerDistance - vehicle.distance > cfg.recycleBehind) {
          this._respawn(fleet, vehicle, playerDistance + cfg.spawnAhead, i);
        }

        testVehicle(this, fleet, vehicle, playerDistance, playerLateral, cfg, this.bike);
        this._place(fleet, vehicle, i, playerDistance);
      }

      fleet.mesh.body.instanceMatrix.needsUpdate = true;
      fleet.mesh.strip.instanceMatrix.needsUpdate = true;
      fleet.mesh.tail.instanceMatrix.needsUpdate = true;
      fleet.mesh.glow.instanceMatrix.needsUpdate = true;
      if (fleet.mesh.beacon) this._updateBeacons(fleet);
    }

    state.impact = this.impact;
    state.nearMiss = this.nearMiss;
    state.hits = this.hits;
    state.nearMisses = this.nearMisses;
  }

  /** Alternating roof lights. One colour write per vehicle, no new geometry. */
  _updateBeacons(fleet) {
    const beacon = fleet.type.beacon;
    const on = Math.sin(this._beaconPhase * Math.PI * 2 * beacon.rate) >= 0;

    // The lamps carry red and blue as vertex colours, so alternating the
    // instance colour between those two lights one and extinguishes the other.
    for (let i = 0; i < fleet.vehicles.length; i++) {
      _color.set(on ? beacon.colorA : beacon.colorB);
      fleet.mesh.beacon.setColorAt(i, _color);
    }
    fleet.mesh.beacon.instanceMatrix.needsUpdate = true;
    if (fleet.mesh.beacon.instanceColor) fleet.mesh.beacon.instanceColor.needsUpdate = true;
  }

  /** Sends one vehicle back out ahead of the player with fresh properties. */
  _respawn(fleet, vehicle, distance, index) {
    const cfg = config.world.traffic;
    const type = fleet.type;
    const rng = this.rng;

    vehicle.lane = Math.floor(rng.next() * cfg.lanes.length);
    vehicle.laneLateral = cfg.lanes[vehicle.lane];
    vehicle.lateral = vehicle.laneLateral;
    vehicle.speed = rng.range(type.speed.min, type.speed.max);
    vehicle.scale = 1 + (rng.next() * 2 - 1) * cfg.vehicle.scaleJitter;
    vehicle.distance = distance + rng.next() * cfg.spawnJitter;
    vehicle.weavePhase = rng.next() * Math.PI * 2;
    vehicle.wasBehind = true;
    vehicle.hit = false;

    // Keep a lane from stacking, across every fleet rather than just this one.
    for (let f = 0; f < this.fleets.length; f++) {
      const others = this.fleets[f].vehicles;
      for (let i = 0; i < others.length; i++) {
        const other = others[i];
        if (other === vehicle || other.lane !== vehicle.lane) continue;
        if (Math.abs(other.distance - vehicle.distance) < cfg.minGap) {
          vehicle.distance = other.distance + cfg.minGap;
        }
      }
    }

    // Paint: the ambulance keeps its own, everything else draws the palette.
    _color.set(type.bodyColor || cfg.bodyPalette[Math.floor(rng.next() * cfg.bodyPalette.length)]);
    fleet.mesh.body.setColorAt(index, _color);
    if (fleet.mesh.body.instanceColor) fleet.mesh.body.instanceColor.needsUpdate = true;

    _color.set(type.stripColor);
    fleet.mesh.strip.setColorAt(index, _color);
    if (fleet.mesh.strip.instanceColor) fleet.mesh.strip.instanceColor.needsUpdate = true;

    fleet.mesh.glow.setColorAt(index, _color);
    if (fleet.mesh.glow.instanceColor) fleet.mesh.glow.instanceColor.needsUpdate = true;
  }

  /** Writes one vehicle's transforms into its fleet's instance buffers. */
  _place(fleet, vehicle, index, playerDistance) {
    const type = fleet.type;
    const glow = config.world.traffic.vehicle.glow;

    this.road.path.frameAt(vehicle.distance, _position, _tangent, _lateral);

    // Basis: +X across the road, +Y up, +Z back down it, so the body's local -Z
    // faces the way it is travelling and its +Z faces the rider.
    _forward.crossVectors(_lateral, UP);
    _matrix.makeBasis(_lateral, UP, _forward);
    _quaternion.setFromRotationMatrix(_matrix);

    const x = _position.x + _lateral.x * vehicle.lateral;
    const z = _position.z + _lateral.z * vehicle.lateral;
    const lift = type.size.height * 0.5 * vehicle.scale + (type.rideHeight || 0);

    _scale.setScalar(vehicle.scale);
    _matrix.compose(_position.set(x, _position.y + lift, z), _quaternion, _scale);

    fleet.mesh.body.setMatrixAt(index, _matrix);
    fleet.mesh.strip.setMatrixAt(index, _matrix);
    fleet.mesh.tail.setMatrixAt(index, _matrix);
    if (fleet.mesh.beacon) fleet.mesh.beacon.setMatrixAt(index, _matrix);

    // Shrinks away as the player draws level: a quad this size fills the whole
    // frame at point blank range, and you cannot see the glow under a vehicle
    // you are alongside anyway.
    const gap = Math.abs(playerDistance - vehicle.distance);
    const near = THREE.MathUtils.clamp(gap / glow.nearFade, 0, 1);
    _scale.setScalar(vehicle.scale * near * near * (3 - 2 * near));
    _matrix.compose(_position, _quaternion, _scale);
    fleet.mesh.glow.setMatrixAt(index, _matrix);
  }

  /** @returns {number} total vehicles across every fleet */
  get vehicleCount() {
    let total = 0;
    for (let i = 0; i < this.fleets.length; i++) total += this.fleets[i].vehicles.length;
    return total;
  }

  dispose() {
    this.scene.remove(this.group);
    for (let i = 0; i < this.fleets.length; i++) this.fleets[i].mesh.dispose();
    this.fleets.length = 0;
    this.group.clear();
    this.scene = null;
    this.road = null;
    this.bike = null;
  }
}
