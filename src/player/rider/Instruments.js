import * as THREE from 'three';
import { config } from '../../config.js';
import { partMatrix } from '../../utils/geometry.js';
import { drawDash } from './instruments/dash.js';

/**
 * Instruments - the little neon gauge cluster between the bars.
 *
 * The face is a canvas texture generated at runtime, like every other texture
 * in this project, and it is drawn by ./instruments/dash.js - this file owns
 * the mesh and decides WHEN to redraw, that one owns what the dash looks like.
 *
 * Redrawing a canvas and re-uploading it is not free, so it only happens when a
 * value that is actually shown has changed. Everything is quantised to what the
 * face can actually show: the speed to a whole number, the tach to the number
 * of steps the arc can resolve, the shift light to on or off. At a steady
 * cruise the texture is never touched at all.
 *
 * This owns a mesh of its own rather than merging into the rider's shared
 * builders, because it is the one part that needs a texture.
 */
export class Instruments {
  constructor() {
    const cfg = config.player.rider.instruments;

    this.canvas = document.createElement('canvas');
    this.canvas.width = cfg.texture.width;
    this.canvas.height = cfg.texture.height;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.name = 'instrument-face';
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;

    // The face is a thin box rather than a plane: the frame is a slightly
    // larger box behind it, so the panel has a real edge instead of a paper
    // thin sliver that disappears at a glancing angle.
    this.geometry = new THREE.BoxGeometry(cfg.size[0], cfg.size[1], cfg.size[2]);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      fog: false,
      toneMapped: false,
    });
    this.material.name = 'InstrumentFace';

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'Instruments';
    partMatrix(1, cfg.offset, cfg.rotation, this.mesh.matrix);
    this.mesh.matrix.decompose(this.mesh.position, this.mesh.quaternion, this.mesh.scale);

    this._accumulator = 0;
    // What the face is currently showing, in the units it shows them in.
    this._shown = { rpm: 0, gear: -1, speed: -1, shift: false };

    drawDash(this.ctx, this._shown);
  }

  /** Adds the surrounding bezel to the rider's shared frame geometry. */
  addFrameTo(builder) {
    const cfg = config.player.rider.instruments;
    const margin = cfg.frameMargin;

    const bezel = new THREE.BoxGeometry(
      cfg.size[0] + margin * 2,
      cfg.size[1] + margin * 2,
      cfg.frameDepth,
    );
    // Pushed back so the lit face sits proud of the bezel it is set into.
    bezel.translate(0, 0, -cfg.frameDepth * 0.5);

    const matrix = new THREE.Matrix4();
    partMatrix(1, cfg.offset, cfg.rotation, matrix);
    builder.add(bezel, matrix);
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads speed, rpm and gear
   */
  update(dt, state) {
    const cfg = config.player.rider.instruments;

    this._accumulator += dt;
    if (this._accumulator < 1 / cfg.updateHz) return;
    this._accumulator = 0;

    const steps = cfg.tach.steps;
    const rpm = Math.round(THREE.MathUtils.clamp(state.rpm || 0, 0, 1) * steps) / steps;
    const gear = state.gear === undefined ? 1 : state.gear;
    const speed = Math.round(state.speed || 0);
    const shift = rpm >= cfg.tach.shiftAt;

    const shown = this._shown;
    if (rpm === shown.rpm && gear === shown.gear && speed === shown.speed && shift === shown.shift) {
      return;
    }

    shown.rpm = rpm;
    shown.gear = gear;
    shown.speed = speed;
    shown.shift = shift;

    drawDash(this.ctx, shown);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
