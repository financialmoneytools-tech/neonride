import * as THREE from 'three';
import { paintVertices } from '../../utils/geometry.js';
import { profileTop, profileBottom, profileRear } from './parts/profile.js';

/**
 * truckParts - the hardware that makes a lorry a lorry rather than a box.
 *
 * Wheels, a rear bumper, mud flaps and the seams of a pair of rear doors. Split
 * out of VehicleMesh because that file passed 300 lines the moment trucks
 * needed more than a silhouette, and because this is a different job: a vehicle
 * type's mesh set is one thing, the shape of one kind of vehicle is another.
 *
 * ALL OF IT GOES IN THE BODY GEOMETRY, painted dark with vertex colours. The
 * body mesh already carries the paint through instanceColor and the two
 * multiply, so a wheel comes out dark whatever colour the trailer is - and a
 * truck still costs exactly the four draw calls every other type costs.
 *
 * Everything here is a box or an eight sided cylinder. At the distance a truck
 * is read from, a wheel is a dark ellipse under a body and a door seam is a
 * line; detail past that is triangles nobody sees.
 */

/** @param {THREE.BufferGeometry} geometry @param {number} color */
function painted(geometry, color) {
  paintVertices(geometry, color);
  return geometry;
}

/**
 * Where the back of this vehicle actually is.
 *
 * Not size.length / 2 for a type with a rearBox: a box truck's cargo body ends
 * where the box ends, and hanging its doors, plate and bumper off the chassis
 * length leaves them floating behind it.
 * @param {object} type
 */
export function rearFace(type) {
  // THE PROFILE WINS. A lorry's shell is extruded from its side view now, so
  // a face derived from anything else is a face that is not there - which is
  // how a set of doors ends up 200 mm inside the body and never drawn.
  if (type.profile) return profileRear(type.profile);
  const box = type.rearBox;
  return box ? box.offset + box.length * 0.5 : type.size.length * 0.5;
}

/** The height of the face the doors are on. */
export function rearHeight(type) {
  if (type.profile) return profileTop(type.profile) - profileBottom(type.profile);
  const box = type.rearBox;
  return box ? type.size.height + box.height : type.size.height;
}

/** The top of that face, in the body geometry's own space. */
export function rearTop(type) {
  if (type.profile) return profileTop(type.profile);
  const box = type.rearBox;
  return type.size.height * 0.5 + (box ? box.height : 0);
}

/**
 * Adds every truck-only part to a body being built.
 * @param {object} type one entry from config.world.traffic.types
 * @param {import('../../utils/geometry.js').GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix scratch, reused by the caller
 */
export function addTruckParts(type, builder, matrix) {
  const truck = type.truck;
  const size = type.size;
  const rear = rearFace(type);
  // The road, in this geometry's own space. The body is centred on its origin
  // and lifted by half its height plus the ride height when it is placed, so
  // the ground sits here.
  const ground = -size.height * 0.5 - (type.rideHeight || 0);

  // WHEELS. A cylinder is built along +Y, so it is turned a quarter turn about
  // Z to lie across the vehicle.
  const wheel = truck.wheels;
  const wheelGeometry = () => {
    const g = new THREE.CylinderGeometry(wheel.radius, wheel.radius, wheel.width, wheel.sides);
    g.rotateZ(Math.PI / 2);
    return painted(g, wheel.color);
  };
  const wheelX = size.width * 0.5 - wheel.inset;
  for (const z of wheel.axles) {
    for (const sign of [-1, 1]) {
      builder.add(wheelGeometry(),
        matrix.makeTranslation(sign * wheelX, ground + wheel.radius, z));
    }
  }

  // REAR BUMPER, under the doors. A real one is a bar on two drops; one box
  // reads the same at this distance and costs a sixth of the triangles.
  const bumper = truck.bumper;
  builder.add(
    painted(new THREE.BoxGeometry(size.width * bumper.widthScale, bumper.height, bumper.depth),
      bumper.color),
    matrix.makeTranslation(0, ground + bumper.y, rear + bumper.depth * 0.5),
  );

  // MUD FLAPS, hanging behind the rearmost axle.
  const flap = truck.mudFlaps;
  const lastAxle = wheel.axles[wheel.axles.length - 1];
  for (const sign of [-1, 1]) {
    builder.add(
      painted(new THREE.BoxGeometry(flap.width, flap.height, 0.04), flap.color),
      matrix.makeTranslation(
        sign * wheelX,
        ground + flap.height * 0.5,
        lastAxle + wheel.radius + flap.gap,
      ),
    );
  }

  // REAR DOORS: a split down the middle and hinges down both outer edges.
  // Proud of the face rather than cut into it - a recess needs geometry the
  // silhouette cannot spare, and at night a seam reads as a line either way.
  const door = truck.doors;
  const faceHeight = rearHeight(type);
  const faceTop = rearTop(type);
  const seam = (x, y, w, h) => builder.add(
    painted(new THREE.BoxGeometry(w, h, door.depth), door.color),
    matrix.makeTranslation(x, y, rear + door.depth * 0.5),
  );

  seam(0, faceTop - faceHeight * 0.5, door.seam, faceHeight * door.reach);
  const hingeX = size.width * 0.5 - door.hingeInset;
  for (let i = 0; i < door.hinges; i++) {
    const t = (i + 0.5) / door.hinges;
    const y = faceTop - faceHeight * (0.08 + t * 0.84);
    for (const sign of [-1, 1]) seam(sign * hingeX, y, door.hingeWidth, door.seam);
  }
}

/**
 * Amber marker lights, along the top of the rear face AND down both flanks.
 *
 * These are what a truck has and a car does not, and the side row is what makes
 * one read as a truck from BESIDE it - which on a four lane road is most of the
 * time, because the rider spends the pass alongside rather than behind.
 *
 * They go in the STRIP geometry, not the body: that mesh takes the type's strip
 * colour through its own instanceColor, so a whole truck's marker lights are
 * amber for free and cost no extra draw call.
 * @param {object} type
 * @param {import('../../utils/geometry.js').GeometryBuilder} builder
 * @param {THREE.Matrix4} matrix
 */
export function addMarkers(type, builder, matrix) {
  const markers = type.markers;
  const size = type.size;
  const [w, h, d] = markers.size;
  const top = rearTop(type);
  const back = rearFace(type);

  const span = (markers.count - 1) * markers.spacing;
  for (let i = 0; i < markers.count; i++) {
    builder.add(
      new THREE.BoxGeometry(w, h, d),
      matrix.makeTranslation(-span * 0.5 + i * markers.spacing, top - h * 0.5, back + d * 0.5),
    );
  }

  // Down the sides, evenly along the body, just under the roof line.
  const side = markers.side;
  if (!side) return;
  const x = size.width * 0.5 + side.out;
  const y = top - side.drop;
  const from = -size.length * 0.5 + side.margin;
  const to = back - side.margin;
  for (let i = 0; i < side.count; i++) {
    const z = from + ((to - from) * i) / Math.max(1, side.count - 1);
    for (const sign of [-1, 1]) {
      builder.add(
        new THREE.BoxGeometry(side.size[0], side.size[1], side.size[2]),
        matrix.makeTranslation(sign * x, y, z),
      );
    }
  }
}
