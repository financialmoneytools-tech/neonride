/**
 * NEON RIDE - the four bikes.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.bikes.
 *
 * FOUR COLOURWAYS OF ONE DRAWING, not four drawings. The cockpit lesson in
 * STATUS.md is the reason and it has not softened: separately generated art
 * never matches, and the one thing that made the cockpit work was that every
 * relationship in it - what is in front of what, how big each thing is against
 * its neighbour - came from a single picture. Four pictures would be four sets
 * of relationships and three chances to get them wrong. So there is one sprite,
 * one mask derived from it by tools/paint-mask.py, and a shader that recolours
 * the masked region per bike while leaving the luminance alone.
 *
 * WHAT A COLOURWAY CAN AND CANNOT DO HERE, measured before any of it was
 * chosen. The bodywork in this drawing is nearly black - the fairing's mean is
 * RGB 34,36,51 with 69 per cent of it below luminance 40 - so a hue rotation on
 * its own is invisible. The recolour therefore lifts chroma as luminance falls,
 * and most of what the eye actually reads as "which bike is this" is the RIM
 * LIGHT and the windscreen, which is why those are separate mask channels.
 *
 * THE GLOVES ARE NOT PAINTED. Their cyan piping is the same colour drawn the
 * same way as the bike's, and it stays cyan on all four. The gloves are the
 * rider; the rider does not change bike when the bike changes.
 *
 * NOT TO BE CONFUSED WITH config/machine.js, which is the library for the
 * PRIMITIVE cockpit in player/Rider.js - tank, fairing, fork and controls built
 * from geometry, behind config.player.cockpit.source. That is a fallback that
 * is not the direction. This file is the shipped bike.
 *
 * ================= WHY maxSpeed IS NOT A PER-BIKE KNOB ==================
 *
 * `config.player.bike.maxSpeed` is not the player's top speed. It is the
 * NORMALISATION CONSTANT for the whole traffic system: every vehicle stores its
 * speed as a fraction of it (world/Traffic.js, world/Oncoming.js), the doppler
 * divides by it (audio/TrafficVoices.js) and the field of view ramp is driven
 * by speed / maxSpeed. Give one bike a higher maxSpeed and every car on the
 * road gets faster with it, the advantage cancels out, and every measured
 * figure in STATUS.md - the bot run crash rates, the spawn gaps, the god run
 * table - stops describing the game.
 *
 * So maxSpeed stays at 235 for all four, as the world's reference and as a hard
 * ceiling, and the bikes differ through the knobs that config/player.js already
 * says set real top speed: drag, acceleration and brake. Solve
 * `acceleration = dragQuadratic * v^2 + dragLinear * v` for the terminal speed.
 *
 * The cost, stated rather than hidden: VOLT is the current bike and its terminal
 * speed drops from 234.8 to 229.0 - 2.5 per cent - because a bike sold on top
 * speed needs somewhere above the baseline to be, and the ceiling cannot move.
 * Nothing else about VOLT changes.
 *
 * Measured by integrating these constants at 2 kHz (terminal speed, 0-100 from
 * rest, and a clean 5 km from the 120 start speed):
 *
 *   bike     top    0-100   5 km     lateral   brake
 *   VOLT     229.0  2.15 s  23.15 s  13.0      96
 *   NOVA     218.0  1.90 s  23.96 s  13.2      94
 *   EMBER    235.0  2.43 s  22.83 s  12.4      90
 *   FROST    224.0  2.24 s  23.63 s  14.4      108
 *
 *   spread:  top 7.5%   0-100 24.4%   lateral 15.1%   brake 18.6%
 *
 * Top speed is the most compressed of the four and that is drag, not timidity:
 * it is quadratic, so it takes a large change in power to move the speed it
 * settles at. The difference a rider FEELS is in the other three, and the 5 km
 * spread of 1.13 s is deliberately smaller than a medal band - choosing a bike
 * must not be able to buy a medal that riding did not earn.
 */

/**
 * @typedef {object} Bike
 * @property {string} name shown on the selection screen
 * @property {string} blurb one line, Turkish, from config/ui.js
 * @property {object} paint what the cockpit shader is handed
 * @property {object} bars the three stat bars, 0..1, for the selection screen
 * @property {object} patch applied over config when this bike is fitted
 */

/** The baseline the other three are measured against. */
const VOLT = {
  name: 'VOLT',
  paint: {
    // The bodywork tint. Chroma is pushed toward this; luminance is untouched,
    // so the shading and the line art survive intact.
    body: 0x28c8ff,
    // The piping. This is the part that actually says which bike it is, so it
    // is the most saturated of the three.
    rim: 0x6ff2ff,
    // The windscreen, tinted lightly. See `glassGain` below for why lightly.
    glass: 0x2fb8e8,
  },
  bars: { speed: 0.62, acceleration: 0.60, handling: 0.60 },
  patch: {
    player: {
      bike: {
        acceleration: 52,
        brakeForce: 96,
        dragQuadratic: 0.000773, // terminal 229.0
        lateralSpeed: 13.0,
        lateralTau: 0.35,
      },
    },
  },
};

/** Acceleration. Off the line and out of every crash, at the cost of the top end. */
const NOVA = {
  name: 'NOVA',
  paint: { body: 0xff3ca8, rim: 0xff86d8, glass: 0xc73a9c },
  bars: { speed: 0.42, acceleration: 0.92, handling: 0.60 },
  patch: {
    player: {
      bike: {
        acceleration: 59,
        brakeForce: 94,
        dragQuadratic: 0.001012, // terminal 218.0
        lateralSpeed: 13.2,
        lateralTau: 0.35,
      },
    },
  },
};

/** Top speed. The only one that reaches the ceiling, and the slowest to get there. */
const EMBER = {
  name: 'EMBER',
  paint: { body: 0xff9326, rim: 0xffd166, glass: 0xd87a2a },
  bars: { speed: 0.95, acceleration: 0.38, handling: 0.48 },
  patch: {
    player: {
      bike: {
        acceleration: 46,
        brakeForce: 90,
        dragQuadratic: 0.000614, // terminal 235.0 - it is the one that gets there
        lateralSpeed: 12.4,
        lateralTau: 0.38,
      },
    },
  },
};

/** Handling and braking. Changes lane soonest and sheds speed hardest. */
const FROST = {
  name: 'FROST',
  paint: { body: 0xd8e8f5, rim: 0xffffff, glass: 0x9fc2d8 },
  bars: { speed: 0.52, acceleration: 0.55, handling: 0.95 },
  patch: {
    player: {
      bike: {
        acceleration: 50,
        brakeForce: 108,
        dragQuadratic: 0.000773, // terminal 224.0
        lateralSpeed: 14.4,
        // Settles into a lane sooner. This is most of what "handling" feels
        // like from inside a cockpit that cannot show its own steering angle.
        lateralTau: 0.29,
      },
    },
  },
};

export const bikes = {
  volt: VOLT,
  nova: NOVA,
  ember: EMBER,
  frost: FROST,
};

/**
 * How the recolour behaves, shared by all four. Per-bike colour, per-project
 * strength: four bikes that each tuned their own gain would drift apart.
 */
export const paint = {
  enabled: true,

  /**
   * How far the bodywork's chroma is pushed toward the bike's colour, at full
   * strength. Not 1: the drawing's own blue-grey is what makes it read as
   * painted metal rather than as a flat fill, and replacing it outright loses
   * the material along with the colour.
   */
  bodyStrength: 0.82,

  /**
   * Chroma lift as luminance falls, and the reason a colourway is visible at
   * all here. 69 per cent of the fairing sits below luminance 40, where hue is
   * invisible; without this, EMBER is a black fairing with a warm edge. Applied
   * as a multiplier that rises toward the dark end, never as a brightness lift -
   * lifting luminance would flatten the shading and the line art with it.
   */
  shadowChroma: 2.3,

  /** The rim light is replaced outright. It is the signature. */
  rimStrength: 1.0,

  /**
   * The windscreen, and it is deliberately the weakest of the three. The screen
   * is the largest bright area in the cockpit and it sits directly over the
   * road: tint it hard and it becomes a coloured filter across the traffic the
   * rider has to read. Checked at night against the road on both themes before
   * this number was settled - see the note in STATUS.md.
   */
  glassGain: 0.35,
};

/** Which bike is fitted. `?bike=` overrides it; the selection screen sets it. */
export const bike = 'volt';

/** Where the choice is kept between sessions. */
export const bikeStorageKey = 'neon-ride.bike';
