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
import { StartScreen } from './ui/StartScreen.js';
import { Hud } from './ui/Hud.js';
import { Panels } from './ui/Panels.js';
import { PHASE, Session } from './game/Session.js';
import { Audio } from './audio/Audio.js';
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
// After everything that writes to state, because every voice in it is driven
// by what the frame ended up being rather than by what it started as.
loop.add((dt, state) => audio.update(dt, state));
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
    mute: () => {
      console.info('[audio]', audio.toggleMute() ? 'muted' : 'unmuted');
    },
    pause: () => session.togglePause(),
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

  // God mode leaves the scored game for good. Not a flag tested in six places:
  // it is a PHASE with no HUD, no fail state and no pause, so a recording can
  // neither be interrupted by a panel nor ended by clipping a van in the last
  // second of a take.
  if (cfg.enabled) {
    session.free();
    loop.paused = false;
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

const audio = new Audio();
const session = new Session();
const hud = new Hud(document.body, session);
const panels = new Panels(document.body, session);

// After traffic, which is what publishes the hit and near miss totals the run
// is scored and ended from, and after audio so a crash is heard on the frame it
// happens rather than the one after.
loop.add((dt, state) => {
  session.update(dt, state);
  hud.update();
  panels.update();
  // Pausing hands every listener a delta of zero; see core/Loop.js. Set here
  // rather than by whatever toggled the phase, so there is one place that
  // decides what a phase MEANS and the toggles only have to name one.
  loop.paused = session.phase === PHASE.PAUSED;
  audio.setPaused(session.phase === PHASE.PAUSED);
});

// The title card is the audio entry point, not decoration. A browser will not
// start an AudioContext outside a user gesture, and one started without a
// gesture does not fail - it comes up suspended and silently plays nothing. So
// the graph is built inside the handler rather than resumed from somewhere
// later, and the card is dismissed before anyone starts recording, which is why
// it never appears in footage.
//
// `?god=1` arms the autopilot and capture mode before the card goes up, so one
// press drops straight into a clean recording run: overlay off, pixel ratio
// pinned, sound already live.
const wantsGod = new URLSearchParams(location.search).get('god') === '1';
const start = new StartScreen(document.body, () => {
  audio.start(traffic);
  if (wantsGod) setAutopilot(true);
  else session.begin(loop.state);
});

/**
 * What a press means, decided from the phase and nowhere else.
 *
 * The title card owns the first gesture - it has to, that is where the
 * AudioContext is unlocked - and everything after it comes through here. A
 * panel that listened for its own key would be a second place that knows the
 * rules, and the two would disagree the first time either changed.
 */
function onPress(event) {
  if (!start.started) return; // the card has its own listener until it is gone
  if (event.type === 'keydown') {
    const key = event.key;
    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return;
    // Escape is the pause key and is handled by Hotkeys; swallowing it here
    // would restart the run instead of resuming it.
    if (key === 'Escape') return;
  }
  if (session.phase === PHASE.OVER && session.overShown) session.begin(loop.state);
  else if (session.phase === PHASE.PAUSED) session.togglePause();
}
window.addEventListener('pointerdown', onPress);
window.addEventListener('keydown', onPress);

applyCapture();
loop.start();

// Development only: every elimination test in the notes assumes config can be
// poked from the browser console, but Vite modules are not globals. Publishing
// the live objects here is what makes those tests actually runnable. The guard
// keeps it out of a production build entirely.
if (import.meta.env && import.meta.env.DEV) {
  window.NEON = { config, device, engine, framing, hotkeys, loop, input, viewport, sky, road, roadside, mountains, traffic, bike, rider, autopilot, guard, post, audio, session, hud, panels };
}

/** Releases every resource in order (the loop stops first). */
function disposeAll() {
  loop.dispose();
  hotkeys.dispose();
  audio.dispose();
  start.dispose();
  hud.dispose();
  panels.dispose();
  window.removeEventListener('pointerdown', onPress);
  window.removeEventListener('keydown', onPress);
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
