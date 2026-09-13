import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * SkyDome - inverted giant sphere carrying the vertical sky gradient.
 * Rendered first, writes no depth, and is never touched by fog.
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

  varying vec3 vDirection;

  // <common> first: dithering_pars_fragment calls rand() which lives there
  #include <common>
  #include <dithering_pars_fragment>

  void main() {
    // Remap the vertical component from [-1, 1] to [0, 1]
    float h = clamp(vDirection.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 color = mix(uColorBase, uColorMid, smoothstep(0.0, uMidPoint, h));
    color = mix(color, uColorTop, smoothstep(uMidPoint, 1.0, h));

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

    this.geometry = new THREE.SphereGeometry(c.radius, c.widthSegments, c.heightSegments);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uColorBase: { value: new THREE.Color(c.colorBase) },
        uColorMid: { value: new THREE.Color(c.colorMid) },
        uColorTop: { value: new THREE.Color(c.colorTop) },
        uMidPoint: { value: c.midPoint },
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

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
