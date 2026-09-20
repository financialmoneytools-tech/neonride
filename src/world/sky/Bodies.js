import * as THREE from 'three';
import { config } from '../../config.js';
import { bodyDirection } from './direction.js';

/**
 * Bodies - the sun, the planet and the moons.
 *
 * Three of the six roads are built around one object in the sky: Sunset
 * Highway's banded retro sun, Red Planet's planet filling a third of the
 * horizon, Nebula Coast's pair of moons. It is the single largest thing any
 * of them says about where it is, and none of it existed.
 *
 * ================= WHY IT IS ONE MESH AND NOT THREE =================
 *
 * `slots` billboards are allocated at load whatever theme is fitted, merged
 * into ONE geometry with a per-vertex slot index, and driven from an array of
 * uniforms. That is one draw call for every body on every road, and - the
 * part that matters - a theme that wants no sun does not remove a mesh, it
 * sets an opacity to zero. docs/THEMES.md is explicit that a theme selects
 * and tints and never allocates, because a mixed run has to fade a sun in
 * between two gates without a reload.
 *
 * ================= WHY THEY ARE NOT SPRITES =================
 *
 * A body is a flat disc drawn in the fragment shader from the quad's own uv,
 * which gives a hard limb, a soft rim and - for the sun - horizontal bands
 * cut through it, all without a texture. A texture would be an asset, and the
 * project generates everything; a `THREE.Sprite` would be a draw call each
 * and would fight the sky group's own transform.
 *
 * THEY SIT INSIDE THE SKY GROUP, which is kept centred on the camera, so a
 * body never moves relative to the rider however far they travel. That is
 * what makes it a sun rather than a balloon two kilometres down the road.
 */

const VERTEX_SHADER = `
  attribute float aSlot;

  uniform vec3 uCentre[SLOTS];
  uniform float uRadius[SLOTS];

  varying vec2 vUv;
  varying float vSlot;

  void main() {
    int slot = int(aSlot + 0.5);
    vUv = uv;
    vSlot = aSlot;

    vec3 centre = uCentre[0];
    float radius = uRadius[0];
    for (int i = 0; i < SLOTS; i++) {
      if (i == slot) { centre = uCentre[i]; radius = uRadius[i]; }
    }

    // BILLBOARDED IN VIEW SPACE. The quad's local xy is applied after the
    // model-view rotation has been stripped, so the disc always faces the
    // camera however the sky group is turned.
    // THE QUAD IS BIGGER THAN THE BODY, by SPREAD, and the fragment shader
    // divides back out. The halo reaches 1 + halo radii and the quad only
    // reached 1, so the glow was cut off square - a moon came out as a
    // rounded rectangle and the sun as a disc with straight sides.
    // Photographed on three of the four new roads at once.
    vec4 mv = modelViewMatrix * vec4(centre, 1.0);
    mv.xy += position.xy * radius * SPREAD;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor[SLOTS];
  uniform vec3 uEdge[SLOTS];
  uniform float uOpacity[SLOTS];
  uniform float uBands[SLOTS];
  uniform float uBandGap[SLOTS];
  uniform float uHalo[SLOTS];
  uniform float uHaloOpacity[SLOTS];
  uniform float uShade[SLOTS];
  uniform vec2 uShadeDir[SLOTS];

  varying vec2 vUv;
  varying float vSlot;

  void main() {
    int slot = int(vSlot + 0.5);
    vec3 color = uColor[0];
    vec3 edge = uEdge[0];
    float opacity = uOpacity[0];
    float bands = uBands[0];
    float bandGap = uBandGap[0];
    float halo = uHalo[0];
    float haloOpacity = uHaloOpacity[0];
    float shade = uShade[0];
    vec2 shadeDir = uShadeDir[0];
    for (int i = 0; i < SLOTS; i++) {
      if (i == slot) {
        color = uColor[i]; edge = uEdge[i]; opacity = uOpacity[i];
        bands = uBands[i]; bandGap = uBandGap[i];
        halo = uHalo[i]; haloOpacity = uHaloOpacity[i];
        shade = uShade[i]; shadeDir = uShadeDir[i];
      }
    }
    if (opacity <= 0.001) discard;

    // Scaled back out of the oversized quad, so r = 1 is still the limb.
    vec2 d = (vUv * 2.0 - 1.0) * SPREAD;
    float r = length(d);

    // The disc, with a hard limb. Antialiased by the derivative rather than
    // by a fixed epsilon, so it stays clean at every pixel ratio.
    float aa = fwidth(r) * 1.5;
    float disc = 1.0 - smoothstep(1.0 - aa, 1.0, r);

    // THE BANDS. Horizontal cuts that widen toward the bottom of the disc,
    // which is the one detail that makes a circle read as an eighties sun
    // rather than as the actual daytime one. Widening downward matters: even
    // cuts read as a barcode.
    float lit = 1.0;
    if (bands > 0.5) {
      float t = (d.y + 1.0) * 0.5;
      float phase = t * bands;
      // The gap grows as t falls, so the lowest band is the widest.
      float cut = step(bandGap * (1.4 - t), fract(phase));
      lit = cut;
    }

    // A vertical ramp from the core colour to the edge colour. A single flat
    // colour is a sticker; the gradient is what gives it an atmosphere.
    vec3 body = mix(edge, color, clamp(d.y * 0.5 + 0.6, 0.0, 1.0));

    // Shading, for a planet. Zero leaves a flat disc, which is what a sun is.
    if (shade > 0.001) {
      float lambert = dot(normalize(vec3(d, sqrt(max(0.0, 1.0 - r * r)))),
        normalize(vec3(shadeDir, 0.45)));
      body *= mix(1.0, clamp(lambert * 0.5 + 0.5, 0.0, 1.0), shade);
    }

    // The rim, outside the limb. Not a bloom - bloom is a post pass and this
    // has to survive on a phone where the bloom runs at a quarter width.
    float glow = halo > 0.001
      ? (1.0 - smoothstep(1.0, 1.0 + halo, r)) * haloOpacity * (1.0 - disc)
      : 0.0;

    float alpha = disc * lit * opacity + glow * opacity;
    if (alpha <= 0.002) discard;
    gl_FragColor = vec4(body, alpha);
  }
`;

/**
 * How much bigger the quad is than the body it draws.
 *
 * It has to clear the widest halo any theme asks for - `halo` is a fraction
 * of the radius and the largest in use is 0.5 - with room to spare, because
 * the corners of a quad are 1.41 times its edge and a halo that reaches the
 * corner but not the edge is a halo with four points on it.
 */
const SPREAD = 1.8;

/**
 * Bakes the slot count and the quad scale into a shader. Both are constants
 * at build time; neither can be a uniform, because GLSL ES 1.0 needs a
 * constant loop bound.
 * @param {string} source
 * @param {number} slots
 * @returns {string}
 */
function prepare(source, slots) {
  return source
    .replace(/SLOTS/g, String(slots))
    .replace(/SPREAD/g, SPREAD.toFixed(3));
}

export class Bodies {
  constructor() {
    const cfg = config.sky.bodies;
    this.slots = Math.max(1, cfg.slots);

    // One quad per slot, merged, each carrying its own slot index. Built by
    // hand rather than with GeometryBuilder because every quad is identical
    // and sits at the origin - the shader places it.
    const quads = this.slots;
    const position = new Float32Array(quads * 4 * 3);
    const uv = new Float32Array(quads * 4 * 2);
    const slot = new Float32Array(quads * 4);
    const index = new Uint16Array(quads * 6);

    for (let q = 0; q < quads; q++) {
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (let c = 0; c < 4; c++) {
        const v = q * 4 + c;
        position[v * 3] = corners[c][0];
        position[v * 3 + 1] = corners[c][1];
        position[v * 3 + 2] = 0;
        uv[v * 2] = (corners[c][0] + 1) * 0.5;
        uv[v * 2 + 1] = (corners[c][1] + 1) * 0.5;
        slot[v] = q;
      }
      const base = q * 4;
      index.set([base, base + 1, base + 2, base, base + 2, base + 3], q * 6);
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    this.geometry.setAttribute('aSlot', new THREE.BufferAttribute(slot, 1));
    this.geometry.setIndex(new THREE.BufferAttribute(index, 1));
    // The quads live at the origin and the shader moves them, so a computed
    // bound would be a point and three would cull the lot.
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4000);

    const uniforms = {
      uCentre: { value: [] },
      uRadius: { value: [] },
      uColor: { value: [] },
      uEdge: { value: [] },
      uOpacity: { value: [] },
      uBands: { value: [] },
      uBandGap: { value: [] },
      uHalo: { value: [] },
      uHaloOpacity: { value: [] },
      uShade: { value: [] },
      uShadeDir: { value: [] },
    };
    for (let i = 0; i < this.slots; i++) {
      uniforms.uCentre.value.push(new THREE.Vector3());
      uniforms.uRadius.value.push(1);
      uniforms.uColor.value.push(new THREE.Color());
      uniforms.uEdge.value.push(new THREE.Color());
      uniforms.uOpacity.value.push(0);
      uniforms.uBands.value.push(0);
      uniforms.uBandGap.value.push(0.4);
      uniforms.uHalo.value.push(0);
      uniforms.uHaloOpacity.value.push(0);
      uniforms.uShade.value.push(0);
      uniforms.uShadeDir.value.push(new THREE.Vector2(-1, 0.3));
    }
    this.uniforms = uniforms;

    this.material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: prepare(VERTEX_SHADER, this.slots),
      fragmentShader: prepare(FRAGMENT_SHADER, this.slots),
      transparent: true,
      depthWrite: false,
      // BEHIND EVERYTHING. A body is part of the sky, so it must never be
      // drawn over a mountain or a nebula that is nominally in front of it.
      depthTest: false,
      // Not tone mapped, like every other emissive surface here, so the grade
      // does not roll a sun's core off to grey.
      toneMapped: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'SkyBodies';
    this.mesh.frustumCulled = false;
    // Drawn before the stars and the nebula, so nothing it covers is lost and
    // the star layers read THROUGH the halo rather than under the disc.
    this.mesh.renderOrder = -6;

    this.applyTheme();
  }

  /**
   * Reads the theme's body list into the uniforms.
   *
   * CONTINUOUS, so a blend can call it every frame. Every slot is written on
   * every call, including the ones the theme does not use - a slot left alone
   * keeps the previous theme's sun hanging in the new theme's sky, which is
   * exactly the class of bug the parked-instance rule exists to prevent.
   */
  applyTheme() {
    const cfg = config.sky.bodies;
    const list = cfg.list || [];
    const u = this.uniforms;

    for (let i = 0; i < this.slots; i++) {
      const body = { ...cfg.defaults, ...(list[i] || {}) };
      const wanted = list[i] ? body.opacity : 0;

      // A RIDER AZIMUTH - zero is dead ahead. The one place it is spelled out
      // is ./direction.js, because the dome glow reads a body's direction to
      // anchor its own pool and the two must not drift apart again.
      bodyDirection(body.azimuth, body.elevation, u.uCentre.value[i])
        .multiplyScalar(cfg.distance);
      u.uRadius.value[i] = body.radius;
      u.uColor.value[i].set(body.color);
      u.uEdge.value[i].set(body.edgeColor);
      u.uOpacity.value[i] = wanted;
      u.uBands.value[i] = body.bands;
      u.uBandGap.value[i] = body.bandGap;
      u.uHalo.value[i] = body.halo;
      u.uHaloOpacity.value[i] = body.haloOpacity;
      u.uShade.value[i] = body.shade;
      u.uShadeDir.value[i].set(Math.cos(body.shadeAzimuth), Math.sin(body.shadeAzimuth));
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
