import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * RoadMaterial - the road surface shader.
 *
 * The geometry carries only two custom values per vertex:
 *   aAlong  - distance along the road in world units, wrapped (see RoadChunk)
 *   aAcross - lateral position, -1 at the right rim of the ribbon, +1 at the left
 *
 * Everything else - asphalt, the fake wet reflection, the flowing neon strips
 * and the two edge lines - is drawn from those two numbers, so the whole road
 * needs one material and one program no matter how many chunks exist.
 *
 * Scrolling is driven by a per lane phase computed on the CPU instead of by a
 * raw uTime. A uTime keeps growing and would eventually quantize the dash edges
 * once it leaves the comfortable range of float32; a phase stays inside [0, 1).
 *
 * No tone mapping here, on purpose and for the same reason as SkyDome: fog is
 * mixed in after the color space conversion, so a fully fogged fragment lands
 * on exactly the fog color, which is exactly what the sky dome paints at the
 * horizon. Tone mapping one side and not the other would split that seam open.
 */

const VERTEX_SHADER = `
  attribute float aAlong;
  attribute float aAcross;

  varying float vAlong;
  varying float vAcross;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  #include <common>
  #include <fog_pars_vertex>

  void main() {
    vAlong = aAlong;
    vAcross = aAcross;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalMatrix * normal;
    vViewDir = -mvPosition.xyz; // the camera sits at the origin in view space

    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uAsphaltColor;
  uniform vec3 uVoidColor;
  uniform float uAsphaltEdge;

  uniform vec3 uSheenColor;
  uniform float uSheenStrength;
  uniform float uSheenPower;
  uniform float uNeonFadeStart;
  uniform float uNeonFadeEnd;

  uniform vec3 uEdgeLeftColor;
  uniform vec3 uEdgeRightColor;
  uniform float uEdgeWidth;
  uniform float uEdgeGlow;
  uniform float uEdgeIntensity;
  uniform float uEdgeHalo;

  uniform float uStripOffset[STRIP_COUNT];
  uniform float uStripWidth[STRIP_COUNT];
  uniform float uStripPeriod[STRIP_COUNT];
  uniform float uStripDuty[STRIP_COUNT];
  uniform float uStripPhase[STRIP_COUNT];
  uniform float uStripIntensity[STRIP_COUNT];
  uniform vec3 uStripColor[STRIP_COUNT];
  uniform float uStripSoftness;
  uniform float uStripGlow;
  uniform float uStripHalo;

  varying float vAlong;
  varying float vAcross;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  #include <common>
  #include <fog_pars_fragment>
  #include <dithering_pars_fragment>

  // Lateral profile of a light line: a tight core plus a much wider soft halo.
  // The halo is what sells "slightly reflective": it reads as the line bleeding
  // into the asphalt the way a neon tube does on wet tarmac.
  vec2 lineProfile(float dist, float width, float glow) {
    float core = 1.0 - smoothstep(width * 0.35, width, dist);
    float halo = 1.0 - smoothstep(width, width * glow, dist);
    return vec2(core, halo);
  }

  void main() {
    float across = vAcross;

    // Everything the road emits dies out before the distance at which a chunk
    // is spawned, so a new chunk arrives already dark and cannot pop. The fog
    // is then free to be as thin as the look wants.
    float reach = 1.0 - smoothstep(uNeonFadeStart, uNeonFadeEnd, length(vViewDir));

    // Outside the asphalt the ribbon fades to the fog color, so the road has no
    // hard silhouette against the sky at any distance.
    float shoulder = smoothstep(uAsphaltEdge, 1.0, abs(across));
    vec3 color = mix(uAsphaltColor, uVoidColor, shoulder);

    // Cheap stand in for a reflection: grazing angles pick up the sky tint.
    vec3 normal = normalize(vNormalView);
    vec3 view = normalize(vViewDir);
    float fresnel = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), uSheenPower);
    color += uSheenColor * fresnel * uSheenStrength * (1.0 - shoulder) * reach;

    // Flowing neon strips
    for (int i = 0; i < STRIP_COUNT; i++) {
      vec2 profile = lineProfile(abs(across - uStripOffset[i]), uStripWidth[i], uStripGlow);

      float phase = fract(vAlong / uStripPeriod[i] - uStripPhase[i]);
      float duty = uStripDuty[i];
      float soft = uStripSoftness * duty;
      float dash = smoothstep(0.0, soft, phase) * (1.0 - smoothstep(duty - soft, duty, phase));

      color += uStripColor[i] * (profile.x + profile.y * uStripHalo) * dash * uStripIntensity[i] * reach;
    }

    // Edge lines: steady, never dashed. Cyan to the left, magenta to the right.
    vec2 leftLine = lineProfile(abs(across - uAsphaltEdge), uEdgeWidth, uEdgeGlow);
    vec2 rightLine = lineProfile(abs(across + uAsphaltEdge), uEdgeWidth, uEdgeGlow);
    color += uEdgeLeftColor * (leftLine.x + leftLine.y * uEdgeHalo) * uEdgeIntensity * reach;
    color += uEdgeRightColor * (rightLine.x + rightLine.y * uEdgeHalo) * uEdgeIntensity * reach;

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    // Fog last, and after the color space conversion: three uploads fogColor in
    // the output color space, which is the convention every built in material
    // follows. Moving it earlier would tint the whole horizon.
    #include <fog_fragment>
    #include <dithering_fragment>
  }
`;

export class RoadMaterial {
  constructor() {
    const road = config.world.road;
    const strips = road.strips;
    const lanes = strips.lanes;

    /** Per lane scroll offset in world units, kept inside [0, period). */
    this._offsets = new Float64Array(lanes.length);
    this._periods = new Float64Array(lanes.length);

    const offset = [];
    const width = [];
    const period = [];
    const duty = [];
    const phase = [];
    const intensity = [];
    const color = [];

    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      // Deriving the period from an integer repeat count is what keeps every
      // lane an exact divisor of patternLength. RoadChunk relies on that when
      // it wraps the along distance.
      const lanePeriod = strips.patternLength / lane.repeats;
      this._periods[i] = lanePeriod;

      offset.push(lane.offset);
      width.push(lane.width);
      period.push(lanePeriod);
      duty.push(lane.duty);
      phase.push(0);
      intensity.push(lane.intensity);
      color.push(new THREE.Color(lane.color));
    }

    this._phase = phase;

    // A ShaderMaterial that opts into fog has to carry the fog uniforms itself:
    // three refreshes fogColor and fogDensity straight on the material and
    // throws on the first frame if they are missing. Cloning the library block
    // keeps this material's fog state its own, and the spread leaves every
    // uniform below as a live reference, which update() relies on.
    const fogUniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.fog);

    this.material = new THREE.ShaderMaterial({
      defines: { STRIP_COUNT: lanes.length },
      uniforms: Object.assign(fogUniforms, {
        uAsphaltColor: { value: new THREE.Color(road.surface.asphaltColor) },
        uVoidColor: { value: new THREE.Color(road.surface.voidColor) },
        uAsphaltEdge: { value: 1 / road.shoulderScale },

        uSheenColor: { value: new THREE.Color(road.surface.sheenColor) },
        uSheenStrength: { value: road.surface.sheenStrength },
        uSheenPower: { value: road.surface.sheenPower },
        uNeonFadeStart: { value: road.surface.neonFadeStart },
        uNeonFadeEnd: { value: road.surface.neonFadeEnd },

        uEdgeLeftColor: { value: new THREE.Color(road.edges.leftColor) },
        uEdgeRightColor: { value: new THREE.Color(road.edges.rightColor) },
        uEdgeWidth: { value: road.edges.width },
        uEdgeGlow: { value: road.edges.glow },
        uEdgeIntensity: { value: road.edges.intensity },
        uEdgeHalo: { value: road.edges.halo },

        uStripOffset: { value: offset },
        uStripWidth: { value: width },
        uStripPeriod: { value: period },
        uStripDuty: { value: duty },
        uStripPhase: { value: phase },
        uStripIntensity: { value: intensity },
        uStripColor: { value: color },
        uStripSoftness: { value: strips.softness },
        uStripGlow: { value: strips.glow },
        uStripHalo: { value: strips.halo },
      }),
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      // ShaderMaterial opts out of fog by default; the road needs it.
      fog: true,
      dithering: true,
    });
    this.material.name = 'RoadSurface';
  }

  /** @param {number} dt */
  update(dt) {
    const lanes = config.world.road.strips.lanes;
    for (let i = 0; i < lanes.length; i++) {
      const period = this._periods[i];
      let offset = this._offsets[i] + lanes[i].speed * dt;
      // Wrapping in world units keeps the accumulator bounded forever, and the
      // pattern is periodic so the wrap itself is invisible.
      offset -= Math.floor(offset / period) * period;
      this._offsets[i] = offset;
      this._phase[i] = offset / period;
    }

    // three only re-uploads a material's uniforms when the material differs
    // from the previously drawn one, which happens to be true here but is a
    // property of the scene, not of this module. Saying so explicitly keeps the
    // strips flowing whatever else ends up in the render list.
    this.material.uniformsNeedUpdate = true;
  }

  dispose() {
    this.material.dispose();
  }
}
