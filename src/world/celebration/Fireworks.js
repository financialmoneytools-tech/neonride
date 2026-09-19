import * as THREE from 'three';
import { config } from '../../config.js';
import { createRng } from '../../utils/rng.js';

const _size = new THREE.Vector2();

/**
 * Fireworks - the whole sky, in one draw call.
 *
 * ONE THREE.Points, ONE BUFFER, NOTHING SPAWNED. The pattern is
 * world/Weather.js: the particles exist from construction and a "burst" is a
 * slice of them being handed a new origin, a new velocity and a new birth
 * time. Nothing is created after the constructor, which is the project's rule
 * and also the only way a firework can be free - allocating a shell per burst
 * is how a celebration becomes the frame that drops.
 *
 * THEY COST ZERO TRIANGLES. gl.POINTS never reaches the triangle counter, so
 * the entire particle side of the celebration is free in geometry terms and
 * expensive only in FILL. That is the number to watch on a phone, and it is
 * why the count halves on the low preset.
 *
 * ================= THE BLOOM EXCEPTION =================
 *
 * CLAUDE.md says every lit thing on the road stays at or under 0.45, below
 * `postprocess.bloom.threshold`, so neon contributes nothing to the bloom
 * pass. These deliberately break that, and it is the ONLY thing in the
 * project that does.
 *
 * The rule exists for a ten minute ride at 220 km/h, where a frame hazed with
 * glow is what becomes tiring. This is a six second held shot at the end of
 * one, and a firework that does not bloom is not a firework - it is a dot.
 * The exception is scoped to this class and config/celebration.js states it.
 *
 * WHAT IS NOT NEGOTIABLE, even here: bursts are slow and irregular, well
 * outside the 3-30 Hz photosensitivity band, and no burst may cover more than
 * `maxArea` of the frame. That is an app store requirement, not a preference.
 */

const VERTEX_SHADER = `
  attribute vec3 aVelocity;
  attribute float aBirth;
  attribute float aLife;
  attribute float aSeed;
  attribute vec3 aTint;

  uniform float uTime;
  uniform float uGravity;
  uniform float uSize;
  uniform float uPixelsPerUnit;

  varying vec3 vTint;
  varying float vFade;

  void main() {
    float age = uTime - aBirth;
    // Dead, or not yet born. Collapsed to nothing rather than branched away:
    // a point of size zero is not rasterised, which is cheaper than any
    // discard in the fragment stage.
    if (age < 0.0 || age > aLife) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vFade = 0.0;
      vTint = vec3(0.0);
      return;
    }

    float t = age / aLife;

    // Ballistic, with a little drag so the tails curl instead of running
    // straight out. The drag is a cheap exponential on the velocity term
    // rather than an integration, which at this scale is the same picture.
    float drag = 1.0 - exp(-age * 1.1);
    vec3 offset = aVelocity * drag / 1.1;
    offset.y += 0.5 * uGravity * age * age;

    vec4 mvPosition = modelViewMatrix * vec4(position + offset, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depth = max(0.1, -mvPosition.z);
    // Twinkle, so a shell does not read as a solid disc of dots. Seeded per
    // particle so the whole burst does not pulse together.
    float twinkle = 0.75 + 0.25 * sin(uTime * 22.0 + aSeed * 43.0);
    gl_PointSize = uSize * uPixelsPerUnit * twinkle / depth;

    // Bright at the front of the life, falling away to nothing. Squared, so
    // most of the life is spent dim and the burst reads as a flash with a
    // tail rather than as a slab of light that switches off.
    float fade = 1.0 - t;
    vFade = fade * fade;
    vTint = aTint;
  }
`;

const FRAGMENT_SHADER = `
  uniform float uIntensity;

  varying vec3 vTint;
  varying float vFade;

  void main() {
    if (vFade <= 0.0) discard;
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = dot(d, d) * 4.0;
    if (r > 1.0) discard;
    // A hot core with a soft edge. Not a gaussian: what survives being
    // averaged down to two pixels is the mean, and a falloff that is mostly
    // near zero has a mean near zero - the same lesson the traffic glow
    // texture is built around.
    float core = 1.0 - r * r;
    gl_FragColor = vec4(vTint * uIntensity * core * vFade, core * vFade);
  }
`;

export class Fireworks {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [quality] share of the configured count to build, so the
   *   low preset halves the fill cost without a second set of numbers
   */
  constructor(scene, renderer, camera, quality = 1) {
    this.renderer = renderer;
    this.camera = camera;
    const cfg = config.celebration.fireworks;
    this.cfg = cfg;
    this.rng = createRng(4471);

    this.count = Math.max(64, Math.round(cfg.count * quality));
    // Particles per burst, so a burst is a contiguous slice of the buffer and
    // rewriting one touches one range rather than the whole thing.
    this.perBurst = Math.max(16, Math.floor(this.count / cfg.bursts));
    this.count = this.perBurst * cfg.bursts;

    const position = new Float32Array(this.count * 3);
    const velocity = new Float32Array(this.count * 3);
    const tint = new Float32Array(this.count * 3);
    const birth = new Float32Array(this.count);
    const life = new Float32Array(this.count);
    const seed = new Float32Array(this.count);

    // Born already dead, so nothing is on screen until the first burst.
    for (let i = 0; i < this.count; i++) {
      birth[i] = -1000;
      life[i] = 1;
      seed[i] = this.rng.next();
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    this.geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocity, 3));
    this.geometry.setAttribute('aTint', new THREE.BufferAttribute(tint, 3));
    this.geometry.setAttribute('aBirth', new THREE.BufferAttribute(birth, 1));
    this.geometry.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    // The bursts move around a fixed arena, so a bounding sphere computed
    // from the buffer would be wrong the moment one goes off somewhere else.
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uGravity: { value: cfg.gravity },
        uSize: { value: cfg.size },
        uPixelsPerUnit: { value: 300 },
        uIntensity: { value: cfg.intensity },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = 'Fireworks';
    this.points.frustumCulled = false;
    this.points.visible = false;
    scene.add(this.points);

    this.time = 0;
    this._nextBurst = 0;
    this._slot = 0;
    this._origin = new THREE.Vector3();
    this._rotation = new THREE.Quaternion();
    this._offset = new THREE.Vector3();
    this._running = false;
  }

  /**
   * Starts the display around a point.
   * @param {THREE.Vector3} origin where the podium is
   * @param {THREE.Quaternion} rotation the arena's own turn, so the spread is
   *   read in the arena's frame rather than in world axes
   */
  start(origin, rotation) {
    this._origin.copy(origin);
    if (rotation) this._rotation.copy(rotation);
    this.time = 0;
    this._nextBurst = 0;
    this._slot = 0;
    this._running = true;
    this.points.visible = true;
  }

  stop() {
    this._running = false;
    this.points.visible = false;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state
   */
  update(dt, state) {
    if (!this._running) return;
    this.time += dt;
    this.material.uniforms.uTime.value = this.time;

    // Pixels per unit, off the drawing buffer and the projection, exactly as
    // world/Weather.js does it - so a spark is the same size on a phone as on
    // a monitor and survives a pixel ratio change without being re-tuned.
    this.renderer.getDrawingBufferSize(_size);
    this.material.uniforms.uPixelsPerUnit.value =
      _size.y * this.camera.projectionMatrix.elements[5] * 0.5;
    void state;

    if (this.time < this._nextBurst) return;
    this._fire();
    const gap = this.cfg.interval;
    this._nextBurst = this.time + this.rng.range(gap[0], gap[1]);
  }

  /** Hands one slice of the buffer a new shell. */
  _fire() {
    const cfg = this.cfg;
    const rng = this.rng;
    const start = this._slot * this.perBurst;
    this._slot = (this._slot + 1) % cfg.bursts;

    // IN THE ARENA'S FRAME, not in world axes. Read in world x/y/z the spread
    // put shells wherever the road happened to be pointing - including
    // directly behind the camera and a couple of metres from the lens, which
    // renders as a blown out white disc over the podium the shot is of.
    // Photographed once. Local +z is away from the camera, which is the only
    // place a shell belongs.
    const spread = cfg.spread;
    this._offset.set(
      rng.range(-spread.x, spread.x),
      rng.range(spread.y[0], spread.y[1]),
      rng.range(spread.z[0], spread.z[1]),
    );
    this._offset.applyQuaternion(this._rotation);
    const ox = this._origin.x + this._offset.x;
    const oy = this._origin.y + this._offset.y;
    const oz = this._origin.z + this._offset.z;

    const colour = new THREE.Color(cfg.colors[Math.floor(rng.next() * cfg.colors.length)]);
    const speed = rng.range(cfg.speed[0], cfg.speed[1]);
    const life = rng.range(cfg.life[0], cfg.life[1]);

    const position = this.geometry.attributes.position.array;
    const velocity = this.geometry.attributes.aVelocity.array;
    const tint = this.geometry.attributes.aTint.array;
    const birth = this.geometry.attributes.aBirth.array;
    const lives = this.geometry.attributes.aLife.array;

    for (let i = 0; i < this.perBurst; i++) {
      const index = start + i;
      const at = index * 3;

      position[at] = ox;
      position[at + 1] = oy;
      position[at + 2] = oz;

      // An even shell rather than a random cloud: random directions bunch at
      // the poles and the burst comes out as a bow tie. This is the standard
      // trick - a uniform z and a free angle gives an even sphere.
      const z = rng.range(-1, 1);
      const angle = rng.next() * Math.PI * 2;
      const r = Math.sqrt(Math.max(0, 1 - z * z));
      // Slightly squashed vertically, so a shell reads as a shell seen from
      // below rather than as a perfect ball.
      const v = speed * rng.range(0.75, 1);
      velocity[at] = Math.cos(angle) * r * v;
      velocity[at + 1] = z * v * 0.85;
      velocity[at + 2] = Math.sin(angle) * r * v;

      tint[at] = colour.r;
      tint[at + 1] = colour.g;
      tint[at + 2] = colour.b;

      birth[index] = this.time;
      lives[index] = life * rng.range(0.8, 1.15);
    }

    // Only the slice that changed is uploaded. A full buffer upload per burst
    // would be the one allocation-shaped cost left in here.
    for (const name of ['position', 'aVelocity', 'aTint']) {
      const attribute = this.geometry.attributes[name];
      attribute.updateRanges = [{ start: start * 3, count: this.perBurst * 3 }];
      attribute.needsUpdate = true;
    }
    for (const name of ['aBirth', 'aLife']) {
      const attribute = this.geometry.attributes[name];
      attribute.updateRanges = [{ start, count: this.perBurst }];
      attribute.needsUpdate = true;
    }
  }

  dispose() {
    if (this.points && this.points.parent) this.points.parent.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
    this.points = null;
  }
}
