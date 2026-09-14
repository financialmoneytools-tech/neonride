/**
 * Distance fade for three's built in materials.
 *
 * Fog alone cannot be trusted to hide an object that blinks into existence:
 * exponential fog never reaches zero, and a small very bright object - a neon
 * tube a fraction of a pixel wide at the horizon - still shows through a 90 per
 * cent fog as a twinkle. Fading the material itself to black gives a hard
 * guarantee instead of a brightness argument, and black behind heavy fog is
 * indistinguishable from the fog.
 *
 * Patches the material through onBeforeCompile so MeshBasicMaterial keeps every
 * feature it already has, instancing and per instance color included.
 */

const CACHE_KEY = 'distance-fade';

/**
 * @param {import('three').Material} material
 * @param {number} start distance at which the fade begins
 * @param {number} end distance at which nothing is left
 */
export function applyDistanceFade(material, start, end) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFadeStart = { value: start };
    shader.uniforms.uFadeEnd = { value: end };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vFadeDepth;')
      // project_vertex has already put mvPosition in scope by this point.
      .replace('#include <fog_vertex>', '#include <fog_vertex>\nvFadeDepth = -mvPosition.z;');

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uFadeStart;\nuniform float uFadeEnd;\nvarying float vFadeDepth;',
      )
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.rgb *= 1.0 - smoothstep(uFadeStart, uFadeEnd, vFadeDepth);',
      );
  };

  // The injected code is the same for every patched material, so one constant
  // key is enough to keep these programs apart from the unpatched ones.
  material.customProgramCacheKey = () => CACHE_KEY;
}
