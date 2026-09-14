/**
 * NEON RIDE - sky settings.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 */

// --- Sky ---
export const sky = {
  seed: 1337, // one seed drives stars, bands and nebula shapes

  // Inverted sphere carrying the vertical gradient
  dome: {
    radius: 1500,
    widthSegments: 64,
    heightSegments: 32,
    colorBase: 0x020108, // horizon and below: near black
    colorMid: 0x050310,
    colorTop: 0x0e0824, // the zenith stays dark; purple comes from the glow
    midPoint: 0.55,
    // A single localized pool of purple instead of a global purple wash
    glow: {
      color: 0x4a1a8a,
      azimuth: 2.15, // radians, shares the sky region with the magenta nebulae
      elevation: 0.5,
      intensity: 0.7,
      falloff: 6.0, // higher = tighter pool; 6 gives a roughly 50 degree pool
    },
  },

  stars: {
    textureSize: 64,
    // Star sprite shape as radial gradient stops
    texture: {
      coreStop: 0.08, coreAlpha: 0.95,
      midStop: 0.22, midAlpha: 0.5,
      tailStop: 0.5, tailAlpha: 0.08,
    },

    palette: [
      { color: 0xffffff, weight: 5 }, // white
      { color: 0xffc46a, weight: 3 }, // gold
      { color: 0x8fd0ff, weight: 3 }, // ice blue
    ],

    twinkleAmount: 0.3, // 0 = steady, 1 = full blink
    twinkleSpeed: 1.6,
    trailBrightness: 1.3, // trail stars are boosted so the structure reads

    // Sizes follow size = sizeMin + (sizeMax - sizeMin) * pow(random, exponent).
    // A high exponent keeps most stars small and leaves a few big bright ones.
    layers: [
      {
        name: 'deep',
        count: 24000,
        radius: 1400,
        sizeMin: 1.6, sizeMax: 9, sizeExponent: 4.5,
        brightness: 0.9, opacity: 1,
        rotationSpeed: 0.0022, // rad/s
        tilt: { x: 0, z: 0 }, // the bands carry their own orientation
        galacticFraction: 0.85, // share of stars pulled into the bands
      },
      {
        name: 'mid',
        count: 9000,
        radius: 1320,
        sizeMin: 2.2, sizeMax: 13, sizeExponent: 4,
        brightness: 1, opacity: 1,
        rotationSpeed: 0.0045,
        tilt: { x: 0.1, z: 0.2 },
        galacticFraction: 0,
      },
      {
        name: 'near',
        count: 3000,
        radius: 1240,
        sizeMin: 3.5, sizeMax: 20, sizeExponent: 3,
        brightness: 1.15, opacity: 1,
        rotationSpeed: 0.0075,
        tilt: { x: -0.15, z: 0.05 },
        galacticFraction: 0,
      },
    ],

    // Long exposure star trails: concentric curves wound around one common
    // axis. A star belongs to a line, not to a cluster.
    // Every polarAngle stays away from 90 degrees on purpose: a curve at
    // exactly 90 degrees is a great circle, which contains the antipode of
    // every point on it and therefore mirrors itself about the horizon.
    trails: {
      pole: { azimuth: 2.45, elevation: 0.62 }, // the axis the arcs wind around
      curves: 12,
      polarMin: 0.3, // radians from the pole: innermost arc
      polarMax: 2.5, // outermost arc; arcs wrap past the pole's equator so
      // the whole sky carries structure, leaving only a small empty cap
      polarJitter: 0.045, // per curve offset so the spacing is not machine even
      tiltJitter: 0.05, // per curve rotation so they are only roughly parallel
      jitter: 0.011, // perpendicular scatter of a star off its line
      wobbleAmount: 0.032, // noise bend of the curve
      wobbleScale: 2.2,
      densityScale: 2.6, // noise frequency of the bright knots along a curve
      densityContrast: 1.6,
      densityFloor: 0.45, // high floor: knots brighten the arc, never break it
      weightFalloff: 0.9, // outer curves get progressively fewer stars
      attempts: 6, // rejection sampling budget per star
    },
  },

  nebula: {
    textureSize: 256,
    textureVariants: 3,
    noiseScale: 2.6,
    fbm: { octaves: 5, lacunarity: 2.15, gain: 0.55 },
    contrastLow: 0.34, // smoothstep window applied to the noise
    contrastHigh: 0.86,
    falloffPower: 1.35, // radial fade that hides the sprite edge

    // A sprite spans atan((scale / 2) / distance) either side of its
    // elevation. Anything whose lower edge reaches the horizon smears its
    // soft edge along it and reads as a haze band rather than as a mass,
    // so every cloud keeps its lower edge at least 10 degrees up.
    // Magenta masses cluster near the dome glow; the cool masses sit
    // opposite, in blue and violet rather than green leaning cyan.
    clouds: [
      { azimuth: 2.15, elevation: 0.62, distance: 1150, scale: 900,
        color: 0xff2d6f, opacity: 0.45, rotation: 0.4, breathSpeed: 0.06, breathAmount: 0.22, variant: 0 },
      { azimuth: 1.55, elevation: 0.5, distance: 1150, scale: 760,
        color: 0xff4bd0, opacity: 0.36, rotation: -0.7, breathSpeed: 0.045, breathAmount: 0.25, variant: 2 },
      { azimuth: 2.9, elevation: 0.75, distance: 1150, scale: 820,
        color: 0xd83bff, opacity: 0.3, rotation: 1.1, breathSpeed: 0.07, breathAmount: 0.2, variant: 1 },
      { azimuth: -1.25, elevation: 0.52, distance: 1150, scale: 620,
        color: 0x3f6bff, opacity: 0.42, rotation: 0.15, breathSpeed: 0.035, breathAmount: 0.3, variant: 1 },
      { azimuth: -2.6, elevation: 0.62, distance: 1150, scale: 660,
        color: 0x9d3cf0, opacity: 0.38, rotation: -1.3, breathSpeed: 0.055, breathAmount: 0.24, variant: 0 },
    ],
  },

  // Curtain sitting on the horizon, confined to one arc of the sky
  aurora: {
    radius: 1120,
    height: 1000, // tall enough for the rays to reach ~30 degrees of sky
    baseY: -90, // bottom edge, relative to the camera
    radialSegments: 192,
    colorLow: 0x35ff9b, // green, near the horizon
    colorHigh: 0x9a3dff, // purple, higher up
    warmColor: 0xff7a2f, // warm orange under layer

    intensity: 0.95,
    warmIntensity: 0.18,
    warmHeight: 0.12, // how far up the warm layer reaches (0..1 of height)
    curtainHeight: 0.5, // average curtain height (0..1 of the cylinder)
    curtainVariation: 0.12,
    fadeBottom: 0.04, // softens the bottom rim; must stay below warmHeight

    waveScale: 2.3, // slow channel: bends the top edge of the curtain
    waveSpeed: 0.04,
    rayScale: 26, // fast channel: base frequency of the vertical rays
    rayContrast: 2.0, // higher = thinner, better separated rays
    rayHeight: 0.5, // how much each ray pushes the top edge up or down
    warpScale: 1.9, // domain warp: breaks the even equalizer spacing
    warpAmount: 0.55,
    clusterScale: 4.5, // large scale envelope, whole regions go dark
    clusterFloor: 0.28,
    clusterRange: 0.22, // how quickly a live region reaches full strength

    // The curtain covers one arc instead of wrapping the whole horizon
    arcCenter: -1.6, // world azimuth in radians, the default camera faces it
    arcHalfWidth: 0.7, // about 80 degrees; the horizontal fov is 107.5
    arcSoftness: 0.6, // fraction of the half width used for the fade
    arcDrift: 0.006, // rad/s of slow lateral drift
    warmArcScale: 1.25, // the warm glow spreads a little wider than the rays
    warmFloor: 0.15, // how much warm glow survives between the rays
  },
};
