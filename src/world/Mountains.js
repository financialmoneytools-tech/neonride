import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { createNoise2D, createFbm2D } from '../utils/noise.js';

/**
 * Mountains - the far ridge silhouettes on both sides of the road.
 *
 * Each ridge is a vertical curtain: one row of peaks over one row of base
 * vertices, with the columns pushed toward and away from the road so the
 * skyline is not a flat wall. The color is baked into the vertices - the peaks
 * carry the mountain color, the base carries the fog color - so the ridges
 * melt into the horizon from below as well as with distance.
 *
 * Two slabs per side leapfrog each other along the travel axis. Their profiles
 * are sampled from the same global noise function, so the moment one slab is
 * moved ahead of the other, its first column lands on exactly the value the
 * other slab's last column already holds: the joins are continuous by
 * construction, not hidden.
 */

const _color = new THREE.Color();
const _fogColor = new THREE.Color();

export class Mountains {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    const cfg = config.world.mountains;

    this.scene = scene;
    this.slabLength = cfg.slabLength;
    this.columns = cfg.columns;

    this.group = new THREE.Group();
    this.group.name = 'Mountains';
    // OFF IS A REAL ANSWER. Galaxy Road is a motorway laid through a galaxy and
    // the sky is the whole point of it; a near black ridge across the lower
    // third of the frame eats the starfield it exists to show. Built either
    // way, because a theme may not allocate - see docs/THEMES.md - and hidden
    // when a theme does not want them.
    this.group.visible = cfg.enabled !== false;
    scene.add(this.group);

    // A seed of its own, so the ridges never echo the shape of the road.
    const rng = createRng(config.world.seed + 977);
    this._fbm = createFbm2D(createNoise2D(rng), cfg.ridge);

    this.material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    });
    this.material.name = 'MountainRidge';

    /** @type {Array<{mesh:THREE.Mesh, positions:Float32Array, lane:number, start:number}>} */
    this.slabs = [];

    for (let layerIndex = 0; layerIndex < cfg.layers.length; layerIndex++) {
      // The index travels with the layer so a slab can find its own entry
      // again when a road change moves the colours and the heights.
      const layer = Object.assign({ index: layerIndex }, cfg.layers[layerIndex]);

      for (let s = 0; s < 2; s++) {
        const sign = s === 0 ? 1 : -1;
        const lane = layerIndex * 100 + s * 50 + 13;

        for (let j = 0; j < cfg.slabsPerLayer; j++) {
          const slab = this._createSlab(layer, sign, lane);
          slab.start = (j - 1) * this.slabLength;
          this._fillSlab(slab);
          this.slabs.push(slab);
          this.group.add(slab.mesh);
        }
      }
    }
  }

  /** Builds one curtain. Called only from the constructor. */
  _createSlab(layer, sign, lane) {
    const cfg = config.world.mountains;
    const columns = this.columns;
    const vertexCount = (columns + 1) * 2;

    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);

    // Peaks carry the layer color, the base carries the fog color.
    for (let i = 0; i <= columns; i++) {
      _color.set(layer.color);
      colors[i * 6] = _color.r;
      colors[i * 6 + 1] = _color.g;
      colors[i * 6 + 2] = _color.b;

      _color.set(config.world.fog.color);
      colors[i * 6 + 3] = _color.r;
      colors[i * 6 + 4] = _color.g;
      colors[i * 6 + 5] = _color.b;
    }

    const index = new Uint16Array(columns * 6);
    let at = 0;
    for (let i = 0; i < columns; i++) {
      const top = i * 2;
      const bottom = top + 1;
      index[at++] = top;
      index[at++] = bottom;
      index[at++] = top + 2;
      index[at++] = bottom;
      index[at++] = bottom + 2;
      index[at++] = top + 2;
    }

    const geometry = new THREE.BufferGeometry();
    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(index, 1));

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.name = 'MountainSlab';
    mesh.position.x = sign * layer.distance;

    return {
      mesh, positions, colors, lane, start: 0,
      sign, layerIndex: layer.index,
      height: layer.height, floor: layer.floor,
    };
  }

  /**
   * Pushes the current config into every slab. Called when a road changes.
   *
   * THE RIDGE COLOUR BUFFER CARRIES TWO THEME VALUES, and that is why this is
   * not just a material colour. The peak row holds the layer's own colour and
   * the base row holds THE FOG COLOUR, which is what makes a ridge melt into
   * the horizon instead of standing on it. Blend the fog and leave the buffer
   * alone and every ridge grows a dark band along its foot.
   *
   * It is 8 slabs of 58 vertices. Rewriting all of it every frame of a blend is
   * cheaper than the branch that would avoid it.
   */
  applyTheme() {
    const cfg = config.world.mountains;
    this.group.visible = cfg.enabled !== false;
    _fogColor.set(config.world.fog.color);

    for (let i = 0; i < this.slabs.length; i++) {
      const slab = this.slabs[i];
      const layer = cfg.layers[slab.layerIndex];
      if (!layer) continue;

      slab.height = layer.height;
      slab.floor = layer.floor;
      slab.mesh.position.x = slab.sign * layer.distance;

      _color.set(layer.color);
      const colors = slab.colors;
      for (let v = 0; v < colors.length; v += 6) {
        colors[v] = _color.r;
        colors[v + 1] = _color.g;
        colors[v + 2] = _color.b;
        colors[v + 3] = _fogColor.r;
        colors[v + 4] = _fogColor.g;
        colors[v + 5] = _fogColor.b;
      }
      slab.mesh.geometry.attributes.color.needsUpdate = true;
      // The profile itself depends on height and floor, so it has to be
      // rewritten too - a slab whose colour moved and whose silhouette did not
      // is a ridge that changes hue without changing place.
      this._fillSlab(slab);
    }
  }

  /** Writes the ridge profile for a slab at its current start distance. */
  _fillSlab(slab) {
    const cfg = config.world.mountains;
    const columns = this.columns;
    const step = this.slabLength / columns;
    const positions = slab.positions;

    slab.mesh.position.z = -slab.start;

    for (let i = 0; i <= columns; i++) {
      const distance = slab.start + i * step;
      const n = this._fbm(distance / cfg.ridge.wavelength, slab.lane);

      // Ridged noise: folding the value at zero turns smooth hills into peaks,
      // and squaring it widens the valleys between them.
      const ridged = (1 - Math.abs(n)) * (1 - Math.abs(n));
      const peak = slab.height * (slab.floor + (1 - slab.floor) * ridged);

      // A second, slower channel pushes each column toward or away from the
      // road, so the ridge line has depth instead of reading as a flat wall.
      const depth = this._fbm(distance / (cfg.ridge.wavelength * 2.7), slab.lane + 7) * cfg.depthJitter;

      const top = i * 6;
      positions[top] = depth;
      positions[top + 1] = peak;
      positions[top + 2] = -i * step;

      positions[top + 3] = depth;
      positions[top + 4] = cfg.baseY;
      positions[top + 5] = -i * step;
    }

    slab.mesh.geometry.attributes.position.needsUpdate = true;
    slab.mesh.geometry.computeBoundingSphere();
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads state.distance
   */
  update(dt, state) {
    const distance = state.distance || 0;
    const cycle = this.slabLength * config.world.mountains.slabsPerLayer;

    for (let i = 0; i < this.slabs.length; i++) {
      const slab = this.slabs[i];
      // Leapfrog the moment a slab is completely behind the camera.
      while (distance > slab.start + this.slabLength) {
        slab.start += cycle;
        this._fillSlab(slab);
      }
    }
  }

  dispose() {
    for (let i = 0; i < this.slabs.length; i++) this.slabs[i].mesh.geometry.dispose();
    this.slabs.length = 0;

    this.material.dispose();
    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
  }
}
