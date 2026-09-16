/**
 * The cockpit, built for real and looked at, without a browser.
 *
 *     node tools/cockpit.mjs --depths            # camera space z of every part
 *     node tools/cockpit.mjs --render out.ppm    # rasterise what it looks like
 *
 * Fifty rounds went into this cockpit a part at a time, each one measured on
 * its own and none of them against the others, and it still did not compose.
 * That is what happens when the only thing anybody can check is a number: parts
 * get correct placements and wrong RELATIONSHIPS, because a relationship is not
 * visible in a config file. The two things this prints - one depth ordering for
 * the whole rig, and a picture - are the two things that were missing.
 *
 * It builds the REAL geometry. It imports Rider's own builders, its own config,
 * its own anchor maths and its own hierarchy, so nothing here is a model of the
 * cockpit that can drift from the cockpit. What it does not do is shade: there
 * is no WebGL, so triangles are flat filled by part with a z buffer. Shape,
 * overlap and depth order are exactly right; colour is a legend, not a look.
 *
 * The one shim is a canvas for the instrument face, which is the only part of
 * the rig that touches the DOM. Its texture is never sampled here.
 */

import { writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

// --- the DOM the cluster expects, and nothing more -------------------------
const stubContext = new Proxy({}, {
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
  createElement: () => ({ width: 1, height: 1, getContext: () => stubContext }),
};

const THREE = await import('three');

// TextureLoader reaches for an <img>. The overlay check below needs the real
// pixel dimensions, because Cockpit sizes its plane from the texture's own
// aspect rather than from a number in config - so the shim reads them out of
// the PNG header instead of pretending they are 1x1.
function pngSize(path) {
  const buffer = readFileSync(path);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}
THREE.TextureLoader.prototype.load = function load(url, onLoad) {
  const texture = new THREE.Texture();
  try {
    texture.image = pngSize('public/' + url);
    if (onLoad) onLoad(texture);
  } catch (error) {
    // Surfaced with its cause: "missing" was the first guess and the file was
    // there, so the message has to say what actually went wrong.
    throw new Error(`cockpit texture public/${url}: ${error.message}`);
  }
  return texture;
};
const { config } = await import('../src/config.js');
const { Framing } = await import('../src/core/Framing.js');
const { GeometryBuilder } = await import('../src/utils/geometry.js');
const { buildHandlebar } = await import('../src/player/rider/Handlebar.js');
const { buildBikeFront } = await import('../src/player/rider/BikeFront.js');
const { buildFairing } = await import('../src/player/rider/bike/Fairing.js');
const { buildControls } = await import('../src/player/rider/bike/Controls.js');
const { Instruments } = await import('../src/player/rider/Instruments.js');

// One profile now; the env override is kept only so a second one, if it ever
// comes back, can be looked at without editing this file.
const PROFILE = process.env.PROFILE || config.framing.profiles[0].name;
const CAMERA = process.env.CAMERA || 'ride';
config.player.camera.profile = CAMERA;

// Colour per builder, so the picture has a legend. Chosen to be told apart at a
// glance rather than to look like the game.
const PAINT = {
  frame: [150, 150, 165],
  dark: [70, 70, 84],
  mirror: [120, 190, 210],
  tank: [190, 120, 60],
  paint: [200, 60, 150],
  vent: [60, 60, 70],
  neonLeft: [90, 240, 220],
  rubber: [40, 40, 44],
  lowerPaint: [150, 45, 110],
  lowerNeon: [70, 180, 170],
  screenPanel: [235, 235, 120],
  mirrorMount: [170, 170, 185],
  cluster: [80, 255, 140],
  bezel: [110, 110, 125],
};

/** Builds the rig exactly as Rider.js does, with the camera as the root. */
function buildRig() {
  const cfg = config.player.rider;
  const framing = new Framing();
  const profile = config.framing.profiles.find((p) => p.name === PROFILE)
    || config.framing.profiles[0];
  framing.update(profile.aspect);

  const camera = new THREE.PerspectiveCamera(framing.fov, profile.aspect, 0.01, 100);
  const group = new THREE.Group();
  camera.add(group);
  // fovCompensation is 0 and the bike is at rest, so the rig sits at its origin
  // plus the selected camera profile's push, and nothing scales it.
  const push = framing.camera.rider;
  group.position.set(framing.riderOrigin.x + push.x,
    framing.riderOrigin.y + push.y, framing.riderOrigin.z + push.z);

  const steering = new THREE.Group();
  steering.position.set(cfg.steering.pivot.x, cfg.steering.pivot.y, cfg.steering.pivot.z);
  group.add(steering);
  const parts = new THREE.Group();
  parts.position.set(-cfg.steering.pivot.x, -cfg.steering.pivot.y, -cfg.steering.pivot.z);
  steering.add(parts);
  const hardware = new THREE.Group();
  hardware.scale.setScalar(cfg.hardwareScale);
  parts.add(hardware);
  const chassis = new THREE.Group();
  group.add(chassis);

  const keys = ['frame', 'dark', 'mirror', 'tank', 'paint', 'vent', 'neonLeft',
    'rubber', 'lowerPaint', 'lowerNeon', 'screenPanel', 'mirrorMount'];
  const builders = {};
  for (const key of keys) builders[key] = new GeometryBuilder();

  // Only when the primitive rig is the one that runs. In sprite mode Rider is
  // never constructed by main.js either, so building it here would draw a
  // cockpit the game does not have.
  const geometry = config.player.cockpit.source !== 'sprite';
  if (geometry) {
    buildHandlebar(builders);
    buildBikeFront(builders);
    buildFairing(builders);
    buildControls(builders);
  }

  const parents = {
    tank: chassis, paint: chassis, vent: chassis, neonLeft: chassis, screenPanel: chassis,
    mirror: chassis, mirrorMount: chassis,
  };
  const meshes = [];
  for (const key of keys) {
    if (builders[key].isEmpty) continue;
    const mesh = new THREE.Mesh(builders[key].build('rider-' + key));
    mesh.userData.part = key;
    (parents[key] || hardware).add(mesh);
    meshes.push(mesh);
  }

  if (geometry) {
    const instruments = new Instruments();
    parts.add(instruments.group);
    instruments.mesh.userData.part = 'cluster';
    instruments.bezel.userData.part = 'bezel';
    meshes.push(instruments.mesh, instruments.bezel);
  }

  camera.updateMatrixWorld(true);
  return { camera, group, parts, hardware, chassis, framing, profile, meshes };
}

// --- named reference points, for the depth ordering ------------------------

/**
 * One point per part, in the space that part is actually built in.
 *
 * Reported rather than the geometry's centroid because a centroid answers a
 * different question: the tank's is inside the tank, and what matters is where
 * its visible top surface is. These are the points the spec talks about.
 */
function referencePoints(rig) {
  const m = config.player.rider.machine;
  const r = config.player.rider;
  const v = (a) => new THREE.Vector3().fromArray(a);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  const clamp = m.tripleClamp;
  const bar = r.bar;
  const anchor = r.anchors.rightGrip;

  return [
    ['fuel tank, top front', rig.chassis, v(m.tank.offset).add(V(0, m.tank.radii[1], m.tank.radii[2]))],
    ['fuel cap            ', rig.chassis, m.tank.cap
      ? v(m.tank.cap.offset) : v(m.tank.offset).add(V(0, m.tank.radii[1], 0))],
    ['handlebar, centre   ', rig.hardware, v(bar.path[0])],
    ['handlebar, right grip', rig.hardware, v(anchor.from).lerp(v(anchor.to), anchor.along)],
    ['triple clamp        ', rig.hardware, v(clamp.offset)],
    ['hands (sprite plane)', rig.hardware, v(anchor.from).lerp(v(anchor.to), anchor.along)
      .add(V(r.hand.sprite.offset[0], r.hand.sprite.offset[1], r.hand.sprite.offset[2]))],
    ['instrument cluster  ', rig.parts, v(r.instruments.offset)],
    // The nose panel: the part of the fairing the cluster is recessed into.
    ['inner fairing panel ', rig.chassis, v(m.fairing.nose.offset)],
    ['windscreen          ', rig.chassis, v(m.screen.offset)],
    ['mirror head, right  ', rig.chassis, v(r.mirror.stalkTo)],
  ];
}

function depths(rig) {
  const out = [];
  for (const [name, space, local] of referencePoints(rig)) {
    const world = space.localToWorld(local.clone());
    out.push({ name, z: world.z, world });
  }
  return out;
}

// --- the picture -----------------------------------------------------------

/** Full RGBA of a PNG, without a decoder dependency. */
function readPng(path) {
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
  const out = new Uint8Array(width * height * 4);
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
    out.set(line, y * stride);
    prev.set(line);
  }
  return { width, height, data: out };
}

function render(rig, width, height) {
  const colour = new Float32Array(width * height * 3);
  const depth = new Float32Array(width * height).fill(Infinity);

  // A stand-in road, so parts can be judged against the thing they must not
  // cover. Horizon at the level the camera actually looks at.
  const horizon = Math.round(height * (0.5 - Math.tan(rig.framing.pitch)
    / Math.tan(THREE.MathUtils.degToRad(rig.framing.fov) * 0.5) * 0.5));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const sky = y < horizon;
      const t = sky ? y / Math.max(horizon, 1) : (y - horizon) / Math.max(height - horizon, 1);
      colour[i] = sky ? 10 + 30 * t : 16 + 10 * t;
      colour[i + 1] = sky ? 8 + 12 * t : 16 + 10 * t;
      colour[i + 2] = sky ? 28 + 46 * t : 22 + 12 * t;
    }
  }

  const proj = rig.camera.projectionMatrix;
  const a = new THREE.Vector3(); const b = new THREE.Vector3(); const c = new THREE.Vector3();
  const ndc = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

  const triangle = (p0, p1, p2, rgb, shade) => {
    // Behind the eye: dropped whole rather than clipped. The cockpit never
    // straddles the near plane at these framings, and a half clipped triangle
    // would be a lie that looks like geometry.
    if (p0.z > -0.02 || p1.z > -0.02 || p2.z > -0.02) return;
    const pts = [p0, p1, p2];
    for (let i = 0; i < 3; i++) {
      ndc[i].copy(pts[i]).applyMatrix4(proj);
      ndc[i].x = (ndc[i].x + 1) * 0.5 * width;
      ndc[i].y = (1 - ndc[i].y) * 0.5 * height;
    }
    const minX = Math.max(0, Math.floor(Math.min(ndc[0].x, ndc[1].x, ndc[2].x)));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(ndc[0].x, ndc[1].x, ndc[2].x)));
    const minY = Math.max(0, Math.floor(Math.min(ndc[0].y, ndc[1].y, ndc[2].y)));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(ndc[0].y, ndc[1].y, ndc[2].y)));
    const area = (ndc[1].x - ndc[0].x) * (ndc[2].y - ndc[0].y)
      - (ndc[2].x - ndc[0].x) * (ndc[1].y - ndc[0].y);
    if (Math.abs(area) < 1e-9) return;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5; const py = y + 0.5;
        let w0 = ((ndc[1].x - ndc[0].x) * (py - ndc[0].y)
          - (px - ndc[0].x) * (ndc[1].y - ndc[0].y)) / area;
        let w1 = ((px - ndc[0].x) * (ndc[2].y - ndc[0].y)
          - (ndc[2].x - ndc[0].x) * (py - ndc[0].y)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = w2 * pts[0].z + w1 * pts[1].z + w0 * pts[2].z;
        const key = y * width + x;
        if (-z >= depth[key]) continue;
        depth[key] = -z;
        const i = key * 3;
        colour[i] = rgb[0] * shade;
        colour[i + 1] = rgb[1] * shade;
        colour[i + 2] = rgb[2] * shade;
      }
    }
  };

  for (const mesh of rig.meshes) {
    const rgb = PAINT[mesh.userData.part] || [180, 180, 180];
    const pos = mesh.geometry.attributes.position;
    const index = mesh.geometry.index;
    const count = index ? index.count : pos.count;
    for (let i = 0; i < count; i += 3) {
      const i0 = index ? index.getX(i) : i;
      const i1 = index ? index.getX(i + 1) : i + 1;
      const i2 = index ? index.getX(i + 2) : i + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(pos, i1).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(pos, i2).applyMatrix4(mesh.matrixWorld);
      // Flat shade off the face normal against the view direction, purely so
      // that curvature is legible. Nothing here claims to be the game's look.
      const nx = (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y);
      const ny = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
      const nz = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      const len = Math.hypot(nx, ny, nz) || 1;
      const shade = 0.45 + 0.55 * Math.abs(nz / len);
      triangle(a, b, c, rgb, shade);
    }
  }

  return { colour, depth, horizon };
}

/** The hand sprites, composited into the same z buffer as textured quads. */
function drawHands(rig, buffers, width, height) {
  const sp = config.player.rider.hand.sprite;
  const png = readPng('public/sprites/' + sp.url.glove.replace('sprites/', ''));
  const anchor = config.player.rider.anchors.rightGrip;
  const texAspect = png.width / png.height;
  const { colour, depth } = buffers;
  const proj = rig.camera.projectionMatrix;

  const origin = new THREE.Vector3().fromArray(anchor.from)
    .lerp(new THREE.Vector3().fromArray(anchor.to), anchor.along);

  for (const side of [1, -1]) {
    const W = sp.width * rig.framing.handScale;
    const H = W / texAspect;
    const centre = new THREE.Vector3(
      origin.x * side + sp.offset[0] * side - rig.framing.handInset * side,
      origin.y + sp.offset[1], origin.z + sp.offset[2]);
    rig.hardware.localToWorld(centre);
    // The plane is a billboard and the rig is square at rest, so it is axis
    // aligned in camera space and its scale carries the hardware group's.
    const sx = W * config.player.rider.hardwareScale * 0.5;
    const sy = H * config.player.rider.hardwareScale * 0.5;

    const corner = new THREE.Vector3();
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        // Walk the quad in texture space instead: solve the pixel back to uv.
      }
    }
    // Project the four corners, then fill the screen rectangle from the texture.
    const pts = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([u, v]) => {
      corner.set(centre.x + u * sx, centre.y + v * sy, centre.z).applyMatrix4(proj);
      return [(corner.x + 1) * 0.5 * width, (1 - corner.y) * 0.5 * height];
    });
    const left = Math.min(...pts.map((p) => p[0]));
    const right = Math.max(...pts.map((p) => p[0]));
    const top = Math.min(...pts.map((p) => p[1]));
    const bottom = Math.max(...pts.map((p) => p[1]));

    for (let y = Math.max(0, Math.floor(top)); y <= Math.min(height - 1, Math.ceil(bottom)); y++) {
      for (let x = Math.max(0, Math.floor(left)); x <= Math.min(width - 1, Math.ceil(right)); x++) {
        let u = (x + 0.5 - left) / Math.max(right - left, 1e-6);
        const v = (y + 0.5 - top) / Math.max(bottom - top, 1e-6);
        if (side === -1) u = 1 - u; // the mirror, as a negative x scale
        const tx = Math.min(png.width - 1, Math.max(0, Math.floor(u * png.width)));
        const ty = Math.min(png.height - 1, Math.max(0, Math.floor(v * png.height)));
        const t = (ty * png.width + tx) * 4;
        const alpha = png.data[t + 3] / 255;
        if (alpha < 0.35) continue;
        const key = y * width + x;
        if (-centre.z >= depth[key]) continue;
        depth[key] = -centre.z;
        const i = key * 3;
        colour[i] = png.data[t];
        colour[i + 1] = png.data[t + 1];
        colour[i + 2] = png.data[t + 2];
      }
    }
  }
}

// --- output ----------------------------------------------------------------

const rig = buildRig();

/**
 * Every mesh that actually got built: how big it is, how deep it sits, and
 * where it lands in the frame. The depth list says where parts were PLACED;
 * this says what came out, which is not the same thing when a part can fail to
 * be built at all or be covered by another one.
 */
/**
 * The photographic overlay, placed by the real Cockpit class.
 *
 * Reports where the plane and the cluster hole actually land as fractions of
 * the frame, which is the one thing that can be wrong in a way the build will
 * not catch: a sprite sized or anchored incorrectly still compiles, still
 * loads, and simply is not where it should be.
 */
if (process.argv.includes('--overlay')) {
  const { Cockpit } = await import('../src/player/Cockpit.js');
  const framing = new Framing();
  for (const profile of config.framing.profiles) {
    framing.update(profile.aspect);
    const camera = new THREE.PerspectiveCamera(framing.fov, profile.aspect, 0.1, 2000);
    const cockpit = new Cockpit(camera, framing);
    camera.updateMatrixWorld(true);

    const rect = (mesh) => {
      const out = [];
      for (const [sx, sy] of [[-0.5, 0.5], [0.5, -0.5]]) {
        // Through the group, which now carries the roll pivot: the meshes are
        // group-relative and sit at z 0, so projecting them directly puts them
        // on the camera and every number comes back infinite.
        const p = new THREE.Vector3(sx, sy, 0).multiply(mesh.scale).add(mesh.position);
        cockpit.group.localToWorld(p);
        p.project(camera);
        out.push([(p.x + 1) / 2, (1 - p.y) / 2]);
      }
      return out;
    };
    const pct = (v) => `${(v * 100).toFixed(1)}%`;
    const [pa, pb] = rect(cockpit.mesh);
    const [ca, cb] = rect(cockpit.cluster);
    console.log(`${profile.name} (${profile.aspect})`);
    console.log(`  sprite  across ${pct(pa[0])}..${pct(pb[0])}  `
      + `down ${pct(pa[1])}..${pct(pb[1])}`);
    console.log(`  cluster across ${pct(ca[0])}..${pct(cb[0])}  `
      + `down ${pct(ca[1])}..${pct(cb[1])}`);
    console.log(`  sprite visible ${cockpit.mesh.visible}, `
      + `cluster visible ${cockpit.cluster.visible}, `
      + `renderOrder ${cockpit.cluster.renderOrder} then ${cockpit.mesh.renderOrder}`);

    // How far the cockpit actually moves when the bars are turned. Sampled on
    // the sprite itself at the two grips and at the cluster, because "0.045
    // radians" says nothing about whether anyone will see it.
    const onSprite = (u, v) => {
      const p = new THREE.Vector3(u - 0.5, 0.5 - v, 0)
        .multiply(cockpit.mesh.scale).add(cockpit.mesh.position);
      cockpit.group.localToWorld(p);
      p.project(camera);
      return [(p.x + 1) / 2, (1 - p.y) / 2];
    };
    const settle = (state) => {
      // Damped, so it is run to rest rather than sampled on the first frame.
      for (let i = 0; i < 400; i++) cockpit.update(1 / 60, state);
      camera.updateMatrixWorld(true);
    };
    const marks = profile.name === 'wide'
      ? { 'left grip': [0.16, 0.80], 'right grip': [0.84, 0.80], cluster: [0.5, 0.60] }
      : { 'left grip': [0.10, 0.60], 'right grip': [0.90, 0.60], cluster: [0.5, 0.49] };

    settle({ steer: 0, lean: 0 });
    const rest = {};
    for (const [label, uv] of Object.entries(marks)) rest[label] = onSprite(...uv);
    settle({ steer: 1, lean: config.player.bike.leanMax });
    for (const [label, uv] of Object.entries(marks)) {
      const now = onSprite(...uv);
      const dx = (now[0] - rest[label][0]) * 100;
      const dy = (now[1] - rest[label][1]) * 100;
      console.log(`  at full lock  ${label.padEnd(10)} moves `
        + `${dx >= 0 ? '+' : ''}${dx.toFixed(2)}% across, `
        + `${dy >= 0 ? '+' : ''}${dy.toFixed(2)}% down`);
    }
    console.log(`  roll ${(cockpit.group.rotation.z * 180 / Math.PI).toFixed(2)} degrees`);

    config.comfort.reducedMotion = true;
    settle({ steer: 1, lean: config.player.bike.leanMax });
    console.log(`  reduced motion: roll `
      + `${(cockpit.group.rotation.z * 180 / Math.PI).toFixed(2)} degrees`);
    config.comfort.reducedMotion = false;

    // WHERE THE COCKPIT ACTUALLY LANDS, at rest, feature by feature. The
    // question is whether the source's own proportion survives the placement,
    // so every number is reported both as it is in the image and as it is on
    // screen.
    settle({ steer: 0, lean: 0 });
    {
      const png2 = readPng('public/' + config.player.cockpit.url);
      const opaque = (x, y) => png2.data[(y * png2.width + x) * 4 + 3] > 8;
      const topOf = (f0, f1) => {
        for (let y = 0; y < png2.height; y++) {
          for (let x = Math.floor(png2.width * f0); x < Math.floor(png2.width * f1); x++) {
            if (opaque(x, y)) return y / png2.height;
          }
        }
        return 1;
      };
      const marks = [
        ['content top (windscreen)', topOf(0.42, 0.58)],
        ['mirror tops', Math.min(topOf(0.30, 0.42), topOf(0.58, 0.70))],
        ['whole silhouette top', topOf(0, 1)],
      ];
      const cfg2 = config.player.cockpit;
      console.log('  --- placement at rest ---');
      console.log(`  sprite aspect ${(png2.width / png2.height).toFixed(4)}, `
        + `frame aspect ${profile.aspect}, cfg.scale ${cfg2.scale}, `
        + `cfg.offset [${cfg2.offset}]`);
      console.log(`  plane covers ${(cockpit.mesh.scale.x / (2 * Math.tan(
        THREE.MathUtils.degToRad(camera.fov) * 0.5) * profile.aspect
        * cfg2.distance) * 100).toFixed(1)}% of the frame width, `
        + `${(cockpit.mesh.scale.y / (2 * Math.tan(
          THREE.MathUtils.degToRad(camera.fov) * 0.5) * cfg2.distance) * 100).toFixed(1)}%`
        + ' of its height');
      for (const [label, v] of marks) {
        const onScreen = onSprite(0.5, v)[1];
        console.log(`  ${label.padEnd(26)} image ${(v * 100).toFixed(1)}% -> `
          + `frame ${(onScreen * 100).toFixed(1)}% down`);
      }
      const top = onSprite(0.5, marks[2][1])[1];
      console.log(`  cockpit occupies the bottom ${((1 - top) * 100).toFixed(1)}% `
        + 'of the frame height');
    }

    // COVER AT FULL SWAY. Two different questions, and conflating them got the
    // sign backwards the first time: a content point at a NEGATIVE screen x is
    // outside the left edge, which is the good case, not the bad one.
    //
    // 1. The bottom is the only place either source is genuinely CUT - the
    //    artwork runs off it, so the sprite must keep covering the frame's
    //    bottom edge through the whole sway or a gap opens under the rider.
    // 2. The sides are not cut; both sources stop short of their own edges. So
    //    the question there is only how far the silhouette sits from the frame
    //    edge, which is a composition fact rather than a defect.
    const png = readPng('public/' + config.player.cockpit.url);
    const alphaAt = (x, y) => png.data[(y * png.width + x) * 4 + 3];
    let cx0 = png.width; let cy0 = png.height; let cx1 = 0; let cy1 = 0;
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        if (alphaAt(x, y) > 8) {
          if (x < cx0) cx0 = x;
          if (x > cx1) cx1 = x;
          if (y < cy0) cy0 = y;
          if (y > cy1) cy1 = y;
        }
      }
    }
    // Only the columns that genuinely RUN OFF the bottom. Sampling every column
    // across the content instead put points at the mirror tips and the outer
    // arms, where the artwork stops two thirds of the way up the picture and has
    // no bottom edge at all - and reported those as the cockpit lifting off the
    // frame edge by 27 per cent.
    const bottomEdge = [];
    for (let i = 0; i <= 40; i++) {
      const x = Math.round(cx0 + (cx1 - cx0) * (i / 40));
      let y = png.height - 1;
      while (y > 0 && alphaAt(x, y) <= 8) y--;
      if (y >= png.height - 2) bottomEdge.push([(x + 0.5) / png.width, 1]);
    }

    let lowest = Infinity;   // smallest "down" reached by the bottom edge
    let leftGap = -Infinity; // largest empty strip at the left, and at the right
    let rightGap = -Infinity;
    for (const lock of [-1, 1]) {
      settle({ steer: lock, lean: config.player.bike.leanMax * lock });
      for (const [u, v] of bottomEdge) lowest = Math.min(lowest, onSprite(u, v)[1]);
      for (const v of [cy0 / png.height, (cy1 + 1) / png.height]) {
        leftGap = Math.max(leftGap, onSprite(cx0 / png.width, v)[0]);
        rightGap = Math.max(rightGap, 1 - onSprite((cx1 + 1) / png.width, v)[0]);
      }
    }
    console.log(`  content in the source: ${(cx0 / png.width * 100).toFixed(1)}..`
      + `${((cx1 + 1) / png.width * 100).toFixed(1)}% across, `
      + `${(cy0 / png.height * 100).toFixed(1)}..`
      + `${((cy1 + 1) / png.height * 100).toFixed(1)}% down`);
    console.log(`  cut bottom edge spans ${bottomEdge.length} sampled columns; `
      + `at full sway it never rises above ${(lowest * 100).toFixed(1)}% down`
      + `${lowest < 1 ? '   GAP UNDER THE COCKPIT' : '   (stays off screen)'}`);
    console.log(`  at full sway the silhouette stops `
      + `${(Math.max(leftGap, 0) * 100).toFixed(2)}% from the left edge and `
      + `${(Math.max(rightGap, 0) * 100).toFixed(2)}% from the right`);
    settle({ steer: 0, lean: 0 });

    cockpit.dispose();
  }
}

if (process.argv.includes('--parts')) {
  const width = 1024; const height = 576;
  const proj = rig.camera.projectionMatrix;
  const v = new THREE.Vector3();
  console.log('part          tris     camera z          across            down');
  for (const mesh of rig.meshes) {
    const pos = mesh.geometry.attributes.position;
    let near = -Infinity; let far = Infinity;
    let x0 = 1e9; let x1 = -1e9; let y0 = 1e9; let y1 = -1e9;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      near = Math.max(near, v.z); far = Math.min(far, v.z);
      if (v.z > -0.02) continue;
      const p2 = v.clone().applyMatrix4(proj);
      const sx = (p2.x + 1) * 0.5; const sy = (1 - p2.y) * 0.5;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx);
      y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    const tris = (mesh.geometry.index ? mesh.geometry.index.count : pos.count) / 3;
    const pc = (a, b) => `${(a * 100).toFixed(0)}..${(b * 100).toFixed(0)}%`.padEnd(14);
    console.log(`${mesh.userData.part.padEnd(12)} ${String(tris).padStart(5)}  `
      + `${near.toFixed(3)}..${far.toFixed(3)}   ${pc(x0, x1)}  ${pc(y0, y1)}`);
  }
}

if (process.argv.includes('--depths')) {
  const rows = depths(rig);
  const sorted = [...rows].sort((p, q) => q.z - p.z); // nearest first: z is negative forward
  console.log(`profile ${PROFILE}, camera ${CAMERA} `
    + `(riderOrigin z ${rig.framing.riderOrigin.z.toFixed(3)})`);
  console.log('nearest the rider first; z is negative down the road\n');
  console.log('   part                      camera z    distance');
  for (const row of sorted) {
    console.log(`   ${row.name}   ${row.z.toFixed(4).padStart(9)}   `
      + `${(-row.z).toFixed(4)}`);
  }
}

const renderArg = process.argv.indexOf('--render');
if (renderArg !== -1) {
  const path = process.argv[renderArg + 1] || 'cockpit.ppm';
  const width = 1024;
  const height = Math.round(width / rig.profile.aspect);
  const buffers = render(rig, width, height);
  if (config.player.cockpit.source !== 'sprite') drawHands(rig, buffers, width, height);

  const bytes = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height * 3; i++) {
    bytes[i] = Math.max(0, Math.min(255, Math.round(buffers.colour[i])));
  }
  writeFileSync(path, Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`), bytes]));
  console.log(`${path}  ${width}x${height}  horizon at `
    + `${(buffers.horizon / height * 100).toFixed(1)}% down`);
}
