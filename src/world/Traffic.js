import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { VehicleMesh } from './traffic/VehicleMesh.js';
import { testVehicle } from './traffic/TrafficEvents.js';
import { roadLayout } from './road/layout.js';

/**
 * Traffic - vehicles running the player's way at varied speeds, pooled per type
 * and recycled like the road chunks. Nothing is created after the constructor.
 *
 * One pool per type, not one shared pool: an InstancedMesh has fixed geometry,
 * so sharing would mean swapping geometry at runtime, the one thing instancing
 * cannot do. A type's `count` is therefore also its spawn weight.
 *
 * Publishes two RUNNING TOTALS on the loop state: state.hits and
 * state.nearMisses. It used to publish two decaying levels as well, and own
 * their decay and the collision flash's refractory - that is all in fx/Flash.js
 * now, which watches these totals rise. Traffic reports what happened; it does
 * not decide what the screen does about it, and it is in no position to know
 * whether the run is still going or whether the rider is inside the grace
 * window, which is exactly what went wrong while it did.
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

    // LANES COME FROM THE ROAD, not from a list in the traffic config. They
    // used to be written out by hand, which was survivable while the road was
    // a plain strip and is not now: changing the lane count in config has to
    // move the paint, the traffic and the barrier together or they disagree
    // silently, and a car straddling a painted line is the kind of wrong that
    // is obvious in a recording and invisible in a diff.
    this.lanes = roadLayout().laneCentres;
    this.group = new THREE.Group();
    this.group.name = 'Traffic';
    scene.add(this.group);

    // The player's speed, kept for the spawner: the gap between two vehicles
    // in a lane grows with it, so a spawn needs to know how fast the rider is
    // going right now rather than what the maximum is.
    this._playerSpeed = 0;
    // Running totals for the run's score, its fail state and the screen flash.
    // Totals rather than levels: a level has to be sampled at the right moment
    // and will either miss an event between two frames or count one event
    // several times depending on the frame rate. A number that only goes up
    // cannot do either.
    this.hits = 0;
    this.nearMisses = 0;
    this._nearMissCooldown = 0;
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

    this._nearMissCooldown = Math.max(0, this._nearMissCooldown - dt);
    this._beaconPhase += dt;

    if (!cfg.enabled) {
      this.group.visible = false;
      state.hits = this.hits;
      state.nearMisses = this.nearMisses;
      return;
    }
    this.group.visible = true;

    const playerDistance = state.distance || 0;
    const playerLateral = state.lateral || 0;
    const maxSpeed = config.player.bike.maxSpeed;
    this._playerSpeed = state.speed || 0;

    // Density ramp: the road starts sparse and fills out as the run goes on,
    // and stops at a cap. The cap is the part that matters - a curve that keeps
    // climbing arrives back at the density that was unplayable to begin with.
    const density = this.model.density;
    const progress = THREE.MathUtils.clamp(playerDistance / density.fullAt, 0, 1);
    const fraction = Math.min(
      density.max,
      density.start + (density.max - density.start) * Math.pow(progress, density.curve),
    );

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
          vehicle.lateral = vehicle.laneLateral
            + Math.sin(vehicle.weavePhase) * weave.amount * this.model.weaveScale;
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

  /**
   * Which traffic model is in force.
   *
   * Read every time rather than cached: god mode can be armed mid-run, and the
   * road should fill in behind that rather than need a reload.
   */
  get model() {
    const models = config.world.traffic.models;
    return config.autopilot.enabled ? models.god : models.player;
  }

  /**
   * Whether a vehicle may be placed in this lane at this distance.
   *
   * THE ESCAPE GUARANTEE, and it is enforced here because here is the only
   * place that can enforce it. Nothing downstream can open a gap that was never
   * left: the guard behind the autopilot can steer round a wall, but it is
   * inert outside god mode, and a player meeting four blocked lanes has no
   * move. So a placement that would close the road is REFUSED.
   *
   * Three rules, all measured over one stretch of road:
   *   - at most `maxAbreast` lanes occupied, so free lanes always remain
   *   - at most `trucksAbreast` of those may be a truck
   *   - same lane spacing that grows with the player's speed
   *
   * @param {object} type the type being placed
   * @param {number} lane
   * @param {number} distance
   * @param {object} vehicle the one being placed, excluded from the scan
   * @param {number} playerSpeed
   */
  _admits(type, lane, distance, vehicle, playerSpeed) {
    const model = this.model;
    const escape = model.escape;
    const gap = model.gap.base + model.gap.reaction * playerSpeed;

    const lanes = new Set([lane]);
    let trucks = type.truck ? 1 : 0;

    for (let f = 0; f < this.fleets.length; f++) {
      const fleet = this.fleets[f];
      const isTruck = !!fleet.type.truck;
      for (let i = 0; i < fleet.vehicles.length; i++) {
        const other = fleet.vehicles[i];
        if (other === vehicle || !other.active) continue;

        const along = Math.abs(other.distance - distance);

        // Same lane: the spacing rule, which is the one that gives a player
        // time to see a thing and go round it.
        if (other.lane === lane && along < gap) return false;
        if (!escape.enabled) continue;

        if (along >= escape.window) continue;
        lanes.add(other.lane);
        if (isTruck) trucks++;
        if (lanes.size > escape.maxAbreast) return false;
        if (trucks > escape.trucksAbreast) return false;
      }
    }

    return true;
  }

  /**
   * The lane it wants, then the rest, nearest first.
   *
   * Nearest first so a refused placement lands beside where it meant to be
   * rather than across the road, which keeps the speed-sorted lanes readable.
   * @param {number} wanted
   * @param {number} lowest the type's minLane
   */
  _laneOrder(wanted, lowest) {
    const order = [];
    for (let i = lowest; i < this.lanes.length; i++) order.push(i);
    order.sort((a, b) => Math.abs(a - wanted) - Math.abs(b - wanted));
    return order;
  }

  /** Sends one vehicle back out ahead of the player with fresh properties. */
  _respawn(fleet, vehicle, distance, index) {
    const cfg = config.world.traffic;
    const type = fleet.type;
    const rng = this.rng;

    // LANE BY SPEED, the way a real motorway sorts itself out. We drive on the
    // right, so lane 0 is the leftmost - the fast one - and the slowest traffic
    // belongs on the right. The pick is biased rather than forced: a van in the
    // outside lane is a thing that happens, and a road where every vehicle is
    // exactly where it should be reads as a simulation rather than as traffic.
    const speedRatio = (type.speed.min + type.speed.max) * 0.5;
    const want = (1 - Math.min(1, Math.max(0, (speedRatio - 0.3) / 0.5)))
      * (this.lanes.length - 1);
    const spread = cfg.laneDiscipline;
    const pick = want + (rng.next() * 2 - 1) * spread;
    // minLane keeps the widest vehicles out of the outside lanes. Without it a
    // truck in lane 0 could pair with one across the road and leave no legal
    // line anywhere, which the god mode guard reports as a trapped frame and
    // then, sometimes, as an overlap.
    const lowest = type.minLane || 0;
    const wanted = Math.min(this.lanes.length - 1, Math.max(lowest, Math.round(pick)));

    // SPEED, squeezed toward the type's own midpoint by the model. A player
    // needs closing speeds they can predict; god mode wants the full spread.
    const model = this.model;
    const mid = (type.speed.min + type.speed.max) * 0.5;
    const half = (type.speed.max - type.speed.min) * 0.5 * model.speedSpread;
    vehicle.speed = rng.range(mid - half, mid + half);

    vehicle.scale = 1 + (rng.next() * 2 - 1) * cfg.vehicle.scaleJitter;
    vehicle.weavePhase = rng.next() * Math.PI * 2;
    vehicle.wasBehind = true;
    vehicle.hit = false;

    // WHERE IT MAY GO. The lane it wants is tried first, then the others, then
    // the whole thing is pushed further along and tried again - because
    // refusing a placement has to end in a placement, and a vehicle that ends
    // up further away is invisible while a vehicle inside a wall is not.
    const escape = model.escape;
    const attempts = escape.enabled ? escape.attempts : 1;
    const order = this._laneOrder(wanted, lowest);
    let at = distance + rng.next() * cfg.spawnJitter;
    let placed = false;

    for (let attempt = 0; attempt < attempts && !placed; attempt++) {
      for (const lane of order) {
        if (!this._admits(type, lane, at, vehicle, this._playerSpeed)) continue;
        vehicle.lane = lane;
        vehicle.distance = at;
        placed = true;
        break;
      }
      if (!placed) at += escape.enabled ? escape.push : cfg.minGap;
    }

    if (!placed) {
      // Nowhere legal within reach. Sent well beyond the spawn window rather
      // than forced into a gap that does not exist: it is out of sight there,
      // and it will be offered a place again the next time it recycles.
      vehicle.lane = wanted;
      vehicle.distance = at + cfg.spawnAhead;
    }

    vehicle.laneLateral = this.lanes[vehicle.lane];
    vehicle.lateral = vehicle.laneLateral;

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
