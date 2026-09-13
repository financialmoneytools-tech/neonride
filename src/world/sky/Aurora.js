import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * Aurora - a green to purple curtain standing on the horizon, drawn on the
 * inside of an open ended cylinder that surrounds the camera.
 *
 * It deliberately covers only one arc of the sky. Wrapping the full horizon
 * produced a uniform horizontal haze band in every viewing direction, which
 * read as a defect rather than as an aurora.
 *
 * Ray structure comes from a domain warp: sampling noise straight off the
 * angle lands the rays on an even grid and looks like a graphic equalizer.
 * Warping the angle first makes the spacing and the widths irregular, and a
 * low frequency cluster envelope switches whole stretches of the arc off.
 *
 * All noise is sampled on a circle, which makes it periodic and removes any
 * possible seam at the uv wrap.
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
  uniform float uRayContrast;
  uniform float uRayHeight;
  uniform float uWarpScale;
  uniform float uWarpAmount;
  uniform float uClusterScale;
  uniform float uClusterFloor;
  uniform float uClusterRange;
  uniform float uArcCenter;
  uniform float uArcHalfWidth;
  uniform float uArcSoftness;
  uniform float uArcDrift;
  uniform float uWarmArcScale;

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

  /** Soft sided mask for one arc of the ring. */
  float arcMask(float angle, float center, float halfWidth, float softness) {
    float delta = angle - center;
    delta = atan(sin(delta), cos(delta)); // wrap into [-PI, PI]
    float inner = halfWidth * (1.0 - softness);
    return 1.0 - smoothstep(inner, halfWidth, abs(delta));
  }

  void main() {
    // CylinderGeometry lays out x = r*sin(theta), z = r*cos(theta), so the
    // world azimuth is PI/2 - theta. Converting here lets arcCenter be a real
    // azimuth, the same convention the nebula and the dome glow use.
    float angle = 1.5707963267948966 - vUv.x * 6.283185307179586;
    float center = uArcCenter + uTime * uArcDrift;

    float curtainArc = arcMask(angle, center, uArcHalfWidth, uArcSoftness);
    float warmArc = arcMask(angle, center, uArcHalfWidth * uWarmArcScale, uArcSoftness);

    // Most of the cylinder is outside the arc; skip it entirely
    if (warmArc <= 0.0001) discard;

    // Domain warp before sampling the rays
    float warp = (valueNoise(
      vec2(cos(angle), sin(angle)) * uWarpScale + vec2(0.0, uTime * uWaveSpeed * 0.7)
    ) - 0.5) * uWarpAmount;

    vec2 ring = vec2(cos(angle + warp), sin(angle + warp));

    float slow = valueNoise(ring * uWaveScale + vec2(0.0, uTime * uWaveSpeed));

    float coarse = valueNoise(ring * uRayScale + vec2(7.0, uTime * uWaveSpeed * 2.1));
    float medium = valueNoise(ring * uRayScale * 2.3 + vec2(-3.0, uTime * uWaveSpeed * 3.1));
    float fine = valueNoise(ring * uRayScale * 5.1 + vec2(19.0, uTime * uWaveSpeed * 1.3));
    float rays = coarse * 0.5 + medium * 0.32 + fine * 0.18;

    // Contrast first, envelope second. Doing it the other way round stacks
    // two attenuations on top of each other and the curtain disappears.
    rays = pow(rays, uRayContrast);

    // Cluster envelope: entire stretches of the arc drop out, but the regions
    // that survive stay at full strength.
    float clusters = valueNoise(ring * uClusterScale + vec2(3.0, uTime * uWaveSpeed * 0.5));
    rays *= smoothstep(uClusterFloor, uClusterFloor + uClusterRange, clusters);

    // The ray noise drives the height as well, so every streak reaches a
    // different altitude and the top edge never draws a straight line
    float top = uCurtainHeight
      + uCurtainVariation * (slow - 0.5) * 2.0
      + uRayHeight * (rays - 0.5);
    top = max(top, 0.06);

    // One shared fade at the very bottom so the cylinder rim never shows up
    float bottomFade = smoothstep(0.0, uFadeBottom, vUv.y);

    float body = smoothstep(top, 0.0, vUv.y) * bottomFade;
    float curtainAlpha = body * rays * uIntensity * curtainArc;

    vec3 curtainColor = mix(uColorLow, uColorHigh, clamp(vUv.y / top, 0.0, 1.0));

    // Warm under layer, modulated by the clusters so it is never a flat ring
    float warmAlpha = smoothstep(uWarmHeight, 0.0, vUv.y)
      * bottomFade * uWarmIntensity * warmArc
      * (0.2 + 0.8 * clusters) * (0.5 + 0.5 * slow);

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
        uRayContrast: { value: c.rayContrast },
        uRayHeight: { value: c.rayHeight },
        uWarpScale: { value: c.warpScale },
        uWarpAmount: { value: c.warpAmount },
        uClusterScale: { value: c.clusterScale },
        uClusterFloor: { value: c.clusterFloor },
        uClusterRange: { value: c.clusterRange },
        uArcCenter: { value: c.arcCenter },
        uArcHalfWidth: { value: c.arcHalfWidth },
        uArcSoftness: { value: c.arcSoftness },
        uArcDrift: { value: c.arcDrift },
        uWarmArcScale: { value: c.warmArcScale },
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
