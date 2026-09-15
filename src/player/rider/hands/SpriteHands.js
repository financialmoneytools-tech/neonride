import * as THREE from 'three';
import { config } from '../../../config.js';
import { gripAnchorFrame, SIDE_LEFT, SIDE_RIGHT } from './anchors.js';

/**
 * SpriteHands - the gloved hands as two camera facing planes.
 *
 * Six passes were spent building this hand as geometry, first out of primitives
 * and then out of lofted sections, and none of them read as a hand. The
 * approach was wrong, not the numbers. A first person hand barely rotates, so
 * the geometry bought nothing, and every pass was really an attempt to infer a
 * shape whose PROJECTION would look right. A sprite is the projection.
 *
 * ONE IMAGE, MIRRORED. The right hand is the artwork as drawn and the left is
 * the same texture with the plane flipped in x, which is what a left hand is.
 * The flip makes the plane's matrix determinant negative and turns its triangles
 * inside out, so the material is double sided - cheap on two quads, and the
 * alternative is a second texture that can drift out of step with the first.
 *
 * The image carries the grip, the bar end, the brake lever and the switch block
 * along with the hand. That is deliberate: the join between a 2D hand and a 3D
 * bar is the thing that would give the trick away, and there is no join if the
 * bar ends inside the picture. It is also why the 3D grip, lever and bar end
 * are no longer built - see Handlebar.js and bike/Controls.js.
 *
 * ATTACHMENT. The plane hangs off the same group the geometry hands did, so it
 * TRANSLATES with the bars for free and there is nothing to keep in sync. Only
 * its orientation is computed, and only against one rotation: the rig is bolted
 * to the camera and nothing between the camera and the plane turns except the
 * steering group, so facing the camera is exactly cancelling that. followSteer
 * slews back toward it - 0 is a pure billboard, 1 is welded to the bar - which
 * is the difference between a hand sliding across the frame and a hand that
 * leans with what it is holding.
 */

const _identity = new THREE.Quaternion();
const _inverse = new THREE.Quaternion();

/**
 * @param {object} anchor config.player.rider.anchors.rightGrip
 * @param {{steering: THREE.Group,
 *          framing: import('../../../core/Framing.js').Framing}} rig
 * @returns {import('../Hands.js').HandSet}
 */
export function createSpriteHands(anchor, rig) {
  const cfg = config.player.rider.hand.sprite;

  const group = new THREE.Group();
  group.name = 'Hands';

  const texture = new THREE.TextureLoader().load(cfg.url);
  texture.name = 'glove';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  // The artwork is drawn to its own edges; clamping stops the far side of the
  // image bleeding in when it is sampled at the very edge of the plane.
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    // Written to the depth buffer it would punch a transparent hole through
    // everything drawn after it. Tested but not written is what a sprite wants:
    // the fairing in front of it still covers it, and nothing behind it shows
    // through the parts of the image that are not the hand.
    depthWrite: false,
    side: THREE.DoubleSide,
    // The rest of the cockpit is unlit and untone-mapped, and the composer
    // applies ACES once at the end. Mapping this on the way in as well would
    // wash the artwork out against everything beside it.
    toneMapped: false,
    fog: false,
  });
  material.name = 'RiderGlove';

  const geometry = new THREE.PlaneGeometry(1, 1);
  const meshes = [];

  for (const side of [SIDE_RIGHT, SIDE_LEFT]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'Rider_glove';
    mesh.frustumCulled = false;
    // Drawn after the cockpit, so the transparent pass has the opaque geometry
    // it has to sort against already in the buffer.
    mesh.renderOrder = cfg.renderOrder;

    // Placed at a point on the grip, in the frame the grip itself defines, so
    // the hand inherits the bar's own angle and position. The anchor frame for
    // the left side carries a reflection; the plane is flipped rather than
    // parented under it, because a billboard has to stay square to the camera
    // and cannot inherit a rotation it is about to overwrite.
    const root = gripAnchorFrame(anchor, SIDE_RIGHT, new THREE.Matrix4());
    mesh.position.setFromMatrixPosition(root);
    mesh.position.x *= side;
    mesh.position.x += cfg.offset[0] * side;
    mesh.position.y += cfg.offset[1];
    mesh.position.z += cfg.offset[2];


    group.add(mesh);
    meshes.push(mesh);
  }

  return {
    group,
    meshes,

    /**
     * Turns the planes back to face the camera, less whatever share of the bar
     * they are asked to follow.
     */
    update() {
      const live = config.player.rider.hand.sprite;
      _inverse.copy(rig.steering.quaternion).invert();
      _inverse.slerp(_identity, live.followSteer);

      // Size is resolved per frame rather than once, because it is per aspect:
      // the hands are the one part of the cockpit sized to READ rather than to
      // scale with the camera, and a tall frame needs them bigger to hold the
      // same share of the picture.
      const width = live.width * rig.framing.handScale;
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        mesh.quaternion.copy(_inverse);
        mesh.scale.set(width * (i === 0 ? 1 : -1), width / live.aspect, 1);
      }
    },

    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
      group.clear();
    },
  };
}
