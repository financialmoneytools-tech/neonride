import * as THREE from 'three';
import { config } from '../config.js';

/**
 * Engine - scene / camera / renderer setup, resize handling and teardown.
 * It never opens its own animation loop; it only exposes render() (see Loop.js).
 */
export class Engine {
  /**
   * @param {HTMLElement} container Element the canvas is appended to
   */
  constructor(container = document.body) {
    this.container = container;

    // The canvas is created here so that on HMR the old one is removed from the
    // DOM and a fresh one is opened, avoiding a lost WebGL context.
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);

    this.scene = new THREE.Scene();

    const cam = config.camera;
    this.camera = new THREE.PerspectiveCamera(
      cam.fov,
      window.innerWidth / window.innerHeight,
      cam.near,
      cam.far,
    );
    this.camera.position.set(cam.position.x, cam.position.y, cam.position.z);
    this.camera.lookAt(cam.lookAt.x, cam.lookAt.y, cam.lookAt.z);
    this.scene.add(this.camera);

    const r = config.renderer;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: r.antialias,
      powerPreference: r.powerPreference,
    });
    this.renderer.setPixelRatio(Engine.pixelRatio());
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Deliberately NOT tone mapped here. Postprocess applies ACES once, at the
    // end of the chain, after bloom has added into a linear buffer. Leaving the
    // renderer on NoToneMapping is what stops every MeshBasicMaterial in the
    // project - three puts the tone mapping chunk in all of them - from mapping
    // a second time on the way in.
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setClearColor(r.clearColor, 1);

    /** Called after every resize with the new css size. Set by main.js. */
    this.onResize = null;

    this._onResize = this.resize.bind(this);
    window.addEventListener('resize', this._onResize);
    this.resize();
  }

  /** Refreshes camera and renderer to match the window size. */
  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Engine.pixelRatio());
    this.renderer.setSize(w, h, false);

    if (this.onResize) this.onResize(w, h);
  }

  /**
   * Capture mode pins the pixel ratio so two recordings of the same run match
   * frame for frame whatever display they were made on.
   * @returns {number}
   */
  static pixelRatio() {
    if (config.capture.enabled) return config.capture.pixelRatio;
    return Math.min(window.devicePixelRatio, config.renderer.maxPixelRatio);
  }

  /** Draws a single frame. Called by Loop. */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Releases every geometry / material / texture under the given root.
   * @param {THREE.Object3D} root
   */
  static disposeObject(root) {
    root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      const mat = obj.material;
      if (!mat) return;
      const list = Array.isArray(mat) ? mat : [mat];
      for (const m of list) {
        for (const key of Object.keys(m)) {
          const value = m[key];
          if (value && value.isTexture) value.dispose();
        }
        m.dispose();
      }
    });
  }

  /** Called on HMR and page teardown so no resource is left behind. */
  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.onResize = null;
    Engine.disposeObject(this.scene);
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null;
    this.renderer = null;
  }
}
