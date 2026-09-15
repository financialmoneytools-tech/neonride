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
 * A definition may move the grip anchor in ./rider.js, and a bike with its bars
 * somewhere else should. The hands are built FROM the anchor frame, so they go
 * where it goes; nothing is baked against a fixed pose any more.
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
