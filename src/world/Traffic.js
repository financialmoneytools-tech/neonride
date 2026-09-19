import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { VehicleMesh } from './traffic/VehicleMesh.js';
import { testVehicle } from './traffic/TrafficEvents.js';
import { roadLayout } from './road/layout.js';
import { levelRow } from '../config/levels.js';

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

/**
 * Lane first, then distance along it, so a sorted list puts every vehicle
 * immediately before the one it is following.
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function byLaneThenDistance(a, b) {
  return a.lane === b.lane ? a.distance - b.distance : a.lane - b.lane;
}

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

    // THE LEVEL'S MODEL, allocated once and MUTATED per frame. A staged run
    // scales five fields of the shared player model per level, and building a
    // fresh object every frame would be the one thing in this file that
    // allocates inside the loop - which is the discipline the whole pool
    // system exists to keep. `escape` is deliberately a reference to the
    // shared one rather than a copy: the fairness floor is not per level and
    // copying it is how it would quietly become per level later.
    // THE CAR FOLLOWING BUFFER, allocated once at the union of every pool.
    // Sorted in place each frame and never resized, because a per-frame array
    // in the one system that has 79 live objects is exactly the allocation the
    // pooling discipline exists to avoid.
    this._order = [];
    this._orderCount = 0;

    this._level = 0;
    this._levelModel = {
      density: null, // unused on a level; see _densityFraction
      gap: { base: 0, reaction: 0 },
      speedSpread: 1,
      weaveScale: 1,
      truckShare: 1,
      laneChange: 0,
      escape: null,
    };

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
          // THE SPEED IT WANTS, as opposed to the one it is doing. Car
          // following clamps `speed` behind a slower leader and releases it
          // back to `cruise` once the gap reopens, so the two have to be
          // separate - with one field a vehicle that slowed for a truck would
          // never speed up again.
          cruise: 0,
          // Half the type's length, kept on the vehicle so the car following
          // pass can measure edge to edge without reaching back to the fleet.
          // Declared here rather than assigned later so every vehicle has one
          // shape from the first frame.
          halfLength: 0,
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

    // FIRST, before anything reads `this.model`. Every rule below - the
    // density, the spacing, the spread, the weave - is per level in a staged
    // run, and a frame that spawned against the previous level's model would
    // put level nine's traffic on level ten's road for one frame. Once a
    // vehicle is placed nothing moves it.
    this._syncLevel(state);

    // Density ramp: the road starts sparse and fills out, and stops at a cap.
    // The cap is the part that matters - a curve that keeps climbing arrives
    // back at the density that was unplayable to begin with.
    const fraction = this._densityFraction(playerDistance, state);
    // BEFORE ANYTHING MOVES. Every vehicle's speed for this frame is decided
    // here, from the gap it has to the vehicle in front of it.
    this._maintainSpacing(this._playerSpeed);

    // How much of the theme's truck mix this level is running. Trucks are the
    // widest thing on the road and the thing worth overtaking, so thinning
    // them is the largest relief available early and restoring them the
    // largest squeeze late.
    const truckShare = this._level > 0 ? this._levelModel.truckShare : 1;

    for (let f = 0; f < this.fleets.length; f++) {
      const fleet = this.fleets[f];
      const vehicles = fleet.vehicles;

      // THE THEME'S MIX, and it is the ONLY thing a theme may say about
      // traffic. It thins one type against another - more trucks on a highway,
      // fewer in a city - by scaling how many of that fleet are live. It can
      // only ever thin: the pool is allocated once at the union of every
      // theme's needs, so a multiplier above 1 is clamped rather than honoured,
      // and a theme still cannot allocate. Everything else about the traffic -
      // the density curve, the escape guarantee, the speed aware spacing - is
      // the shared model and is not reachable from here. See config/traffic.js
      // -> mix, docs/THEMES.md and tools/theme-check.mjs, which fails a theme
      // that reaches past it.
      const mix = cfg.mix ? cfg.mix[fleet.type.name] : undefined;
      let share = mix === undefined ? 1 : THREE.MathUtils.clamp(mix, 0, 1);
      // THE LEVEL THINS TRUCKS ON TOP OF THE THEME'S MIX, and only trucks.
      // It multiplies rather than replaces, so a theme that runs few trucks
      // still runs few of them at level ten - the level says how hard, the
      // theme still says what road this is.
      if (fleet.type.truck) share *= truckShare;

      // An inactive vehicle is scaled to nothing, so it costs no fragments, and
      // is skipped entirely so it cannot be collided with either.
      const liveCount = Math.max(1, Math.round(vehicles.length * fraction * share));

      for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];
        const live = i < liveCount;

        // ANYTHING COMING BACK FROM THE POOL IS RESPAWNED, without asking
        // where it is.
        //
        // It used to be respawned only when it would have materialised
        // inside the BIKE, which is the case somebody noticed. The case
        // nobody noticed is that it can materialise inside another VEHICLE,
        // and for the same reason: an inactive vehicle keeps its distance,
        // car following skips it because it is not active, and the density
        // ramp switches it back on wherever it was left. Nothing in the
        // frame is watching.
        //
        // Measured: two overlapping pairs on Nebula Coast and eight on Red
        // Planet over ten levels each - and ONLY on those two, because they
        // carry the lowest `traffic.mix` of the six, which makes their live
        // counts smallest and the active set churn most. The fast spacing
        // check missed it entirely: at three seconds a level it never saw a
        // pool boundary get crossed.
        //
        // `_respawn` runs `_admits`, so a returning vehicle lands somewhere
        // legal by the same rule a new one does. It costs a teleport of
        // something that was invisible a frame ago, which is nothing.
        if (live && !vehicle.active && Math.abs(playerDistance - vehicle.distance) < 30) {
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
      // The glow's colour carries its near fade now, so it changes every frame.
      if (fleet.mesh.glow.instanceColor) fleet.mesh.glow.instanceColor.needsUpdate = true;
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
    // THE MODEL FOLLOWS THE RUN, NOT WHO IS STEERING. A level's traffic is a
    // property of the level, so a staged run gets the level model whether a
    // person or the autopilot is riding it - which is the only way
    // tools/level-check.mjs can measure what level seven is actually like.
    //
    // God mode still gets the god model, and gets it for free: its phase is
    // `free`, never staged, so `state.level` is zero there and always was.
    if (this._level > 0) return this._levelModel;
    const models = config.world.traffic.models;
    return config.autopilot.enabled ? models.god : models.player;
  }

  /**
   * Points `_levelModel` at the level being ridden.
   *
   * THE PLAYER MODEL IS THE LEVEL ONE BASELINE and this scales five fields of
   * it. Everything it does not name - the escape guarantee, `gap.base`, the
   * spawn distances, every per-type `minLane` - stays the shared model,
   * because those are the things config/traffic.js calls the reason the road
   * is playable. See config/levels.js `floor`, and tools/level-check.mjs,
   * which asserts them against a real run rather than against this comment.
   *
   * @param {object} state loop state; reads level
   */
  _syncLevel(state) {
    // Zero in endless mode and in god mode, where game/Session.js publishes no
    // level at all. It is NOT read off `config.autopilot.enabled`: doing that
    // would mean a staged run could never be driven by the bot, and a
    // difficulty curve nothing can drive is a difficulty curve nobody has
    // measured.
    const level = state.level || 0;
    this._level = level;
    if (level <= 0) return;

    const base = config.world.traffic.models.player;
    const row = levelRow(level);
    const model = this._levelModel;
    model.gap.base = base.gap.base;
    model.gap.reaction = row.gapReaction;
    model.speedSpread = row.speedSpread;
    model.weaveScale = row.weaveScale;
    model.truckShare = row.truckShare;
    model.laneChange = row.laneChange;
    model.escape = base.escape;
  }

  /**
   * What share of every pool should be live this frame.
   *
   * Two behaviours, and the branch is the mode rather than a setting. Endless
   * and god mode keep the original curve, which ramps with absolute distance
   * travelled. A LEVEL does not: it would be meaningless across fifty
   * kilometres, where the old curve saturates by level four and every level
   * after it is identical.
   *
   * Instead a level ramps from the PREVIOUS level's density to its own over
   * the first `rampMeters`, so a level begins by getting harder rather than
   * by being harder - nothing steps on the frame the gate is crossed.
   *
   * @param {number} playerDistance
   * @param {object} state loop state
   * @returns {number} 0..1
   */
  _densityFraction(playerDistance, state) {
    if (this._level <= 0) {
      const density = this.model.density;
      const progress = THREE.MathUtils.clamp(playerDistance / density.fullAt, 0, 1);
      return Math.min(
        density.max,
        density.start + (density.max - density.start) * Math.pow(progress, density.curve),
      );
    }

    const level = this._level;
    const target = levelRow(level).density;
    // Level one ramps up from the shared model's own opening density, so the
    // very first kilometre of a road is as clean as the first kilometre of the
    // single stage always was.
    const from = level > 1
      ? levelRow(level - 1).density
      : config.world.traffic.models.player.density.start;
    const ramp = Math.max(1, config.levels.rampMeters);
    const t = THREE.MathUtils.clamp((state.levelTravelled || 0) / ramp, 0, 1);
    return from + (target - from) * t;
  }

  /**
   * Keeps every vehicle behind the one in front of it.
   *
   * THE GUARANTEE IS AN INVARIANT NOW, not a placement filter. `_admits`
   * still decides where a vehicle may APPEAR; this decides that it stays
   * there. Without it a follower closed on its leader at their speed
   * difference until the two were inside each other - measured in endless
   * mode on a build with no levels: 2400 overlapping pairs over 721 frames,
   * worst edge gap -10.7 m. See `follow` in config/traffic.js for what that
   * cost the difficulty curve.
   *
   * ONE SORTED PASS. The buffer is reused between frames and sorted in place
   * by lane and then by distance, so every vehicle's leader is simply the next
   * entry with the same lane. That is O(n log n) on at most 79 entries, once a
   * frame, against the O(n^2) of asking each vehicle to find its own leader.
   *
   * IT RUNS BEFORE ANYTHING INTEGRATES, so the speed a vehicle moves at this
   * frame is the speed this pass allowed. Clamping afterwards would let an
   * overlap exist for a frame and then teleport out of it.
   *
   * @param {number} playerSpeed
   */
  _maintainSpacing(playerSpeed) {
    const follow = config.world.traffic.follow;
    const model = this.model;
    // The same gap the spawner promises, so a level with tighter spacing runs
    // traffic closer together rather than answering to a second number.
    const keep = model.gap.base + model.gap.reaction * playerSpeed;

    const order = this._order;
    let n = 0;
    for (let f = 0; f < this.fleets.length; f++) {
      const fleet = this.fleets[f];
      const half = fleet.type.size.length * 0.5;
      for (let i = 0; i < fleet.vehicles.length; i++) {
        const vehicle = fleet.vehicles[i];
        if (!vehicle.active) continue;
        // Released to its own speed first, then clamped below if it has a
        // leader. A vehicle whose leader recycled away must be able to go
        // back to cruising, and this is the only place that can let it.
        vehicle.speed = vehicle.cruise;
        // SCALED. `_place` composes the matrix with `setScalar(vehicle.scale)`
        // and `scaleJitter` is 8 per cent, so a 16 m semi is drawn anywhere
        // between 14.7 and 17.3 m long. Following the unscaled length would
        // enforce a gap the geometry does not have, which with a zero
        // tolerance overlap check is the difference between true and nearly.
        vehicle.halfLength = half * vehicle.scale;
        order[n] = vehicle;
        n++;
      }
    }
    order.length = n;
    this._orderCount = n;
    if (n < 2) return;

    order.sort(byLaneThenDistance);

    // FROM THE FRONT BACKWARDS, and the direction is the whole correctness of
    // this. Walking forwards clamps a follower against its leader's UNCLAMPED
    // speed and only then slows the leader, so in any queue of three or more
    // every vehicle is matched to a speed its leader is about to drop below -
    // and the queue closes up anyway. Measured: forwards still left 0.1 to 2.1
    // overlapping pairs a frame. Backwards, each leader is already final by
    // the time the vehicle behind it is asked to follow.
    for (let i = n - 2; i >= 0; i--) {
      const behind = order[i];
      const ahead = order[i + 1];
      if (ahead.lane !== behind.lane) continue;

      const gap = ahead.distance - behind.distance - ahead.halfLength - behind.halfLength;
      if (gap >= keep) continue;

      if (gap <= follow.minEdge) {
        // Inside the settling distance: drop UNDER the leader so a gap that
        // has already closed reopens. Matching the leader exactly would hold
        // a bunched pair bunched for the rest of its life.
        behind.speed = Math.min(behind.cruise, ahead.speed * follow.easeBack);
      } else {
        // Between the settling distance and the promised gap, ease back up to
        // its own cruising speed.
        const t = (gap - follow.minEdge) / Math.max(1e-6, keep - follow.minEdge);
        behind.speed = Math.min(behind.cruise, ahead.speed + (behind.cruise - ahead.speed) * t);
      }
    }
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
    vehicle.cruise = rng.range(mid - half, mid + half);
    vehicle.speed = vehicle.cruise;

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

    // THE THEME'S LOOK, and like the mix it is paint only. A theme may say what
    // a van looks like on its road and never how a van behaves, so this reaches
    // the two colours and stops. Applied at respawn, which is also what makes
    // it blend: a theme change repaints each vehicle as the pool recycles it
    // rather than restyling the whole road in one frame.
    const look = (cfg.look && cfg.look[type.name]) || null;

    // Paint: the ambulance keeps its own, everything else draws the palette.
    _color.set((look && look.bodyColor)
      || type.bodyColor
      || cfg.bodyPalette[Math.floor(rng.next() * cfg.bodyPalette.length)]);
    fleet.mesh.body.setColorAt(index, _color);
    if (fleet.mesh.body.instanceColor) fleet.mesh.body.instanceColor.needsUpdate = true;

    _color.set((look && look.stripColor) || type.stripColor);
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

    // THE GLOW TAKES THE BODY'S MATRIX, unchanged. It used to take its own,
    // SCALED toward nothing as the player closed - and that is what detached
    // the tail lights.
    //
    // The glow mesh holds two things: the ground pool, centred on the origin,
    // and the REAR HALO, offset to z = +length/2 so it sits on the rear face.
    // Scaling the mesh about the origin shrinks the pool in place, which is
    // fine, and drags the halo off the back of the vehicle toward its centre,
    // which is not. So a lit red panel slid out of the rear face while the tail
    // lamps and the outline stayed on it - reported as lights floating in mid
    // air with the body drawn separately behind them. The same fault was
    // reported once before on a truck and recorded as fixed; it was hidden, by
    // switching that type's rear outline off.
    //
    // The near fade is kept, because the reason for it is real - a quad this
    // size fills the whole frame at point blank range - but it is applied as
    // BRIGHTNESS rather than as size. The glow is additive, so a colour scaled
    // to zero is invisible, which is the same result without moving anything.
    fleet.mesh.glow.setMatrixAt(index, _matrix);

    const gap = Math.abs(playerDistance - vehicle.distance);
    const near = THREE.MathUtils.clamp(gap / glow.nearFade, 0, 1);
    const fade = near * near * (3 - 2 * near);
    const look = (config.world.traffic.look && config.world.traffic.look[type.name]) || null;
    _color.set((look && look.stripColor) || type.stripColor).multiplyScalar(fade);
    fleet.mesh.glow.setColorAt(index, _color);
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
