import * as THREE from 'three';
import { config } from '../config.js';
import { RoadPath } from './road/RoadPath.js';
import { RoadChunk } from './road/RoadChunk.js';
import { RoadMaterial } from './road/RoadMaterial.js';

/**
 * Road - the endless road, as a fixed pool of chunks that leapfrog forward.
 *
 * Global chunk N lives in pool slot N % poolSize, which makes recycling a
 * single modulo: when the camera leaves the rearmost live chunk, that slot is
 * rebuilt as the chunk poolSize ahead and the window slides by one. Nothing is
 * created or destroyed after the constructor - no geometry, no material, no
 * vector - so the heap stays flat however long the ride lasts.
 *
 * Other modules that need to follow the recycling (Roadside) subscribe with
 * onChunkBuilt(). Subscribing replays the current pool immediately, so a
 * subscriber never has to duplicate the initial fill.
 */
export class Road {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    const road = config.world.road;

    this.scene = scene;
    this.chunkLength = road.chunkLength;
    this.poolSize = road.poolSize;
    this.chunksBehind = road.chunksBehind;

    this.group = new THREE.Group();
    this.group.name = 'Road';
    scene.add(this.group);

    this.path = new RoadPath();
    this.surface = new RoadMaterial();

    /** Global index of the rearmost live chunk. */
    this.firstChunkIndex = 0;

    this._chunkListeners = [];

    this.chunks = [];
    for (let slot = 0; slot < this.poolSize; slot++) {
      const chunk = new RoadChunk(this.surface.material);
      this.chunks.push(chunk);
      this.group.add(chunk.mesh);
    }

    for (let slot = 0; slot < this.poolSize; slot++) {
      this.chunks[slot].rebuild(this.path, slot);
    }
  }

  /**
   * Registers a callback fired whenever a slot is filled, and immediately
   * replays every slot as it stands right now.
   * @param {(slot:number, chunkIndex:number) => void} fn
   */
  onChunkBuilt(fn) {
    this._chunkListeners.push(fn);
    for (let slot = 0; slot < this.poolSize; slot++) {
      fn(slot, this.chunks[slot].chunkIndex);
    }
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads state.distance
   */
  update(dt, state) {
    this.surface.update(dt);

    const current = Math.floor((state.distance || 0) / this.chunkLength);
    const target = current - this.chunksBehind;

    while (this.firstChunkIndex < target) {
      const slot = this.firstChunkIndex % this.poolSize;
      const chunkIndex = this.firstChunkIndex + this.poolSize;

      this.chunks[slot].rebuild(this.path, chunkIndex);
      this.firstChunkIndex++;

      for (let i = 0; i < this._chunkListeners.length; i++) {
        this._chunkListeners[i](slot, chunkIndex);
      }
    }
  }

  dispose() {
    for (let i = 0; i < this.chunks.length; i++) this.chunks[i].dispose();
    this.chunks.length = 0;
    this._chunkListeners.length = 0;

    this.surface.dispose();

    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
  }
}
