/**
 * Where the gloves land in the frame, and what width and inset put them there.
 *
 *     node tools/measure-hands.mjs             # report both profiles
 *     node tools/measure-hands.mjs --solve     # and solve for the targets
 *
 * The cockpit framing is specified in percentages of the picture - "hands at
 * 20 and 80 per cent across, 85 per cent down at 16:9" - and until now those
 * percentages were checked by eye against a screenshot and the numbers that
 * satisfy them written into config/framing.js as a result nobody could redo.
 * That held for exactly as long as the artwork did. A redrawn sprite changes
 * its own aspect, which changes the plane's height, which moves the hand inside
 * the plane, and there was no way to tell how far except by looking again.
 *
 * So this computes it. Nothing here is a model of the rig - it imports the rig,
 * the config and the anchor maths the game uses and asks THREE to project the
 * result, so a change to any of them shows up here rather than quietly
 * invalidating a comment.
 *
 * WHAT IT PROJECTS is a point on the texture, not the plane. The plane is
 * mostly forearm and empty corner; the hand is a patch inside it, and the patch
 * moves when the artwork's aspect changes even though the plane has not moved
 * at all. The landmark is found in the image rather than declared - see
 * knuckleCentre - so a redraw is measured rather than assumed.
 *
 * It runs at rest: no steer, no throttle, no bob. That is not a simplification
 * of the rig, it is the rig - fovCompensation is 0, and the steering pivot and
 * the parts group cancel. What is deliberately ignored is the camera's own
 * height and pitch, because the rig is a CHILD of the camera: moving the camera
 * carries the cockpit with it and shifts it in frame by nothing, which is the
 * same finding config/framing.js records for pitch against riderOrigin. The
 * camera profile's RIDER push is not ignored - that one does move the cockpit,
 * and CAMERA=cinematic switches to it.
 */

import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import * as THREE from 'three';

import { config } from '../src/config.js';
import { Framing } from '../src/core/Framing.js';
import { gripAnchorFrame, SIDE_LEFT, SIDE_RIGHT } from '../src/player/rider/hands/anchors.js';

/** The framing contract, as percentages of the frame. */
const TARGET = { across: 0.20, down: 0.85 };

// Overridable so a previous drawing can be measured with the same ruler; the
// solve below is only meaningful against the sprite that ships.
const SPRITE = process.env.SPRITE || 'public/sprites/glove-right.png';

/**
 * The grip as the ARTWORK draws it, in fractions across and down the image.
 *
 * Read off public/sprites/glove-right.png at 1024x908. The drawn bar runs dead
 * horizontal: the centre of the exposed tube inboard of the fist is at
 * (130, 201) and the centre of the bar end cap is at (517, 200), which is less
 * than a pixel of slope over 387. `radius` is half the tube's drawn thickness
 * at the inboard end, where it is not covered by the glove - it spans y 160 to
 * 242, so 41 px.
 */
const DRAWN_GRIP = {
  inner: [130 / 1024, 200.5 / 908],
  outer: [517 / 1024, 200.5 / 908],
  radius: 41 / 908,
};

// --- the PNG, without a decoder -------------------------------------------

/**
 * Width, height and alpha of a PNG, read directly.
 *
 * Only the header is needed for the aspect, and the alpha for the landmark.
 * Pulling in a decoder for that would add a dependency to a repository whose
 * whole point is that it has almost none.
 */
function readPng(path) {
  const buffer = readFileSync(path);
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error(`${path}: not a PNG`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const depth = buffer[24];
  const colour = buffer[25];
  if (depth !== 8 || colour !== 6) throw new Error(`${path}: expected 8 bit RGBA`);

  // Concatenate every IDAT, inflate, then undo the per scanline filter. The
  // filters are the whole reason this cannot just be sliced.
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
  const previous = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const source = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= 4 ? line[i - 4] : 0;
      const b = previous[i];
      const c = i >= 4 ? previous[i - 4] : 0;
      let value = source[i];
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
    previous.set(line);
  }
  return { width, height, alpha: out };
}

// --- the landmark ----------------------------------------------------------

/**
 * Where the hand is in its own picture, as a fraction across and down.
 *
 * Not the centroid of the sprite: three quarters of the opaque area is forearm
 * and the arm's far end is exactly the part that fades out, so a centroid drifts
 * with how long the sleeve happens to be. Not a hand written pair of numbers
 * either - that is the thing this file exists to stop.
 *
 * The glove is the WIDEST part of the drawing. The arm is a tapering tube seen
 * end on and the hand is across the end of it, fingers and knuckle armour
 * spread over the bar, so the rows through the glove span more columns than any
 * row through the arm. Taking the widest few per cent of rows and averaging
 * their span needs nothing said about the pose and picks the same feature on
 * every frame.
 *
 * What it finds is the centre of that widest band - hand, switch block and bar
 * end together - and NOT the knuckles, which is worth saying plainly because an
 * earlier version of this comment claimed the knuckles and was never checked.
 * On the 35 degree art the band is rows 191 to 318 and its centre lands at
 * (278, 270), which is 47 px left of the carbon plate's centre and 122 px below
 * it. The reason to keep it anyway is that it is the same feature on the old
 * drawing and the new one, and measured against the shipped config the old
 * drawing put it at 84.4 per cent down a 16:9 frame where the contract says 85
 * - so this is the point the original framing was solved against, whatever it
 * was called at the time.
 */
function knuckleCentre({ width, height, alpha }) {
  const spans = [];
  for (let y = 0; y < height; y++) {
    let lo = -1; let hi = -1;
    for (let x = 0; x < width; x++) {
      if (alpha[y * width + x] > 8) { if (lo < 0) lo = x; hi = x; }
    }
    if (lo >= 0) spans.push({ y, lo, hi, span: hi - lo });
  }
  if (!spans.length) throw new Error('sprite is empty');

  const widest = [...spans].sort((a, b) => b.span - a.span);
  const take = Math.max(1, Math.round(widest.length * 0.05));
  const band = widest.slice(0, take);
  const x = band.reduce((sum, r) => sum + (r.lo + r.hi) / 2, 0) / band.length;
  const y = band.reduce((sum, r) => sum + r.y, 0) / band.length;
  // The band's own span as well, so the glove's SIZE on screen can be compared
  // across redraws and not only its position. A width solved for a position
  // target moves the hand and resizes it in the same move, and only one of
  // those two is written down anywhere.
  const lo = band.reduce((sum, r) => sum + r.lo, 0) / band.length;
  const hi = band.reduce((sum, r) => sum + r.hi, 0) / band.length;
  return { s: x / width, t: y / height, sLo: lo / width, sHi: hi / width };
}

// --- the rig ---------------------------------------------------------------

/**
 * The transform chain from Rider.js and SpriteHands.js, built out of the real
 * anchor maths, with the camera as the root so that a mesh's world matrix IS
 * its camera space matrix.
 */
function buildRig() {
  const cfg = config.player.rider;
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);

  const group = new THREE.Group();          // Rider: riderOrigin + camera profile
  camera.add(group);
  const steering = new THREE.Group();       // identity rotation at rest
  steering.position.set(cfg.steering.pivot.x, cfg.steering.pivot.y, cfg.steering.pivot.z);
  group.add(steering);
  const parts = new THREE.Group();
  parts.position.set(-cfg.steering.pivot.x, -cfg.steering.pivot.y, -cfg.steering.pivot.z);
  steering.add(parts);
  const hardware = new THREE.Group();
  hardware.scale.setScalar(cfg.hardwareScale);
  parts.add(hardware);
  // The chassis hangs off the rig beside the steering group, NOT inside it, and
  // carries no hardwareScale. Anything measured against a part in here has to
  // be measured in here; the two spaces differ by 8 per cent and a turn of the
  // bars, which is exactly the gap the windscreen fell down.
  const chassis = new THREE.Group();
  group.add(chassis);

  const meshes = {};
  for (const side of [SIDE_RIGHT, SIDE_LEFT]) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
    const root = gripAnchorFrame(cfg.anchors.rightGrip, SIDE_RIGHT, new THREE.Matrix4());
    mesh.position.setFromMatrixPosition(root);
    mesh.position.x *= side;
    // The anchor point ALONE. SpriteHands folds the sprite offset in here, and
    // folding it in here too made every offset the solver tried a delta on top
    // of the shipped one while reporting it as the absolute - so the numbers it
    // printed were wrong by exactly the values already in the file, which is
    // the kind of wrong that still looks plausible. project() applies the whole
    // offset instead, and there is only one of it.
    mesh.userData.rest = mesh.position.clone();
    mesh.userData.side = side;
    hardware.add(mesh);
    meshes[side === SIDE_RIGHT ? 'right' : 'left'] = mesh;
  }
  return { camera, group, meshes, parts, hardware, chassis };
}

const _point = new THREE.Vector3();


/**
 * Screen position of a point on a glove's texture, as fractions across and down.
 * @param {object} rig
 * @param {'left'|'right'} which
 * @param {{s: number, t: number}} at fraction across and down the IMAGE
 * @param {object} knobs aspect, fov, riderOrigin, width, handScale, handInset, texAspect
 */
function project(rig, which, at, knobs) {
  const { camera, group, meshes } = rig;
  camera.fov = knobs.fov;
  camera.aspect = knobs.aspect;
  camera.updateProjectionMatrix();
  group.position.set(knobs.riderOrigin.x, knobs.riderOrigin.y, knobs.riderOrigin.z);

  const mesh = meshes[which];
  const side = mesh.userData.side;
  // Reset, because the throttle roll below PREMULTIPLIES. SpriteHands copies a
  // fresh orientation in every frame and this skipped that, so each projection
  // inherited the previous one's roll and every reading after the first was
  // measured from a pose that no frame of the game ever holds. It cost a set of
  // numbers that looked plausible and put the wrist below the bottom of the
  // frame. At rest the orientation is identity - the steering group is square,
  // and cancelling a rotation of nothing is nothing.
  mesh.quaternion.identity();
  const planeWidth = knobs.width * knobs.handScale;
  // The mirror is a NEGATIVE x scale, exactly as SpriteHands applies it.
  mesh.scale.set(side === SIDE_LEFT ? -planeWidth : planeWidth,
    planeWidth / knobs.texAspect, 1);
  // The anchor point plus the sprite offset, exactly as SpriteHands builds it,
  // and then the inset. x is mirrored by side; y and z are not.
  const [ox, oy, oz] = knobs.offset;
  mesh.position.set(mesh.userData.rest.x + (ox - knobs.handInset) * side,
    mesh.userData.rest.y + oy, mesh.userData.rest.z + oz);

  // There is no throttle or brake transform to replicate any more: the plane is
  // frozen against both, and only followSteer and the framing move it. Anything
  // that reappears here should be measured before it is believed - the roll that
  // used to be here moved the sleeve 28 per cent of the frame.
  camera.updateMatrixWorld(true);

  // Image row 0 is the TOP, and three's uv origin is the bottom left, so the
  // fraction down the image becomes a local y measured the other way.
  _point.set(at.s - 0.5, 0.5 - at.t, 0);
  mesh.localToWorld(_point);
  _point.project(camera);
  return { across: (_point.x + 1) / 2, down: (1 - _point.y) / 2 };
}

// --- report and solve ------------------------------------------------------

const sprite = await readPng(SPRITE);
const texAspect = sprite.width / sprite.height;
const landmark = knuckleCentre(sprite);
// The camera profile is a global switch in config, and the cinematic one moves
// the cockpit - so it is checked from here rather than assumed to compose like
// the riding one. CLAUDE.md asks for exactly this of any new camera profile.
if (process.env.CAMERA) config.player.camera.profile = process.env.CAMERA;

const rig = buildRig();
const framing = new Framing();
const live = config.player.rider.hand.sprite;

function knobsFor(profile, over) {
  framing.update(profile.aspect);
  // riderOrigin PLUS the selected camera profile's rider push, because that is
  // what Rider.update sets the group to. Reading only riderOrigin made the
  // cinematic profile measure identically to the riding one, which is wrong in
  // a way that looks right: the two agree for `ride` because its offsets are
  // all zero, so the omission hides until the moment it matters.
  const push = framing.camera.rider;
  return {
    aspect: profile.aspect,
    fov: framing.fov,
    riderOrigin: {
      x: framing.riderOrigin.x + push.x,
      y: framing.riderOrigin.y + push.y,
      z: framing.riderOrigin.z + push.z,
    },
    width: live.width,
    offset: live.offset,
    handScale: framing.handScale,
    handInset: framing.handInset,
    texAspect,
    ...over,
  };
}

/** Screen width of the glove itself, as a fraction of the frame. */
function gloveSpan(knobs) {
  return project(rig, 'right', { s: landmark.sHi, t: landmark.t }, knobs).across
    - project(rig, 'right', { s: landmark.sLo, t: landmark.t }, knobs).across;
}

console.log(`sprite ${SPRITE}  ${sprite.width}x${sprite.height}  aspect ${texAspect.toFixed(4)}`);
console.log(`landmark (widest rows) ${(landmark.s * 100).toFixed(1)}% across, `
  + `${(landmark.t * 100).toFixed(1)}% down the image\n`);

for (const profile of config.framing.profiles) {
  const knobs = knobsFor(profile, {});
  const left = project(rig, 'left', landmark, knobs);
  const right = project(rig, 'right', landmark, knobs);
  console.log(`${profile.name}  aspect ${profile.aspect}  fov ${knobs.fov}`);
  console.log(`  width ${knobs.width.toFixed(4)}  handScale ${knobs.handScale.toFixed(3)}`
    + `  handInset ${knobs.handInset.toFixed(4)}`);
  console.log(`  left hand  ${(left.across * 100).toFixed(1)}% across, `
    + `${(left.down * 100).toFixed(1)}% down`);
  console.log(`  right hand ${(right.across * 100).toFixed(1)}% across, `
    + `${(right.down * 100).toFixed(1)}% down`);
  console.log(`  glove spans ${(gloveSpan(knobs) * 100).toFixed(1)}% of frame width`);
  const want = profile.name === 'wide'
    ? `  target ${(TARGET.across * 100).toFixed(0)}% / ${((1 - TARGET.across) * 100).toFixed(0)}% `
      + `across, ${(TARGET.down * 100).toFixed(0)}% down`
    : '  (9:16 is held to looking right, not to the 16:9 percentages)';
  console.log(want + '\n');
}

/**
 * Root of `f` on [lo, hi], without being told which way it runs.
 *
 * Both knobs looked obviously monotonic and one of them ran backwards. The
 * landmark sits ABOVE the middle of the plane in the 35 degree art - 30 per
 * cent down the image, where the old drawing had it at 42 - so a taller plane
 * now lifts the hand up the frame instead of pushing it down, and a bisection
 * written around the old sign walks confidently to the wrong end of the range.
 * Bracketing first costs a few dozen evaluations and cannot be wrong about it.
 */
function solve(f, lo, hi, steps = 96) {
  let a = lo;
  let fa = f(a);
  for (let i = 1; i <= steps; i++) {
    const b = lo + ((hi - lo) * i) / steps;
    const fb = f(b);
    if ((fa <= 0 && fb >= 0) || (fa >= 0 && fb <= 0)) {
      let low = a; let high = b; let flow = fa;
      for (let j = 0; j < 80; j++) {
        const mid = (low + high) / 2;
        const fm = f(mid);
        if ((flow <= 0 && fm <= 0) || (flow >= 0 && fm >= 0)) { low = mid; flow = fm; } else high = mid;
      }
      return (low + high) / 2;
    }
    a = b; fa = fb;
  }
  return NaN;
}

/**
 * The four corners of each glove plane, in frame fractions, as JSON.
 *
 * Numbers on their own cannot say whether a frame composes; that is what the
 * percentages are a proxy for, and a proxy is worth checking against the thing
 * it stands in for. tools/preview-hands.py turns this into a picture.
 */
if (process.argv.includes('--quads')) {
  const over = process.env.KNOBS ? JSON.parse(process.env.KNOBS) : {};
  const out = {};
  for (const profile of config.framing.profiles) {
    const knobs = knobsFor(profile, over);
    // Inset is the one knob that is per profile, so a trial set carries one per
    // profile too. Without this the tall frame previews at the wide frame's
    // inset, which is exactly the mistake the per profile numbers exist to stop.
    const perProfile = over[`${profile.name}Inset`];
    if (perProfile !== undefined) knobs.handInset = perProfile;
    out[profile.name] = { aspect: profile.aspect, hands: {}, axes: {} };

    // The two grip axes, so the preview can show whether they coincide. This is
    // the whole of the "I see two bars" report, drawn instead of tabulated.
    const mesh = rig.meshes.right;
    project(rig, 'right', { s: 0.5, t: 0.5 }, knobs);
    const hardware = mesh.parent;
    const frameOf = (v) => {
      const q = hardware.localToWorld(v.clone());
      q.project(rig.camera);
      return [(q.x + 1) / 2, (1 - q.y) / 2];
    };
    const onPlane = ([u, v]) => new THREE.Vector3(u - 0.5, 0.5 - v, 0)
      .multiply(mesh.scale).applyQuaternion(mesh.quaternion).add(mesh.position);
    const anchor = config.player.rider.anchors.rightGrip;
    out[profile.name].axes.drawn = [frameOf(onPlane(DRAWN_GRIP.inner)),
      frameOf(onPlane(DRAWN_GRIP.outer))];
    out[profile.name].axes.real = [frameOf(new THREE.Vector3().fromArray(anchor.from)),
      frameOf(new THREE.Vector3().fromArray(anchor.to))];
    for (const which of ['left', 'right']) {
      out[profile.name].hands[which] = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([s, t]) => {
        const at = project(rig, which, { s, t }, knobs);
        return [at.across, at.down];
      });
    }
  }
  console.log(JSON.stringify({ sprite: SPRITE, ...out }));
}

/**
 * The bar the artwork draws against every solid part near the glove.
 *
 * Reported in the HARDWARE group space, which is where they meet: the anchor is
 * authored there and the sprite plane is a direct child of it, so the two are
 * comparable with no camera in the way. A point on the plane reaches that space
 * through the mesh own scale, orientation and position and no further, which is
 * why this does not use localToWorld - that would walk up to the camera and
 * answer a different question.
 *
 * It lists more than the anchor on purpose. "I see a second bar" does not say
 * WHICH part is being seen, and the anchor is not the only tube in that corner
 * of the frame: there is a clip-on stub, a fork top and a mirror stalk as well,
 * and under style clipOn the handlebar path is not built at all.
 */
if (process.argv.includes('--grip')) {
  const anchor = config.player.rider.anchors.rightGrip;
  const rider = config.player.rider;
  const only = process.env.PROFILE;
  const shown = config.framing.profiles.filter((p) => !only || p.name === only);
  const wide = shown[shown.length - 1];
  const knobs = knobsFor(wide, {});

  project(rig, 'right', { s: 0.5, t: 0.5 }, knobs);
  const mesh = rig.meshes.right;
  const onPlane = ([u, v]) => new THREE.Vector3(u - 0.5, 0.5 - v, 0)
    .multiply(mesh.scale).applyQuaternion(mesh.quaternion).add(mesh.position);

  const drawnInner = onPlane(DRAWN_GRIP.inner);
  const drawnOuter = onPlane(DRAWN_GRIP.outer);
  const drawnDir = new THREE.Vector3().subVectors(drawnOuter, drawnInner).normalize();

  const vec = (a) => new THREE.Vector3().fromArray(a);
  // Overridable so a proposed stub can be aimed before it is written down.
  const stub = process.env.CLIPON
    ? JSON.parse(process.env.CLIPON) : rider.machine.controls.clipOn;
  const fork = process.env.FORKTOP ? JSON.parse(process.env.FORKTOP) : rider.machine.forkTop;

  const parts = [
    ['DRAWN grip (sprite)', drawnInner, drawnOuter],
    ['grip anchor       ', vec(anchor.from), vec(anchor.to)],
    ['clip-on stub      ', vec(stub.from), vec(stub.to)],
    ['fork top          ', vec(fork.from), vec(fork.to)],
    ['mirror stalk      ', vec(rider.mirror.stalkFrom), vec(rider.mirror.stalkTo)],
  ];
  if (rider.bar.style !== 'clipOn') {
    parts.push(['handlebar path end', vec(rider.bar.path[rider.bar.path.length - 2]),
      vec(rider.bar.path[rider.bar.path.length - 1])]);
  }

  const f4 = (v) => `[${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)}]`;
  const camera = rig.camera;
  const hardware = mesh.parent;
  const frameOf = (v) => {
    const q = hardware.localToWorld(v.clone());
    q.project(camera);
    return [(q.x + 1) / 2, (1 - q.y) / 2];
  };
  const pct = ([x, y]) => `(${(x * 100).toFixed(1)}%, ${(y * 100).toFixed(1)}%)`;

  console.log('=== world space, hardware group ===');
  for (const [name, a, b] of parts) {
    console.log(`${name}  from ${f4(a)}  to ${f4(b)}`);
  }
  for (const profile of shown) {
    const pk = knobsFor(profile, {});
    project(rig, 'right', { s: 0.5, t: 0.5 }, pk);
    rig.camera.updateMatrixWorld(true);
    // Recomputed PER PROFILE. The plane is scaled by handScale and pulled in by
    // handInset, both of which differ between 16:9 and 9:16, so the drawn bar
    // does not sit in the same place in rig space at the two aspects - and the
    // anchor, being three fixed numbers, can only meet it at one of them.
    // Measuring the drawn bar once and reporting it against both profiles hid
    // exactly that, and it is the thing most worth seeing.
    parts[0][1] = onPlane(DRAWN_GRIP.inner);
    parts[0][2] = onPlane(DRAWN_GRIP.outer);
    const drawnMid = frameOf(onPlane([(DRAWN_GRIP.inner[0] + DRAWN_GRIP.outer[0]) / 2,
      DRAWN_GRIP.inner[1]]))[1];
    console.log('');
    console.log(`=== ${profile.name} (${profile.aspect}), camera `
      + `${config.player.camera.profile} ===`);
    for (const [name, a, b] of parts) {
      const fa = frameOf(a); const fb = frameOf(b);
      const onScreen = [fa, fb].some(([x, y]) => x >= 0 && x <= 1 && y >= 0 && y <= 1);
      // The drawn bar projects to a horizontal line, so "how far off that line"
      // is just the vertical gap - which is the number that decides whether two
      // tubes read as one bar or as two.
      const off = `  off the drawn line by `
        + `${((fa[1] - drawnMid) * 100).toFixed(1)}% / `
        + `${((fb[1] - drawnMid) * 100).toFixed(1)}%`;
      const note = name.startsWith('DRAWN') ? '' : off + (onScreen ? '' : '  (off frame)');
      console.log(`${name}  inner ${pct(fa)}  outer ${pct(fb)}${note}`);
    }
  }
  project(rig, 'right', { s: 0.5, t: 0.5 }, knobs);

  console.log('');
  console.log('=== drawn grip against the grip anchor ===');
  const realInner = vec(anchor.from);
  const realOuter = vec(anchor.to);
  const realDir = new THREE.Vector3().subVectors(realOuter, realInner).normalize();
  console.log(`drawn direction ${f4(drawnDir)}`);
  console.log(`real  direction ${f4(realDir)}`);
  console.log(`angle between them ${(Math.acos(Math.min(1, drawnDir.dot(realDir)))
    * 180 / Math.PI).toFixed(1)} degrees`);
  console.log(`drawn length ${drawnInner.distanceTo(drawnOuter).toFixed(4)}, `
    + `anchor length ${realInner.distanceTo(realOuter).toFixed(4)}`);

  const origin = new THREE.Vector3().lerpVectors(realInner, realOuter, anchor.along);
  const along = new THREE.Vector3().subVectors(origin, drawnInner).dot(drawnDir);
  const foot = new THREE.Vector3().copy(drawnInner).addScaledVector(drawnDir, along);
  const gap = new THREE.Vector3().subVectors(foot, origin);
  console.log(`anchor origin (where the sprite is placed from) ${f4(origin)}`);
  console.log(`drawn axis at its closest to that origin        ${f4(foot)}`);
  console.log(`OFFSET, drawn minus real                        ${f4(gap)}`);
  console.log(`  magnitude ${gap.length().toFixed(4)} rider units, `
    + `${(gap.length() / rider.bar.radius).toFixed(1)}x the bar tube radius`);
  console.log(`radius: drawn ${(DRAWN_GRIP.radius * knobs.width * knobs.handScale
    / knobs.texAspect).toFixed(4)}, anchor ${anchor.radius.toFixed(4)}, `
    + `clip-on stub ${rider.machine.controls.clipOn.radius.toFixed(4)}`);
}

/**
 * Where the bodywork lands in the frame - the screen, the mirrors, the cluster.
 *
 * The screen is sampled on its actual surface rather than reasoned about: it is
 * an ellipsoid with a rake, so its silhouette is not its radii and the top of
 * it is not offset plus b. SCREEN=... supplies a trial {radii, offset, rotation}
 * so a proposal can be measured before it is written down.
 */
if (process.argv.includes('--bodywork')) {
  // Both profiles. A part that composes at 16:9 and not at 9:16 is a part that
  // does not compose, and 9:16 is the shape the footage is cut in.
  for (const profile of config.framing.profiles) {
  // project() is what pushes a profile onto the camera and the rig - fov,
  // aspect and riderOrigin - so calling knobsFor alone left the camera holding
  // whatever the previous report had set. Both profiles then measured
  // identically, which is the giveaway: they have different fields of view and
  // cannot agree to four figures.
  const knobs = knobsFor(profile, {});
  project(rig, 'right', { s: 0.5, t: 0.5 }, knobs);
  const camera = rig.camera;
  rig.camera.updateMatrixWorld(true);

  const frameOf = (space, v) => {
    const q = space.localToWorld(v.clone());
    q.project(camera);
    return [(q.x + 1) / 2, (1 - q.y) / 2];
  };

  const screen = process.env.SCREEN
    ? JSON.parse(process.env.SCREEN) : config.player.rider.machine.screen;
  const m = new THREE.Matrix4();
  const e = new THREE.Euler(screen.rotation[0], screen.rotation[1], screen.rotation[2], 'XYZ');
  m.compose(new THREE.Vector3().fromArray(screen.offset),
    new THREE.Quaternion().setFromEuler(e), new THREE.Vector3(1, 1, 1));

  // The lit edge is what reads at night, and it is the ring: a flat ellipse of
  // the screen's own radii, in the panel's plane. Sampling that is sampling
  // what the eye actually sees the screen as.
  const box = { left: 1e9, right: -1e9, top: 1e9, bottom: -1e9 };
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * Math.PI * 2;
    const point = new THREE.Vector3(Math.cos(a) * screen.radii[0],
      Math.sin(a) * screen.radii[1], 0).applyMatrix4(m);
    const [x, y] = frameOf(rig.chassis, point);
    box.left = Math.min(box.left, x); box.right = Math.max(box.right, x);
    box.top = Math.min(box.top, y); box.bottom = Math.max(box.bottom, y);
  }

  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  console.log(`--- ${profile.name} (${profile.aspect}), as fractions of the frame ---`);
  console.log(`screen lit edge: across ${pct(box.left)}..${pct(box.right)} `
    + `(width ${pct(box.right - box.left)})`);
  console.log(`                 down   ${pct(box.top)}..${pct(box.bottom)} `
    + `(height ${pct(box.bottom - box.top)})`);
  console.log(`                 shape  ${((box.right - box.left)
    / (box.bottom - box.top)).toFixed(2)} wide per tall`);

  const mirror = config.player.rider.mirror;
  for (const sign of [-1, 1]) {
    const head = new THREE.Vector3(mirror.stalkTo[0] * sign, mirror.stalkTo[1], mirror.stalkTo[2]);
    const [x, y] = frameOf(rig.hardware, head);
    console.log(`mirror head ${sign > 0 ? 'right' : 'left '}: (${pct(x)}, ${pct(y)})`);
  }
  // The inner faces of the two stalks, which is the gap the screen has to fill.
  const stalkX = mirror.stalkTo[0];
  const inner = frameOf(rig.hardware, new THREE.Vector3(-stalkX, mirror.stalkTo[1],
    mirror.stalkTo[2]));
  const outer = frameOf(rig.hardware, new THREE.Vector3(stalkX, mirror.stalkTo[1],
    mirror.stalkTo[2]));
  console.log(`gap between mirror heads: ${pct(outer[0] - inner[0])} of frame width`);
  console.log(`screen fills ${((box.right - box.left) / (outer[0] - inner[0]) * 100).toFixed(0)}`
    + '% of it');

  const cluster = new THREE.Vector3().fromArray(config.player.rider.instruments.offset);
  const [cx, cy] = frameOf(rig.parts, cluster);
  console.log(`cluster centre: (${pct(cx)}, ${pct(cy)})`);
  console.log('');
  }
}

if (process.argv.includes('--solve')) {
  const wide = config.framing.profiles.find((p) => p.name === 'wide');
  const tall = config.framing.profiles.find((p) => p.name === 'tall');
  const reference = Number(process.env.GLOVE_SPAN || 0.265);

  // FOUR knobs, each solved for the one thing it owns, in an order where none
  // of them disturbs a target already met.
  //
  // It is four and not the two asked for because the drawn hand moved inside
  // its own picture. The old sprite had the knuckles at 47 per cent across and
  // 42 per cent down the image, close enough to the middle that the plane grew
  // around them and `width` was purely a size knob. The 35 degree art puts them
  // at 27 and 30, well up and to the left of centre, with the rest of the
  // picture given over to forearm - so scaling the plane now MOVES the hand,
  // and `width` cannot set the size and the position at once. `offset` is the
  // knob for the position; sliding the drawn hand off the plane's centre is the
  // job it was added to do, and a redraw that moves the hand within the picture
  // is exactly the event it exists to absorb.

  // 1. WIDTH sets the size, and the size is the one number here that was signed
  //    off by eye rather than derived: the glove spanning 26.5 per cent of a
  //    16:9 frame. Held, so the redraw changes the drawing and not the bike.
  const width = solve(
    (w) => gloveSpan(knobsFor(wide, { width: w, handInset: 0 })) - reference,
    0.05, 1.5);
  if (!Number.isFinite(width)) throw new Error('no width reaches the reference glove size');

  // 2 and 3. OFFSET puts the hand where the contract says, at 16:9, with no
  //    inset in play - so what it solves is the shared placement and not a
  //    per aspect correction. Vertical first: it is independent of the
  //    horizontal, and doing it second would be solving against a moving target.
  const depth = live.offset[2];
  const base = { width, handInset: 0 };
  const offsetY = solve(
    (y) => project(rig, 'right', landmark,
      knobsFor(wide, { ...base, offset: [0, y, depth] })).down - TARGET.down,
    -1.0, 1.0);
  const offsetX = solve(
    (x) => project(rig, 'right', landmark,
      knobsFor(wide, { ...base, offset: [x, offsetY, depth] })).across - (1 - TARGET.across),
    -1.0, 1.0);
  const offset = [offsetX, offsetY, depth];

  // 4. HANDINSET is then only the per aspect correction it is documented to be.
  //    Wide is already on target, so its inset is zero and stays zero; tall
  //    needs one because its horizontal field of view is half as wide.
  const insetFor = (profile) => solve(
    (inset) => project(rig, 'right', landmark,
      knobsFor(profile, { width, offset, handInset: inset })).across - (1 - TARGET.across),
    -0.4, 0.4);

  const live_offset = config.player.rider.hand.sprite.offset;
  console.log('--- solved ---');
  console.log(`width   ${width.toFixed(4)}   (was ${live.width.toFixed(4)})`);
  console.log(`offset  [${offsetX.toFixed(4)}, ${offsetY.toFixed(4)}, `
    + `${depth.toFixed(4)}]   (was [${live_offset.map((v) => v.toFixed(4)).join(', ')}])`);
  for (const profile of [wide, tall]) {
    const inset = insetFor(profile);
    const knobs = knobsFor(profile, { width, offset, handInset: inset });
    const right = project(rig, 'right', landmark, knobs);
    const left = project(rig, 'left', landmark, knobs);
    const outer = project(rig, 'right', { s: 1, t: landmark.t }, knobs);
    const innerR = project(rig, 'right', { s: 0, t: landmark.t }, knobs);
    const innerL = project(rig, 'left', { s: 0, t: landmark.t }, knobs);
    console.log(`${profile.name}: handInset ${inset.toFixed(4)}`
      + `  (was ${profile.handInset.toFixed(4)})`);
    console.log(`  hands ${(left.across * 100).toFixed(1)}% / ${(right.across * 100).toFixed(1)}%`
      + ` across, ${(right.down * 100).toFixed(1)}% down`);
    console.log(`  glove spans ${(gloveSpan(knobs) * 100).toFixed(1)}% of frame width`);
    console.log(`  plane outer edge ${(outer.across * 100).toFixed(1)}%`
      + ` (margin ${((1 - outer.across) * 100).toFixed(1)}%),`
      + ` gap between planes ${((innerR.across - innerL.across) * 100).toFixed(1)}%`);
  }
}
