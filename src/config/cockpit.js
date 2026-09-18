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
  // Solved, not chosen: the windscreen top and the grips are 0.3483 of the
  // image apart and have to span 86.5 - 62 = 24.5 per cent of the frame, so the
  // plane is 24.5 / 34.83 of the frame tall. See tools/measure-cockpit.mjs,
  // which asserts both.
  //
  // 0.890 before, which put the windscreen at 52.5 per cent down and left a
  // road band of 2.5 per cent - the cockpit covered the road and did not read
  // as a motorcycle. Smaller and lower shows the bike down to the wrists, with
  // the forearms and the tank running off the bottom edge where they belong.
  heightScale: 0.7034,

  // Nudge, in half-frames: [across, up]. The plane is anchored to the BOTTOM of
  // the frame, so this drops it until the windscreen top lands at 62 per cent.
  // That also puts the plane's bottom 7.6 per cent of the frame below the
  // bottom edge, which is where the cut edge has to be for the sway not to lift
  // it into shot.
  offset: [0, -0.1521],

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

  // The paint mask that goes with it: R bodywork, G the rim light on that
  // bodywork, B the windscreen. Derived FROM the sprite above by
  // tools/paint-mask.py, so the two cannot drift apart without the tool saying
  // so. See config/bikes.js for what is done with it.
  maskUrl: 'sprites/cockpit-mask.png',

  // The hole cut in the alpha, in the image's own texture coordinates:
  // [u0, v0, u1, v1] from the top left.
  //
  // AUTHORED FOR THIS SOURCE, and that is a step backwards taken deliberately.
  //
  // It used to be MEASURED: cut-cockpit.py grew the blank instrument panel from
  // a seed inside it, narrowed the result to the dash's own 16:9 so nothing was
  // stretched, and printed it - so a redraw moved the hole without anybody
  // editing a number. That needs the artist to leave the cluster blank.
  //
  // This drawing does not. It carries a fully drawn analogue tachometer and a
  // small LCD, so there is no flat panel to find and the seeded flood correctly
  // refused, reporting a fill of 0.52 against the 1.000 a real panel gives. The
  // art was kept because its landmarks matched the framing contract to within
  // 0.03 points, and regenerating art that fits that well to fix a hole is the
  // wrong trade. So the rectangle is written down, in cut-cockpit.py's SOURCES
  // under `face`, and copied here.
  //
  // It covers THE TACHO DIAL. The housing, its bezel, the surrounding fairing,
  // the brake reservoir, the left hand warning column and the green and amber
  // lamps below the dial all survive, which is what makes the live dash read as
  // sitting inside real instrument housing rather than in a hole cut through
  // the bike. The small LCD beside the dial is deliberately left drawn - see
  // tools/cut-cockpit.py for what reaching it would have cost. 209 x 117 px on
  // the shipped sprite against the old drawing's 126 x 71.
  //
  // cut-cockpit.py still reads this number back and still says
  // CONFIG_DISAGREES if the two drift apart. One punches the alpha and the
  // other places the dash; a comment asking them to match is not a check.
  //
  // A FUTURE REDRAW SHOULD LEAVE THE CLUSTER BLANK, which puts the measurement
  // back and makes this comment deletable. See ASSETS.md.
  screen: [0.442, 0.5317, 0.544, 0.6344],
};
