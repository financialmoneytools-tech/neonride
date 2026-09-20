/**
 * angle - the difference between two angles, done correctly.
 *
 * ================= WHY THIS FILE EXISTS =================
 *
 * An angle is a point on a circle and the plain subtraction of two of them is
 * not the distance between them. core/Controls.js computed the tilt away from
 * neutral as `raw - neutral` and shipped it, and it was right for months
 * because a phone held roughly level reads near zero and nothing ever crossed
 * the seam.
 *
 * Held the other way up it crosses it every frame. Photographed on a real
 * phone, from the overlay's own trace line:
 *
 *   pinned right:  raw  163.9   neutral -173.2   delta  337.1
 *   pinned left:   raw -174.0   neutral  167.6   delta -341.6
 *
 * 163.9 and -173.2 are TWENTY-THREE degrees apart. The subtraction called it
 * 337. Full lock is 22 degrees, so every reading saturated, and the bike
 * snapped between the two lateral limits with nothing in between - which is
 * what "the steering is locked" looked like from the saddle. Recalibrating
 * could not help: it stores a neutral that the same subtraction then mangles.
 *
 * So the wrap lives in one named function that anything comparing two angles
 * calls, rather than being open-coded at each site and correct at most of
 * them.
 */

/**
 * The shortest signed difference between two angles in DEGREES, in the range
 * [-180, 180).
 *
 * @param {number} degrees a difference that may have wrapped
 * @returns {number}
 */
export function wrapDegrees(degrees) {
  // The modulo first, so an input of several turns - which a compass heading
  // can be - lands in range instead of needing a loop.
  const turned = ((degrees + 180) % 360 + 360) % 360;
  return turned - 180;
}

/**
 * The same in RADIANS, in the range [-PI, PI).
 * @param {number} radians
 * @returns {number}
 */
export function wrapRadians(radians) {
  const turn = Math.PI * 2;
  const turned = ((radians + Math.PI) % turn + turn) % turn;
  return turned - Math.PI;
}

/**
 * The shortest way from `from` to `to`, both in degrees.
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
export function deltaDegrees(from, to) {
  return wrapDegrees(to - from);
}
