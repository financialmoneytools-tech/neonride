/**
 * NEON RIDE - road themes.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * A theme is a PATCH over config, applied before anything is built, exactly the
 * way a quality preset is - see config/device.js and utils/patch.js. Most of
 * what a theme changes cannot be changed afterwards: the road material bakes
 * its strip count into a shader define, the roadside sizes its instance buffers
 * from the pylon spacing. Anything that genuinely can be changed live belongs
 * in config/comfort.js instead, which is why the reduced motion toggle is not
 * in here.
 *
 * `neonHighway` IS THE DEFAULT AND ITS PATCH IS EMPTY. That is deliberate and
 * worth keeping: the default look is the base config, not a theme laid over it,
 * so nothing about adding themes can change what the game looked like before
 * there were any. A theme that has to describe the default is a theme that can
 * get the default wrong.
 */

// --- Road themes ---
export const themes = {
  // The look the game was built and tuned as. Empty on purpose; see above.
  neonHighway: {},

  /**
   * Open Road - the same world with its centre of vision left alone.
   *
   * MOTION COMFORT, and it is not a preference. The four scrolling strips sit
   * at +/- 0.15 and +/- 0.40 of the ribbon, which puts the inner pair directly
   * under the cluster, and they scroll at -0.45 of road speed, so they appear
   * to approach at 1.45 times the speed of the world they are painted on.
   * High contrast motion in the middle of the field of view, moving faster than
   * everything around it, is a textbook way to make somebody ill - and a rider
   * looking where they are going cannot avoid looking at it.
   *
   * So the centre of the asphalt carries nothing here, and the colour moves
   * outward: brighter and wider edge lines, more pylons, a stronger sky.
   *
   * WHAT IT COSTS AND WHAT PAYS IT BACK. The strips are the cheapest speed cue
   * in the project, and losing them would leave this theme feeling slow, which
   * would make it the version nobody chooses. Pylons are the strongest cue
   * there is - they are the only thing that passes CLOSE to the camera - so the
   * spacing comes down from 20 units to 12.5. At top speed that is 18.8 of them
   * a second against 11.8, and they pass at the EDGE of vision, which is where
   * peripheral motion belongs and where the eye does not try to track it.
   */
  openRoad: {
    world: {
      road: {
        surface: {
          // A little more sky in the asphalt, so the middle of the road is
          // dark rather than dead now that nothing is drawn on it.
          sheenColor: 0x341a63,
          sheenStrength: 0.72,
        },
        edges: {
          // The edge lines become the main event. Wider, brighter, and with a
          // longer halo so they read as the sides of a lit channel rather than
          // as two thin wires.
          width: 0.05,
          glow: 9.0,
          intensity: 1.55,
          halo: 0.42,
        },
        strips: {
          // Nothing down the middle. Zero, not "very dim": a faint moving
          // pattern in the centre of vision is still a moving pattern in the
          // centre of vision. The shader handles a count of zero - see the
          // STRIP_COUNT guard in world/road/RoadMaterial.js.
          lanes: [],
        },
      },
      roadside: {
        stationsPerChunk: 16, // one pylon pair every 12.5 units, from 20
        tubeHeight: 4.6,
        tubeWidth: 0.3,
        tubeDepth: 0.3,
      },
    },
    sky: {
      dome: {
        glow: {
          intensity: 1.05,
          falloff: 4.6, // a wider pool, so the sky carries more of the colour
        },
      },
      aurora: {
        intensity: 1.25,
        warmIntensity: 0.26,
      },
    },
  },
};

/** Which theme is fitted. The T key cycles it at runtime. */
export const theme = 'neonHighway';
