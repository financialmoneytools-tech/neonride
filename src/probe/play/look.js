import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { pbr } from '../materials.js';

/**
 * Everything that makes the playable probe LIT rather than drawn: renderer
 * settings, the environment that metal reflects, the sky, the moon and the
 * ground either side of the road.
 *
 * ================= THE SHIPPED GAME HAS NO LIGHTS AT ALL =================
 *
 * Not "few" - none. Every surface in Neon Ride is a MeshBasicMaterial or a
 * custom shader that computes its own colour, and nothing casts a shadow. That
 * is the style rather than a shortcut: neon is emission and emission needs no
 * light. So this file is not a lighting pass over an existing lighting setup,
 * it is the first one the project has ever had, and everything it costs it
 * costs because of that.
 *
 * ================= WHY THERE IS AN ENVIRONMENT MAP =================
 *
 * Metalness 1 with no environment is BLACK. A metal surface has no diffuse
 * response at all - everything you see in it is reflected - so forks, discs and
 * an exhaust with nothing to reflect come out as silhouettes, and the usual
 * reaction is to turn metalness down until they look like something, which
 * makes them painted plastic. RoomEnvironment is used because it ships with
 * three and needs no asset; its intensity is pulled a long way down because it
 * is a lit room and this is a road at night.
 */

/** Applies the renderer settings a realistic scene needs. */
export function configureRenderer(renderer, options = {}) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // PHYSICAL LIGHTING, so the intensities below are in real units rather than
  // numbers somebody tuned by eye.
  renderer.useLegacyLights = false;
  renderer.shadowMap.enabled = options.shadows !== false;
  // PCFSoftShadowMap was removed in this version of three and falls back to
  // PCFShadowMap with a warning, so it is asked for directly.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = options.exposure === undefined ? 1.15 : options.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.info.autoReset = false;
}

/**
 * Builds the world's lighting and its ground.
 *
 * @param {THREE.Scene} scene
 * @param {THREE.WebGLRenderer} renderer
 * @param {object} [options]
 */
export function buildLook(scene, renderer, options = {}) {
  const loader = new THREE.TextureLoader();
  const disposables = [];

  // --- sky and air --------------------------------------------------------
  scene.background = new THREE.Color(0x0a0f18);
  // Real aerial perspective. Without it the far road ends at a hard line and
  // the traffic pops in at the chunk boundary rather than resolving out of the
  // dark - the shipped game solves that with a neon fade in the shader, which
  // a lit scene has no equivalent of.
  scene.fog = new THREE.FogExp2(0x0a0f18, options.fog === undefined ? 0.0075 : options.fog);

  // --- what metal reflects ------------------------------------------------
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  // The room is a lit interior and this is a night road, so it is dimmed hard
  // at the material rather than here - see `envMapIntensity` on each material.
  scene.environmentIntensity = options.envIntensity === undefined ? 0.16 : options.envIntensity;
  pmrem.dispose();
  disposables.push(environment.texture);

  // --- moon ---------------------------------------------------------------
  // ONE shadow casting light for the whole world. A directional light is the
  // only kind that can light a road stretching a kilometre from a single
  // source, and its shadow camera is kept tight around the rider because a
  // frustum big enough for the whole road would spread 2048 pixels over a
  // kilometre and cast nothing anybody could see.
  const moon = new THREE.DirectionalLight(0xbcd2ff, options.moon === undefined ? 1.1 : options.moon);
  moon.position.set(-38, 46, -22);
  moon.castShadow = options.shadows !== false;
  moon.shadow.mapSize.set(options.shadowSize || 2048, options.shadowSize || 2048);
  const extent = 26;
  moon.shadow.camera.left = -extent;
  moon.shadow.camera.right = extent;
  moon.shadow.camera.top = extent;
  moon.shadow.camera.bottom = -extent;
  moon.shadow.camera.near = 1;
  moon.shadow.camera.far = 140;
  moon.shadow.bias = -0.0012;
  moon.shadow.normalBias = 0.02;
  scene.add(moon, moon.target);

  // Sky bounce. A night road is not lit only from the moon: the sky itself is a
  // large dim source, and without it every shadow is pure black and the scene
  // reads as a studio at midnight rather than as outdoors.
  const sky = new THREE.HemisphereLight(0x2a3a55, 0x14100c, 0.5);
  scene.add(sky);

  // --- the ground either side --------------------------------------------
  // ONE PLANE THAT FOLLOWS THE RIDER, snapped to whole texture tiles. The road
  // curves by up to 70 metres laterally, so a fixed plane would run out; and a
  // pool of ground chunks would be a second recycling system to keep in step
  // with the road's. Snapping to the tile size is what stops the texture
  // visibly sliding as the plane moves under it.
  const TILE = 40;
  const groundMaterial = pbr(loader, 'rock', {
    repeat: new THREE.Vector2(24, 24),
    roughness: 1,
  });
  groundMaterial.aoMap = null; // a PlaneGeometry has one uv set, like the road
  groundMaterial.envMapIntensity = 0.3;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(960, 960), groundMaterial);
  ground.rotation.x = -Math.PI * 0.5;
  // Just under the road, so the road is never z-fighting against it and the
  // verge reads as a drop rather than as a seam.
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);
  disposables.push(ground.geometry, groundMaterial);

  return {
    moon,
    sky,
    ground,
    /**
     * Keeps the ground and the moon's shadow frustum with the rider.
     * @param {THREE.Vector3} position
     */
    follow(position) {
      ground.position.x = Math.round(position.x / TILE) * TILE;
      ground.position.z = Math.round(position.z / TILE) * TILE;
      // The shadow camera travels with the rider; see the note on the frustum.
      moon.position.set(position.x - 38, 46, position.z - 22);
      moon.target.position.set(position.x, 0, position.z);
      moon.target.updateMatrixWorld();
    },
    dispose() {
      for (const item of disposables) if (item && item.dispose) item.dispose();
      scene.environment = null;
    },
  };
}
