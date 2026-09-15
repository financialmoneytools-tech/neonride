import { KNUCKLES } from './gloveShape.js';

/**
 * The parts of the sprite that are not the hand: the grip it closes on, the
 * forearm leaving the bottom of the picture, and the cuff between them.
 *
 * Split out of ./glovePaint.js, which went past the size a file in this project
 * is allowed to be. The division is the one the drawing itself makes - the bar
 * and the sleeve go down first and the hand is painted over them.
 */

/** The grip, arriving from the clamp and ending past the little finger. */
export function drawBar(ctx, c) {
  const tube = (x0, y0, x1, y1, r0, r1) => {
    const gradient = ctx.createLinearGradient(0, y0 - r0, 0, y0 + r0);
    gradient.addColorStop(0, c.barLit);
    gradient.addColorStop(0.45, c.bar);
    gradient.addColorStop(1, c.barRib);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x0, y0 - r0);
    ctx.lineTo(x1, y1 - r1);
    ctx.lineTo(x1, y1 + r1);
    ctx.lineTo(x0, y0 + r0);
    ctx.closePath();
    ctx.fill();
  };

  // Inboard, running off the left edge toward the clamp.
  tube(0, 226, 210, 204, 32, 34);
  ctx.strokeStyle = c.barRib;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 3; i++) {
    const x = 30 + i * 44;
    const y = 226 - (x / 210) * 22;
    ctx.beginPath();
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x, y + 30);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Outboard, and the weight that closes it.
  tube(380, 200, 448, 196, 28, 26);
  ctx.fillStyle = c.barEnd;
  ctx.beginPath();
  ctx.ellipse(448, 196, 10, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.barLit;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(448, 196, 10, 26, 0, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
}

/** Wrist and forearm, tapering out of the bottom of the picture. */
export function drawForearm(ctx, c) {
  const gradient = ctx.createLinearGradient(0, 300, 0, 512);
  gradient.addColorStop(0, c.glove);
  gradient.addColorStop(1, c.sleeve);
  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.moveTo(166, 296);
  ctx.bezierCurveTo(152, 366, 160, 440, 182, 512);
  ctx.lineTo(310, 512);
  ctx.bezierCurveTo(302, 436, 296, 362, 288, 300);
  ctx.closePath();
  ctx.fill();

  // One fold, so the sleeve is cloth rather than a tapered slab.
  ctx.strokeStyle = c.crease;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(176, 402);
  ctx.quadraticCurveTo(238, 424, 300, 408);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** The band that ends the glove, and the lit line on it. */
export function drawCuff(ctx, c, neon) {
  ctx.fillStyle = c.cuff;
  ctx.beginPath();
  ctx.moveTo(168, 292);
  ctx.bezierCurveTo(212, 326, 258, 336, 292, 330);
  ctx.lineTo(300, 374);
  ctx.bezierCurveTo(256, 382, 202, 368, 158, 334);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = neon;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.shadowColor = neon;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(172, 310);
  ctx.bezierCurveTo(214, 344, 258, 354, 292, 348);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

