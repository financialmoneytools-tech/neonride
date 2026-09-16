import { hand } from './hand.js';
import { instruments } from './instruments.js';
import { bike, machine, machines } from './machine.js';

/**
 * NEON RIDE - rider rig geometry, placement and shading.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as config.player.rider.
 *
 * Rider space: the rig is a child of the camera, so every coordinate below is
 * measured from the camera itself. +X right, +Y up, -Z forward (into the
 * screen). The origin of the rig sits at the centre of the handlebar clamp;
 * every part is placed relative to that, which is why moving `origin` moves the
 * whole cockpit without disturbing anything inside it.
 *
 * To judge a placement on screen: at depth d the visible half height is
 * d * tan(fov / 2), so a part at height y appears (1 - y / (d * tan(fov / 2)))
 * / 2 of the way down the frame. As shipped the grips sit at 65 to 72 per cent
 * down and 22 to 78 across, the mirrors at 50 to 57 down.
 */

/**
 * Named attachment point for a pair of hands, and the ONLY thing that connects
 * hands to the rest of the rig. A hand set - the primitive one here, or a
 * loaded model later - is aligned to this and to nothing else.
 *
 * The grip geometry below is built from these same numbers rather than from a
 * second copy of them, so an anchor and the tube it belongs to cannot drift
 * apart. Only the right grip is named: the left is its mirror through the YZ
 * plane, produced in hands/anchors.js.
 *
 * from / to / radius describe the tube a hand has to close around, which is
 * what a loaded model needs in order to be scaled to it. offset, rotation and
 * scale are the correction applied on top of the anchor frame, for a model
 * whose own origin, orientation or units are not ours; the primitive hands
 * need none of it and leave them neutral.
 */
// THIS IS THE GRIP THE ARTWORK DRAWS. It is not an independent opinion about
// where a grip ought to be, and it used to be one: the anchor described a tube
// running up and outboard while the sprite drew a bar lying dead flat, 0.0620
// away and 22.6 degrees off. Nothing rendered the anchor, so nothing contested
// it, and the bike was built around a bar nobody could see while the rider
// looked at a different one. Two handlebars, and the drawn one always won,
// because the drawn one is the one on screen.
//
// So it is re-authored onto the drawing, measured off public/sprites/
// glove-right.png at 1024x908 and carried into rig space by the sprite's own
// placement: the exposed tube's centre at image (130, 201), the bar end cap's
// at (517, 200) - less than a pixel of slope over 387 - and the fist covering
// that axis from x 155 to 460.
//
// What reads this: the hand sprite takes the POSITION only, and Controls.js
// aims the clip-on stub at `from`. Nothing reads the direction any more - the
// throttle roll that used to is gone - but it is still authored truthfully,
// because the next bike definition will be written against this and an anchor
// that lies propagates.
const rightGrip = {
  from: [0.2163, 0.0895, 0.0717],
  to: [0.3927, 0.0895, 0.0717],
  // Half the drawn tube's thickness at the inboard end, where the glove does
  // not cover it: it spans image y 160 to 242, so 41 px of a 908 px image
  // across a plane 0.4138 tall.
  radius: 0.0187,
  // Where along the grip the hand sits: 0 inner end, 1 outer end. The middle of
  // the fist's own coverage of the drawn bar - image x 155 to 460, midpoint
  // 307, against an axis running 130 to 517. It was 0.44, reasoned about a 3D
  // grip tube that is no longer built; this is measured off the hand that is.
  along: 0.4587,
  offset: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
};

export const rider = {
  // The anchor frame is +X outward along the grip, +Y up away from it, +Z back
  // at the rider. Anything aligned here inherits the grip's own angle.
  anchors: { rightGrip },

  origin: { x: 0, y: -0.202, z: -0.6 },

  // How much the cockpit resists the speed field of view ramp.
  //   0 - it shrinks in frame as the view opens up, exactly like the world.
  //       This is a real speed cue and is why it is the default.
  //   1 - it keeps the same share of the frame at every speed.
  // Only the size is scaled, never the distance; scaling both would cancel out.
  // Values near 1 grow the rig toward the camera, so check the near plane
  // clearance before shipping anything above about 0.6.
  // How much smaller the bars, grips, levers, mirrors, fork top and hands are
  // than they were authored. See the note on the hardware group in Rider.js:
  // the assembly was oversized against the bodywork, the hands twice the
  // fairing's share of the frame, and this is the one knob that fixes all of it
  // without any part losing its fit against the others. The cluster is not
  // inside it and does not change.
  hardwareScale: 0.92,

  fovCompensation: 0,
  bobLag: 0.3, // share of the camera bob the rig does NOT follow

  // The bars turn about the steering head, which is raked back like a real
  // one, so the ends swing fore and aft rather than sliding sideways.
  steering: {
    pivot: { x: 0, y: -0.16, z: -0.16 },
    rake: 0.44, // radians the steering axis leans back from vertical
    maxAngle: 0.19, // radians of bar rotation at full steer
    tau: 0.09,
  },

  // Handlebar centreline for the right half, mirrored for the left.
  // Points are joined by tubes with a sphere at every bend.
  bar: {
    // ONE CONTINUOUS TUBE, grip to grip, clamped in the middle.
    //
    // It was 'clipOn': no crossbar at all, and two stubs reaching in from the
    // fork tops instead. That is what a supersport has and it is not what the
    // camera sees. From the saddle the two stubs read as two disconnected
    // pieces of metal with a gap between them, because that is what they are -
    // there was never anything spanning the centre.
    //
    // The path now STARTS AT x 0. Built mirrored, the two halves meet exactly
    // on the centreline and the clamp closes over the join, so the bar is one
    // unbroken tube from the left grip to the right one.
    //
    // It ends on the grip anchor, [0.2163, 0.0895, 0.0717], which is the grip
    // the hand sprite draws - so the tube runs into the artwork and stops
    // inside it. The sweep is back and very slightly up: 0.057 of rise and
    // 0.057 of reach toward the rider across the half span, which is a bar with
    // a little pullback rather than a straight pipe.
    radius: 0.0155,
    radialSegments: 10,
    path: [
      [0.000, 0.0755, 0.0150],
      [0.090, 0.0805, 0.0310],
      [0.160, 0.0865, 0.0540],
      [0.2163, 0.0895, 0.0717],
    ],
    // Raised to sit on the bar rather than under it. It was at y 0.004, which
    // was where the bar used to be before the grip anchor was re-authored onto
    // the drawn one and the whole bar line moved up 0.072.
    clamp: { width: 0.115, height: 0.048, depth: 0.062, y: 0.0755 },
    clampCap: { radius: 0.021, length: 0.05, spacing: 0.038 },
  },

  // The grip tube and the brake lever used to be described here. Both are drawn
  // into the hand sprite now, with the bar end and the switch block, so that
  // there is no seam between a 2D hand and a 3D bar. The grip ANCHOR above
  // stays: it is what the sprite is placed from.
  mirror: {
    // BESIDE THE SCREEN, ON SHORT STALKS. These numbers are CHASSIS space -
    // unscaled, bolted to the fairing - and not the bar space they used to be
    // in, so they are not comparable with what was here before.
    //
    // What was here before reached 0.31 units straight up and put the heads at
    // 35 per cent down the frame, above everything, on stalks longer than the
    // mirrors were wide. That came from a reading of the reference framing that
    // treated the mirror heads as a composition element to be placed. They are
    // not: they are the thing a rider looks in to see behind, they live either
    // side of the screen, and at this distance they are small.
    //
    // The stalk is 0.086 long now against 0.316, and it reaches OUT and forward
    // from the fairing shoulder rather than up from the bars.
    stalkFrom: [0.126, 0.150, -0.246],
    stalkTo: [0.201, 0.166, -0.300],
    stalkRadius: 0.011,
    stalkTipRadius: 0.008,
    // Smaller, because they are further away than they have ever been: they sit
    // at the screen's own depth now, not at the bars'.
    headRadius: 0.030,
    headDepth: 0.008,
    headSegments: 16,
    // Angled outward and slightly back, which is where a mirror has to point to
    // show the rider anything, and which also turns its edge to the camera
    // instead of its full face - less of the road covered.
    headRotation: { x: -0.30, y: -0.62, z: 0 },
    glassInset: 0.0018,
    glassRadius: 0.025,
  },

  hand,

  // Everything the rider can see of the machine itself. Lives in its own
  // file; see config/machine.js for why the placements are framing driven.
  //
  // `machine` is the fitted one and is what every builder reads. `machines` is
  // the library it was chosen from; swapping bikes points the first at another
  // entry of the second and rebuilds.
  machine,
  machines,
  bike,

  // The dash. Next door; it is the one part of the rig laid out in texture
  // pixels rather than in rider units.
  instruments,

  // Fake lighting for the whole rig. There are no lights in the scene, so
  // every rider surface is shaded by this one model instead: a key from above
  // and to the left, a cool ambient, and a rim that picks up the neon world.
  // Directions are in view space, so the shading does not swim when the
  // camera rolls.
  materials: {
    keyDirection: { x: -0.35, y: 0.72, z: 0.6 },
    frame: {
      color: 0x14161f,
      ambient: 0x1a2038,
      key: 0x9aa6c8,
      keyStrength: 0.85,
      rim: 0x4ad9ff,
      rimStrength: 0.5,
      rimPower: 2.6,
    },
    // Cast and anodised parts, as against the frame preset's polished ones.
    // This was the grip preset, and the grip has been drawn into the hand
    // sprite since; the values are close to what a fork slider wants anyway.
    //
    // The frame preset's rim runs at 0.5 over a power of 2.6, which draws a lit
    // edge down the whole length of anything cylindrical. On a stanchion that
    // is right - a stanchion IS polished - and on the slider, the lug and the
    // caliper below it that made the darkest parts of the bike the brightest
    // things in the frame: four pale blue tubes hanging under the bodywork.
    dark: {
      color: 0x0c0d12,
      ambient: 0x161a2c,
      key: 0x6f7590,
      keyStrength: 0.55,
      rim: 0x2de3ff,
      rimStrength: 0.22,
      rimPower: 3.6,
    },
    // The rim term draws an outline around every convex lobe it is given, and
    // at 0.42 it was most of what the old hand looked like: twenty-two lobes,
    // twenty-two purple outlines, a cluster of floating capsules. One closed
    // shell of large flat facets needs the opposite - a rim tight enough to
    // stay on the silhouette, and the key doing the work instead.
    glove: {
      // Lifted off near-black with the rim. The old hand got most of its
      // brightness FROM the rim - twenty-two lobes each with a lit edge - so
      // cutting the rim back left a silhouette with nothing inside it. What
      // replaced that brightness has to be the key and the base, or the hand is
      // a hole in the frame.
      color: 0x1c212f,
      ambient: 0x232a45,
      key: 0x99a3c4,
      keyStrength: 1.25,
      rim: 0xa45cff,
      rimStrength: 0.26,
      rimPower: 4.0,
    },
    // Glass: the mirror faces and the windscreen. Transparent, because the
    // screen is the one part of the bike the rider is meant to see through and
    // at this framing it stands across the middle of the frame. Opaque, it was
    // a slab over the road - measured on target for size and completely wrong
    // to look at.
    mirror: {
      color: 0x0a0f1e,
      ambient: 0x121a30,
      key: 0xb9c6e8,
      keyStrength: 1.15,
      rim: 0x9a6cff,
      rimStrength: 0.9,
      rimPower: 1.5,
      opacity: 0.3,
    },
    // The inside of a vent. Unpainted, and much darker than the panel around
    // it - a recess that shades like its own bodywork is not a recess, it is a
    // decal. The rim is what actually makes the opening read at night: the
    // mouth of the pocket catches it at a grazing angle and draws its own edge.
    vent: {
      color: 0x0a0b10,
      ambient: 0x141a2c,
      key: 0x5c6480,
      keyStrength: 0.45,
      rim: 0x2de3ff,
      // Tight and weak, unlike every other rim on the bike. At 0.38 and a power
      // of 2.2 the rim reached right across the floor of the pocket and lit the
      // whole thing teal, which read as a window rather than a hole. Pulled in
      // to this it only catches the mouth, which is the part that should.
      rimStrength: 0.20,
      rimPower: 3.4,
    },
    // A tyre. Almost no rim light on purpose: the frame preset's rim draws an
    // outline round every convex shape it is given, and a wheel is one large
    // convex shape, so at the frame's 0.5 the tyre came out as a pale glowing
    // hoop. What a tyre actually does at night is stay dark and catch one thin
    // highlight along the crown, which is the key doing the work and the rim
    // doing almost none.
    rubber: {
      color: 0x08090d,
      ambient: 0x10131f,
      key: 0x5a6076,
      keyStrength: 0.42,
      rim: 0x2de3ff,
      rimStrength: 0.12,
      rimPower: 4.5,
    },
    neonLeft: 0x22f7ff, // matches the left edge line of the road
    neonRight: 0xff2bd0, // matches the right edge line
  },
};
