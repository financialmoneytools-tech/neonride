import * as THREE from 'three';
import { config } from '../../config.js';
import { partMatrix } from '../../utils/geometry.js';

/**
 * Instruments - the little neon gauge cluster between the bars.
 *
 * The face is a canvas texture generated at runtime, like every other texture
 * in this project. Redrawing a canvas and re-uploading it is not free, so it
 * only happens when a value that is actually shown has changed: the speed is
 * displayed as a whole number and the rev counter as a fixed number of
 * segments, so at a steady cruise the texture is never touched at all.
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
    this._shownSpeed = -1;
    this._shownRpm = -1;

    this._draw(0, 0);
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
   * @param {object} state shared loop state; reads state.speed and state.rpm
   */
  update(dt, state) {
    const cfg = config.player.rider.instruments;

    this._accumulator += dt;
    if (this._accumulator < 1 / cfg.updateHz) return;
    this._accumulator = 0;

    const speed = Math.round(state.speed || 0);
    const rpm = Math.round((state.rpm || 0) * cfg.rpmSegments);
    if (speed === this._shownSpeed && rpm === this._shownRpm) return;

    this._shownSpeed = speed;
    this._shownRpm = rpm;
    this._draw(speed, rpm);
    this.texture.needsUpdate = true;
  }

  /** @param {number} speed whole units per second @param {number} litSegments */
  _draw(speed, litSegments) {
    const cfg = config.player.rider.instruments;
    const colors = cfg.colors;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

    // Rev counter: a row of segments that warms from cyan through green to
    // magenta as it fills.
    const segments = cfg.rpmSegments;
    const gap = 3;
    const barTop = h * 0.13;
    const barHeight = h * 0.17;
    const usable = w - 24;
    const segmentWidth = (usable - gap * (segments - 1)) / segments;

    for (let i = 0; i < segments; i++) {
      const lit = i < litSegments;
      const share = i / (segments - 1);
      let color = colors.rpmOff;
      if (lit) color = share > 0.82 ? colors.rpmHigh : share > 0.55 ? colors.rpmMid : colors.rpmLow;
      ctx.fillStyle = color;
      ctx.fillRect(12 + i * (segmentWidth + gap), barTop, segmentWidth, barHeight);
    }

    const mono = 'ui-monospace, Consolas, "DejaVu Sans Mono", monospace';

    ctx.fillStyle = colors.label;
    ctx.font = '600 15px ' + mono;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(cfg.labels.rpm, 12, barTop - 7);

    ctx.fillText(cfg.labels.speed, 12, h - 14);

    ctx.fillStyle = colors.speed;
    ctx.font = '700 58px ' + mono;
    ctx.textAlign = 'right';
    ctx.fillText(String(speed), w - 52, h - 14);

    ctx.fillStyle = colors.label;
    ctx.font = '600 15px ' + mono;
    ctx.fillText(cfg.labels.unit, w - 12, h - 14);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
