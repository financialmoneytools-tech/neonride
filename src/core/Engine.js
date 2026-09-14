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
    this.renderer.setSize(window.innerWidth, window.innerHeight, true);
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
  }

  /**
   * Refreshes camera and renderer for a frame of this size.
   *
   * The size is passed in rather than read from the window, because on a phone
   * the window is not the frame: the address bar covers part of it and comes
   * and goes while you play. Viewport decides what the real size is and when it
   * has settled; this only has to apply it.
   *
   * @param {number} w css pixels
   * @param {number} h css pixels
   */
  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Engine.pixelRatio());
    // updateStyle true, deliberately: the canvas is told its CSS size as well
    // as its buffer size. On a phone the element's own 100 per cent is the
    // LAYOUT viewport, which stays tall while the address bar is showing, so
    // leaving the style alone stretches a frame drawn for the visible area over
    // a taller box. The inline size three writes here beats the stylesheet.
    this.renderer.setSize(w, h, true);

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
