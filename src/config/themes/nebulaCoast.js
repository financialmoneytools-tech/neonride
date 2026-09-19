/**
 * NEBULA COAST - the coast road under two moons.
 *
 * A pink and teal nebula filling half the sky, two moons low over the water,
 * and a warm open road with nothing much beside it. Teal on the shoulder,
 * pink on the median. The quietest of the six on purpose: it is the road you
 * put on when you want to look at the sky, and it is the one that gives the
 * nebula the most room.
 *
 * TWO MOONS ARE THE SIGNATURE and they are the reason world/sky/Bodies.js
 * takes three slots rather than one. They sit at different sizes and
 * different elevations, because two identical discs read as a mistake.
 *
 * THE SEA IS A COLOUR, NOT GEOMETRY. There is no water plane here and there
 * is not going to be one: a reflective sea is a second full-screen surface on
 * a phone that is already paying for bloom, and the theme does not need it.
 * What says coast is the emptiness beside the road, the low warm verge and a
 * horizon that is brighter than the sky above it.
 */
export const nebulaCoast = {
  name: 'Nebula Coast',

  world: {
    fog: {
      // Warm and soft, matched to the dome at the horizon. Sea air, not the
      // hard clarity of the desert or the altitude of the pass.
      color: 0x12142c,
      density: 0.0014,
    },

    road: {
      surface: {
        asphaltColor: 0x080a12,
        sheenColor: 0x2a7d8a,
        sheenStrength: 0.9,
        // Sand, kept dark. The pale-verge lesson from Aurora Pass applies
        // exactly: a bright shoulder under bloom out-shines the road it edges.
        groundColor: 0x1d1f2a,
        bankColor: 0x23242f,
        bankWidth: 2.6,
        medianColor: 0x2a3340,
        oncomingDim: 0.55,
      },
      edges: {
        leftColor: 0xff5eb0, // pink, median side
        rightColor: 0x3df0e0, // teal, shoulder side
        intensity: 0.54,
      },
      markings: {
        color: 0xd8e4ea,
        intensity: 0.36,
      },
      strips: {
        lanes: [
          { anchor: 'shoulder', inset: -1.2, width: 0.06, color: 0x3df0e0, repeats: 5, duty: 0.4, speed: 0, intensity: 0.43 },
          { anchor: 'medianInner', inset: -0.4, width: 0.06, color: 0xff5eb0, repeats: 4, duty: 0.34, speed: 0, intensity: 0.41 },
          { anchor: 'medianOuter', inset: 0.4, width: 0.06, color: 0x9d7dff, repeats: 5, duty: 0.3, speed: 0, intensity: 0.27 },
          { anchor: 'farVerge', inset: 1.2, width: 0.06, color: 0x3df0e0, repeats: 3, duty: 0.42, speed: 0, intensity: 0.23 },
        ],
      },
    },

    median: {
      color: 0x27323e,
      capColor: 0x8ff0e4,
      capWidth: 0.6,
      capHeight: 0.08,
    },

    roadside: {
      leftColor: 0xff5eb0,
      rightColor: 0x3df0e0,
      // Sparse. A coast road is not lit end to end, and the gaps are what let
      // the sky be the brightest thing in the frame.
      stationsPerChunk: 4,
    },

    scenery: {
      // Coastal lamps and a scatter of rock. No pines - the palms this theme
      // was sketched with would be a NEW PROP KIND, and a theme may not
      // allocate one; docs/THEMES.md is explicit. A pine recoloured is still
      // a conifer, which reads as the wrong hemisphere, so it stays at zero
      // and the emptiness does the work instead.
      density: { pine: 0, rock: 0.45, lampLeft: 0.55, lampRight: 0.55, gantry: 0.2 },
    },

    weather: { kind: null },

    mountains: {
      // Headlands, far out and low, so the nebula has the whole sky. They are
      // there to give the horizon a shape rather than to enclose the road.
      enabled: true,
      layers: [
        { distance: 900, height: 110, floor: 0.28, color: 0x161a30 },
        { distance: 1250, height: 175, floor: 0.32, color: 0x101326 },
      ],
    },

    // Quiet road. Fewer of everything, and almost no freight: this is the
    // one place in the game where the traffic is scenery rather than the
    // obstacle. The level curve still scales all of it - a theme thins, the
    // level decides how hard.
    traffic: {
      mix: { sedan: 0.8, van: 0.5, ambulance: 0.25, jeep: 0.7, boxTruck: 0.4, semi: 0.3, motorcycle: 0.85 },
      look: {
        sedan: { stripColor: 0x3df0e0 },
        jeep: { stripColor: 0xff5eb0 },
        motorcycle: { stripColor: 0x9d7dff },
      },
    },
  },

  sky: {
    dome: {
      // A horizon that is brighter than the zenith, which is what says the
      // sea is out there catching the last of something.
      colorBase: 0x1c2450,
      colorMid: 0x12142c,
      colorTop: 0x080616,
      glow: {
        color: 0x2a8fa0,
        azimuth: 0.4,
        elevation: 0.08,
        intensity: 0.36,
        falloff: 4.8,
      },
    },

    stars: {
      // Clear coastal air. Bright, and they matter more here than anywhere
      // because the sky is the subject.
      twinkleAmount: 0.4,
      trailBrightness: 1.4,
    },

    bodies: {
      list: [
        {
          // The big one, low and left, with a shaded limb so it is a sphere
          // rather than a disc.
          azimuth: -0.55,
          elevation: 0.17,
          radius: 122,
          color: 0xf0e4d8,
          edgeColor: 0xc9a6b8,
          opacity: 0.88,
          bands: 0,
          halo: 0.32,
          haloOpacity: 0.3,
          shade: 0.75,
          shadeAzimuth: 2.4,
        },
        {
          // The small one, higher and to the other side. DIFFERENT SIZE AND
          // DIFFERENT HEIGHT: two matching discs read as a rendering fault
          // rather than as two moons.
          azimuth: 0.95,
          elevation: 0.38,
          radius: 58,
          color: 0xffd9e8,
          edgeColor: 0xd88fb8,
          opacity: 0.8,
          bands: 0,
          halo: 0.4,
          haloOpacity: 0.26,
          shade: 0.6,
          shadeAzimuth: -0.9,
        },
      ],
    },

    nebula: {
      // THE SUBJECT. Five masses, big, pink and teal, spread right across
      // the sky rather than parked on one arc. This is the most nebula any
      // theme carries and the opacities are still low - they are additive and
      // they stack, and a nebula that reaches white has eaten the stars.
      clouds: [
        { azimuth: -2.0, elevation: 0.62, distance: 1150, scale: 880,
          color: 0xff4f9a, opacity: 0.3, rotation: 0.35, breathSpeed: 0.036, breathAmount: 0.26, variant: 0 },
        { azimuth: -0.6, elevation: 0.85, distance: 1150, scale: 760,
          color: 0x2fd8d0, opacity: 0.26, rotation: -0.5, breathSpeed: 0.03, breathAmount: 0.3, variant: 1 },
        { azimuth: 0.8, elevation: 0.7, distance: 1150, scale: 840,
          color: 0xff6ad8, opacity: 0.24, rotation: 0.6, breathSpeed: 0.042, breathAmount: 0.24, variant: 0 },
        { azimuth: 2.3, elevation: 0.55, distance: 1150, scale: 800,
          color: 0x3f8fd8, opacity: 0.26, rotation: -0.3, breathSpeed: 0.034, breathAmount: 0.28, variant: 1 },
        { azimuth: 3.0, elevation: 0.9, distance: 1150, scale: 660,
          color: 0x9d5fd8, opacity: 0.2, rotation: 0.15, breathSpeed: 0.038, breathAmount: 0.22, variant: 0 },
      ],
    },

    aurora: {
      // A faint teal one, low on the horizon, as sea-glow rather than as an
      // aurora. Kept well under Aurora Pass's 4.5 - this is a hint, and the
      // nebula is what the eye is meant to go to.
      intensity: 0.9,
      warmIntensity: 0.25,
      colorLow: 0x2fd8c0,
      colorHigh: 0xff6ad8,
      curtainHeight: 0.5,
      arcHalfWidth: 1.4,
      rayScale: 7.0,
      rayContrast: 2.0,
      rayHeight: 0.3,
      clusterFloor: 0.3,
    },
  },

  /**
   * MOTION COMFORT. The quietest road of the six.
   *
   * Nothing moves through the centre of vision faster than the road does; the
   * strips are on the shoulder and the median and the middle carries painted
   * markings at road speed. No weather at all, so nothing falls toward the
   * camera. The nebula breathes, but it is at 1150 units and subtends almost
   * no angular velocity - and it is additive, so it never flickers.
   *
   * This is the road to send somebody to who has just been made unwell by
   * another one, which is worth saying out loud because CLAUDE.md requires a
   * comfortable option that is not also the boring one.
   */
  comfort: {
    centreMotion: 'lane paint only, at road speed',
    weather: 'none',
    brightness: 'sky is the brightest thing, but it is nebula at low opacity rather than a lit horizon',
  },
};
