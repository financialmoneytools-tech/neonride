import * as THREE from 'three';
import { config } from '../../../config.js';
import { Input } from '../../../core/Input.js';
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
 * ONE IMAGE PER HAND. It was one image mirrored to begin with, which is
 * geometrically what a left hand is, and it is not what these drawings are:
 * each is posed on its own bar with its own lever and its own switch block, so
 * neither is the other's reflection. Two textures, no flip, and the material
 * can go back to single sided - a mirrored plane has a negative determinant and
 * shows its back face, which is the only reason it was double sided before.
 *
 * Each image carries the grip, the bar end, the lever and the switch block
 * along with the hand. That is deliberate: the join between a 2D hand and a 3D
 * bar is the thing that would give the trick away, and there is no join if the
 * bar ends inside the picture. It is also why the 3D grip, lever and bar end
 * are no longer built - see Handlebar.js and bike/Controls.js.
 *
 * ASPECT comes off each texture once it has loaded, not out of config. A number
 * written down beside an image is a number that can disagree with it, and the
 * cost of disagreeing is a stretched hand nobody thinks to check.
 *
 * THROTTLE AND BRAKE are answered differently on purpose. Braking moves the
 * FINGERS - they leave the grip and pull the lever - and no transform does
 * that, so it is a second drawing swapped in. Throttle only rolls the wrist
 * about the bar, which is a rotation, and the sprite is a plane in 3D rather
 * than a picture in 2D, so it can turn about the real grip axis. Asking for a
 * drawn frame for it would have been asking for something already available.
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
const _roll = new THREE.Quaternion();
const _axis = new THREE.Vector3();
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();

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

  const geometry = new THREE.PlaneGeometry(1, 1);
  const loader = new THREE.TextureLoader();
  const hands = [];

  for (const side of [SIDE_RIGHT, SIDE_LEFT]) {
    const key = side === SIDE_RIGHT ? 'right' : 'left';

    const texture = loader.load(cfg.url[key], (loaded) => {
      // The plane is sized from the image it ended up carrying, so a redrawn
      // sprite of a different shape needs no config change and cannot be
      // stretched by one that was not updated with it.
      const image = loaded.image;
      hand.aspect = image.width / image.height;
    });
    texture.name = 'glove-' + key;
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
      // everything drawn after it. Tested but not written is what a sprite
      // wants: the fairing in front of it still covers it, and nothing behind
      // it shows through the parts of the image that are not the hand.
      depthWrite: false,
      // The rest of the cockpit is unlit and untone-mapped, and the composer
      // applies ACES once at the end. Mapping this on the way in as well would
      // wash the artwork out against everything beside it.
      toneMapped: false,
      fog: false,
    });
    material.name = 'RiderGlove';

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'Rider_glove';
    mesh.frustumCulled = false;
    mesh.renderOrder = cfg.renderOrder;

    // Placed at a point on the grip, in the frame the grip itself defines, so
    // the hand inherits the bar's own position. The anchor frame for the left
    // side carries a reflection; the position is taken from it and the rotation
    // is not, because a billboard is about to overwrite any rotation anyway.
    const root = gripAnchorFrame(anchor, SIDE_RIGHT, new THREE.Matrix4());
    const offset = cfg.offset[key];
    mesh.position.setFromMatrixPosition(root);
    mesh.position.x = mesh.position.x * side + offset[0] * side;
    mesh.position.y += offset[1];
    mesh.position.z += offset[2];

    const hand = { mesh, material, texture, key, aspect: 1, side, rest: mesh.position.clone() };
    hands.push(hand);
    group.add(mesh);

    // The right hand has a second frame for braking. Loaded up front rather
    // than on first use: a texture arriving mid-corner would show as a blank
    // hand for however long the fetch took.
    if (side === SIDE_RIGHT) {
      hand.neutralMap = texture;
      hand.brakeMap = loader.load(cfg.url.rightBrake);
      hand.brakeMap.name = 'glove-right-brake';
      hand.brakeMap.colorSpace = THREE.SRGBColorSpace;
      hand.brakeMap.anisotropy = 4;
      hand.brakeMap.wrapS = THREE.ClampToEdgeWrapping;
      hand.brakeMap.wrapT = THREE.ClampToEdgeWrapping;
      hand.braking = false;
    }
  }

  const meshes = hands.map((h) => h.mesh);

  // The grip's own axis, pointing outboard. Throttle turns the hand about this
  // and nothing else does, so it is worked out once.
  _from.fromArray(anchor.from);
  _to.fromArray(anchor.to);
  const gripAxis = _to.sub(_from).normalize().clone();
  let throttle = 0;

  return {
    group,
    meshes,

    /**
     * Turns the planes back to face the camera, less whatever share of the bar
     * they are asked to follow.
     */
    update(dt, state) {
      const live = config.player.rider.hand.sprite;
      const input = state && state.input;

      _inverse.copy(rig.steering.quaternion).invert();
      _inverse.slerp(_identity, live.followSteer);

      // Damped, so a stab at the throttle rolls the wrist rather than snapping
      // it, and so the hand keeps moving for a moment after the input stops.
      throttle = Input.damp(throttle, input ? input.throttle : 0, live.throttle.tau, dt || 0);
      const roll = throttle * live.throttle.roll;
      _roll.setFromAxisAngle(gripAxis, roll);

      const brake = input ? input.brake : 0;

      for (let i = 0; i < hands.length; i++) {
        const hand = hands[i];
        const width = live.width[hand.key] * rig.framing.handScale;

        hand.mesh.quaternion.copy(_inverse);
        hand.mesh.scale.set(width, width / hand.aspect, 1);

        if (hand.side !== SIDE_RIGHT) continue;

        // Only the right wrist turns a throttle, so only the right hand rolls
        // and shifts. Premultiplied, because the roll happens about an axis in
        // the RIG's space, not in the plane's own.
        hand.mesh.quaternion.premultiply(_roll);
        const shift = live.throttle.offset;
        hand.mesh.position.set(
          hand.rest.x + shift[0] * throttle,
          hand.rest.y + shift[1] * throttle,
          hand.rest.z + shift[2] * throttle,
        );

        // Two thresholds rather than one, so an input resting on the boundary
        // cannot flicker the hand between frames.
        const bars = live.brake;
        if (hand.braking ? brake < bars.off : brake > bars.on) {
          hand.braking = !hand.braking;
          hand.material.map = hand.braking ? hand.brakeMap : hand.neutralMap;
          hand.material.needsUpdate = true;
        }
      }
    },

    dispose() {
      geometry.dispose();
      for (let i = 0; i < hands.length; i++) {
        hands[i].material.dispose();
        hands[i].texture.dispose();
        if (hands[i].brakeMap) hands[i].brakeMap.dispose();
      }
      group.clear();
    },
  };
}
