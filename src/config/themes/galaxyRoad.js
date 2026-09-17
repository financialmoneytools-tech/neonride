/**
 * GALAXY ROAD - the road in space, and the look the game was built as.
 *
 * Deep black sky, galactic star bands, magenta and violet nebulae, a green and
 * purple aurora on one arc of the horizon. Cyan on the median side of the
 * carriageway, magenta on the shoulder side. Nothing grows here and nothing
 * falls out of the sky: it is a motorway laid through a galaxy, and the empty
 * verge is part of why that reads.
 *
 * ITS PATCH IS ALMOST EMPTY, and that is deliberate. The base config in
 * config/world.js and config/sky.js IS this theme, so nothing about adding
 * themes can change what the game looked like before there were any. What it
 * does state explicitly is the two things every theme must answer - what grows
 * beside the road, and what is falling - because a theme that leaves those
 * unsaid inherits whatever the theme before it left behind.
 */
export const galaxyRoad = {
  name: 'Galaxy Road',

  world: {
    scenery: {
      // Nothing. A road in space has no trees beside it, and the emptiness is
      // the point rather than an omission.
      density: { pine: 0, rock: 0, lampLeft: 0, lampRight: 0, gantry: 0 },
    },
    weather: { kind: null },

    // NOTHING OPAQUE MAY BLOCK THE SKY HERE. The ridge silhouettes are near
    // black and sat across the lower third of the frame, eating the starfield
    // on the right and part of the left - and the starfield is the entire
    // reason this theme exists. Aurora Pass keeps them; a pass needs walls.
    mountains: { enabled: false },

    road: {
      surface: {
        // The far carriageway recedes rather than reading as a flat navy plane
        // laid beside ours. It is 12 to 27 metres away across a barrier and
        // should look it.
        oncomingDim: 0.45,
      },
    },
  },

  /**
   * MOTION COMFORT. Required of every theme - see CLAUDE.md - and answered
   * here rather than in a note somebody has to go and find.
   *
   * Nothing moves through the centre of vision faster than the road does. The
   * flowing neon strips used to, at 1.45 times road speed directly under the
   * cluster, and they are now out on the shoulder and either side of the
   * median where peripheral motion belongs. What is left down the middle is
   * painted lane markings, which are world locked and therefore stream past at
   * exactly road speed: the comfortable kind of cue.
   *
   * No weather, so nothing falls toward the camera.
   */
  comfort: {
    centreMotion: 'lane paint only, at road speed',
    weather: 'none',
  },
};
