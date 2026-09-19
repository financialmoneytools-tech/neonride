import * as THREE from 'three';
import { config } from '../../config.js';
import { createRng } from '../../utils/rng.js';
import { GeometryBuilder, paintVertices } from '../../utils/geometry.js';

/**
 * Crowd - a few hundred silhouettes on tiered stands, waving flags.
 *
 * A CROWD IS A TEXTURE, NOT A LIST OF PEOPLE. Nothing here is detailed enough
 * to be a person, which is both the cheap choice and the safe one: this ships
 * on app stores and in ads, and anything detailed enough to read as an
 * individual is detailed enough to read as a likeness. They are dark tapered
 * blocks against a lit sky and that is all they will ever be.
 *
 * TWO DRAW CALLS, and no per-frame CPU at all. Every figure is merged into
 * ONE geometry and every flag into another, and the waving happens in the
 * vertex shader from a per-vertex phase. The obvious build - an InstancedMesh
 * with 240 matrices rewritten each frame - is two draw calls as well but pays
 * 240 matrix composes a frame for a crowd nobody looks at directly.
 *
 * THE SWAY SCALES WITH HEIGHT above each figure's own feet, so a body leans
 * rather than slides. That needs nothing but the local y, because every
 * figure is built standing on its own tier.
 */

const CROWD_VERTEX = `
  attribute float aPhase;
  attribute float aBase;

  uniform float uTime;
  uniform float uSway;
  uniform float uRate;

  varying vec3 vColor;

  void main() {
    vec3 local = position;
    // Lean, not slide: the displacement grows with height above this figure's
    // own feet, so the block pivots where it stands.
    float up = max(0.0, local.y - aBase);
    local.x += sin(uTime * uRate + aPhase) * uSway * up;
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(local, 1.0);
  }
`;

const CROWD_FRAGMENT = `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

export class Crowd {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [quality] share of the configured counts to build
   */
  constructor(scene, quality = 1) {
    const cfg = config.celebration.crowd;
    const rng = createRng(6604);

    this.group = new THREE.Group();
    this.group.name = 'Crowd';
    this.group.visible = false;
    scene.add(this.group);

    this.geometries = [];
    this.materials = [];

    const people = Math.max(24, Math.round(cfg.count * quality));
    const flagCount = Math.max(12, Math.round(cfg.flags.count * quality));

    const bodies = new GeometryBuilder();
    const flags = new GeometryBuilder();
    const matrix = new THREE.Matrix4();

    // --- the stands ------------------------------------------------------
    // Tiers behind the podium, so the crowd is standing on something rather
    // than hanging in the fog.
    // THE PARTS LIST IS BUILT IN THE SAME ORDER AS THE GEOMETRY, and that is
    // load bearing rather than tidy. `_attachSway` walks the merged buffer
    // from vertex zero handing each part its phase, so anything added to the
    // builder and left out of this list shifts every phase after it. The
    // stands went in first and were not listed, which offset all 240 figures
    // by the stands' vertex count - people swaying to their neighbour's
    // phase, and the last few not swaying at all.
    const phases = [];
    const stand = cfg.stand;
    for (let row = 0; row < stand.rows; row++) {
      const radius = cfg.radius + row * stand.depth;
      const height = (row + 1) * stand.rise;
      const tier = new THREE.CylinderGeometry(
        radius + stand.depth, radius + stand.depth, height, 40, 1, true,
        Math.PI * 0.5 - cfg.spread * 0.5, cfg.spread,
      );
      paintVertices(tier, stand.color);
      bodies.add(tier, matrix.makeTranslation(0, height * 0.5, 0));
      // A base above every vertex it owns, so `up` clamps to zero and the
      // stands never move however the crowd on them does.
      phases.push({ count: tier.attributes.position.count, phase: 0, base: 1e6 });
    }

    // --- the people ------------------------------------------------------
    const colour = new THREE.Color(cfg.color);

    for (let i = 0; i < people; i++) {
      const row = Math.floor(rng.next() * cfg.rows);
      const radius = cfg.radius + row * stand.depth + stand.depth * 0.5;
      const standHeight = (Math.min(row, stand.rows - 1) + 1) * stand.rise;
      // BEYOND THE PODIUM, not behind the camera. Local +z is the way the
      // road runs and the camera sits at -z of the podium looking forward,
      // so a crowd at -z was directly behind the lens for the whole shot.
      const angle = Math.PI * 0.5 + (rng.next() - 0.5) * cfg.spread;
      const height = rng.range(cfg.height[0], cfg.height[1]);

      // A tapered block: narrower at the top, which is the whole of what
      // makes a dark rectangle read as a person at this distance.
      const body = new THREE.CylinderGeometry(
        cfg.width * 0.34, cfg.width * 0.5, height, 5, 1,
      );
      paintVertices(body, colour);
      bodies.add(body, matrix.makeTranslation(
        Math.cos(angle) * radius,
        standHeight + height * 0.5,
        Math.sin(angle) * radius,
      ));
      phases.push({ count: body.attributes.position.count, phase: rng.next() * Math.PI * 2,
        base: standHeight });
    }

    const bodyGeometry = bodies.build('celebration-crowd');
    this._attachSway(bodyGeometry, phases);

    // --- the flags -------------------------------------------------------
    const flagCfg = cfg.flags;
    const flagPhases = [];
    for (let i = 0; i < flagCount; i++) {
      const row = Math.floor(rng.next() * cfg.rows);
      const radius = cfg.radius + row * stand.depth + stand.depth * 0.5;
      const standHeight = (Math.min(row, stand.rows - 1) + 1) * stand.rise;
      const angle = Math.PI * 0.5 + (rng.next() - 0.5) * cfg.spread;
      const lift = standHeight + rng.range(1.7, 2.3);

      const cloth = new THREE.PlaneGeometry(flagCfg.width, flagCfg.height);
      // Bright, so the crowd is not a solid black band: the flags are the
      // only thing in the stands that catches the light.
      paintVertices(cloth, new THREE.Color().setHSL(rng.next(), 0.7, 0.55));
      cloth.rotateY(angle + Math.PI * 0.5);
      flags.add(cloth, matrix.makeTranslation(
        Math.cos(angle) * radius,
        lift,
        Math.sin(angle) * radius,
      ));
      flagPhases.push({ count: cloth.attributes.position.count,
        phase: rng.next() * Math.PI * 2, base: lift - flagCfg.height });
    }

    const flagGeometry = flags.build('celebration-crowd-flags');
    this._attachSway(flagGeometry, flagPhases);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSway: { value: flagCfg.sway * 0.25 },
        uRate: { value: flagCfg.rate },
      },
      vertexShader: CROWD_VERTEX,
      fragmentShader: CROWD_FRAGMENT,
      vertexColors: true,
    });
    this.flagMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        // Flags move far more than the people holding them.
        uSway: { value: flagCfg.sway },
        uRate: { value: flagCfg.rate * 1.6 },
      },
      vertexShader: CROWD_VERTEX,
      fragmentShader: CROWD_FRAGMENT,
      vertexColors: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.materials.push(this.material, this.flagMaterial);

    this._add(bodyGeometry, this.material);
    this._add(flagGeometry, this.flagMaterial);
  }

  /**
   * Gives every vertex the phase and the foot height of the part it belongs
   * to, so one shader can sway several hundred figures independently.
   * @param {THREE.BufferGeometry} geometry
   * @param {Array<{count:number, phase:number, base:number}>} parts
   */
  _attachSway(geometry, parts) {
    const total = geometry.attributes.position.count;
    const phase = new Float32Array(total);
    const base = new Float32Array(total);
    let at = 0;
    for (const part of parts) {
      for (let i = 0; i < part.count && at < total; i++, at++) {
        phase[at] = part.phase;
        base[at] = part.base;
      }
    }
    // Anything unaccounted for is pinned rather than left at phase zero with
    // a base of zero, which would make it sway with the whole geometry.
    for (; at < total; at++) {
      phase[at] = 0;
      base[at] = 1e6;
    }
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geometry.setAttribute('aBase', new THREE.BufferAttribute(base, 1));
  }

  _add(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    this.group.add(mesh);
    this.geometries.push(geometry);
  }

  /**
   * @param {THREE.Vector3} position where the podium is
   * @param {THREE.Quaternion} rotation how it is turned
   */
  placeAt(position, rotation) {
    this.group.position.copy(position);
    this.group.quaternion.copy(rotation);
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  /** @param {number} dt */
  update(dt) {
    if (!this.group.visible) return;
    this.material.uniforms.uTime.value += dt;
    this.flagMaterial.uniforms.uTime.value += dt;
  }

  dispose() {
    if (this.group.parent) this.group.parent.remove(this.group);
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.geometries.length = 0;
    this.materials.length = 0;
  }
}
