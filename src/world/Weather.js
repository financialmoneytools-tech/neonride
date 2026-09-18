import * as THREE from 'three';
import { config } from '../config.js';
import { createRng } from '../utils/rng.js';
import { motionScale } from '../core/Comfort.js';

/**
 * Weather - snow, rain and dust, all out of one buffer.
 *
 * ROUND SOFT FLAKES THAT STRETCH, not line segments. The first version drew
 * each particle as a segment from where it is to where it was, which tilts with
 * the real velocity for free - and looked like a screen full of scratches,
 * because a one pixel line is not a snowflake at any speed. These are points
 * with a soft radial falloff, and the falloff is measured in a frame aligned
 * with the particle's own screen space velocity: at rest it is a circle, and at
 * two hundred it is a short dash lying the way the flake is actually moving.
 * One draw call for the whole sky either way.
 *
 * NOTHING IS SPAWNED OR DESTROYED. The particles live in a box kept centred on
 * the camera and wrap when they leave it, the same trick the sky group uses to
 * let the rider travel forever. The flow through that box is the bike's own
 * velocity, so weather streams past at the speed of the world rather than at a
 * speed of its own.
 *
 * STARS STAY VISIBLE THROUGH IT. The box is small and near - tens of metres,
 * not the fifteen hundred the sky dome sits at - so weather is a near field
 * layer between the rider and a sky that is never dimmed. That is a rule from
 * the concept, not an accident of the numbers: the galactic sky is what the
 * game is, and a theme that loses it is a different game.
 *
 * IT GOES THROUGH motionScale('weather'). See config/comfort.js - this is the
 * strongest nausea trigger in the project, and the scale is read live every
 * frame rather than baked, so the toggle works on the next frame.
 */

const _forward = new THREE.Vector3();
const _flow = new THREE.Vector3();
const _size = new THREE.Vector2();

const VERTEX_SHADER = `
  attribute vec3 aVelocity;

  uniform float uSize;
  uniform float uPixelsPerUnit;
  uniform float uStreak;
  uniform vec3 uFlow;

  varying vec2 vDir;
  varying float vStretch;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depth = max(0.1, -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // A flake's true motion through the world is its own fall plus the flow the
    // bike drags it through. Both, or a stopped bike would still show streaks
    // and a moving one would show them falling straight down.
    vec3 motion = aVelocity + uFlow;

    // Where that motion points ON SCREEN. Projecting the far end of it and
    // taking the difference in clip space is the only way to get this right
    // through a perspective divide.
    vec4 tip = projectionMatrix * (mvPosition + viewMatrix * vec4(motion, 0.0));
    vec2 here = gl_Position.xy / max(0.0001, abs(gl_Position.w));
    vec2 there = tip.xy / max(0.0001, abs(tip.w));
    vec2 delta = there - here;
    float len = length(delta);
    vDir = len > 0.0001 ? delta / len : vec2(0.0, 1.0);

    // How far it smears. Bounded, because a streak longer than the sprite it
    // is drawn in simply clips, and because a flake that becomes a line has
    // stopped being a flake.
    vStretch = 1.0 + uStreak;

    gl_PointSize = uSize * uPixelsPerUnit * vStretch / depth;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vDir;
  varying float vStretch;

  void main() {
    // Point coordinates run 0..1 with y DOWN, and the streak direction was
    // computed in clip space with y up, so one of them has to be flipped or
    // every flake leans the wrong way.
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    uv.y = -uv.y;

    // Measure the distance in the flake's own frame: along its motion, and
    // across it.
    //
    // THE SPRITE GROWS IN BOTH AXES AND THE FLAKE MUST NOT. gl_PointSize is a
    // square, so stretching a streak means asking for a bigger square - and uv
    // then spans that bigger square in both directions. Dividing the ALONG
    // axis by the stretch made the ellipse long, and left it just as wide,
    // which drew snow as fat white blocks. The across axis is MULTIPLIED
    // instead: the sprite grew by vStretch, so the flake's width in uv has to
    // shrink by the same factor to stay the width it was.
    vec2 across = vec2(-vDir.y, vDir.x);
    float a = dot(uv, vDir);
    float b = dot(uv, across) * vStretch;
    float d = length(vec2(a, b));

    // Soft all the way out. A hard edge on a small sprite aliases into a
    // sparkle, which reads as dust rather than as snow.
    float alpha = 1.0 - smoothstep(0.15, 1.0, d);
    if (alpha <= 0.002) discard;

    gl_FragColor = vec4(uColor, alpha * uOpacity);
  }
`;

export class Weather {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {THREE.WebGLRenderer} renderer for the point size, which is in pixels
   */
  constructor(scene, camera, renderer) {
    const cfg = config.world.weather;

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.rng = createRng(cfg.seed);

    this.count = cfg.count;
    this.box = cfg.box;

    this._points = new Float32Array(this.count * 3);
    this._velocity = new Float32Array(this.count * 3);

    const half = { x: this.box[0] * 0.5, y: this.box[1] * 0.5, z: this.box[2] * 0.5 };
    this._half = half;

    for (let i = 0; i < this.count; i++) {
      this._points[i * 3] = (this.rng.next() * 2 - 1) * half.x;
      this._points[i * 3 + 1] = (this.rng.next() * 2 - 1) * half.y;
      this._points[i * 3 + 2] = (this.rng.next() * 2 - 1) * half.z;
    }

    this.geometry = new THREE.BufferGeometry();
    const position = new THREE.BufferAttribute(this._points, 3);
    position.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', position);
    this.geometry.setAttribute('aVelocity', new THREE.BufferAttribute(this._velocity, 3));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: 0.2 },
        uPixelsPerUnit: { value: 500 },
        uStreak: { value: 0 },
        uFlow: { value: new THREE.Vector3() },
        uColor: { value: new THREE.Color(0xffffff) },
        uOpacity: { value: 1 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      // NOT additive. Additive white over a pale snow verge turns the verge
      // white and loses the flakes in it, and additive white through the
      // chromatic aberration in the post chain fringes magenta - which is the
      // one colour snow may never be.
      blending: THREE.NormalBlending,
    });

    this.flakes = new THREE.Points(this.geometry, this.material);
    this.flakes.name = 'Weather';
    // The box moves with the camera, so nothing in it is ever outside the
    // frustum in a way a bounding test could usefully find.
    this.flakes.frustumCulled = false;
    this.flakes.renderOrder = 5;
    this.flakes.visible = false;
    scene.add(this.flakes);

    this.kind = null;
    this.setKind(cfg.kind);
  }

  /**
   * Picks which weather is falling, or none.
   * @param {'snow'|'rain'|'dust'|null} kind
   */
  setKind(kind) {
    if (this.fade === undefined) this.fade = 1;
    const preset = kind && config.world.weather.kinds[kind];
    this.kind = preset ? kind : null;
    this.preset = preset || null;
    this.flakes.visible = !!preset;
    // A new kind arrives at full strength unless a blend is driving `fade`.
    this.fade = preset ? 1 : 0;
    if (!preset) return;

    this.material.uniforms.uColor.value.set(preset.color);
    this.material.uniforms.uOpacity.value = preset.opacity * this.fade;
    this.material.uniforms.uSize.value = preset.size;

    // Per particle velocity, scattered so the fall is not a single sheet. The
    // lateral drift takes either sign, so the field wanders instead of sliding.
    for (let i = 0; i < this.count; i++) {
      const at = i * 3;
      this._velocity[at] = preset.drift[0] * (this.rng.next() * 2 - 1);
      this._velocity[at + 1] = -preset.fall * (0.6 + this.rng.next() * 0.8);
      this._velocity[at + 2] = preset.drift[1] * (this.rng.next() * 2 - 1);
    }
    this.geometry.attributes.aVelocity.needsUpdate = true;
  }

  /**
   * Ramps the weather in or out, 0..1. A road change is a BLEND, and snow that
   * appears in one frame is a cut - so the fall is faded rather than switched.
   *
   * Two things this has to get right. The particles are kept alive while the
   * fade runs, because update() returns early with no preset and a field frozen
   * mid air is more obvious than one that is thinning. And the mesh is switched
   * off outright at zero rather than left transparent: a Points cloud still
   * submits its draw call and all of its vertices however invisible it is, and
   * that was measured on the scenery.
   * @param {number} fade
   */
  setFade(fade) {
    this.fade = Math.max(0, Math.min(1, fade));
    if (!this.preset) return;
    this.material.uniforms.uOpacity.value = this.preset.opacity * this.fade;
    this.flakes.visible = this.fade > 0.004;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads state.speed
   */
  update(dt, state) {
    if (!this.preset) return;

    const comfort = motionScale('weather');
    const preset = this.preset;
    const half = this._half;
    const points = this._points;
    const velocity = this._velocity;
    const uniforms = this.material.uniforms;

    // The box rides with the camera. Position only, not rotation: weather that
    // rolled with the bike's lean would read as the sky tipping over.
    this.camera.getWorldPosition(this.flakes.position);

    // Flow is the bike's own velocity, pushed back through the box. The camera
    // looks roughly where it is going, so its forward axis is the travel axis.
    this.camera.getWorldDirection(_forward);
    const speed = state.speed || 0;
    _flow.copy(_forward).multiplyScalar(-speed);
    uniforms.uFlow.value.copy(_flow);

    // A point's size is in PIXELS, so it depends on how tall the frame is and
    // how wide the field of view is - and both of those move. Element 5 of a
    // perspective projection is 1 / tan(fov / 2).
    this.renderer.getDrawingBufferSize(_size);
    uniforms.uPixelsPerUnit.value = _size.y * this.camera.projectionMatrix.elements[5] * 0.5;

    // SHORT STREAKS ONLY AT HIGH SPEED. Below the threshold this is zero and
    // every flake is a circle, which is what snow looks like when you are not
    // travelling through it.
    const over = Math.max(0, speed - preset.streakFrom);
    uniforms.uStreak.value = Math.min(preset.streakMax, over * preset.streakRate) * comfort;

    // A thinned fall rather than a stopped one. drawRange, so the surplus is
    // never drawn rather than drawn and discarded.
    const live = Math.max(1, Math.round(this.count * (comfort < 1 ? comfort : 1)));
    this.geometry.setDrawRange(0, live);

    for (let i = 0; i < live; i++) {
      const at = i * 3;

      let x = points[at] + (velocity[at] + _flow.x) * dt;
      let y = points[at + 1] + velocity[at + 1] * dt;
      let z = points[at + 2] + (velocity[at + 2] + _flow.z) * dt;

      // Wrap rather than respawn. A particle leaving one face enters the
      // opposite one and keeps its velocity, so the field never thins and
      // never needs a spawner.
      if (x > half.x) x -= half.x * 2; else if (x < -half.x) x += half.x * 2;
      if (y > half.y) y -= half.y * 2; else if (y < -half.y) y += half.y * 2;
      if (z > half.z) z -= half.z * 2; else if (z < -half.z) z += half.z * 2;

      points[at] = x;
      points[at + 1] = y;
      points[at + 2] = z;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.flakes);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}
