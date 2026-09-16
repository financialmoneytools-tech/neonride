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
 * ONE IMAGE, MIRRORED, and it went the other way for a while. Two drawings were
 * tried, one per hand, on the reasoning that each is posed on its own bar with
 * its own lever and switch block. In practice the two never matched: the cuff,
 * the piping and the line weight came out differently every time the second one
 * was generated, and the eye reads two hands side by side as a pair or not at
 * all. A mirrored right arm IS an anatomically correct left arm, and mirroring
 * matches every detail by construction rather than by luck.
 *
 * It is right for the hardware too. Reflected, the brake lever lands where the
 * clutch lever belongs, the bar end goes to the upper left and the switch block
 * ends up inboard - which is where all three are on a real left bar.
 *
 * The cost is one flag: a reflection reverses the winding of every triangle, so
 * the mirrored plane presents its back face and disappears under the default
 * cull. Only the left material is double sided; the right keeps the cheaper
 * front-face-only path.
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
 * THROTTLE AND BRAKE MOVE NOTHING. Braking swaps in a second drawing with the
 * fingers on the lever, and that is the only answer either input gets.
 *
 * Throttle used to roll the plane about the grip axis, which is what a wrist
 * does and is not what this object is. The sprite is ONE RIGID PLANE carrying
 * the hand and the whole forearm, so a transform that turns the hand turns the
 * arm with it - and a forearm swinging while the bike sits still is read as
 * wrong immediately. It was tried about the plane's centre and then about a
 * pivot on the drawn grip axis; the pivot fixed the hand and made the sleeve
 * worse, because a pivot only chooses WHICH end swings. Moving one part of a
 * limb needs the parts to be separate objects, which for this sprite means
 * another drawn frame, the way braking already works.
 *
 * Steering is the exception and stays: see followSteer below. The bars really
 * do rotate when the rider steers, so the arms turning with them as one piece
 * is not an artefact of the sprite being rigid - it is what is happening.
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

/** Colour space, filtering and clamping, the same for every glove texture. */
function prepare(texture, name) {
  texture.name = name;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  // The artwork is drawn to its own edges; clamping stops the far side of the
  // image bleeding in when it is sampled at the very edge of the plane.
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
}

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

  const geometry = new THREE.PlaneGeometry(1, 1);
  const loader = new THREE.TextureLoader();
  const hands = [];

  // ONE IMAGE, MIRRORED. Loaded once and shared by both hands rather than
  // fetched twice: a second TextureLoader.load of the same URL hits the browser
  // cache but still builds a second Texture and uploads a second copy to the
  // GPU, and there is nothing different about it to justify that.
  const glove = loader.load(cfg.url.glove, (loaded) => {
    // The planes are sized from the image they ended up carrying, so a redrawn
    // sprite of a different shape needs no config change and cannot be
    // stretched by one that was not updated with it.
    //
    // And the meshes stay HIDDEN until this runs. Defaulting the aspect to 1
    // and correcting it here meant the first frames after load drew a square
    // hand that then snapped to its real shape - a fraction of a second on a
    // real machine, long enough to see, and long enough to make every
    // measurement taken in that window disagree with the next one.
    const aspect = loaded.image.width / loaded.image.height;
    for (let i = 0; i < hands.length; i++) {
      hands[i].aspect = aspect;
      hands[i].mesh.visible = true;
    }
  });
  prepare(glove, 'glove-right');

  // The right hand's second frame, for braking. Loaded up front rather than on
  // first use: a texture arriving mid-corner would show as a blank hand for
  // however long the fetch took.
  const brake = loader.load(cfg.url.gloveBrake);
  prepare(brake, 'glove-right-brake');

  for (const side of [SIDE_RIGHT, SIDE_LEFT]) {
    const mirrored = side === SIDE_LEFT;

    const material = new THREE.MeshBasicMaterial({
      map: glove,
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
      // The left plane is scaled by a NEGATIVE x, which is a reflection, and a
      // reflection flips the winding of every triangle in it - so the plane
      // presents its back face and vanishes under the default cull. Only the
      // mirrored one pays for that.
      side: mirrored ? THREE.DoubleSide : THREE.FrontSide,
    });
    material.name = mirrored ? 'RiderGloveLeft' : 'RiderGloveRight';

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'Rider_glove';
    mesh.frustumCulled = false;
    mesh.visible = false; // until the texture arrives and its aspect is known
    mesh.renderOrder = cfg.renderOrder;

    // Placed at a point on the grip, in the frame the grip itself defines, so
    // the hand inherits the bar's own position. The anchor frame for the left
    // side carries a reflection; the position is taken from it and the rotation
    // is not, because a billboard is about to overwrite any rotation anyway.
    const root = gripAnchorFrame(anchor, SIDE_RIGHT, new THREE.Matrix4());
    const offset = cfg.offset;
    mesh.position.setFromMatrixPosition(root);
    mesh.position.x = mesh.position.x * side + offset[0] * side;
    mesh.position.y += offset[1];
    mesh.position.z += offset[2];

    const hand = { mesh, material, aspect: 1, side, mirrored, rest: mesh.position.clone() };
    hands.push(hand);
    group.add(mesh);

    if (side === SIDE_RIGHT) {
      hand.neutralMap = glove;
      hand.brakeMap = brake;
      hand.braking = false;
    }
  }

  const meshes = hands.map((h) => h.mesh);


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

      const brake = input ? input.brake : 0;

      for (let i = 0; i < hands.length; i++) {
        const hand = hands[i];
        const width = live.width * rig.framing.handScale;

        hand.mesh.quaternion.copy(_inverse);
        // A NEGATIVE x on the left, which is the mirror. Doing it here rather
        // than by flipping the texture's uv keeps one texture and one geometry
        // shared between both hands; what it costs is the double sided material
        // above, because a reflection reverses the winding.
        hand.mesh.scale.set(hand.mirrored ? -width : width, width / hand.aspect, 1);

        // Pulled toward the centreline by however much this aspect asks for.
        // rest.x carries the side's sign, so subtracting the inset times the
        // side moves both hands inward rather than both the same way.
        hand.mesh.position.set(
          hand.rest.x - rig.framing.handInset * hand.side,
          hand.rest.y,
          hand.rest.z,
        );

        if (hand.side !== SIDE_RIGHT) continue;

        // NOTHING MOVES THE SPRITE FOR THROTTLE OR BRAKE. There was a wrist
        // roll here, about a pivot on the drawn grip axis, and before that the
        // same roll about the plane's centre plus a small translation.
        //
        // Both were wrong for the same reason, and it is not the pivot. A real
        // throttle rolls a WRIST: the hand turns and the forearm stays where it
        // is. This sprite is one rigid plane carrying the hand and the whole
        // forearm together, so any transform that turns the hand turns the arm
        // with it, and an arm swinging against a bike that is not moving is
        // read as wrong instantly. Measured at full throttle, the best version
        // of it still moved the sleeve 28 per cent of the frame.
        //
        // No pivot fixes that, because the problem is that the hand and the arm
        // are the same rigid object. Moving the hand alone needs them to be
        // separate things - a second drawn frame, the way braking is done.
        //
        // So the plane is FROZEN against throttle and brake, and braking stays
        // a texture swap, which moves nothing. Steering still turns both hands,
        // through followSteer above: the bars really do rotate then, and the
        // arms going with them is the one case where this whole sprite moving
        // as one piece is correct.

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
      for (let i = 0; i < hands.length; i++) hands[i].material.dispose();
      // Shared, so disposed once rather than once per hand.
      glove.dispose();
      brake.dispose();
      group.clear();
    },
  };
}
