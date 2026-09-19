import * as THREE from 'three';
import { config } from '../config.js';

/**
 * Ground - the plain the road is laid on.
 *
 * ================= WHY THIS DID NOT EXIST, AND HAD TO =================
 *
 * Until this there was no ground in the game. There was a ROAD - a ribbon
 * about twenty metres across, carrying its own verge and fading to
 * `road.surface.voidColor` at the rim - and beyond that rim there was the sky
 * dome and nothing else. Every road was a strip of tarmac suspended in the
 * sky, and everything standing beside it was suspended with it.
 *
 * That went unnoticed for as long as every sky was black, because a black void
 * beside a dark road reads as night. Sunset Highway and Red Planet broke it
 * the moment they arrived: against a hot orange horizon the void is BRIGHT,
 * and what the rider sees is boulders and hills floating in mid-air with
 * daylight underneath them. Reported as "flat orange polygons hang in mid-air
 * above the horizon, unidentifiable as anything" and "mountains sit above the
 * ground with a visible gap" - and both are one fault, which is this one. The
 * props were never misplaced: world/Scenery.js puts every origin on the path's
 * own height and world/scenery/props.js builds every prop with its base at
 * that origin. There was simply nothing under them.
 *
 * ================= IT UNDULATES, AND THAT IS THE WHOLE DESIGN =================
 *
 * The road is not flat. `road.path.elevationAmplitude` is 6 units over a 1500
 * unit wavelength, so a flat plane at the camera's own height would sit up to
 * six units out at the far end of what is visible - which on a prop five
 * hundred metres away is a few pixels of exactly the floating this exists to
 * stop, and at the wrong sign would bury the road itself.
 *
 * So the ground is a strip of rows laid ALONG the path, each row taking its
 * height from the path at that distance. Across its width it is flat, because
 * the road has no cross slope. That means one height per row rather than one
 * per vertex: 3 columns by `rows` rows, rewritten in place every frame, which
 * is a few hundred float writes and no allocation.
 *
 * ================= COMFORT =================
 *
 * Nothing on it moves. It carries no texture, no pattern and no scroll, so it
 * adds no optic flow at all - it is the one large surface in the project that
 * is motion-free by construction, and it makes the road's own speed cues read
 * BETTER by giving them something still to be measured against. There is
 * nothing here for `motionScale()` to scale.
 */

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();

export class Ground {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Road.js').Road} road for its path, which owns the height
   */
  constructor(scene, road) {
    this.scene = scene;
    this.road = road;
    this.path = road.path;

    const cfg = config.world.ground;
    this.rows = cfg.rows;

    // Three columns: the two rims and a centre one. The centre column exists
    // so the strip can bend with the path's lateral swing without the rims
    // having to reach absurdly far to cover the inside of a curve.
    this.columns = 3;
    const vertices = this.columns * (this.rows + 1);

    const positions = new Float32Array(vertices * 3);
    const index = new Uint16Array(this.rows * (this.columns - 1) * 6);
    let at = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns - 1; c++) {
        const a = r * this.columns + c;
        const b = a + 1;
        const d = a + this.columns;
        const e = d + 1;
        index[at++] = a; index[at++] = d; index[at++] = b;
        index[at++] = b; index[at++] = d; index[at++] = e;
      }
    }

    const geometry = new THREE.BufferGeometry();
    const attribute = new THREE.BufferAttribute(positions, 3);
    attribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', attribute);
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    // Flat and lit only by fog and its own colour, like everything else here.
    geometry.setAttribute('normal', new THREE.BufferAttribute(
      new Float32Array(vertices * 3).fill(0), 3));
    for (let i = 0; i < vertices; i++) geometry.attributes.normal.setY(i, 1);

    this.positions = positions;
    this.geometry = geometry;
    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.world.road.surface.groundColor),
      fog: true,
      // No depth write. The road ribbon sits a few centimetres above this and
      // has to win every pixel it covers; writing depth from a surface that
      // large and that close underneath is how a ribbon starts to shimmer.
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = 'Ground';
    this.mesh.frustumCulled = false;
    // Before everything. It is the floor: nothing may be drawn behind it and
    // everything is drawn on top of it.
    this.mesh.renderOrder = -2;
    scene.add(this.mesh);

    this._distance = 0;
    this._fill(0);
  }

  /**
   * The height of the ground at a distance along the road. The single source
   * for it, so tools/grounded-check.mjs asks the same question the geometry
   * answers rather than a reimplementation of it.
   * @param {number} along
   * @returns {number}
   */
  heightAt(along) {
    this.path.frameAt(Math.max(0, along), _position, _tangent, _lateral);
    return _position.y;
  }

  /**
   * Lays the rows out from `distance`, which is where the rider is.
   * @param {number} distance
   */
  _fill(distance) {
    const cfg = config.world.ground;
    const positions = this.positions;
    const span = cfg.ahead + cfg.behind;

    for (let r = 0; r <= this.rows; r++) {
      // Rows bunch up near the rider and spread out toward the horizon, which
      // is where the height matters least and the pixels are fewest.
      const t = r / this.rows;
      const along = distance - cfg.behind + span * t * t;
      this.path.frameAt(Math.max(0, along), _position, _tangent, _lateral);
      const y = _position.y - cfg.sink;

      for (let c = 0; c < this.columns; c++) {
        const side = c - 1; // -1, 0, 1
        const at = (r * this.columns + c) * 3;
        positions[at] = _position.x + side * cfg.halfWidth;
        positions[at + 1] = y;
        positions[at + 2] = _position.z;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  /** Copies the theme's ground colour onto the material. */
  applyTheme() {
    this.material.color.set(config.world.road.surface.groundColor);
    this.mesh.visible = config.world.ground.enabled !== false;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads state.distance
   */
  update(dt, state) {
    const distance = state.distance || 0;
    // Only when the rider has actually moved along it. The step is small
    // enough that the horizon never visibly jumps and large enough that this
    // is not a buffer upload every frame.
    if (Math.abs(distance - this._distance) < config.world.ground.step) return;
    this._distance = distance;
    this._fill(distance);
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    this.scene = null;
    this.road = null;
    this.path = null;
  }
}
