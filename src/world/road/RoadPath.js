import * as THREE from 'three';
import { config } from '../../config.js';
import { createRng } from '../../utils/rng.js';
import { createNoise2D, createFbm2D } from '../../utils/noise.js';

/**
 * RoadPath - the single source of truth for where the road goes.
 *
 * The road runs toward -Z, so "distance" grows forward and world z is -distance.
 * A global, seeded sequence of control points is laid down every pointSpacing
 * units; chunk N owns the control points [N * ppc, (N + 1) * ppc].
 *
 * Seam rule: the curve of a chunk is built from its own control points PLUS two
 * neighbours on each side. A Catmull-Rom segment is defined by the two points it
 * spans and their immediate neighbours, so a segment is only trustworthy when
 * all four exist; at the ends of an open curve three.js invents the missing one
 * and the shape there is an artifact of the point list, not of the path.
 *
 * Two points of padding put every segment a chunk ever evaluates - including the
 * two just outside its span, which RoadChunk samples to get centered tangents at
 * its first and last ring - inside the trustworthy region. Both chunks that meet
 * at a join then evaluate the same segments from the same four points and agree
 * exactly on the boundary ring and on its tangent. One point of padding is not
 * enough: it fixes the shared position but leaves the tangents disagreeing by a
 * quarter of a degree, which opens a seven centimetre step at the ribbon rim.
 *
 * Every method writes into caller supplied vectors: this file allocates nothing
 * after construction.
 */

const UP = new THREE.Vector3(0, 1, 0);

// Independent noise lanes, so the lateral and vertical channels never correlate
const LANE_LATERAL = 0;
const LANE_ELEVATION = 41.7;

// Half the gap used for the finite difference tangent, in road distance units
const TANGENT_DELTA = 0.5;

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

export class RoadPath {
  constructor() {
    const road = config.world.road;

    this.chunkLength = road.chunkLength;
    this.pointsPerChunk = road.pointsPerChunk;
    this.pointSpacing = road.chunkLength / road.pointsPerChunk;

    const rng = createRng(config.world.seed);
    this._fbm = createFbm2D(createNoise2D(rng), road.path.fbm);

    // Two padding points on each side of the chunk span
    const pointCount = road.pointsPerChunk + 5;
    const points = [];
    for (let i = 0; i < pointCount; i++) points.push(new THREE.Vector3());

    // Centripetal parameterization: it cannot overshoot or form a cusp, which
    // matters because a cusp in the path would read as a kink in the road.
    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);

    // getPoint maps t over (pointCount - 1) segments. The chunk itself spans
    // the segments between local point 2 and local point pointCount - 3.
    const segments = pointCount - 1;
    this.tStart = 2 / segments;
    this.tEnd = (segments - 2) / segments;
    this.tSpan = this.tEnd - this.tStart;

    this._loadedChunk = null;
  }

  /**
   * World position of a global control point.
   * @param {number} index may be negative for the padding behind chunk 0
   * @param {THREE.Vector3} target
   * @returns {THREE.Vector3} target
   */
  controlPoint(index, target) {
    const p = config.world.road.path;
    const s = index * this.pointSpacing;

    // Shaping the noise through mix(n, n^3, bias) squashes the small values
    // toward zero, which turns the quiet stretches of the noise into real
    // straights while leaving the big swings as full S curves.
    const n = this._fbm(s / p.lateralWavelength, LANE_LATERAL);
    const bias = p.lateralStraightBias;
    const shaped = n * (1 - bias + bias * n * n);

    const height = this._fbm(s / p.elevationWavelength, LANE_ELEVATION);

    return target.set(shaped * p.lateralAmplitude, height * p.elevationAmplitude, -s);
  }

  /**
   * Points the shared curve at one chunk. Cached, so repeated calls for the
   * same chunk cost nothing.
   * @param {number} chunkIndex
   * @returns {THREE.CatmullRomCurve3}
   */
  useChunk(chunkIndex) {
    if (this._loadedChunk === chunkIndex) return this.curve;

    const points = this.curve.points;
    const first = chunkIndex * this.pointsPerChunk - 2;
    for (let i = 0; i < points.length; i++) this.controlPoint(first + i, points[i]);

    this._loadedChunk = chunkIndex;
    return this.curve;
  }

  /** Curve parameter for a position inside a chunk, fraction in [0, 1]. */
  tAt(fraction) {
    return this.tStart + fraction * this.tSpan;
  }

  /**
   * World position at a distance along the road.
   * @param {number} distance
   * @param {THREE.Vector3} target
   * @returns {THREE.Vector3} target
   */
  pointAt(distance, target) {
    const chunkIndex = Math.floor(distance / this.chunkLength);
    const fraction = distance / this.chunkLength - chunkIndex;
    return this.useChunk(chunkIndex).getPoint(this.tAt(fraction), target);
  }

  /**
   * Position plus the horizontal frame at a distance along the road.
   * outLateral points to the rider's RIGHT. cross(tangent, UP) with the road
   * running toward -Z yields +X, and +X is screen right for a camera looking
   * down -Z - this used to be documented as left, and every consumer below
   * inherited the mistake. Anything measuring "across" is positive to the right.
   * @param {number} distance
   * @param {THREE.Vector3} outPosition
   * @param {THREE.Vector3} outTangent
   * @param {THREE.Vector3} outLateral
   */
  frameAt(distance, outPosition, outTangent, outLateral) {
    this.pointAt(distance, outPosition);
    this.pointAt(distance + TANGENT_DELTA, _a);
    this.pointAt(distance - TANGENT_DELTA, _b);

    outTangent.copy(_a).sub(_b).normalize();
    outLateral.crossVectors(outTangent, UP).normalize();
  }
}

export { UP };
