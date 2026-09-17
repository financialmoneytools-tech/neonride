import * as THREE from 'three';

/**
 * signs - the lit panels that hang under an overhead gantry.
 *
 * ONE CANVAS, FOUR CELLS, one texture, one material. A gantry picks a cell per
 * panel by remapping the panel's UVs into that quarter of the atlas, so a road
 * full of gantries showing different things is still one draw call.
 *
 * Drawn rather than modelled because a sign is writing, and writing is the one
 * thing this project cannot generate out of boxes. It stays inside the rule in
 * CLAUDE.md all the same: the canvas is painted at runtime, nothing is loaded.
 *
 * The wording is OURS. Motorway signs in the real world carry real place names
 * and real brands, and neither belongs in a recording that goes out as
 * marketing - so the panels say the game's own name, a distance, and an arrow.
 */

/** @param {object} cfg config.world.scenery.kinds.gantry.glow.sign */
export function createSignAtlas(cfg) {
  const size = cfg.textureSize;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const half = size / 2;
  ctx.clearRect(0, 0, size, size);

  /** One cell: a dark plate, a neon border, and whatever it says. */
  const cell = (col, row, draw) => {
    const x = col * half;
    const y = row * half;
    const pad = half * 0.08;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = cfg.plateColor;
    ctx.fillRect(pad, pad, half - pad * 2, half - pad * 2);

    ctx.strokeStyle = cfg.borderColor;
    ctx.lineWidth = half * 0.035;
    ctx.strokeRect(pad, pad, half - pad * 2, half - pad * 2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    draw(half);
    ctx.restore();
  };

  const text = (value, y, scale, color) => {
    ctx.fillStyle = color;
    ctx.font = '700 ' + Math.round(half * scale) + 'px system-ui, sans-serif';
    ctx.fillText(value, half / 2, y);
  };

  // The name, split over two lines so it fills a square plate.
  cell(0, 0, (h) => {
    text('NEON', h * 0.38, 0.22, cfg.textColor);
    text('RIDE', h * 0.64, 0.22, cfg.textColor);
  });

  // A distance. Not a real place, on purpose.
  cell(1, 0, (h) => {
    text('1', h * 0.36, 0.3, cfg.textColor);
    text('KM', h * 0.66, 0.18, cfg.textColor);
  });

  // An arrow, drawn rather than typed: a glyph would depend on the font.
  cell(0, 1, (h) => {
    const cx = h / 2;
    const cy = h / 2;
    ctx.fillStyle = cfg.textColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.22);
    ctx.lineTo(cx + h * 0.18, cy + h * 0.02);
    ctx.lineTo(cx + h * 0.07, cy + h * 0.02);
    ctx.lineTo(cx + h * 0.07, cy + h * 0.22);
    ctx.lineTo(cx - h * 0.07, cy + h * 0.22);
    ctx.lineTo(cx - h * 0.07, cy + h * 0.02);
    ctx.lineTo(cx - h * 0.18, cy + h * 0.02);
    ctx.closePath();
    ctx.fill();
  });

  cell(1, 1, (h) => {
    text('500', h * 0.38, 0.22, cfg.textColor);
    text('M', h * 0.66, 0.2, cfg.textColor);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'sign-atlas';
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Remaps a quad's UVs into one cell of the 2x2 atlas.
 * @param {THREE.BufferGeometry} geometry
 * @param {number} col 0 or 1
 * @param {number} row 0 or 1, counted from the TOP of the canvas
 */
export function useCell(geometry, col, row) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    // A canvas has y down and a texture has y up, so the row is flipped here
    // rather than by flipping the whole texture - which would flip the text.
    uv.setXY(i, uv.getX(i) * 0.5 + col * 0.5, uv.getY(i) * 0.5 + (1 - row) * 0.5);
  }
  uv.needsUpdate = true;
  return geometry;
}
