import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { createNoise2D } from '../utils/noise.js';
import { SkyDome } from './sky/SkyDome.js';
import { Starfield } from './sky/Starfield.js';
import { Nebula } from './sky/Nebula.js';
import { Aurora } from './sky/Aurora.js';

/**
 * Sky - owns the whole sky: gradient dome, star layers, nebulae and the
 * aurora curtain. Everything lives under one group that is kept centered on
 * the camera, so the rider can travel forever without ever reaching an edge.
 *
 * The pieces live in ./sky/ to keep each file on a single job.
 */
export class Sky {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.group = new THREE.Group();
    this.group.name = 'Sky';
    scene.add(this.group);

    // One seed drives every random choice in the sky
    const rng = createRng(config.sky.seed);
    const noise2D = createNoise2D(rng);

    this.dome = new SkyDome();
    this.group.add(this.dome.mesh);

    this.starfield = new Starfield(rng, noise2D);
    this.group.add(this.starfield.group);

    this.nebula = new Nebula(rng, noise2D);
    this.group.add(this.nebula.group);

    this.aurora = new Aurora();
    this.group.add(this.aurora.mesh);
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    // Keeping the sky centered on the camera is what removes every seam:
    // the camera can never leave the dome or approach the star sphere.
    this.group.position.copy(this.camera.position);

    this.starfield.update(dt);
    this.nebula.update(dt);
    this.aurora.update(dt);
  }

  dispose() {
    this.aurora.dispose();
    this.nebula.dispose();
    this.starfield.dispose();
    this.dome.dispose();

    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
    this.camera = null;
  }
}
