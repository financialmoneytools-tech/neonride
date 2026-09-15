import * as THREE from 'three';
import { config } from './config.js';
import { Device } from './core/Device.js';
import { Engine } from './core/Engine.js';
import { Framing } from './core/Framing.js';
import { Hotkeys, KeySequence } from './core/Hotkeys.js';
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
import { Autopilot } from './player/Autopilot.js';
import { Guard } from './player/autopilot/Guard.js';
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

// Drives for recording. It produces steer, throttle and brake and nothing else,
// so the bike, the lean, the bob and the camera cannot tell it from a player -
// which is both why it looks like a rider and why it cannot drift out of sync.
const autopilot = new Autopilot(road.path, traffic, bike);

// The cheat that makes failure impossible while recording. It runs between the
// bike moving and traffic judging it, which is the only window in the frame
// where the position the collision test will read can still be corrected.
const guard = new Guard(bike, traffic);
const stats = config.stats.enabled ? new StatsOverlay(document.body) : null;

// The composer owns the frame from here on; engine.render() is only the
// fallback used when config.postprocess.enabled is turned off.
const post = new Postprocess(engine.renderer, engine.scene, engine.camera);
engine.onResize = (width, height) => {
  framing.refresh(width / height);
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
// Runs before the bike, which consumes the values in the same frame. Swapping
// the reference rather than merging means the human input is never half applied
// while the autopilot is driving.
loop.add((dt, state) => {
  if (!config.autopilot.enabled) {
    state.input = input.values;
    return;
  }
  autopilot.update(dt, state);
  state.input = autopilot.values;
});
// Shares the one clock rather than keeping its own timer, so a resize settles
// in game time like everything else.
loop.add((dt) => viewport.update(dt));
// Framing resolves from whatever it reads, not from whatever last fired an
// event: a resize above will already have pushed the new aspect through, and
// this is what catches a profile edited from the console or over HMR. It is a
// no-op on a frame where nothing it depends on has moved.
loop.add(() => framing.refresh(engine.camera.aspect));

// Order matters: the bike publishes state.distance and state.speed, and
// everything that recycles or follows reads them in the same frame, before the
// sky recenters on the camera.
// Three steps, and the order is the whole point: the bike moves, the guard
// corrects where it ended up, and only then is the view built from it. Placing
// the camera inside the move meant the guard was correcting a position the
// frame had already been drawn from.
loop.add((dt, state) => bike.step(dt, state));
loop.add((dt, state) => guard.update(dt, state));
loop.add((dt, state) => bike.place(dt, state));
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
      // The profiles are named in the framing profiles now, one set per aspect,
      // so the list of them is read from there rather than from a second copy
      // beside the selector.
      const names = Object.keys(config.framing.profiles[0].cameras);
      const next = (names.indexOf(config.player.camera.profile) + 1) % names.length;
      config.player.camera.profile = names[next];
    },
    overlay: () => {
      if (stats) stats.setVisible(!stats.visible);
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

/**
 * Turns self driving on or off. Hidden on purpose: nothing on screen says it
 * exists, and the only ways in are the typed sequence below and this function.
 * @param {boolean} [on]
 */
function setAutopilot(on) {
  const cfg = config.autopilot;
  cfg.enabled = on === undefined ? !cfg.enabled : !!on;

  // Recording is the whole reason it exists, so it brings capture mode with it:
  // overlay off, pixel ratio pinned. Turning it off leaves capture alone, since
  // by then the choice may be deliberate.
  if (cfg.enabled && cfg.withCapture && !config.capture.enabled) {
    config.capture.enabled = true;
    applyCapture();
  }
  return cfg.enabled;
}

const reveal = new KeySequence(
  config.autopilot.reveal.sequence,
  config.autopilot.reveal.window,
  () => setAutopilot(),
);

// The other way in, for driving a recording from a script. Deliberately not
// behind the DEV guard - a build made for recording needs it - and deliberately
// not announced anywhere the player can see.
window.neonRide = { god: setAutopilot };

applyCapture();
loop.start();

// Development only: every elimination test in the notes assumes config can be
// poked from the browser console, but Vite modules are not globals. Publishing
// the live objects here is what makes those tests actually runnable. The guard
// keeps it out of a production build entirely.
if (import.meta.env && import.meta.env.DEV) {
  window.NEON = { config, device, engine, framing, hotkeys, loop, input, viewport, sky, road, roadside, mountains, traffic, bike, rider, autopilot, guard, post };
}

/** Releases every resource in order (the loop stops first). */
function disposeAll() {
  loop.dispose();
  hotkeys.dispose();
  reveal.dispose();
  viewport.dispose();
  post.dispose();
  rider.dispose();
  autopilot.dispose();
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
