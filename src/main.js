import * as THREE from 'three';
import { config } from './config.js';
import { Engine } from './core/Engine.js';
import { Loop } from './core/Loop.js';
import { Input } from './core/Input.js';
import { StatsOverlay } from './ui/StatsOverlay.js';
import { Sky } from './world/Sky.js';
import { Road } from './world/Road.js';
import { Roadside } from './world/Roadside.js';
import { Mountains } from './world/Mountains.js';
import { RoadCamera } from './world/RoadCamera.js';
import { FreeLook } from './debug/FreeLook.js'; // PHASE 4: delete with src/debug/

/**
 * main.js - bootstrap only.
 * Builds the modules, wires them into the single animation loop and
 * handles HMR cleanup. No game logic belongs here.
 */

const container = document.getElementById('app');

const engine = new Engine(container);
const input = new Input(container);

// Distance fog. Its color is what every fogged out fragment converges to, and
// it is matched to the sky at the horizon, so the point where new road chunks
// appear is not merely far away, it is the same color as the sky behind it.
engine.scene.fog = new THREE.FogExp2(config.world.fog.color, config.world.fog.density);

const sky = new Sky(engine.scene, engine.camera);
const road = new Road(engine.scene);
const roadside = new Roadside(engine.scene, road);
const mountains = new Mountains(engine.scene);
const roadCamera = new RoadCamera(engine.camera, road.path);
const stats = config.stats.enabled ? new StatsOverlay(document.body) : null;

const loop = new Loop(engine.renderer, {
  onRender: () => engine.render(),
});

// Input values are exposed to every module through the shared state
loop.state.input = input.values;

loop.add((dt) => input.update(dt));

// Order matters: the camera publishes state.distance, and everything that
// recycles reads it in the same frame, before the sky recenters on the camera.
loop.add((dt, state) => roadCamera.update(dt, state));
loop.add((dt, state) => road.update(dt, state));
loop.add((dt, state) => mountains.update(dt, state));
loop.add((dt) => sky.update(dt));
if (stats) loop.add((dt, state) => stats.update(dt, state));

const freeLook = FreeLook.install(loop, engine.camera, input); // PHASE 4: delete

loop.start();

/** Releases every resource in order (the loop stops first). */
function disposeAll() {
  loop.dispose();
  if (freeLook) freeLook.dispose();
  roadCamera.dispose();
  mountains.dispose();
  roadside.dispose();
  road.dispose();
  sky.dispose();
  input.dispose();
  if (stats) stats.dispose();
  engine.scene.fog = null;
  engine.dispose();
}

// Vite HMR safety: the old scene is fully torn down before the module reloads,
// otherwise scenes stack up and the frame rate collapses.
if (import.meta.hot) {
  import.meta.hot.dispose(disposeAll);
  import.meta.hot.accept();
}
