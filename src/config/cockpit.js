/**
 * NEON RIDE - the photographic cockpit overlay.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.cockpit.
 *
 * The whole bike is one drawn image per aspect, cut out of a photograph by
 * tools/cut-cockpit.py and drawn over the scene by player/Cockpit.js. See
 * ASSETS.md for where the photographs came from and how the mask is built.
 */

export const cockpit = {
  // 'sprite' - the photograph.
  // 'geometry' - the primitive cockpit in player/Rider.js: bars, grips, hands,
  //   mirrors, screen, fairing, tank, triple clamp, forks, all still built and
  //   all still working. Kept because the photoreal style is being TRIED here,
  //   not decided, and a style trial you cannot reverse is not a trial.
  source: 'sprite',

  // How far in front of the camera the plane sits. It has no depth meaning -
  // depthTest is off and the draw order decides - and exists only because the
  // near plane is at 0.1 and geometry closer than that is clipped away.
  distance: 0.35,

  // THE SIZE KNOB, and the one the blocking issue was about. The plane's HEIGHT
  // is this fraction of the frame's height; its width then follows the image's
  // own aspect. That is the whole fix.
  //
  // It used to be a multiplier on the frame's WIDTH, with the height following
  // the texture. At 16:9 that looked deliberate and it was not: the plane's
  // share of the frame HEIGHT was aspect / imageAspect, so every window wider
  // than 16:9 grew the cockpit. Measured on the shipped art - 99.2 per cent of
  // frame height at 16:9, 112.2 at 2:1, 130.2 at 21:9, with the windscreen
  // climbing from 35.7 per cent down to 15.6 and the road disappearing behind
  // it. Sizing from the height makes the cockpit the same size at every
  // landscape aspect, which is what a cockpit bolted to a bike does.
  //
  // 0.890 is solved, not chosen: it is the only value that puts the windscreen
  // top and the grips inside their targets at once. The two landmarks are
  // 0.3483 of the image apart and have to span 82.5 - 52.5 = 31 per cent of the
  // frame, so the plane is 31 / 34.83 of the frame tall. See
  // tools/measure-cockpit.mjs, which asserts both.
  heightScale: 0.890,

  // Nudge, in half-frames: [across, up]. The plane is anchored to the BOTTOM of
  // the frame, so -0.2042 drops it until the windscreen top lands at 52.5 per
  // cent. That also puts the plane's bottom 10.2 per cent of the frame below
  // the bottom edge, which is where the cut edge has to be for the sway not to
  // lift it into shot.
  offset: [0, -0.2042],

  // SWAY - how the sprite answers the bike, and the only reason it is not a
  // dead picture. Steering used to move nothing at all: the camera already
  // rolls by -lean, and the sprite is parented to the camera, so the cockpit
  // sat perfectly still while the world tilted around it. That is what a
  // rider's own eyes see, and on a screen it reads as a photograph taped over
  // the frame. What is wanted is motion RELATIVE to the frame.
  //
  // Everything here is small on purpose. This is a flat image: roll it far
  // enough and the eye gets a parallax it does not get, and the trick is over.
  sway: {
    // WHERE IT ROLLS ABOUT: the centre of the cluster hole, dropped by this
    // many sprite heights. Not a point below the frame, which is where this
    // started - measured, that swung the cluster 11 per cent of the frame
    // across at one aspect and 1.5 at another, because the same roll about a
    // distant pivot throws a tall frame's cockpit much further.
    //
    // The cluster is the right pivot for two reasons. It is roughly where a
    // steering head is, so the grips swing around it the way real bars do. And
    // the live dash sits in that hole: pivoting anywhere else slides the dash
    // around inside its own surround, which is the one part of this that has to
    // stay registered.
    pivotDrop: 0.35,

    // Roll, as a share of the bike's own lean angle. leanMax is 0.14 rad, so
    // 0.30 is 2.4 degrees at full lean - on top of the 8 degrees the camera is
    // already rolling the world by, which is what makes it read as the machine
    // banking underneath a level rider rather than as the image tipping.
    leanRoll: 0.30,

    // Roll from steering, in radians at full lock. 1.8 degrees. Separate from
    // lean because the two arrive at different times: the bars turn first and
    // the lean follows through leanTau, so this is the part that answers the
    // input immediately and lean is the part that settles.
    steerRoll: 0.032,
    // Lateral shift at full lock, as a fraction of half the frame width - about
    // 1.5 per cent of the frame across. Enough to see at the grips.
    steerShift: 0.030,
    // Seconds of smoothing on the steering input. state.steer is raw; state
    // .lean is already damped by leanTau, so only this one needs it.
    tau: 0.12,
  },

  // Drawn after everything, including the transparent pass. The live cluster
  // goes one BELOW this so the photograph's own bezel composites over it.
  renderOrder: 2000,

  // ONE SOURCE. The game is landscape only - the portrait source, the second
  // profile and the code that chose between them are gone.
  url: 'sprites/cockpit.png',

  // The hole cut in the alpha, in the image's own texture coordinates:
  // [u0, v0, u1, v1] from the top left.
  //
  // MEASURED, not read off a grid. tools/cut-cockpit.py grows the blank panel
  // from a seed inside it, narrows the result to the dash's own 16:9 so nothing
  // is stretched, punches that, and prints it. It also reads this number back
  // and says CONFIG_DISAGREES if it has drifted from what was just cut, which
  // is the failure this duplication invites and the reason it is checked rather
  // than merely warned about in a comment.
  screen: [0.4697, 0.5703, 0.5310, 0.6322],
};
