import * as THREE from 'three';
import { config } from '../config.js';
import { UP } from './road/RoadPath.js';
import { applyDistanceFade } from '../utils/distanceFade.js';

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
    this.stationsPerChunk = side.stationsPerChunk;
    this.spacing = roadCfg.chunkLength / side.stationsPerChunk;
    this.perChunk = side.stationsPerChunk * 2; // one pylon on each side

    const count = roadCfg.poolSize * this.perChunk;

    this.group = new THREE.Group();
    this.group.name = 'Roadside';
    scene.add(this.group);

    this.postGeometry = new THREE.BoxGeometry(side.postWidth, side.postHeight, side.postDepth);
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

  /**
   * Places every pylon belonging to one pool slot.
   * @param {number} slot
   * @param {number} chunkIndex
   */
  _fillChunk(slot, chunkIndex) {
    const side = config.world.roadside;
    const path = this.road.path;

    const base = slot * this.perChunk;
    const firstStation = chunkIndex * this.stationsPerChunk;

    for (let k = 0; k < this.stationsPerChunk; k++) {
      // Half a step in, so a pylon never lands exactly on a chunk boundary and
      // the global rhythm stays even across the join.
      const distance = (firstStation + k + 0.5) * this.spacing;
      path.frameAt(distance, _position, _tangent, _lateral);

      // Right handed basis with the pylon standing straight up: the road pitches
      // with the terrain but the posts do not lean with it.
      _forward.crossVectors(_lateral, UP);
      _matrix.makeBasis(_lateral, UP, _forward);

      for (let s = 0; s < 2; s++) {
        const sign = s === 0 ? 1 : -1; // +1 is the rider's right
        const index = base + k * 2 + s;

        _matrix.setPosition(
          _position.x + _lateral.x * sign * side.offset,
          _position.y + side.postHeight * 0.5,
          _position.z + _lateral.z * sign * side.offset,
        );
        this.posts.setMatrixAt(index, _matrix);

        const tubeOffset = sign * (side.offset - side.tubeInset);
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
