import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * RiderMaterial - fake lighting for the cockpit.
 *
 * The scene has no lights, and it is not going to get any: the world is emissive
 * by design. But a handlebar drawn with a flat unlit color is a black blob with
 * no form at all. So the rider carries its own two term shading model - a key
 * from above and to the left, plus a cool ambient - and a rim term that stands
 * in for the neon world wrapping around the edges of the parts.
 *
 * The key direction is in VIEW space rather than world space. That matters: the
 * cockpit is bolted to the camera, so world space shading would swim across the
 * hands every time the bike leans, while view space shading stays put.
 *
 * No tone mapping, matching SkyDome and the road surface, so the whole scene
 * agrees about what its colors mean.
 */

const VERTEX_SHADER = `
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  #include <common>

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalMatrix * normal;
    vViewDir = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform vec3 uAmbient;
  uniform vec3 uKeyColor;
  uniform vec3 uKeyDirection;
  uniform float uKeyStrength;
  uniform vec3 uRimColor;
  uniform float uRimStrength;
  uniform float uRimPower;

  varying vec3 vNormalView;
  varying vec3 vViewDir;

  #include <common>
  #include <dithering_pars_fragment>

  void main() {
    // A mirrored part is drawn through a matrix with a negative determinant,
    // which turns its triangles inside out: we end up looking at back faces
    // whose normals point away from us, and every shading term inverts. Three
    // does this flip inside its own materials; ours has to do it too, or the
    // left hand lights as the negative of the right one.
    vec3 normal = normalize(vNormalView);
    if (!gl_FrontFacing) normal = -normal;
    vec3 view = normalize(vViewDir);

    // Wrapped diffuse: the half lambert keeps the shadow side readable instead
    // of crushing it to the ambient, which matters on parts this small.
    float key = dot(normal, uKeyDirection) * 0.5 + 0.5;
    key *= key;

    vec3 color = uColor * (uAmbient + uKeyColor * key * uKeyStrength);

    float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), uRimPower);
    color += uRimColor * rim * uRimStrength;

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <dithering_fragment>
  }
`;

/**
 * @param {object} preset one of config.player.rider.materials
 * @param {string} name
 * @returns {THREE.ShaderMaterial}
 */
export function createRiderMaterial(preset, name) {
  const key = config.player.rider.materials.keyDirection;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(preset.color) },
      uAmbient: { value: new THREE.Color(preset.ambient) },
      uKeyColor: { value: new THREE.Color(preset.key) },
      uKeyDirection: { value: new THREE.Vector3(key.x, key.y, key.z).normalize() },
      uKeyStrength: { value: preset.keyStrength },
      uRimColor: { value: new THREE.Color(preset.rim) },
      uRimStrength: { value: preset.rimStrength },
      uRimPower: { value: preset.rimPower },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    // The cockpit is half a unit from the camera; fog at that range is nothing
    // but a needless uniform, and it would tint parts the rider is holding.
    fog: false,
    dithering: true,
  });
  material.name = name;
  return material;
}

/**
 * Flat emissive material for the neon trim. Tone mapping is off so the color
 * stays as saturated as the road edge lines it is meant to echo.
 * @param {number} color
 * @param {string} name
 * @returns {THREE.MeshBasicMaterial}
 */
export function createNeonMaterial(color, name) {
  const material = new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false });
  material.name = name;
  return material;
}
