import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { config } from '../config.js';
import { buildProbeScene } from './scene.js';
import { buildCar } from './car.js';

/**
 * The realism probe's entry point. Static scene, no gameplay, no loop except
 * the one that draws it.
 *
 * THE CAMERA IS THE GAME'S CAMERA, and that is the only reason the comparison
 * means anything: same eye height (config.player.camera.height 2.35), same base
 * field of view (config.framing profile 75), same downward pitch (-0.0994 rad),
 * same 1280x720. Photographing a realistic scene from a flattering angle and
 * the current one from a driving angle would prove nothing at all.
 *
 * `?quality=low` drops the shadow maps and the lamp count, which is the closest
 * this can get to a phone without a phone.
 */

const params = new URLSearchParams(location.search);
const container = document.getElementById('app');
const readout = document.getElementById('readout');
const LOW = params.get('quality') === 'low';

const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
// PHYSICAL LIGHTING. Without this the light units below are meaningless and
// every intensity becomes a number somebody tuned by eye.
renderer.useLegacyLights = false;
renderer.shadowMap.enabled = !LOW;
// PCFSoftShadowMap was removed in this version of three and silently falls
// back to PCFShadowMap with a warning; asked for directly instead.
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.info.autoReset = false;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070d);
// A night road has real aerial perspective; without fog the far lamps read as
// a row of identical dots and the road has no depth at all.
scene.fog = new THREE.FogExp2(0x070a12, 0.0085);

// The 16:9 profile, which is the one the whole cockpit was tuned against and
// the one both screenshots are taken at.
const framing = config.framing.profiles[0];
const camera = new THREE.PerspectiveCamera(
  framing.fov, window.innerWidth / window.innerHeight, 0.1, 2000,
);
// EXACTLY WHERE THE RIDER'S EYES ARE. config.player.CAMERA.height, not
// bike.height - there is no such field, and reading it set the camera's y to
// undefined, which is a NaN transform and a completely black frame.
camera.position.set(0, config.player.camera.height, 0);
camera.rotation.order = 'YXZ';
camera.rotation.x = framing.pitch;

const built = buildProbeScene(scene, {
  lamps: LOW ? 5 : 9,
  shadowSize: LOW ? 512 : 1024,
  props: LOW ? 10 : 16,
});
// The camera sits in the middle of our carriageway, like the bike does, and
// the rider's headlight rides with it.
camera.position.x = built.layout.laneCentres[1];
built.headlight.position.x = camera.position.x;
built.headlight.target.position.x = camera.position.x;

// Bloom only. The game's own grade does a great deal more, and adding it here
// would be measuring the grade rather than the lighting.
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth * 0.5, window.innerHeight * 0.5), 0.26, 0.5, 0.95,
);
composer.addPass(bloom);

// THE VEHICLE IS HAND BUILT, and the search that led there is in
// src/probe/car.js. There is no free photoreal car: Poly Haven has 521 models
// and the only one is a car under a tarpaulin, Kenney's kit is CC0 and
// low-poly stylised, and Khronos's ToyCar is real clearcoat paint on a toy's
// body - it was used in the first pass of this probe and read as a toy.
const car = buildCar({ detail: LOW ? 0 : 1 });
// Parked under the second lamp, so the paint and the shoulder line are lit
// by something other than its own tail lights. `?car=close` brings it to
// riding distance, which is the shot that shows whether a hand-built body
// stands up to being looked at.
const CLOSE = params.get('car') === 'close';
car.group.position.set(
  built.layout.laneCentres[2] + (CLOSE ? -1.1 : 0), 0, CLOSE ? -11 : -30,
);
if (CLOSE) car.group.rotation.y = 0.16;
scene.add(car.group);
const ready = true;

// --- counters -------------------------------------------------------------
let frames = 0;
let elapsed = 0;
let fps = 0;
const clock = new THREE.Clock();

/** Bytes of GPU texture memory, counted honestly. */
function textureBytes() {
  let bytes = 0;
  const seen = new Set();
  scene.traverse((object) => {
    const materials = object.material
      ? (Array.isArray(object.material) ? object.material : [object.material])
      : [];
    for (const material of materials) {
      for (const key of Object.keys(material)) {
        const value = material[key];
        if (!value || !value.isTexture || seen.has(value.uuid)) continue;
        seen.add(value.uuid);
        const image = value.image;
        if (!image || !image.width) continue;
        // RGBA8 plus a full mip chain, which is what the driver actually holds.
        bytes += image.width * image.height * 4 * 1.333;
      }
    }
  });
  return bytes;
}

function triangles() {
  let count = 0;
  scene.traverse((object) => {
    if (!object.isMesh || !object.geometry) return;
    const geometry = object.geometry;
    const index = geometry.index;
    count += index ? index.count / 3 : geometry.attributes.position.count / 3;
  });
  return count;
}

window.PROBE = { renderer, scene, camera, composer, built, stats: null };

function frame() {
  const dt = clock.getDelta();
  elapsed += dt;
  frames++;
  if (elapsed >= 0.5) {
    fps = frames / elapsed;
    frames = 0;
    elapsed = 0;
  }

  renderer.info.reset();
  composer.render(dt);

  const stats = {
    fps: +fps.toFixed(1),
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    sceneTriangles: Math.round(triangles()),
    textureMB: +(textureBytes() / 1024 / 1024).toFixed(1),
    programs: renderer.info.programs ? renderer.info.programs.length : 0,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
    lights: built.lights.length,
    shadowMaps: renderer.shadowMap.enabled ? built.lights.length : 0,
    ready,
  };
  window.PROBE.stats = stats;
  if (readout) {
    readout.textContent = [
      `FPS        ${stats.fps.toFixed(1)}`,
      `draw calls ${stats.drawCalls}`,
      `triangles  ${stats.triangles.toLocaleString()}`,
      `textures   ${stats.textures}  (${stats.textureMB} MB)`,
      `geometries ${stats.geometries}`,
      `lights     ${stats.lights}  shadow maps ${stats.shadowMaps}`,
      `programs   ${stats.programs}`,
    ].join('\n');
  }
  // `__halt` lets tools/probe-bench.mjs stop this loop before it times a
  // frame; measuring while the app is also drawing measures the two competing.
  if (!window.__halt) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
