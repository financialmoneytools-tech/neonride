import * as THREE from 'three';
import { config } from '../../config.js';
import { GeometryBuilder, paintVertices } from '../../utils/geometry.js';

/**
 * Arena - the podium, its lit trim, and the ground it stands on.
 *
 * TWO DRAW CALLS FOR ALL OF IT. Everything unlit merges into one geometry and
 * everything lit into another, the way world/traffic/VehicleMesh.js merges a
 * truck's wheels and door seams into its body. Three tiers, a floor and six
 * strips of neon would be nine meshes built the obvious way.
 *
 * ONLY THE CENTRE TIER IS EVER OCCUPIED. The other two exist because a single
 * block under a bike reads as a crate; three stepped blocks read as a podium
 * before anything is on them. They are scenery for a shape, not positions.
 *
 * THE TRIM IS BRIGHTER THAN A ROAD THREAD and config/celebration.js says why:
 * the thread rule governs the carriageway over a ten minute ride, and this is
 * a stationary seven second shot whose reference brightness is a firework. At
 * road values the podium was not visible at all.
 */
export class Arena {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    const cfg = config.celebration.podium;

    this.group = new THREE.Group();
    this.group.name = 'Arena';
    this.group.visible = false;
    scene.add(this.group);

    this.geometries = [];
    this.materials = [];

    const solid = new GeometryBuilder();
    const lit = new GeometryBuilder();
    const matrix = new THREE.Matrix4();

    // --- the floor -------------------------------------------------------
    // A disc, not a plane: the arena has to end somewhere and a square edge
    // in the fog reads as a missing chunk of road.
    const floor = new THREE.CircleGeometry(cfg.floor.radius, 48);
    floor.rotateX(-Math.PI / 2);
    paintVertices(floor, cfg.floor.color);
    solid.add(floor, matrix.makeTranslation(0, 0.02, 0));

    // A dimmer ring inside it, so the ground is lit by the arena rather than
    // being a hole. Additive would fight the road; this is flat colour.
    const ring = new THREE.RingGeometry(cfg.floor.radius * 0.42, cfg.floor.radius * 0.72, 48);
    ring.rotateX(-Math.PI / 2);
    paintVertices(ring, new THREE.Color(cfg.floor.glow)
      .multiplyScalar(cfg.floor.glowIntensity));
    solid.add(ring, matrix.makeTranslation(0, 0.04, 0));

    // --- the tiers -------------------------------------------------------
    for (const tier of cfg.tiers) {
      const box = new THREE.BoxGeometry(tier.width, tier.height, tier.depth);
      paintVertices(box, cfg.color);
      solid.add(box, matrix.makeTranslation(tier.x, tier.height * 0.5, 0));

      // A lit edge around the top face. Four thin bars rather than a ring,
      // because a box's top is a rectangle and a ring around it would not
      // touch the corners.
      const trim = cfg.trim;
      const tint = new THREE.Color(trim.color).multiplyScalar(trim.intensity);
      const halfW = tier.width * 0.5 - trim.inset;
      const halfD = tier.depth * 0.5 - trim.inset;
      for (const [w, d, x, z] of [
        [halfW * 2, trim.height, 0, halfD],
        [halfW * 2, trim.height, 0, -halfD],
        [trim.height, halfD * 2, halfW, 0],
        [trim.height, halfD * 2, -halfW, 0],
      ]) {
        const bar = new THREE.BoxGeometry(w, trim.height, d);
        paintVertices(bar, tint);
        lit.add(bar, matrix.makeTranslation(tier.x + x, tier.height, z));
      }
    }

    this.solidMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
    // Not tone mapped, like every other neon here, so it keeps its colour
    // through the grade rather than being rolled off.
    this.litMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
    this.materials.push(this.solidMaterial, this.litMaterial);

    this._add(solid.build('celebration-arena'), this.solidMaterial);
    this._add(lit.build('celebration-arena-trim'), this.litMaterial);

    /** Where the bike stands, so nothing else has to work it out. */
    this.podiumTop = new THREE.Vector3(0, cfg.tiers[1].height, 0);
  }

  _add(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    this.group.add(mesh);
    this.geometries.push(geometry);
    return mesh;
  }

  /**
   * Puts the arena on the road at an absolute distance and faces it back down
   * the road at the rider.
   * @param {import('../road/RoadPath.js').RoadPath} path
   * @param {number} distance
   */
  placeAt(path, distance) {
    const position = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const lateral = new THREE.Vector3();
    path.frameAt(distance, position, tangent, lateral);
    this.group.position.copy(position);
    // Faces the way the road goes, so the podium squares up to a rider
    // arriving along it rather than standing at an angle to the carriageway.
    this.group.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      tangent.clone().normalize(),
    );
    this.group.visible = true;
    // FORCED, and this is not a formality. `localToWorld` reads matrixWorld,
    // which three only refreshes during render - so on the frame the arena is
    // placed it still holds the PREVIOUS transform, which is the identity.
    // Without this the podium reports its top at the world origin, and the
    // camera, the fireworks, the confetti and the champagne all go there
    // while the arena itself stands correctly a quarter of a kilometre down
    // the road. Photographed exactly once, as a screen full of confetti with
    // no podium in it.
    this.group.updateMatrixWorld(true);
    /** The podium's top in WORLD space, for the bike and the particles. */
    this.worldTop = this.group.localToWorld(this.podiumTop.clone());
    return this.worldTop;
  }

  hide() {
    this.group.visible = false;
  }

  dispose() {
    if (this.group.parent) this.group.parent.remove(this.group);
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.geometries.length = 0;
    this.materials.length = 0;
  }
}
