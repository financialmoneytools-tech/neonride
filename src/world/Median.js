import * as THREE from 'three';
import { config } from '../config.js';
import { UP } from './road/RoadPath.js';
import { roadLayout } from './road/layout.js';
import { applyDistanceFade } from '../utils/distanceFade.js';

/**
 * Median - the barrier down the middle of the highway.
 *
 * Two InstancedMeshes for the whole road: a dark concrete wall and a thin neon
 * cap along the top of it. Segments, not a continuous extrusion, because a
 * segment is a box and a box costs twelve triangles - and pooled per road
 * chunk, exactly the way world/Roadside.js pools its pylons, so the barrier
 * recycles in step with the road it stands on.
 *
 * IT IS WHAT MAKES THE OTHER CARRIAGEWAY READ AS THE OTHER CARRIAGEWAY. Two
 * strips of asphalt side by side with a gap between them is a wide road; put a
 * wall down the gap and it is a motorway, and the oncoming headlights behind it
 * become traffic going the other way rather than traffic coming at you.
 *
 * The segments overlap slightly. A curve is approximated as a polyline here and
 * butt-jointed boxes open a wedge of gap on the outside of every bend; the
 * overlap closes it for far less than a mitre would cost.
 */

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _matrix = new THREE.Matrix4();

export class Median {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Road.js').Road} road
   */
  constructor(scene, road) {
    const cfg = config.world.median;
    const roadCfg = config.world.road;

    this.scene = scene;
    this.road = road;
    this.enabled = cfg.enabled;
    this.perChunk = cfg.segmentsPerChunk;
    this.spacing = roadCfg.chunkLength / cfg.segmentsPerChunk;
    this.at = roadLayout().medianCentre;

    this.group = new THREE.Group();
    this.group.name = 'Median';
    scene.add(this.group);

    const count = roadCfg.poolSize * this.perChunk;
    const length = this.spacing + cfg.overlap;

    this.wallGeometry = new THREE.BoxGeometry(cfg.width, cfg.height, length);
    this.capGeometry = new THREE.BoxGeometry(cfg.capWidth, cfg.capHeight, length);

    this.wallMaterial = new THREE.MeshBasicMaterial({ color: cfg.color });
    this.capMaterial = new THREE.MeshBasicMaterial({ color: cfg.capColor, toneMapped: false });

    // Same fade window as the road surface, which closes before anything is
    // ever spawned - so a rebuilt chunk's barrier cannot arrive lit.
    applyDistanceFade(this.wallMaterial, roadCfg.surface.neonFadeStart, roadCfg.surface.neonFadeEnd);
    applyDistanceFade(this.capMaterial, roadCfg.surface.neonFadeStart, roadCfg.surface.neonFadeEnd);

    this.wall = new THREE.InstancedMesh(this.wallGeometry, this.wallMaterial, count);
    this.cap = new THREE.InstancedMesh(this.capGeometry, this.capMaterial, count);

    for (const mesh of [this.wall, this.cap]) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // The instances span the whole pool, far beyond the bounds of one box,
      // so the default per geometry culling test would be wrong.
      mesh.frustumCulled = false;
      mesh.visible = this.enabled;
      this.group.add(mesh);
    }

    this._onChunkBuilt = this._fillChunk.bind(this);
    road.onChunkBuilt(this._onChunkBuilt);
  }

  /**
   * Places every barrier segment belonging to one pool slot.
   * @param {number} slot
   * @param {number} chunkIndex
   */
  _fillChunk(slot, chunkIndex) {
    if (!this.enabled) return;

    const cfg = config.world.median;
    const path = this.road.path;
    const base = slot * this.perChunk;
    const first = chunkIndex * this.perChunk;

    for (let k = 0; k < this.perChunk; k++) {
      const distance = (first + k + 0.5) * this.spacing;
      path.frameAt(distance, _position, _tangent, _lateral);

      // Right handed basis with the wall standing straight up: the road pitches
      // with the terrain but the barrier does not lean with it.
      _forward.crossVectors(_lateral, UP);
      _matrix.makeBasis(_lateral, UP, _forward);

      const x = _position.x + _lateral.x * this.at;
      const z = _position.z + _lateral.z * this.at;

      _matrix.setPosition(x, _position.y + cfg.height * 0.5, z);
      this.wall.setMatrixAt(base + k, _matrix);

      _matrix.setPosition(x, _position.y + cfg.height + cfg.capHeight * 0.5, z);
      this.cap.setMatrixAt(base + k, _matrix);
    }

    this.wall.instanceMatrix.needsUpdate = true;
    this.cap.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.wallGeometry.dispose();
    this.capGeometry.dispose();
    this.wallMaterial.dispose();
    this.capMaterial.dispose();
    this.wall.dispose();
    this.cap.dispose();

    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
    this.road = null;
  }
}
