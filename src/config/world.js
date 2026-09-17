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
    density: { pine: 0, rock: 0, lampLeft: 0, lampRight: 0 },

    kinds: {
      pine: {
        shape: 'pine',
        perChunk: 26, // 26 over 200 units, both sides
        side: 'both',
        setback: 1.0, // beyond the ribbon rim on its own side
        spread: 15, // depth of the band they scatter through
        scaleMin: 0.9, scaleMax: 2.1,
        sink: -0.3, // a touch into the ground, so none of them float
        sides: 7, // radial segments: a 7 sided cone still reads as round
        trunkRadius: 0.22, trunkHeight: 1.1,
        height: 7.5, radius: 1.9,
        trunkColor: 0x1a1410,
        needleColor: 0x0d2119,
        snow: 0.55, // share of the crown under snow; 0 for a bare pine
        snowColor: 0x9fc6d8,
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
      lampRight: {
        shape: 'lampRight',
        perChunk: 7, // one every ~29 units
        side: 'right',
        setback: 0.5, spread: 0.4,
        scaleMin: 1, scaleMax: 1,
        height: 9.5, postWidth: 0.3, armLength: 3.4,
        headLength: 1.5, headHeight: 0.28, headWidth: 0.6,
        postColor: 0x101018,
        headColor: 0xcfe9ff,
        toneMapped: false, // the head is a light; it must be allowed to blow out
      },
      lampLeft: {
        shape: 'lampLeft',
        perChunk: 7,
        side: 'left',
        setback: 0.5, spread: 0.4,
        scaleMin: 1, scaleMax: 1,
        height: 9.5, postWidth: 0.3, armLength: 3.4,
        headLength: 1.5, headHeight: 0.28, headWidth: 0.6,
        postColor: 0x101018,
        headColor: 0xcfe9ff,
        toneMapped: false,
      },
    },
  },

  // WEATHER. One buffer, three kinds; the theme picks which, or none. See
  // world/Weather.js - and note that it goes through motionScale('weather'),
  // because it is the strongest nausea trigger in the project.
  weather: {
    seed: 777,
    kind: null, // set by the theme; null is clear weather
    count: 1800,
    // The box it falls in, centred on the camera. Near field on purpose: the
    // sky dome is at 1500 and must never be dimmed by weather in front of it.
    box: [90, 44, 130],
    kinds: {
      snow: {
        color: 0xdbeaf5, opacity: 0.8,
        fall: 3.2, drift: [1.1, 0.8],
        streakMin: 0.22, streakFromSpeed: 0.0010,
      },
      rain: {
        color: 0x9fc8ff, opacity: 0.55,
        fall: 22, drift: [1.6, 0.6],
        streakMin: 0.8, streakFromSpeed: 0.006,
      },
      dust: {
        color: 0xc98a4a, opacity: 0.35,
        fall: 0.4, drift: [7, 3],
        streakMin: 0.5, streakFromSpeed: 0.004,
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
    postWidth: 0.45,
    postDepth: 0.45,
    postHeight: 5.2,
    postColor: 0x0b0b16,
    tubeWidth: 0.26,
    tubeDepth: 0.26,
    tubeHeight: 3.9,
    tubeLift: 0.7, // tube base above the road
    tubeInset: 0.34, // tube pushed off the post face, toward the road
    leftColor: 0x22f7ff,
    rightColor: 0xff2bd0,
  },

  mountains: {
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
