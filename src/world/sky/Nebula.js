import * as THREE from 'three';
import { config } from '../../config.js';
import { createFbm2D } from '../../utils/noise.js';
import { createNebulaTexture } from '../../utils/textures.js';

/**
 * Nebula - a handful of large additive sprites carrying soft noise clouds.
 * Crimson magenta and turquoise masses at low opacity, drifting through a
 * slow breathing cycle so the sky never looks like a frozen backdrop.
 */

const TAU = Math.PI * 2;

export class Nebula {
  /**
   * @param {ReturnType<import('../../utils/rng.js').createRng>} rng
   * @param {(x:number, y:number) => number} noise2D
   */
  constructor(rng, noise2D) {
    const settings = config.sky.nebula;

    this.time = 0;
    this.group = new THREE.Group();
    this.group.name = 'Nebula';

    const fbm2D = createFbm2D(noise2D, settings.fbm);

    // A few shared cloud textures; the per sprite tint does the rest
    this.textures = [];
    for (let i = 0; i < settings.textureVariants; i++) {
      this.textures.push(
        createNebulaTexture({
          size: settings.textureSize,
          fbm2D,
          scale: settings.noiseScale,
          offsetX: 31.7 * i + 4.2,
          offsetY: -18.3 * i + 9.6,
        }),
      );
    }

    this.clouds = settings.clouds.map((cloudConfig) => this._createCloud(cloudConfig, rng));
  }

  _createCloud(cloudConfig, rng) {
    const texture = this.textures[cloudConfig.variant % this.textures.length];

    const material = new THREE.SpriteMaterial({
      map: texture,
      color: new THREE.Color(cloudConfig.color),
      opacity: cloudConfig.opacity,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      rotation: cloudConfig.rotation,
      toneMapped: false, // authored in display space, like the rest of the sky
      fog: false,
    });

    const sprite = new THREE.Sprite(material);
    sprite.name = 'nebula-cloud';
    sprite.renderOrder = -10;
    sprite.frustumCulled = false;

    // Place the cloud on the sky sphere from its azimuth / elevation
    const horizontal = Math.cos(cloudConfig.elevation) * cloudConfig.distance;
    sprite.position.set(
      horizontal * Math.cos(cloudConfig.azimuth),
      Math.sin(cloudConfig.elevation) * cloudConfig.distance,
      horizontal * Math.sin(cloudConfig.azimuth),
    );
    sprite.scale.set(cloudConfig.scale, cloudConfig.scale, 1);

    this.group.add(sprite);

    return {
      sprite,
      material,
      baseOpacity: cloudConfig.opacity,
      baseScale: cloudConfig.scale,
      breathSpeed: cloudConfig.breathSpeed,
      breathAmount: cloudConfig.breathAmount,
      phase: rng.next() * TAU,
    };
  }

  /** @param {number} dt */
  update(dt) {
    this.time += dt;

    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];
      const wave = Math.sin(this.time * cloud.breathSpeed * TAU + cloud.phase);

      cloud.material.opacity = Math.max(0, cloud.baseOpacity * (1 + cloud.breathAmount * wave));

      // A touch of scale breathing keeps the edges from looking pinned
      const scale = cloud.baseScale * (1 + 0.03 * wave);
      cloud.sprite.scale.set(scale, scale, 1);
    }
  }

  dispose() {
    for (let i = 0; i < this.clouds.length; i++) this.clouds[i].material.dispose();
    for (let i = 0; i < this.textures.length; i++) this.textures[i].dispose();
    this.clouds.length = 0;
    this.textures.length = 0;
    this.group.clear();
  }
}
