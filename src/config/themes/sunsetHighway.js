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
        // PALE CONCRETE, not tarmac. This is the single biggest thing that
        // separates this road from Red Planet below the sky line: a desert
        // interstate is poured concrete, grey and dusty, with the slab joints
        // as the texture. Red Planet is dark basalt. Two warm dark asphalts
        // read as the same road; concrete against basalt does not.
        asphaltColor: 0x232026,
        sheenColor: 0xc98a4a,
        sheenStrength: 0.55,
        // Pale desert sand, and it is allowed to be pale HERE because there
        // is no snow competing with it and the verge is the second thing that
        // tells the two roads apart.
        groundColor: 0x4a3a2a,
        bankColor: 0x5c4834,
        bankWidth: 4.0,
        medianColor: 0x4a3a2a,
        oncomingDim: 0.6,
      },
      edges: {
        leftColor: 0xff5ea8, // pink, median side
        rightColor: 0xff9a3d, // orange, shoulder side
        intensity: 0.55,
      },
      markings: {
        // YELLOW, and American. A desert interstate is yellow centre lines on
        // pale concrete, which is a different road surface from every other
        // theme here at a glance and needs no sky to tell you so.
        color: 0xf0c04a,
        intensity: 0.46,
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
      density: { pine: 0, rock: 1.0, lampLeft: 1.0, lampRight: 1.0, gantry: 1.0 },
      // PALE SANDSTONE, and warm sodium light. The props were near black -
      // props.js paints rock 0x14161c - so on every road they were invisible
      // lumps, which is most of why six roads looked like one road with
      // different skies. See `tint` in config/world.js.
      tint: {
        rock: 0x8a6a42,
        lampLeft: 0xa89078, lampRight: 0xa89078,
        gantry: 0x9a8470,
        // Sodium. The one lamp colour that says "highway at dusk" on sight.
        lampLeftGlow: 0xffa53d, lampRightGlow: 0xffa53d,
        gantryGlow: 0xffc978,
      },
    },

    weather: { kind: null },

    mountains: {
      enabled: true,
      // DESERT HILLS, and now they have something to be seen against. The
      // sun spans 6.5 to 15.5 degrees of elevation, so a ridge reaching 7.5
      // sits under it and breaks its lower limb the way a real horizon does
      // - measured as atan(height / distance), not guessed.
      //
      // Near black on purpose HERE, unlike every other road: against a hot
      // horizon a dark ridge is a silhouette, which is the one place in this
      // project where near black is the right answer.
      layers: [
        { distance: 620, height: 82, floor: 0.34, color: 0x1a0a16 },
        { distance: 980, height: 150, floor: 0.4, color: 0x120812 },
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
    // ================= IT IS A SUNSET, AND IT COMMITS =================
    //
    // The first pass put a banded retro sun in a black starry night sky and
    // it read as two pictures at once - reported, correctly, as "pick one".
    // This picks the sunset.
    //
    // WHAT THAT MEANS AND WHAT IT DOES NOT. The horizon is a genuine hot
    // band, bright enough to silhouette the hills against, and the sky above
    // it ramps through orange to magenta to deep violet. The ZENITH still
    // goes dark and still holds stars, because docs/THEMES.md makes stars a
    // hard rule on every road and because that gradient - hot at the bottom,
    // black at the top, stars only in the black - is what dusk actually
    // looks like an hour after the sun has gone. It is not daylight, and it
    // is not the night sky with a sun pasted on it.
    dome: {
      // Hot orange at the horizon, magenta through the middle, near black at
      // the top. A three stop ramp rather than the flat night the other
      // roads use, and the reason this road is recognisable in a thumbnail.
      colorBase: 0xd4562a,
      colorMid: 0x6e1f4a,
      colorTop: 0x090418,
      glow: {
        color: 0xff9a3d,
        azimuth: 0, // dead ahead, behind the sun
        elevation: 0.0,
        // BRIGHT AND WIDE, which is the opposite of what every other theme
        // wants and is the point. A sunset that does not light its own
        // horizon is a night sky with a coloured strip at the bottom.
        //
        // The stars survive it because the falloff is what controls HEIGHT,
        // not the intensity: at 3.4 the pool is gone by about 25 degrees of
        // elevation, and the starfield lives above that.
        intensity: 1.15,
        falloff: 3.4,
      },
    },

    stars: {
      // Fewer and harder, because it is dusk rather than night. They belong
      // to the top of the frame here; the bottom of the sky is too bright
      // for them and that is correct rather than a loss.
      twinkleAmount: 0.3,
      trailBrightness: 0.85,
    },

    bodies: {
      list: [
        {
          // THE RETRO SUN. Dead ahead, sitting ON the horizon so the road
          // runs into it, and banded.
          // 9 degrees across, centred 11 degrees up: spans 6.5 to 15.5, so
          // the lower limb clears the road. It was 15.9 degrees centred at
          // 4.9 - spanning -3.1 to 12.8 - which put half the disc under the
          // horizon and the rest on the vanishing point.
          azimuth: 0,
          elevation: 0.192,
          radius: 107,
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
