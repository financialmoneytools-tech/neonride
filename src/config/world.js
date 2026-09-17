import { traffic } from './traffic.js';
import { road } from './road.js';

/**
 * NEON RIDE - world settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 */

// --- World: road, roadside, mountains and the travelling camera ---
export const world = {
  // Vehicles to overtake; see config/traffic.js.
  traffic,

  // The road itself lives in ./road.js - four lanes, painted markings, a
  // median and an oncoming carriageway outgrew a section of this file.
  road,

  seed: 20260914, // one seed drives the road path and the mountain ridges

  // Distance fog. The color must match what the sky dome paints at the
  // horizon (sky.dome.colorMid), because fogged geometry converges to exactly
  // this value and therefore melts into the sky rather than into a grey band.
  //
  // The density is an artistic knob, NOT the thing that hides a spawning
  // chunk: road.surface.neonFadeEnd does that, and it does it absolutely.
  // Raising the density pulls the wall of fog closer and buries the mountains
  // with it; lowering it opens the view up.
  fog: {
    color: 0x050310,
    density: 0.0013, // road readable to ~500, everything gone by ~1300
  },

  // The barrier down the middle. It is what turns two strips of asphalt into a
  // motorway: without it the far carriageway reads as more of our road, and the
  // headlights on it read as traffic coming straight at the rider.
  median: {
    enabled: true,
    segmentsPerChunk: 50, // one box every 4 units
    overlap: 0.35, // segments overlap so a bend does not open a wedge of gap
    width: 0.62,
    height: 0.95,
    color: 0x1a1a24, // concrete at night: just light enough to silhouette
    capWidth: 0.7,
    capHeight: 0.07,
    // AMBER, not cyan. A cool cap sat a couple of metres from the cyan edge
    // line and read as a second edge line rather than as the top of a wall,
    // which made the median look like part of our carriageway. Amber is what a
    // real median delineator is, and it is the one hue nothing else here uses.
    capColor: 0x8a5410,
  },

  // Traffic on the far carriageway. Scenery only - see world/Oncoming.js - and
  // the reason the median exists.
  oncoming: {
    enabled: true,
    seed: 5150,
    count: 26, // scaled by the quality preset's trafficScale
    spawnAhead: 1000,
    spawnJitter: 240,
    recycleBehind: 120,
    scaleJitter: 0.1,
    // A fraction of the PLAYER's maximum, like traffic. They close at the sum
    // of the two speeds, so even a slow one passes quickly.
    speed: { min: 0.42, max: 0.72 },
    body: { width: 2.0, height: 1.35, length: 4.6, color: 0x0a0a12 },
    lamp: {
      color: 0xffffff, // headlights are cold white, not warm
      // Big and at full opacity: the sprite's alpha falls away fast, so most
      // of the quad is nearly nothing and only the core carries. At 2.6 and
      // 0.85 a car 100 units off was a grey speck.
      size: 3.4,
      spacing: 1.5,
      y: 0.75,
      opacity: 1.0,
      textureSize: 64,
    },
  },

  // ROADSIDE PROPS. Every kind listed here is allocated at load, whatever the
  // fitted theme uses; a theme sets `density` and nothing else. That is the
  // rule the whole theme system rests on - see docs/THEMES.md - because an
  // instance buffer cannot be resized mid run and the road is meant to change
  // theme every few kilometres without a reload. A kind at density 0 is parked
  // beyond the fog wall: no fragments, no draw call of its own, just memory.
  scenery: {
    seed: 424242,

    // Set by the theme. Zero here, which IS Galaxy Road: a road in space has
    // no trees beside it.
    density: { pine: 0, rock: 0, lampLeft: 0, lampRight: 0, gantry: 0 },

    kinds: {
      pine: {
        shape: 'pine',
        perChunk: 26, // 26 over 200 units, both sides
        side: 'both',
        setback: 1.0, // beyond the ribbon rim on its own side
        spread: 15, // depth of the band they scatter through
        scaleMin: 0.9, scaleMax: 2.1,
        sink: -0.3, // a touch into the ground, so none of them float
        sides: 8, // radial segments: an 8 sided cone still reads as round
        trunkRadius: 0.22, trunkHeight: 1.0,
        height: 8.2, radius: 2.1,
        tiers: 4, // stacked skirts; the banding IS the silhouette of a pine
        taper: 0.52, // how much narrower the top tier is than the bottom
        spire: 0.35, // upper tiers grow taller, which sharpens the top
        overlap: 0.62, // each tier starts this far up the one below
        snowLine: 0.5, // share of a tier's height that carries snow, from the top
        trunkColor: 0x1a1410,
        needleColor: 0x122a22,
        snowColor: 0xcfe4f0,
      },
      rock: {
        shape: 'rock',
        perChunk: 18,
        side: 'both',
        setback: 1.2, spread: 18,
        scaleMin: 0.6, scaleMax: 2.2,
        radius: 1.1, squash: 0.7,
        color: 0x14161c,
      },
      // OVERHEAD SIGN GANTRY. The one prop that spans the road instead of
      // standing beside it, so it is placed on the path centre - see the
      // 'centre' side in world/Scenery.js. The legs land at +/-10.5: outside
      // our edge lines at +/-7.6 on the right, and in the median on the left,
      // which is where a real gantry's leg goes.
      gantry: {
        shape: 'gantry',
        perChunk: 2, // one every 100 units before the theme's density
        side: 'centre',
        setback: 0, spread: 0,
        scaleMin: 1, scaleMax: 1,
        span: 21,
        height: 7.4, // clear of a 4.1 m box truck with room to spare
        legWidth: 0.34,
        footHeight: 0.5,
        beamHeight: 0.55,
        beamDepth: 0.4,
        legColor: 0x2a323d,
        toneMapped: true,
        glow: {
          opacity: 1,
          panel: {
            size: 2.7,
            gap: 0.45,
            color: 0xffffff, // the atlas carries the colour; this is the gain
            // Which atlas cell each panel shows, left to right. Fixed rather
            // than random: a gantry has to read the same every time that
            // stretch of road is rebuilt, and a sign that changes its mind is
            // worse than a sign that repeats.
            cells: [[1, 0], [0, 0], [0, 1]],
          },
          sign: {
            textureSize: 512,
            plateColor: '#0b1622',
            borderColor: '#6fe8ff',
            textColor: '#d8f6ff',
          },
        },
      },

      lampRight: {
        shape: 'lampRight',
        perChunk: 7, // one every ~29 units
        side: 'right',
        setback: 0.5, spread: 0.4,
        scaleMin: 1, scaleMax: 1,
        height: 9.5, postWidth: 0.32, armLength: 3.4,
        headLength: 1.5, headHeight: 0.28, headWidth: 0.6,
        // The post has to be light enough to silhouette against a snow verge,
        // or the head floats. Against Galaxy Road's black it makes no odds.
        postColor: 0x27303c,
        headColor: 0x9fe2ff, // ice blue, and bright: this is a light source
        toneMapped: false, // it is a light; it must be allowed to blow out
        // The light it throws. See buildLampGlow in world/scenery/props.js -
        // an additive pool on the road and a halo at the head, on their own
        // mesh, because light is not a surface.
        glow: {
          color: 0x7fd4ff,
          opacity: 0.85,
          size: 9.0, // the pool across the road
          stretch: 2.2, // and along it, because a lamp lights a stretch
          lift: 0.06, // clear of the road surface, so they do not z-fight
          haloSize: 3.2,
          textureSize: 128,
          texture: { coreStop: 0.06, coreAlpha: 0.9, midStop: 0.3, midAlpha: 0.32,
            tailStop: 0.62, tailAlpha: 0.06 },
        },
      },
      lampLeft: {
        shape: 'lampLeft',
        perChunk: 7, // one every ~29 units
        side: 'left',
        setback: 0.5, spread: 0.4,
        scaleMin: 1, scaleMax: 1,
        height: 9.5, postWidth: 0.32, armLength: 3.4,
        headLength: 1.5, headHeight: 0.28, headWidth: 0.6,
        // The post has to be light enough to silhouette against a snow verge,
        // or the head floats. Against Galaxy Road's black it makes no odds.
        postColor: 0x27303c,
        headColor: 0x9fe2ff, // ice blue, and bright: this is a light source
        toneMapped: false, // it is a light; it must be allowed to blow out
        // The light it throws. See buildLampGlow in world/scenery/props.js -
        // an additive pool on the road and a halo at the head, on their own
        // mesh, because light is not a surface.
        glow: {
          color: 0x7fd4ff,
          opacity: 0.85,
          size: 9.0, // the pool across the road
          stretch: 2.2, // and along it, because a lamp lights a stretch
          lift: 0.06, // clear of the road surface, so they do not z-fight
          haloSize: 3.2,
          textureSize: 128,
          texture: { coreStop: 0.06, coreAlpha: 0.9, midStop: 0.3, midAlpha: 0.32,
            tailStop: 0.62, tailAlpha: 0.06 },
        },
      },
    },
  },

  // WEATHER. One buffer, three kinds; the theme picks which, or none. See
  // world/Weather.js - and note that it goes through motionScale('weather'),
  // because it is the strongest nausea trigger in the project.
  weather: {
    seed: 777,
    kind: null, // set by the theme; null is clear weather
    count: 2600, // there is headroom on the phone; snow wants to be dense
    // The box it falls in, centred on the camera. Near field on purpose: the
    // sky dome is at 1500 and must never be dimmed by weather in front of it.
    box: [90, 44, 130],
    // `size` is the flake's diameter in METRES at the camera; the shader turns
    // it into pixels. Streaking starts at `streakFrom` units per second and
    // grows at `streakRate` per unit, capped at `streakMax` - so below about
    // half speed every flake is a circle and only a fast run smears them.
    kinds: {
      snow: {
        // Plain white. Not blue-white: the chromatic aberration in the post
        // chain fringes a bright tinted particle, and a blue-white flake
        // fringes MAGENTA, which is the one thing snow may never look like.
        color: 0xffffff, opacity: 0.85,
        size: 0.13,
        fall: 2.4, drift: [1.4, 1.0], // soft, wandering, nothing like rain
        streakFrom: 90, streakRate: 0.022, streakMax: 3.0,
      },
      rain: {
        color: 0xbcd8ff, opacity: 0.6,
        size: 0.09,
        fall: 22, drift: [1.6, 0.6],
        streakFrom: 0, streakRate: 0.06, streakMax: 9.0,
      },
      dust: {
        color: 0xc98a4a, opacity: 0.4,
        size: 0.22,
        fall: 0.4, drift: [7, 3],
        streakFrom: 40, streakRate: 0.03, streakMax: 5.0,
      },
    },
  },

  roadside: {
    // Pylon spacing is the strongest speed cue there is, because pylons are the
    // only thing that passes CLOSE to the camera. Rate = speed / spacing: at 20
    // units and 235 units per second that is 11.8 a second, against 2.4 at the
    // old 40 unit spacing and 98 units per second.
    stationsPerChunk: 10, // pylon pairs per chunk, one every 20 units
    // How far OUTSIDE the outermost shoulder on its own side each pylon
    // stands. Not a distance from the centre line: the highway is asymmetric,
    // and a single offset put the left hand row in the middle of an oncoming
    // lane. world/Roadside.js derives both sides from world/road/layout.js.
    verge: 2.2,
    postWidth: 0.24,
    postDepth: 0.24,
    postHeight: 6.4,
    postColor: 0x232b36, // light enough to read as a pole against a snow verge
    baseWidth: 0.72, // the plinth it stands on, so it is not floating
    baseHeight: 0.42,
    // A THIN STRIP UP THE POLE. At 0.26 square and 3.9 tall, lifted clear of
    // the ground beside an invisible post, this was a flat slab of light
    // hanging in the air - and the single most objectionable thing in the
    // frame at close range.
    tubeWidth: 0.1,
    tubeDepth: 0.1,
    tubeHeight: 5.0,
    tubeLift: 0.55, // tube base above the road
    tubeInset: 0.17, // tube pushed off the post face, toward the road
    leftColor: 0x22f7ff,
    rightColor: 0xff2bd0,
  },

  mountains: {
    // A theme decides whether there is anything on the horizon at all. Galaxy
    // Road turns them off: nothing opaque may block the sky on a road in space.
    enabled: true,
    slabLength: 2400,
    slabsPerLayer: 2, // two slabs leapfrog each other along the travel axis
    columns: 28,
    baseY: -70, // bottom edge, well below the horizon
    depthJitter: 80, // per column push toward / away from the road
    ridge: { wavelength: 520, octaves: 3, lacunarity: 2.1, gain: 0.5 },

    // A ridge at lateral distance D only enters the frustum once it is more
    // than D / tan(hfov / 2) units ahead, so with the fog reaching about 1300
    // units anything past roughly 850 out is off screen at every moment of
    // its life. Both layers sit inside that limit on purpose; pushing them
    // further away does not make them look more distant, it deletes them.
    layers: [
      { distance: 420, height: 120, floor: 0.3, color: 0x0a0716 },
      { distance: 620, height: 210, floor: 0.35, color: 0x070512 },
    ],
  },
};
