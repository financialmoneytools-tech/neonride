import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * Recolours the cockpit sprite per bike, from the mask tools/paint-mask.py
 * writes.
 *
 * Patched into the existing MeshBasicMaterial through onBeforeCompile rather
 * than replacing it with a ShaderMaterial, the way utils/distanceFade.js
 * already does: the sprite's transparency, its colour space handling and its
 * exemption from tone mapping are all behaviour of the built in material, and a
 * hand written shader would have to reproduce every one of them to change one
 * thing about the colour.
 *
 * ================== WHY IT IS NOT A HUE ROTATION ==================
 *
 * Measured on the shipped sprite before this was written: the fairing's mean is
 * RGB 34,36,51 and 69 per cent of it sits below luminance 40. Hue is not
 * visible down there. A rotation would give four bikes that are all black, with
 * a differently tinted edge, and the difference would vanish entirely at night -
 * which is the only time this game is set.
 *
 * So the operation is: keep luminance EXACTLY, replace chroma, and lift the
 * amount of chroma as luminance falls. Keeping luminance is what preserves the
 * shading, the line art and the bloom response - the ink stays ink because ink
 * is dark, not because it is masked out. Lifting chroma in the shadows is what
 * makes EMBER's orange visible on a near black fairing without brightening it
 * into a different material.
 *
 * THREE CHANNELS, THREE JOBS. R is the painted bodywork, G is the rim light on
 * it, B is the windscreen. They are separate because they want different
 * strengths: the bodywork is tinted, the rim is replaced outright because it is
 * the signature of the bike, and the glass is barely touched because it sits
 * over the road and a strong tint there is a coloured filter across the traffic
 * the rider has to read.
 */

const CACHE_KEY = 'cockpit-paint';

const PARS = [
  'uniform sampler2D uPaintMask;',
  'uniform vec3 uBodyColor;',
  'uniform vec3 uRimColor;',
  'uniform vec3 uGlassColor;',
  'uniform float uBodyStrength;',
  'uniform float uRimStrength;',
  'uniform float uGlassGain;',
  'uniform float uShadowChroma;',
  'const vec3 PAINT_LUMA = vec3(0.2126, 0.7152, 0.0722);',
  '',
  '// Swaps the chroma of `base` for that of `tint` while keeping its exact',
  '// luminance, then blends by `amount`. Working relative to each pixel\'s own',
  '// luminance is what keeps a highlight a highlight and a shadow a shadow: the',
  '// tint is scaled to sit at the luminance already there rather than imposing',
  '// its own.',
  'vec3 paintSwap(vec3 base, vec3 tint, float amount, float shadowLift) {',
  '  float baseLuma = dot(base, PAINT_LUMA);',
  '  float tintLuma = max(dot(tint, PAINT_LUMA), 0.0001);',
  '  vec3 matched = tint * (baseLuma / tintLuma);',
  '  // More chroma the darker the pixel is. Without this the whole operation is',
  '  // invisible below luminance 40, which is most of this drawing.',
  '  float lift = mix(shadowLift, 1.0, smoothstep(0.0, 0.45, baseLuma));',
  '  vec3 painted = mix(base, matched, clamp(amount * lift, 0.0, 1.0));',
  '  // Put the original luminance back, exactly. mix() above moves it slightly',
  '  // and a cockpit that brightens when it is repainted is a different object.',
  '  float paintedLuma = max(dot(painted, PAINT_LUMA), 0.0001);',
  '  return painted * (baseLuma / paintedLuma);',
  '}',
].join('\n');

const FRAGMENT = [
  '#include <map_fragment>',
  '{',
  '  vec3 paintMask = texture2D(uPaintMask, vMapUv).rgb;',
  '  // Bodywork, then the glass, then the rim on top - the rim is drawn ON the',
  '  // bodywork, so it has to have the last word or the tint washes it out.',
  '  diffuseColor.rgb = paintSwap(',
  '    diffuseColor.rgb, uBodyColor, uBodyStrength * paintMask.r, uShadowChroma);',
  '  diffuseColor.rgb = paintSwap(',
  '    diffuseColor.rgb, uGlassColor, uGlassGain * paintMask.b, 1.0);',
  '  diffuseColor.rgb = paintSwap(',
  '    diffuseColor.rgb, uRimColor, uRimStrength * paintMask.g, 1.0);',
  '}',
].join('\n');

/**
 * Patches a cockpit material so it can be repainted, and returns the handle
 * that repaints it.
 *
 * @param {THREE.Material} material the cockpit sprite's material
 * @param {THREE.Texture} mask the RGB mask texture
 * @returns {{setBike: (bike: object) => void, uniforms: object}}
 */
export function applyPaint(material, mask) {
  const cfg = config.paint;
  const uniforms = {
    uPaintMask: { value: mask },
    uBodyColor: { value: new THREE.Color(0xffffff) },
    uRimColor: { value: new THREE.Color(0xffffff) },
    uGlassColor: { value: new THREE.Color(0xffffff) },
    uBodyStrength: { value: cfg.enabled ? cfg.bodyStrength : 0 },
    uRimStrength: { value: cfg.enabled ? cfg.rimStrength : 0 },
    uGlassGain: { value: cfg.enabled ? cfg.glassGain : 0 },
    uShadowChroma: { value: cfg.shadowChroma },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + PARS)
      .replace('#include <map_fragment>', FRAGMENT);
  };
  material.customProgramCacheKey = () => CACHE_KEY;
  material.needsUpdate = true;

  return {
    uniforms,
    /**
     * Swaps the bike. Four uniform writes - no rebuild, no reload, no new
     * texture - which is what lets the selection screen preview a bike live.
     * @param {object} bike an entry of config.bikes
     */
    setBike(bike) {
      if (!bike || !bike.paint) return;
      uniforms.uBodyColor.value.set(bike.paint.body);
      uniforms.uRimColor.value.set(bike.paint.rim);
      uniforms.uGlassColor.value.set(bike.paint.glass);
    },
  };
}
