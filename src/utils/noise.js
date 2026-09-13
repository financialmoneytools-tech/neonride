/**
 * Own simplex noise implementation (no external dependency).
 * Seeded through the permutation table so results stay reproducible.
 */

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

// Eight gradient directions are enough for 2D simplex noise
const GRAD2 = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * Builds a 2D simplex noise function.
 * @param {{next: () => number}} rng seeded generator used to shuffle the table
 * @returns {(x:number, y:number) => number} noise value in roughly [-1, 1]
 */
export function createNoise2D(rng) {
  const source = new Uint8Array(256);
  for (let i = 0; i < 256; i++) source[i] = i;

  // Fisher-Yates shuffle driven by the seeded generator
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    const tmp = source[i];
    source[i] = source[j];
    source[j] = tmp;
  }

  // Doubled table avoids an index wrap check in the hot path
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = source[i & 255];

  return function noise2D(xin, yin) {
    // Skew the input space onto the simplex grid
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);

    const t = (i + j) * G2;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);

    // Which of the two triangles of the cell are we in
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let n0 = 0;
    let n1 = 0;
    let n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      const g = GRAD2[perm[ii + perm[jj]] & 7];
      t0 *= t0;
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      const g = GRAD2[perm[ii + i1 + perm[jj + j1]] & 7];
      t1 *= t1;
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      const g = GRAD2[perm[ii + 1 + perm[jj + 1]] & 7];
      t2 *= t2;
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
    }

    // 70 brings the sum back into [-1, 1]
    return 70 * (n0 + n1 + n2);
  };
}

/**
 * Fractal brownian motion on top of a 2D noise function.
 * @param {(x:number, y:number) => number} noise2D
 * @param {{octaves?:number, lacunarity?:number, gain?:number}} options
 * @returns {(x:number, y:number) => number} value in roughly [-1, 1]
 */
export function createFbm2D(noise2D, { octaves = 4, lacunarity = 2, gain = 0.5 } = {}) {
  return function fbm2D(x, y) {
    let amplitude = 1;
    let frequency = 1;
    let sum = 0;
    let norm = 0;

    for (let o = 0; o < octaves; o++) {
      sum += amplitude * noise2D(x * frequency, y * frequency);
      norm += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }

    return norm > 0 ? sum / norm : 0;
  };
}
