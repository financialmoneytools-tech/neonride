import * as THREE from 'three';
import { config } from './config.js';
import { Device } from './core/Device.js';
import { Engine } from './core/Engine.js';
import { Framing } from './core/Framing.js';
import { Hotkeys } from './core/Hotkeys.js';
import { Loop } from './core/Loop.js';
import { Input } from './core/Input.js';
import { Fullscreen, Viewport } from './core/Viewport.js';
import { StatsOverlay } from './ui/StatsOverlay.js';
import { Sky } from './world/Sky.js';
import { Road } from './world/Road.js';
import { Roadside } from './world/Roadside.js';
import { Mountains } from './world/Mountains.js';
import { Traffic } from './world/Traffic.js';
import { BikePhysics } from './player/BikePhysics.js';
import { Rider } from './player/Rider.js';
import { Postprocess } from './fx/Postprocess.js';

/**
 * main.js - bootstrap only.
 * Builds the modules, wires them into the single animation loop and
 * handles HMR cleanup. No game logic belongs here.
 */

const container = document.getElementById('app');

// FIRST, before anything is constructed. Most of what a quality preset changes
// cannot be changed afterwards: the renderer reads antialias once, the star
// field allocates from the counts, the traffic pools size themselves on
// creation.
const device = new Device();

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
const traffic = new Traffic(engine.scene, road, bike);
const stats = config.stats.enabled ? new StatsOverlay(document.body) : null;

// The composer owns the frame from here on; engine.render() is only the
// fallback used when config.postprocess.enabled is turned off.
const post = new Postprocess(engine.renderer, engine.scene, engine.camera);
engine.onResize = (width, height) => {
  framing.update(width / height);
  post.setSize(width, height);
};

// Owns what size the frame is. On a phone that is not the window: the address
// bar covers part of it and animates in and out while you play, so the size is
// taken from visualViewport, debounced, and ignored entirely when it moves by
// less than the bar could account for.
const viewport = new Viewport((width, height) => engine.resize(width, height));

// A browser only accepts a fullscreen request inside a user gesture, and on a
// device with no keyboard the first touch is the only one that reliably
// arrives. Offered, never forced, and allowed to be refused - iOS phones
// refuse outright and the game plays the same either way.
if (config.viewport.fullscreen.onFirstTouchWhenCoarse && device.coarsePointer) {
  input.onFirstTouch = () => Fullscreen.request();
}

const loop = new Loop(engine.renderer, {
  onRender: (dt) => post.render(dt),
});

// Input values are exposed to every module through the shared state
loop.state.input = input.values;

loop.add((dt) => input.update(dt));
// Shares the one clock rather than keeping its own timer, so a resize settles
// in game time like everything else.
loop.add((dt) => viewport.update(dt));

// Order matters: the bike publishes state.distance and state.speed, and
// everything that recycles or follows reads them in the same frame, before the
// sky recenters on the camera.
loop.add((dt, state) => bike.update(dt, state));
loop.add((dt, state) => road.update(dt, state));
loop.add((dt, state) => mountains.update(dt, state));
loop.add((dt, state) => traffic.update(dt, state));
loop.add((dt, state) => rider.update(dt, state));
loop.add((dt) => sky.update(dt));
loop.add((dt, state) => post.update(dt, state));
if (stats) loop.add((dt, state) => stats.update(dt, state));

/** Applies capture mode: overlay off, pixel ratio pinned, chain resized. */
function applyCapture() {
  if (stats) stats.setVisible(!(config.capture.enabled && config.capture.hideOverlay));
  // Picks up the capture pixel ratio and resizes the chain.
  engine.resize(viewport.width, viewport.height);
}

const hotkeys = new Hotkeys(
  {
    capture: () => {
      config.capture.enabled = !config.capture.enabled;
      applyCapture();
    },
    cameraProfile: () => {
      const names = Object.keys(config.player.camera.profiles);
      const next = (names.indexOf(config.player.camera.profile) + 1) % names.length;
      config.player.camera.profile = names[next];
    },
    overlay: () => {
      if (stats) stats.setVisible(!stats.visible);
    },
    handSource: () => {
      const hand = config.player.rider.hand;
      hand.source = hand.source === 'primitive' ? 'model' : 'primitive';
      rider.rebuildHands();
      console.info('[rider] hand source:', hand.source);
    },
    fullscreen: () => Fullscreen.toggle(),
    quality: () => {
      // Only the settings that can be changed live are re-applied: the pixel
      // ratio and the bloom buffer size. Anything allocated at construction -
      // antialiasing, star counts, traffic pools - needs a reload, which is
      // why this is a testing aid and not a settings menu.
      const names = Object.keys(config.quality.presets);
      const next = (names.indexOf(device.preset) + 1) % names.length;
      device.preset = names[next];
      device.apply();
      engine.resize(viewport.width, viewport.height);
      console.info('[quality] preset:', device.preset, '(reload for the rest)');
    },
  },
  config.input.hotkeys,
);

applyCapture();
loop.start();

// Development only: every elimination test in the notes assumes config can be
// poked from the browser console, but Vite modules are not globals. Publishing
// the live objects here is what makes those tests actually runnable. The guard
// keeps it out of a production build entirely.
if (import.meta.env && import.meta.env.DEV) {
  window.NEON = { config, device, engine, framing, hotkeys, loop, input, viewport, sky, road, roadside, mountains, traffic, bike, rider, post };
}

/** Releases every resource in order (the loop stops first). */
function disposeAll() {
  loop.dispose();
  hotkeys.dispose();
  viewport.dispose();
  post.dispose();
  rider.dispose();
  bike.dispose();
  traffic.dispose();
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
