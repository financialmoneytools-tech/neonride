/**
 * RED PLANET - the canyon road, with a world hanging over it.
 *
 * One enormous planet low on the horizon, canyon walls close on both sides,
 * red rock everywhere and dust blowing across the road. Orange on the
 * shoulder, deep red on the median. The most enclosed of the six: everywhere
 * else the sky is wide, and here it is a strip between two walls with
 * something very large sitting in it.
 *
 * THE PLANET IS THE THEME, and it is deliberately too big. A body that reads
 * as "a moon" is decoration; one that fills a third of the horizon is a
 * place. It is shaded hard so it is a sphere rather than a disc, and it sits
 * slightly off centre so the road does not run into it like the sunset does -
 * two roads that both point at their own sky object would be the same road.
 *
 * DUST IS THE WEATHER and it is the gentlest of the three: it drifts sideways
 * rather than falling, which matters for the comfort block below.
 */
export const redPlanet = {
  name: 'Red Planet',

  world: {
    fog: {
      // Thick, and red. Dust in the air is most of why a canyon reads as
      // deep, and this is the densest fog of the six.
      color: 0x2a1410,
      density: 0.0024,
    },

    road: {
      surface: {
        // Dark basalt with a warm sheen. The road is the one thing here that
        // is not red, which is what keeps it legible against everything else.
        asphaltColor: 0x0b0809,
        sheenColor: 0x9a3a1e,
        sheenStrength: 0.8,
        // Red ground, kept dark. Under bloom a bright red verge is a wide
        // glowing band, which is the fault Aurora Pass fixed twice with snow.
        groundColor: 0x2e1610,
        bankColor: 0x3a1c14,
        bankWidth: 2.4,
        medianColor: 0x44201a,
        oncomingDim: 0.5,
      },
      edges: {
        leftColor: 0xff3d2e, // deep red, median side
        rightColor: 0xffa53d, // orange, shoulder side
        intensity: 0.56,
      },
      markings: {
        // Dust on the paint. Warm off-white, and the dimmest markings of the
        // six because the fog is doing so much already.
        color: 0xe0d0bc,
        intensity: 0.34,
      },
      strips: {
        lanes: [
          { anchor: 'shoulder', inset: -1.2, width: 0.06, color: 0xffa53d, repeats: 5, duty: 0.4, speed: 0, intensity: 0.44 },
          { anchor: 'medianInner', inset: -0.4, width: 0.06, color: 0xff3d2e, repeats: 4, duty: 0.34, speed: 0, intensity: 0.42 },
          { anchor: 'medianOuter', inset: 0.4, width: 0.06, color: 0xffd166, repeats: 5, duty: 0.3, speed: 0, intensity: 0.26 },
          { anchor: 'farVerge', inset: 1.2, width: 0.06, color: 0xff6a2a, repeats: 3, duty: 0.42, speed: 0, intensity: 0.22 },
        ],
      },
    },

    median: {
      color: 0x4a231b,
      capColor: 0xff9a66,
      capWidth: 0.6,
      capHeight: 0.08,
    },

    roadside: {
      leftColor: 0xff3d2e,
      rightColor: 0xffa53d,
      stationsPerChunk: 5,
    },

    scenery: {
      // ROCK, AND ALMOST NOTHING ELSE. No trees on a dead world, few lamps -
      // this road is not maintained - and no gantries, because there is
      // nowhere to sign the way to. The rock density is the highest any
      // theme uses and it is what fills the verges.
      density: { pine: 0, rock: 1.0, lampLeft: 0.3, lampRight: 0.3, gantry: 0 },
    },

    weather: { kind: 'dust' },

    mountains: {
      // CANYON WALLS. Close and very tall, which is the opposite of every
      // other theme's use of this system: elsewhere the ridges are a horizon,
      // here they are the sides of the room. Tall enough to cut the sky down
      // to a strip, low enough that the planet still clears them - the planet
      // sits at 0.2 radians of elevation and the near wall reaches about 0.36
      // at its distance, so the planet's lower limb is behind the wall and
      // most of the disc is above it, which is exactly the shot.
      enabled: true,
      // PUSHED OUT. At 340 the near wall was a flat black slab with a hard
      // straight edge across the right of the frame rather than a canyon -
      // the identical fault config/themes/auroraPass.js documents for its
      // ridges, which is that a ridge closer than the fog can soften reads
      // as a wall of geometry instead of as a horizon. Far enough out that
      // the fog turns them into silhouettes, tall enough that they still cut
      // the sky down to a strip.
      // MEASURED, NOT GUESSED, and this took two goes. A ridge's angular
      // height is atan(height / distance) against a frame whose top edge is
      // at 31.8 degrees. At 340/230 the near wall reached 34 - taller than
      // the picture - and at 620/300 it still reached 26, which is a black
      // slab across the right third of the frame with a hard straight edge
      // on it rather than a canyon. Photographed both times.
      //
      // 800/190 reaches 13.4 degrees and 1200/320 reaches 15, so the rim
      // sits in the lower half of the sky where fog can soften it into a
      // silhouette - which is the only thing that makes these read as
      // distance rather than as geometry. The canyon feeling comes from the
      // fog density and the rock density, not from putting a wall on the
      // lens.
      layers: [
        { distance: 800, height: 190, floor: 0.35, color: 0x2a120e },
        { distance: 1200, height: 320, floor: 0.4, color: 0x1c0c0a },
      ],
    },

    // A dead road: the least traffic of the six, and what there is is heavy.
    // Nobody commutes on Mars; things get hauled.
    traffic: {
      mix: { sedan: 0.45, van: 0.7, ambulance: 0.2, jeep: 1, boxTruck: 0.9, semi: 0.8, motorcycle: 0.3 },
      look: {
        jeep: { stripColor: 0xffa53d },
        boxTruck: { stripColor: 0xff6a2a },
        sedan: { stripColor: 0xff3d2e },
      },
    },
  },

  sky: {
    dome: {
      // A rust horizon under a near black zenith. Thin atmosphere: the sky
      // goes dark FAST with elevation, which is what stops this reading as a
      // second sunset.
      colorBase: 0x3a1610,
      colorMid: 0x2a1410,
      colorTop: 0x070308,
      glow: {
        color: 0xc9421e,
        azimuth: 0.35,
        elevation: 0.05,
        intensity: 0.4,
        falloff: 6.5, // tight, so the dark comes in quickly above it
      },
    },

    stars: {
      // No atmosphere to speak of: the hardest, steadiest stars in the game.
      // Almost no twinkle, because twinkle is air.
      twinkleAmount: 0.12,
      trailBrightness: 1.55,
    },

    bodies: {
      list: [
        {
          // THE PLANET. Off centre, so the road does not run into it the way
          // Sunset Highway's sun is run into, and very large: a body that
          // reads as a moon is decoration and one this size is a place.
          azimuth: 0.42,
          elevation: 0.2,
          radius: 420,
          color: 0xd88a5a,
          edgeColor: 0x8a3a24,
          opacity: 0.9,
          bands: 0,
          halo: 0.16,
          haloOpacity: 0.28,
          // Hard shading, lit from low on the far side, which is what makes
          // a disc this big read as a sphere instead of a wall.
          shade: 0.92,
          shadeAzimuth: -2.1,
        },
      ],
    },

    nebula: {
      // Very little. The planet is the object in this sky and a nebula
      // behind it would be two subjects; what is left is a faint warm dust
      // band high up so the zenith is not empty.
      clouds: [
        { azimuth: -1.8, elevation: 0.95, distance: 1150, scale: 620,
          color: 0xb05a3a, opacity: 0.16, rotation: 0.3, breathSpeed: 0.03, breathAmount: 0.2, variant: 1 },
      ],
    },

    aurora: {
      // None. No magnetosphere, no aurora, and it would fight the planet.
      intensity: 0,
      warmIntensity: 0,
    },
  },

  /**
   * MOTION COMFORT.
   *
   * DUST IS WEATHER AND IT GOES THROUGH motionScale('weather') like the
   * others - but it is the gentlest of the three by some distance and it is
   * worth saying why, because the instinct is to treat all weather alike.
   * Snow falls at 2.4 and rain at 22; dust falls at 0.4 and DRIFTS at 7 units
   * sideways. Lateral motion across the frame is far easier for the eye to
   * ignore than motion toward it, which is the first cause on CLAUDE.md's
   * list - things coming at the camera are what the eye tries to track.
   *
   * The enclosure is the thing to watch instead. Canyon walls close on both
   * sides fill the periphery with structure going past at road speed, which
   * is MORE optic flow than an open road gives even though nothing is moving
   * faster. That is a peripheral cue and peripheral is where speed cues
   * belong, so it is correct here - but it is the reason this road feels
   * fastest, and anyone sensitive should be sent to Nebula Coast.
   */
  comfort: {
    centreMotion: 'lane paint only, at road speed',
    weather: 'dust, scaled by motionScale(weather) - drifts sideways rather than falling at the camera',
    brightness: 'thick red fog and a large dim planet; nothing above the bloom threshold but the planet core',
    note: 'the most enclosed road - highest peripheral optic flow of the six',
  },
};
