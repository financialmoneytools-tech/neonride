import * as THREE from 'three';
import { assertPoint, assertSolid } from './assertGeometry.js';

/**
 * GeometryBuilder - merges many small transformed primitives into one buffer.
 *
 * The rider is assembled from several dozen boxes, cylinders, spheres and lathe
 * shells. Left as separate meshes that would be several dozen draw calls for a
 * few hundred triangles; merged per material it is one draw call each.
 *
 * Carries position, normal, uv and colour. Colour matters more than it looks:
 * a material with vertexColors on and no colour attribute reads (0, 0, 0) from
 * WebGL and multiplies the whole mesh to black, so silently dropping it during
 * a merge makes parts vanish rather than merely lose a tint. Parts that set no
 * colour are filled with white, so mixing the two is safe.
 *
 * Sources are disposed as they are added: they exist only to be copied, and
 * they are never uploaded to the GPU.
 */
export class GeometryBuilder {
  constructor() {
    this._parts = [];
    this._vertexCount = 0;
    this._indexCount = 0;
  }

  /** True when nothing has been added yet. */
  get isEmpty() {
    return this._parts.length === 0;
  }

  /**
   * Transforms a primitive and queues it. The source geometry is consumed.
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Matrix4} [matrix] applied in place before copying
   * @returns {GeometryBuilder} this
   */
  add(geometry, matrix) {
    if (matrix) geometry.applyMatrix4(matrix);

    // An unindexed primitive gets a trivial index, so build() has one code path
    if (geometry.index === null) {
      const count = geometry.attributes.position.count;
      const data = count > 65535 ? new Uint32Array(count) : new Uint16Array(count);
      for (let i = 0; i < count; i++) data[i] = i;
      geometry.setIndex(new THREE.BufferAttribute(data, 1));
    }

    // A mirroring matrix reverses the orientation of every triangle. Normals
    // come out right on their own - applyMatrix4 uses the inverse transpose -
    // but the winding does not, so the front faces would be culled instead of
    // the back ones. Flipping the index order puts them back.
    if (matrix && matrix.determinant() < 0) {
      const index = geometry.index.array;
      for (let i = 0; i < index.length; i += 3) {
        const swap = index[i];
        index[i] = index[i + 2];
        index[i + 2] = swap;
      }
    }

    this._parts.push(geometry);
    this._vertexCount += geometry.attributes.position.count;
    this._indexCount += geometry.index.count;
    return this;
  }

  /**
   * @param {string} [name]
   * @returns {THREE.BufferGeometry} merged, with the sources released
   */
  build(name = 'merged') {
    const positions = new Float32Array(this._vertexCount * 3);
    const normals = new Float32Array(this._vertexCount * 3);
    const uvs = new Float32Array(this._vertexCount * 2);

    // Only emit a colour attribute when at least one part carried one, so an
    // ordinary merge does not grow a buffer it has no use for.
    let hasColor = false;
    for (let p = 0; p < this._parts.length; p++) {
      if (this._parts[p].attributes.color) { hasColor = true; break; }
    }
    const colors = hasColor ? new Float32Array(this._vertexCount * 3) : null;
    const indices =
      this._vertexCount > 65535 ? new Uint32Array(this._indexCount) : new Uint16Array(this._indexCount);

    let vertexAt = 0;
    let indexAt = 0;

    for (let p = 0; p < this._parts.length; p++) {
      const part = this._parts[p];
      const position = part.attributes.position;
      const normal = part.attributes.normal;
      const uv = part.attributes.uv;
      const index = part.index;

      positions.set(position.array, vertexAt * 3);
      if (normal) normals.set(normal.array, vertexAt * 3);
      if (uv) uvs.set(uv.array, vertexAt * 2);

      if (colors) {
        const color = part.attributes.color;
        if (color) colors.set(color.array, vertexAt * 3);
        else colors.fill(1, vertexAt * 3, (vertexAt + position.count) * 3);
      }

      for (let i = 0; i < index.count; i++) indices[indexAt + i] = index.array[i] + vertexAt;

      vertexAt += position.count;
      indexAt += index.count;
      part.dispose();
    }

    this._parts.length = 0;

    const geometry = new THREE.BufferGeometry();
    geometry.name = name;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    if (colors) geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeBoundingSphere();
    assertSolid(geometry, name);
    return geometry;
  }
}

const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _direction = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _midpoint = new THREE.Vector3();
const _axis = new THREE.Vector3(0, 1, 0);
const _euler = new THREE.Euler();

/**
 * Adds a tube running between two points. CylinderGeometry is built along +Y,
 * so it is rotated onto the segment direction and moved to the midpoint.
 * @param {GeometryBuilder} builder
 * @param {number[]} from [x, y, z]
 * @param {number[]} to [x, y, z]
 * @param {number} radius
 * @param {number} radialSegments
 * @param {number} [endRadius] tapers toward the end when given
 */
export function addTube(builder, from, to, radius, radialSegments, endRadius = radius) {
  // Named here rather than left to produce NaN. A Vector3 has no [0], so
  // fromArray reads undefined and every coordinate downstream becomes NaN -
  // which renders as nothing and measures as everything.
  assertPoint(from, 'addTube from');
  assertPoint(to, 'addTube to');

  _from.fromArray(from);
  _to.fromArray(to);
  _direction.copy(_to).sub(_from);

  const length = _direction.length();
  if (length === 0) return;

  _direction.divideScalar(length);
  _quaternion.setFromUnitVectors(_axis, _direction);
  _midpoint.copy(_from).addScaledVector(_direction, length * 0.5);
  _matrix.compose(_midpoint, _quaternion, _scale);

  builder.add(new THREE.CylinderGeometry(endRadius, radius, length, radialSegments, 1), _matrix);
}

/**
 * Builds a transform for one part, optionally mirrored through the YZ plane.
 * Mirroring negates x, ry and rz, which is a proper rotation: the winding is
 * preserved, so a mirrored part needs no special material side.
 * @param {number} sign +1 as authored, -1 mirrored to the other side
 * @param {number[]} position [x, y, z]
 * @param {number[]} [rotation] [x, y, z] euler angles
 * @param {THREE.Matrix4} [target]
 * @returns {THREE.Matrix4}
 */
export function partMatrix(sign, position, rotation, target = new THREE.Matrix4()) {
  const rx = rotation ? rotation[0] : 0;
  const ry = rotation ? rotation[1] : 0;
  const rz = rotation ? rotation[2] : 0;

  _midpoint.set(position[0] * sign, position[1], position[2]);
  _quaternion.setFromEuler(_euler.set(rx, ry * sign, rz * sign, 'XYZ'));
  return target.compose(_midpoint, _quaternion, _scale);
}

/**
 * Builds a transform that points a primitive's +Y axis along a direction.
 * LatheGeometry and CylinderGeometry are both authored along +Y, so this is how
 * either one gets aimed down a handlebar or a fork leg.
 * @param {number[]} position [x, y, z]
 * @param {number[]} direction [x, y, z], need not be normalized
 * @param {THREE.Matrix4} [target]
 * @returns {THREE.Matrix4}
 */
export function alignMatrix(position, direction, target = new THREE.Matrix4()) {
  _direction.fromArray(direction).normalize();
  _quaternion.setFromUnitVectors(_axis, _direction);
  _midpoint.fromArray(position);
  return target.compose(_midpoint, _quaternion, _scale);
}

/**
 * Lathe profile helper. Profiles are authored as [radius, distance] pairs so
 * they read the same way in config as they do on paper.
 * @param {number[][]} profile
 * @param {number} segments
 * @returns {THREE.LatheGeometry}
 */
export function latheFromProfile(profile, segments) {
  const points = [];
  for (let i = 0; i < profile.length; i++) {
    points.push(new THREE.Vector2(profile[i][0], profile[i][1]));
  }
  return new THREE.LatheGeometry(points, segments);
}

/**
 * Writes a flat vertex colour over a whole geometry. Used to bake a fixed hue
 * or a brightness into one part before it is merged with others: GeometryBuilder
 * carries the colour attribute through, so a merged mesh can hold several.
 * @param {THREE.BufferGeometry} geometry
 * @param {number|THREE.Color} value a hex colour, or a number used as grey
 */
export function paintVertices(geometry, value) {
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);

  if (typeof value === 'number' && value <= 1) {
    colors.fill(value);
  } else {
    const color = new THREE.Color(value);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}
