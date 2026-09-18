import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * SkyDome - inverted giant sphere carrying the sky gradient.
 * Rendered first, writes no depth, and is never touched by fog.
 *
 * The vertical ramp stays close to black on purpose. The purple does not come
 * from the ramp but from a single localized glow pointed at one region of the
 * sky, which is what keeps the rest of the sky dark enough for the neon
 * elements to read against it.
 */

const VERTEX_SHADER = `
  varying vec3 vDirection;

  void main() {
    // The sphere is centered on the camera, so the local position already
    // points along the view direction for this fragment.
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColorBase;
  uniform vec3 uColorMid;
  uniform vec3 uColorTop;
  uniform float uMidPoint;

  uniform vec3 uGlowColor;
  uniform vec3 uGlowDirection;
  uniform float uGlowIntensity;
  uniform float uGlowFalloff;

  varying vec3 vDirection;

  // <common> first: dithering_pars_fragment calls rand() which lives there
  #include <common>
  #include <dithering_pars_fragment>

  void main() {
    vec3 direction = normalize(vDirection);

    // Remap the vertical component from [-1, 1] to [0, 1]
    float h = clamp(direction.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 color = mix(uColorBase, uColorMid, smoothstep(0.0, uMidPoint, h));
    color = mix(color, uColorTop, smoothstep(uMidPoint, 1.0, h));

    // Localized glow: a pool of color around one direction, not a global wash
    float facing = max(dot(direction, uGlowDirection), 0.0);
    color += uGlowColor * pow(facing, uGlowFalloff) * uGlowIntensity;

    gl_FragColor = vec4(color, 1.0);

    // No tone mapping here on purpose: the gradient stops are authored as
    // display colors, and ACES crushes dark saturated purple into flat blue.
    #include <colorspace_fragment>
    // Dithering matters here: a dark gradient across the whole screen is
    // exactly where 8 bit banding shows up.
    #include <dithering_fragment>
  }
`;

export class SkyDome {
  constructor() {
    const c = config.sky.dome;
    const glow = c.glow;

    this.geometry = new THREE.SphereGeometry(c.radius, c.widthSegments, c.heightSegments);

    const glowDirection = new THREE.Vector3(
      Math.cos(glow.elevation) * Math.cos(glow.azimuth),
      Math.sin(glow.elevation),
      Math.cos(glow.elevation) * Math.sin(glow.azimuth),
    ).normalize();

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uColorBase: { value: new THREE.Color(c.colorBase) },
        uColorMid: { value: new THREE.Color(c.colorMid) },
        uColorTop: { value: new THREE.Color(c.colorTop) },
        uMidPoint: { value: c.midPoint },
        uGlowColor: { value: new THREE.Color(glow.color) },
        uGlowDirection: { value: glowDirection },
        uGlowIntensity: { value: glow.intensity },
        uGlowFalloff: { value: glow.falloff },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.BackSide,
      depthWrite: false,
      dithering: true,
      fog: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'SkyDome';
    this.mesh.renderOrder = -30; // behind every other sky element
    this.mesh.frustumCulled = false;
  }

  /**
   * Pushes the current config into the uniforms. Called when a road changes.
   *
   * This class had no update() at all - every value was written once in the
   * constructor and never again - so a road transition needed somewhere to
   * write them. `radius` and the two segment counts stay out of it: they are
   * the sphere, no theme touches them, and a theme that did would be
   * allocating.
   */
  applyTheme() {
    const c = config.sky.dome;
    const glow = c.glow;
    const u = this.material.uniforms;
    u.uColorBase.value.set(c.colorBase);
    u.uColorMid.value.set(c.colorMid);
    u.uColorTop.value.set(c.colorTop);
    u.uMidPoint.value = c.midPoint;
    u.uGlowColor.value.set(glow.color);
    u.uGlowIntensity.value = glow.intensity;
    u.uGlowFalloff.value = glow.falloff;
    u.uGlowDirection.value.set(
      Math.cos(glow.elevation) * Math.cos(glow.azimuth),
      Math.sin(glow.elevation),
      Math.cos(glow.elevation) * Math.sin(glow.azimuth),
    ).normalize();
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
