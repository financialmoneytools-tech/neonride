/**
 * SUNSET HIGHWAY - the desert road, with the sun refusing to set.
 *
 * A banded retro sun sitting on the horizon dead ahead, an orange-pink sky
 * that goes deep violet overhead, and stars in the top of the frame the whole
 * time. Rock and sign gantries beside the road, sodium lamps down both verges,
 * nothing growing. Orange on the shoulder, pink on the median.
 *
 * THE SUN IS THE THEME. It is the one object that names the place, it sits at
 * azimuth zero so the default camera looks straight at it, and the bands
 * across it are what make it eighties rather than daytime - see
 * world/sky/Bodies.js. Everything else in this file is a colour chosen to sit
 * under it.
 *
 * STARS SURVIVE, which is the hard rule from docs/THEMES.md. The dome's warm
 * glow is deliberately LOW and TIGHT - a wide bright pool on the horizon
 * washes the whole sky and takes the starfield with it, which is the mistake
 * Aurora Pass documents having made with its green one. The warmth belongs in
 * the bottom fifth of the sky; above that this is still a night road.
 */
export const sunsetHighway = {
  name: 'Sunset Highway',

  world: {
    fog: {
      // Warm, and matched to what the dome paints at the horizon, or fogged
      // geometry lands on a grey band instead of melting into the sunset.
      color: 0x2a1424,
      // Thicker than space. Desert air at dusk carries dust even when there
      // is no weather, and it is what puts the hills at different depths.
      density: 0.0016,
    },

    road: {
      surface: {
        // Sun-bleached asphalt: warmer and a shade lighter than the black
        // tarmac of Galaxy Road, because it has been in the sun all day.
        asphaltColor: 0x0d0a10,
        sheenColor: 0x8a4a2e,
        sheenStrength: 0.85,
        // Desert floor. Warm grey-brown, dark enough that it never competes
        // with the road - the pale-verge mistake Aurora Pass had to fix twice.
        groundColor: 0x241a18,
        bankColor: 0x2c201b,
        bankWidth: 2.2,
        medianColor: 0x3a261f,
        oncomingDim: 0.6,
      },
      edges: {
        leftColor: 0xff5ea8, // pink, median side
        rightColor: 0xff9a3d, // orange, shoulder side
        intensity: 0.55,
      },
      markings: {
        // Old paint under a lot of sun. Warm white, not blue-white.
        color: 0xe8dcc4,
        intensity: 0.36,
      },
      // WIDTHS AND GLOW COME FROM THE BASE. A theme sets colour and intensity
      // and never its own strip geometry - see config/road.js.
      strips: {
        lanes: [
          { anchor: 'shoulder', inset: -1.2, width: 0.06, color: 0xff9a3d, repeats: 5, duty: 0.4, speed: 0, intensity: 0.44 },
          { anchor: 'medianInner', inset: -0.4, width: 0.06, color: 0xff5ea8, repeats: 4, duty: 0.34, speed: 0, intensity: 0.42 },
          { anchor: 'medianOuter', inset: 0.4, width: 0.06, color: 0xffd166, repeats: 5, duty: 0.3, speed: 0, intensity: 0.28 },
          { anchor: 'farVerge', inset: 1.2, width: 0.06, color: 0xff7a3d, repeats: 3, duty: 0.42, speed: 0, intensity: 0.24 },
        ],
      },
    },

    median: {
      color: 0x3d2a22,
      capColor: 0xffb066,
      capWidth: 0.6,
      capHeight: 0.08,
    },

    roadside: {
      leftColor: 0xff5ea8,
      rightColor: 0xff9a3d,
      stationsPerChunk: 7,
    },

    scenery: {
      // NO PINES. Nothing grows here, and that is the desert. What it has
      // instead is rock, a lot of it, and the gantries and lamp poles that
      // make a real highway read as one rather than as a strip of tarmac.
      density: { pine: 0, rock: 1.0, lampLeft: 0.9, lampRight: 0.9, gantry: 0.85 },
    },

    weather: { kind: null },

    mountains: {
      enabled: true,
      // Desert hills: low, wide and far, so they sit UNDER the sun rather
      // than in front of it. The sun's centre is at 0.1 radians of elevation
      // and its radius subtends about 9 degrees, so a ridge that reaches 12
      // would cut it in half - which is the whole picture gone.
      layers: [
        { distance: 780, height: 96, floor: 0.3, color: 0x2b1526 },
        { distance: 1120, height: 150, floor: 0.35, color: 0x1e0f1d },
      ],
    },

    // A highway in the middle of nowhere runs freight. More trucks than
    // anywhere else, fewer motorcycles - nobody commutes out here.
    traffic: {
      mix: { sedan: 0.75, van: 0.9, ambulance: 0.3, jeep: 1, boxTruck: 1, semi: 1, motorcycle: 0.45 },
      look: {
        sedan: { stripColor: 0xff9a3d },
        jeep: { stripColor: 0xffd166 },
        motorcycle: { stripColor: 0xff5ea8 },
      },
    },
  },

  sky: {
    dome: {
      // Deep violet overhead falling to a hot horizon. The top stays dark
      // enough to be a night sky, because it has to hold the stars.
      colorBase: 0x3a1230,
      colorMid: 0x2a1424,
      colorTop: 0x0a0616,
      glow: {
        color: 0xff6a2a,
        azimuth: 0, // dead ahead, behind the sun
        elevation: 0.06,
        // LOW AND TIGHT. A broad warm pool fills the sky and takes the stars
        // with it, which is the exact failure Aurora Pass documents for its
        // green one. This belongs in the bottom fifth of the frame.
        intensity: 0.5,
        falloff: 5.2,
      },
    },

    stars: {
      // Desert air: very clear, hard points. They have to survive a lit
      // horizon, so they are brighter here than anywhere except Aurora Pass.
      twinkleAmount: 0.38,
      trailBrightness: 1.35,
    },

    bodies: {
      list: [
        {
          // THE RETRO SUN. Dead ahead, sitting ON the horizon so the road
          // runs into it, and banded.
          azimuth: 0,
          elevation: 0.085,
          radius: 190,
          color: 0xffd166, // hot core at the top
          edgeColor: 0xff2e6a, // into pink at the bottom
          opacity: 0.95,
          bands: 7,
          bandGap: 0.34,
          halo: 0.5,
          haloOpacity: 0.32,
          shade: 0, // a sun is flat; shading it would make it a planet
        },
      ],
    },

    nebula: {
      // Warm and high, so the top of the sky is not empty once the eye has
      // left the sun. Two masses, well away from azimuth zero, so they never
      // sit in front of it.
      clouds: [
        { azimuth: -2.2, elevation: 0.8, distance: 1150, scale: 700,
          color: 0xff4f9a, opacity: 0.22, rotation: 0.3, breathSpeed: 0.04, breathAmount: 0.25, variant: 0 },
        { azimuth: 2.4, elevation: 0.7, distance: 1150, scale: 640,
          color: 0x7a4fd8, opacity: 0.26, rotation: -0.6, breathSpeed: 0.035, breathAmount: 0.3, variant: 1 },
      ],
    },

    aurora: {
      // NO AURORA HERE. It is the wrong sky for one, and a green curtain over
      // a sunset is two ideas fighting. Left at zero rather than removed, so
      // a blend from Aurora Pass fades it out instead of dropping it.
      intensity: 0,
      warmIntensity: 0,
    },
  },

  /**
   * MOTION COMFORT.
   *
   * Nothing moves through the centre of vision faster than the road does: the
   * strips are out on the shoulder and the median, and what is down the
   * middle is painted lane markings at road speed. No weather, so nothing
   * falls toward the camera.
   *
   * The one thing to watch here is BRIGHTNESS rather than motion. A lit
   * horizon dead ahead is on screen for the whole run, which is the fifth
   * cause in CLAUDE.md's list - so the dome glow is tight and low and the sun
   * is the only thing above the bloom threshold.
   */
  comfort: {
    centreMotion: 'lane paint only, at road speed',
    weather: 'none',
    brightness: 'lit horizon dead ahead; dome glow kept tight and low so the sky above it stays dark',
  },
};
