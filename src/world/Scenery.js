import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { UP } from './road/RoadPath.js';
import { roadLayout } from './road/layout.js';
import { applyDistanceFade } from '../utils/distanceFade.js';
import { createStarTexture } from '../utils/textures.js';
import { BUILDERS, GLOW_BUILDERS } from './scenery/props.js';
import { createSignAtlas } from './scenery/signs.js';

/**
 * Scenery - the props that stand beside the road, pooled with it.
 *
 * Built on world/Roadside.js's pattern, which is already proved: one
 * InstancedMesh per kind, the instance buffer partitioned by road chunk slot,
 * filled from road.onChunkBuilt. Three differences, each of them a reason this
 * is not just another Roadside:
 *
 * 1. EVERY KIND IS ALLOCATED, WHATEVER THE THEME USES. A theme sets a density
 *    from 0 to 1 per kind and nothing else; it never allocates. That is the
 *    rule the whole theme system rests on - see docs/THEMES.md - because buffer
 *    sizes cannot change mid run and a road that changes theme every few
 *    kilometres would otherwise have to reload. A kind at density 0 keeps its
 *    buffer and is switched off - parking the instances alone was NOT free,
 *    measured: an InstancedMesh a million units away still submits its draw
 *    call and all of its triangles, and Galaxy Road was paying four draw calls
 *    and 21k triangles for scenery it does not have.
 *
 * 2. PLACEMENT IS SEEDED BY GLOBAL CHUNK INDEX, not by pool slot. Pylons can be
 *    evenly spaced; trees cannot, or they read as a fence. A per chunk RNG
 *    seeded from the chunk's own index gives scatter that is identical every
 *    time that stretch of road is rebuilt, which matters because a chunk is
 *    rebuilt whenever the pool wraps and a tree that moved would be a tree the
 *    rider watched jump.
 *
 * 3. PROPS HAVE A SIDE AND A SETBACK. The highway is asymmetric, so "beside the
 *    road" is a different number on each side, and both come from
 *    road/layout.js rather than from a constant.
 */

const _position = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _lateral = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _scale = new THREE.Vector3();

/** Parked here, far past the fade, when a theme does not want this kind. */
const PARKED = 1e6;

export class Scenery {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Road.js').Road} road
   */
  constructor(scene, road) {
    const cfg = config.world.scenery;
    const roadCfg = config.world.road;

    this.scene = scene;
    this.road = road;
    this.layout = roadLayout();

    this.group = new THREE.Group();
    this.group.name = 'Scenery';
    scene.add(this.group);

    /** @type {{name:string, cfg:object, mesh:THREE.InstancedMesh, perChunk:number}[]} */
    this.kinds = [];

    for (const [name, kind] of Object.entries(cfg.kinds)) {
      const build = BUILDERS[kind.shape];
      if (!build) continue;

      const geometry = build(kind);
      const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        toneMapped: kind.toneMapped !== false,
      });
      applyDistanceFade(material, roadCfg.surface.neonFadeStart, roadCfg.surface.neonFadeEnd);

      const perChunk = kind.perChunk;
      const count = roadCfg.poolSize * perChunk;
      const mesh = new THREE.InstancedMesh(geometry, material, count);
      mesh.name = 'Scenery_' + name;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // Instances span the whole pool, far beyond the bounds of one prop, so
      // the default per geometry culling test would be wrong.
      mesh.frustumCulled = false;
      this.group.add(mesh);

      // A SECOND MESH FOR THE LIGHT A PROP THROWS, when it throws any. Light is
      // not a surface: a lamp head painted bright is a white slab, and what
      // makes it a lamp is a halo and a pool of road lit under it. Additive,
      // depth-write off, and driven by the SAME instance matrix, so placing the
      // prop places its light with it.
      let glow = null;
      const glowBuild = kind.glow && GLOW_BUILDERS[kind.shape];
      if (glowBuild) {
        // Two kinds of light so far, and they want different textures: a lamp
        // wants a soft radial falloff, a sign wants writing. Each is built once
        // and cached, because a texture per kind is a texture per kind.
        let texture;
        if (kind.glow.sign) {
          this.signTexture = this.signTexture || createSignAtlas(kind.glow.sign);
          texture = this.signTexture;
        } else {
          this.glowTexture = this.glowTexture
            || createStarTexture(kind.glow.texture, kind.glow.textureSize);
          texture = this.glowTexture;
        }

        const glowGeometry = glowBuild(kind);
        const glowMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          vertexColors: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
          opacity: kind.glow.opacity,
        });
        applyDistanceFade(glowMaterial, roadCfg.surface.neonFadeStart, roadCfg.surface.neonFadeEnd);

        glow = new THREE.InstancedMesh(glowGeometry, glowMaterial, count);
        glow.name = 'SceneryGlow_' + name;
        glow.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        glow.frustumCulled = false;
        glow.renderOrder = 2;
        this.group.add(glow);
        this._extra = this._extra || [];
        this._extra.push({ geometry: glowGeometry, material: glowMaterial, mesh: glow });
      }

      this.kinds.push({
        name, cfg: kind, mesh, glow, geometry, material, perChunk,
        // A per kind salt for the placement RNG. An INDEX, not something
        // derived from the name: seeding from the name's length put 'pine' and
        // 'rock' on the same sequence, which stands every boulder inside a
        // tree.
        salt: this.kinds.length * 104729,
      });
    }

    this._onChunkBuilt = this._fillChunk.bind(this);
    road.onChunkBuilt(this._onChunkBuilt);
  }

  /**
   * Re-places everything. Called when a theme changes a density, which today
   * happens only at load; it is here because step three of docs/THEMES.md needs
   * it and a rebuild that only exists in a plan is a rebuild nobody has run.
   */
  refill() {
    for (let slot = 0; slot < this.road.chunks.length; slot++) {
      this._fillChunk(slot, this.road.chunks[slot].chunkIndex);
    }
  }

  /**
   * Places every prop belonging to one pool slot.
   * @param {number} slot
   * @param {number} chunkIndex
   */
  _fillChunk(slot, chunkIndex) {
    const path = this.road.path;
    const chunkLength = config.world.road.chunkLength;
    const densities = config.world.scenery.density;

    for (const kind of this.kinds) {
      const cfg = kind.cfg;
      const base = slot * kind.perChunk;
      const density = Math.max(0, Math.min(1, densities[kind.name] || 0));
      const live = Math.round(kind.perChunk * density);

      // A kind the theme does not use is switched OFF, not merely parked. The
      // parking alone was measured and it is not free: an InstancedMesh with
      // every instance a million units away still submits its draw call and
      // every one of its triangles. Galaxy Road uses no scenery at all and was
      // paying four draw calls and 21k triangles for it.
      kind.mesh.visible = live > 0;
      if (kind.glow) kind.glow.visible = live > 0;
      if (live === 0) continue;

      // One RNG per kind per chunk. Seeded from both, so two kinds do not share
      // a sequence and land on top of each other, and so the same stretch of
      // road comes back identical however many times it is rebuilt.
      const rng = createRng(config.world.scenery.seed + chunkIndex * 7919 + kind.salt);

      for (let i = 0; i < kind.perChunk; i++) {
        if (i >= live) {
          // Parked, not skipped: a skipped write leaves last chunk's matrix in
          // the buffer and the prop stays where it was, in the middle of a road
          // that has since moved on.
          _matrix.makeTranslation(PARKED, PARKED, PARKED);
          kind.mesh.setMatrixAt(base + i, _matrix);
          if (kind.glow) kind.glow.setMatrixAt(base + i, _matrix);
          continue;
        }

        // Spread along the chunk with jitter, so the rhythm is not machine even
        // but also never leaves a hundred metre hole.
        const along = (chunkIndex + (i + rng.next()) / kind.perChunk) * chunkLength;
        path.frameAt(along, _position, _tangent, _lateral);

        // 'centre' is for anything that SPANS the road rather than standing
        // beside it - a sign gantry - and it is the one case where the side and
        // the setback mean nothing.
        let offset = 0;
        if (cfg.side !== 'centre') {
          const right = cfg.side === 'both' ? (rng.next() < 0.5 ? 1 : -1)
            : cfg.side === 'right' ? 1 : -1;
          const edge = right > 0 ? this.layout.ribbonRight : -this.layout.ribbonLeft;
          offset = right * (edge + cfg.setback + rng.next() * cfg.spread);
        }

        _forward.crossVectors(_lateral, UP);
        _matrix.makeBasis(_lateral, UP, _forward);

        const scale = cfg.scaleMin + rng.next() * (cfg.scaleMax - cfg.scaleMin);
        _scale.set(scale, scale, scale);
        _matrix.scale(_scale);
        _matrix.setPosition(
          _position.x + _lateral.x * offset,
          _position.y + (cfg.sink || 0),
          _position.z + _lateral.z * offset,
        );

        kind.mesh.setMatrixAt(base + i, _matrix);
        if (kind.glow) kind.glow.setMatrixAt(base + i, _matrix);
      }

      kind.mesh.instanceMatrix.needsUpdate = true;
      if (kind.glow) kind.glow.instanceMatrix.needsUpdate = true;
    }
  }

  dispose() {
    for (const kind of this.kinds) {
      kind.geometry.dispose();
      kind.material.dispose();
      kind.mesh.dispose();
    }
    for (const extra of this._extra || []) {
      extra.geometry.dispose();
      extra.material.dispose();
      extra.mesh.dispose();
    }
    if (this.glowTexture) this.glowTexture.dispose();
    if (this.signTexture) this.signTexture.dispose();
    this.kinds.length = 0;
    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
    this.road = null;
  }
}
