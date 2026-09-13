import * as THREE from 'three';
import { config } from '../../config.js';
import { createStarTexture } from '../../utils/textures.js';
import { StarBands } from './StarBands.js';

/**
 * Starfield - three layers of Points with their own size range and parallax
 * speed. Star sizes follow a power law, so the overwhelming majority are tiny
 * and a handful are large and bright, which is what gives the field depth.
 *
 * Per star brightness rides on the alpha rather than on the color, because
 * additive blending clamps at 1: scaling the color would wash the gold and
 * ice blue tints back out to white.
 *
 * The galactic structure itself lives in StarBands.js.
 */

const TAU = Math.PI * 2;

const VERTEX_SHADER = `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  attribute float aBrightness;

  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uTwinkleAmount;
  uniform float uTwinkleSpeed;

  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    vColor = aColor;

    float wave = 0.5 + 0.5 * sin(uTime * uTwinkleSpeed + aPhase);
    vIntensity = aBrightness * (1.0 - uTwinkleAmount + uTwinkleAmount * wave);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Size is authored in CSS pixels, so scale it by the device pixel ratio
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uMap;
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    vec4 texel = texture2D(uMap, gl_PointCoord);
    if (texel.a < 0.01) discard;

    gl_FragColor = vec4(vColor, texel.a * uOpacity * vIntensity);

    // The sky is authored in display space; see SkyDome for the reasoning.
    #include <colorspace_fragment>
  }
`;

export class Starfield {
  /**
   * @param {ReturnType<import('../../utils/rng.js').createRng>} rng
   * @param {(x:number, y:number) => number} noise2D
   */
  constructor(rng, noise2D) {
    this.rng = rng;
    this.time = 0;

    this.group = new THREE.Group();
    this.group.name = 'Starfield';

    this.bands = new StarBands(rng, noise2D);
    this.texture = createStarTexture(config.sky.stars.texture, config.sky.stars.textureSize);

    // THREE.Color already converts to the linear working space, which is what
    // a vertex color attribute expects.
    this.palette = config.sky.stars.palette.map((entry) => ({
      weight: entry.weight,
      color: new THREE.Color(entry.color),
    }));

    this.layers = config.sky.stars.layers.map((layerConfig) => this._createLayer(layerConfig));
  }

  /** Builds one Points layer inside its own tilt group. */
  _createLayer(layerConfig) {
    const stars = config.sky.stars;
    const count = layerConfig.count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const brightness = new Float32Array(count);

    const direction = new THREE.Vector3();
    const bandCount = Math.round(count * layerConfig.galacticFraction);
    const sizeSpan = layerConfig.sizeMax - layerConfig.sizeMin;

    for (let i = 0; i < count; i++) {
      const isBandStar = i < bandCount;
      if (isBandStar) this.bands.sample(direction);
      else this._sampleUniformDirection(direction);

      const i3 = i * 3;
      positions[i3] = direction.x * layerConfig.radius;
      positions[i3 + 1] = direction.y * layerConfig.radius;
      positions[i3 + 2] = direction.z * layerConfig.radius;

      const entry = this.rng.pickWeighted(this.palette);
      colors[i3] = entry.color.r;
      colors[i3 + 1] = entry.color.g;
      colors[i3 + 2] = entry.color.b;

      // Power law: most stars land near sizeMin, a few reach sizeMax
      const sizeT = Math.pow(this.rng.next(), layerConfig.sizeExponent);
      sizes[i] = layerConfig.sizeMin + sizeSpan * sizeT;

      // Bigger stars also burn brighter, and band stars get a boost
      let value = layerConfig.brightness * (0.55 + 0.45 * sizeT);
      if (isBandStar) value *= stars.bandBrightness;
      brightness[i] = value;

      phases[i] = this.rng.next() * TAU;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: this.texture },
        uOpacity: { value: layerConfig.opacity },
        uPixelRatio: { value: Starfield.currentPixelRatio() },
        uTime: { value: 0 },
        uTwinkleAmount: { value: stars.twinkleAmount },
        uTwinkleSpeed: { value: stars.twinkleSpeed },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });

    const points = new THREE.Points(geometry, material);
    points.name = 'stars-' + layerConfig.name;
    points.renderOrder = -20;
    points.frustumCulled = false; // the camera always sits inside the sphere

    // The tilt group holds the layer orientation, the Points object spins
    // around its own vertical axis so each layer drifts at its own speed.
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.set(layerConfig.tilt.x, 0, layerConfig.tilt.z);
    tiltGroup.add(points);
    this.group.add(tiltGroup);

    return { points, geometry, material, tiltGroup, rotationSpeed: layerConfig.rotationSpeed };
  }

  /**
   * Uniform direction on the unit sphere.
   * @param {THREE.Vector3} target
   */
  _sampleUniformDirection(target) {
    const y = this.rng.next() * 2 - 1;
    const phi = this.rng.next() * TAU;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    return target.set(r * Math.cos(phi), y, r * Math.sin(phi));
  }

  /** @param {number} dt */
  update(dt) {
    this.time += dt;
    const pixelRatio = Starfield.currentPixelRatio();

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.points.rotation.y += layer.rotationSpeed * dt;
      layer.material.uniforms.uTime.value = this.time;
      layer.material.uniforms.uPixelRatio.value = pixelRatio;
    }
  }

  dispose() {
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.geometry.dispose();
      layer.material.dispose();
      layer.tiltGroup.clear();
    }
    this.layers.length = 0;
    this.texture.dispose();
    this.group.clear();
  }

  /** Mirrors the ratio Engine feeds the renderer. */
  static currentPixelRatio() {
    return Math.min(window.devicePixelRatio, config.renderer.maxPixelRatio);
  }
}
