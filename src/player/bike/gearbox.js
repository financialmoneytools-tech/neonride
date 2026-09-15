/**
 * gearbox - which gear the bike is in and how far up its rev range.
 *
 * There is no clutch, no torque curve and no drivetrain anywhere in this
 * project. This is a fake box whose entire job is to make the tachometer and
 * the engine note read like a motorcycle, and it is worth being clear about
 * that, because it is what licenses the choices below.
 *
 * ONE FUNCTION, not two. The gear and the rev counter used to be worked out
 * separately from the same split of the speed range, which meant two copies of
 * the same arithmetic that had to agree for the needle to drop on the frame the
 * number goes up. They agree now because there is only one of them.
 *
 * PROGRESSIVE, not linear. The split used to be `speedRatio * gears`, six equal
 * bands, which is not how anything is geared: first is short and top is long,
 * and the pulls get longer as you go up. Six identical pulls is survivable on a
 * dial nobody stares at and is not survivable once it is the engine note, where
 * every gear sounds the same length and the ear hears the pattern immediately.
 *
 * So the gears are geometric. Each one reaches `step` of the speed the next one
 * reaches, which is the usual approximation of a real close ratio box, and the
 * bands that come out grow as they climb.
 *
 * TOP GEAR REACHES PAST THE BIKE'S TOP SPEED, deliberately. A motorcycle is
 * geared for a speed its drag will not let it reach, so top speed happens some
 * way below the redline in top - and here that matters twice over. It leaves
 * the note somewhere it can still move at full throttle rather than pinned
 * against the limiter for a whole clip, and it means the autopilot's rare
 * brake, down to 62 per cent of top speed, costs two downshifts and two
 * upshifts on the way back rather than a slow slide inside one gear.
 */

/**
 * The speed, as a fraction of the bike's top speed, at which each gear reaches
 * the redline. Geometric: gear n reaches `step` of what gear n+1 reaches.
 *
 * Written into `out` rather than returned, so a per frame call allocates
 * nothing.
 * @param {{count: number, topSpeed: number, step: number}} cfg config.player.bike.gearbox
 * @param {number[]} out reused
 * @returns {number[]} out
 */
export function gearTops(cfg, out) {
  out.length = cfg.count;
  let speed = cfg.topSpeed;
  for (let i = cfg.count - 1; i >= 0; i--) {
    out[i] = speed;
    speed *= cfg.step;
  }
  return out;
}

const _tops = [];

/**
 * @param {number} speedRatio 0..1, the bike's speed over its top speed
 * @param {{count: number, topSpeed: number, step: number, bottomRpm: number}} cfg
 * @param {{gear: number, rpm: number}} out reused
 * @returns {{gear: number, rpm: number}} gear is 0 for neutral, else 1..count;
 *   rpm is 0..1 where 1 is the redline
 */
export function resolveGear(speedRatio, cfg, out) {
  const tops = gearTops(cfg, _tops);

  if (speedRatio <= 0.002) {
    out.gear = 0;
    out.rpm = 0;
    return out;
  }

  let index = 0;
  while (index < cfg.count - 1 && speedRatio > tops[index]) index++;

  const top = tops[index];
  const bottom = index === 0 ? 0 : tops[index - 1];
  // Where in this gear's band the bike is. Clamped at the top because the last
  // gear's band reaches past the speed the bike can actually make, and because
  // nothing downstream should ever be handed an rpm over the redline.
  const within = Math.min(1, (speedRatio - bottom) / (top - bottom));

  out.gear = index + 1;
  // An upshift lands part way up the next gear, never at zero: dropping to
  // nothing would be a stall, and the gap between `bottomRpm` and 1 is the
  // length of the pull the ear actually hears.
  out.rpm = cfg.bottomRpm + (1 - cfg.bottomRpm) * within;
  return out;
}
