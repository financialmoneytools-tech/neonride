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

/**
 * Round star sprite: a bright core fading out through a radial gradient.
 * @param {{size?: number, coreStop?: number, midStop?: number, midAlpha?: number}} options
 * @returns {THREE.CanvasTexture}
 */
export function createStarTexture({
  size = 64,
  coreStop = 0.12,
  midStop = 0.32,
  midAlpha = 0.35,
} = {}) {
  const { canvas, ctx } = createCanvas(size);
  const half = size / 2;

  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(coreStop, 'rgba(255, 255, 255, 0.92)');
  gradient.addColorStop(midStop, 'rgba(255, 255, 255, ' + midAlpha + ')');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'star-sprite';
  return texture;
}

/**
 * Soft nebula cloud: fractal noise shaped by a radial falloff so the sprite
 * never shows a hard rectangular edge.
 * @param {{
 *   size?: number,
 *   fbm2D: (x:number, y:number) => number,
 *   scale?: number,
 *   offsetX?: number,
 *   offsetY?: number,
 *   falloffPower?: number,
 *   contrast?: number,
 *   threshold?: number
 * }} options
 * @returns {THREE.CanvasTexture}
 */
export function createNebulaTexture({
  size = 256,
  fbm2D,
  scale = 2.4,
  offsetX = 0,
  offsetY = 0,
  falloffPower = 1.5,
  contrast = 1.2,
  threshold = 0.05,
}) {
  const { canvas, ctx } = createCanvas(size);
  const image = ctx.createImageData(size, size);
  const data = image.data;
  const inv = 1 / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Map the pixel into [-1, 1] so the radial falloff is easy to express
      const nx = x * inv * 2 - 1;
      const ny = y * inv * 2 - 1;

      const radius = Math.sqrt(nx * nx + ny * ny);
      let falloff = 1 - radius;
      if (falloff <= 0) {
        // Outside the inscribed circle the cloud is fully transparent
        const clearIndex = (y * size + x) * 4;
        data[clearIndex] = 255;
        data[clearIndex + 1] = 255;
        data[clearIndex + 2] = 255;
        data[clearIndex + 3] = 0;
        continue;
      }
      falloff = Math.pow(falloff, falloffPower);

      // fbm returns [-1, 1]; lift it into [0, 1] before shaping
      const raw = fbm2D(nx * scale + offsetX, ny * scale + offsetY) * 0.5 + 0.5;
      let value = (raw - threshold) / (1 - threshold);
      if (value < 0) value = 0;
      value = Math.pow(value, contrast) * falloff;

      const index = (y * size + x) * 4;
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = Math.round(Math.min(1, value) * 255);
    }
  }

  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'nebula-cloud';
  return texture;
}
