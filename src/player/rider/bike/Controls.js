
/**
 * Controls - everything within reach of the hands.
 *
 * These are the smallest parts on the bike and they carry most of the load,
 * because they sit directly beside the gloves at the bottom of the frame, which
 * is where the eye goes. A bar with nothing on it reads as a prop however good
 * the bodywork behind it is.
 *
 * Clip-ons replace the straight bar: short stubs from the fork tops out to the
 * grips, which is the single clearest "supersport" cue available at this
 * camera.
 *
 * They end INSIDE THE SPRITE, not at the grip. The grip is drawn, so the stub's
 * job is to reach the artwork and disappear behind it, and the join then
 * happens where no one can see it. That is the bargain the drawn bar was for.
 * For a long time it was not kept: the stub stopped 0.188 short of the drawn
 * grip and 18 per cent of the frame below it, which read as two handlebars, one
 * painted and one metal, running side by side.
 *
 * What makes it work is that the anchor now IS the drawn bar - see the note on
 * rightGrip in config/rider.js - so aiming the stub at the anchor and aiming it
 * at the drawing are finally the same instruction.
 *
 * The bar end weight is drawn into the hand sprite now, along with the grip it
 * caps and the lever beside it.
 *
 * The switch block, the lever perch and the brake master cylinder used to be
 * here too, and are gone. All three sat BELOW the bar line - y -0.062 to -0.090
 * against a clamp that bottoms out at -0.083 - where the fairing and the tank
 * used to be behind them. With those cut back they stood against open road as
 * three grey crates with nothing holding them up, and at this camera they were
 * the most broken-looking thing in the frame. The lever still has its perch;
 * that one is up at bar level where a perch belongs, and Handlebar.js builds
 * it.
 */

/**
 * @param {Object<string, import('../../../utils/geometry.js').GeometryBuilder>} builders
 */
export function buildControls(builders) {

  // NOTHING. The clip-on stubs were here, and they are gone: the handlebar is
  // one continuous tube from grip to grip now (Handlebar.js), and a pair of
  // stubs reaching in from the fork tops alongside it would be a second,
  // shorter handlebar running parallel to the first.
  //
  // The file stays because the switch block, the lever perch and the master
  // cylinder belong in it, and because the note above is worth keeping.
}
