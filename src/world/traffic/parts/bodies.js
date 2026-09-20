import * as THREE from 'three';
import { GeometryBuilder } from '../../../utils/geometry.js';
import { addTruckParts } from '../truckParts.js';
import { extrudeProfile, profileTop, profileRear } from './profile.js';
import { solid } from './shading.js';
import { addWheels } from './wheels.js';
import { addRoofRails, addRearDoors, addRearBumper, addSideSkirts } from './panels.js';

/**
 * bodies - the shell of one vehicle type, merged into a single geometry.
 *
 * Split out of VehicleMesh.js, which owns the four INSTANCED MESHES a type
 * needs and had grown a second job: the shape of the thing. That file was 368
 * lines against a 300 line limit and STATUS.md had already named it.
 *
 * ================= TWO PATHS, AND WHY BOTH ARE KEPT =================
 *
 * A type with a `profile` is built from the shape kit - a side view extruded
 * across the width, a narrower greenhouse on top, wheels under it, hardware
 * bolted on. A type without one falls back to the original box-plus-cabin.
 *
 * The fallback is not dead code and is not a transition either: it is what
 * the two lorries and the motorcycle are still built from while they are
 * rebuilt in their own pieces, and keeping it means the fleet is never half
 * broken between commits. A box IS the right primitive for a cargo body; what
 * was wrong was using it for a car.
 *
 * Everything lands in ONE geometry. The body mesh carries the vehicle's paint
 * through instanceColor and three multiplies that by the vertex colours, so a
 * dark wheel stays dark on a red car and a panel that set no colour comes out
 * exactly the paint. Four draw calls per type, whatever the shape costs.
 */

/**
 * How dark a face turned fully away from the light still gets.
 *
 * Not lower: traffic is seen against a road that is nearly black, and a flank
 * in true shadow makes a car look like it has a bite out of it rather than
 * like it has a far side. Not higher: above about 0.45 the facets stop
 * separating and the body goes back to being one flat area, which is the
 * whole thing this is here to prevent.
 */
const AMBIENT = 0.32;

/** Local y of the road under a body whose origin is its own centre. */
export function groundOf(type) {
  return -type.size.height * 0.5 - (type.rideHeight || 0);
}

/**
 * Local z of the face the doors, plate and bumper hang on.
 *
 * The PROFILE wins when there is one. It has to: the shell is built from the
 * profile, so anything placed from another number is placed on a face that
 * does not exist there.
 */
function rearOf(type) {
  if (type.profile) return profileRear(type.profile);
  const box = type.rearBox;
  return box ? box.offset + box.length * 0.5 : type.size.length * 0.5;
}

/**
 * The original shell: one box, a tapered cabin on top, an optional taller box
 * over the rear. Still what a lorry and a motorcycle are made of.
 * @param {object} type
 * @param {GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix
 */
function addBoxShell(type, builder, matrix) {
  const size = type.size;
  builder.add(
    solid(new THREE.BoxGeometry(size.width, size.height, size.length), AMBIENT),
    matrix.identity(),
  );

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
  builder.add(
    solid(roof, AMBIENT),
    matrix.makeTranslation(0, size.height * 0.5 + cabin.height * 0.5, cabin.offset),
  );

  // A second, taller box over the rear. The step in the roofline is what makes
  // an ambulance an ambulance at a hundred units, long before a light is.
  const rearBox = type.rearBox;
  if (rearBox) {
    builder.add(
      solid(new THREE.BoxGeometry(rearBox.width, rearBox.height, rearBox.length), AMBIENT),
      matrix.makeTranslation(0, size.height * 0.5 + rearBox.height * 0.5, rearBox.offset),
    );
  }
}

/**
 * The shape kit path: a profile, a greenhouse, wheels and panels.
 * @param {object} type
 * @param {GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix
 */
function addProfileShell(type, builder, matrix) {
  const halfWidth = type.size.width * 0.5;

  builder.add(solid(extrudeProfile(type.profile, halfWidth), AMBIENT), matrix.identity());

  // The greenhouse. A SECOND extrusion rather than a width taper inside the
  // first, because a taper creases the flank along the fan and a car's flank
  // is the flattest panel on it.
  const cabin = type.cabin;
  if (cabin && cabin.points) {
    builder.add(
      solid(extrudeProfile(cabin.points, halfWidth * cabin.widthScale), AMBIENT),
      matrix.identity(),
    );
  }

  if (type.wheels) {
    const wheels = type.wheels;
    addWheels(builder, matrix, {
      radius: wheels.radius,
      width: wheels.width,
      sides: wheels.sides,
      halfWidth,
      inset: wheels.inset,
      ground: groundOf(type),
      axles: wheels.axles,
      color: wheels.color,
      arch: wheels.arch,
    });
  }

  const rearZ = rearOf(type);
  if (type.rails) addRoofRails(builder, matrix, type.rails, profileTop(type.profile));
  if (type.doors) addRearDoors(builder, matrix, type.doors, halfWidth, rearZ);
  if (type.rear && type.rear.bumper) {
    addRearBumper(builder, matrix, type.rear.bumper, halfWidth, rearZ);
  }
  // The dark surround the plate sits in. The plate itself is in the tail mesh,
  // where the vertex colours are absolute; here it would be multiplied by the
  // car's paint and a white plate would come out red on a red car.
  if (type.skirts) addSideSkirts(builder, matrix, type.skirts, halfWidth);
  if (type.rear && type.rear.recess) {
    const recess = type.rear.recess;
    addRearBumper(builder, matrix, {
      height: recess.height,
      depth: recess.depth,
      y: recess.y,
      widthScale: recess.width / (halfWidth * 2),
      color: recess.color,
    }, halfWidth, rearZ);
  }
}

/**
 * @param {object} type one entry from config.world.traffic.types
 * @returns {THREE.BufferGeometry} merged, ready to instance
 */
export function buildBody(type) {
  const builder = new GeometryBuilder();
  const matrix = new THREE.Matrix4();

  if (type.profile) addProfileShell(type, builder, matrix);
  else addBoxShell(type, builder, matrix);

  if (type.truck) addTruckParts(type, builder, matrix);

  return builder.build('traffic-body-' + type.name);
}
