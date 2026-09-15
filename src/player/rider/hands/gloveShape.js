/**
 * The knuckle row, and the arc each one cuts out of the top edge of the hand.
 *
 * Shared, because the silhouette, the highlights, the knuckle guard and the
 * neon rim are all built from it and any one of them drifting off the others
 * is the difference between a fist and a mitten with lines on it.
 *
 * Index is the largest and the little finger the smallest, which is the single
 * cue that stops four bumps reading as a machined rack.
 */
export const KNUCKLES = [
  { x: 196, y: 182, r: 40 },
  { x: 256, y: 176, r: 40 },
  { x: 314, y: 181, r: 37 },
  { x: 366, y: 191, r: 32 },
];

/** How much of each knuckle's circle is on the silhouette. */
export const ARC_FROM = Math.PI * 1.12;
export const ARC_TO = Math.PI * 1.88;
