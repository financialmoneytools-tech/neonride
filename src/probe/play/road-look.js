import * as THREE from 'three';
import { roadLayout } from '../../world/road/layout.js';
import { pbr } from '../materials.js';

/**
 * A real asphalt road, on the GAME'S OWN road geometry.
 *
 * This is the part that decides whether the realistic direction is possible at
 * all, because the shipped road is not a textured surface - it is a custom
 * shader that computes neon from the across coordinate. Swapping the look
 * therefore means swapping the material and NOTHING else: the same spline, the
 * same chunk pool, the same recycling, the same `road.path` the traffic and the
 * physics both read. If the road had to be rebuilt to be lit, the answer to
 * "what would be left of the code" would be "not the road", and it is.
 *
 * ================= THE GEOMETRY HAS NO UVs =================
 *
 * world/road/RoadChunk.js writes position, normal, aAlong and aAcross, and
 * that is all - a shader that computes its own colour from metres has no use
 * for a uv. A MeshStandardMaterial does. Rather than add an attribute to the
 * chunk - which would be changing the game to suit the probe - the uv is
 * DERIVED in the vertex shader from the two attributes that are already there.
 * `aAcross` is metres across the ribbon and `aAlong` is metres along it, which
 * is exactly what a tiling uv wants, so the derivation is a division.
 *
 * `aoMap` is deliberately not used here: three reads it from a second uv set
 * that this geometry does not have, and a silently mis-sampled occlusion map is
 * worse than none.
 */
export class RoadLook {
  /**
   * @param {THREE.TextureLoader} loader
   * @param {object} [options]
   */
  constructor(loader, options = {}) {
    const layout = roadLayout();
    this.layout = layout;

    const material = pbr(loader, 'asphalt', {
      repeat: new THREE.Vector2(1, 1), // the shader does the tiling, not this
      roughness: 1,
      anisotropy: 16,
    });
    // See the class note: no second uv set on this geometry.
    material.aoMap = null;
    material.defines = { ...(material.defines || {}), PROBE_ROAD: '' };

    this.uniforms = {
      uTileAcross: { value: options.tileAcross || 4.0 }, // metres per texture tile
      uTileAlong: { value: options.tileAlong || 6.0 },
      uTrackOffset: { value: layout.laneWidth * 0.26 },
      uLaneWidth: { value: layout.laneWidth },
      uFirstLane: { value: layout.laneCentres[0] },
      uWetness: { value: options.wetness === undefined ? 0.35 : options.wetness },
      // Painted markings, in metres, from the same layout everything else uses.
      uLeftEdge: { value: layout.left },
      uRightEdge: { value: layout.right },
      uDashHalf: { value: 0.06 }, // 0.12 m of paint
      uSolidHalf: { value: 0.07 },
      uDashPeriod: { value: 15.0 }, // 6 m of paint to 9 m of gap, like the game
      uDashDuty: { value: 6.0 / 15.0 },
      uPaint: { value: new THREE.Color(0xb6b3a8) },
      uDividers: { value: layout.laneEdges.slice(0, 4) },
      uDividerCount: { value: Math.min(layout.laneEdges.length, 4) },
    };

    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', [
          '#include <common>',
          'attribute float aAlong;',
          'attribute float aAcross;',
          'uniform float uTileAcross;',
          'uniform float uTileAlong;',
          'varying float vAcross;',
          'varying float vAlong;',
        ].join('\n'))
        .replace('#include <uv_vertex>', [
          '#include <uv_vertex>',
          'vAcross = aAcross;',
          'vAlong = aAlong;',
          // THE UV, DERIVED. Metres divided by the size of one tile.
          '#if defined( USE_MAP ) || defined( USE_NORMALMAP ) || defined( USE_ROUGHNESSMAP )',
          '  vMapUv = vec2(aAcross / uTileAcross, aAlong / uTileAlong);',
          '  vNormalMapUv = vMapUv;',
          '  vRoughnessMapUv = vMapUv;',
          '#endif',
        ].join('\n'));

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', [
          '#include <common>',
          'varying float vAcross;',
          'varying float vAlong;',
          'uniform float uTrackOffset;',
          'uniform float uLaneWidth;',
          'uniform float uFirstLane;',
          'uniform float uWetness;',
          'uniform float uLeftEdge;',
          'uniform float uRightEdge;',
          'uniform float uDashHalf;',
          'uniform float uSolidHalf;',
          'uniform float uDashPeriod;',
          'uniform float uDashDuty;',
          'uniform vec3 uPaint;',
          'uniform float uDividers[4];',
          'uniform int uDividerCount;',
          'float probeNoise(vec2 p) {',
          '  vec2 i = floor(p); vec2 f = fract(p);',
          '  f = f * f * (3.0 - 2.0 * f);',
          '  float a = fract(sin(dot(i, vec2(12.9898, 78.233))) * 43758.5453);',
          '  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453);',
          '  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);',
          '  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);',
          '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
          '}',
          // A painted line, with an edge one pixel wide rather than a hard cut.
          // `halfWidth`, never `half`: `half` is a RESERVED WORD in GLSL ES and the
          // whole program fails to link, which three reports as a console error
          // and the scene shows as an untextured road.
          'float probePaint(float dist, float halfWidth) {',
          '  float aa = fwidth(dist) * 0.9 + 0.0005;',
          '  return 1.0 - smoothstep(halfWidth - aa, halfWidth + aa, dist);',
          '}',
        ].join('\n'))
        .replace('#include <roughnessmap_fragment>', [
          '#include <roughnessmap_fragment>',
          '{',
          // TYRE POLISH. A used lane is smoother and darker in the wheel tracks
          // than between them, and no tile can carry that because the tracks
          // are a property of where the lanes are rather than of the texture.
          '  float lane = (vAcross - uFirstLane) / uLaneWidth;',
          '  float withinLane = (fract(lane) - 0.5) * uLaneWidth;',
          '  float track = min(abs(withinLane - uTrackOffset), abs(withinLane + uTrackOffset));',
          '  float polish = 1.0 - smoothstep(0.0, 0.42, track);',
          '  roughnessFactor *= mix(1.0, 0.62, polish);',
          '  diffuseColor.rgb *= mix(1.0, 0.85, polish);',
          // Standing water in patches, not a film. It is what puts a reflection
          // in one place and not beside it.
          '  float wet = probeNoise(vec2(vAcross, vAlong) * 0.09);',
          '  wet = smoothstep(0.52, 0.80, wet) * uWetness;',
          '  roughnessFactor = mix(roughnessFactor, 0.08, wet);',
          '  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.5, wet);',
          '}',
          '{',
          // PAINT, ON TOP OF THE WEAR. Road markings are not lights: they are a
          // rough, slightly off-white surface that is bright only because
          // something is shining on it. That is the whole difference between
          // this road and the neon one.
          '  float dash = step(fract(vAlong / uDashPeriod), uDashDuty);',
          '  float paint = 0.0;',
          '  for (int i = 0; i < 4; i++) {',
          '    if (i >= uDividerCount) break;',
          '    paint = max(paint, probePaint(abs(vAcross - uDividers[i]), uDashHalf) * dash);',
          '  }',
          '  paint = max(paint, probePaint(abs(vAcross - uLeftEdge), uSolidHalf));',
          '  paint = max(paint, probePaint(abs(vAcross - uRightEdge), uSolidHalf));',
          '  diffuseColor.rgb = mix(diffuseColor.rgb, uPaint, paint);',
          '  roughnessFactor = mix(roughnessFactor, 0.72, paint);',
          '}',
        ].join('\n'))
        .replace('#include <normal_fragment_maps>', [
          '#include <normal_fragment_maps>',
          '{',
          // Water flattens what it sits on; without this the wet patch keeps the
          // asphalt normal and reflects a broken, gritty highlight.
          '  float wet = probeNoise(vec2(vAcross, vAlong) * 0.09);',
          '  wet = smoothstep(0.52, 0.80, wet) * uWetness;',
          '  normal = normalize(mix(normal, nonPerturbedNormal, wet));',
          '}',
        ].join('\n'));
    };
    material.customProgramCacheKey = () => 'probe-play-road';

    this.material = material;
  }

  /**
   * Puts this material on every chunk the road already built.
   *
   * The chunks keep their geometry, their pool and their recycling; only what
   * they are drawn with changes. That is the whole claim this module makes.
   * @param {import('../../world/Road.js').Road} road
   */
  apply(road) {
    for (const chunk of road.chunks) {
      const mesh = chunk.mesh || chunk;
      if (mesh.isMesh) {
        mesh.material = this.material;
        mesh.receiveShadow = true;
      }
    }
  }

  dispose() {
    for (const key of ['map', 'normalMap', 'roughnessMap']) {
      if (this.material[key]) this.material[key].dispose();
    }
    this.material.dispose();
  }
}
