import { supersport } from './machines/supersport.js';

/**
 * NEON RIDE - the bike library.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * One definition per machine, each a complete description of everything the
 * rider can see of it: tank, fairing, screen, fork, controls, cluster. The
 * selected one is reached as config.player.rider.machine, so every builder goes
 * on reading a single object and none of them knows a library exists.
 *
 * The one thing a definition may NOT move is the grip anchor in ./rider.js. The
 * hands are posed against it and baked, so a bike whose bars are somewhere else
 * would leave them gripping air. Bars come to the hands, not the other way
 * round - which is also how a rider fits a bike.
 */

// --- The library ---
export const machines = {
  supersport,
};

/** Which one is fitted. The B key's neighbour cycles this at runtime. */
export const bike = 'supersport';

/**
 * The fitted machine. Rider swaps what this points at and rebuilds; nothing
 * downstream holds a reference across a rebuild, so pointing it elsewhere is
 * the whole of changing bikes.
 */
export const machine = machines[bike];
