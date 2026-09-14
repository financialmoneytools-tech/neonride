import * as THREE from 'three';
import { config } from '../../config.js';
import { UP } from './RoadPath.js';

/**
 * RoadChunk - one pooled slice of road, about chunkLength units long.
 *
 * The geometry is allocated once and never again. Recycling a chunk rewrites
 * the position, normal and aAlong arrays in place; the index buffer and the
 * aAcross attribute are constant for the life of the chunk.
 *
 * Vertices are stored in chunk local space and the mesh is moved to the chunk
 * origin instead. World coordinates grow without bound as the ride goes on, and
 * a float32 position attribute would start to quantize after a few hundred
 * thousand units. Keeping the local coordinates inside one chunk means the only
 * big number is the model matrix translation, which three computes in double
 * precision and collapses against the view matrix before upload.
 */

const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();
const _normal = new THREE.Vector3();

export class RoadChunk {
  /** @param {THREE.Material} material shared by every chunk in the pool */
  constructor(material) {
    const road = config.world.road;

    this.chunkLength = road.chunkLength;
    this.ribbonHalfWidth = road.halfWidth * road.shoulderScale;
    this.rings = road.lengthSegments + 1;
    this.columns = road.widthSegments + 1;

    // The along distance wraps at an exact multiple of every strip period, so
    // the wrap cannot show up in the shader while the accumulated value stays
    // small enough for float32 to resolve the dash edges cleanly.
    this.alongWrap = road.strips.patternLength * road.strips.wrapCycles;

    /** Global index of the chunk this slot currently holds. */
    this.chunkIndex = -1;

    const vertexCount = this.rings * this.columns;

    this._positions = new Float32Array(vertexCount * 3);
    this._normals = new Float32Array(vertexCount * 3);
    this._along = new Float32Array(vertexCount);

    // Curve samples: one ring each, plus one extra sample at each end so every
    // ring gets a centered finite difference tangent. The end tangents are then
    // computed from samples the neighbouring chunk shares, which is what makes
    // the shading continuous across a join and not just the positions.
    this._centers = [];
    for (let i = 0; i < this.rings + 2; i++) this._centers.push(new THREE.Vector3());

    /** Accumulated chord length of every ring, from the chunk start. */
    this._lengths = new Float64Array(this.rings);

    this.geometry = new THREE.BufferGeometry();

    const position = new THREE.BufferAttribute(this._positions, 3);
    const normal = new THREE.BufferAttribute(this._normals, 3);
    const along = new THREE.BufferAttribute(this._along, 1);
    position.setUsage(THREE.DynamicDrawUsage);
    normal.setUsage(THREE.DynamicDrawUsage);
    along.setUsage(THREE.DynamicDrawUsage);

    this.geometry.setAttribute('position', position);
    this.geometry.setAttribute('normal', normal);
    this.geometry.setAttribute('aAlong', along);
    this.geometry.setAttribute('aAcross', RoadChunk._buildAcross(this.rings, this.columns));
    this.geometry.setIndex(RoadChunk._buildIndex(this.rings, this.columns));

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.name = 'RoadChunk';
    this.mesh.matrixAutoUpdate = true;
  }

  /** Lateral coordinate, -1 at the left rim and +1 at the right. Constant. */
  static _buildAcross(rings, columns) {
    const data = new Float32Array(rings * columns);
    for (let c = 0; c < columns; c++) {
      const across = -1 + (2 * c) / (columns - 1);
      for (let i = 0; i < rings; i++) data[i * columns + c] = across;
    }
    return new THREE.BufferAttribute(data, 1);
  }

  /** Quad strip winding, front face up. Constant. */
  static _buildIndex(rings, columns) {
    const quads = (rings - 1) * (columns - 1);
    const vertexCount = rings * columns;
    const data = vertexCount > 65535 ? new Uint32Array(quads * 6) : new Uint16Array(quads * 6);

    let at = 0;
    for (let i = 0; i < rings - 1; i++) {
      for (let c = 0; c < columns - 1; c++) {
        const a = i * columns + c;
        const b = a + 1;
        const d = a + columns;
        const e = d + 1;
        data[at++] = a;
        data[at++] = b;
        data[at++] = d;
        data[at++] = b;
        data[at++] = e;
        data[at++] = d;
      }
    }

    return new THREE.BufferAttribute(data, 1);
  }

  /**
   * Points this slot at a different stretch of road. Allocates nothing.
   * @param {import('./RoadPath.js').RoadPath} path
   * @param {number} chunkIndex global chunk index
   */
  rebuild(path, chunkIndex) {
    this.chunkIndex = chunkIndex;

    const rings = this.rings;
    const columns = this.columns;
    const centers = this._centers;
    const lengths = this._lengths;
    const halfWidth = this.ribbonHalfWidth;

    // Chunk local space: the origin sits on the travel axis at the chunk start.
    const originZ = -chunkIndex * this.chunkLength;
    this.mesh.position.set(0, 0, originZ);

    const curve = path.useChunk(chunkIndex);
    const step = 1 / (rings - 1);
    for (let i = 0; i < rings + 2; i++) {
      curve.getPoint(path.tAt((i - 1) * step), centers[i]);
    }

    // Measure the chunk by its own chords, then normalize back onto the nominal
    // chunk length. Uniform curve parameter is not uniform arc length, and
    // without this the neon pattern would jump by a couple of percent at every
    // join; with it the pattern only stretches, continuously and invisibly.
    lengths[0] = 0;
    for (let i = 1; i < rings; i++) {
      lengths[i] = lengths[i - 1] + centers[i + 1].distanceTo(centers[i]);
    }
    const measured = lengths[rings - 1];
    const alongScale = measured > 0 ? this.chunkLength / measured : 1;

    const start = chunkIndex * this.chunkLength;
    const alongBase = start - Math.floor(start / this.alongWrap) * this.alongWrap;

    const positions = this._positions;
    const normals = this._normals;
    const along = this._along;

    for (let i = 0; i < rings; i++) {
      const center = centers[i + 1];

      _tangent.copy(centers[i + 2]).sub(centers[i]).normalize();
      // The lateral axis stays horizontal, so the road never banks; only its
      // pitch follows the elevation change.
      _lateral.crossVectors(_tangent, UP).normalize();
      _normal.crossVectors(_lateral, _tangent);

      const ringAlong = alongBase + lengths[i] * alongScale;

      for (let c = 0; c < columns; c++) {
        const index = i * columns + c;
        const across = (-1 + (2 * c) / (columns - 1)) * halfWidth;
        const at = index * 3;

        positions[at] = center.x + _lateral.x * across;
        positions[at + 1] = center.y + _lateral.y * across;
        positions[at + 2] = center.z + _lateral.z * across - originZ;

        normals[at] = _normal.x;
        normals[at + 1] = _normal.y;
        normals[at + 2] = _normal.z;

        along[index] = ringAlong;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
    this.geometry.attributes.aAlong.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  dispose() {
    this.geometry.dispose();
  }
}
