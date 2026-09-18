import * as THREE from 'three';

/**
 * The realism probe's texture loader.
 *
 * Split out of scene.js when the playable probe arrived, because both the
 * static comparison scene and the playable one load the same CC0 sets and a
 * second copy of this would be a second place for the colour space rule below
 * to be got wrong.
 *
 * Every texture here is CC0, fetched by tools/probe-assets.py and credited in
 * public/probe/CREDITS.json.
 */

export const TEXTURE_ROOT = 'probe/';

/**
 * Loads one PBR set and returns a material.
 * @param {THREE.TextureLoader} loader
 * @param {string} name file stem under public/probe/
 * @param {object} [options] repeat, roughness, metalness, anisotropy
 * @returns {THREE.MeshStandardMaterial}
 */
export function pbr(loader, name, options = {}) {
  const repeat = options.repeat || new THREE.Vector2(1, 1);
  const maps = {};
  for (const [slot, suffix] of [
    ['map', 'diff'], ['normalMap', 'nor'], ['roughnessMap', 'rough'], ['aoMap', 'ao'],
  ]) {
    const texture = loader.load(`${TEXTURE_ROOT}${name}_${suffix}.jpg`);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.copy(repeat);
    texture.anisotropy = options.anisotropy || 8;
    // COLOUR MAPS ARE sRGB, DATA MAPS ARE NOT. Decoding a roughness map as if
    // it were a picture bends every value in it, and the surface comes out
    // uniformly too shiny in the mid tones - which is the single most common
    // way a PBR scene looks like plastic.
    if (slot === 'map') texture.colorSpace = THREE.SRGBColorSpace;
    maps[slot] = texture;
  }
  return new THREE.MeshStandardMaterial({
    ...maps,
    roughness: options.roughness === undefined ? 1 : options.roughness,
    metalness: options.metalness === undefined ? 0 : options.metalness,
    envMapIntensity: options.envMapIntensity === undefined ? 1 : options.envMapIntensity,
  });
}

