import * as THREE from 'three';
import { config } from '../../config.js';

/**
 * Flags - a pair of chequered flags either side of the podium.
 *
 * THE ONE THING IN THE SCENE THAT SAYS MOTOR RACING. Without them a lit
 * platform under fireworks with a crowd behind it is a concert. A chequered
 * flag is the only symbol that names what was just finished, and it is
 * generic - there is no series, no sponsor and no country on it, which is
 * what keeps this shippable in an ad.
 *
 * PROCEDURAL, like every other texture in the project. A canvas of black and
 * white squares, generated once, `NearestFilter` so the squares stay squares
 * instead of blurring into grey at distance - which is exactly what a
 * chequered flag must not do.
 *
 * WAVED IN THE VERTEX SHADER. A flag that hangs still is a towel. The wave
 * is a travelling sine across the cloth, pinned at the pole edge so it looks
 * attached rather than floating, and it costs nothing per frame on the CPU.
 * Both flags and both poles are ONE draw call each.
 */

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uSpeed;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 local = position;

    // PINNED AT THE POLE. 'uv.x' runs 0 at the pole to 1 at the loose edge,
    // so scaling by it means the attached edge does not move at all and the
    // free edge moves most - which is the whole read of a flag.
    float grip = uv.x;
    float wave = sin(local.x * uFrequency - uTime * uSpeed);
    local.z += wave * uAmplitude * grip;
    // A little vertical curl, so it is a cloth rather than a corrugated
    // sheet turning on one axis.
    local.y += cos(local.x * uFrequency * 0.7 - uTime * uSpeed * 0.8)
      * uAmplitude * grip * 0.35;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(local, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uMap;
  uniform float uShade;

  varying vec2 vUv;

  void main() {
    vec3 c = texture2D(uMap, vUv).rgb * uShade;
    gl_FragColor = vec4(c, 1.0);
  }
`;

/**
 * A chequerboard, drawn once.
 * @param {number} size pixels
 * @param {number} squares per side
 * @returns {THREE.CanvasTexture}
 */
function chequerTexture(size, squares) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const step = size / squares;
  for (let y = 0; y < squares; y++) {
    for (let x = 0; x < squares; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#f2f6ff' : '#0a0c14';
      ctx.fillRect(x * step, y * step, step, step);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  // SQUARES MUST STAY SQUARES. Filtered smoothly, a chequer at distance
  // averages to flat grey and the one symbol in the scene stops being one.
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.name = 'celebration-chequer';
  return texture;
}

export class Flags {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    const cfg = config.celebration.flags;
    this.cfg = cfg;

    this.group = new THREE.Group();
    this.group.name = 'CelebrationFlags';
    this.group.visible = false;
    scene.add(this.group);

    this.texture = chequerTexture(cfg.texture, cfg.squares);

    // Enough segments across for the wave to be a curve rather than a crease.
    const cloth = new THREE.PlaneGeometry(cfg.width, cfg.height, 18, 6);
    // Shifted so the pole edge is at x = 0, which is what lets `uv.x` be the
    // grip in the shader without a second attribute.
    cloth.translate(cfg.width * 0.5, 0, 0);
    this.geometry = cloth;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: cfg.wave.amplitude },
        uFrequency: { value: cfg.wave.frequency },
        uSpeed: { value: cfg.wave.speed },
        uMap: { value: this.texture },
        // Slightly under white: a pure white cloth beside fireworks is the
        // brightest thing in the frame and pulls the eye off the podium.
        uShade: { value: 0.82 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.DoubleSide,
    });

    this.poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, cfg.poleHeight, 6);
    this.poleMaterial = new THREE.MeshBasicMaterial({ color: 0x1b2130 });

    for (const sign of [-1, 1]) {
      const pole = new THREE.Mesh(this.poleGeometry, this.poleMaterial);
      pole.position.set(sign * cfg.offset, cfg.poleHeight * 0.5, 0);
      pole.frustumCulled = false;
      this.group.add(pole);

      const flag = new THREE.Mesh(cloth, this.material);
      // Mirrored, so the pair face outward from the podium rather than both
      // streaming the same way like a wind sock.
      flag.scale.x = sign;
      flag.position.set(
        sign * cfg.offset,
        cfg.poleHeight - cfg.height * 0.6,
        0,
      );
      flag.frustumCulled = false;
      this.group.add(flag);
    }
  }

  /**
   * @param {THREE.Vector3} position
   * @param {THREE.Quaternion} rotation
   */
  placeAt(position, rotation) {
    this.group.position.copy(position);
    this.group.quaternion.copy(rotation);
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  /** @param {number} dt */
  update(dt) {
    if (!this.group.visible) return;
    this.material.uniforms.uTime.value += dt;
  }

  dispose() {
    if (this.group.parent) this.group.parent.remove(this.group);
    this.geometry.dispose();
    this.poleGeometry.dispose();
    this.material.dispose();
    this.poleMaterial.dispose();
    this.texture.dispose();
  }
}
