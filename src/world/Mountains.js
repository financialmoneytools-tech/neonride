import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { createNoise2D, createFbm2D } from '../utils/noise.js';
import { ridgeShade } from './mountains/shade.js';

/**
 * Mountains - the ridges on the horizon, as a RING around the rider.
 *
 * ================= WHY A RING, AND NOT CURTAINS =================
 *
 * This used to be four flat curtains - two per layer, at a fixed distance
 * either side of the road, leapfrogging along the travel axis. A flat plane
 * at a fixed lateral offset is fine until the road curves toward it, and then
 * the camera is looking almost along it: a plane seen edge-on projects as a
 * solid shape with a dead straight edge, and it grows without limit as the
 * road turns into it.
 *
 * Reported from captures of all six roads: "a solid near-black wedge with a
 * hard straight edge taking a third of the frame" - right on Sunset Highway
 * and Red Planet, left on Neon Metropolis, absent from Galaxy Road, which is
 * the one road with no mountains. Measured by ablation with
 * tools/skyline-check.mjs: the ridge descended 0.17 to 0.34 of the way from
 * the horizon to the bottom of the frame. A range on the horizon does not do
 * that; a wall beside the lens does.
 *
 * Pushing the curtains further out does not fix it and had already been tried
 * twice - config/themes/redPlanet.js documents moving its walls from 340 to
 * 900 and the slab surviving. It cannot be fixed by distance, because the
 * fault is the geometry: a plane at a FIXED POSITION can always be
 * approached, and anything approached closely enough is a wall.
 *
 * So the ridges are now a RING at a fixed distance from the CAMERA, the way
 * the sky is. They travel with the rider, so nothing can ever get closer than
 * `layer.distance`, and there is no direction to turn that brings one near.
 *
 * ================= WHAT KEEPS IT FROM BEING STATIC =================
 *
 * A ring that moved with the rider and kept its shape would be a painted
 * backdrop. The profile is sampled from the noise at each vertex's WORLD
 * position, so as the rider moves the ring reads a different part of the same
 * global field: ranges slide past at the sides and open out slowly ahead,
 * which is what distant terrain does. Nothing is stored between frames and
 * there is no seam to join, because there are no longer any pieces.
 *
 * ================= THE ROAD RUNS DOWN A VALLEY =================
 *
 * A closed ring would put a wall across the vanishing point, which is worse
 * than the fault it replaces - the road has to run into open horizon. So the
 * ridge height is scaled down toward the road's own axis, ahead and behind,
 * by `gap`. What that draws is a valley with ranges up both sides and a low
 * saddle at each end, which is the shape the four curtains were gesturing at.
 */

const _fog = new THREE.Color();
const _layerColor = new THREE.Color();

/** How many layers to build for, so a theme can select but never allocate. */
function maxLayers() {
  let most = config.world.mountains.layers.length;
  for (const theme of Object.values(config.themes)) {
    const layers = theme.world && theme.world.mountains && theme.world.mountains.layers;
    if (layers && layers.length > most) most = layers.length;
  }
  return most;
}

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();

export class Mountains {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Road.js').Road} road for its path: where the rider is
   *   and which way the road is pointing, which is where the valley goes
   */
  constructor(scene, road) {
    const cfg = config.world.mountains;

    this.scene = scene;
    this.path = road.path;
    this.segments = cfg.segments;

    this.group = new THREE.Group();
    this.group.name = 'Mountains';
    // OFF IS A REAL ANSWER. Galaxy Road is a motorway laid through a galaxy
    // and the sky is the whole point of it; a near black ridge across the
    // lower third of the frame eats the starfield it exists to show. Built
    // either way, because a theme may not allocate - see docs/THEMES.md.
    this.group.visible = cfg.enabled !== false;
    scene.add(this.group);

    // A seed of its own, so the ridges never echo the shape of the road.
    const rng = createRng(config.world.seed + 977);
    this._fbm = createFbm2D(createNoise2D(rng), cfg.ridge);

    this.material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      // The rider is INSIDE the ring, so what is drawn is its far wall seen
      // from within. Both sides, because a ring that shows only its outside
      // is an invisible ring.
      side: THREE.DoubleSide,
    });
    this.material.name = 'MountainRidge';

    /** @type {Array<{mesh:THREE.Mesh, positions:Float32Array, colors:Float32Array}>} */
    this.rings = [];
    for (let i = 0; i < maxLayers(); i++) this.rings.push(this._createRing(i));

    this._heading = 0;
    this.applyTheme();
  }

  /** Builds one ring. Called only from the constructor. */
  _createRing(layerIndex) {
    const segments = this.segments;
    // The seam column is duplicated rather than wrapped, so the noise is
    // sampled at the same world point twice and the join closes exactly.
    const columns = segments + 1;
    const positions = new Float32Array(columns * 2 * 3);
    const colors = new Float32Array(columns * 2 * 3);

    const index = new Uint16Array(segments * 6);
    let at = 0;
    for (let i = 0; i < segments; i++) {
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
    const position = new THREE.BufferAttribute(positions, 3);
    position.setUsage(THREE.DynamicDrawUsage);
    const color = new THREE.BufferAttribute(colors, 3);
    color.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', position);
    geometry.setAttribute('color', color);
    geometry.setIndex(new THREE.BufferAttribute(index, 1));

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.name = 'MountainRing' + layerIndex;
    // The ring is always around the camera, so the test would always pass and
    // the bounding sphere would have to be recomputed every frame to say so.
    mesh.frustumCulled = false;
    this.group.add(mesh);

    return { mesh, positions, colors, layerIndex, layer: null };
  }

  /**
   * Selects each ring's layer and switches off the ones this theme does not
   * use. The profile itself is written every frame by `update`, so there is
   * nothing to rewrite here - which is the other thing the ring bought: a
   * theme change is four assignments rather than eight buffer rewrites.
   */
  applyTheme() {
    const cfg = config.world.mountains;
    this.group.visible = cfg.enabled !== false;
    for (const ring of this.rings) {
      ring.layer = cfg.layers[ring.layerIndex] || null;
      ring.mesh.visible = !!ring.layer;
    }
  }

  /**
   * Writes one ring's profile around the rider.
   * @param {object} ring
   * @param {number} x world x of the rider
   * @param {number} z world z of the rider
   * @param {number} y ground height under the rider
   */
  _fill(ring, x, y, z) {
    const cfg = config.world.mountains;
    const layer = ring.layer;
    if (!layer) return;

    const positions = ring.positions;
    const colors = ring.colors;
    const segments = this.segments;
    const radius = layer.distance;
    const wavelength = cfg.ridge.wavelength;
    const jitter = cfg.radialJitter;
    const gap = cfg.gap;

    _fog.set(config.world.fog.color);
    _layerColor.set(layer.color);

    ring.mesh.position.set(x, y, z);

    // Two passes: the profile first, then the shading, because a face's
    // brightness depends on which way it turns and that is only known once
    // its neighbours exist.
    for (let i = 0; i <= segments; i++) {
      // theta 0 is straight AHEAD down the road, and -Z is forward, which is
      // why the z term is negated. Everything below is measured from the
      // road's own direction rather than from the world axes, so the valley
      // stays in front of the bike as the road bends.
      const theta = (i / segments) * Math.PI * 2;
      const sin = Math.sin(theta + this._heading);
      const cos = -Math.cos(theta + this._heading);

      // A slow radial wobble, so the ring is not a circle. Sampled from the
      // same field as the profile but at a longer wavelength.
      const wobble = this._fbm((x + sin * radius) / (wavelength * 3.1),
        (z + cos * radius) / (wavelength * 3.1));
      const r = radius * (1 + wobble * jitter);

      const px = sin * r;
      const pz = cos * r;
      const n = this._fbm((x + px) / wavelength, (z + pz) / wavelength);

      // Ridged noise: folding the value at zero turns smooth hills into
      // peaks, and squaring it widens the valleys between them.
      const ridged = (1 - Math.abs(n)) * (1 - Math.abs(n));

      // THE VALLEY THE ROAD RUNS DOWN, and the reason a ring is safe at all.
      // A closed ring puts a wall across the vanishing point, which is worse
      // than the fault it replaces. `off` is the angle to the nearest end of
      // the road's own axis - zero straight ahead AND straight behind, a
      // right angle out to the sides - so the height falls away to `floor`
      // at both ends and the road runs out through a saddle.
      const off = Math.min(theta, Math.PI * 2 - theta);
      const open = gap.floor + (1 - gap.floor)
        * smoothstep(gap.halfAngle, gap.halfAngle + gap.falloff,
          Math.min(off, Math.PI - off));

      const peak = layer.height * open * (layer.floor + (1 - layer.floor) * ridged);

      const at = i * 6;
      positions[at] = px;
      positions[at + 1] = peak;
      positions[at + 2] = pz;
      positions[at + 3] = px;
      positions[at + 4] = cfg.baseY;
      positions[at + 5] = pz;
    }

    ridgeShade(positions, colors, segments, _layerColor, _fog, cfg.shade);

    ring.mesh.geometry.attributes.position.needsUpdate = true;
    ring.mesh.geometry.attributes.color.needsUpdate = true;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state
   */
  update(dt, state) {
    if (!this.group.visible) return;

    // EVERY FRAME, not on a distance step the way world/Ground.js rebuilds.
    // The ring is positioned on the rider, so a profile written every few
    // metres would be glued to the camera between rebuilds and then jump: at
    // a 28 metre step against a 420 unit radius that is a four degree lurch
    // on the horizon. It costs two rings of 121 columns of fractal noise,
    // which is about the same as one frame of weather.
    this.path.frameAt(Math.max(0, state.distance || 0), _position, _tangent, _lateral);
    // The tangent runs in the direction of travel and forward is -Z.
    this._heading = Math.atan2(_tangent.x, -_tangent.z);
    for (const ring of this.rings) {
      this._fill(ring, _position.x, _position.y, _position.z);
    }
  }

  dispose() {
    for (const ring of this.rings) ring.mesh.geometry.dispose();
    this.rings.length = 0;
    this.material.dispose();
    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
  }
}

/** @param {number} a @param {number} b @param {number} t */
function smoothstep(a, b, t) {
  const x = Math.max(0, Math.min(1, (t - a) / Math.max(1e-6, b - a)));
  return x * x * (3 - 2 * x);
}
