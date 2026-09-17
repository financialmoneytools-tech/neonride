/**
 * roadShader - the GLSL for the road surface, kept apart from the plumbing.
 *
 * The geometry carries two custom values per vertex:
 *   aAlong  - distance along the road in world units, wrapped (see RoadChunk)
 *   aAcross - lateral position in METRES from the path centre, negative to the
 *             left. Not normalised: the ribbon is asymmetric now, four lanes
 *             our way and a whole oncoming carriageway off to the left, and a
 *             normalised coordinate would make every marking position depend
 *             on the total width. See road/layout.js.
 *
 * Everything on the road comes out of those two numbers - asphalt, the median,
 * the oncoming carriageway, painted lane markings, the neon edge lines and the
 * flowing neon strips - so the whole road is one material and one program no
 * matter how many chunks exist.
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

export const VERTEX_SHADER = `
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

export const FRAGMENT_SHADER = `
  uniform vec3 uAsphaltColor;
  uniform vec3 uVoidColor;
  uniform vec3 uMedianColor;

  // The cross section, in metres. x = near edge, y = far edge.
  uniform vec2 uOurs;       // our carriageway plus its hard shoulder
  uniform vec2 uMedian;     // the strip the barrier stands in
  uniform vec2 uOncoming;   // the other carriageway plus its shoulder
  uniform float uVergeFade; // how far the asphalt takes to die into the void

  uniform vec3 uSheenColor;
  uniform float uSheenStrength;
  uniform float uSheenPower;
  uniform float uNeonFadeStart;
  uniform float uNeonFadeEnd;

  uniform vec3 uEdgeLeftColor;
  uniform vec3 uEdgeRightColor;
  uniform float uEdgeAt;     // metres; the line sits at -uEdgeAt and +uEdgeAt
  uniform float uEdgeWidth;
  uniform float uEdgeGlow;
  uniform float uEdgeIntensity;
  uniform float uEdgeHalo;

  // Painted lane markings. Road paint, not neon: no halo, no scroll. They are
  // world locked, so they stream past at exactly road speed.
  uniform vec3 uMarkColor;
  uniform float uMarkIntensity;
  uniform float uMarkPeriod;   // dash + gap, in metres
  uniform float uMarkDuty;     // dash / period
  uniform float uMarkDashWidth;
  uniform float uMarkSolidWidth;
  #if DASH_COUNT > 0
  uniform float uDashAt[DASH_COUNT];
  uniform float uDashScale[DASH_COUNT];
  #endif
  #if SOLID_COUNT > 0
  uniform float uSolidAt[SOLID_COUNT];
  uniform float uSolidScale[SOLID_COUNT];
  #endif

  // A theme may have NO flowing strips at all - see config/themes.js - and an
  // array declared [0] is not legal GLSL, so the whole block is conditional.
  #if STRIP_COUNT > 0
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
  #endif

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

  // 1 inside [span.x, span.y], falling off over uVergeFade on each side.
  float slab(float x, vec2 span) {
    return smoothstep(span.x - uVergeFade, span.x, x)
      * (1.0 - smoothstep(span.y, span.y + uVergeFade, x));
  }

  // A painted line: a hard edged strip of paint, no halo.
  float paint(float dist, float width) {
    return 1.0 - smoothstep(width * 0.5, width, dist);
  }

  void main() {
    float across = vAcross;

    // Everything the road emits dies out before the distance at which a chunk
    // is spawned, so a new chunk arrives already dark and cannot pop. The fog
    // is then free to be as thin as the look wants.
    float reach = 1.0 - smoothstep(uNeonFadeStart, uNeonFadeEnd, length(vViewDir));

    // The cross section. Outside every band the ribbon fades to the fog color,
    // so the road has no hard silhouette against the sky at any distance.
    float ours = slab(across, uOurs);
    float oncoming = slab(across, uOncoming);
    float median = slab(across, uMedian);
    float paved = max(ours, oncoming);

    vec3 color = mix(uVoidColor, uAsphaltColor, paved);
    color = mix(color, uMedianColor, median * (1.0 - paved));

    // Cheap stand in for a reflection: grazing angles pick up the sky tint.
    vec3 normal = normalize(vNormalView);
    vec3 view = normalize(vViewDir);
    float fresnel = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), uSheenPower);
    color += uSheenColor * fresnel * uSheenStrength * paved * reach;

    // PAINTED MARKINGS, world locked. fract of the along distance, so the dash
    // rhythm belongs to the road rather than to a clock: it cannot drift, and
    // it slows down when the rider does.
    float dashOn = step(fract(vAlong / uMarkPeriod), uMarkDuty);
    float mark = 0.0;
    #if DASH_COUNT > 0
    for (int i = 0; i < DASH_COUNT; i++) {
      mark += paint(abs(across - uDashAt[i]), uMarkDashWidth) * dashOn * uDashScale[i];
    }
    #endif
    #if SOLID_COUNT > 0
    for (int i = 0; i < SOLID_COUNT; i++) {
      mark += paint(abs(across - uSolidAt[i]), uMarkSolidWidth) * uSolidScale[i];
    }
    #endif
    color += uMarkColor * min(mark, 1.0) * uMarkIntensity * reach;

    // Flowing neon strips. Out of the traffic lanes now - the shoulder, both
    // sides of the median and the far verge - which is where peripheral motion
    // belongs; see config/world.js.
    #if STRIP_COUNT > 0
    for (int i = 0; i < STRIP_COUNT; i++) {
      vec2 profile = lineProfile(abs(across - uStripOffset[i]), uStripWidth[i], uStripGlow);

      float phase = fract(vAlong / uStripPeriod[i] - uStripPhase[i]);
      float duty = uStripDuty[i];
      float soft = uStripSoftness * duty;
      float dash = smoothstep(0.0, soft, phase) * (1.0 - smoothstep(duty - soft, duty, phase));

      color += uStripColor[i] * (profile.x + profile.y * uStripHalo) * dash * uStripIntensity[i] * reach;
    }
    #endif

    // Neon edge lines on OUR carriageway: steady, never dashed. Cyan to the
    // left, magenta to the right. across is positive to the RIGHT.
    vec2 leftLine = lineProfile(abs(across + uEdgeAt), uEdgeWidth, uEdgeGlow);
    vec2 rightLine = lineProfile(abs(across - uEdgeAt), uEdgeWidth, uEdgeGlow);
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
