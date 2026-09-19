import * as THREE from 'three';
import { config } from './config.js';
import { ErrorPanel } from './ui/ErrorPanel.js';
import { Device } from './core/Device.js';
import { Comfort } from './core/Comfort.js';
import { PatchSelector } from './utils/patch.js';
import { Engine } from './core/Engine.js';
import { Framing } from './core/Framing.js';
import { Hotkeys, KeySequence } from './core/Hotkeys.js';
import { Loop } from './core/Loop.js';
import { Input } from './core/Input.js';
import { Fullscreen, Viewport } from './core/Viewport.js';
import { ControlHints } from './ui/ControlHints.js';
import { PauseButton } from './ui/PauseButton.js';
import { StatsOverlay } from './ui/StatsOverlay.js';
import { applyPatch } from './utils/patch.js';
import { LevelBanner } from './ui/LevelBanner.js';
import { StartScreen } from './ui/StartScreen.js';
import { Hud } from './ui/Hud.js';
import { Panels } from './ui/Panels.js';
import { PHASE, Session, MODE } from './game/Session.js';
import { CROSSED, medalFor } from './game/Stage.js';
import { Progress } from './game/Progress.js';
import { Celebration } from './game/Celebration.js';
import { referenceFor } from './game/Levels.js';
import { Results } from './ui/Results.js';
import { Audio } from './audio/Audio.js';
import { Sky } from './world/Sky.js';
import { Road } from './world/Road.js';
import { Roadside } from './world/Roadside.js';
import { Mountains } from './world/Mountains.js';
import { Ground } from './world/Ground.js';
import { Median } from './world/Median.js';
import { Scenery } from './world/Scenery.js';
import { Weather } from './world/Weather.js';
import { Oncoming } from './world/Oncoming.js';
import { Traffic } from './world/Traffic.js';
import { BikePhysics } from './player/BikePhysics.js';
import { Autopilot } from './player/Autopilot.js';
import { Guard } from './player/autopilot/Guard.js';
import { Controls } from './core/Controls.js';
import { Orientation } from './core/Orientation.js';
import { Rider } from './player/Rider.js';
import { Cockpit } from './player/Cockpit.js';
import { Postprocess } from './fx/Postprocess.js';
import { Selection } from './game/Selection.js';
import { SelectFlow } from './ui/SelectFlow.js';
import { ThemeBlend } from './world/ThemeBlend.js';
import { ThemeGate } from './world/ThemeGate.js';
import { Flash } from './fx/Flash.js';

/**
 * main.js - bootstrap only.
 * Builds the modules, wires them into the single animation loop and
 * handles HMR cleanup. No game logic belongs here.
 */

// FIRST. An exception thrown while the rest of this file is still building is
// a black screen on a phone and nothing else - no console, no keyboard to open
// one with, and every readout that would explain it never updates.
const errors = new ErrorPanel(document.body);

const container = document.getElementById('app');

// FIRST, before anything is constructed. Most of what a quality preset changes
// cannot be changed afterwards: the renderer reads antialias once, the star
// field allocates from the counts, the traffic pools size themselves on
// creation.
const device = new Device();

// The road theme, laid over config BEFORE anything is built, the same way a
// quality preset is and for the same reason: a strip count is a shader define
// and a pylon spacing sizes an instance buffer, so neither can be changed after
// the fact. `?theme=openRoad` picks one for a session without an edit.
//
// The library, the selector and the rebuild are one generic thing - see
// utils/patch.js - because bikes and maps are the same shape and writing it
// three times would be three chances to forget the undo.
// URL PARAMETERS, all read here. They exist for testing on a PHONE, where
// there is no keyboard and so none of the hotkeys below can be reached:
//
//   ?theme=openRoad   picks a theme for the session
//   ?stats=1          shows the stats overlay, ?stats=0 hides it
//   ?god=1            self-driving, capture mode, and no title card
//
// They only set the state at LOAD. Every key still does what it did - the
// parameter is a starting position, not a lock.
const params = new URLSearchParams(location.search);

// WHAT THE PLAYER CHOSE, read before anything is built. The bike's patch
// changes how the machine behaves and the road decides what is constructed, so
// both have to land before the world does. `?theme=` and `?bike=` override the
// stored choice, for a phone with no keyboard and for every tool that drives
// this build.
const selection = new Selection();
const forcedBike = params.get('bike');
if (forcedBike && config.bikes[forcedBike]) selection.bike = forcedBike;
selection.applyBike();

// `?theme=mixed` asks for the changing road, which is not a theme and cannot be
// handed to the selector - it is a request to keep changing. Handled here so
// every tool can reach it, since god mode skips the screen that would set it.
const askedTheme = params.get('theme');
if (askedTheme === config.MIXED) selection.road = config.MIXED;
else if (askedTheme && config.themes[askedTheme]) selection.road = askedTheme;

const themes = new PatchSelector(config, config.themes, config.theme);
themes.select(selection.startingRoad);

// Motion comfort. NOT a theme: it has to work mid-run, from a toggle somebody
// reaches for because they have started to feel unwell, so every value it
// scales is read live by its consumer. Starts from the operating system's own
// preference when this person has not chosen for themselves yet.
const comfort = new Comfort();

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
const median = new Median(engine.scene, road);
const scenery = new Scenery(engine.scene, road);
const weather = new Weather(engine.scene, engine.camera, engine.renderer);
const oncoming = new Oncoming(engine.scene, road);
const mountains = new Mountains(engine.scene, road);
// THE FLOOR, and it goes in before anything that stands on it. Until this
// there was none: the road was a ribbon in the sky and every boulder, lamp and
// ridge beside it was hanging in the same sky. See world/Ground.js.
const ground = new Ground(engine.scene, road);

// THE ROAD CAN CHANGE WITHOUT A RELOAD. ThemeBlend interpolates every
// continuous value straight into config and asks each module to copy it onto
// the GPU; ThemeGate is the lit arch that announces the change and the shape
// the staged run's checkpoints will be placed with. See world/ThemeBlend.js for
// what it refuses to touch and why.
const gate = new ThemeGate(engine.scene, road);
// THE STAGED RUN'S GATES. Two more instances of the same arch in two tints -
// see config/world.js. Separate objects rather than one re-tinted gate because
// a checkpoint can still be on screen when the finish is armed, and one gate
// cannot stand in two places.
const checkpointGate = new ThemeGate(engine.scene, road, config.world.gate.checkpointTint);
const finishGate = new ThemeGate(engine.scene, road, config.world.gate.finishTint);
const themeBlend = new ThemeBlend({
  sky,
  roadMaterial: road.surface,
  roadside,
  median,
  mountains,
  ground,
  weather,
  scenery,
  fog: engine.scene.fog,
  // The selector, so the blend can lift the fitted theme off once and keep a
  // copy of the plain base. Every road it ever resolves is resolved over that
  // rather than over whatever is on screen - see world/ThemeBlend.js.
}, themes);
const bike = new BikePhysics(engine.camera, road.path, framing);
// THE COCKPIT, either photographed or built. Both present the same three
// things - a group on the camera, update(dt, state) and dispose() - so nothing
// downstream knows which one it got, and config.player.cockpit.source picks.
// The primitive rig is not deleted: the photoreal style is being tried here.
const rider = config.player.cockpit.source === 'sprite'
  ? new Cockpit(engine.camera, framing)
  : new Rider(engine.camera, framing);
const traffic = new Traffic(engine.scene, road, bike);

// Drives for recording. It produces steer, throttle and brake and nothing else,
// so the bike, the lean, the bob and the camera cannot tell it from a player -
// which is both why it looks like a rider and why it cannot drift out of sync.
const autopilot = new Autopilot(road.path, traffic, bike);

// The cheat that makes failure impossible while recording. It runs between the
// bike moving and traffic judging it, which is the only window in the frame
// where the position the collision test will read can still be corrected.
const guard = new Guard(bike, traffic);
let stats = null; // built once Controls exists, so it can report on it

// The composer owns the frame from here on; engine.render() is only the
// fallback used when config.postprocess.enabled is turned off.
// THE ONE FLASH. Collision, near miss, checkpoint gate and theme gate are all
// callers of it; Postprocess only paints what it resolves. See config/flash.js
// for what owning this across three files cost.
const flash = new Flash();
const post = new Postprocess(engine.renderer, engine.scene, engine.camera, flash);
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
  input.onFirstTouch = () => {
    Fullscreen.request();
    // Asked alongside, not instead: the lock is only honoured from inside a
    // fullscreen document on the browsers that have it at all, so the request
    // has to follow the one that gets us there. It is expected to fail on iOS
    // and the gate below covers every case where it does.
    Orientation.request();
  };
}

// LANDSCAPE ONLY. The lock above is asked for and usually refused, so this is
// what actually enforces it: a prompt over everything while the frame is
// portrait shaped, and the run held behind it. It measures the VIEWPORT rather
// than screen.orientation, so a narrow desktop window gets the same treatment -
// what matters is the shape the game has to draw into, not how the device is
// being held.
const orientation = new Orientation(document.body, () => viewport);

// CONTROL MODE. Input reads coordinates and the keyboard; this owns which touch
// scheme those coordinates mean, the stored choice, and the tilt sensor.
// Touch devices only. A desktop has a keyboard, so the whole mode question is
// meaningless there - and left ungated the tilt timeout fires on every desktop
// load and announces a fallback from a mode nobody was using.
const controls = new Controls(device.coarsePointer);
input.controls = controls;
const hints = new ControlHints(document.body);
hints.setMode(controls.mode);
controls.onChange = (mode) => hints.setMode(mode);
controls.onNotice = (text) => hints.notice(text);

// Built here rather than with the other UI because it reports on Controls, and
// on a phone there is no console to read and no keyboard to open one with.
stats = config.stats.enabled ? new StatsOverlay(document.body, controls) : null;

const loop = new Loop(engine.renderer, {
  onRender: (dt) => post.render(dt),
});

// Input values are exposed to every module through the shared state
loop.state.input = input.values;

loop.add((dt, state) => {
  input.update(dt);
  // Which scheme is driving, for anything downstream that has to care. Only
  // BikePhysics does, for the throttle floor - and it reads the mode rather
  // than a boolean so a third scheme needs no new flag. Undefined on a desktop,
  // which is what keeps the keyboard on the bike's own floor.
  state.controlMode = controls.enabled ? controls.mode : undefined;
});
// FIRST, before anything reads it. The run publishes whether it is scoring and
// how much of the grace window is left; the flash gates on both, and it runs in
// the middle of the frame while the run is SCORED at the end of it. Publishing
// from session.update would hand every reader the previous frame's answer, and
// the one frame where that is wrong is the frame a run ends - which is exactly
// the frame the old collision flash got wrong, for the rest of the session.
loop.add((dt, state) => session.publish(state));

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
loop.add((dt, state) => ground.update(dt, state));
loop.add((dt, state) => traffic.update(dt, state));
// Scenery, so it runs after the traffic the player can actually hit. It reads
// state.distance and writes nothing.
loop.add((dt, state) => oncoming.update(dt, state));
// After the camera has been placed, because the weather box rides on it.
loop.add((dt, state) => weather.update(dt, state));
loop.add((dt, state) => rider.update(dt, state));
loop.add((dt) => sky.update(dt));
// AFTER traffic, which raises the hit and near miss totals it watches, and
// BEFORE post, which only paints whatever it resolved this frame.
// The gate watches for the crossing and the blend runs from it. Both before
// the flash, so a crossing lights the frame on the frame it happens.
loop.add((dt, state) => gate.update(dt, state));
loop.add((dt, state) => checkpointGate.update(dt, state));
loop.add((dt, state) => finishGate.update(dt, state));
loop.add((dt) => themeBlend.update(dt));
loop.add((dt, state) => flash.update(dt, state));
loop.add((dt, state) => post.update(dt, state));
// After everything that writes to state, because every voice in it is driven
// by what the frame ended up being rather than by what it started as.
loop.add((dt, state) => audio.update(dt, state));
if (stats) loop.add((dt, state) => stats.update(dt, state));
// The hints fade on their own, and vanish outright once a recording starts.
loop.add((dt) => {
  hints.update(dt);
  // NOT WHILE A CARD IS UP. The hints are pictures of the driving controls -
  // FREN, GAZ and the touch bands - and a selection screen is a card over a
  // world that is still running, so without this they sit across the bike and
  // road screens telling somebody how to brake while they are choosing a
  // motorcycle.
  const clean = controls.enabled && !config.autopilot.enabled
    && !config.capture.enabled && !menuOpen();
  hints.setVisible(clean);
  // Same rule: nothing of ours in a recording. Also hidden while the card is
  // already up, where it would sit on top of the panel it opened.
  pauseButton.setVisible(clean && session.phase === PHASE.RUNNING);
});

/** Applies capture mode: overlay off, pixel ratio pinned, chain resized. */
function applyCapture() {
  if (stats) stats.setVisible(!(config.capture.enabled && config.capture.hideOverlay));
  hints.setVisible(!config.autopilot.enabled && !config.capture.enabled);
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
    comfort: () => {
      console.info('[comfort] reduced motion:', comfort.toggle() ? 'on' : 'off');
    },
    theme: () => {
      // Reloads rather than rebuilding in place. Most of what a theme changes
      // is read once at construction - the strip count is a shader define - so
      // a live switch would mean tearing down the road, the roadside and the
      // sky and handing new references to everything holding the old ones.
      // A testing aid, and honest about what it costs.
      const next = themes.names[(themes.names.indexOf(themes.name) + 1) % themes.names.length];
      const url = new URL(location.href);
      url.searchParams.set('theme', next);
      location.href = url.toString();
    },
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

/**
 * Turns the novice bot on or off. A MEASURING INSTRUMENT, not a feature.
 *
 * It is the answer to a real problem: the shipped autopilot cannot crash -
 * autopilot/Guard.js makes sure of it - so the clock it produces is flat
 * across ten levels whose density nearly doubles. Difficulty here is paid in
 * crashes, and nothing that cannot crash can measure it. See `novice` in
 * config/autopilot.js for the four ways it is made mediocre.
 *
 * It patches config the way a bike does, and keeps the undo, so turning it
 * off puts the shipped autopilot back exactly rather than approximately.
 *
 * Deliberately NOT wired to a key or a URL parameter. tools/difficulty-check
 * calls it and nothing else does.
 *
 * @param {boolean} on
 * @returns {boolean} whether the novice is now driving
 */
function setNovice(on) {
  const novice = config.autopilot.novice;
  const want = !!on;
  if (want === novice.enabled) return novice.enabled;

  if (want) {
    noviceUndo = applyPatch(config.autopilot, novice.patch);
    novice.enabled = true;
  } else {
    if (noviceUndo) applyPatch(config.autopilot, noviceUndo);
    noviceUndo = null;
    novice.enabled = false;
  }
  return novice.enabled;
}
/** Restores the shipped autopilot's numbers; see setNovice. */
let noviceUndo = null;

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
// Attached here rather than passed to the constructor: the overlay is built
// early, with Controls, and `audio` is a const declared further down - reaching
// for it up there is a temporal dead zone error and a black screen on load.
if (stats) stats.audio = audio;
// Per-road level progress, read by the road cards and the level select and
// written as levels are entered and finished. Built before the Session
// because the Session records the first level on the frame a run begins.
const progress = new Progress();
const session = new Session(progress);
// Same reason and same shape as `stats.audio` above: the overlay's stage line
// needs the Session, and the Session cannot exist before the overlay does.
if (stats) stats.session = session;
const hud = new Hud(document.body, session);
// The ONLY thing that marks a level boundary. Not a panel: it takes no input,
// pauses nothing and is not a phase - see ui/LevelBanner.js for why that is
// the requirement rather than a simplification.
const levelBanner = new LevelBanner(document.body, session);
const panels = new Panels(document.body, session, comfort, controls, audio, selection, {
  // Both go through beginRun / selectFlow rather than poking the session, so
  // they take the same path as every other way into a run and cannot drift
  // from it - the level banner, the gate disarm and the tilt recentre are all
  // in there.
  onRestart: () => beginRun(lastLevel),
  onMenu: () => {
    session.abandon();
    // A podium or an armed gate from the abandoned run would still be
    // standing a kilometre down the next one's road.
    if (celebration) celebration.stop();
    checkpointGate.disarm();
    finishGate.disarm();
    flash.reset();
    selectFlow.start();
  },
});
// How a run ENDED, both ways. It replaced the game over half of Panels: there
// are two endings now and they have a result to show rather than a score to
// report. The road is passed as a function because a mixed run changes road
// under the rider, and the best time belongs to the road it finished on.
const results = new Results(document.body, session, () => themes.name);

/**
 * The celebration, BUILT ON THE FIRST FINISH and never before.
 *
 * Two reasons it is lazy rather than built with everything else. A player who
 * never reaches level ten never pays for a crowd, a podium and three particle
 * systems - and the podium bike bakes the CHOSEN bike's paint into its vertex
 * colours, so building it at boot would paint it before a bike was picked.
 *
 * The particle counts scale with the quality preset, because three additive
 * clouds over a full frame is FILL cost, which is the thing that actually
 * moves the frame time on a phone.
 */
let celebration = null;
function startCelebration() {
  if (!celebration) {
    const quality = device.preset === 'low' ? 0.5 : 1;
    celebration = new Celebration(engine.scene, engine.renderer, engine.camera,
      road.path, rider, quality);
  }
  if (Number.isFinite(askedCamera)) celebration.option = askedCamera;
  celebration.start(loop.state);
}

// AFTER the view has placed the camera from the bike, so the celebration
// moves the camera on top of what the ride did rather than fighting it for
// the same frame - the same relationship the recording guard has with the
// physics. Registered here, once, rather than inside the lazy build.
loop.add((dt, state) => {
  if (celebration) celebration.update(dt, state);
});

// The only way into the pause card without a keyboard, and so the only way to
// the control mode switch on a phone.
const pauseButton = new PauseButton(document.body, () => session.togglePause());

// After traffic, which is what publishes the hit and near miss totals the run
// is scored and ended from, and after audio so a crash is heard on the frame it
// happens rather than the one after.
loop.add((dt, state) => {
  // The crossing is RETURNED rather than watched for, so the flash fires on
  // exactly the frame the line was crossed and exactly once. Anything that
  // sampled `stage.checkpoints` would fire on the frame after, or twice if two
  // readers sampled it.
  const crossed = session.update(dt, state);
  if (crossed === CROSSED.CHECKPOINT) flash.fire('checkpoint', state);
  // A LEVEL LINE GETS THE FINISH FLASH, because it is one - the rider has
  // just finished five kilometres and the fact that another five follow does
  // not make the line they crossed a checkpoint.
  else if (crossed === CROSSED.LEVEL) flash.fire('finish', state);
  else if (crossed === CROSSED.FINISH) {
    flash.fire('finish', state);
    // THE REAL FINISH IS THE ONLY TRIGGER. `?finish=1` does not call this -
    // it arranges for the rider to reach the last line, and the line does.
    startCelebration();
  }
  hud.update();
  levelBanner.update(dt);
  panels.update();
  results.update();
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
const wantsGod = params.get('god') === '1';

/**
 * ================= THE TWO DEV HOOKS =================
 *
 * `?level=N` starts KOSU at any level, so level ten's traffic can be looked
 * at without riding nine levels to reach it. `?finish=1` goes further and
 * drops the rider a few hundred metres from the last line, so the
 * celebration can be seen - and recorded - without a five minute run.
 *
 * THEY PLAY THE REAL THING. `?finish=1` does not show a mock: it starts an
 * ordinary staged run at the last level with the line just ahead, so the
 * real gate arms, the real flash fires, Session._finish runs and the real
 * celebration plays. The only thing invented is the RESULT of the nine
 * levels that were not ridden, which is filled from config so the card has
 * a plausible total and tally.
 *
 * THEY CANNOT WRITE ANYTHING, and that is structural rather than remembered.
 * A dev run hands game/Levels.js a null Progress. Every write to progress is
 * already null-guarded - the tools need a Session without storage - so there
 * is no branch that could unlock a level or record a best time, and no way
 * to forget one.
 *
 * They are excluded from normal play by being URL parameters the selection
 * flow never sets, the same way `?god=1` is.
 */
const askedLevel = Number.parseInt(params.get('level'), 10);
const wantsFinish = params.get('finish') === '1';
/** `?cam=N` picks a celebration camera option; see config/celebration.js. */
const askedCamera = Number.parseInt(params.get('cam'), 10);
/** True for a run started by either hook. Suppresses every stored write. */
let devRun = false;
// Held while the phone is the wrong way round. A RUNNING session is paused, and
// resumed on the way back out only if this is what paused it - somebody who
// paused deliberately and then rotated should still be paused when they rotate
// back.
orientation.onChange = (portrait) => {
  if (portrait) {
    orientation.resumeOnReturn = session.phase === PHASE.RUNNING;
    if (orientation.resumeOnReturn) session.togglePause();
  } else if (orientation.resumeOnReturn && session.phase === PHASE.PAUSED) {
    orientation.resumeOnReturn = false;
    session.togglePause();
  }
};

/**
 * EVERY GESTURE TRIES THE AUDIO, until it is actually running.
 *
 * Not once, and not only from the title card. A context created inside a
 * gesture can still come up suspended - that is the normal case on a phone -
 * and Audio.start() sets its own _started flag before it resumes, so the one
 * attempt was the only attempt and the game stayed silent for the whole
 * session. Every entry path is covered by this: the title card, ?god=1
 * skipping the card, and anything added later that skips it too.
 *
 * CAPTURE PHASE, and synchronous. iOS only counts a resume() issued while the
 * touch handler is still on the stack, and a capture listener cannot be
 * swallowed by anything that stops propagation further down - which the pause
 * card's buttons deliberately do.
 */
const unlockAudio = () => {
  if (audio.unlock(traffic)) {
    window.removeEventListener('pointerdown', unlockAudio, true);
    window.removeEventListener('touchend', unlockAudio, true);
    window.removeEventListener('keydown', unlockAudio, true);
  }
};
window.addEventListener('pointerdown', unlockAudio, true);
// touchend as well as pointerdown: some iOS versions honour the gesture on the
// touch events and not on the pointer ones.
window.addEventListener('touchend', unlockAudio, true);
window.addEventListener('keydown', unlockAudio, true);

/**
 * THE MIXED ROAD: TÜM YOLLAR.
 *
 * Every few kilometres a gate is placed ahead; passing through it flashes and
 * blends the world into the next built road. The change is announced rather
 * than sprung, and it happens AS the rider goes through rather than when the
 * arch appears, so the road behind the gate is the old one and the road beyond
 * it is the new one.
 *
 * It runs in god mode too, and deliberately: a road changing under a light gate
 * is the single best thing this game has to record, and a gate that only
 * existed inside a scored run could never be filmed.
 */
let nextGateAt = 0;

function roadAfter(current) {
  const names = Object.keys(config.themes);
  const at = names.indexOf(current);
  return names[(at + 1) % names.length];
}

function armNextGate(fromDistance) {
  nextGateAt = fromDistance + config.world.gate.everyMeters;
}

gate.onCross = () => {
  const from = themes.name;
  const next = roadAfter(from);
  // ORDER MATTERS. The blend needs to be told where it is coming FROM before
  // the selector is moved on, and the selector has to be moved on so that a
  // pause, a stats readout or the next gate all agree with what is on screen.
  themeBlend.start(from, next, config.world.gate.blendSeconds);
  themes.select(next);
  flash.fire('themeGate', loop.state);
  armNextGate(loop.state.distance || 0);
};

loop.add((dt, state) => {
  if (!selection.mixed) return;
  const distance = state.distance || 0;
  if (!nextGateAt) armNextGate(distance);
  if (!gate.armed && distance >= nextGateAt - config.world.gate.ahead) {
    gate.arm(distance);
  }
});

/**
 * The staged run's gates: one at every kilometre and one on the line.
 *
 * ARMED AT AN ABSOLUTE DISTANCE, not "ahead of here" - a checkpoint stands at a
 * kilometre mark, and a gate armed relative to whatever frame noticed it would
 * put the fourth one somewhere near four kilometres rather than at it.
 * game/Stage.js owns where they are; this only puts the arch there.
 *
 * GOD MODE NEVER GETS HERE. Its phase is `free`, never `running`, so a
 * recording has no checkpoints, no finish line and no stage clock in it - the
 * autopilot rides the endless road it was built for, whatever mode is stored.
 */
loop.add((dt, state) => {
  if (session.phase !== PHASE.RUNNING || !session.staged) return;
  const stage = session.stage;
  const distance = state.distance || 0;
  const target = stage.nextGateDistance;
  const which = stage.nextGateIsFinish ? finishGate : checkpointGate;
  if (!which.armed && target - distance <= config.world.gate.ahead) {
    which.armAt(target);
  }
});

/**
 * Shows a road without committing to it, for the road screen. A preview of a
 * place has to BE the place: a swatch would be a promise, and the whole reason
 * this flow sits over a running world is that it does not have to make one.
 */
function previewRoad(name) {
  const target = name === config.MIXED ? selection.startingRoad : name;
  if (!config.themes[target] || target === themes.name) return;
  themeBlend.start(themes.name, target, config.world.gate.blendSeconds * 0.5);
  themes.select(target);
}

/** True while any card that owns the screen is up. */
function menuOpen() {
  return !start.started || selectFlow.open;
}

/**
 * Which level the next run starts on.
 *
 * Set by the level select and then kept, so that the press which retries a
 * failed run repeats the level that failed. A restart is not a new choice.
 */
let lastLevel = 1;

const selectFlow = new SelectFlow(document.body, selection, {
  onBikePreview: (key) => {
    // Colour only, and instant: four uniform writes on the cockpit sprite.
    if (rider.setBike) rider.setBike(key);
  },
  onRoadPreview: previewRoad,
  onDone: (level) => {
    selection.applyBike();
    nextGateAt = 0;
    beginRun(level);
  },
  recordFor: (road) => progress.for(road),
});

const start = new StartScreen(document.body, () => {
  audio.start(traffic);
  // iOS refuses DeviceOrientationEvent outside a user gesture, and this tap is
  // the only one the build is guaranteed. A refusal is handled inside: the mode
  // falls back to touch and says so once.
  if (controls.mode === 'tilt') controls.request();
  if (wantsGod) setAutopilot(true);
  else selectFlow.start();
}, comfort);

/**
 * Starts a run and says which controls it will use.
 *
 * Both restarts go through here rather than calling session.begin directly, so
 * the banner cannot be attached to one entry point and forgotten on the other -
 * which is exactly the shape of bug that leaves a feature working on the first
 * run of a session and nowhere else.
 */
function beginRun(level = lastLevel) {
  // THE MODE COMES FROM THE SELECTION, every time. Not remembered by Session
  // across a restart on its own, because a restart after a finish has to repeat
  // the run that was just played, and the only thing that knows which run that
  // was is what the player chose.
  //
  // THE LEVEL IS REMEMBERED THE SAME WAY, and for the same reason: a press
  // after failing level seven has to retry level seven, not send the rider
  // back to the level select. `lastLevel` is the default so that the restart
  // path repeats the run that was just had without knowing anything about it.
  lastLevel = level;
  // THE ROAD IS THE ROAD FROM THE FIRST FRAME.
  //
  // previewRoad() below starts a real blend for every card the rider swipes
  // past, and confirming a card used to call straight through to here with
  // the last one still running - so a run opened by arriving at its own road,
  // wearing the two roads before it. Settling lands on the chosen road's own
  // values outright. See ThemeBlend.settle() for what was measured.
  themes.select(selection.startingRoad);
  themeBlend.settle(selection.startingRoad);
  // THE WHOLE SAFETY PROPERTY OF THE DEV HOOKS, in one line. With no Progress
  // there is nothing for a level to be recorded in, so `?level=` and
  // `?finish=` cannot unlock anything or write a time however they are used.
  session.levels.progress = devRun ? null : progress;
  session.begin(loop.state, selection.mode, { road: selection.startingRoad, level });
  // A gate left armed from the previous level would stand somewhere in the
  // middle of this one - the distances are absolute and a new level starts
  // from wherever the bike happens to be.
  checkpointGate.disarm();
  finishGate.disarm();
  // A podium left standing from the last run would be a kilometre down this
  // one's road, lit, with a crowd around it.
  if (celebration) celebration.stop();
  // A crash in the last second of the previous run must not bleed red into the
  // first frame of this one.
  flash.reset();

  // THE NEUTRAL IS THE POSE YOU START IN, not the one you happened to be in
  // when the page loaded.
  //
  // core/Controls.js captures the tilt zero on the FIRST usable reading and
  // never again except from the pause panel's button. That reading happens
  // while the title card is up - before the rider has settled, and before
  // they have thumbed their way across the mode, bike, road and level
  // screens. Every degree the phone drifts between those two moments is a
  // degree of steering permanently biased one way.
  //
  // Reported as "I cannot steer LEFT at all" on three roads out of six, with
  // the two that worked being the first two cards on the road screen. That
  // correlation is real and has nothing to do with the roads: tools/steer-
  // check.mjs holds full lock on all six, by both entry paths, and every one
  // reaches -5.89 and +5.90 against outer lanes at -5.7 and 5.7. What
  // differs is how long the phone was in a hand being tilted toward the
  // thumb doing the swiping - and swiping right to reach a card biases the
  // captured neutral the same way every time, which is why the direction was
  // always left.
  if (controls.enabled && controls.mode === 'tilt') controls.recalibrate();

  if (controls.enabled) hints.banner(controls.mode);
}

/**
 * What a press means, decided from the phase and nowhere else.
 *
 * The title card owns the first gesture - it has to, that is where the
 * AudioContext is unlocked - and everything after it comes through here. A
 * panel that listened for its own key would be a second place that knows the
 * rules, and the two would disagree the first time either changed.
 */
function onPress(event) {
  // A selection screen owns the frame while it is up, and its buttons stop
  // their own events - but a tap on the BACKGROUND would otherwise reach here
  // and be read as "restart the run". The screens are a card over a running
  // world, so there is always background to hit.
  if (menuOpen()) return; // the cards have their own listeners until they are gone
  if (event.type === 'keydown') {
    const key = event.key;
    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return;
    // Escape is the pause key and is handled by Hotkeys; swallowing it here
    // would restart the run instead of resuming it.
    if (key === 'Escape') return;
  }
  // EITHER ENDING RESTARTS. `ended` covers the third crash and the finish line
  // both, so a stage that was completed is retried by the same press that
  // retries one that was failed - see game/Session.js.
  if (session.ended && session.overShown) beginRun();
  else if (session.phase === PHASE.PAUSED) session.togglePause();
}
window.addEventListener('pointerdown', onPress);
window.addEventListener('keydown', onPress);

applyCapture();

// ?god=1 also drops the title card, because the point of it is a phone with no
// keyboard: the run should be going before it is picked up.
//
// The card is the one user gesture the build has, and an AudioContext cannot be
// started without one - so dismissing it costs the sound, not the run. Rather
// than lose it, the gesture is simply accepted whenever it turns up: the first
// touch anywhere starts the audio, and everything else is already running.
if (wantsGod) {
  setAutopilot(true);
  start.skip();
  const wake = () => {
    audio.unlock(traffic);
    if (controls.mode === 'tilt') controls.request();
    window.removeEventListener('pointerdown', wake);
    window.removeEventListener('keydown', wake);
  };
  window.addEventListener('pointerdown', wake);
  window.addEventListener('keydown', wake);
}

/**
 * The dev hooks' way in. Same shape as god mode's: skip the title card, start
 * the run, and accept the audio gesture whenever it turns up.
 *
 * NEITHER OF THESE IS REACHABLE IN NORMAL PLAY. They are URL parameters the
 * selection flow never sets, and both run with `devRun` on so nothing they
 * do can be written down.
 */
if (!wantsGod && (wantsFinish || Number.isFinite(askedLevel))) {
  devRun = true;
  selection.setMode(MODE.STAGE);
  selection.applyBike();
  start.skip();

  const level = wantsFinish
    ? config.levels.count
    : Math.max(1, Math.min(config.levels.count, askedLevel));
  beginRun(level);

  if (wantsFinish) {
    // THE RESULT OF THE NINE LEVELS NOT RIDDEN, so the card has a real total
    // and a real tally rather than a single level's time pretending to be a
    // road. Invented, and the only invented thing here.
    const times = config.celebration.dev.sampleTimes;
    for (let i = 0; i < level - 1; i++) {
      const seconds = times[i % times.length];
      session.levels.times[i] = seconds;
      session.levels.medals[i] = medalFor(seconds, referenceFor(i + 1));
    }
    // PRESENTED AS A COMPLETE ROAD. A run that starts at level ten is a
    // practice run and the card correctly refuses it a total - which is
    // right for a player and wrong for this, whose whole job is to show the
    // finished card. The two concerns are separate and stay separate: this
    // changes what is SHOWN, and `progress = null` above is what makes sure
    // nothing is STORED. The card can say road complete; the save file
    // cannot.
    session.levels.startedAt = 1;
    // And the line a few hundred metres ahead. The gate arms, the crossing
    // happens, Session._finish runs: the real path, entered late.
    session.stage.beginNear(loop.state, config.celebration.dev.finishRunway);
  }

  const wake = () => {
    audio.unlock(traffic);
    window.removeEventListener('pointerdown', wake);
    window.removeEventListener('keydown', wake);
  };
  window.addEventListener('pointerdown', wake);
  window.addEventListener('keydown', wake);
}

// ?stats=1 / ?stats=0. LAST, because both of the things above set the overlay:
// applyCapture sets the baseline, and setAutopilot turns capture on and takes
// the overlay away with it. Applied before the god block, `?god=1&stats=1` came
// out hidden - which is the one combination the parameter exists for, since the
// overlay is already on by default and stats=1 alone changes nothing.
//
// H still toggles from wherever this leaves it.
const wantsStats = params.get('stats');
if (stats && wantsStats !== null) stats.setVisible(wantsStats !== '0');

loop.start();

// Development only: every elimination test in the notes assumes config can be
// poked from the browser console, but Vite modules are not globals. Publishing
// the live objects here is what makes those tests actually runnable. The guard
// keeps it out of a production build entirely.
if (import.meta.env && import.meta.env.DEV) {
  window.NEON = { config, device, engine, framing, hotkeys, loop, input, viewport, orientation, controls, sky, road, roadside, median, oncoming, scenery, weather, mountains, ground, traffic, bike, rider, autopilot, guard, post, flash, gate, checkpointGate, finishGate, themeBlend, results, selection, selectFlow, audio, session, progress, hud, levelBanner, panels, comfort, themes,
    // The one entry point into a run, exposed so tools/level-check.mjs can
    // start a REAL staged run at a chosen level and let the autopilot ride
    // it. Measuring a level any other way would measure something else.
    beginRun,
    // The mediocre bot, for tools/difficulty-check.mjs. Not a feature.
    setNovice,
    // The celebration, for tools/celebration-check.mjs. Null until a
    // finish has built it.
    get celebration() { return celebration; } };
}

/** Releases every resource in order (the loop stops first). */
function disposeAll() {
  loop.dispose();
  hotkeys.dispose();
  window.removeEventListener('pointerdown', unlockAudio, true);
  window.removeEventListener('touchend', unlockAudio, true);
  window.removeEventListener('keydown', unlockAudio, true);
  audio.dispose();
  comfort.dispose();
  start.dispose();
  hud.dispose();
  panels.dispose();
  results.dispose();
  window.removeEventListener('pointerdown', onPress);
  window.removeEventListener('keydown', onPress);
  reveal.dispose();
  orientation.dispose();
  viewport.dispose();
  post.dispose();
  flash.dispose();
  selectFlow.dispose();
  themeBlend.dispose();
  gate.dispose();
  if (celebration) celebration.dispose();
  levelBanner.dispose();
  checkpointGate.dispose();
  finishGate.dispose();
  rider.dispose();
  autopilot.dispose();
  bike.dispose();
  traffic.dispose();
  mountains.dispose();
  ground.dispose();
  weather.dispose();
  scenery.dispose();
  oncoming.dispose();
  median.dispose();
  roadside.dispose();
  road.dispose();
  sky.dispose();
  input.dispose();
  if (stats) stats.dispose();
  errors.dispose();
  hints.dispose();
  pauseButton.dispose();
  controls.dispose();
  engine.scene.fog = null;
  engine.dispose();
}

// Vite HMR safety: the old scene is fully torn down before the module reloads,
// otherwise scenes stack up and the frame rate collapses.
if (import.meta.hot) {
  import.meta.hot.dispose(disposeAll);
  import.meta.hot.accept();
}
