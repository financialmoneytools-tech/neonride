import * as THREE from 'three';
import { config } from '../../config.js';
import { GeometryBuilder, paintVertices } from '../../utils/geometry.js';

/**
 * PodiumBike - the machine on the podium, as a neon silhouette.
 *
 * ================= WHY A SILHOUETTE AND NOT A BIKE =================
 *
 * THERE IS NO BIKE MODEL IN THIS PROJECT. The cockpit is one drawn sprite of
 * hands and bars, and CLAUDE.md's backlog is explicit that a third-person
 * view "needs a full bike model - frame, seat, exhaust, rear wheel - and a
 * rider body", which is a separate piece of work rather than a prop for one
 * shot. The hands took six attempts before a sprite won, and the lesson there
 * was that generated geometry does not read as the thing it is meant to be.
 *
 * A silhouette sidesteps all of it, because a silhouette is not a model of a
 * bike - it is the shape of one, and the shape is the only part that reads at
 * this distance anyway. It also matches the crowd behind it, which is made
 * the same way and for the same reason.
 *
 * BUILT FOR ONE CAMERA ANGLE. It is never animated and only ever seen from
 * behind and above, so it does not have to hold up in the round and nothing
 * here pretends it would. That is the whole deal that makes it cheap.
 *
 * THE RIM LIGHT IS WHAT MAKES IT AN OBJECT. A dark shape against a dark road
 * is a hole; the same shape with a lit edge is a machine. It is the identical
 * lesson the roadside pylons and the theme gate both landed on, and it takes
 * the chosen bike's own paint, so the thing on the podium is the thing that
 * was ridden.
 */
export class PodiumBike {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    const cfg = config.celebration.bike;

    this.group = new THREE.Group();
    this.group.name = 'PodiumBike';
    this.group.visible = false;
    scene.add(this.group);

    this.geometries = [];
    this.materials = [];

    const dark = new GeometryBuilder();
    const lit = new GeometryBuilder();
    const matrix = new THREE.Matrix4();
    const body = new THREE.Color(cfg.color);

    // --- the machine -----------------------------------------------------
    // A wedge for the tank and seat, read from behind: wider and lower at the
    // back, narrowing forward. Six sides is enough for a silhouette and the
    // facets catch the rim light in a way a smooth shell does not.
    const shell = new THREE.CylinderGeometry(
      cfg.width * 0.34, cfg.width * 0.5, cfg.length * 0.72, 6, 1,
    );
    shell.rotateX(Math.PI * 0.5);
    paintVertices(shell, body);
    dark.add(shell, matrix.makeTranslation(0, cfg.height * 0.46, 0));

    // The fairing, standing up at the front.
    const fairing = new THREE.CylinderGeometry(
      cfg.width * 0.22, cfg.width * 0.42, cfg.height * 0.52, 6, 1,
    );
    paintVertices(fairing, body);
    dark.add(fairing, matrix.makeTranslation(0, cfg.height * 0.62, -cfg.length * 0.3));

    // --- the wheels ------------------------------------------------------
    // Eight sided, like the truck wheels in world/traffic/truckParts.js, for
    // the same reason: at this distance a wheel is a dark ellipse.
    for (const z of [-cfg.length * 0.42, cfg.length * 0.42]) {
      const wheel = new THREE.CylinderGeometry(
        cfg.wheelRadius, cfg.wheelRadius, cfg.width * 0.3, 10,
      );
      wheel.rotateZ(Math.PI * 0.5);
      paintVertices(wheel, 0x05060a);
      dark.add(wheel, matrix.makeTranslation(0, cfg.wheelRadius, z));
    }

    // --- the rider -------------------------------------------------------
    // Sitting up, arms off the bars: the posture of somebody who has just
    // finished rather than somebody still riding. Two tapered blocks.
    const rider = cfg.rider;
    const torso = new THREE.CylinderGeometry(
      rider.shoulders * 0.5, rider.shoulders * 0.34, rider.height * 0.62, 6, 1,
    );
    paintVertices(torso, rider.color);
    dark.add(torso, matrix.makeTranslation(
      0, cfg.height * 0.52 + rider.height * 0.31, cfg.length * 0.06,
    ));

    const head = new THREE.SphereGeometry(rider.shoulders * 0.3, 8, 6);
    paintVertices(head, rider.color);
    dark.add(head, matrix.makeTranslation(
      0, cfg.height * 0.52 + rider.height * 0.72, cfg.length * 0.04,
    ));

    // An arm raised. It is the one gesture that says WON rather than
    // ARRIVED, and it is two boxes.
    const arm = new THREE.CylinderGeometry(
      rider.shoulders * 0.11, rider.shoulders * 0.13, rider.height * 0.5, 5, 1,
    );
    paintVertices(arm, rider.color);
    arm.rotateZ(-0.55);
    dark.add(arm, matrix.makeTranslation(
      rider.shoulders * 0.42, cfg.height * 0.52 + rider.height * 0.74, cfg.length * 0.05,
    ));

    // --- the rim light ---------------------------------------------------
    // Thin bars along the flanks and across the tail. Not an outline shader:
    // a merged edge costs nothing and cannot break when the camera moves.
    // THE CHOSEN BIKE'S OWN PAINT. `config.paint` is what Selection.applyBike
    // patched in, and the celebration is BUILT LAZILY - on the first finish,
    // after a bike has been chosen - so reading it here gets the machine that
    // was actually ridden rather than the default. Baking it into the vertex
    // colours is why there is no setter: repainting would mean rebuilding,
    // and there is nothing to rebuild for.
    const paint = config.paint && config.paint.body ? config.paint.body : 0x2de3ff;
    const tint = new THREE.Color(paint).multiplyScalar(cfg.rimIntensity);
    const rim = cfg.rimWidth;
    for (const sign of [-1, 1]) {
      const edge = new THREE.BoxGeometry(rim, rim, cfg.length * 0.72);
      paintVertices(edge, tint);
      lit.add(edge, matrix.makeTranslation(
        sign * cfg.width * 0.46, cfg.height * 0.5, 0,
      ));
    }
    // A tail light across the back. The one thing on a motorcycle that is
    // genuinely bright from behind, and the angle this is seen from.
    const tail = new THREE.BoxGeometry(cfg.width * 0.8, rim * 1.6, rim);
    paintVertices(tail, new THREE.Color(0xff2a3c).multiplyScalar(0.9));
    lit.add(tail, matrix.makeTranslation(0, cfg.height * 0.56, cfg.length * 0.4));

    // And a lit line up the fairing, so the front of the machine has an edge
    // too rather than dissolving into the confetti behind it.
    const nose = new THREE.BoxGeometry(rim, cfg.height * 0.5, rim);
    paintVertices(nose, tint);
    lit.add(nose, matrix.makeTranslation(0, cfg.height * 0.66, -cfg.length * 0.3));

    this.darkMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
    this.litMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
    this.materials.push(this.darkMaterial, this.litMaterial);

    this._add(dark.build('celebration-bike'), this.darkMaterial);
    this._add(lit.build('celebration-bike-rim'), this.litMaterial);
  }

  _add(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    this.group.add(mesh);
    this.geometries.push(geometry);
  }

  /**
   * @param {THREE.Vector3} position the top of the centre tier
   * @param {THREE.Quaternion} rotation the arena's own turn
   */
  placeAt(position, rotation) {
    this.group.position.copy(position);
    this.group.quaternion.copy(rotation);
    this.group.visible = true;
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
