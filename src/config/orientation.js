/**
 * NEON RIDE - orientation.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.orientation.
 *
 * The game is LANDSCAPE ONLY. The cockpit is one drawn image built for 16:9,
 * the road is framed for it and the touch controls assume two thumbs in the
 * bottom corners of a wide screen; a portrait frame is a different composition,
 * not a worse one, and the honest answer is to ask for the phone to be turned.
 *
 * Strings are Turkish, like every other piece of interface text.
 */

export const orientation = {
  // What screen.orientation.lock is asked for. 'landscape' rather than
  // 'landscape-primary' so a phone held either way round is accepted - a rider
  // holding the charger side up is not doing anything wrong.
  lock: 'landscape',

  // Aspect below which the frame counts as portrait, and the one it has to get
  // back above to stop counting. TWO thresholds, because a phone rotating
  // passes through shapes near square and an address bar sliding up can cross a
  // single threshold twice in a second - which is a prompt that blinks.
  //
  // Both sit below 1, so a square-ish window is treated as landscape and left
  // alone. It composes poorly but it plays, and interrupting somebody over a
  // window they deliberately made is worse than a cramped frame.
  enter: 0.95,
  leave: 1.05,

  title: 'TELEFONU YAN CEVIR',
  body: 'NEON RIDE yatay ekran icin yapildi.',
};
