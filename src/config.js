/**
 * NEON RIDE - central configuration.
 * Rule: every numeric setting in the project lives here.
 * No module keeps its own magic numbers.
 *
 * This file is the only configuration import in the project. The sections live
 * in ./config/ purely so that no single file runs past the 300 line limit; as
 * far as every other module is concerned there is still one config object.
 */
import { renderer, camera, loop, stats, input } from './config/core.js';
import { quality, touch, viewport } from './config/device.js';
import { orientation } from './config/orientation.js';
import { controls } from './config/controls.js';
import { autopilot } from './config/autopilot.js';
import { sky } from './config/sky.js';
import { world } from './config/world.js';
import { capture } from './config/capture.js';
import { framing } from './config/framing.js';
import { player } from './config/player.js';
import { postprocess } from './config/postprocess.js';
import { flash } from './config/flash.js';
import { ui } from './config/ui.js';
import { game } from './config/game.js';
import { stage } from './config/stage.js';
import { levels } from './config/levels.js';
import { celebration } from './config/celebration.js';
import { comfort } from './config/comfort.js';
import { bikes, paint, bike, bikeStorageKey } from './config/bikes.js';
import { theme, themes, plannedThemes, themeStorageKey, MIXED } from './config/themes/index.js';
import { audio } from './config/audio.js';

export const config = {
  renderer,
  camera,
  loop,
  stats,
  input,
  quality,
  touch,
  viewport,
  orientation,
  controls,
  capture,
  autopilot,
  framing,
  sky,
  world,
  player,
  postprocess,
  flash,
  ui,
  game,
  stage,
  levels,
  celebration,
  comfort,
  bikes,
  bike,
  paint,
  bikeStorageKey,
  theme,
  themes,
  plannedThemes,
  themeStorageKey,
  MIXED,
  audio,
};

export default config;
