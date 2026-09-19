import * as THREE from 'three';
import { config } from '../../config.js';
import { createRng } from '../../utils/rng.js';

/**
 * Confetti - a slab of tumbling paper the podium sits inside.
 *
 * NOTHING IS SPAWNED AND NOTHING FALLS OUT OF THE WORLD. The particles live
 * in a box kept centred on the podium and WRAP when they leave the bottom of
 * it, which is the same trick world/Weather.js uses to let snow fall forever.
 * One buffer, one draw call, no allocation after the constructor.
 *
 * IT IS DELIBERATELY DIMMER THAN THE FIREWORKS, and that is a composition
 * decision rather than a saving. Confetti is the one thing in the scene that
 * is IN FRONT of everything for the whole shot - the bike, the podium, the
 * crowd, the flags all sit behind it. At a firework's brightness it stops
 * being confetti and becomes a wall of light between the camera and the thing
 * it is meant to be celebrating. It stays at 0.40, under the bloom threshold,
 * so it never smears.
 *
 * TUMBLE WITHOUT GEOMETRY. Each piece is a point sprite whose fragment shader
 * draws a rotating rectangle, so a thousand pieces of paper turning over in
 * the air cost one draw call and zero triangles. A real quad per piece would
 * be two thousand triangles and an instanced mesh to carry them.
 */

const _size = new THREE.Vector2();

const VERTEX_SHADER = `
  attribute vec3 aTint;
  attribute float aSeed;
  attribute float aFall;

  uniform float uTime;
  uniform float uBoxY;
  uniform float uDrift;
  uniform float uSpin;
  uniform float uSize;
  uniform float uPixelsPerUnit;
  uniform vec3 uCentre;

  uniform float uNearFade;
  uniform float uMaxSize;

  varying vec3 vTint;
  varying float vSpin;
  varying float vFade;

  void main() {
    vec3 local = position;

    // FALL AND WRAP. The whole descent is a modulo on time, so a piece that
    // leaves the bottom of the box is already at the top of it - there is no
    // respawn, no list of dead particles and no branch.
    float fallen = mod(aSeed * uBoxY + uTime * aFall, uBoxY);
    local.y = uBoxY * 0.5 - fallen;

    // Side to side, at a rate of its own, so the slab does not shear as one.
    float sway = sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 31.0);
    local.x += sway * uDrift;
    local.z += cos(uTime * (0.5 + aSeed) + aSeed * 17.0) * uDrift * 0.7;

    vec4 mvPosition = modelViewMatrix * vec4(local + uCentre, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depth = max(0.1, -mvPosition.z);
    // Edge on, the piece nearly disappears - which is most of what makes
    // paper read as paper rather than as a dot.
    float turn = uTime * uSpin * (0.7 + aSeed) + aSeed * 11.0;
    float face = abs(sin(turn));
    // CLAMPED, AND FADED OUT CLOSE TO THE LENS. A point sprite's size goes
    // as 1/depth, so a piece of paper a metre from the camera is drawn metres
    // across - and the camera cranes INTO the box these fall through. With
    // two thousand of them the whole shot was an opaque wall of confetti with
    // the podium somewhere behind it. Photographed twice.
    //
    // The clamp stops any one piece filling the frame; the fade removes the
    // ones too close to be anything but a colour wash. Together they let
    // confetti be IN FRONT of the shot, which is where it belongs, without
    // being the shot.
    gl_PointSize = min(uMaxSize,
      uSize * uPixelsPerUnit * (0.35 + 0.65 * face) / depth);
    vFade = smoothstep(0.0, uNearFade, depth);

    vTint = aTint;
    vSpin = turn;
  }
`;

const FRAGMENT_SHADER = `
  uniform float uIntensity;

  varying vec3 vTint;
  varying float vSpin;
  varying float vFade;

  void main() {
    if (vFade <= 0.01) discard;
    // A rotating rectangle, drawn in the sprite's own space. Cheaper than any
    // geometry and it is the rotation that sells it.
    vec2 d = gl_PointCoord - vec2(0.5);
    float s = sin(vSpin);
    float c = cos(vSpin);
    vec2 r = vec2(d.x * c - d.y * s, d.x * s + d.y * c);
    if (abs(r.x) > 0.5 || abs(r.y) > 0.22) discard;
    gl_FragColor = vec4(vTint * uIntensity, vFade);
  }
`;

export class Confetti {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Camera} camera
   * @param {number} [quality] share of the configured count to build
   */
  constructor(scene, renderer, camera, quality = 1) {
    const cfg = config.celebration.confetti;
    this.cfg = cfg;
    this.renderer = renderer;
    this.camera = camera;

    const rng = createRng(8812);
    const count = Math.max(64, Math.round(cfg.count * quality));
    this.count = count;

    const position = new Float32Array(count * 3);
    const tint = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const fall = new Float32Array(count);

    const colour = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const at = i * 3;
      position[at] = rng.range(-cfg.box.x * 0.5, cfg.box.x * 0.5);
      position[at + 1] = 0; // written by the shader; the attribute only carries x and z
      position[at + 2] = rng.range(-cfg.box.z * 0.5, cfg.box.z * 0.5);

      colour.set(cfg.colors[Math.floor(rng.next() * cfg.colors.length)]);
      tint[at] = colour.r;
      tint[at + 1] = colour.g;
      tint[at + 2] = colour.b;

      seed[i] = rng.next();
      fall[i] = rng.range(cfg.fall[0], cfg.fall[1]);
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    this.geometry.setAttribute('aTint', new THREE.BufferAttribute(tint, 3));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.geometry.setAttribute('aFall', new THREE.BufferAttribute(fall, 1));
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 200);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBoxY: { value: cfg.box.y },
        uDrift: { value: cfg.drift },
        uSpin: { value: cfg.spin },
        uSize: { value: cfg.size },
        uPixelsPerUnit: { value: 300 },
        uIntensity: { value: cfg.intensity },
        uNearFade: { value: cfg.nearFade },
        uMaxSize: { value: cfg.maxSize },
        uCentre: { value: new THREE.Vector3() },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = 'Confetti';
    this.points.frustumCulled = false;
    this.points.visible = false;
    scene.add(this.points);

    this.time = 0;
    this._running = false;
  }

  /** @param {THREE.Vector3} origin the podium */
  start(origin) {
    this.material.uniforms.uCentre.value.copy(origin);
    this.material.uniforms.uCentre.value.y += this.cfg.box.y * 0.5;
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
