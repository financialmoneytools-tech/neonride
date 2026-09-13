import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * Aurora - a waving green to purple curtain sitting on the horizon line,
 * drawn on the inside of an open ended cylinder that surrounds the camera.
 * A warm orange layer sits underneath it, per the project visual direction.
 *
 * The noise is sampled on a circle rather than on the raw uv, which makes the
 * pattern inherently periodic and removes any seam at the uv wrap.
 *
 * Two noise scales do different jobs: a slow one bends the top edge of the
 * curtain, a fast one carves the vertical rays.
 */

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform vec3 uWarmColor;
  uniform float uIntensity;
  uniform float uWarmIntensity;
  uniform float uWarmHeight;
  uniform float uCurtainHeight;
  uniform float uCurtainVariation;
  uniform float uFadeBottom;
  uniform float uWaveScale;
  uniform float uWaveSpeed;
  uniform float uRayScale;
  uniform float uRayFloor;
  uniform float uRayContrast;
  uniform float uRayHeight;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    vec2 w = f * f * (3.0 - 2.0 * f);

    float a = hash21(cell);
    float b = hash21(cell + vec2(1.0, 0.0));
    float c = hash21(cell + vec2(0.0, 1.0));
    float d = hash21(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
  }

  void main() {
    float angle = vUv.x * 6.283185307179586;
    vec2 ring = vec2(cos(angle), sin(angle));

    // Slow channel: shapes how high the curtain reaches at this angle
    float slow = valueNoise(ring * uWaveScale + vec2(0.0, uTime * uWaveSpeed));

    // Fast channels: vertical rays. They depend on the angle only, so they
    // read as streaks running up the curtain rather than as blotches.
    float coarseRays = valueNoise(ring * uRayScale + vec2(7.0, uTime * uWaveSpeed * 2.1));
    float fineRays = valueNoise(ring * uRayScale * 2.7 + vec2(-3.0, uTime * uWaveSpeed * 3.4));

    float rays = coarseRays * 0.6 + fineRays * 0.4;
    rays = pow(uRayFloor + (1.0 - uRayFloor) * rays, uRayContrast);

    // Feeding the ray noise into the height as well makes every streak reach
    // a different altitude, so the top edge stays ragged instead of drawing a
    // straight horizontal line across the sky.
    float top = uCurtainHeight
      + uCurtainVariation * (slow - 0.5) * 2.0
      + uRayHeight * (rays - 0.5);
    top = max(top, 0.06);

    // One shared fade at the very bottom so the cylinder rim never shows up
    float bottomFade = smoothstep(0.0, uFadeBottom, vUv.y);

    float body = smoothstep(top, 0.0, vUv.y) * bottomFade;
    float curtainAlpha = body * rays * uIntensity;

    vec3 curtainColor = mix(uColorLow, uColorHigh, clamp(vUv.y / top, 0.0, 1.0));

    // Warm under layer hugging the horizon, independent of the ray structure
    float warmAlpha = smoothstep(uWarmHeight, 0.0, vUv.y) * bottomFade * uWarmIntensity;

    // Sum the two contributions, then un-premultiply: additive blending
    // multiplies by alpha again, which reproduces exactly this sum.
    vec3 premultiplied = curtainColor * curtainAlpha + uWarmColor * warmAlpha;
    float alpha = clamp(curtainAlpha + warmAlpha, 0.0, 1.0);

    gl_FragColor = vec4(premultiplied / max(alpha, 0.0001), alpha);

    // The sky is authored in display space; see SkyDome for the reasoning.
    #include <colorspace_fragment>
  }
`;

export class Aurora {
  constructor() {
    const c = config.sky.aurora;

    this.geometry = new THREE.CylinderGeometry(
      c.radius,
      c.radius,
      c.height,
      c.radialSegments,
      1,
      true, // open ended: no caps to show through
    );

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorLow: { value: new THREE.Color(c.colorLow) },
        uColorHigh: { value: new THREE.Color(c.colorHigh) },
        uWarmColor: { value: new THREE.Color(c.warmColor) },
        uIntensity: { value: c.intensity },
        uWarmIntensity: { value: c.warmIntensity },
        uWarmHeight: { value: c.warmHeight },
        uCurtainHeight: { value: c.curtainHeight },
        uCurtainVariation: { value: c.curtainVariation },
        uFadeBottom: { value: c.fadeBottom },
        uWaveScale: { value: c.waveScale },
        uWaveSpeed: { value: c.waveSpeed },
        uRayScale: { value: c.rayScale },
        uRayFloor: { value: c.rayFloor },
        uRayContrast: { value: c.rayContrast },
        uRayHeight: { value: c.rayHeight },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'Aurora';
    this.mesh.renderOrder = -5; // last sky element before the world
    this.mesh.frustumCulled = false;
    this.mesh.position.y = c.baseY + c.height * 0.5;

    this.time = 0;
  }

  /** @param {number} dt */
  update(dt) {
    this.time += dt;
    this.material.uniforms.uTime.value = this.time;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
