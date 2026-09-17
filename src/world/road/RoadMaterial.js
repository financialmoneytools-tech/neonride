import * as THREE from 'three';
import { config } from '../../config.js';
import { motionScale } from '../../core/Comfort.js';
import { roadLayout, anchorAt } from './layout.js';
import { VERTEX_SHADER, FRAGMENT_SHADER } from './roadShader.js';

/**
 * RoadMaterial - the one material every road chunk shares.
 *
 * The GLSL lives in ./roadShader.js; this file is the plumbing that turns
 * config and the layout into uniforms, and advances the scrolling strips.
 *
 * The marking positions are derived from road/layout.js rather than listed, so
 * changing the lane count in config moves the paint, the lanes traffic uses and
 * the barrier together. A lane divider written out by hand is a lane divider
 * that will disagree with the traffic one run from now.
 */
export class RoadMaterial {
  constructor() {
    const road = config.world.road;
    const strips = road.strips;
    const lanes = strips.lanes;
    const marks = road.markings;
    const layout = roadLayout();

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
      const lanePeriod = strips.patternLength / lane.repeats;
      this._offsets[i] = 0;
      this._periods[i] = lanePeriod;

      offset.push(anchorAt(layout, lane.anchor) + lane.inset);
      width.push(lane.width);
      period.push(lanePeriod);
      duty.push(lane.duty);
      phase.push(0);
      intensity.push(lane.intensity);
      color.push(new THREE.Color(lane.color));
    }

    // Dashed lines divide lanes; solid lines bound a carriageway. The oncoming
    // side gets the same paint at a fraction of the brightness, because it is
    // across a median and behind more fog.
    const dashAt = [];
    const dashScale = [];
    const solidAt = [];
    const solidScale = [];

    for (const at of layout.laneEdges) { dashAt.push(at); dashScale.push(1); }
    solidAt.push(layout.left, layout.right);
    solidScale.push(1, 1);

    const far = marks.oncomingScale;
    const step = layout.laneWidth;
    for (let i = 1; i < layout.oncomingCentres.length; i++) {
      dashAt.push(layout.oncomingInner - step * i);
      dashScale.push(far);
    }
    solidAt.push(layout.oncomingInner, layout.oncomingOuter);
    solidScale.push(far, far);

    const shoulder = config.world.road.carriageway.shoulderRight;

    // A ShaderMaterial that opts into fog has to carry the fog uniforms itself:
    // three refreshes fogColor and fogDensity straight on the material and
    // throws on the first frame if they are missing. Cloning the library block
    // keeps this material's fog state its own, and the spread leaves every
    // uniform below as a live reference, which update() relies on.
    const fogUniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.fog);

    this.material = new THREE.ShaderMaterial({
      defines: {
        STRIP_COUNT: lanes.length,
        DASH_COUNT: dashAt.length,
        SOLID_COUNT: solidAt.length,
      },
      uniforms: Object.assign(fogUniforms, {
        uAsphaltColor: { value: new THREE.Color(road.surface.asphaltColor) },
        uVoidColor: { value: new THREE.Color(road.surface.voidColor) },
        uMedianColor: { value: new THREE.Color(road.surface.medianColor) },

        uOurs: { value: new THREE.Vector2(layout.left, layout.shoulderEdge) },
        uMedian: { value: new THREE.Vector2(layout.medianOuter, layout.medianInner) },
        uOncoming: {
          value: new THREE.Vector2(layout.oncomingOuter - shoulder, layout.oncomingInner),
        },
        uVergeFade: { value: road.carriageway.verge },

        uSheenColor: { value: new THREE.Color(road.surface.sheenColor) },
        uSheenStrength: { value: road.surface.sheenStrength },
        uSheenPower: { value: road.surface.sheenPower },
        uNeonFadeStart: { value: road.surface.neonFadeStart },
        uNeonFadeEnd: { value: road.surface.neonFadeEnd },

        uEdgeLeftColor: { value: new THREE.Color(road.edges.leftColor) },
        uEdgeRightColor: { value: new THREE.Color(road.edges.rightColor) },
        uEdgeAt: { value: layout.right },
        uEdgeWidth: { value: road.edges.width },
        uEdgeGlow: { value: road.edges.glow },
        uEdgeIntensity: { value: road.edges.intensity },
        uEdgeHalo: { value: road.edges.halo },

        uMarkColor: { value: new THREE.Color(marks.color) },
        uMarkIntensity: { value: marks.intensity },
        uMarkPeriod: { value: marks.dash + marks.gap },
        uMarkDuty: { value: marks.dash / (marks.dash + marks.gap) },
        uMarkDashWidth: { value: marks.laneWidth },
        uMarkSolidWidth: { value: marks.edgeWidth },
        uDashAt: { value: dashAt },
        uDashScale: { value: dashScale },
        uSolidAt: { value: solidAt },
        uSolidScale: { value: solidScale },

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
    this._phase = phase;
  }

  /**
   * @param {number} dt
   * @param {number} bikeSpeed world units per second the bike is travelling
   */
  update(dt, bikeSpeed = 0) {
    const strips = config.world.road.strips;
    const lanes = strips.lanes;

    // Negative scrollFromSpeed carries the pattern back toward the rider, which
    // adds to the flow the road already has instead of cancelling it.
    //
    // Scaled live by the comfort setting, not baked. It matters less than it
    // did - the strips have moved off the traffic lanes and out to the shoulder
    // and the median, so the worst of it is no longer in the centre of vision -
    // but peripheral motion at 1.45 times road speed is still motion, and
    // someone reaching for that toggle needs it to work on the next frame.
    const scale = motionScale('stripScroll');
    const fromSpeed = strips.scrollFromSpeed * bikeSpeed * scale;

    for (let i = 0; i < lanes.length; i++) {
      const period = this._periods[i];
      let offset = this._offsets[i] + (lanes[i].speed * scale + fromSpeed) * dt;
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
