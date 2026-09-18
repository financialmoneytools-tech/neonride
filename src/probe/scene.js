import * as THREE from 'three';
import { roadLayout } from '../world/road/layout.js';

/**
 * The realism probe's scene. A STATIC road, built the way a photoreal night
 * driving game would build it, so the two looks can be photographed from the
 * same camera and the cost of the second one can be read off a counter rather
 * than argued about.
 *
 * NOTHING HERE IS WIRED INTO THE GAME. It has its own entry point (probe.html)
 * and its own renderer settings, and it imports exactly one thing from the
 * project - the road layout - so that the lanes, the shoulder and the median
 * are in the same places and the comparison is of the LOOK rather than of two
 * different roads.
 *
 * ================= WHAT MAKES IT DIFFERENT =================
 *
 * The shipped game is unlit. Every surface is MeshBasicMaterial or a custom
 * shader that computes its own colour, there is not one THREE.Light in the
 * scene, and nothing casts a shadow. That is not a shortcut, it is the style:
 * neon is emission, and emission does not need a light.
 *
 * This is the opposite. MeshStandardMaterial everywhere, real lights, real
 * shadow maps, and a texture set with albedo, normal, roughness and ambient
 * occlusion on every surface. Everything it costs, it costs because of that
 * choice and not because of how it was written.
 */

const TEXTURE_ROOT = 'probe/';

/** Loads one PBR set and returns a material. */
function pbr(loader, name, options = {}) {
  const repeat = options.repeat || new THREE.Vector2(1, 1);
  const maps = {};
  for (const [slot, suffix] of [
    ['map', 'diff'], ['normalMap', 'nor'], ['roughnessMap', 'rough'], ['aoMap', 'ao'],
  ]) {
    const texture = loader.load(`${TEXTURE_ROOT}${name}_${suffix}.jpg`);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.copy(repeat);
    texture.anisotropy = options.anisotropy || 8;
    // COLOUR MAPS ARE sRGB, DATA MAPS ARE NOT. Decoding a roughness map as if
    // it were a picture bends every value in it, and the surface comes out
    // uniformly too shiny in the mid tones - which is the single most common
    // way a PBR scene looks like plastic.
    if (slot === 'map') texture.colorSpace = THREE.SRGBColorSpace;
    maps[slot] = texture;
  }
  return new THREE.MeshStandardMaterial({
    ...maps,
    roughness: options.roughness === undefined ? 1 : options.roughness,
    metalness: options.metalness === undefined ? 0 : options.metalness,
    envMapIntensity: options.envMapIntensity === undefined ? 1 : options.envMapIntensity,
  });
}

/**
 * The road surface, with the two things a plain tiled texture cannot give it.
 *
 * TYRE POLISH. A used lane is darker and far smoother in the wheel tracks than
 * between them, and no single tile has that in the right place - the tracks are
 * a property of where the lanes are, not of the texture. So the roughness map
 * is modulated in the shader by distance to the nearest wheel track.
 *
 * WET PATCHES. Water does not cover a road evenly; it collects. A noise mask
 * drives roughness toward a mirror and lifts the normal flat, which is what
 * makes a reflection appear in the patch and not beside it.
 */
function roadMaterial(loader, layout) {
  const material = pbr(loader, 'asphalt', {
    repeat: new THREE.Vector2(6, 220),
    roughness: 1,
    anisotropy: 16,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLaneHalf = { value: layout.laneWidth * 0.5 };
    shader.uniforms.uTrackOffset = { value: layout.laneWidth * 0.26 };
    shader.uniforms.uLanes = { value: layout.laneCentres.length };
    shader.uniforms.uFirstLane = { value: layout.laneCentres[0] };
    shader.uniforms.uLaneWidth = { value: layout.laneWidth };
    shader.uniforms.uWetness = { value: 0.55 };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vProbeWorld;')
      .replace('#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvProbeWorld = (modelMatrix * vec4(position, 1.0)).xyz;');

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', [
        '#include <common>',
        'varying vec3 vProbeWorld;',
        'uniform float uTrackOffset;',
        'uniform float uLaneWidth;',
        'uniform float uFirstLane;',
        'uniform float uLanes;',
        'uniform float uWetness;',
        'float probeNoise(vec2 p) {',
        '  vec2 i = floor(p); vec2 f = fract(p);',
        '  f = f * f * (3.0 - 2.0 * f);',
        '  float a = fract(sin(dot(i, vec2(12.9898, 78.233))) * 43758.5453);',
        '  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453);',
        '  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);',
        '  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);',
        '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
        '}',
      ].join('\n'))
      .replace('#include <roughnessmap_fragment>', [
        '#include <roughnessmap_fragment>',
        '{',
        '  // Distance to the nearest wheel track, in metres.',
        '  float lane = (vProbeWorld.x - uFirstLane) / uLaneWidth;',
        '  float withinLane = (fract(lane) - 0.5) * uLaneWidth;',
        '  float track = min(abs(withinLane - uTrackOffset), abs(withinLane + uTrackOffset));',
        '  float polish = 1.0 - smoothstep(0.0, 0.42, track);',
        '  // Polished asphalt is SMOOTHER and slightly darker. Both, or it reads',
        '  // as a painted stripe rather than as wear.',
        '  roughnessFactor *= mix(1.0, 0.58, polish);',
        '  diffuseColor.rgb *= mix(1.0, 0.82, polish);',
        '',
        '  // Standing water, in patches rather than a film.',
        '  float wet = probeNoise(vProbeWorld.xz * 0.09);',
        '  wet = smoothstep(0.52, 0.78, wet) * uWetness;',
        '  roughnessFactor = mix(roughnessFactor, 0.06, wet);',
        '  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.45, wet);',
        '}',
      ].join('\n'))
      .replace('#include <normal_fragment_maps>', [
        '#include <normal_fragment_maps>',
        '{',
        '  // Water flattens the surface it sits on. Without this the wet patch',
        '  // keeps the asphalt normal and reflects a broken, gritty highlight.',
        '  float wet = probeNoise(vProbeWorld.xz * 0.09);',
        '  wet = smoothstep(0.52, 0.78, wet) * uWetness;',
        '  // Flattened toward the GEOMETRIC normal, which three keeps in',
        '  // nonPerturbedNormal. The first attempt used the tangent space up',
        '  // vector times normalMatrix - which is not in scope in the fragment',
        '  // shader and would have been the wrong space if it were.',
        '  normal = normalize(mix(normal, nonPerturbedNormal, wet));',
        '}',
      ].join('\n'));
  };
  material.customProgramCacheKey = () => 'probe-road';
  return material;
}

/** A lamp: post, arm, head, a real SpotLight and a shadow. */
function streetLamp(metal, lampConfig) {
  const group = new THREE.Group();

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.15, lampConfig.height, 12),
    metal,
  );
  post.position.y = lampConfig.height * 0.5;
  post.castShadow = true;
  group.add(post);

  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, lampConfig.reach, 8),
    metal,
  );
  arm.rotation.z = Math.PI * 0.5;
  arm.position.set(lampConfig.reach * 0.5 * lampConfig.side, lampConfig.height, 0);
  arm.castShadow = true;
  group.add(arm);

  const headX = lampConfig.reach * lampConfig.side;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.34), metal);
  head.position.set(headX, lampConfig.height - 0.08, 0);
  head.castShadow = true;
  group.add(head);

  // The lit lens. An emissive surface is what the eye reads as "the lamp is
  // on"; the SpotLight below is what puts light on the road. Both, always -
  // light is not a surface and a surface is not light.
  const lens = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.04, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0xffe6b8, emissive: 0xffd9a0, emissiveIntensity: 6, toneMapped: true,
    }),
  );
  lens.position.set(headX, lampConfig.height - 0.17, 0);
  group.add(lens);

  const light = new THREE.SpotLight(0xffd9a0, lampConfig.intensity, lampConfig.range, 1.02, 0.55, 1.6);
  light.position.set(headX, lampConfig.height - 0.2, 0);
  light.target.position.set(headX - lampConfig.side * 3.4, 0, 0);
  light.castShadow = true;
  light.shadow.mapSize.set(lampConfig.shadowSize, lampConfig.shadowSize);
  light.shadow.camera.near = 1;
  light.shadow.camera.far = lampConfig.range;
  light.shadow.bias = -0.0022;
  group.add(light);
  group.add(light.target);

  return { group, light };
}

/**
 * Builds the whole probe scene.
 * @param {THREE.Scene} scene
 * @param {object} options
 * @returns {object} handles, for the counters
 */
export function buildProbeScene(scene, options = {}) {
  const loader = new THREE.TextureLoader();
  const layout = roadLayout();
  const lights = [];
  const LENGTH = options.length || 460;

  // --- surfaces -----------------------------------------------------------
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(
      layout.shoulderEdge - layout.oncomingOuter, LENGTH,
      options.roadSegments || 1, options.roadSegments || 1,
    ),
    roadMaterial(loader, layout),
  );
  road.rotation.x = -Math.PI * 0.5;
  road.position.set((layout.shoulderEdge + layout.oncomingOuter) * 0.5, 0, -LENGTH * 0.35);
  road.receiveShadow = true;
  scene.add(road);

  // The verge, in snow. A second material rather than a second tile of the
  // first: the whole question here is whether real surfaces read as different
  // materials, and two shades of one texture would answer it dishonestly.
  const vergeMaterial = pbr(loader, 'snow', { repeat: new THREE.Vector2(10, 120), roughness: 0.92 });
  for (const side of [-1, 1]) {
    const verge = new THREE.Mesh(new THREE.PlaneGeometry(26, LENGTH), vergeMaterial);
    verge.rotation.x = -Math.PI * 0.5;
    verge.position.set(
      side > 0 ? layout.shoulderEdge + 13 : layout.oncomingOuter - 13,
      -0.06,
      -LENGTH * 0.35,
    );
    verge.receiveShadow = true;
    scene.add(verge);
  }

  // --- guardrail ----------------------------------------------------------
  const metal = pbr(loader, 'guardrail', {
    repeat: new THREE.Vector2(60, 1), metalness: 0.92, roughness: 0.42,
  });
  const railGeometry = new THREE.BoxGeometry(0.06, 0.38, LENGTH);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(railGeometry, metal);
    rail.position.set(
      side > 0 ? layout.shoulderEdge + 1.1 : layout.oncomingOuter - 1.1,
      0.66,
      -LENGTH * 0.35,
    );
    rail.castShadow = true;
    rail.receiveShadow = true;
    scene.add(rail);

    const postGeometry = new THREE.BoxGeometry(0.12, 0.72, 0.12);
    for (let z = 0; z < LENGTH; z += 4) {
      const post = new THREE.Mesh(postGeometry, metal);
      post.position.set(rail.position.x, 0.36, -LENGTH * 0.85 + z);
      post.castShadow = true;
      scene.add(post);
    }
  }

  // --- rock and trees -----------------------------------------------------
  const rockMaterial = pbr(loader, 'rock', { repeat: new THREE.Vector2(2, 2), roughness: 0.95 });
  const barkMaterial = pbr(loader, 'bark', { repeat: new THREE.Vector2(3, 6), roughness: 0.94 });
  const rockGeometry = new THREE.IcosahedronGeometry(1, options.rockDetail || 2);
  const trunkGeometry = new THREE.CylinderGeometry(0.22, 0.34, 7, 10);

  for (let i = 0; i < (options.props || 16); i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const z = -LENGTH * 0.8 + (i / (options.props || 16)) * LENGTH * 0.95;
    const x = (side > 0 ? layout.shoulderEdge + 6 : layout.oncomingOuter - 6) + side * (i % 3) * 2.4;

    if (i % 3 === 0) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, 0.5, z);
      rock.scale.setScalar(0.7 + (i % 4) * 0.35);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    } else {
      const trunk = new THREE.Mesh(trunkGeometry, barkMaterial);
      trunk.position.set(x, 3.5, z);
      trunk.castShadow = true;
      scene.add(trunk);
    }
  }

  // --- lamps --------------------------------------------------------------
  const lampConfig = {
    height: 9.2, reach: 2.6, intensity: options.lampIntensity || 2600, range: 60,
    shadowSize: options.shadowSize || 1024,
  };
  for (let i = 0; i < (options.lamps || 6); i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const lamp = streetLamp(metal, { ...lampConfig, side: -side });
    lamp.group.position.set(
      side > 0 ? layout.shoulderEdge + 1.8 : layout.oncomingOuter - 1.8,
      0,
      -16 - i * 26,
    );
    scene.add(lamp.group);
    lights.push(lamp.light);
  }

  // --- a little ambience, and nothing more --------------------------------
  // A night road is not pitch black between the lamps, but it is close. This is
  // deliberately weak: a hemisphere light strong enough to "see by" is what
  // turns a night scene into a grey day scene, and it is the single easiest way
  // to make a realistic render look wrong.
  const hemi = new THREE.HemisphereLight(0x223049, 0x0a0a10, 0.16);
  scene.add(hemi);

  // THE RIDER'S OWN HEADLIGHT, and leaving it out was making the probe argue
  // against itself. On an unlit stretch this is the ONLY thing lighting the
  // road, and it is the light that actually shows the asphalt - the aggregate,
  // the wheel polish and the wet patches all live in the three car lengths in
  // front of the bike, which no street lamp reaches. A realism probe without it
  // is a photograph of a road nobody is riding on.
  const headlight = new THREE.SpotLight(0xf2f6ff, options.headlamp || 900, 85, 0.5, 0.62, 1.5);
  headlight.position.set(0, 1.05, 0.6);
  headlight.target.position.set(0, 0, -34);
  headlight.castShadow = false;
  scene.add(headlight);
  scene.add(headlight.target);

  return { layout, lights, road, LENGTH, headlight };
}

/**
 * The vehicle, its lamps, and the light they throw.
 * @param {THREE.Object3D} model already loaded
 */
export function placeVehicle(scene, model, layout, options = {}) {
  const group = new THREE.Group();

  // ToyCar is modelled at a toy's scale and sits about 0.17 units long; a car
  // is 4.7. Scaled to the real thing rather than to what looks right, so the
  // triangle count in the report is the count of a car-sized object.
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = 4.6 / Math.max(size.z, 0.0001);
  model.scale.setScalar(scale);
  model.position.y = -box.min.y * scale;
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  group.add(model);

  // Headlights: real SpotLights, so the road in front of the car is lit by the
  // car rather than painted brighter.
  for (const side of [-1, 1]) {
    const head = new THREE.SpotLight(0xf4f8ff, options.headlight || 420, 70, 0.42, 0.42, 1.7);
    head.position.set(side * 0.72, 0.82, -2.3);
    head.target.position.set(side * 1.5, 0, -30);
    head.castShadow = false; // two more shadow maps for very little picture
    group.add(head);
    group.add(head.target);

    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdfe9ff, emissiveIntensity: 9 }),
    );
    lens.position.set(side * 0.72, 0.82, -2.35);
    group.add(lens);

    // Tail lights, and a small point light each so the road BEHIND the car
    // takes their colour. This is the shot the marketing brief cares about.
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.16, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff1a1a, emissiveIntensity: 7 }),
    );
    tail.position.set(side * 0.78, 0.86, 2.15);
    group.add(tail);

    const glow = new THREE.PointLight(0xff2a1a, options.taillight || 26, 12, 2);
    glow.position.set(side * 0.78, 0.62, 2.5);
    group.add(glow);
  }

  // FACING AWAY, like the traffic the rider actually sees. Turned toward the
  // camera it is an oncoming car with its headlights in your eyes, which blows
  // out the middle of the frame and hides the thing being photographed - the
  // road surface. This way its tail lights face us and its headlights light the
  // asphalt in front of it, which is the shot worth comparing.
  group.position.set(layout.laneCentres[2], 0, -26);
  scene.add(group);
  return group;
}
