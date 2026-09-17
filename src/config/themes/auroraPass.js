/**
 * AURORA PASS - a motorway over a snow pass, under the northern lights.
 *
 * Snowy pines and boulders crowding both verges, motorway lamps over the
 * carriageway, mountains close enough to read as walls rather than as distant
 * silhouettes. Bright hard stars, and an aurora that owns most of the sky
 * instead of one arc of the horizon. Ice blue and green neon. Snow falling.
 *
 * THE STARS STAY. That is the rule for every theme and it is worth restating
 * where it would be easiest to break: the snow falls in a box tens of metres
 * across, the sky dome is at fifteen hundred, so weather is a near field layer
 * and never a veil over the sky. The star layers here are BRIGHTER than Galaxy
 * Road's, not dimmer - cold clear air is what a pass at altitude has.
 *
 * WHAT IT DOES NOT TOUCH: anything structural. No counts, no pool sizes, no
 * shader defines. It sets colours, intensities and densities, which is all a
 * theme is ever allowed to be - see docs/THEMES.md.
 */
export const auroraPass = {
  name: 'Aurora Pass',

  world: {
    // Colder and a little thicker than space. The colour has to match what the
    // sky dome paints at the horizon or fogged geometry lands on a grey band
    // instead of melting into the sky - see config/world.js.
    fog: {
      color: 0x0a1420,
      density: 0.0016,
    },

    road: {
      surface: {
        // Wet, cold asphalt under a green sky rather than a violet one.
        sheenColor: 0x1b4a52,
        sheenStrength: 0.62,
        medianColor: 0x121a22,
      },
      edges: {
        leftColor: 0x7ef0ff, // ice blue, median side
        rightColor: 0x4dffa8, // green, shoulder side
        intensity: 1.2,
      },
      markings: {
        // Road paint with snow in it: paler and a touch brighter than the
        // sodium-free grey Galaxy Road uses.
        color: 0xd4e2ea,
        intensity: 0.58,
      },
      strips: {
        lanes: [
          { anchor: 'shoulder', inset: -1.2, width: 0.5, color: 0x4dffa8, repeats: 6, duty: 0.38, speed: 0, intensity: 0.85 },
          { anchor: 'medianInner', inset: -0.4, width: 0.45, color: 0x7ef0ff, repeats: 4, duty: 0.34, speed: 0, intensity: 0.8 },
          { anchor: 'medianOuter', inset: 0.4, width: 0.45, color: 0x9d7dff, repeats: 5, duty: 0.30, speed: 0, intensity: 0.6 },
          { anchor: 'farVerge', inset: 1.2, width: 0.5, color: 0x7ef0ff, repeats: 3, duty: 0.42, speed: 0, intensity: 0.5 },
        ],
      },
    },

    median: {
      capColor: 0x8a5410, // amber stays: it is the one hue nothing else uses
    },

    roadside: {
      // The pylons step back and cool off. The lamps and the trees carry the
      // roadside here, and three rows of neon down each verge would be a fence.
      leftColor: 0x5ce0ff,
      rightColor: 0x4dffa8,
      stationsPerChunk: 6,
    },

    scenery: {
      density: { pine: 0.9, rock: 0.45, lampLeft: 0.7, lampRight: 0.7 },
    },

    weather: { kind: 'snow' },

    mountains: {
      // Closer and taller, so the pass reads as a pass. Pale tops: the ridges
      // are the only large pale mass in the frame and they are what puts the
      // aurora behind something instead of behind nothing.
      layers: [
        { distance: 360, height: 175, floor: 0.3, color: 0x14202c },
        { distance: 560, height: 280, floor: 0.35, color: 0x0d1720 },
      ],
    },
  },

  sky: {
    dome: {
      colorBase: 0x05101a,
      colorMid: 0x0a1420,
      colorTop: 0x0b1b2e,
      glow: {
        color: 0x1d7a6a, // a green pool rather than a violet one
        azimuth: -1.6, // over the aurora, which the default camera faces
        elevation: 0.35,
        // Tight and dim. At 0.95 and 4.2 the pool filled the whole sky with
        // green and the stars stopped reading, which loses the one thing every
        // theme has to keep.
        intensity: 0.5,
        falloff: 5.4,
      },
    },

    stars: {
      // Cold clear air at altitude. Brighter and harder than Galaxy Road's,
      // which is the opposite of what a snowy theme is usually given and the
      // reason this one still reads as the same game.
      twinkleAmount: 0.42,
      trailBrightness: 1.5,
    },

    nebula: {
      // Two cool masses instead of five warm ones. The aurora is the event in
      // this sky and a magenta nebula behind it fights for the same arc.
      clouds: [
        { azimuth: -2.4, elevation: 0.72, distance: 1150, scale: 760,
          color: 0x2f6bff, opacity: 0.3, rotation: 0.4, breathSpeed: 0.05, breathAmount: 0.22, variant: 1 },
        { azimuth: 2.6, elevation: 0.66, distance: 1150, scale: 700,
          color: 0x7a53d8, opacity: 0.24, rotation: -0.8, breathSpeed: 0.04, breathAmount: 0.26, variant: 0 },
      ],
    },

    aurora: {
      // The event. Wider, taller and stronger than the horizon curtain Galaxy
      // Road carries, and with the warm under layer taken almost to nothing -
      // there is no sunset here, only cold light.
      colorLow: 0x4dffa8,
      colorHigh: 0x9d7dff,
      intensity: 1.05,
      warmIntensity: 0.05,
      curtainHeight: 0.62,
      arcHalfWidth: 1.0,
      rayContrast: 2.3,
      clusterFloor: 0.36,
    },
  },

  /**
   * MOTION COMFORT, and this theme is the one that needed the answer.
   *
   * SNOW FALLS THROUGH THE CENTRE OF VISION. That is the first cause on the
   * list in CLAUDE.md, and it is the strongest trigger the project has added.
   * It goes through motionScale('weather'), which thins the fall to under a
   * fifth and shortens the streaks - it does not stop the snow, because a pass
   * that is not snowing is a different place rather than a gentler one.
   *
   * Everything else is quieter here than on Galaxy Road, not louder: the
   * flowing strips are dimmer, the pylons are further apart, and the road's own
   * markings are the only thing down the middle.
   */
  comfort: {
    centreMotion: 'lane paint at road speed, plus falling snow',
    weather: 'snow, scaled by motionScale(weather) - 0.18 of the fall when reduced motion is on',
  },
};
