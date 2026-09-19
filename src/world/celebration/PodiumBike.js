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
    // Offset, so the rider has podium to stand on beside it.
    const bx = cfg.offsetX;

    // A wedge for the tank and seat: wider and lower at the back, narrowing
    // forward. Six sides is enough for a silhouette and the facets catch the
    // rim light in a way a smooth shell does not.
    const shell = new THREE.CylinderGeometry(
      cfg.width * 0.34, cfg.width * 0.5, cfg.length * 0.72, 6, 1,
    );
    shell.rotateX(Math.PI * 0.5);
    paintVertices(shell, body);
    dark.add(shell, matrix.makeTranslation(bx, cfg.height * 0.46, 0));

    // The fairing, standing up at the front.
    const fairing = new THREE.CylinderGeometry(
      cfg.width * 0.22, cfg.width * 0.42, cfg.height * 0.52, 6, 1,
    );
    paintVertices(fairing, body);
    dark.add(fairing, matrix.makeTranslation(bx, cfg.height * 0.62, -cfg.length * 0.3));

    // --- the wheels ------------------------------------------------------
    // Eight sided, like the truck wheels in world/traffic/truckParts.js, for
    // the same reason: at this distance a wheel is a dark ellipse. They MUST
    // read from a three quarter angle, which is the one angle that shows two
    // of them - end on they were hidden behind the body entirely.
    for (const z of [-cfg.length * 0.42, cfg.length * 0.42]) {
      const wheel = new THREE.CylinderGeometry(
        cfg.wheelRadius, cfg.wheelRadius, cfg.width * 0.34, 12,
      );
      wheel.rotateZ(Math.PI * 0.5);
      paintVertices(wheel, 0x0b0e16);
      dark.add(wheel, matrix.makeTranslation(bx, cfg.wheelRadius, z));
    }

    // --- the rider, STANDING BESIDE IT -----------------------------------
    // Two legs, a torso, a head and one arm up and out. Everything is a
    // tapered cylinder, because at six metres a limb is a shape and nothing
    // more - the same reasoning the crowd is built on.
    const rider = cfg.rider;
    const rx = rider.standX;
    const tint2 = new THREE.Color(rider.color);

    for (const side of [-1, 1]) {
      const leg = new THREE.CylinderGeometry(
        rider.hips * 0.52, rider.hips * 0.72, rider.legs, 5, 1,
      );
      paintVertices(leg, tint2);
      dark.add(leg, matrix.makeTranslation(
        rx + side * rider.hips * 0.55, rider.legs * 0.5, 0,
      ));
    }

    const torsoHeight = rider.height - rider.legs - rider.head * 2;
    const torso = new THREE.CylinderGeometry(
      rider.shoulders * 0.5, rider.hips * 0.9, torsoHeight, 6, 1,
    );
    paintVertices(torso, tint2);
    dark.add(torso, matrix.makeTranslation(rx, rider.legs + torsoHeight * 0.5, 0));

    const head = new THREE.SphereGeometry(rider.head, 10, 8);
    paintVertices(head, tint2);
    dark.add(head, matrix.makeTranslation(
      rx, rider.legs + torsoHeight + rider.head, 0,
    ));

    // THE ARM, and it is the single most important shape in the scene. Up
    // and OUT, so it is against the sky rather than against the torso.
    const shoulderY = rider.legs + torsoHeight * 0.92;
    const arm = new THREE.CylinderGeometry(
      rider.hips * 0.3, rider.hips * 0.34, rider.armLength, 5, 1,
    );
    paintVertices(arm, tint2);
    arm.rotateZ(-rider.armOut);
    dark.add(arm, matrix.makeTranslation(
      rx + Math.sin(rider.armOut) * rider.armLength * 0.5,
      shoulderY + Math.cos(rider.armOut) * rider.armLength * 0.5,
      0,
    ));

    // The other arm, down and relaxed, so the figure is not one-sided.
    const idle = new THREE.CylinderGeometry(
      rider.hips * 0.28, rider.hips * 0.32, rider.armLength * 0.86, 5, 1,
    );
    paintVertices(idle, tint2);
    idle.rotateZ(0.22);
    dark.add(idle, matrix.makeTranslation(
      rx - rider.shoulders * 0.52,
      shoulderY - rider.armLength * 0.42,
      0,
    ));

    // --- the rim light ---------------------------------------------------
    // Thin bars along the flanks and across the tail. Not an outline shader:
    // a merged edge costs nothing and cannot break when the camera moves.
    // THE CHOSEN BIKE'S OWN PAINT. `config.paint` is what Selection.applyBike
    // patched in, and the celebration is BUILT LAZILY - on the first finish,
    // after a bike has been chosen - so reading it here gets the machine that
    // was actually ridden rather than the default.
    const paint = config.paint && config.paint.body ? config.paint.body : 0x2de3ff;
    const tint = new THREE.Color(paint).multiplyScalar(cfg.rimIntensity);
    const rim = cfg.rimWidth;
    for (const sign of [-1, 1]) {
      const edge = new THREE.BoxGeometry(rim, rim, cfg.length * 0.72);
      paintVertices(edge, tint);
      lit.add(edge, matrix.makeTranslation(
        bx + sign * cfg.width * 0.46, cfg.height * 0.5, 0,
      ));
    }
    // A tail light across the back. The one thing on a motorcycle that is
    // genuinely bright from behind.
    const tail = new THREE.BoxGeometry(cfg.width * 0.8, rim * 1.6, rim);
    paintVertices(tail, new THREE.Color(0xff2a3c).multiplyScalar(0.9));
    lit.add(tail, matrix.makeTranslation(bx, cfg.height * 0.56, cfg.length * 0.4));

    // A lit line up the fairing, so the front has an edge too.
    const nose = new THREE.BoxGeometry(rim, cfg.height * 0.5, rim);
    paintVertices(nose, tint);
    lit.add(nose, matrix.makeTranslation(bx, cfg.height * 0.66, -cfg.length * 0.3));

    // AND A LINE ALONG THE TOP, which is what draws the machine's length
    // from a three quarter angle. The flank bars read end on; this one reads
    // from the side, and the side is the angle now.
    const spine = new THREE.BoxGeometry(rim * 0.9, rim * 0.9, cfg.length * 0.6);
    paintVertices(spine, tint);
    lit.add(spine, matrix.makeTranslation(bx, cfg.height * 0.78, -cfg.length * 0.02));

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
