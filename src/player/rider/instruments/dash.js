import { config } from '../../../config.js';

/**
 * The face of the cluster - a sport bike dash, drawn to a canvas.
 *
 * The layout is not a free choice. On the bikes in the reference shots the
 * TACHOMETER ARC is the anchor of the whole cockpit: it wraps everything else,
 * it is the only element that moves far enough to be read at a glance, and it
 * is what makes the dash look like a dash rather than a readout. So the arc
 * gets the panel, the gear sits in the middle of it where the eye already is,
 * and the speed - the number a rider actually looks at least often - is
 * secondary underneath.
 *
 * What replaced: a horizontal row of eighteen segments and a large digital
 * number. That reads as a graphic equaliser, and no part of it moves in a way
 * that says engine.
 *
 * Everything is drawn in texture pixels. Nothing here knows about the mesh.
 */

const MONO = 'ui-monospace, Consolas, "DejaVu Sans Mono", monospace';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{rpm: number, gear: number, speed: number, shift: boolean}} shown
 */
export function drawDash(ctx, shown) {
  const cfg = config.player.rider.instruments;
  const c = cfg.colors;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.background;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = c.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

  drawLamps(ctx, cfg, shown);
  drawShiftLight(ctx, cfg, shown);
  drawTach(ctx, cfg, shown);
  drawGear(ctx, cfg, shown);
  drawSpeed(ctx, cfg, shown);
}

/** Angle on the arc for a fraction of the sweep. Canvas angles, y down. */
function angleAt(tach, t) {
  return Math.PI * (tach.sweep[0] + (tach.sweep[1] - tach.sweep[0]) * t);
}

/**
 * The arc: an unlit track with its ticks and numbers, then the lit part over
 * the top of it, warming as it climbs.
 */
function drawTach(ctx, cfg, shown) {
  const t = cfg.tach;
  const c = cfg.colors;
  const [cx, cy] = t.centre;

  // Round ends on the track only. The lit part and the redline sit on top of
  // it with square ends, which is what stops a partly filled arc from showing a
  // rounded nub where the colour changes.
  ctx.lineCap = 'round';
  ctx.strokeStyle = c.rpmOff;
  ctx.lineWidth = t.width;
  ctx.beginPath();
  ctx.arc(cx, cy, t.radius, angleAt(t, 0), angleAt(t, 1));
  ctx.stroke();

  // Redline, on the track rather than over it, so it is still there when the
  // needle is nowhere near it. That is the point of a redline.
  ctx.lineCap = 'butt';
  const redFrom = t.redlineAt / t.maxRpm;
  ctx.strokeStyle = c.redline;
  ctx.beginPath();
  ctx.arc(cx, cy, t.radius, angleAt(t, redFrom), angleAt(t, 1));
  ctx.stroke();

  // Lit part, in slices so the colour can ramp along it rather than switching.
  const slices = Math.max(1, Math.round(shown.rpm * t.fillSlices));
  for (let i = 0; i < slices; i++) {
    const from = i / t.fillSlices;
    const to = (i + 1) / t.fillSlices;
    ctx.strokeStyle = revColor(c, from);
    ctx.beginPath();
    // A hair of overlap, or the seams between slices show as dark hairlines.
    ctx.arc(cx, cy, t.radius, angleAt(t, from), angleAt(t, to) + 0.004);
    ctx.stroke();
  }

  // Ticks, drawn last so they cut across the lit part the way a real dial's
  // printed face sits over its needle.
  ctx.strokeStyle = c.tick;
  ctx.lineCap = 'butt';
  const inner = t.radius - t.width * 0.5;
  const outer = t.radius + t.width * 0.5;

  for (let i = 0; i <= t.maxRpm; i++) {
    const major = i % 2 === 0;
    const a = angleAt(t, i / t.maxRpm);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    ctx.lineWidth = major ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + cos * inner, cy + sin * inner);
    ctx.lineTo(cx + cos * (major ? outer : inner + t.width * 0.45),
               cy + sin * (major ? outer : inner + t.width * 0.45));
    ctx.stroke();

    // The ends are left unnumbered. Both of them land where the arc itself
    // ends, which is the busiest part of the face, and a tachometer that starts
    // at zero and stops at its own last tick does not need to say so.
    if (!major || i === 0 || i === t.maxRpm) continue;
    const r = inner - 19;
    ctx.fillStyle = c.label;
    ctx.font = '700 16px ' + MONO;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i), cx + cos * r, cy + sin * r);
  }

  // Out at the corner, not under the arc: the middle of the panel below the
  // gear belongs to the speed, and the two collided there.
  ctx.fillStyle = c.label;
  ctx.font = '600 13px ' + MONO;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(cfg.labels.rpm, 14, ctx.canvas.height - 12);
}

/** Cyan low, green through the middle, magenta at the top. */
function revColor(colors, share) {
  if (share > 0.82) return colors.rpmHigh;
  if (share > 0.55) return colors.rpmMid;
  return colors.rpmLow;
}

/** The gear, in the middle of the arc, where the eye already is. */
function drawGear(ctx, cfg, shown) {
  const c = cfg.colors;
  const [cx] = cfg.tach.centre;
  const y = cfg.gear.y;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const neutral = shown.gear === 0;
  ctx.fillStyle = neutral ? c.neutral : c.gear;
  ctx.font = '700 ' + cfg.gear.size + 'px ' + MONO;
  ctx.fillText(neutral ? cfg.labels.neutral : String(shown.gear), cx, y);
}

/** Speed, deliberately smaller than the gear. It is the secondary reading. */
function drawSpeed(ctx, cfg, shown) {
  const c = cfg.colors;
  const [cx] = cfg.tach.centre;
  const y = cfg.speed.y;

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'right';
  ctx.fillStyle = c.speed;
  ctx.font = '700 ' + cfg.speed.size + 'px ' + MONO;
  const number = String(shown.speed);
  ctx.fillText(number, cx + cfg.speed.split, y);

  ctx.textAlign = 'left';
  ctx.fillStyle = c.label;
  ctx.font = '600 14px ' + MONO;
  ctx.fillText(cfg.labels.unit, cx + cfg.speed.split + 6, y);
}

/**
 * A bar across the top that comes on near the redline.
 *
 * It flashes, which is the one thing on the panel that draws the eye without
 * being read, and it is the reason the shift is worth showing at all on a bike
 * that cannot be stalled: on camera it turns an upshift into an event.
 */
function drawShiftLight(ctx, cfg, shown) {
  const cfgBar = cfg.shift;
  const c = cfg.colors;
  const x = ctx.canvas.width * 0.5 - cfgBar.width * 0.5;

  ctx.fillStyle = shown.shift ? c.shiftOn : c.shiftOff;
  ctx.beginPath();
  ctx.roundRect(x, cfgBar.y, cfgBar.width, cfgBar.height, cfgBar.height * 0.5);
  ctx.fill();
}

/**
 * Warning lamps. Two of them are dark, and stay dark: an instrument panel with
 * nothing unlit on it does not look like an instrument panel, it looks like a
 * menu.
 */
function drawLamps(ctx, cfg, shown) {
  const c = cfg.colors;
  for (let i = 0; i < cfg.lamps.length; i++) {
    const lamp = cfg.lamps[i];
    const lit = lamp.kind === 'neutral' ? shown.gear === 0
      : lamp.kind === 'beam' ? true
        : false;
    const color = lit ? c[lamp.kind] : c.lampOff;

    ctx.save();
    ctx.translate(lamp.at[0], lamp.at[1]);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    if (lamp.kind === 'neutral') glyphLetter(ctx, 'N');
    else if (lamp.kind === 'beam') glyphBeam(ctx);
    else if (lamp.kind === 'oil') glyphOil(ctx);
    else glyphThermometer(ctx);
    ctx.restore();
  }
}

/** Drawn about (0, 0); the caller has already translated to the lamp. */
function glyphLetter(ctx, letter) {
  ctx.font = '700 20px ' + MONO;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 0, 1);
}

/** High beam: a bulb with three flat rays, as on every dash ever made. */
function glyphBeam(ctx) {
  ctx.beginPath();
  ctx.arc(-2, 0, 8, Math.PI * 0.5, Math.PI * 1.5);
  ctx.lineTo(-2, -8);
  ctx.fill();
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(1, i * 5);
    ctx.lineTo(10, i * 5);
    ctx.stroke();
  }
}

/** Oil pressure: the can and its drip. */
function glyphOil(ctx) {
  ctx.beginPath();
  ctx.ellipse(-1, 1, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-9, -1);
  ctx.lineTo(-13, -6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(7, 5, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/** Coolant temperature. */
function glyphThermometer(ctx) {
  ctx.beginPath();
  ctx.arc(0, 5, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-2, -9, 4, 12, 2);
  ctx.fill();
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(3, -6 + i * 5);
    ctx.lineTo(8, -6 + i * 5);
    ctx.stroke();
  }
}
