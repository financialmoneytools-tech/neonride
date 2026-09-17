import * as THREE from 'three';
import { config } from '../../config.js';
import { GeometryBuilder, paintVertices } from '../../utils/geometry.js';
import { createStarTexture } from '../../utils/textures.js';
import { applyDistanceFade } from '../../utils/distanceFade.js';
import { addMarkers, addTruckParts, rearFace } from './truckParts.js';

/**
 * VehicleMesh - the instanced meshes for ONE vehicle type: body, tinted strips
 * and rear outline, tail lights, one additive mesh holding both the rear halo
 * and the ground blob, and roof beacons for a type that asks for them.
 *
 * Four draw calls per type, five for the ambulance. A vehicle within a type
 * costs triangles and four matrix writes a frame, never a draw call.
 *
 * Silhouette is what separates the types at distance: a van reads as a van
 * because it is a tall slab, not because it has a wing mirror, so the shapes
 * stay deliberately blunt and deliberately far apart.
 */
/** @param {THREE.BufferGeometry} geometry @param {number} color */
function painted(geometry, color) {
  paintVertices(geometry, color);
  return geometry;
}

/** The same, with a scalar brightness rather than a colour. */
function dim(geometry, value) {
  paintVertices(geometry, value);
  return geometry;
}

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

    // White base: the real paint arrives per vehicle through instanceColor,
    // so variety inside a type costs nothing.
    //
    // VERTEX COLOURS ON TOP OF THAT, which is how a truck gets dark wheels,
    // dark door seams and a pale number plate without a mesh for each. The two
    // multiply: a part left white comes out exactly the paint it always did -
    // GeometryBuilder fills white for any part that sets no colour - and a part
    // painted dark comes out dark whatever the paint is.
    //
    // The tail mesh is the one with no instanceColor of its own, so its vertex
    // colours are absolute. That is what lets red lamps and a white plate share
    // it. Its base goes white and every existing part is painted the red it
    // used to get from the material, so nothing else changes.
    this.bodyMaterial = new THREE.MeshBasicMaterial({
      color: shared.bodyColor, vertexColors: true,
    });
    // Vertex colours here too, so the strips can hold two brightnesses of the
    // same instance colour: bright marker lights and a dim rear outline.
    this.stripMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, vertexColors: true, toneMapped: false,
    });
    this.tailMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, vertexColors: true, toneMapped: false,
    });

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

    // A second, taller box over the rear. The step in the roofline is what makes
    // an ambulance an ambulance at a hundred units, long before a light is.
    const rearBox = type.rearBox;
    if (rearBox) {
      builder.add(
        new THREE.BoxGeometry(rearBox.width, rearBox.height, rearBox.length),
        matrix.makeTranslation(0, size.height * 0.5 + rearBox.height * 0.5, rearBox.offset),
      );
    }

    if (type.truck) addTruckParts(type, builder, matrix);

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

    if (type.markers) addMarkers(type, builder, matrix);

    // Outline around the rear face. This is what draws the shape head on, which
    // is the angle the rider sees almost all the time.
    const rear = shared.rear.outline;
    const z = size.length * 0.5 + rear.depth * 0.5;
    const halfWidth = Math.max(0.06, size.width * 0.5 - rear.inset);
    const halfHeight = Math.max(0.06, size.height * 0.5 - rear.inset);

    // DIMMER ON A TRUCK. The outline is what draws a car's shape head on, and
    // it is the right thing for a car - but at a truck's size, in the truck's
    // amber, it became a glowing frame that swallowed the doors, the plate and
    // the tail lights inside it. A scalar vertex colour dims it without
    // touching the marker lights, which share this mesh and its instance
    // colour and want to stay bright.
    // A GAIN OF ZERO BUILDS NOTHING. On a truck the outline frames the CHASSIS
    // rear - y -1.18 to 1.18 - while the cargo box it belongs to sits from 1.23
    // to 2.72 above it. They are adjacent rather than overlapping, so it read
    // as a second, smaller, misaligned orange box stuck under the trailer.
    // Measured from the geometry's own bounding boxes, not from the picture.
    //
    // A truck's rear does not need it: the marker lights draw the top edge, the
    // door seams draw the middle and the lamps and plate draw the bottom. That
    // is more outline than a car's frame ever gave it.
    const gain = type.outlineGain === undefined ? 1 : type.outlineGain;
    if (gain <= 0) return builder.build('traffic-strip-' + type.name);

    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      builder.add(
        dim(new THREE.BoxGeometry(halfWidth * 2, rear.thickness, rear.depth), gain),
        matrix.makeTranslation(0, sign * halfHeight, z),
      );
      builder.add(
        dim(new THREE.BoxGeometry(rear.thickness, halfHeight * 2, rear.depth), gain),
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
        painted(new THREE.BoxGeometry(tail.width * 0.55, tail.height, 0.05), tail.color),
        matrix.makeTranslation(0, tail.y, z),
      );
      return builder.build('traffic-tail-' + type.name);
    }

    const spacing = Math.min(tail.spacing, size.width * 0.5 - tail.width * 0.5);
    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      builder.add(
        painted(new THREE.BoxGeometry(tail.width, tail.height, 0.05), tail.color),
        matrix.makeTranslation(sign * spacing, tail.y, z),
      );
    }

    const bar = tail.bar;
    builder.add(
      painted(new THREE.BoxGeometry(Math.min(bar.width, size.width * 0.82), bar.height, 0.05),
        tail.color),
      matrix.makeTranslation(0, bar.y, z),
    );

    // The lit number plate: pale, not red, and the one part of a truck's rear
    // that is genuinely white at night. A rectangle of light low on the doors
    // is most of what says "the back of a lorry" from behind.
    const truck = type.truck;
    if (truck) {
      const plate = truck.plate;
      // ON THE CHASSIS REAR, not the cargo box's. A box truck's body ends at
      // 4.1 and its chassis runs to 4.3, so a plate placed on the box face sat
      // 200mm INSIDE the chassis and was never drawn. The doors are fine on the
      // box face because they are above the chassis entirely; the plate and the
      // lamps are not.
      builder.add(
        painted(new THREE.BoxGeometry(plate.width, plate.height, 0.05), plate.color),
        matrix.makeTranslation(plate.x, plate.y, size.length * 0.5 + 0.03),
      );
    }

    return builder.build('traffic-tail-' + type.name);
  }

  /**
   * Rear halo and ground blob in one additive mesh. Relative brightness is
   * baked into vertex colours, which three multiplies by the instance colour,
   * so one material serves both and the pair is a single draw call.
   */
  _buildGlow(type, shared, road) {
    const glow = shared.glow;
    const rear = shared.rear.glow;
    const size = type.size;

    this.glowTexture = createStarTexture(
      // Fat flat core, not a soft falloff: what survives being averaged down to
      // a couple of pixels is the mean, and a gradient mostly near zero has a
      // mean near zero.
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
    // PER TYPE. The rear halo is the largest single fill in the traffic system
    // and on a truck it is enormous - 3.75 metres of additive amber over the
    // exact face that now carries doors, a plate and tail lights. Dimming it is
    // what lets that detail be seen at all.
    paintVertices(halo, type.rearGlow === undefined ? 1 : type.rearGlow);
    builder.add(halo, matrix.makeTranslation(0, 0, size.length * 0.5 + rear.offset));

    const ground = new THREE.PlaneGeometry(glow.size, glow.size);
    ground.rotateX(-Math.PI / 2);
    paintVertices(ground, glow.groundLevel);
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
      const lamp = new THREE.BoxGeometry(beacon.size[0], beacon.size[1], beacon.size[2]);
      // Left lamp red, right lamp blue, baked in. The instance colour then
      // alternates between the two: multiplying red geometry by a blue instance
      // colour gives black, so one lamp lights while the other goes out. That is
      // a real alternating flash out of a single colour write per vehicle.
      paintVertices(lamp, s === 0 ? beacon.colorA : beacon.colorB);
      builder.add(lamp, matrix.makeTranslation(sign * beacon.spacing, y, beacon.z));
    }

    this.beaconMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      toneMapped: false,
    });
    applyDistanceFade(this.beaconMaterial, road.neonFadeStart, road.neonFadeEnd);
    this.materials.push(this.beaconMaterial);

    this.beacon = this._instance(
      builder.build('traffic-beacon-' + type.name),
      this.beaconMaterial,
      'Beacon',
    );
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
