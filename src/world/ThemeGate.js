import * as THREE from 'three';
import { config } from '../config.js';
import { roadLayout } from './road/layout.js';

/**
 * ThemeGate - the lit arch that announces a road changing, and the one the
 * staged run's checkpoints and finish line are placed with.
 *
 * ONE GATE, MOVED, never a gate per change. It is built at construction and
 * parked beyond the fog wall; arming it puts it at a distance ahead and lets
 * the road bring it to the rider. A gate allocated per transition would be the
 * one thing in the world that still allocates mid run, in a system whose whole
 * transition design rests on nothing doing that.
 *
 * IT IS NOT A WALL. It spans the whole drawn ribbon and stands clear above the
 * tallest vehicle, so there is nothing to hit and nothing to steer around - the
 * escape guarantee that makes the road playable does not know this exists, and
 * must not have to. Collision is never tested against it.
 *
 * THE CHANGE HAPPENS AS THE RIDER PASSES THROUGH, not when the gate appears.
 * The blend is armed here and started at the crossing, so the road behind the
 * gate is the old one and the road beyond it is the new one - which is what
 * makes it read as a place changing rather than as a filter being applied.
 */
export class ThemeGate {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Road.js').Road} road
   * @param {object} [tint] overrides for this gate's own colours, merged over
   *   config.world.gate. A checkpoint is the same arch in a different light:
   *   same geometry, same placement, same fade, so it is the same class with
   *   two colours changed rather than a second one that would drift from it.
   */
  constructor(scene, road, tint = null) {
    const cfg = tint ? { ...config.world.gate, ...tint } : config.world.gate;
    /** Kept so `update` reads the same colours the constructor built with. */
    this.cfg = cfg;
    this.road = road;
    this.distance = 0;
    this.armed = false;
    /** Set while the rider is inside the arch. */
    this.crossed = true;
    /** Called once, at the crossing. */
    this.onCross = null;

    const layout = roadLayout();
    // Wide enough to leave the frame at every aspect: the arch is scenery and a
    // visible end to it turns it into a prop rather than a place.
    const halfWidth = (layout.shoulderEdge - layout.oncomingOuter) * 0.5 + cfg.overhang;
    const centre = (layout.shoulderEdge + layout.oncomingOuter) * 0.5;
    this.centre = centre;

    this.group = new THREE.Group();
    this.group.name = 'ThemeGate';
    this.group.visible = false;
    scene.add(this.group);

    // Two legs and a beam, one geometry each, reused for both legs. The whole
    // gate is three draw calls and it is on screen for a few seconds at a time.
    const legGeometry = new THREE.BoxGeometry(cfg.legWidth, cfg.height, cfg.legWidth);
    const beamGeometry = new THREE.BoxGeometry(halfWidth * 2, cfg.beamHeight, cfg.legWidth);
    this.geometries = [legGeometry, beamGeometry];

    this.structureMaterial = new THREE.MeshBasicMaterial({ color: cfg.structureColor });
    // The lit part. Not tone mapped, like every other neon in the project, so
    // it keeps its colour through the grade instead of being rolled off.
    this.neonMaterial = new THREE.MeshBasicMaterial({
      color: cfg.neonColor,
      toneMapped: false,
      transparent: true,
      opacity: 1,
    });
    this.materials = [this.structureMaterial, this.neonMaterial];

    // EACH LEG CARRIES ITS OWN LIT STRIP, and this is not decoration - it is the
    // same fault the roadside pylons already had and had fixed. A near black
    // post against a near black sky is invisible, so a lit beam on top of two
    // of them reads as a glowing bar hanging in the air with nothing holding it
    // up. Photographed at a gap of 20 and it was exactly that. The strip is
    // what makes it a structure.
    const stripGeometry = new THREE.BoxGeometry(
      cfg.legWidth * cfg.legStripWidth,
      cfg.height,
      cfg.legWidth * 0.55,
    );
    this.geometries.push(stripGeometry);
    this.legStripMaterial = new THREE.MeshBasicMaterial({
      color: cfg.neonColor,
      toneMapped: false,
      transparent: true,
      opacity: cfg.legStripOpacity,
    });
    this.materials.push(this.legStripMaterial);

    for (const sign of [-1, 1]) {
      const leg = new THREE.Mesh(legGeometry, this.structureMaterial);
      leg.position.set(centre + sign * halfWidth, cfg.height * 0.5, 0);
      this.group.add(leg);

      // Inboard face, so it lights the road rather than the verge.
      const strip = new THREE.Mesh(stripGeometry, this.legStripMaterial);
      strip.position.set(
        centre + sign * (halfWidth - cfg.legWidth * 0.5 * cfg.legStripWidth),
        cfg.height * 0.5,
        cfg.legWidth * 0.3,
      );
      this.group.add(strip);
    }

    this.beam = new THREE.Mesh(beamGeometry, this.neonMaterial);
    this.beam.position.set(centre, cfg.height, 0);
    this.group.add(this.beam);

    // A second, larger, dimmer beam behind the first. Light is not a surface -
    // the same lesson the roadside lamps landed on - and without it the arch
    // reads as a painted bar rather than as something lit.
    const haloGeometry = new THREE.BoxGeometry(
      halfWidth * 2 + cfg.haloSpread,
      cfg.beamHeight + cfg.haloSpread,
      cfg.legWidth * 0.5,
    );
    this.geometries.push(haloGeometry);
    this.haloMaterial = new THREE.MeshBasicMaterial({
      color: cfg.neonColor,
      toneMapped: false,
      transparent: true,
      opacity: cfg.haloOpacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.materials.push(this.haloMaterial);
    this.halo = new THREE.Mesh(haloGeometry, this.haloMaterial);
    this.halo.position.set(centre, cfg.height, -cfg.legWidth * 0.4);
    this.group.add(this.halo);
  }

  /**
   * Places the gate a set distance ahead of the rider and starts watching for
   * the crossing.
   * @param {number} playerDistance
   */
  arm(playerDistance) {
    this.armAt(playerDistance + this.cfg.ahead);
  }

  /**
   * Places the gate at an ABSOLUTE distance along the road.
   *
   * This is what the staged run needs and `arm` is not: a checkpoint stands at
   * a kilometre mark, not at "wherever the rider was plus nine hundred". Armed
   * the other way the gates would drift with the frame the arming happened on,
   * and a stage's fourth gate would not be at four kilometres.
   * @param {number} distance
   */
  armAt(distance) {
    this.distance = distance;
    this.armed = true;
    this.crossed = false;
    this.group.visible = true;
  }

  /** Parks it beyond the fog wall and stops watching. */
  disarm() {
    this.armed = false;
    this.crossed = true;
    this.group.visible = false;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads distance
   */
  update(dt, state) {
    if (!this.armed) return;
    const cfg = this.cfg;
    const playerDistance = state.distance || 0;
    const gap = this.distance - playerDistance;

    // Well past it: park it rather than leaving three meshes in the scene
    // behind the rider, where they cost the same as they do in front.
    if (gap < -cfg.behind) {
      this.disarm();
      return;
    }

    const path = this.road.path;
    const position = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const lateral = new THREE.Vector3();
    path.frameAt(this.distance, position, tangent, lateral);
    this.group.position.copy(position);
    // Square to the road, so it is an arch over the carriageway rather than a
    // billboard that happens to be near it.
    this.group.rotation.y = Math.atan2(-tangent.x, -tangent.z);

    // Fades in out of the fog rather than appearing, on the same window the
    // road's own neon uses.
    const fade = THREE.MathUtils.clamp(
      1 - (gap - cfg.fadeStart) / Math.max(cfg.fadeEnd - cfg.fadeStart, 0.001),
      0,
      1,
    );
    this.neonMaterial.opacity = fade;
    this.haloMaterial.opacity = cfg.haloOpacity * fade;
    this.legStripMaterial.opacity = cfg.legStripOpacity * fade;

    if (!this.crossed && gap <= 0) {
      this.crossed = true;
      if (this.onCross) this.onCross();
    }
  }

  dispose() {
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.group.clear();
    if (this.group.parent) this.group.parent.remove(this.group);
    this.onCross = null;
  }
}
