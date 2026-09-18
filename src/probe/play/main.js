import * as THREE from 'three';
import { config } from '../../config.js';
import { Loop } from '../../core/Loop.js';
import { Input } from '../../core/Input.js';
import { Framing } from '../../core/Framing.js';
import { Road } from '../../world/Road.js';
import { Traffic } from '../../world/Traffic.js';
import { BikePhysics } from '../../player/BikePhysics.js';
import { Session, PHASE } from '../../game/Session.js';
import { RoadLook } from './road-look.js';
import { TrafficLook } from './traffic-look.js';
import { buildBike, setBraking, disposeBike } from './bike.js';
import { ChaseCamera } from './chase-camera.js';
import { configureRenderer, buildLook } from './look.js';
import { buildGrade } from './grade.js';

/**
 * THE PLAYABLE REALISM PROBE. One scene, ridden, in real materials.
 *
 *     npm run dev   ->   /probe-play.html
 *     ?quality=low       no shadows, smaller maps - the weaker machine
 *     ?fp=1              first person, for comparing the camera rather than
 *                        the look
 *
 * Branch `probe/realism` only. Nothing here is on `main`, nothing here is meant
 * to merge, and the neon game is untouched by all of it.
 *
 * ================= WHAT IS BORROWED, AND WHAT IS NEW =================
 *
 * BORROWED, UNCHANGED, AND THAT IS THE POINT: core/Loop.js, core/Input.js,
 * core/Framing.js, world/Road.js, world/Traffic.js, player/BikePhysics.js and
 * game/Session.js are imported and driven in the SAME ORDER as src/main.js.
 * Not copies of them - the modules themselves. So the speed model, the lateral
 * clamp, the collision boxes, the near miss detection, the lives and the
 * scoring in this scene are the shipped ones, and if the realistic direction
 * were taken none of that code would be what changed.
 *
 * NEW: the renderer settings, the lighting, the materials, the bike and the
 * camera. That is the whole list, and it is the answer to what a realistic
 * conversion would actually cost.
 *
 * ================= THE CAMERA TRICK =================
 *
 * BikePhysics writes a transform onto whatever camera it is handed. It is
 * handed a HIDDEN camera here - the rider's eye, exactly where the first person
 * view would be - and the chase camera follows that. So third person costs
 * nothing in the physics and cannot become a second physics system.
 *
 * WHAT IS DELIBERATELY MISSING: sky, roadside, median, scenery, weather,
 * mountains, the cockpit sprite, bloom and the whole neon grade. Every one of
 * them is a neon object, and the brief was ONE realistic scene rather than a
 * realistic version of every object in the game.
 */

const params = new URLSearchParams(location.search);
const container = document.getElementById('app');
const readout = document.getElementById('readout');
const LOW = params.get('quality') === 'low';
const FIRST_PERSON = params.get('fp') === '1';

// --- renderer -------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({
  antialias: !LOW,
  powerPreference: 'high-performance',
});
// EXPOSURE IS LIFTED WHEN THE GRADE IS ON. The grade's contrast pivots below
// mid grey and still costs a night scene some light, so the frame is exposed
// for what comes out of the grade rather than for what goes into it. Graded and
// ungraded at the same exposure is not a fair comparison of a grade.
const GRADED = params.get('raw') !== '1';
configureRenderer(renderer, { shadows: !LOW, exposure: GRADED ? 1.38 : 1.15 });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const framing = new Framing().update(window.innerWidth / window.innerHeight);

// The camera that is actually drawn.
const camera = new THREE.PerspectiveCamera(
  framing.fov, window.innerWidth / window.innerHeight, 0.1, 1400,
);

// THE RIDER'S EYE. Never rendered; it exists so BikePhysics has something to
// write to. A PerspectiveCamera rather than an Object3D because the physics and
// the framing both expect a camera's fields to be there.
const rider = new THREE.PerspectiveCamera(framing.fov, 1, 0.1, 1400);
rider.rotation.order = 'YXZ';

// --- the world, all of it the game's own ---------------------------------
const input = new Input(container);
const road = new Road(scene);
const bike = new BikePhysics(rider, road.path, framing);
const traffic = new Traffic(scene, road, bike);
const session = new Session();

// --- the look -------------------------------------------------------------
const look = buildLook(scene, renderer, {
  shadows: !LOW,
  shadowSize: LOW ? 1024 : 2048,
  fog: 0.0075,
});
const loader = new THREE.TextureLoader();
const roadLook = new RoadLook(loader, { wetness: LOW ? 0 : 0.35 });
roadLook.apply(road);
const trafficLook = new TrafficLook();
const swapped = trafficLook.apply(traffic);

const machine = buildBike();
machine.headlight.castShadow = !LOW;
if (!LOW) machine.headlight.shadow.mapSize.set(1024, 1024);
scene.add(machine.group);
machine.group.visible = !FIRST_PERSON;

const chase = new ChaseCamera(camera, rider);

// THE GRADE. One pass, no bloom - see play/grade.js for why a full scene bloom
// over a lit scene is the fastest way to make it look like a game again.
// `?raw=1` turns it off, so what the grade is actually doing can be seen rather
// than assumed.
const grade = GRADED ? buildGrade(renderer, scene, camera) : null;

// --- the loop, in the game's order ---------------------------------------
const loop = new Loop(renderer, {
  onRender: (dt) => (grade ? grade.composer.render(dt) : renderer.render(scene, camera)),
});
loop.state.input = input.values;

loop.add((dt) => input.update(dt));
loop.add((dt, state) => session.publish(state));
// step -> place, exactly as src/main.js orders them. Anything that corrects the
// bike's position has to run between the two, and nothing here does.
loop.add((dt, state) => bike.step(dt, state));
loop.add((dt, state) => bike.place(dt, state));
loop.add((dt, state) => road.update(dt, state));
loop.add((dt, state) => traffic.update(dt, state));
loop.add((dt, state) => session.update(dt, state));

// A newly recycled chunk is built with the material it was constructed with, so
// the swap is re-applied rather than done once. Cheap - it is an assignment per
// chunk - and it is what stops a neon chunk appearing a kilometre ahead.
loop.add(() => roadLook.apply(road));

loop.add((dt, state) => {
  // THE BIKE UNDER THE RIDER. The eye sits `camera.height` above the road, so
  // the machine hangs below it by exactly that, and the lean is the physics'
  // own - reading it rather than deriving a second one is what keeps the bike
  // and the view agreeing through a corner.
  machine.group.position.copy(rider.position);
  machine.group.position.y -= config.player.camera.height;
  machine.group.rotation.set(0, rider.rotation.y, 0);
  machine.group.rotation.z = -bike.lean;
  setBraking(machine, (state.input && state.input.brake > 0.05) || false);
  look.follow(rider.position);
  if (FIRST_PERSON) {
    camera.position.copy(rider.position);
    camera.rotation.copy(rider.rotation);
  } else {
    chase.update(dt, state);
  }
});

// --- readout --------------------------------------------------------------
let frames = 0;
let elapsed = 0;
let fps = 0;
loop.add((dt, state) => {
  frames++;
  elapsed += dt;
  if (elapsed < 0.5) return;
  fps = frames / elapsed;
  frames = 0;
  elapsed = 0;
  if (!readout) return;
  readout.textContent = [
    `FPS        ${fps.toFixed(1)}`,
    `draw calls ${renderer.info.render.calls}`,
    `triangles  ${renderer.info.render.triangles.toLocaleString()}`,
    `textures   ${renderer.info.memory.textures}`,
    // UNITS A SECOND, not km/h. There is no speed-to-km/h conversion anywhere
    // in this project - the cockpit gauge is a needle, not a readout - so one
    // invented here would be a number that agrees with nothing.
    `speed      ${Math.round(state.speed || 0)} u/s`,
    `distance   ${Math.round(state.distance || 0)} m`,
    `score      ${session.score}   lives ${session.lives}`,
    `hits ${state.hits || 0}   near misses ${state.nearMisses || 0}`,
    `body meshes re-materialled ${swapped}`,
  ].join('\n');
});

// `renderer.info` is reset manually because autoReset is off - see
// play/look.js. Without this the counters accumulate across frames and read as
// tens of thousands of draw calls.
loop.add(() => renderer.info.reset());

// The run starts immediately. There is no title card here and no selection
// flow: this is a probe of a LOOK, and a menu in front of it is a menu somebody
// has to click through on every screenshot.
session.begin(loop.state);
loop.start();

window.PROBE = {
  renderer, scene, camera, rider, loop, road, traffic, bike, session,
  look, roadLook, trafficLook, machine, chase, grade, PHASE,
};

window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  framing.update(aspect);
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (grade) grade.setSize(window.innerWidth, window.innerHeight);
});

// Vite HMR: without this a hot reload stacks a second world on the first and
// the frame rate halves for reasons nobody can see. Same rule as src/main.js.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    loop.stop();
    input.dispose();
    traffic.dispose();
    road.dispose();
    roadLook.dispose();
    trafficLook.dispose();
    disposeBike(machine);
    if (grade) grade.dispose();
    look.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  });
}
