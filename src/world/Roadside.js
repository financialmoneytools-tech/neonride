import * as THREE from 'three';
import { config } from '../config.js';
import { UP } from './road/RoadPath.js';
import { applyDistanceFade } from '../utils/distanceFade.js';
import { roadLayout } from './road/layout.js';
import { GeometryBuilder } from '../utils/geometry.js';

/**
 * Roadside - the rhythmic neon pylons standing along both edges of the road.
 *
 * Two InstancedMeshes carry the whole lot: a dark post and, just inboard of it,
 * an emissive tube tinted cyan on the left and magenta on the right. Two draw
 * calls for every pylon in the world.
 *
 * The instance buffer is partitioned by road chunk: pool slot s owns the
 * instances [s * perChunk, (s + 1) * perChunk). Rebuilding a slot therefore
 * touches nothing else, and the pylons recycle exactly in step with the road
 * because Road drives both from the same callback.
 */

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();
const _forward = new THREE.Vector3();

/**
 * The most pylons per chunk any theme asks for, including the base config.
 *
 * Read from the theme library rather than written down, so a new road raises
 * the allocation by existing. This is deliberately the ONE place a structural
 * union is computed from theme data: a theme may not size a buffer, but the
 * game is entitled to look at every theme and size one buffer for all of them.
 */
function maxStationsPerChunk() {
  let most = config.world.roadside.stationsPerChunk;
  for (const theme of Object.values(config.themes)) {
    const value = theme && theme.world && theme.world.roadside
      && theme.world.roadside.stationsPerChunk;
    if (typeof value === 'number' && value > most) most = value;
  }
  return most;
}
const _matrix = new THREE.Matrix4();
const _color = new THREE.Color();

export class Roadside {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Road.js').Road} road
   */
  constructor(scene, road) {
    const side = config.world.roadside;
    const roadCfg = config.world.road;

    this.scene = scene;
    this.road = road;
    // ALLOCATED AT THE UNION, LIVE AT THE THEME'S VALUE.
    //
    // This used to size its buffer straight from the fitted theme, which made
    // `stationsPerChunk` a pool size living in a theme file - the one thing
    // config/themes/index.js says in capitals not to put there, and the reason
    // tools/theme-check.mjs warns about it. It also made a live theme change
    // impossible on this module alone: an InstancedMesh cannot be resized, so a
    // road that thins its pylons could never thicken them again without a
    // reload.
    //
    // The buffer is now the largest any theme asks for and the surplus is
    // scaled to nothing, which is the same trick world/Scenery.js already uses
    // for a prop kind at density zero. It costs the memory of the densest theme
    // and buys a value that can change mid run.
    this.maxStations = maxStationsPerChunk();
    this.stationsPerChunk = Math.min(side.stationsPerChunk, this.maxStations);
    this.perChunk = this.maxStations * 2; // one pylon on each side

    // ASYMMETRIC, because the highway is. A single offset put the left hand
    // pylons at -14, which on a four lane road with an oncoming carriageway
    // beyond the median is the middle of the second oncoming lane - a row of
    // posts standing in the traffic. Each side is measured from its own
    // outermost shoulder instead.
    const layout = roadLayout();
    this.offsetRight = layout.shoulderEdge + side.verge;
    this.offsetLeft = -(layout.oncomingOuter
      - config.world.road.carriageway.shoulderRight - side.verge);

    const count = roadCfg.poolSize * this.perChunk;

    this.group = new THREE.Group();
    this.group.name = 'Roadside';
    scene.add(this.group);

    // A POLE WITH A BASE, not a floating tube. The old pylon was a 0.26 square
    // neon bar 3.9 tall lifted clear of the ground beside a post so dark it was
    // invisible, which read as a large flat slab of light hanging in the air -
    // and at close range it is the biggest thing in the frame. Now the post is
    // a real pole standing on a plinth, and the neon is a thin strip up its
    // face. The base and the pole are ONE geometry, so this is still two draw
    // calls for every pylon in the world.
    this.postGeometry = Roadside._buildPost(side);
    this.tubeGeometry = new THREE.BoxGeometry(side.tubeWidth, side.tubeHeight, side.tubeDepth);

    this.postMaterial = new THREE.MeshBasicMaterial({ color: side.postColor });
    // White base color: the per instance color carries the cyan / magenta tint.
    this.tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Pylons recycle with the road, so they are born at the same distance a
    // chunk is, and the tubes are bright enough to twinkle through the fog at
    // that range. They use the same fade window as the road surface, which is
    // set to close before anything is ever spawned.
    applyDistanceFade(this.postMaterial, roadCfg.surface.neonFadeStart, roadCfg.surface.neonFadeEnd);
    applyDistanceFade(this.tubeMaterial, roadCfg.surface.neonFadeStart, roadCfg.surface.neonFadeEnd);

    this.posts = new THREE.InstancedMesh(this.postGeometry, this.postMaterial, count);
    this.tubes = new THREE.InstancedMesh(this.tubeGeometry, this.tubeMaterial, count);

    for (const mesh of [this.posts, this.tubes]) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // The instances span the whole pool, far beyond the bounds of one box, so
      // the default per geometry culling test would be wrong.
      mesh.frustumCulled = false;
      this.group.add(mesh);
    }

    // Side is fixed for a given instance index, so the tints are written once.
    // Even indices are the s = 0 pylon, which _fillChunk places at +lateral,
    // and the road's lateral axis points to the rider's RIGHT.
    for (let i = 0; i < count; i++) {
      _color.set(i % 2 === 0 ? side.rightColor : side.leftColor);
      this.tubes.setColorAt(i, _color);
    }
    this.tubes.instanceColor.needsUpdate = true;

    this._onChunkBuilt = this._fillChunk.bind(this);
    road.onChunkBuilt(this._onChunkBuilt);
  }

  /** Pole plus the plinth it stands on, merged. Origin at the pole's centre. */
  static _buildPost(side) {
    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();

    builder.add(
      new THREE.BoxGeometry(side.postWidth, side.postHeight, side.postDepth),
      matrix.identity(),
    );
    builder.add(
      new THREE.BoxGeometry(side.baseWidth, side.baseHeight, side.baseWidth),
      matrix.makeTranslation(0, -side.postHeight * 0.5 + side.baseHeight * 0.5, 0),
    );

    return builder.build('roadside-post');
  }

  /**
   * Places every pylon belonging to one pool slot.
   * @param {number} slot
   * @param {number} chunkIndex
   */
  _fillChunk(slot, chunkIndex) {
    const side = config.world.roadside;
    const path = this.road.path;

    const base = slot * this.perChunk;
    const live = this.stationsPerChunk;
    // Spacing follows the LIVE count, so however many pylons a theme asks for,
    // they are spread evenly along the chunk rather than bunched at its start.
    const spacing = config.world.road.chunkLength / live;
    const firstStation = chunkIndex * live;

    for (let k = 0; k < this.maxStations; k++) {
      if (k >= live) {
        // Surplus, because another theme wants more pylons than this one does.
        // Scaled to nothing rather than left where it was: an instance is drawn
        // wherever its matrix puts it, and a stale pylon is a pylon.
        _matrix.makeScale(0, 0, 0);
        for (let s = 0; s < 2; s++) {
          const index = base + k * 2 + s;
          this.posts.setMatrixAt(index, _matrix);
          this.tubes.setMatrixAt(index, _matrix);
        }
        continue;
      }
      // Half a step in, so a pylon never lands exactly on a chunk boundary and
      // the global rhythm stays even across the join.
      const distance = (firstStation + k + 0.5) * spacing;
      path.frameAt(distance, _position, _tangent, _lateral);

      // Right handed basis with the pylon standing straight up: the road pitches
      // with the terrain but the posts do not lean with it.
      _forward.crossVectors(_lateral, UP);
      _matrix.makeBasis(_lateral, UP, _forward);

      for (let s = 0; s < 2; s++) {
        const sign = s === 0 ? 1 : -1; // +1 is the rider's right
        const index = base + k * 2 + s;
        const offset = sign > 0 ? this.offsetRight : this.offsetLeft;

        _matrix.setPosition(
          _position.x + _lateral.x * sign * offset,
          _position.y + side.postHeight * 0.5,
          _position.z + _lateral.z * sign * offset,
        );
        this.posts.setMatrixAt(index, _matrix);

        const tubeOffset = sign * (offset - side.tubeInset);
        _matrix.setPosition(
          _position.x + _lateral.x * tubeOffset,
          _position.y + side.tubeLift + side.tubeHeight * 0.5,
          _position.z + _lateral.z * tubeOffset,
        );
        this.tubes.setMatrixAt(index, _matrix);
      }
    }

    this.posts.instanceMatrix.needsUpdate = true;
    this.tubes.instanceMatrix.needsUpdate = true;
  }

  /**
   * Changes how many pylons a chunk carries, live. Clamped to what was
   * allocated, and every pooled chunk is re-placed so the change is visible
   * behind the rider as well as ahead.
   * @param {number} stations
   */
  setStations(stations) {
    const next = Math.max(1, Math.min(Math.round(stations), this.maxStations));
    if (next === this.stationsPerChunk) return;
    this.stationsPerChunk = next;
    this.refill();
  }

  /** Re-places every pooled chunk. */
  refill() {
    const chunks = this.road.chunks;
    for (let slot = 0; slot < chunks.length; slot++) {
      this._fillChunk(slot, chunks[slot].chunkIndex);
    }
  }

  dispose() {
    this.postGeometry.dispose();
    this.tubeGeometry.dispose();
    this.postMaterial.dispose();
    this.tubeMaterial.dispose();
    this.posts.dispose();
    this.tubes.dispose();

    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
    this.road = null;
  }
}
