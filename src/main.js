import * as THREE from 'three';
import { config } from './config.js';
import { Engine } from './core/Engine.js';
import { Framing } from './core/Framing.js';
import { Loop } from './core/Loop.js';
import { Input } from './core/Input.js';
import { StatsOverlay } from './ui/StatsOverlay.js';
import { Sky } from './world/Sky.js';
import { Road } from './world/Road.js';
import { Roadside } from './world/Roadside.js';
import { Mountains } from './world/Mountains.js';
import { BikePhysics } from './player/BikePhysics.js';
import { Rider } from './player/Rider.js';
import { Postprocess } from './fx/Postprocess.js';

/**
 * main.js - bootstrap only.
 * Builds the modules, wires them into the single animation loop and
 * handles HMR cleanup. No game logic belongs here.
 */

const container = document.getElementById('app');

const engine = new Engine(container);

// Resolves the field of view, the pitch and the cockpit placement for whatever
// shape the frame is. Everything aspect dependent goes through here.
const framing = new Framing().update(window.innerWidth / window.innerHeight);
const input = new Input(container);

// Distance fog. Its color is what every fogged out fragment converges to, and
// it is matched to the sky at the horizon, so the point where new road chunks
// appear is not merely far away, it is the same color as the sky behind it.
engine.scene.fog = new THREE.FogExp2(config.world.fog.color, config.world.fog.density);

const sky = new Sky(engine.scene, engine.camera);
const road = new Road(engine.scene);
const roadside = new Roadside(engine.scene, road);
const mountains = new Mountains(engine.scene);
const bike = new BikePhysics(engine.camera, road.path, framing);
const rider = new Rider(engine.camera, framing);
const stats = config.stats.enabled ? new StatsOverlay(document.body) : null;

// The composer owns the frame from here on; engine.render() is only the
// fallback used when config.postprocess.enabled is turned off.
const post = new Postprocess(engine.renderer, engine.scene, engine.camera);
engine.onResize = (width, height) => {
  framing.update(width / height);
  post.setSize(width, height);
};

const loop = new Loop(engine.renderer, {
  onRender: (dt) => post.render(dt),
});

// Input values are exposed to every module through the shared state
loop.state.input = input.values;

loop.add((dt) => input.update(dt));

// Order matters: the bike publishes state.distance and state.speed, and
// everything that recycles or follows reads them in the same frame, before the
// sky recenters on the camera.
loop.add((dt, state) => bike.update(dt, state));
loop.add((dt, state) => road.update(dt, state));
loop.add((dt, state) => mountains.update(dt, state));
loop.add((dt, state) => rider.update(dt, state));
loop.add((dt) => sky.update(dt));
loop.add((dt, state) => post.update(dt, state));
if (stats) loop.add((dt, state) => stats.update(dt, state));

loop.start();

// Development only: every elimination test in the notes assumes config can be
// poked from the browser console, but Vite modules are not globals. Publishing
// the live objects here is what makes those tests actually runnable. The guard
// keeps it out of a production build entirely.
if (import.meta.env && import.meta.env.DEV) {
  window.NEON = { config, engine, framing, loop, input, sky, road, roadside, mountains, bike, rider, post };
}

/** Releases every resource in order (the loop stops first). */
function disposeAll() {
  loop.dispose();
  post.dispose();
  rider.dispose();
  bike.dispose();
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
