import { config } from './config.js';
import { Engine } from './core/Engine.js';
import { Loop } from './core/Loop.js';
import { Input } from './core/Input.js';
import { StatsOverlay } from './ui/StatsOverlay.js';
import { DebugScene } from './world/DebugScene.js';

/**
 * main.js — yalnizca bootstrap.
 * Modulleri kurar, tek animasyon dongusune baglar, HMR temizligini yapar.
 * Buraya oyun mantigi yazilmaz.
 */

const container = document.getElementById('app');

const engine = new Engine(container);
const input = new Input(container);
const debugScene = new DebugScene(engine.scene);
const stats = config.stats.enabled ? new StatsOverlay(document.body) : null;

const loop = new Loop(engine.renderer, {
  onRender: () => engine.render(),
});

// Girdi degerleri paylasilan state uzerinden tum modullere acilir
loop.state.input = input.values;

loop.add((dt) => input.update(dt));
loop.add((dt) => debugScene.update(dt));
if (stats) loop.add((dt, state) => stats.update(dt, state));

loop.start();

/** Tum kaynaklari sirasiyla birakir (once dongu durur). */
function disposeAll() {
  loop.dispose();
  debugScene.dispose();
  input.dispose();
  if (stats) stats.dispose();
  engine.dispose();
}

// Vite HMR guvenligi: modul yeniden yuklenmeden once eski sahne tamamen silinir,
// aksi halde sahneler ust uste birikir ve FPS coker.
if (import.meta.hot) {
  import.meta.hot.dispose(disposeAll);
  import.meta.hot.accept();
}
