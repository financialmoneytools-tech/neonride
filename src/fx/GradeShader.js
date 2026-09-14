import * as THREE from 'three';
import { config } from '../config.js';

/**
 * GradeShader - the final pass: chromatic aberration, ACES tone mapping,
 * vignette, then the conversion to the display color space.
 *
 * These four jobs share one pass on purpose. Each of them is a couple of
 * instructions over a full screen quad, and a separate pass for each would cost
 * three more full frame reads and writes for no gain. It also removes a trap:
 * with tone mapping living here, the renderer stays on NoToneMapping, and a
 * material that includes three's tone mapping chunk - every MeshBasicMaterial
 * in the project does - cannot quietly map a second time.
 *
 * Order matters. Aberration samples the raw HDR buffer, so the fringes it makes
 * are tone mapped along with everything else instead of being laid on top of an
 * already graded image. Tone mapping then rolls the highlights off, saturation
 * puts back what that roll off took out, and only after all of it does the
 * vignette darken the edges - a vignette applied earlier would just be undone.
 */
export const GradeShader = {
  name: 'GradeShader',

  uniforms: {
    tDiffuse: { value: null },
    // Declared by <tonemapping_pars_fragment>, supplied by us because the
    // renderer is not doing the mapping.
    toneMappingExposure: { value: 1 },
    uSaturation: { value: 1.12 },
    uStreakStrength: { value: 0 },
    uStreakLength: { value: 0.12 },
    uStreakStart: { value: 0.34 },
    uAberration: { value: 0.0015 },
    uAberrationPower: { value: 2.6 },
    uVignetteStrength: { value: 0.34 },
    uVignetteStart: { value: 0.45 },
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uSaturation;
    uniform float uStreakStrength;
    uniform float uStreakLength;
    uniform float uStreakStart;
    uniform float uAberration;
    uniform float uAberrationPower;
    uniform float uVignetteStrength;
    uniform float uVignetteStart;

    varying vec2 vUv;

    #include <common>
    #include <tonemapping_pars_fragment>
    #include <dithering_pars_fragment>

    // 1.0 / distance from the centre of the frame to a corner, so the radius
    // below runs 0 at the centre to exactly 1 in the corners. That is what lets
    // the aberration and vignette settings be read as "at the corner".
    const float INV_CORNER = 1.41421356;

    // Rec.709 luma weights. three has no luminance() in <common>.
    const vec3 LUMA_REC709 = vec3(0.2126, 0.7152, 0.0722);

    void main() {
      vec2 offset = vUv - 0.5;
      float radius = length(offset) * INV_CORNER;

      // Radial split of red against blue. The power keeps the middle of the
      // frame clean; green is never moved, so nothing shifts in place.
      float shift = uAberration * pow(radius, uAberrationPower);
      vec3 color;
      color.r = texture2D(tDiffuse, vUv + offset * shift).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - offset * shift).b;

      // Radial speed streaks: smear the frame outward from the centre and keep
      // whichever is brighter. Because it is the frame being smeared, the road's
      // own neon is what streaks, so the colour is always right for free. Kept
      // inside the same uniform branch for the whole low speed range, where it
      // costs nothing.
      if (uStreakStrength > 0.001) {
        float reach = smoothstep(uStreakStart, 1.0, radius) * uStreakStrength;
        if (reach > 0.001) {
          vec3 smear = vec3(0.0);
          for (int i = 0; i < STREAK_TAPS; i++) {
            float t = float(i + 1) / float(STREAK_TAPS);
            smear += texture2D(tDiffuse, vUv - offset * (t * uStreakLength)).rgb;
          }
          smear /= float(STREAK_TAPS);
          color = mix(color, max(color, smear), reach);
        }
      }

      // The buffer is linear and unclamped, so anything the bloom piled above
      // 1.0 is still here for ACES to roll off rather than clip.
      color = ACESFilmicToneMapping(color);

      // ACES trades saturation for its highlight roll off, which costs this
      // scene the things it is actually made of: the purple pool in the sky and
      // the difference between a cyan strip and a green one. Pushing saturation
      // back up afterwards is the standard answer and the only way to keep both.
      float grey = dot(color, LUMA_REC709);
      color = mix(vec3(grey), color, uSaturation);

      color *= 1.0 - smoothstep(uVignetteStart, 1.0, radius) * uVignetteStrength;

      gl_FragColor = vec4(color, 1.0);

      #include <colorspace_fragment>
      // A tone mapped dark sky is exactly where 8 bit banding shows, and this
      // is the last chance to break it up.
      #include <dithering_fragment>
    }
  `,
};

/**
 * Builds the material for the grade pass. ShaderPass would build one itself,
 * but it would not turn dithering on, and the chunk is a no-op without it.
 * @returns {THREE.ShaderMaterial}
 */
export function createGradeMaterial() {
  const material = new THREE.ShaderMaterial({
    name: GradeShader.name,
    defines: { STREAK_TAPS: config.postprocess.streaks.taps },
    uniforms: THREE.UniformsUtils.clone(GradeShader.uniforms),
    vertexShader: GradeShader.vertexShader,
    fragmentShader: GradeShader.fragmentShader,
    dithering: true,
  });
  return material;
}
