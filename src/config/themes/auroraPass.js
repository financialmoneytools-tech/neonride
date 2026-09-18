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
      // Thin enough that ridges 700 and 1000 units out survive as silhouettes.
      // They are that far out because closer ones read as flat walls, and the
      // whole reason for having them is a horizon, not an obstacle.
      density: 0.0012,
    },

    road: {
      surface: {
        // The asphalt stays DARK. A snowy road is not a white road - it is a
        // black one with white either side of it, and that contrast is the
        // whole picture. What it gets is an icy sheen rather than a violet one.
        asphaltColor: 0x06070b,
        sheenColor: 0x2a6f7d,
        sheenStrength: 0.7,

        // AND THE GROUND IS SNOW. This is the single change that makes the
        // theme read: a pale verge throwing cool light back up, with a
        // brighter ploughed ridge hard against each edge of each carriageway.
        // Everything else here is detail on top of it.
        groundColor: 0x3f5d70,
        bankColor: 0x30475a,
        bankWidth: 3.2,

        // Snow lies in the median too, so the barrier stands in white.
        medianColor: 0x4a6a7e,

        // The far carriageway keeps more of itself than on Galaxy Road: it has
        // snow banks and headlights of its own to show, and dimming it to
        // nothing would throw them away.
        oncomingDim: 0.7,
      },
      edges: {
        leftColor: 0x7ef0ff, // ice blue, median side
        rightColor: 0x4dffa8, // green, shoulder side
        // Under the bloom threshold, like the base theme. It was 1.2, which
        // was the brightest edge in the project and the worst offender on the
        // phone.
        // Under the bloom threshold, like the base theme. It was 1.2, the
        // brightest edge in the project and the worst offender on the phone.
        intensity: 0.57,
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
      // SNOW ON THE BARRIER, not an amber delineator. Continuous white along
      // the top is what a ploughed central reservation looks like, and it is
      // the detail that says the whole scene is under snow rather than lit
      // blue. The cap is widened so it overhangs, like snow does.
      color: 0x2c4354,
      capColor: 0xdbe9f2,
      capWidth: 0.86,
      capHeight: 0.12,
    },

    roadside: {
      // The pylons step back and cool off. The lamps and the trees carry the
      // roadside here, and three rows of neon down each verge would be a fence.
      leftColor: 0x5ce0ff,
      rightColor: 0x4dffa8,
      stationsPerChunk: 6,
    },

    scenery: {
      density: { pine: 1.0, rock: 0.5, lampLeft: 0.8, lampRight: 0.8, gantry: 0.5 },
    },

    weather: { kind: 'snow' },

    mountains: {
      // Closer and taller, so the pass reads as a pass. Pale tops: the ridges
      // are the only large pale mass in the frame and they are what puts the
      // aurora behind something instead of behind nothing.
      // LOW ENOUGH TO LEAVE THE AURORA SOMEWHERE TO BE. At 175 and 280 the far
      // ridge reached 26.6 degrees of elevation and the aurora's top reached
      // 33, so about six degrees of it survived - a sliver at the very top of
      // the frame, which is why the sky read as a green wash with no ribbons in
      // it. Measured, not guessed: atan(height / distance) against the aurora's
      // own atan(top / radius).
      layers: [
        { distance: 700, height: 235, floor: 0.3, color: 0x16232f },
        { distance: 1000, height: 370, floor: 0.35, color: 0x101d28 },
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
        // LOW. A broad green pool sits in exactly the arc the aurora occupies
        // and flattens it: the ribbons need a dark sky to be ribbons against,
        // and the dome's job here is only to keep the horizon from being black.
        intensity: 0.28,
        falloff: 6.0,
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
      // CLOSER, so it subtends more sky. The curtain is a cylinder, so its
      // angular height is atan(top / radius): at the default 1120 the top sat
      // at 33 degrees with the frame's top edge at 31.8, and the whole thing
      // was squeezed between the ridge line and the edge of the picture. At 760
      // it reaches 48 and becomes the thing in the sky that it is supposed to
      // be. Nothing is fogged at this range because the material does not take
      // fog, so bringing it in costs nothing but angle.
      // The ridges have to be IN FRONT of this and below it, and both of those
      // are angles rather than opinions. Measured with a probe: the near
      // mountain slab's bounding sphere sat 357 units from the camera and the
      // aurora's 390, so the curtain was literally behind a wall - which is
      // also what put a flat slab across the upper left of the frame. The
      // curtain goes back out to where the sky is, and the ridges go out past
      // 700 where fog turns them into silhouettes instead of walls.
      radius: 1120,
      height: 900,
      baseY: -60,
      // The event. Wider, taller and stronger than the horizon curtain Galaxy
      // Road carries, and with the warm under layer taken almost to nothing -
      // there is no sunset here, only cold light.
      colorLow: 0x3dffa0, // green at the bottom
      colorHigh: 0xa46bff, // into purple higher up
      intensity: 4.5,
      warmIntensity: 0.0, // no sunset here, only cold light
      // THE PURPLE HAS TO LAND IN FRAME. The colour ramps from colorLow at the
      // bottom of a ribbon to colorHigh at its top, so a curtain whose tops are
      // above the top edge of the picture is a green curtain. With the cylinder
      // at radius 760 spanning -60 to 840, 0.55 puts the tops at about 30
      // degrees of elevation against a frame edge at 31.8 - just inside, which
      // is where the purple wants to be.
      // Ribbons from about 20 degrees of elevation - just above the far ridge -
      // to 30, against a frame whose top edge is at 31.8. The colour ramps from
      // green at the bottom of a ribbon to purple at its top, so the tops have
      // to land INSIDE the picture or the whole aurora is green.
      // Solved against the ridge line rather than chosen. The cylinder spans
      // -60 to 840 at radius 1120, so a column's top in degrees is
      // atan((top * 900 - 60) / 1120), against mountains that reach 20.3 and a
      // frame edge at 31.8.
      //
      // `top` is where a ribbon ENDS, not where it stops being visible. The
      // shader fades the body across the whole height - smoothstep(top, 0, y) -
      // so a column is already dim at two thirds of its top, and the visible
      // extent lands well below the number. Solved for 0.88 gave tops at 27
      // degrees on paper and about 20 on screen; this is the correction, and it
      // is also what lifts the purple into shot, since the colour ramps from
      // green at a ribbon's foot to purple at its top.
      curtainHeight: 1.05,
      arcHalfWidth: 1.15,

      // RIBBONS, not a wash, and the theme is NAMED after them so they carry
      // the frame. rayScale is a frequency: DOWN makes each ribbon wider, and
      // 5.0 against the default 26 means a handful of broad curtains rather
      // than a comb. rayContrast separates them harder.
      //
      // THE GAPS ARE WHAT KEEPS THE STARS. Brightness alone would wash the sky;
      // what makes these read as ribbons is that the sky between them is DARK,
      // which is clusterFloor - so the intensity goes up and the floor comes
      // down together. The whole curtain is additive, so it never subtracts
      // from a star, and in the gaps it adds almost nothing.
      rayScale: 5.0,

      // rayContrast AND rayHeight BOTH PUSH THE CURTAIN DOWN, which is the
      // opposite of what their names suggest and is why two rounds of raising
      // them made the aurora vanish completely.
      //
      // The shader computes each column's top as
      //     top = curtainHeight + variation + rayHeight * (rays - 0.5)
      // and `rays` is noise raised to the power of rayContrast. Noise sits
      // around 0.5, so a high contrast crushes it: 0.5^3.8 is 0.07, which
      // makes that last term a large NEGATIVE number. At rayContrast 3.8 and
      // rayHeight 0.95 the tops landed at 0.375 of the cylinder - 13.9 degrees
      // of elevation - and the mountains reach 20.3. The whole curtain was
      // behind the ridge line. Raising the intensity to 20 changed nothing,
      // because none of it was on screen.
      //
      // 2.2 leaves rays at about 0.22, which is three times the old value and
      // makes the ribbons brighter at the same intensity, and a smaller
      // rayHeight stops the tops being dragged down with it.
      rayContrast: 2.2,
      rayHeight: 0.45,

      clusterScale: 3.0,
      // The gaps are what keeps the stars. A low floor means whole stretches
      // of the arc go dark, and a star in a gap is a star.
      clusterFloor: 0.22,
      clusterRange: 0.34,

      // Slowly. An aurora that hurries reads as a shader.
      waveScale: 1.7,
      waveSpeed: 0.022,
      arcDrift: 0.004,
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
