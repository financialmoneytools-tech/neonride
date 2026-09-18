import * as THREE from 'three';

/**
 * A BLOCKOUT motorcycle. Right silhouette, right scale, deliberately not a
 * model.
 *
 * ================= WHY THIS IS A BLOCKOUT AND NOT A BIKE =================
 *
 * There is no free photoreal motorcycle at a licence this project can use, and
 * that is a finding rather than a gap somebody can close with more searching.
 * The first pass of this probe hit the same wall with cars: Poly Haven has one
 * vehicle and it is under a tarpaulin, Kenney's kit is CC0 and stylised, and
 * Khronos's ToyCar is real clearcoat paint on a toy's body. A motorcycle is
 * harder again - it is the one vehicle with no bodywork to hide behind, so
 * every tube, every weld and the rider on top of it are all load bearing.
 *
 * So this is massing: tank, seat, forks, wheels, swingarm, exhaust, bars, in
 * the proportions of a real sports bike, in the four materials the brief asks
 * for. It exists to answer whether the ROAD, the LIGHTING and the CAMERA hold
 * up, with something correctly sized in front of them casting a correct shadow.
 * It is not meant to survive, and it is not meant to be judged as a bike.
 *
 * IT IS BEHIND A FACTORY for exactly that reason: `buildBike()` returns a group
 * and two lights, and a real GLB drops in behind the same call without anything
 * else in the probe knowing.
 *
 * Dimensions are a 2020s 600-class sports bike: 2.06 m long, 0.72 m wide over
 * the bars, 1.12 m to the top of the screen, 1.39 m wheelbase, 17 inch wheels.
 */

/** Real bike dimensions, in metres. Everything below is built from these. */
export const BIKE = {
  wheelbase: 1.39,
  wheelRadius: 0.31, // 17 inch rim plus a 55 profile tyre
  tyreWidth: 0.19,
  frontTyreWidth: 0.12,
  seatHeight: 0.81,
  tankTop: 0.86,
  barHeight: 0.98,
  barWidth: 0.72,
  rake: 0.42, // radians from vertical, about 24 degrees
};

/**
 * @param {object} [options]
 * @param {number} [options.paint] body colour
 * @returns {{ group: THREE.Group, headlight: THREE.SpotLight, brake: THREE.Mesh,
 *   materials: THREE.Material[], geometries: THREE.BufferGeometry[] }}
 */
export function buildBike(options = {}) {
  const group = new THREE.Group();
  group.name = 'ProbeBike';
  const geometries = [];
  const materials = [];

  const track = (thing) => {
    if (thing.isBufferGeometry) geometries.push(thing);
    else materials.push(thing);
    return thing;
  };

  // --- THE FOUR MATERIALS THE BRIEF ASKS FOR ------------------------------
  // Painted metal: a clearcoat over colour. The clearcoat is what separates
  // car paint from coloured plastic - it is a second, much sharper reflection
  // sitting on top of a diffuse one.
  const paint = track(new THREE.MeshPhysicalMaterial({
    color: options.paint === undefined ? 0x1d2530 : options.paint,
    metalness: 0.55,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  }));
  // Rubber: nearly black, and ROUGH. The commonest way a tyre looks wrong is
  // being too shiny, which reads as wet plastic.
  const rubber = track(new THREE.MeshStandardMaterial({
    color: 0x0c0d0f, metalness: 0, roughness: 0.92,
  }));
  // Bare metal: forks, discs, exhaust. Metalness 1 and a low roughness, which
  // needs an environment map to look like anything - see play/look.js.
  const metal = track(new THREE.MeshStandardMaterial({
    color: 0xb9bec6, metalness: 1, roughness: 0.22,
  }));
  const darkMetal = track(new THREE.MeshStandardMaterial({
    color: 0x2b2f36, metalness: 0.9, roughness: 0.45,
  }));
  // Glass: the screen and the headlight lens. Transmission rather than opacity,
  // so what is behind it is refracted instead of merely showing through.
  const glass = track(new THREE.MeshPhysicalMaterial({
    color: 0x20262e,
    metalness: 0,
    roughness: 0.08,
    transmission: 0.9,
    thickness: 0.01,
    transparent: true,
    opacity: 0.55,
  }));

  const add = (geometry, material, position, rotation) => {
    track(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const halfBase = BIKE.wheelbase * 0.5;

  // --- wheels -------------------------------------------------------------
  // NO CapsuleGeometry anywhere in this project - a cylinder is what a tyre is
  // anyway. Rotated about Z so the axle runs across the bike.
  for (const [z, width] of [[-halfBase, BIKE.frontTyreWidth], [halfBase, BIKE.tyreWidth]]) {
    add(
      new THREE.CylinderGeometry(BIKE.wheelRadius, BIKE.wheelRadius, width, 28),
      rubber, [0, BIKE.wheelRadius, z], [0, 0, Math.PI * 0.5],
    );
    // The rim, inset, so the wheel is not one solid black disc.
    add(
      new THREE.CylinderGeometry(BIKE.wheelRadius * 0.62, BIKE.wheelRadius * 0.62, width * 1.02, 20),
      metal, [0, BIKE.wheelRadius, z], [0, 0, Math.PI * 0.5],
    );
    // Brake disc, on one side, which is where the eye looks for one.
    add(
      new THREE.CylinderGeometry(BIKE.wheelRadius * 0.74, BIKE.wheelRadius * 0.74, 0.012, 24),
      metal, [width * 0.62, BIKE.wheelRadius, z], [0, 0, Math.PI * 0.5],
    );
  }

  // --- forks, raked ------------------------------------------------------
  for (const side of [-1, 1]) {
    add(
      new THREE.CylinderGeometry(0.026, 0.03, 0.72, 10),
      metal,
      [side * 0.1, BIKE.wheelRadius + 0.3, -halfBase + 0.13],
      [BIKE.rake, 0, 0],
    );
  }

  // --- frame, tank, seat, tail -------------------------------------------
  // The tank is the thing that makes a shape read as a motorcycle rather than
  // as a bicycle, so it is the one piece here with any care in its proportions.
  add(new THREE.BoxGeometry(0.30, 0.26, 0.62), paint, [0, BIKE.tankTop - 0.13, -0.13]);
  add(new THREE.BoxGeometry(0.26, 0.12, 0.34), darkMetal, [0, BIKE.seatHeight - 0.05, 0.28]);
  // The tail, lifted and tapered the way every modern sports bike's is.
  add(new THREE.BoxGeometry(0.18, 0.14, 0.40), paint, [0, BIKE.seatHeight + 0.06, 0.52], [-0.18, 0, 0]);
  // Engine block, which is most of the mass and most of the shadow.
  add(new THREE.BoxGeometry(0.34, 0.30, 0.44), darkMetal, [0, 0.46, -0.02]);
  // Swingarm.
  add(new THREE.BoxGeometry(0.08, 0.07, 0.52), metal, [0.14, 0.34, 0.42]);
  add(new THREE.BoxGeometry(0.08, 0.07, 0.52), metal, [-0.14, 0.34, 0.42]);
  // Exhaust, under the tail.
  add(new THREE.CylinderGeometry(0.055, 0.065, 0.34, 12), metal,
    [0.14, 0.40, 0.56], [Math.PI * 0.5 - 0.14, 0, 0]);

  // --- nose, screen, bars -------------------------------------------------
  add(new THREE.BoxGeometry(0.30, 0.26, 0.26), paint, [0, 0.92, -0.58]);
  const screen = add(new THREE.BoxGeometry(0.26, 0.20, 0.02), glass,
    [0, 1.06, -0.52], [-0.55, 0, 0]);
  screen.castShadow = false; // a transmissive surface casting a hard shadow reads as card
  add(new THREE.CylinderGeometry(0.018, 0.018, BIKE.barWidth, 8), darkMetal,
    [0, BIKE.barHeight, -0.44], [0, 0, Math.PI * 0.5]);
  for (const side of [-1, 1]) {
    // Mirrors: small, and they matter out of proportion to their size because
    // they are the silhouette detail that says "road bike" at a glance.
    add(new THREE.BoxGeometry(0.11, 0.07, 0.02), darkMetal,
      [side * 0.30, BIKE.barHeight + 0.14, -0.47], [0, side * 0.35, 0]);
  }

  // --- lights -------------------------------------------------------------
  // SUBTLE, and that is the brief. A headlight is a lens that is bright plus a
  // cone of light on the road, and the second one is what makes it real: an
  // emissive disc with no light under it is a torch painted on the front.
  const lens = add(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 20),
    new THREE.MeshStandardMaterial({
      color: 0xfff4e2, emissive: 0xfff0d8, emissiveIntensity: 3.2, roughness: 0.2,
    }),
    [0, 0.90, -0.70], [Math.PI * 0.5, 0, 0]);
  lens.castShadow = false;
  materials.push(lens.material);

  // INTENSITY IS IN CANDELA, because the renderer runs with physical lights -
  // see play/look.js. 26 was tried first, which is a keyring torch: light falls
  // off with the square of the distance, so at the 30 metres a rider is
  // actually looking at it delivered nothing and the road ahead stayed black.
  // A dipped car headlight is tens of thousands of candela on its hot spot;
  // this is low for one, because the beam here is wide and the scene is graded
  // for a camera rather than for an eye.
  const headlight = new THREE.SpotLight(0xfff0d8, 3200, 120, 0.42, 0.62, 1.55);
  headlight.position.set(0, 0.90, -0.70);
  // Aimed DOWN the road and slightly at it, which is what dipped means.
  headlight.target.position.set(0, -1.6, -34);
  headlight.castShadow = true;
  headlight.shadow.mapSize.set(1024, 1024);
  headlight.shadow.camera.near = 0.6;
  headlight.shadow.camera.far = 120;
  headlight.shadow.bias = -0.0016;
  group.add(headlight, headlight.target);

  // The brake light. Dim when it is only a tail light, bright when braking -
  // `setBraking` below is the whole of it, because a brake light that is always
  // on is a brake light nobody reads.
  const brakeMaterial = track(new THREE.MeshStandardMaterial({
    color: 0x3a0a0c, emissive: 0xff1c10, emissiveIntensity: 0.6, roughness: 0.3,
  }));
  const brake = add(new THREE.BoxGeometry(0.15, 0.05, 0.02), brakeMaterial,
    [0, BIKE.seatHeight + 0.10, 0.70]);
  brake.castShadow = false;

  return { group, headlight, brake, materials, geometries };
}

/**
 * @param {object} bike the object buildBike returned
 * @param {boolean} braking
 */
export function setBraking(bike, braking) {
  bike.brake.material.emissiveIntensity = braking ? 5.5 : 0.6;
}

/** @param {object} bike */
export function disposeBike(bike) {
  for (const geometry of bike.geometries) geometry.dispose();
  for (const material of bike.materials) material.dispose();
  bike.group.clear();
  if (bike.group.parent) bike.group.parent.remove(bike.group);
}
