import * as THREE from 'three';

/**
 * A car, built by hand, because there is not a free one worth using.
 *
 * SEARCHED FIRST, AND THE SEARCH IS THE FINDING. Poly Haven carries 521 models
 * and the only vehicle among them is `covered_car` - a car under a tarpaulin.
 * Kenney's car kit is CC0 and genuinely good, and is low-poly stylised, which
 * is a different art direction rather than a cheaper version of this one.
 * Khronos's ToyCar is CC0 with real clearcoat paint on a TOY's body; it was
 * tried in the first pass of this probe and it reads as a toy, because it is
 * one. With a budget of zero and no AI textures, hand-built is the only way to
 * get a car-shaped car.
 *
 * ================= WHY THIS IS BUILDABLE BY HAND =================
 *
 * The shot is a car at 26 metres, at night, from behind. What carries it is the
 * SILHOUETTE, the tail lights, and how the paint holds the lamp light along the
 * shoulder line. None of those need topology - they need a correct outline and
 * a correct material. What a hand-built car cannot have is the thing nobody
 * looks at from behind at night: panel gaps, door handles, badges, mirrors with
 * the right stalk. That trade is the whole reason this works here and would not
 * work for a hero shot.
 *
 * The body is ONE EXTRUDED SIDE PROFILE with a bevel. Extruding a real side
 * view across the car's width gives the bonnet, windscreen rake, roof, rear
 * screen and boot in one geometry, and the bevel rounds the shoulder - which is
 * what actually catches a street lamp and reads as sheet metal instead of as a
 * box. A stack of boxes cannot do that at any triangle count.
 */

/** Real car paint: colour under a clear lacquer, which is two layers, not one. */
function paintMaterial(colour) {
  return new THREE.MeshPhysicalMaterial({
    color: colour,
    // Car paint is NOT metal. The flake in metallic paint is, but the base coat
    // is a dielectric, and setting metalness high is the single most common way
    // to make a car look like painted tinfoil.
    metalness: 0.0,
    roughness: 0.42,
    // The lacquer. This is what puts a sharp, narrow highlight along the
    // shoulder line while the base coat underneath stays soft.
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
}

/**
 * The side view, in metres, drawn from the rear bumper forward. A real saloon
 * is about 4.6 long and 1.45 tall, and these are those numbers rather than
 * whatever looked right.
 */
function bodyProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(-2.30, 0.30); // rear bumper, bottom
  shape.lineTo(-2.34, 0.62);
  shape.lineTo(-2.28, 0.95); // boot lid edge
  shape.lineTo(-1.70, 1.02); // boot
  shape.quadraticCurveTo(-1.35, 1.04, -1.05, 1.30); // rear screen rake
  shape.lineTo(-0.35, 1.45); // roof, rear
  shape.lineTo(0.55, 1.45); // roof, front
  shape.quadraticCurveTo(0.95, 1.43, 1.30, 1.06); // windscreen rake
  shape.lineTo(1.72, 0.94); // scuttle
  shape.quadraticCurveTo(2.15, 0.90, 2.30, 0.76); // bonnet fall
  shape.lineTo(2.34, 0.50); // nose
  shape.lineTo(2.20, 0.28); // front bumper
  shape.lineTo(1.30, 0.24);
  shape.lineTo(1.05, 0.34); // front arch
  shape.lineTo(0.55, 0.34);
  shape.lineTo(0.30, 0.24); // sill
  shape.lineTo(-1.10, 0.24);
  shape.lineTo(-1.35, 0.34); // rear arch
  shape.lineTo(-1.85, 0.34);
  shape.lineTo(-2.10, 0.24);
  shape.closePath();
  return shape;
}

function wheel(radius, width, segments) {
  const group = new THREE.Group();
  const tyre = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, segments),
    new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.95, metalness: 0 }),
  );
  tyre.rotation.z = Math.PI * 0.5;
  group.add(tyre);

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, width * 1.02, segments),
    new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.28, metalness: 0.95 }),
  );
  rim.rotation.z = Math.PI * 0.5;
  group.add(rim);
  return group;
}

/**
 * Builds the car.
 *
 * @param {object} options
 * @returns {{group: THREE.Group, dispose: () => void}}
 */
export function buildCar(options = {}) {
  const group = new THREE.Group();
  group.name = 'ProbeCar';
  const detail = options.detail === undefined ? 1 : options.detail;
  const geometries = [];
  const materials = [];

  const width = 1.82;

  // --- body ---------------------------------------------------------------
  const bevel = 0.09;
  const bodyGeometry = new THREE.ExtrudeGeometry(bodyProfile(), {
    depth: width - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: detail > 0 ? 4 : 1,
    curveSegments: detail > 0 ? 12 : 4,
  });
  // Extruded along +Z from the profile plane; centred and turned so the car
  // faces -Z, which is the direction the rider is travelling.
  bodyGeometry.translate(0, 0, -(width - bevel * 2) * 0.5);
  bodyGeometry.rotateY(Math.PI * 0.5);
  bodyGeometry.computeVertexNormals();
  geometries.push(bodyGeometry);

  const paint = paintMaterial(options.color === undefined ? 0x11161f : options.color);
  materials.push(paint);
  const body = new THREE.Mesh(bodyGeometry, paint);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // --- glass --------------------------------------------------------------
  // Dark, smooth and very reflective rather than transparent. At night, from
  // behind, a car's rear screen shows the sky and the lamps in it and almost
  // nothing of the inside - transmission would cost a render target to show an
  // interior that is not there.
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x05070c, metalness: 0, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03,
    reflectivity: 0.9,
  });
  materials.push(glass);

  const rearGlassGeometry = new THREE.PlaneGeometry(width * 0.82, 0.46);
  geometries.push(rearGlassGeometry);
  const rearGlass = new THREE.Mesh(rearGlassGeometry, glass);
  rearGlass.position.set(0, 1.22, 1.14);
  rearGlass.rotation.x = -0.62;
  group.add(rearGlass);

  const sideGlassGeometry = new THREE.PlaneGeometry(1.5, 0.42);
  geometries.push(sideGlassGeometry);
  for (const side of [-1, 1]) {
    const sideGlass = new THREE.Mesh(sideGlassGeometry, glass);
    sideGlass.position.set(side * (width * 0.5 - 0.02), 1.2, 0.1);
    sideGlass.rotation.y = side * Math.PI * 0.5;
    group.add(sideGlass);
  }

  // --- wheels -------------------------------------------------------------
  const segments = detail > 0 ? 18 : 8;
  for (const [x, z] of [[-1, 1.42], [1, 1.42], [-1, -1.35], [1, -1.35]]) {
    const w = wheel(0.34, 0.24, segments);
    w.position.set(x * (width * 0.5 - 0.1), 0.34, z);
    w.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        geometries.push(child.geometry);
        materials.push(child.material);
      }
    });
    group.add(w);
  }

  // --- lights -------------------------------------------------------------
  // THE PART THAT ACTUALLY SELLS IT. At night a car from behind is two red
  // shapes, a lit plate and a silhouette; everything above is what stops those
  // from floating in the dark.
  const tailMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a0808, emissive: 0xff1822, emissiveIntensity: 5.5, roughness: 0.3,
  });
  materials.push(tailMaterial);
  const tailGeometry = new THREE.BoxGeometry(0.44, 0.15, 0.08);
  geometries.push(tailGeometry);

  for (const side of [-1, 1]) {
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(side * 0.62, 0.92, 2.30);
    group.add(tail);

    // A real light puts its colour ON the road behind the car. Without this the
    // lamps read as stickers - the same "light is not a surface" lesson the
    // roadside lamps in the shipped game already landed on.
    const glow = new THREE.PointLight(0xff2010, options.tailLight || 3.2, 9, 2);
    glow.position.set(side * 0.62, 0.72, 2.55);
    group.add(glow);

    // Headlights, forward, lighting the asphalt in front of the car.
    const beam = new THREE.SpotLight(0xf0f5ff, options.headLight || 90, 60, 0.46, 0.55, 1.6);
    beam.position.set(side * 0.66, 0.74, -2.20);
    beam.target.position.set(side * 1.1, 0, -30);
    beam.castShadow = false;
    group.add(beam);
    group.add(beam.target);

    const lens = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.14, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe8f0ff, emissiveIntensity: 6 }),
    );
    lens.position.set(side * 0.66, 0.74, -2.32);
    geometries.push(lens.geometry);
    materials.push(lens.material);
    group.add(lens);
  }

  // The number plate, lit. Small, and the eye finds it immediately because it
  // is the only neutral white on a dark car.
  const plateGeometry = new THREE.BoxGeometry(0.52, 0.12, 0.03);
  geometries.push(plateGeometry);
  const plateMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8d8d0, emissive: 0x6a6a60, emissiveIntensity: 1.2, roughness: 0.6,
  });
  materials.push(plateMaterial);
  const plate = new THREE.Mesh(plateGeometry, plateMaterial);
  plate.position.set(0, 0.62, 2.33);
  group.add(plate);

  // Exhaust, because a bare bumper edge reads as unfinished at this distance.
  const pipeGeometry = new THREE.CylinderGeometry(0.045, 0.05, 0.14, 8);
  geometries.push(pipeGeometry);
  const pipeMaterial = new THREE.MeshStandardMaterial({
    color: 0x6a6f75, roughness: 0.35, metalness: 0.9,
  });
  materials.push(pipeMaterial);
  const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  pipe.rotation.x = Math.PI * 0.5;
  pipe.position.set(-0.55, 0.34, 2.32);
  group.add(pipe);

  return {
    group,
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}
