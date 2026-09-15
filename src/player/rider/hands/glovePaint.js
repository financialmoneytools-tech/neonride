import { config } from '../../../config.js';

/**
 * glovePaint - the gloved hand, drawn rather than modelled.
 *
 * Five passes were spent building this hand out of primitives and then out of
 * lofted sections, and none of them read as a hand. The approach was wrong, not
 * the numbers: a first person hand barely rotates, so the geometry bought
 * nothing, and every pass was really an attempt to infer a shape whose
 * PROJECTION would look right. On a canvas the projection is what you draw.
 *
 * One image per side, on a camera facing plane. It carries the hand, the end of
 * the grip and the cuff together, because the join between a 2D hand and a 3D
 * bar is the one thing that would give the trick away - and there is no join if
 * the bar ends inside the picture.
 *
 * WHAT THE RIDER ACTUALLY SEES, which is what this draws and what the geometry
 * passes kept getting wrong: the back of the hand, facing up and a little
 * toward the eye. The knuckles are the FAR edge - the top of the picture - and
 * the fingers are over that edge and out of sight. So there are no fingers in
 * this drawing. What reads as fingers is the scalloped silhouette the knuckles
 * cut, and the metacarpal ridges running back from them toward the wrist.
 *
 * Authored for the RIGHT hand: the bar arrives from the left, inboard from the
 * clamp, passes behind the fist, and its end shows past the little finger. The
 * wrist leaves at the bottom. The left hand is the same drawing mirrored, with
 * the other neon colour.
 *
 * Drawn in a 512 x 512 design space and scaled to whatever the canvas is, so
 * texture size is a quality dial and nothing else.
 */

import { drawBar, drawCuff, drawForearm } from './gloveMount.js';
import { ARC_FROM, ARC_TO, KNUCKLES } from './gloveShape.js';

const W = 512;
const H = 512;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} sign +1 right hand, -1 left
 */
export function paintGlove(ctx, sign) {
  const cfg = config.player.rider.hand.sprite;
  const c = cfg.colors;
  const neon = sign > 0 ? c.neonRight : c.neonLeft;

  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.scale(ctx.canvas.width / W, ctx.canvas.height / H);

  // The left hand is the right one through a mirror, which is what a left hand
  // is. Mirrored here rather than on the mesh so each side keeps its own neon.
  if (sign < 0) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }

  drawBar(ctx, c);
  drawForearm(ctx, c);
  drawFist(ctx, c);
  drawKnuckles(ctx, c);
  drawThumbWeb(ctx, c);
  drawGuard(ctx, c);
  drawCuff(ctx, c, neon);
  drawRim(ctx, neon, cfg.rim);

  ctx.restore();
}

/** The silhouette. Everything else is clipped to it, so nothing can drift off. */
function fistPath(ctx) {
  const first = KNUCKLES[0];
  ctx.moveTo(first.x + Math.cos(ARC_FROM) * first.r, first.y + Math.sin(ARC_FROM) * first.r);

  // The knuckle row, as four arcs. The short straight run between each pair is
  // the dip between two knuckles, and it is what makes the top edge read as
  // fingers rather than as one curve with shading on it.
  for (let i = 0; i < KNUCKLES.length; i++) {
    const k = KNUCKLES[i];
    ctx.arc(k.x, k.y, k.r, ARC_FROM, ARC_TO);
  }

  ctx.bezierCurveTo(414, 186, 424, 210, 418, 240); // outboard shoulder
  ctx.bezierCurveTo(412, 272, 400, 290, 384, 300); // down past the little finger
  ctx.bezierCurveTo(330, 328, 240, 338, 176, 318); // the heel of the hand
  ctx.bezierCurveTo(140, 306, 116, 288, 112, 258); // thumb web, bulging out
  ctx.bezierCurveTo(110, 226, 130, 188, 158, 168); // back up to the index
  ctx.closePath();
}

/** Runs the callback with everything clipped to the hand. */
function inside(ctx, draw) {
  ctx.save();
  ctx.beginPath();
  fistPath(ctx);
  ctx.clip();
  draw();
  ctx.restore();
}

/**
 * The mass of the hand.
 *
 * Lit from up and inboard, which is where this cockpit's key is, so the
 * gradient runs from the index knuckle down to the outboard heel.
 */
function drawFist(ctx, c) {
  const gradient = ctx.createLinearGradient(140, 130, 380, 330);
  gradient.addColorStop(0, c.gloveLit);
  gradient.addColorStop(0.5, c.glove);
  gradient.addColorStop(1, c.gloveShadow);
  ctx.fillStyle = gradient;

  ctx.beginPath();
  fistPath(ctx);
  ctx.fill();
}

/** A highlight on each knuckle, and the creases that separate them. */
function drawKnuckles(ctx, c) {
  inside(ctx, () => {
    for (let i = 0; i < KNUCKLES.length; i++) {
      const k = KNUCKLES[i];
      const dome = ctx.createRadialGradient(k.x - 5, k.y - 14, 2, k.x, k.y - 6, k.r * 0.92);
      dome.addColorStop(0, c.knuckleLit);
      dome.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = dome;
      ctx.beginPath();
      ctx.ellipse(k.x, k.y - 6, k.r * 0.88, k.r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // The valleys. Drawn from the dip between two knuckles, running back into
    // the hand, which is the direction a real one goes.
    ctx.strokeStyle = c.crease;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < KNUCKLES.length - 1; i++) {
      const a = KNUCKLES[i];
      const b = KNUCKLES[i + 1];
      const x = (a.x + b.x) * 0.5;
      const y = (a.y + b.y) * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y - 26);
      ctx.quadraticCurveTo(x + 6, y + 6, x + 4, y + 34);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

/**
 * The thumb web.
 *
 * The thumb itself is round the far side of the bar and cannot be seen from
 * here. What IS visible, and what says the hand is closed rather than laid on
 * top, is the web between thumb and index bulging out on the inboard side.
 */
function drawThumbWeb(ctx, c) {
  inside(ctx, () => {
    const gradient = ctx.createRadialGradient(140, 236, 6, 150, 250, 110);
    gradient.addColorStop(0, c.gloveLit);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(146, 246, 54, 68, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = c.crease;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(150, 176);
    ctx.bezierCurveTo(178, 232, 186, 282, 176, 320);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

/**
 * The knuckle guard - the one piece of hard armour on a road glove, and the
 * detail that makes it a glove rather than a bare hand. It follows the knuckle
 * row rather than sitting on it as a panel.
 */
function drawGuard(ctx, c) {
  inside(ctx, () => {
    // A shell, not a plate. It follows the knuckle row and its lower edge fades
    // into the glove instead of stopping on a drawn line - a hard outline all
    // the way round was what made the first version read as a sticker.
    ctx.beginPath();
    ctx.moveTo(168, 212);
    for (let i = 0; i < KNUCKLES.length; i++) {
      const k = KNUCKLES[i];
      ctx.quadraticCurveTo(k.x - k.r * 0.5, k.y - 2, k.x, k.y + 2);
      ctx.quadraticCurveTo(k.x + k.r * 0.5, k.y + 6, k.x + k.r * 0.86, k.y + 10);
    }
    ctx.bezierCurveTo(396, 232, 320, 250, 236, 246);
    ctx.bezierCurveTo(198, 244, 172, 232, 168, 212);
    ctx.closePath();

    const shell = ctx.createLinearGradient(0, 190, 0, 252);
    shell.addColorStop(0, c.armour);
    shell.addColorStop(1, c.gloveShadow);
    ctx.fillStyle = shell;
    ctx.fill();

    // No second stroke along the lip. Drawn, it put a pale curve right under the
    // knuckle row that read as a mouth across the back of the hand; the shell's
    // own gradient is enough to stand it off.
  });
}

/**
 * Neon along the lit edges only - the knuckle row and the inboard side, where
 * this cockpit's key is. A rim all the way round would outline the hand like a
 * sticker, which is exactly what made the primitive hands read as a cluster of
 * separate objects.
 */
function drawRim(ctx, neon, cfg) {
  inside(ctx, () => {
    ctx.strokeStyle = neon;
    ctx.lineWidth = cfg.width;
    ctx.lineCap = 'round';
    ctx.globalAlpha = cfg.alpha;
    ctx.shadowColor = neon;
    ctx.shadowBlur = cfg.blur;

    // Each knuckle is lit SEPARATELY. Strung together in one path the stroke
    // followed the silhouette down into every valley and back out, and the
    // hooks it left read as four little arrowheads sitting on the hand.
    for (let i = 0; i < KNUCKLES.length; i++) {
      const k = KNUCKLES[i];
      ctx.beginPath();
      ctx.arc(k.x, k.y, k.r, ARC_FROM + 0.12, ARC_TO - 0.12);
      ctx.stroke();
    }

    // The inboard edge, running up to the index, and the outboard shoulder.
    ctx.beginPath();
    ctx.moveTo(114, 268);
    ctx.bezierCurveTo(110, 226, 130, 188, 160, 168);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(396, 178);
    ctx.bezierCurveTo(414, 186, 424, 210, 418, 240);
    ctx.stroke();
  });
}
