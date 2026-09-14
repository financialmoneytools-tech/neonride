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
import { autopilot } from './config/autopilot.js';
import { sky } from './config/sky.js';
import { world } from './config/world.js';
import { capture } from './config/capture.js';
import { framing } from './config/framing.js';
import { player } from './config/player.js';
import { postprocess } from './config/postprocess.js';

export const config = {
  renderer,
  camera,
  loop,
  stats,
  input,
  quality,
  touch,
  viewport,
  capture,
  autopilot,
  framing,
  sky,
  world,
  player,
  postprocess,
};

export default config;
