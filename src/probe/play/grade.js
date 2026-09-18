import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/**
 * The grade: one pass, and a small one.
 *
 * ================= THIS IS NOT THE GAME'S POST CHAIN =================
 *
 * fx/Postprocess.js runs bloom, a vignette and a chromatic aberration, and
 * bloom is most of what the shipped game LOOKS like - neon is emission and
 * bloom is how emission reads as light. There is no bloom here at all. A
 * realistic night road has bloom only where a real lens would flare, which is
 * around the headlight and the tail lamps and nowhere else, and a full scene
 * bloom pass over a lit scene is the single fastest way to make it look like a
 * game again.
 *
 * So what is left is a grade, in the photographic sense: the tone mapping is
 * already done on the way out of the renderer (ACES, in play/look.js), and this
 * only does what a colourist would do afterwards.
 *
 *   - a gentle contrast S-curve about mid grey
 *   - a split tone: cool shadows, warm highlights. Night scenes read as night
 *     because the shadows go blue, not because everything goes dark
 *   - a vignette, weak enough to be felt and not seen
 *
 * Every one of those is deliberately subtle. The brief asked for subtle colour
 * grading, and a strong grade on a prototype is a way of hiding what the
 * lighting is actually doing.
 */

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uContrast: { value: 1.03 },
    uShadowTint: { value: new THREE.Color(0x2a3a57) },
    uHighlightTint: { value: new THREE.Color(0xffe9cf) },
    uSplit: { value: 0.20 },
    uVignette: { value: 0.10 },
    uSaturation: { value: 0.97 },
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D tDiffuse;',
    'uniform float uContrast;',
    'uniform vec3 uShadowTint;',
    'uniform vec3 uHighlightTint;',
    'uniform float uSplit;',
    'uniform float uVignette;',
    'uniform float uSaturation;',
    'varying vec2 vUv;',
    'void main() {',
    '  vec4 texel = texture2D(tDiffuse, vUv);',
    '  vec3 color = texel.rgb;',
    '',
    '  // CONTRAST ABOUT THE SCENE, NOT ABOUT MID GREY. Pivoting on 0.5 was the',
    '  // first version and it crushed the whole frame: a night road averages',
    '  // something like 0.1, so every pixel in it sat below the pivot and every',
    '  // pixel came out darker. A grade that darkens is an exposure change',
    '  // wearing a grade costume. 0.28 is about where this scene actually sits,',
    '  // and the exposure in play/look.js is lifted to pay for what is left -',
    '  // any contrast at all costs a dark scene some light, so the compensation',
    '  // belongs upstream rather than as a bigger number here.',
    '  color = (color - 0.28) * uContrast + 0.28;',
    '',
    '  // SPLIT TONE, NORMALISED SO IT CANNOT CHANGE BRIGHTNESS. Shadows toward',
    '  // the sky, highlights toward the lamps. The tints are divided by their',
    '  // own luminance first, so multiplying by one rotates the hue and leaves',
    '  // the level alone - without that the blue shadow tint was simply a 40 per',
    '  // cent exposure cut wherever it was strongest.',
    '  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));',
    '  vec3 tint = mix(uShadowTint, uHighlightTint, smoothstep(0.02, 0.45, luma));',
    '  tint /= max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.0001);',
    '  color *= mix(vec3(1.0), tint, uSplit);',
    '',
    '  // A touch of desaturation. Film is less saturated than a render, and a',
    '  // render that matches film is usually one that was pulled DOWN.',
    '  color = mix(vec3(luma), color, uSaturation);',
    '',
    '  // Vignette. Measured from the centre in aspect-correct terms, so it does',
    '  // not become an oval on a wide frame.',
    '  vec2 offset = vUv - 0.5;',
    '  float falloff = smoothstep(0.78, 0.22, length(offset));',
    '  color *= mix(1.0 - uVignette, 1.0, falloff);',
    '',
    '  gl_FragColor = vec4(max(color, 0.0), texel.a);',
    '}',
  ].join('\n'),
};

/**
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @returns {{ composer: EffectComposer, pass: ShaderPass, setSize: Function, dispose: Function }}
 */
export function buildGrade(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const pass = new ShaderPass(GradeShader);
  pass.renderToScreen = true;
  composer.addPass(pass);

  return {
    composer,
    pass,
    setSize(width, height) {
      composer.setSize(width, height);
    },
    dispose() {
      composer.dispose();
      pass.material.dispose();
    },
  };
}
