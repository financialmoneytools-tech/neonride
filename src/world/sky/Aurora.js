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
  uniform float uWavePhase;
  uniform float uArcPhase;
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
  uniform float uWarmArcScale;
  uniform float uWarmFloor;

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
    float center = uArcCenter + uArcPhase;

    float curtainArc = arcMask(angle, center, uArcHalfWidth, uArcSoftness);
    float warmArc = arcMask(angle, center, uArcHalfWidth * uWarmArcScale, uArcSoftness);

    // Most of the cylinder is outside the arc; skip it entirely
    if (warmArc <= 0.0001) discard;

    // Domain warp before sampling the rays
    float warp = (valueNoise(
      vec2(cos(angle), sin(angle)) * uWarpScale + vec2(0.0, uWavePhase * 0.7)
    ) - 0.5) * uWarpAmount;

    vec2 ring = vec2(cos(angle + warp), sin(angle + warp));

    float slow = valueNoise(ring * uWaveScale + vec2(0.0, uWavePhase));

    float coarse = valueNoise(ring * uRayScale + vec2(7.0, uWavePhase * 2.1));
    float medium = valueNoise(ring * uRayScale * 2.3 + vec2(-3.0, uWavePhase * 3.1));
    float fine = valueNoise(ring * uRayScale * 5.1 + vec2(19.0, uWavePhase * 1.3));
    float rays = coarse * 0.5 + medium * 0.32 + fine * 0.18;

    // Contrast first, envelope second. Doing it the other way round stacks
    // two attenuations on top of each other and the curtain disappears.
    rays = pow(rays, uRayContrast);

    // Cluster envelope: entire stretches of the arc drop out, but the regions
    // that survive stay at full strength.
    float clusters = valueNoise(ring * uClusterScale + vec2(3.0, uWavePhase * 0.5));
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
    // The warm glow follows the rays rather than running flat along the
    // horizon. A continuous under layer is what read as a grey haze band.
    float warmAlpha = smoothstep(uWarmHeight, 0.0, vUv.y)
      * bottomFade * uWarmIntensity * warmArc
      * (uWarmFloor + (1.0 - uWarmFloor) * rays);

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
    // BUILT ONCE, at whatever the fitted theme asked for, and every later
    // change is a scale against these. Keeping the numbers is what makes
    // applyTheme's ratio meaningful rather than a guess.
    this._builtRadius = c.radius;
    this._builtHeight = c.height;

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
        uWavePhase: { value: 0 },
        uArcPhase: { value: 0 },
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
        uRayScale: { value: c.rayScale },
        uRayContrast: { value: c.rayContrast },
        uRayHeight: { value: c.rayHeight },
        uWarpScale: { value: c.warpScale },
        uWarpAmount: { value: c.warpAmount },
        uClusterScale: { value: c.clusterScale },
        uClusterFloor: { value: c.clusterFloor },
        uClusterRange: { value: c.clusterRange },
        uArcCenter: { value: c.arcCenter },
        // waveSpeed and arcDrift are NOT uniforms any more. They are rates, and
        // they are integrated on the CPU into uWavePhase and uArcPhase - see
        // update(). A rate handed to a shader that multiplies it by a clock
        // cannot be changed without jumping.
        uArcHalfWidth: { value: c.arcHalfWidth },
        uArcSoftness: { value: c.arcSoftness },
        uWarmArcScale: { value: c.warmArcScale },
        uWarmFloor: { value: c.warmFloor },
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
    // TWO ACCUMULATED PHASES, not a clock multiplied by a speed.
    //
    // The shader used to compute `uArcCenter + uTime * uArcDrift` and to feed
    // `uTime * uWaveSpeed` into every noise lookup. That is fine while the
    // speeds are constants and catastrophic the moment a theme blend moves
    // them: at t = 300 s, drifting arcDrift from 0.006 to 0.004 moves the
    // curtain's centre azimuth by 0.6 rad - THIRTY-FOUR DEGREES - in a single
    // frame, and re-phases every noise channel at once so the ribbons reshuffle
    // rather than drift. It is the kind of fault that survives a screenshot
    // review and ruins a video.
    //
    // Integrating instead means the phase is continuous by construction and a
    // speed change only changes the RATE from that moment on, which is what
    // anybody writing `arcDrift` thought they were asking for.
    this.wavePhase = 0;
    this.arcPhase = 0;
  }

  /** @param {number} dt */
  /**
   * Pushes the current config into the uniforms. Called when a road changes.
   *
   * Every uniform that came from config is written, rather than a chosen few:
   * the blend animates config and this is the one place that copies it onto the
   * GPU, so a value missed here is a value that silently does not transition.
   *
   * `radius` and `height` are geometry, so they are answered with a SCALE
   * rather than a rebuild - the cylinder is built once and stretched, which is
   * the difference between a value that can move mid run and one that cannot.
   */
  applyTheme() {
    const c = config.sky.aurora;
    const u = this.material.uniforms;
    u.uColorLow.value.set(c.colorLow);
    u.uColorHigh.value.set(c.colorHigh);
    u.uWarmColor.value.set(c.warmColor);
    u.uIntensity.value = c.intensity;
    u.uWarmIntensity.value = c.warmIntensity;
    u.uWarmHeight.value = c.warmHeight;
    u.uCurtainHeight.value = c.curtainHeight;
    u.uCurtainVariation.value = c.curtainVariation;
    u.uFadeBottom.value = c.fadeBottom;
    u.uWaveScale.value = c.waveScale;
    u.uRayScale.value = c.rayScale;
    u.uRayContrast.value = c.rayContrast;
    u.uRayHeight.value = c.rayHeight;
    u.uWarpScale.value = c.warpScale;
    u.uWarpAmount.value = c.warpAmount;
    u.uClusterScale.value = c.clusterScale;
    u.uClusterFloor.value = c.clusterFloor;
    u.uClusterRange.value = c.clusterRange;
    u.uArcCenter.value = c.arcCenter;
    u.uArcHalfWidth.value = c.arcHalfWidth;
    u.uArcSoftness.value = c.arcSoftness;
    u.uWarmArcScale.value = c.warmArcScale;
    u.uWarmFloor.value = c.warmFloor;

    // Geometry answered by transform. The cylinder was built at the BASE
    // config's radius and height, so both are ratios against that.
    this.mesh.scale.set(c.radius / this._builtRadius, c.height / this._builtHeight, c.radius / this._builtRadius);
    this.mesh.position.y = c.baseY + c.height * 0.5;
  }

  update(dt) {
    const c = config.sky.aurora;
    this.time += dt;
    this.wavePhase += dt * c.waveSpeed;
    this.arcPhase += dt * c.arcDrift;
    const uniforms = this.material.uniforms;
    uniforms.uTime.value = this.time;
    uniforms.uWavePhase.value = this.wavePhase;
    uniforms.uArcPhase.value = this.arcPhase;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
