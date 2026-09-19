import * as THREE from 'three';
import { config } from '../../config.js';
import { partMatrix } from '../../utils/geometry.js';
import { createRiderMaterial } from './RiderMaterial.js';
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
 * It owns its own meshes rather than merging into the rider's shared builders -
 * the face because it is the one part that needs a texture, and the bezel
 * because the cluster has to sit OUTSIDE the scaled hardware group that holds
 * the bars, the grips and the hands. The bezel used to go into the shared frame
 * geometry, which would have shrunk it with them and left a lit face standing
 * proud of a surround two sizes too small.
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

    // Bezel: a slightly larger box pushed back, so the lit face sits proud of a
    // surround it is set into rather than floating as a panel on its own.
    const margin = cfg.frameMargin;
    this.bezelGeometry = new THREE.BoxGeometry(
      cfg.size[0] + margin * 2,
      cfg.size[1] + margin * 2,
      cfg.frameDepth,
    );
    this.bezelGeometry.translate(0, 0, -cfg.frameDepth * 0.5);
    this.bezelMaterial = createRiderMaterial(config.player.rider.materials.frame, 'RiderBezel');
    this.bezel = new THREE.Mesh(this.bezelGeometry, this.bezelMaterial);
    this.bezel.name = 'InstrumentBezel';
    this.bezel.matrix.copy(this.mesh.matrix);
    this.bezel.matrix.decompose(this.bezel.position, this.bezel.quaternion, this.bezel.scale);

    this.group = new THREE.Group();
    this.group.name = 'Cluster';
    this.group.add(this.bezel, this.mesh);
    this.mesh.frustumCulled = false;
    this.bezel.frustumCulled = false;

    this._accumulator = 0;
    // What the face is currently showing, in the units it shows them in.
    this._shown = { rpm: 0, gear: -1, speed: -1, shift: false };

    drawDash(this.ctx, this._shown);
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
    // CONVERTED HERE, not in the drawing. `state.speed` is metres per second
    // and the face reads kilometres per hour; doing it at the one place the
    // value enters the dash means drawDash stays a function of what is shown.
    // See the note on `speed` in config/instruments.js for why the raw number
    // under a KM/SA label was a bug and not a style.
    const speed = quantise((state.speed || 0) * cfg.speed.toKmh, cfg.speed.step);
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
    this.bezelGeometry.dispose();
    this.material.dispose();
    this.bezelMaterial.dispose();
    this.texture.dispose();
    this.group.clear();
  }
}

/**
 * Rounds to a step, so a steady cruise does not redraw the dash face.
 * @param {number} value
 * @param {number} step
 * @returns {number}
 */
function quantise(value, step) {
  return step > 0 ? Math.round(value / step) * step : Math.round(value);
}
