import * as THREE from 'three';
import { config } from '../../config.js';
import { GeometryBuilder } from '../../utils/geometry.js';
import { createStarTexture } from '../../utils/textures.js';
import { applyDistanceFade } from '../../utils/distanceFade.js';

/**
 * VehicleMesh - the four instanced meshes every vehicle is drawn from.
 *
 * body   dark shell, one merged geometry of box and cabin
 * strip  emissive flank strips, tinted per vehicle through instanceColor
 * tail   emissive rear lights, one fixed colour
 * glow   additive blob on the road underneath, a single textured quad
 *
 * Four draw calls, whatever config.world.traffic.count says. A vehicle costs
 * triangles and four matrix writes a frame; it does not cost a draw call.
 *
 * Everything carries the same distance fade the road and the pylons use, so a
 * vehicle resolves out of the fog instead of appearing on a stretch of road
 * that is still dark.
 */
export class VehicleMesh {
  /** @param {number} count pool size */
  constructor(count) {
    const cfg = config.world.traffic.vehicle;
    const road = config.world.road.surface;

    this.count = count;
    this.group = new THREE.Group();
    this.group.name = 'Traffic';

    this.geometries = [];
    this.materials = [];
    this.meshes = [];

    const body = this._buildBody(cfg);
    const strip = this._buildStrips(cfg);
    const tail = this._buildTails(cfg);

    this.bodyMaterial = new THREE.MeshBasicMaterial({ color: cfg.bodyColor });
    this.stripMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.tailMaterial = new THREE.MeshBasicMaterial({ color: cfg.tail.color, toneMapped: false });

    for (const material of [this.bodyMaterial, this.stripMaterial, this.tailMaterial]) {
      applyDistanceFade(material, road.neonFadeStart, road.neonFadeEnd);
      this.materials.push(material);
    }

    this.body = this._instance(body, this.bodyMaterial, 'TrafficBody');
    this.strip = this._instance(strip, this.stripMaterial, 'TrafficStrip');
    this.tail = this._instance(tail, this.tailMaterial, 'TrafficTail');

    this._buildGlow(cfg.glow);
  }

  /** @returns {THREE.InstancedMesh} */
  _instance(geometry, material, name) {
    const mesh = new THREE.InstancedMesh(geometry, material, this.count);
    mesh.name = name;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Instances are spread over a kilometre of road, so the bounds of one
    // vehicle are the wrong thing to cull against.
    mesh.frustumCulled = false;
    this.group.add(mesh);
    this.geometries.push(geometry);
    this.meshes.push(mesh);
    return mesh;
  }

  /** Shell plus cabin, merged so the pair is a single instanced draw. */
  _buildBody(cfg) {
    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();

    builder.add(
      new THREE.BoxGeometry(cfg.width, cfg.height, cfg.length),
      matrix.makeTranslation(0, 0, 0),
    );

    const cabin = cfg.cabin;
    builder.add(
      new THREE.BoxGeometry(cabin.width, cabin.height, cabin.length),
      matrix.makeTranslation(0, cfg.height * 0.5 + cabin.height * 0.5, cabin.offset),
    );

    return builder.build('traffic-body');
  }

  /** A thin emissive bar down each flank. */
  _buildStrips(cfg) {
    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();
    const strip = cfg.strip;
    const length = cfg.length * strip.lengthScale;

    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      builder.add(
        new THREE.BoxGeometry(0.04, strip.height, length),
        matrix.makeTranslation(sign * (cfg.width * 0.5 + strip.inset), strip.y, 0),
      );
    }

    return builder.build('traffic-strip');
  }

  /** Two rear lights. The rider only ever sees a vehicle from behind. */
  _buildTails(cfg) {
    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();
    const tail = cfg.tail;

    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      builder.add(
        new THREE.BoxGeometry(tail.width, tail.height, 0.05),
        matrix.makeTranslation(sign * tail.spacing, tail.y, cfg.length * 0.5),
      );
    }

    const bar = tail.bar;
    builder.add(
      new THREE.BoxGeometry(bar.width, bar.height, 0.05),
      matrix.makeTranslation(0, bar.y, cfg.length * 0.5),
    );

    return builder.build('traffic-tail');
  }

  /** Additive blob under the vehicle, sold by a radial texture not by geometry. */
  _buildGlow(cfg) {
    this.glowTexture = createStarTexture(
      { coreStop: 0.06, coreAlpha: 0.85, midStop: 0.3, midAlpha: 0.35, tailStop: 0.62, tailAlpha: 0.08 },
      cfg.textureSize,
    );
    this.glowTexture.name = 'traffic-glow';

    const geometry = new THREE.PlaneGeometry(cfg.size, cfg.size);
    geometry.rotateX(-Math.PI / 2); // lie it on the road

    this.glowMaterial = new THREE.MeshBasicMaterial({
      map: this.glowTexture,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: cfg.opacity,
      toneMapped: false,
      // Additive geometry must never take fog. Fog mixes TOWARD the fog colour,
      // and mixing an additive surface toward a colour adds that colour: a
      // distant glow would brighten the frame instead of fading out of it, and
      // sixteen of them wash the whole screen teal. Every additive material in
      // this project is fog: false for the same reason; distance falloff comes
      // from the shared fade below instead.
      fog: false,
    });
    applyDistanceFade(
      this.glowMaterial,
      config.world.road.surface.neonFadeStart,
      config.world.road.surface.neonFadeEnd,
    );
    this.materials.push(this.glowMaterial);

    this.glow = this._instance(geometry, this.glowMaterial, 'TrafficGlow');
    // Drawn after the road so the additive blend lands on top of it.
    this.glow.renderOrder = 1;
  }

  /** @returns {number} triangles drawn per vehicle across all four meshes */
  get trianglesPerVehicle() {
    let total = 0;
    for (let i = 0; i < this.geometries.length; i++) {
      total += this.geometries[i].index.count / 3;
    }
    return total;
  }

  dispose() {
    for (let i = 0; i < this.geometries.length; i++) this.geometries[i].dispose();
    for (let i = 0; i < this.materials.length; i++) this.materials[i].dispose();
    for (let i = 0; i < this.meshes.length; i++) this.meshes[i].dispose();
    this.glowTexture.dispose();
    this.group.clear();
  }
}
