import { config } from './config.js';
import { Engine } from './core/Engine.js';
import { Loop } from './core/Loop.js';
import { Input } from './core/Input.js';
import { StatsOverlay } from './ui/StatsOverlay.js';
import { DebugScene } from './world/DebugScene.js';

/**
 * main.js - bootstrap only.
 * Builds the modules, wires them into the single animation loop and
 * handles HMR cleanup. No game logic belongs here.
 */

const container = document.getElementById('app');

const engine = new Engine(container);
const input = new Input(container);
const debugScene = new DebugScene(engine.scene);
const stats = config.stats.enabled ? new StatsOverlay(document.body) : null;

const loop = new Loop(engine.renderer, {
  onRender: () => engine.render(),
});

// Input values are exposed to every module through the shared state
loop.state.input = input.values;

loop.add((dt) => input.update(dt));
loop.add((dt) => debugScene.update(dt));
if (stats) loop.add((dt, state) => stats.update(dt, state));

loop.start();

/** Releases every resource in order (the loop stops first). */
function disposeAll() {
  loop.dispose();
  debugScene.dispose();
  input.dispose();
  if (stats) stats.dispose();
  engine.dispose();
}

// Vite HMR safety: the old scene is fully torn down before the module reloads,
// otherwise scenes stack up and the frame rate collapses.
if (import.meta.hot) {
  import.meta.hot.dispose(disposeAll);
  import.meta.hot.accept();
}
