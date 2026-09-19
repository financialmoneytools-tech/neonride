/**
 * NEON METROPOLIS - the wet city motorway.
 *
 * Purple cloud sitting low over a skyline, stars through the gaps in it, rain
 * on the screen and the whole road reflecting. Purple on the median, cyan on
 * the shoulder. Lamp poles and sign gantries every few hundred metres, which
 * is what an urban motorway actually looks like at night and what separates
 * this from a road in a field.
 *
 * STARS THROUGH THE GAPS, which is the hard rule from docs/THEMES.md read as
 * literally as it can be: the cloud is nebula layers, which are ADDITIVE, so
 * they never subtract from a star. A city sky with no stars would be the
 * honest version and it is not the game this is - so the cloud is broken up
 * and low, and the top of the sky stays open.
 *
 * THE RAIN IS THE POINT AND THE RISK. It is the strongest nausea trigger the
 * project has, straight through the centre of vision, and it is the reason
 * `motionScale('weather')` exists. See the comfort block.
 */
export const neonMetropolis = {
  name: 'Neon Metropolis',

  world: {
    fog: {
      // City haze: lighter than space and purple, because everything here is
      // lit from below by something.
      color: 0x14102a,
      density: 0.0019,
    },

    road: {
      surface: {
        // WET. The asphalt stays dark - a wet road is a black mirror, not a
        // grey one - and the sheen does the work. This is the one theme that
        // turns the road's own reflection up rather than down.
        asphaltColor: 0x07070f,
        // PULLED BACK from 1.35. A wet road is a BLACK mirror with bright
        // things in it, and at 1.35 the sheen lifted the whole carriageway
        // to an even mid purple - which is a lit road, not a wet one, and
        // it is the sustained-brightness case in CLAUDE.md: a uniformly
        // bright surface filling the lower half of the frame for a whole
        // run. The reflections still read; the asphalt between them is dark
        // again, which is what makes them reflections.
        sheenColor: 0x5a42b8,
        sheenStrength: 0.95,
        // Concrete, not grass. A city motorway is walled in.
        groundColor: 0x16141f,
        bankColor: 0x1b1826,
        bankWidth: 1.6,
        medianColor: 0x2a2440,
        // The far carriageway keeps most of itself: in a city it is lit, and
        // its headlights reflecting are half the picture.
        oncomingDim: 0.78,
      },
      edges: {
        leftColor: 0xb07dff, // purple, median side
        rightColor: 0x2de3ff, // cyan, shoulder side
        intensity: 0.58,
      },
      markings: {
        // Fresh paint under sodium and LED. Slightly warm white.
        color: 0xdfe6f2,
        intensity: 0.4,
      },
      strips: {
        lanes: [
          { anchor: 'shoulder', inset: -1.2, width: 0.06, color: 0x2de3ff, repeats: 7, duty: 0.36, speed: 0, intensity: 0.45 },
          { anchor: 'medianInner', inset: -0.4, width: 0.06, color: 0xb07dff, repeats: 5, duty: 0.32, speed: 0, intensity: 0.43 },
          { anchor: 'medianOuter', inset: 0.4, width: 0.06, color: 0xff4fd8, repeats: 6, duty: 0.3, speed: 0, intensity: 0.32 },
          { anchor: 'farVerge', inset: 1.2, width: 0.06, color: 0x2de3ff, repeats: 4, duty: 0.4, speed: 0, intensity: 0.26 },
        ],
      },
    },

    median: {
      color: 0x241f3a,
      capColor: 0xc9a6ff,
      capWidth: 0.62,
      capHeight: 0.09,
    },

    roadside: {
      leftColor: 0xb07dff,
      rightColor: 0x2de3ff,
      // DENSEST OF THE SIX. A city motorway is lit continuously, and the
      // rhythm of poles going past is most of what says "urban" at speed.
      stationsPerChunk: 11,
    },

    scenery: {
      // No trees, a little rubble, and every lamp and gantry the pool has.
      // The gantries are the signature: overhead sign structures every few
      // hundred metres are the one prop that reads instantly as a city ring
      // road rather than as a country highway.
      density: { pine: 0, rock: 0.25, lampLeft: 1.0, lampRight: 1.0, gantry: 1.0 },
    },

    weather: { kind: 'rain' },

    mountains: {
      // THE SKYLINE. Not hills - the ridge generator makes a jagged silhouette
      // and at this height and distance a jagged silhouette against a lit sky
      // reads as buildings. Closer and taller than any other theme, because a
      // city surrounds the road rather than sitting on the horizon of it.
      enabled: true,
      layers: [
        { distance: 520, height: 210, floor: 0.45, color: 0x120f22 },
        { distance: 820, height: 330, floor: 0.5, color: 0x0d0b1a },
      ],
    },

    // City traffic: everything, and more of the small stuff. Fewer semis -
    // they are banned from most urban motorways at night anyway.
    traffic: {
      mix: { sedan: 1, van: 1, ambulance: 0.8, jeep: 0.9, boxTruck: 0.7, semi: 0.45, motorcycle: 1 },
      look: {
        sedan: { stripColor: 0x2de3ff },
        van: { stripColor: 0xb07dff },
        motorcycle: { stripColor: 0xff4fd8 },
      },
    },
  },

  sky: {
    dome: {
      // Light pollution: the horizon glows purple and the zenith stays dark
      // enough to hold stars. That contrast IS a city sky.
      colorBase: 0x241a4a,
      colorMid: 0x14102a,
      colorTop: 0x070613,
      glow: {
        color: 0x7a4fd8,
        azimuth: 0,
        elevation: 0.1,
        intensity: 0.42,
        falloff: 4.4,
      },
    },

    stars: {
      // Washed out by the city, but never gone - the rule is the rule.
      // Dimmer and steadier than the desert's.
      twinkleAmount: 0.2,
      trailBrightness: 0.75,
    },

    bodies: {
      // No sun, no planet, no moon. A moon would be nice and it is one more
      // bright thing in a sky that already has light pollution and rain in
      // front of it.
      list: [],
    },

    nebula: {
      // THE CLOUD BANK, as four broad low masses rather than one. Low
      // elevation and wide scale is what makes them cloud rather than
      // galaxy, and the GAPS BETWEEN THEM are what keeps the stars - the
      // same reasoning Aurora Pass uses for its ribbons.
      clouds: [
        { azimuth: -1.1, elevation: 0.3, distance: 1150, scale: 900,
          color: 0x6a3fd8, opacity: 0.34, rotation: 0.2, breathSpeed: 0.03, breathAmount: 0.18, variant: 0 },
        { azimuth: 0.9, elevation: 0.26, distance: 1150, scale: 820,
          color: 0x8a4fc8, opacity: 0.3, rotation: -0.35, breathSpeed: 0.026, breathAmount: 0.2, variant: 1 },
        { azimuth: 2.6, elevation: 0.42, distance: 1150, scale: 760,
          color: 0x4f3fb8, opacity: 0.26, rotation: 0.5, breathSpeed: 0.032, breathAmount: 0.22, variant: 0 },
        { azimuth: -2.7, elevation: 0.38, distance: 1150, scale: 700,
          color: 0xb04fd8, opacity: 0.2, rotation: -0.2, breathSpeed: 0.028, breathAmount: 0.24, variant: 1 },
      ],
    },

    aurora: {
      // None. Wrong sky.
      intensity: 0,
      warmIntensity: 0,
    },
  },

  /**
   * MOTION COMFORT, and this is the second theme that needed a real answer.
   *
   * RAIN FALLS THROUGH THE CENTRE OF VISION and it falls harder and straighter
   * than snow does - `fall: 22` against snow's 2.4, and it streaks from a
   * standstill rather than from 90 units a second. That is the first cause on
   * CLAUDE.md's list at its strongest. It goes through motionScale('weather'),
   * which thins it and shortens the streaks; it does not stop, because a city
   * that is not raining is a different place rather than a gentler one.
   *
   * THE WET ROAD IS A SECOND TRIGGER and it is a quieter one that is easy to
   * miss: a reflective surface smears the strips and the lane paint DOWN the
   * road, which adds apparent motion in exactly the middle of the frame. The
   * sheen is high here by design, so the markings' own intensity is kept at
   * 0.4 rather than pushed up to compete with it.
   */
  comfort: {
    centreMotion: 'lane paint at road speed, plus falling rain and a reflective surface that smears it',
    weather: 'rain, scaled by motionScale(weather) - the strongest trigger the project carries',
    brightness: 'lit horizon, but the zenith stays dark; sheen raised instead of the markings',
  },
};
