import * as THREE from 'three';

/**
 * Runtime texture generation on a 2D canvas.
 * The project ships no external assets, so every texture is built here.
 *
 * All textures produced in this file carry pure white RGB and encode their
 * shape in the alpha channel, which is why they need no color space tag:
 * white converts to white, and alpha is never color managed. The final tint
 * comes from the material color.
 */

/** Creates an offscreen canvas plus its 2D context. */
function createCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

/** Hermite interpolation between two edges, same shape as the GLSL builtin. */
function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function alphaStop(alpha) {
  return 'rgba(255, 255, 255, ' + alpha + ')';
}

/**
 * Round star sprite: a tight bright core with a soft halo, so a two pixel
 * point still reads as a star instead of as a grey smudge.
 * @param {{coreStop:number, coreAlpha:number, midStop:number, midAlpha:number, tailStop:number, tailAlpha:number}} shape
 * @param {number} size
 * @returns {THREE.CanvasTexture}
 */
export function createStarTexture(shape, size = 64) {
  const { canvas, ctx } = createCanvas(size);
  const half = size / 2;

  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, alphaStop(1));
  gradient.addColorStop(shape.coreStop, alphaStop(shape.coreAlpha));
  gradient.addColorStop(shape.midStop, alphaStop(shape.midAlpha));
  gradient.addColorStop(shape.tailStop, alphaStop(shape.tailAlpha));
  gradient.addColorStop(1, alphaStop(0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'star-sprite';
  return texture;
}

/**
 * Soft nebula cloud: fractal noise pushed through a contrast window and
 * shaped by a radial falloff, so the sprite never shows a hard edge.
 * @param {{
 *   size?: number,
 *   fbm2D: (x:number, y:number) => number,
 *   scale?: number,
 *   offsetX?: number,
 *   offsetY?: number,
 *   falloffPower?: number,
 *   contrastLow?: number,
 *   contrastHigh?: number
 * }} options
 * @returns {THREE.CanvasTexture}
 */
export function createNebulaTexture({
  size = 256,
  fbm2D,
  scale = 2.6,
  offsetX = 0,
  offsetY = 0,
  falloffPower = 1.35,
  contrastLow = 0.34,
  contrastHigh = 0.86,
}) {
  const { canvas, ctx } = createCanvas(size);
  const image = ctx.createImageData(size, size);
  const data = image.data;
  const inv = 1 / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;

      // Map the pixel into [-1, 1] so the radial falloff is easy to express
      const nx = x * inv * 2 - 1;
      const ny = y * inv * 2 - 1;

      const radius = Math.sqrt(nx * nx + ny * ny);
      if (radius >= 1) {
        // Outside the inscribed circle the cloud is fully transparent
        data[index + 3] = 0;
        continue;
      }

      const falloff = Math.pow(1 - radius, falloffPower);

      // fbm returns [-1, 1]; lift it into [0, 1] before shaping
      const raw = fbm2D(nx * scale + offsetX, ny * scale + offsetY) * 0.5 + 0.5;
      const shaped = smoothstep(contrastLow, contrastHigh, raw);

      data[index + 3] = Math.round(Math.min(1, shaped * falloff) * 255);
    }
  }

  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'nebula-cloud';
  return texture;
}
