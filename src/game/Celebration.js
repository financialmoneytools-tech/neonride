import * as THREE from 'three';
import { config } from '../config.js';
import { motionScale } from '../core/Comfort.js';
import { Arena } from '../world/celebration/Arena.js';
import { Crowd } from '../world/celebration/Crowd.js';
import { PodiumBike } from '../world/celebration/PodiumBike.js';
import { Flags } from '../world/celebration/Flags.js';
import { Fireworks } from '../world/celebration/Fireworks.js';
import { Confetti } from '../world/celebration/Confetti.js';
import { Champagne } from '../world/celebration/Champagne.js';

/**
 * Celebration - the sequence at the end of level ten.
 *
 * It owns the TIMING and the CAMERA and nothing else. Every piece of the
 * scene is its own module and knows only how to be placed, started and
 * updated; this decides when each one happens and where the camera goes to
 * watch. That split is what keeps a seven second cue out of seven files.
 *
 * ================= BUILT LAZILY, ONCE =================
 *
 * Nothing here exists until the first finish. A player who never reaches
 * level ten never pays for a crowd, and - the part that matters - the podium
 * bike bakes the CHOSEN bike's paint into its vertex colours, so building it
 * at boot would paint it before a bike had been picked.
 *
 * ================= IT TAKES THE CAMERA, NOT THE BIKE =================
 *
 * player/bike/view.js places the camera from the bike every frame. Rather
 * than fight it, the celebration runs AFTER it in the loop and moves the
 * camera on top of what it did - the same relationship the recording guard
 * has with the physics. The bike is never touched, never teleported and
 * never told to stop; it rolls to a halt on its own throttle because Session
 * stops feeding it one.
 *
 * ================= COMFORT =================
 *
 * The orbit goes through `motionScale('celebration')`. The lift and the
 * pitch do not: they are how the shot is composed and removing them leaves
 * the camera inside the bike. See config/comfort.js, which says so.
 */
// Scratch, reused every frame. See CLAUDE.md: nothing allocates in the loop.
const _look = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _yaw = new THREE.Quaternion();
const _up = new THREE.Vector3(0, 1, 0);

export class Celebration {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Camera} camera
   * @param {import('../world/road/RoadPath.js').RoadPath} path
   * @param {number} [quality] share of the configured particle counts
   */
  constructor(scene, renderer, camera, path, rider, quality = 1) {
    this.camera = camera;
    this.path = path;
    /** Hidden for the shot; see start(). */
    this.rider = rider;
    /**
     * Which camera option is live. Set from `config.celebration.camera.option`
     * and overridable with `?cam=N`, so three angles can be compared without
     * a rebuild between them.
     */
    this.option = config.celebration.camera.option;

    this.arena = new Arena(scene);
    this.crowd = new Crowd(scene, quality);
    this.bike = new PodiumBike(scene);
    this.flags = new Flags(scene);
    this.fireworks = new Fireworks(scene, renderer, camera, quality);
    this.confetti = new Confetti(scene, renderer, camera, quality);
    this.champagne = new Champagne(scene, renderer, camera, quality);

    this.running = false;
    this.time = 0;

    this._podium = new THREE.Vector3();
    this._rotation = new THREE.Quaternion();
    /** The arena's turn, plus the camera's azimuth. */
    this._behind = new THREE.Quaternion();
    this._aim = new THREE.Vector3();
    this._offset = new THREE.Vector3();
  }

  /**
   * Places the arena down the road and starts the sequence.
   * @param {object} state shared loop state; reads distance
   */
  start(state) {
    const timing = config.celebration.timing;
    const distance = (state.distance || 0) + timing.podiumAt;

    const top = this.arena.placeAt(this.path, distance);
    this._podium.copy(top);
    this._rotation.copy(this.arena.group.quaternion);

    // The arena's frame turned to face the camera, for everything that has to
    // be behind the podium in shot rather than behind it on the road.
    _yaw.setFromAxisAngle(_up, this.awayYaw);
    this._behind.copy(this._rotation).multiply(_yaw);

    this.crowd.placeAt(this.arena.group.position, this._behind);
    this.bike.placeAt(top, this._behind);
    this.flags.placeAt(this.arena.group.position, this._behind);

    this.time = 0;
    this.running = true;
    this._firing = false;
    // THE COCKPIT IS A FIRST PERSON PROP and this is not a first person shot.
    // It is a child of the camera, so it follows the crane up and sits in
    // front of the podium - a pair of gloves floating over the machine they
    // are supposed to be riding.
    if (this.rider && this.rider.group) this.rider.group.visible = false;
    this._confetting = false;
    this._spraying = false;
  }

  stop() {
    this.running = false;
    if (this.rider && this.rider.group) this.rider.group.visible = true;
    this.arena.hide();
    this.crowd.hide();
    this.bike.hide();
    this.flags.hide();
    this.fireworks.stop();
    this.confetti.stop();
    this.champagne.stop();
  }

  /** @returns {object} the live camera option. */
  get view() {
    const cam = config.celebration.camera;
    const options = cam.options;
    const index = Math.max(0, Math.min(options.length - 1, this.option | 0));
    return options[index];
  }

  /**
   * The yaw that turns the arena's frame into the CAMERA'S frame.
   *
   * Everything that has to sit BEHIND the podium in shot - the crowd, the
   * fireworks - is placed along the arena's +z and then turned by this, so
   * moving the camera round moves them with it. Without it, a three quarter
   * camera looks straight past the podium at an empty road with the crowd
   * somewhere off to the left.
   *
   * @returns {number} radians
   */
  get awayYaw() {
    return -this.view.azimuth;
  }

  /** @returns {boolean} whether the sequence has run its full length. */
  get finished() {
    return this.time >= config.celebration.timing.holdSeconds;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state
   */
  update(dt, state) {
    if (!this.running) return;
    const cfg = config.celebration;
    const timing = cfg.timing;
    this.time += dt;

    // Each cue fires ONCE, on the first frame past its time. Started rather
    // than sampled, so a dropped frame delays a cue instead of skipping it.
    if (!this._firing && this.time >= timing.fireworksAt) {
      this._firing = true;
      this.fireworks.start(this._podium, this._behind);
    }
    if (!this._confetting && this.time >= timing.confettiAt) {
      this._confetting = true;
      this.confetti.start(this._podium);
    }
    if (!this._spraying && this.time >= timing.champagneAt) {
      this._spraying = true;
      this.champagne.start(this._podium, this._behind);
    }

    this.crowd.update(dt);
    this.flags.update(dt);
    this.fireworks.update(dt, state);
    this.confetti.update(dt);
    this.champagne.update(dt);

    this._placeCamera();
  }

  /**
   * Moves the camera to watch the podium.
   *
   * IT EASES IN FROM WHEREVER THE RIDE LEFT IT rather than cutting. The whole
   * point of putting the arena on the road is that this is one continuous
   * shot, and a cut to a podium camera throws that away on the one frame
   * anybody would post.
   */
  _placeCamera() {
    const cam = config.celebration.camera;
    const view = this.view;
    const timing = config.celebration.timing;

    // 0 while the bike is still rolling in, 1 once the crane has finished.
    const t = THREE.MathUtils.clamp(
      (this.time - timing.slowSeconds) / Math.max(0.01, timing.craneSeconds), 0, 1,
    );
    // Smoothstep, so the move has no corner at either end.
    const ease = t * t * (3 - 2 * t);
    if (ease <= 0) return;

    // The orbit rides ON TOP of the chosen azimuth rather than replacing it,
    // so a three quarter view drifts around three quarters instead of
    // swinging back through dead astern.
    const orbit = view.azimuth
      + Math.sin(this.time * cam.orbit) * cam.orbitAmount * motionScale('celebration');

    this._offset.set(Math.sin(orbit) * view.back, view.lift, -Math.cos(orbit) * view.back);
    this._offset.applyQuaternion(this._rotation);

    const wanted = this._aim.copy(this._podium).add(this._offset);
    this.camera.position.lerp(wanted, ease);

    // Looks at the RIDER rather than the podium's feet, so the machine sits
    // in the middle of the frame with the crowd behind it.
    //
    // THE FRAMING IS A RAISED AIM POINT, NOT A PITCH. It was a pitch applied
    // after the lookAt, which is a contradiction: the lookAt had already put
    // the podium in the centre and -0.30 rad then shoved it seventeen degrees
    // off the bottom of the frame. Photographed as a screen of confetti with
    // no podium in it. Raising what it aims AT composes the same shot and
    // cannot fight itself.
    _look.copy(this._podium);
    _look.y += config.celebration.bike.height * 0.5 + view.aimLift;

    // Scratch objects, not fresh ones. This runs every frame of the shot and
    // the project's rule is that nothing allocates inside the loop.
    _matrix.lookAt(this.camera.position, _look, this.camera.up);
    _quaternion.setFromRotationMatrix(_matrix);
    this.camera.quaternion.slerp(_quaternion, ease);
  }

  dispose() {
    this.arena.dispose();
    this.crowd.dispose();
    this.bike.dispose();
    this.flags.dispose();
    this.fireworks.dispose();
    this.confetti.dispose();
    this.champagne.dispose();
  }
}
