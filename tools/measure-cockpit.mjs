/**
 * Where the cockpit sprite lands, at every landscape aspect we ship.
 *
 *     node tools/measure-cockpit.mjs          # report and assert
 *     node tools/measure-cockpit.mjs --report # report only, never fails
 *
 * This exists because the cockpit has been too large in landscape TWICE, and
 * both times it was found by someone looking at the game rather than by
 * anything in the repo. It exits non-zero when a target is missed, so a third
 * time is a failed command instead of a screenshot.
 *
 * It measures the real thing: the actual Cockpit class, the actual config, the
 * actual PNG. Nothing here re-implements the placement, so nothing here can
 * agree with a placement that has changed underneath it.
 *
 * THE ASPECT SWEEP IS THE POINT. A cockpit correct at 16:9 and wrong at 2:1 is
 * exactly the bug that came back: the plane was sized from the frame's WIDTH,
 * so every window wider than 16:9 grew it, and 16:9 was the only shape anybody
 * checked. One aspect is not a test.
 */

import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

// The cluster's canvas is the only part of the rig that touches the DOM.
const stub = new Proxy({}, {
  get: (_, key) => {
    if (key === 'canvas') return { width: 1, height: 1 };
    if (key === 'measureText') return () => ({ width: 0 });
    if (key === 'createLinearGradient' || key === 'createRadialGradient') {
      return () => ({ addColorStop() {} });
    }
    return () => {};
  },
  set: () => true,
});
globalThis.document = {
  createElement: () => ({ width: 1, height: 1, getContext: () => stub }),
};

const THREE = await import('three');
const { config } = await import('../src/config.js');
const { Framing } = await import('../src/core/Framing.js');

function pngAlpha(path) {
  const buffer = readFileSync(path);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const chunks = [];
  for (let at = 8; at + 8 <= buffer.length;) {
    const length = buffer.readUInt32BE(at);
    const type = buffer.toString('ascii', at + 4, at + 8);
    if (type === 'IDAT') chunks.push(buffer.subarray(at + 8, at + 8 + length));
    if (type === 'IEND') break;
    at += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const out = new Uint8Array(width * height);
  const line = new Uint8Array(stride);
  const prev = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= 4 ? line[i - 4] : 0;
      const b = prev[i];
      const c = i >= 4 ? prev[i - 4] : 0;
      let value = src[i];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
        value += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      line[i] = value & 0xff;
    }
    for (let x = 0; x < width; x++) out[y * width + x] = line[x * 4 + 3];
    prev.set(line);
  }
  return { width, height, alpha: out };
}

const SPRITE = pngAlpha('public/' + config.player.cockpit.url);
THREE.TextureLoader.prototype.load = function load(url, onLoad) {
  const texture = new THREE.Texture();
  texture.image = { width: SPRITE.width, height: SPRITE.height };
  if (onLoad) onLoad(texture);
  return texture;
};
const { Cockpit } = await import('../src/player/Cockpit.js');

/**
 * Landmarks, as fractions down the SPRITE, found in the artwork rather than
 * declared: the topmost drawn pixel in a band of columns.
 *
 * The grip is the exception and is a measured constant - v 0.700 runs through
 * the switch block and the middle of the fist at the bar end, which is what
 * "where the grips sit" means. A topmost-pixel rule there finds the lever tip
 * instead, six per cent of the picture higher.
 */
function bandTop(x0, x1) {
  const { width, height, alpha } = SPRITE;
  for (let y = 0; y < height; y++) {
    for (let x = Math.floor(width * x0); x < Math.floor(width * x1); x++) {
      if (alpha[y * width + x] > 8) return y / height;
    }
  }
  return 1;
}

const LANDMARKS = {
  'windscreen top': bandTop(0.42, 0.58),
  'mirror tops': Math.min(bandTop(0.30, 0.42), bandTop(0.58, 0.70)),
  grips: 0.700,
  // The bottom of the gauntlet cuff, where the glove ends and the sleeve
  // begins. Measured off the sprite: the brief is "down to the rider's wrists",
  // so this is the lowest thing that has to stay inside the frame - the forearm
  // and the tank below it are allowed to run off.
  'wrist cuffs': 0.82,
  'silhouette top': bandTop(0, 1),
};

// Outermost and topmost points of each mirror, for the "fully visible" check.
// Measured off the sprite rather than declared.
const MIRRORS = { top: 0.386, left: 0.2576, right: 0.7436, bottom: 0.4997 };

/**
 * The contract, in frame percentages, at EVERY landscape aspect.
 *
 * `grips` replaces the old hand contract - 20 and 80 per cent across, 85 per
 * cent down - which was written when the hands were two separate sprites that
 * could be moved independently. They are painted into the cockpit drawing now,
 * so their position across the frame is the artist's and not a knob; only how
 * far down the frame the whole cockpit sits is still ours to set. 85 became
 * 82-85 for the same reason: the number now has to hold for a drawing that also
 * has to put its windscreen and its mirrors somewhere.
 */
const TARGETS = {
  'windscreen top': [60, 64],
  grips: [85, 88],
  // Inside the frame, with a little room. The forearms and the tank below are
  // meant to leave through the bottom edge; the cuffs are not.
  'wrist cuffs': [0, 99],
};

/** The horizon has to sit here, and the gap below it has to be at least this. */
const HORIZON = [40, 47];
const ROAD_BAND_MIN = 15;

const ASPECTS = [
  ['16:9', 16 / 9],
  ['2:1', 2034 / 1012], // the shape the regression was reported at
  ['21:9', 21 / 9],
];

function measure(aspect) {
  const framing = new Framing();
  framing.update(aspect);
  const camera = new THREE.PerspectiveCamera(framing.fov, aspect, 0.1, 20000);
  // The framing pitch, as bike/view.js applies it on top of the road-following
  // aim. On a straight road at rest that aim is level, so this is the whole of
  // the camera's pitch.
  camera.rotation.x = framing.pitch;
  const cockpit = new Cockpit(camera, framing);
  cockpit.update(0, { steer: 0, lean: 0 });
  camera.updateMatrixWorld(true);

  const point = new THREE.Vector3();
  const at = (u, v) => {
    point.set(u - 0.5, 0.5 - v, 0).multiply(cockpit.mesh.scale).add(cockpit.mesh.position);
    cockpit.group.localToWorld(point);
    point.project(camera);
    return { across: (point.x + 1) / 2, down: (1 - point.y) / 2 };
  };

  // Where the drawn arms end along the frame's bottom edge. Sizing from height
  // means the plane no longer reaches the frame's sides, so this is the number
  // that says how much empty corner that leaves - the cost of the fix, measured
  // rather than described.
  const bottomV = (() => {
    // The image row that lands on the frame's bottom edge.
    const centre = at(0.5, 0);
    const span = at(0.5, 1).down - centre.down;
    return span > 0 ? (1 - centre.down) / span : 1;
  })();
  const armEdge = (() => {
    const { width, height, alpha } = SPRITE;
    const y = Math.min(height - 1, Math.max(0, Math.round(bottomV * height)));
    let lo = width; let hi = -1;
    for (let x = 0; x < width; x++) {
      if (alpha[y * width + x] > 8) { if (x < lo) lo = x; hi = x; }
    }
    if (hi < 0) return null;
    return [at(lo / width, bottomV).across, at((hi + 1) / width, bottomV).across];
  })();

  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5)
    * config.player.cockpit.distance;
  const out = {
    aspect,
    planeWidthPct: cockpit.mesh.scale.x / (2 * halfHeight * aspect) * 100,
    planeHeightPct: cockpit.mesh.scale.y / (2 * halfHeight) * 100,
    marks: {},
  };
  for (const [name, v] of Object.entries(LANDMARKS)) out.marks[name] = at(0.5, v).down * 100;
  out.cockpitSharePct = 100 - out.marks['silhouette top'];
  out.armEdge = armEdge;
  out.bottomV = bottomV;
  out.at = at;
  // THE HORIZON, BY PROJECTING ONE. It was computed from the pitch with a
  // formula whose sign was wrong - it put the horizon LOWER when the camera
  // pitched down, which is backwards - and that went unnoticed for as long as
  // pitch was 0 and the error was zero with it. Projecting a distant point at
  // eye height cannot have that class of mistake in it.
  //
  // Projected through the SAME camera the cockpit was measured with, pitch and
  // all. That the cockpit numbers above do not move when the camera pitches is
  // the proof that the sprite is fixed in screen space: it is a child of the
  // camera, so pitch moves only the world.
  const far = new THREE.Vector3(0, 0, -10000).project(camera);
  out.horizonPct = (1 - far.y) / 2 * 100;
  cockpit.dispose();
  return out;
}

const failures = [];
console.log(`sprite ${config.player.cockpit.url}  ${SPRITE.width}x${SPRITE.height}`
  + `  aspect ${(SPRITE.width / SPRITE.height).toFixed(4)}`);
console.log('landmarks in the sprite: '
  + Object.entries(LANDMARKS).map(([k, v]) => `${k} ${(v * 100).toFixed(1)}%`).join(', '));
console.log('');

for (const [label, aspect] of ASPECTS) {
  const m = measure(aspect);
  console.log(`${label} (${aspect.toFixed(4)})`);
  console.log(`  plane covers ${m.planeWidthPct.toFixed(1)}% of frame width, `
    + `${m.planeHeightPct.toFixed(1)}% of its height`);
  console.log(`  horizon at ${m.horizonPct.toFixed(1)}% down, `
    + `cockpit occupies the bottom ${m.cockpitSharePct.toFixed(1)}%`);
  for (const [name, value] of Object.entries(m.marks)) {
    const want = TARGETS[name];
    const ok = !want || (value >= want[0] && value <= want[1]);
    if (!ok) failures.push(`${label}: ${name} at ${value.toFixed(1)}%, want ${want[0]}-${want[1]}%`);
    console.log(`  ${name.padEnd(16)} ${value.toFixed(1)}% down`
      + (want ? `   target ${want[0]}-${want[1]}%   ${ok ? 'ok' : 'FAIL'}` : ''));
  }
  if (m.armEdge) {
    console.log(`  arms end ${(m.armEdge[0] * 100).toFixed(1)}% from the left edge and `
      + `${((1 - m.armEdge[1]) * 100).toFixed(1)}% from the right, along the frame bottom`);
  }
  const at = m.at;
  const horizonOk = m.horizonPct >= HORIZON[0] && m.horizonPct <= HORIZON[1];
  if (!horizonOk) {
    failures.push(`${label}: horizon at ${m.horizonPct.toFixed(1)}%, `
      + `want ${HORIZON[0]}-${HORIZON[1]}%`);
  }
  console.log(`  horizon          ${m.horizonPct.toFixed(1)}% down`
    + `   target ${HORIZON[0]}-${HORIZON[1]}%   ${horizonOk ? 'ok' : 'FAIL'}`);

  // The road has to be visible between the horizon and the top of the cockpit.
  const gap = m.marks['windscreen top'] - m.horizonPct;
  const roadOk = gap >= ROAD_BAND_MIN;
  if (!roadOk) {
    failures.push(`${label}: road band ${gap.toFixed(1)}%, want at least ${ROAD_BAND_MIN}%`);
  }
  console.log(`  road band        ${gap.toFixed(1)}% of frame height`
    + `   target >= ${ROAD_BAND_MIN}%   ${roadOk ? 'ok' : 'FAIL'}`);

  // Mirrors have to be wholly inside the frame.
  const mirror = {
    top: at(0.5, MIRRORS.top).down * 100,
    bottom: at(0.5, MIRRORS.bottom).down * 100,
    left: at(MIRRORS.left, MIRRORS.top).across * 100,
    right: at(MIRRORS.right, MIRRORS.top).across * 100,
  };
  const mirrorOk = mirror.top >= 0 && mirror.bottom <= 100
    && mirror.left >= 0 && mirror.right <= 100;
  if (!mirrorOk) failures.push(`${label}: mirrors are not wholly in frame`);
  console.log(`  mirrors          across ${mirror.left.toFixed(1)}..`
    + `${mirror.right.toFixed(1)}%, down ${mirror.top.toFixed(1)}..`
    + `${mirror.bottom.toFixed(1)}%   ${mirrorOk ? 'ok' : 'FAIL'}`);
  console.log('');
}

if (!process.argv.includes('--report') && failures.length) {
  console.log(`${failures.length} FAILED:`);
  for (const line of failures) console.log(`  ${line}`);
  process.exit(1);
}
if (!failures.length) console.log('all targets met');
