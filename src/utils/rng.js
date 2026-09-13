/**
 * Seeded pseudo random number generator (mulberry32).
 * Deterministic for a given seed, so generated worlds are reproducible.
 */
export function createRng(seed = 1) {
  let state = seed >>> 0;

  /** @returns {number} uniform value in [0, 1) */
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,

    /** Uniform value in [min, max). */
    range(min, max) {
      return min + (max - min) * next();
    },

    /** Random element of an array. */
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },

    /**
     * Weighted pick. Entries must expose a numeric "weight" field.
     * @param {Array<{weight:number}>} entries
     */
    pickWeighted(entries) {
      let total = 0;
      for (let i = 0; i < entries.length; i++) total += entries[i].weight;
      let roll = next() * total;
      for (let i = 0; i < entries.length; i++) {
        roll -= entries[i].weight;
        if (roll <= 0) return entries[i];
      }
      return entries[entries.length - 1];
    },

    /**
     * Approximate standard normal (Irwin-Hall, n = 6).
     * Mean 0, standard deviation 1, hard limits near -4.2 / +4.2.
     */
    gaussian() {
      const sum = next() + next() + next() + next() + next() + next();
      return (sum - 3) * 1.4142135623730951;
    },
  };
}
