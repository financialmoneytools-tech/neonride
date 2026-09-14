import * as THREE from 'three';
import { config } from '../../config.js';
import { GeometryBuilder } from '../../utils/geometry.js';
import { createStarTexture } from '../../utils/textures.js';
import { applyDistanceFade } from '../../utils/distanceFade.js';

/**
 * VehicleMesh - the instanced meshes for ONE vehicle type.
 *
 *   body    dark shell and cabin, merged
 *   strip   flank strips plus the rear outline, tinted per vehicle
 *   tail    rear lights, fixed red
 *   glow    additive: the halo behind the rear face and the blob on the road,
 *           merged into one geometry with their relative brightness baked into
 *           vertex colours, so the pair costs one draw call instead of two
 *   beacon  roof lights, only built for a type that asks for them
 *
 * Four draw calls per type, five for the ambulance. A vehicle within a type
 * costs triangles and four matrix writes a frame, never a draw call.
 *
 * Silhouette is what separates the types at distance. A van reads as a van
 * because it is a tall slab, not because it has a wing mirror, so the geometry
 * here stays deliberately blunt.
 */
export class VehicleMesh {
  /**
   * @param {object} type one entry from config.world.traffic.types
   * @param {number} count pool size for this type
   */
  constructor(type, count) {
    const shared = config.world.traffic.vehicle;
    const road = config.world.road.surface;

    this.type = type;
    this.count = count;
    this.group = new THREE.Group();
    this.group.name = 'Traffic_' + type.name;

    this.geometries = [];
    this.materials = [];
    this.meshes = [];

    this.bodyMaterial = new THREE.MeshBasicMaterial({ color: shared.bodyColor });
    this.stripMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.tailMaterial = new THREE.MeshBasicMaterial({ color: shared.tail.color, toneMapped: false });

    for (const material of [this.bodyMaterial, this.stripMaterial, this.tailMaterial]) {
      applyDistanceFade(material, road.neonFadeStart, road.neonFadeEnd);
      this.materials.push(material);
    }

    this.body = this._instance(this._buildBody(type), this.bodyMaterial, 'Body');
    this.strip = this._instance(this._buildStrips(type, shared), this.stripMaterial, 'Strip');
    this.tail = this._instance(this._buildTails(type, shared), this.tailMaterial, 'Tail');
    this._buildGlow(type, shared, road);
    if (type.beacon) this._buildBeacon(type, road);
  }

  _instance(geometry, material, suffix) {
    const mesh = new THREE.InstancedMesh(geometry, material, this.count);
    mesh.name = 'Traffic_' + this.type.name + '_' + suffix;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Instances span a kilometre of road, so the bounds of one vehicle are the
    // wrong thing to cull against.
    mesh.frustumCulled = false;
    this.group.add(mesh);
    this.geometries.push(geometry);
    this.meshes.push(mesh);
    return mesh;
  }

  /** Shell plus cabin. The cabin is what gives each type its profile. */
  _buildBody(type) {
    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();
    const size = type.size;

    builder.add(new THREE.BoxGeometry(size.width, size.height, size.length), matrix.identity());

    const cabin = type.cabin;
    const roof = new THREE.BoxGeometry(cabin.width, cabin.height, cabin.length);
    // Taper the roof inward so a cabin reads as a cabin and not a second box.
    const position = roof.attributes.position;
    for (let i = 0; i < position.count; i++) {
      if (position.getY(i) > 0) {
        position.setX(i, position.getX(i) * cabin.taper);
        position.setZ(i, position.getZ(i) * cabin.taper);
      }
    }
    roof.computeVertexNormals();
    builder.add(
      roof,
      matrix.makeTranslation(0, size.height * 0.5 + cabin.height * 0.5, cabin.offset),
    );

    return builder.build('traffic-body-' + type.name);
  }

  /** Flank strips and the rear outline, both tinted per vehicle. */
  _buildStrips(type, shared) {
    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();
    const size = type.size;
    const strip = shared.strip;
    const length = size.length * strip.lengthScale;

    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      builder.add(
        new THREE.BoxGeometry(0.04, strip.height, length),
        matrix.makeTranslation(sign * (size.width * 0.5 + strip.inset), strip.y, 0),
      );
    }

    // Outline around the rear face. This is what draws the shape head on, which
    // is the angle the rider sees almost all the time.
    const rear = shared.rear.outline;
    const z = size.length * 0.5 + rear.depth * 0.5;
    const halfWidth = Math.max(0.06, size.width * 0.5 - rear.inset);
    const halfHeight = Math.max(0.06, size.height * 0.5 - rear.inset);

    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      builder.add(
        new THREE.BoxGeometry(halfWidth * 2, rear.thickness, rear.depth),
        matrix.makeTranslation(0, sign * halfHeight, z),
      );
      builder.add(
        new THREE.BoxGeometry(rear.thickness, halfHeight * 2, rear.depth),
        matrix.makeTranslation(sign * halfWidth, 0, z),
      );
    }

    return builder.build('traffic-strip-' + type.name);
  }

  /** Rear lights. A motorcycle gets one; everything else a pair and a bar. */
  _buildTails(type, shared) {
    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();
    const tail = shared.tail;
    const size = type.size;
    const z = size.length * 0.5;

    if (type.singleTail) {
      builder.add(
        new THREE.BoxGeometry(tail.width * 0.55, tail.height, 0.05),
        matrix.makeTranslation(0, tail.y, z),
      );
      return builder.build('traffic-tail-' + type.name);
    }

    const spacing = Math.min(tail.spacing, size.width * 0.5 - tail.width * 0.5);
    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      builder.add(
        new THREE.BoxGeometry(tail.width, tail.height, 0.05),
        matrix.makeTranslation(sign * spacing, tail.y, z),
      );
    }

    const bar = tail.bar;
    builder.add(
      new THREE.BoxGeometry(Math.min(bar.width, size.width * 0.82), bar.height, 0.05),
      matrix.makeTranslation(0, bar.y, z),
    );

    return builder.build('traffic-tail-' + type.name);
  }

  /**
   * Rear halo and ground blob in one additive mesh. Their relative brightness
   * is baked into vertex colours, which three multiplies by the per instance
   * colour, so one material serves both and the pair is a single draw call.
   */
  _buildGlow(type, shared, road) {
    const glow = shared.glow;
    const rear = shared.rear.glow;
    const size = type.size;

    this.glowTexture = createStarTexture(
      // A fat, flat core rather than a soft falloff. What survives being
      // averaged down to a couple of pixels is the mean, and a gradient that
      // spends most of its area near zero has a mean near zero.
      {
        coreStop: 0.3,
        coreAlpha: 1,
        midStop: 0.55,
        midAlpha: 0.62,
        tailStop: 0.82,
        tailAlpha: 0.12,
      },
      glow.textureSize,
    );
    this.glowTexture.name = 'traffic-glow';

    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();

    // PlaneGeometry faces +Z and the body's local +Z is its rear, so the halo
    // already faces the rider with no rotation.
    const halo = new THREE.PlaneGeometry(
      size.width * rear.widthScale,
      size.height * rear.heightScale,
    );
    VehicleMesh._tint(halo, 1);
    builder.add(halo, matrix.makeTranslation(0, 0, size.length * 0.5 + rear.offset));

    const ground = new THREE.PlaneGeometry(glow.size, glow.size);
    ground.rotateX(-Math.PI / 2);
    VehicleMesh._tint(ground, glow.groundLevel);
    builder.add(ground, matrix.makeTranslation(0, -size.height * 0.5 + glow.y, 0));

    this.glowMaterial = new THREE.MeshBasicMaterial({
      map: this.glowTexture,
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: rear.opacity,
      toneMapped: false,
      // Additive geometry must never take fog: fog mixes TOWARD the fog colour,
      // and mixing an additive surface toward a colour adds it, so a distant
      // glow brightens the frame instead of fading out of it.
      fog: false,
    });
    applyDistanceFade(this.glowMaterial, road.neonFadeStart, road.neonFadeEnd);
    this.materials.push(this.glowMaterial);

    this.glow = this._instance(
      builder.build('traffic-glow-' + type.name),
      this.glowMaterial,
      'Glow',
    );
    this.glow.renderOrder = 1;
  }

  /** Roof beacons, for a type that carries them. */
  _buildBeacon(type, road) {
    const beacon = type.beacon;
    const builder = new GeometryBuilder();
    const matrix = new THREE.Matrix4();
    const y = type.size.height * 0.5 + type.cabin.height + beacon.size[1] * 0.5;

    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      builder.add(
        new THREE.BoxGeometry(beacon.size[0], beacon.size[1], beacon.size[2]),
        matrix.makeTranslation(sign * beacon.spacing, y, beacon.z),
      );
    }

    this.beaconMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    applyDistanceFade(this.beaconMaterial, road.neonFadeStart, road.neonFadeEnd);
    this.materials.push(this.beaconMaterial);

    this.beacon = this._instance(
      builder.build('traffic-beacon-' + type.name),
      this.beaconMaterial,
      'Beacon',
    );
  }

  /** Flat grey vertex colour, used as a per part brightness multiplier. */
  static _tint(geometry, level) {
    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);
    colors.fill(level);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  /** @returns {number} triangles drawn per vehicle of this type */
  get trianglesPerVehicle() {
    let total = 0;
    for (let i = 0; i < this.geometries.length; i++) total += this.geometries[i].index.count / 3;
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
