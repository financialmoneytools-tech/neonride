import * as THREE from 'three';
import { config } from '../../config.js';
import { createRng } from '../../utils/rng.js';

/**
 * Champagne - a spray from the rider, in one draw call.
 *
 * BRAND SAFE BY CONSTRUCTION. There is no bottle here, and there could not
 * be one: the whole thing is a cone of point sprites with a ballistic arc. No
 * label, no shape, no object to put a logo on. It reads as a spray because of
 * where it comes from and what it does, which is the only part that matters
 * at this distance and the only part that is safe to ship.
 *
 * Same buffer discipline as the fireworks and the confetti: the particles
 * exist from construction, and a "spray" is the whole set being handed one
 * birth time. It loops, so the spray can be held for as long as the shot
 * wants without anything being created.
 *
 * ================= WHY IT IS CLAMPED PER FRAGMENT =================
 *
 * Additive blending SUMS, so the brightness of a spray is decided by its
 * density and not by any per particle value. Six hundred droplets at 0.95 in
 * a tight cone summed into a hard edged white disc that sat exactly where
 * the rider's head is - the one part of the frame that has to stay readable
 * - and it was blamed on the fireworks twice before the arithmetic was done.
 *
 * Three things hold it down, and the third is the one that actually
 * guarantees it: a small per particle value, a small sprite, and a shader
 * that CLAMPS its own contribution so no fragment can write more than
 * `maxAlpha` however many droplets land on it. With the clamp the spray gets
 * denser where it overlaps rather than brighter, which is what a mist does.
 *
 * It is also thrown up and AWAY from the machine rather than over it, so the
 * arc frames the pair instead of crossing them.
 */

const _size = new THREE.Vector2();
const _offset = new THREE.Vector3();

const VERTEX_SHADER = `
  attribute vec3 aVelocity;
  attribute float aSeed;
  attribute float aLife;

  uniform float uTime;
  uniform float uGravity;
  uniform float uSize;
  uniform float uPixelsPerUnit;
  uniform vec3 uOrigin;
  uniform float uLean;

  varying float vFade;

  void main() {
    // Each droplet loops on its own life, staggered by its seed, so the
    // spray is continuous without anything being respawned on the CPU.
    float age = mod(uTime + aSeed * aLife, aLife);

    // Leaned outward, so the arc opens away from the bike instead of over
    // it. Applied to the velocity rather than the origin, or the spray would
    // start beside the rider and still come down on the machine.
    vec3 launch = aVelocity;
    launch.x += length(aVelocity) * uLean;
    vec3 offset = launch * age;
    offset.y += 0.5 * uGravity * age * age;

    vec4 mvPosition = modelViewMatrix * vec4(uOrigin + offset, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depth = max(0.1, -mvPosition.z);
    float t = age / aLife;
    // Droplets break up as they go: bigger and dimmer with age, which is what
    // turns a jet into a mist.
    gl_PointSize = uSize * uPixelsPerUnit * (0.6 + t * 1.4) / depth;
    vFade = (1.0 - t) * (1.0 - t);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uIntensity;
  uniform float uMaxAlpha;
  uniform vec3 uTint;

  varying float vFade;

  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = dot(d, d) * 4.0;
    if (r > 1.0) discard;
    float core = 1.0 - r;
    // CLAMPED PER FRAGMENT. Additive blending sums, so density decides the
    // result and no per particle brightness alone can stop a dense spray
    // reaching white. Holding each droplet's own contribution under a
    // ceiling means the spray gets DENSER rather than BRIGHTER where it
    // overlaps, which is what a mist actually does.
    float a = min(uMaxAlpha, core * vFade);
    gl_FragColor = vec4(uTint * uIntensity * a, a);
  }
`;

export class Champagne {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Camera} camera
   * @param {number} [quality]
   */
  constructor(scene, renderer, camera, quality = 1) {
    const cfg = config.celebration.champagne;
    this.cfg = cfg;
    this.renderer = renderer;
    this.camera = camera;

    const rng = createRng(3391);
    const count = Math.max(48, Math.round(cfg.count * quality));

    const position = new Float32Array(count * 3);
    const velocity = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const life = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const at = i * 3;
      // Position is unused - the origin is a uniform so the spray can follow
      // the rider without touching the buffer - but the attribute has to
      // exist for three to build the geometry.
      position[at] = 0;
      position[at + 1] = 0;
      position[at + 2] = 0;

      // A cone, forward and up. Even across the cone rather than random in a
      // box, or the spray comes out square.
      const angle = rng.next() * Math.PI * 2;
      const spread = Math.sqrt(rng.next()) * cfg.cone;
      const speed = rng.range(cfg.speed[0], cfg.speed[1]);
      velocity[at] = Math.sin(spread) * Math.cos(angle) * speed;
      velocity[at + 1] = Math.cos(spread) * speed * 0.85;
      velocity[at + 2] = -Math.sin(spread) * Math.sin(angle) * speed - speed * 0.25;

      seed[i] = rng.next();
      life[i] = rng.range(cfg.life[0], cfg.life[1]);
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    this.geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocity, 3));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.geometry.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uGravity: { value: cfg.gravity },
        uSize: { value: cfg.size },
        uPixelsPerUnit: { value: 300 },
        uIntensity: { value: cfg.intensity },
        uMaxAlpha: { value: cfg.maxAlpha },
        uLean: { value: cfg.lean },
        uTint: { value: new THREE.Color(cfg.color) },
        uOrigin: { value: new THREE.Vector3() },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = 'Champagne';
    this.points.frustumCulled = false;
    this.points.visible = false;
    scene.add(this.points);

    this.time = 0;
    this._running = false;
  }

  /**
   * @param {THREE.Vector3} origin the podium top
   * @param {THREE.Quaternion} [rotation] the arena's turn, so the hand offset
   *   is read in the arena's frame
   */
  start(origin, rotation) {
    // OFFSET IN THE ARENA'S FRAME, so the spray starts at the rider's hand
    // wherever the podium happens to be pointing rather than at a fixed
    // world offset that swings round the bike as the road turns.
    const cfg = this.cfg;
    _offset.set(cfg.origin.x, cfg.origin.y, cfg.origin.z);
    if (rotation) _offset.applyQuaternion(rotation);
    this.material.uniforms.uOrigin.value.copy(origin).add(_offset);
    this.time = 0;
    this._running = true;
    this.points.visible = true;
  }

  stop() {
    this._running = false;
    this.points.visible = false;
  }

  /** @param {number} dt */
  update(dt) {
    if (!this._running) return;
    this.time += dt;
    this.material.uniforms.uTime.value = this.time;
    this.renderer.getDrawingBufferSize(_size);
    this.material.uniforms.uPixelsPerUnit.value =
      _size.y * this.camera.projectionMatrix.elements[5] * 0.5;
  }

  dispose() {
    if (this.points && this.points.parent) this.points.parent.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
    this.points = null;
  }
}
