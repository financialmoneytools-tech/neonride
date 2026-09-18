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

/**
 * The most nebula masses any theme asks for, including the base sky.
 *
 * Read from the theme library rather than written down, so a new road raises
 * the allocation by existing. Same rule as world/Roadside.js: a theme may not
 * size a buffer, and the game is entitled to size one for all of them.
 */
function maxClouds() {
  let most = config.sky.nebula.clouds.length;
  for (const theme of Object.values(config.themes)) {
    const clouds = theme && theme.sky && theme.sky.nebula && theme.sky.nebula.clouds;
    if (Array.isArray(clouds) && clouds.length > most) most = clouds.length;
  }
  return most;
}

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
          falloffPower: settings.falloffPower,
          contrastLow: settings.contrastLow,
          contrastHigh: settings.contrastHigh,
        }),
      );
    }

    // ALLOCATED AT THE UNION over every theme, not at the fitted theme's count.
    //
    // A cloud is a Sprite and a SpriteMaterial, so the LENGTH of this array is
    // an allocation: the base sky has five masses and Aurora Pass has two, and
    // building only two would make it impossible to get five back without
    // allocating mid run. The surplus is faded to nothing instead, which is the
    // same answer scenery already gives for a prop kind at density zero.
    const union = maxClouds();
    this.clouds = [];
    for (let i = 0; i < union; i++) {
      // Built from whatever entry exists, falling back to the first so a sprite
      // always has a texture and a sane scale before it is faded out.
      const source = settings.clouds[i] || settings.clouds[0];
      const cloud = this._createCloud(source, rng);
      cloud.live = i < settings.clouds.length;
      if (!cloud.live) cloud.baseOpacity = 0;
      this.clouds.push(cloud);
    }
  }

  /**
   * Re-aims every cloud at the current config. Called when a road changes.
   *
   * Opacity is written to `baseOpacity` and NOT to the material: update() sets
   * `material.opacity` from baseOpacity every single frame, so anything written
   * straight to the material is overwritten before it is ever seen. That is the
   * kind of thing which reads as "the blend does not work" and is really two
   * writers on one value.
   */
  applyTheme() {
    const settings = config.sky.nebula;
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];
      const source = settings.clouds[i];
      cloud.live = !!source;
      if (!source) {
        // A mass this road does not have. Faded rather than removed, so the
        // road after it can have it back.
        cloud.baseOpacity = 0;
        continue;
      }
      cloud.material.color.set(source.color);
      cloud.material.rotation = source.rotation;
      cloud.baseOpacity = source.opacity;
      cloud.baseScale = source.scale;
      cloud.breathSpeed = source.breathSpeed;
      cloud.breathAmount = source.breathAmount;
      const horizontal = Math.cos(source.elevation) * source.distance;
      cloud.sprite.position.set(
        horizontal * Math.cos(source.azimuth),
        Math.sin(source.elevation) * source.distance,
        horizontal * Math.sin(source.azimuth),
      );
    }
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
      // A cloud faded to nothing still submits its draw call and its two
      // triangles wherever it is. Switched off outright, the way an unused
      // scenery kind is - parking is not free, and that was measured.
      cloud.sprite.visible = cloud.material.opacity > 0.002;

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
