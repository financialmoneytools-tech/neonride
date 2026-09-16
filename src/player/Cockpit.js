import * as THREE from 'three';
import { config } from '../config.js';
import { Input } from '../core/Input.js';
import { motionScale } from '../core/Comfort.js';
import { Instruments } from './rider/Instruments.js';

/**
 * Cockpit - the whole bike as one photographic sprite, drawn over the scene.
 *
 * It replaces Rider outright: hands, bars, grips, levers, mirrors, screen,
 * fairing, tank, triple clamp and forks are all in the photograph. Rider still
 * exists and still builds all of that; which one runs is
 * config.player.cockpit.source, so the primitive cockpit is one word away.
 *
 * WHY. The primitive cockpit took roughly fifty passes and never composed. The
 * failure was never a part - each one could be measured and placed correctly -
 * it was that parts built independently have no relationships, and a cockpit is
 * nothing but relationships: what is in front of what, how big each thing is
 * against its neighbour, where the eye is told to look. A photograph has all of
 * them for free and cannot get them wrong.
 *
 * It is a PLANE PARENTED TO THE CAMERA rather than a DOM overlay or a second
 * render pass. That puts it inside the composer, so it takes the same bloom and
 * vignette as everything else - which is the whole question being asked here,
 * whether a photoreal cockpit can live in a stylised neon frame. Answering it
 * with a cleanly composited overlay that skips the grade would answer a
 * different question.
 *
 * Sized to COVER the frame width and anchored to the bottom. The two sources
 * are within one per cent of their aspects - 1.792 against 16:9 and 0.558
 * against 9:16 - so the mismatch lands as a sliver of transparent sky at the
 * top, not as a gap at the bottom where the tank has to meet the frame edge.
 *
 * DEPTH IS NOT USED. depthTest is off and the draw order decides: the cluster
 * first, the photograph over it, so the photograph's own bezel composites on
 * top of our dash the way it composited over the display it came with. The
 * plane still has to sit past the near plane to survive clipping, which is what
 * `distance` is for; nothing else about it matters.
 */
export class Cockpit {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {import('../core/Framing.js').Framing} framing
   */
  constructor(camera, framing) {
    this.camera = camera;
    this.framing = framing;
    const cfg = config.player.cockpit;

    this.group = new THREE.Group();
    this.group.name = 'Cockpit';
    camera.add(this.group);

    this.geometry = new THREE.PlaneGeometry(1, 1);
    const loader = new THREE.TextureLoader();

    // One texture per aspect, both loaded up front. Fetching the second one the
    // first time a window is dragged past square would drop the cockpit out of
    // the frame for as long as the request took.
    // ONE TEXTURE. There were two, one per aspect, with a selector that picked
    // by frame shape; the game is landscape only now and all of that is gone.
    //
    // aspectOf comes off the TEXTURE, never out of config. It was written into
    // config and read back from a copy that had already overwritten it, so the
    // image's own shape was measured, stored where nothing looked, and thrown
    // away - a silent 19 per cent stretch the moment a source stopped matching
    // the number beside it.
    this.aspectOf = 16 / 9;
    this.texture = loader.load(cfg.url, (loaded) => {
      this.aspectOf = loaded.image.width / loaded.image.height;
      this._place();
    });
    this.texture.name = 'cockpit';
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      // The composer applies ACES once at the end for the whole frame. Mapping
      // the photograph on the way in as well would grade it twice, and not
      // grading it is the point of this pass.
      toneMapped: false,
      fog: false,
    });
    this.material.name = 'CockpitSprite';

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'Cockpit_sprite';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = cfg.renderOrder;
    this.mesh.visible = false; // until a texture has arrived and been sized
    this.group.add(this.mesh);

    // THE LIVE CLUSTER, in the hole cut out of the photograph. Instruments is
    // reused whole - it owns the canvas, the dash drawing and the update
    // throttle - but only its TEXTURE is taken. Its own meshes are a box and a
    // bezel built for the primitive rig, and here the photograph is the bezel.
    this.instruments = new Instruments();
    this.clusterMaterial = new THREE.MeshBasicMaterial({
      map: this.instruments.texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });
    this.clusterMaterial.name = 'CockpitCluster';
    this.cluster = new THREE.Mesh(this.geometry, this.clusterMaterial);
    this.cluster.name = 'Cockpit_cluster';
    this.cluster.frustumCulled = false;
    // BEFORE the photograph, so the photograph draws over it.
    this.cluster.renderOrder = cfg.renderOrder - 1;
    this.cluster.visible = false;
    this.group.add(this.cluster);

    this._ready = true;
    this._steer = 0;
    // Filled by _place, read by the sway in update: the frame's half extents
    // and where the roll pivot ended up.
    this._halfWidth = 0;
    this._pivotY = 0;
    this._place();
  }

  /** Sizes and positions the plane and the cluster for the current frame. */
  _place() {
    // NOT YET BUILT. The load callback calls this, and a texture already in
    // three's cache can call back inside the constructor, before the material
    // and the meshes it touches exist. One flag set at the end covers every
    // ordering; guarding on the last field that happened to be missing does
    // not, which is how this bit twice - first on this.profiles, then on
    // this.material once the profiles moved above the material.
    if (!this._ready) return;
    const cfg = config.player.cockpit;
    const aspect = this.framing.aspect;
    if (!Number.isFinite(aspect) || aspect <= 0) return;

    const distance = cfg.distance;
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) * 0.5) * distance;
    const halfWidth = halfHeight * aspect;

    // DRIVEN BY THE FRAME'S HEIGHT. The width then follows the image's own
    // aspect, so the drawing is never stretched by a number written beside it.
    //
    // It was the other way round - sized to cover the frame WIDTH, height
    // following the texture - and that is the bug that came back twice. Width
    // driven, the plane's share of the frame height is aspect / imageAspect, so
    // it grows with every pixel of extra window width: 99.2 per cent of the
    // frame's height at 16:9, 112.2 at 2:1, 130.2 at 21:9. The cockpit is
    // bolted to a bike and does not get bigger because the monitor is wider.
    //
    // The cost is that the plane no longer reaches the frame's sides - see the
    // note on heightScale in config/cockpit.js. That is a property of a 1.79
    // drawing, not of this sizing rule.
    const height = halfHeight * 2 * cfg.heightScale;
    const width = height * this.aspectOf;

    const spriteX = cfg.offset[0] * halfWidth;
    const spriteY = -halfHeight + height * 0.5 + cfg.offset[1] * halfHeight;

    // The GROUP sits on the roll pivot and the meshes hang off it, so rotating
    // the group swings the cockpit about that point rather than spinning it
    // about the middle of the picture. The pivot is the cluster's own centre,
    // dropped a little - see sway.pivotDrop.
    const [su0, sv0, su1, sv1] = cfg.screen;
    const pivotX = spriteX + ((su0 + su1) * 0.5 - 0.5) * width;
    const pivotY = spriteY + (0.5 - (sv0 + sv1) * 0.5) * height
      - cfg.sway.pivotDrop * height;
    this._halfWidth = halfWidth;
    this._pivotY = pivotY;
    this.group.position.set(pivotX, pivotY, -distance);
    this._pivotX = pivotX;

    this.mesh.scale.set(width, height, 1);
    this.mesh.position.set(spriteX - pivotX, spriteY - pivotY, 0);
    this.mesh.visible = true;

    // The hole, in the photograph's own texture coordinates, carried onto the
    // plane. Both are the same rectangle by construction - cut-cockpit.py
    // punches the alpha from the same numbers - so the dash cannot drift out of
    // the surround the way it would if each were placed on its own.
    const [u0, v0, u1, v1] = cfg.screen;
    this.cluster.scale.set((u1 - u0) * width, (v1 - v0) * height, 1);
    this.cluster.position.set(
      this.mesh.position.x + ((u0 + u1) * 0.5 - 0.5) * width,
      this.mesh.position.y + (0.5 - (v0 + v1) * 0.5) * height,
      0,
    );
    this.cluster.visible = true;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads rpm, gear and speed
   */
  update(dt, state) {
    this._place();

    const sway = config.player.cockpit.sway;
    // Damped, because state.steer is the raw input and a stab at the bars would
    // otherwise snap the whole cockpit sideways in one frame. state.lean has
    // already been through leanTau, so it arrives smooth.
    this._steer = Input.damp(this._steer, (state && state.steer) || 0, sway.tau, dt || 0);
    const lean = (state && state.lean) || 0;

    // One scale for the whole response, so reduced motion cannot turn the roll
    // down and leave the shift at full size.
    const comfort = motionScale('cockpitSway');
    // NEGATIVE, which is the same direction bike/view.js rolls the camera: it
    // sets camera.rotation.z to -lean, and lean is positive for a right turn.
    // Rolling the sprite the other way would have it fighting the bank and
    // trying to stay level with the horizon, which is what a gimbal looks like,
    // not a motorcycle. This way the machine banks further than the view does.
    this.group.rotation.z = -(lean * sway.leanRoll + this._steer * sway.steerRoll) * comfort;
    this.group.position.x = this._pivotX
      + this._steer * sway.steerShift * this._halfWidth * comfort;

    this.instruments.update(dt, state);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.clusterMaterial.dispose();
    this.texture.dispose();
    this.instruments.dispose();
    this.group.clear();
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
