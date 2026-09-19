/**
 * NEON RIDE - traffic.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * Every vehicle is an instance of the same four meshes - body, light strips,
 * tail lights, ground glow - so the whole system is four draw calls no matter
 * how many vehicles are in it. Raising `count` costs triangles and a handful of
 * matrix writes per frame, and nothing else.
 */

// --- Traffic ---
export const traffic = {
  enabled: true,
  seed: 90210,

  // ================= THE ONLY TWO KEYS A THEME MAY SET =================
  //
  // Every road in this game runs the SAME traffic model. The density curve, the
  // guaranteed escape lane, the rule that no stretch may become a wall and the
  // speed aware spacing are shared and are not re-invented per theme - they are
  // what make the road playable, they were measured to get there, and a theme
  // that quietly re-tunes one of them is a theme that ships an unplayable road
  // nobody profiled. tools/theme-check.mjs fails any theme that touches
  // anything under `world.traffic` other than these two.
  //
  // `mix` - what is on this road, by type name, 0..1. A multiplier on how many
  // of that fleet are live, so a highway can run more trucks than a city does.
  // It can only THIN: the pools are allocated once, at the union of every
  // theme's needs, so a value above 1 is clamped. That is what keeps the rule
  // that a theme never allocates true for traffic as well.
  mix: null,
  // `look` - per type colour overrides, by type name. Paint and light only; a
  // theme may change what a van looks like and never how a van behaves.
  look: null,

  // Where a recycled vehicle reappears, measured from the player. `ahead` sits
  // inside the fog so they resolve out of it rather than popping in, and it has
  // to stay under the road's own neon fade end or a vehicle can appear on a
  // stretch of road that is still dark.
  spawnAhead: 900,
  spawnJitter: 260,
  recycleBehind: 140, // how far past the player before it is sent forward again

  // How close to the player a vehicle may be brought back out of the pool. The
  // density ramp turns vehicles on where they were left, and one switched on
  // where the player is standing appears inside them - nothing downstream can
  // catch that, because the recording guard has already run and skipped it as
  // inactive. Comfortably longer than any vehicle.
  spawnClear: 30,
  minGap: 26, // along the road, between two vehicles sharing a lane

  // LANE CENTRES ARE NOT LISTED HERE ANY MORE. They come from
  // world/road/layout.js, derived from the carriageway in config/world.js, so
  // the paint and the traffic cannot disagree. With four 3.6 m lanes that is
  // -5.4, -1.8, 1.8 and 5.4, and the player reaches 6.4, so every lane is
  // reachable and the outer ones sit under the edge lines.

  // How loosely traffic keeps to the lane its speed suggests. 0 sorts the road
  // perfectly by speed, which reads as a simulation; this is in lanes of slop,
  // so a van in the outside lane is uncommon rather than impossible.
  laneDiscipline: 1.15,

  // Speed is per type now; see the table below. It stays a fraction of the
  // PLAYER's maximum, so raising the bike's top speed keeps the overtaking rate
  // roughly where it is.

  // Real automotive paint, dark enough for a night world but far enough apart
  // to tell two vehicles apart. Picked per vehicle on respawn through
  // instanceColor, so variety inside a type is free.
  bodyPalette: [
    0x1b2f5e, // deep blue
    0x5e1b24, // deep red
    0x3a3f4a, // graphite
    0x6b6f78, // silver
    0x1e3c32, // dark green
    0x4a3a1e, // bronze
    0x7a7f88, // light silver
  ],

  // Vehicle types. Each is its own pool and its own set of instanced meshes, so
  // `count` IS the spawn weight.
  //
  // Silhouette has to carry the difference on its own: at 100 units a vehicle
  // is a few dozen pixels, so height and width read and nothing else does. The
  // first version failed because van, SUV and ambulance were all "tall box"
  // within 0.4 units of each other. These are deliberately pushed apart.
  types: [
    {
      name: 'sedan',
      count: 22,
      // Low and wide. The lowest thing on the road by a clear margin.
      size: { length: 4.7, width: 2.1, height: 0.82 },
      cabin: { length: 2.2, width: 1.7, height: 0.52, offset: 0.1, taper: 0.76 },
      speed: { min: 0.4, max: 0.78 },
      stripColor: 0x2de3ff,
    },
    {
      name: 'van',
      count: 10,
      // Tall slab with a flat rear: the cabin is barely a lip, so the profile
      // is one unbroken box.
      size: { length: 5.2, width: 2.15, height: 2.55 },
      cabin: { length: 1.5, width: 2.0, height: 0.12, offset: -1.6, taper: 0.96 },
      speed: { min: 0.3, max: 0.52 },
      stripColor: 0xff8a1f,
    },
    {
      name: 'ambulance',
      count: 5,
      // Box body over a lower cab. That step in the roofline is the shape that
      // says ambulance, and it is legible long before any light is.
      size: { length: 5.9, width: 2.25, height: 1.55 },
      cabin: { length: 1.7, width: 2.05, height: 0.5, offset: -2.0, taper: 0.86 },
      rearBox: { length: 3.6, width: 2.2, height: 1.35, offset: 1.0 },
      bodyColor: 0xc8ccd4, // white, the one type that does not take the palette
      speed: { min: 0.5, max: 0.66 },
      stripColor: 0xff2a3c,
      beacon: {
        // Left lamp is red and right is blue, baked as vertex colours. The
        // instance colour then alternates between red and blue, which lights
        // one lamp and extinguishes the other: proper alternating flash out of
        // a single colour write, no extra geometry and no extra draw call.
        colorA: 0xff2a3c,
        colorB: 0x3a6bff,
        size: [0.5, 0.2, 0.5],
        spacing: 0.66,
        z: -1.9,
        rate: 2.6, // alternations a second
      },
    },
    {
      name: 'jeep',
      count: 14,
      // Raised, NARROW and boxy - the tall-and-thin one. Its ride height lifts
      // the whole body clear of the road, which is visible as a gap underneath.
      size: { length: 4.3, width: 1.78, height: 1.72 },
      cabin: { length: 2.5, width: 1.7, height: 0.78, offset: 0.0, taper: 0.97 },
      rideHeight: 0.38,
      speed: { min: 0.36, max: 0.7 },
      stripColor: 0x39ff88,
    },
    {
      name: 'boxTruck',
      count: 8,
      // A tall cargo box on a low chassis. The step from cab roof to box is the
      // shape, the same trick the ambulance uses, and it is legible at a
      // hundred units where no amount of detail would be.
      size: { length: 8.6, width: 2.5, height: 2.45 },
      cabin: { length: 2.3, width: 2.35, height: 0.42, offset: -3.0, taper: 0.92 },
      rearBox: { length: 6.0, width: 2.5, height: 1.5, offset: 1.1 },
      // Slow, and that is the point of a truck: it is the thing worth
      // overtaking. It also belongs on the right, which the lane pick in
      // world/Traffic.js works out from this on its own.
      speed: { min: 0.26, max: 0.44 },
      // NOT IN THE OUTSIDE LANE. Lane 0 is the fastest one, and a 2.5 m truck
      // there can pair with another across the road to leave no legal line at
      // all. Keeping the widest vehicles out of it guarantees the guard always
      // has somewhere to go, and it is what the law says anyway.
      minLane: 1,
      rideHeight: 0.52, // lifts the body so the wheels are visible under it
      // The rear frame and halo step WAY back. Both are sized for a car: on a
      // 2.5 by 2.45 truck the halo is 3.75 metres of additive amber laid over
      // exactly the face that carries the doors, the plate and the tail
      // lights, and at 0.4 it was still the only thing anyone could see. A
      // truck does not need them to be visible at distance - it has marker
      // lights and the largest silhouette on the road.
      outlineGain: 0, // see VehicleMesh: it framed the chassis, not the box
      rearGlow: 0.12,
      stripColor: 0xffb42a, // amber, as a truck's marker lights are
      markers: {
        count: 5, spacing: 0.52, size: [0.16, 0.12, 0.16],
        // Down both flanks as well. A rider on a four lane road spends the pass
        // ALONGSIDE a truck rather than behind it, so the side row is what
        // makes one read as a truck most of the time.
        // DROPPED WELL CLEAR OF THE TOP ROW. At 0.2 the side row sat just
        // under the roof line, and from beside the truck the two merged into
        // one broken dashed line that looked like a fault rather than like
        // marker lights.
        side: { count: 5, size: [0.06, 0.11, 0.3], out: 0.02, drop: 0.62, margin: 0.5 },
      },
      // THE HARDWARE, built by world/traffic/truckParts.js. All of it lands in
      // the body geometry painted dark with vertex colours, so a truck still
      // costs the same four draw calls every other type costs.
      truck: {
        wheels: {
          radius: 0.52, width: 0.34, sides: 8,
          inset: 0.16, // in from the flank, so they sit under the body
          color: 0x0a0a0d,
          axles: [-2.6, 2.1, 3.1],
        },
        bumper: { widthScale: 0.92, height: 0.16, depth: 0.16, y: 0.46, color: 0x14141a },
        mudFlaps: { width: 0.46, height: 0.5, gap: 0.22, color: 0x0d0d11 },
        doors: {
          seam: 0.06, // the split down the middle, and the hinge bars
          depth: 0.04, // proud of the face, not cut into it
          reach: 0.86, // share of the face height the split runs down
          hinges: 3,
          hingeInset: 0.16,
          hingeWidth: 0.3,
          color: 0x101016,
        },
        // Lit, and pale - the one genuinely white thing on the back of a lorry
        // at night, and most of what says "lorry" from behind.
        plate: { width: 0.62, height: 0.2, x: 0.0, y: -0.55, color: 0xdfe6ee },
      },
    },
    {
      name: 'semi',
      count: 6,
      // SIXTEEN METRES. Long enough that the autopilot had to learn to measure
      // gaps from a vehicle's near end rather than its centre - see
      // player/Autopilot.js - because eight metres of trailer was still in the
      // lane the planner had already called clear.
      size: { length: 16.0, width: 2.55, height: 3.3 },
      cabin: { length: 2.6, width: 2.45, height: 0.62, offset: -6.4, taper: 0.9 },
      speed: { min: 0.3, max: 0.5 },
      minLane: 2, // a semi keeps to the two inside lanes
      rideHeight: 0.58,
      outlineGain: 0,
      rearGlow: 0.1,
      stripColor: 0xff6a1f,
      markers: {
        count: 7, spacing: 0.4, size: [0.16, 0.12, 0.16],
        side: { count: 8, size: [0.06, 0.11, 0.3], out: 0.02, drop: 0.7, margin: 0.6 },
      },
      // THE HARDWARE, built by world/traffic/truckParts.js. All of it lands in
      // the body geometry painted dark with vertex colours, so a truck still
      // costs the same four draw calls every other type costs.
      truck: {
        wheels: {
          radius: 0.56, width: 0.34, sides: 8,
          inset: 0.16, // in from the flank, so they sit under the body
          color: 0x0a0a0d,
          axles: [-6.2, 4.8, 6.0, 7.0],
        },
        bumper: { widthScale: 0.92, height: 0.16, depth: 0.16, y: 0.5, color: 0x14141a },
        mudFlaps: { width: 0.46, height: 0.56, gap: 0.22, color: 0x0d0d11 },
        doors: {
          seam: 0.06, // the split down the middle, and the hinge bars
          depth: 0.04, // proud of the face, not cut into it
          reach: 0.86, // share of the face height the split runs down
          hinges: 3,
          hingeInset: 0.16,
          hingeWidth: 0.3,
          color: 0x101016,
        },
        // Lit, and pale - the one genuinely white thing on the back of a lorry
        // at night, and most of what says "lorry" from behind.
        plate: { width: 0.62, height: 0.2, x: 0.0, y: -1.05, color: 0xdfe6ee },
      },
    },
    {
      name: 'motorcycle',
      count: 14,
      size: { length: 2.0, width: 0.5, height: 1.15 },
      cabin: { length: 0.7, width: 0.42, height: 0.42, offset: -0.25, taper: 0.7 },
      speed: { min: 0.55, max: 0.86 },
      stripColor: 0xff36c8,
      singleTail: true,
      weave: { amount: 0.85, period: 4.5 },
    },
  ],

  // Shape settings shared by every type.
  vehicle: {
    bodyColor: 0xffffff, // white base; instanceColor carries the real paint
    scaleJitter: 0.08,

    strip: { height: 0.15, inset: 0.02, y: -0.08, lengthScale: 0.86 },

    tail: {
      color: 0xff2a3c,
      width: 0.5,
      height: 0.19,
      spacing: 0.58,
      y: 0.06,
      bar: { width: 1.5, height: 0.2, y: -0.14 },
    },

    rear: {
      outline: { thickness: 0.14, inset: 0.05, depth: 0.05 },
      // Big and bright enough to survive distance, small enough that it does
      // not sit over the body and erase the silhouette - which is exactly what
      // 2.4 by 2.6 at opacity 1.6 did. This is also the largest single fill
      // cost in the traffic system, so it is the first thing to trim for frame
      // rate: it is additive, so every pixel it covers is read and written.
      glow: { widthScale: 1.5, heightScale: 1.55, offset: 0.3, opacity: 0.85 },
    },

    // Ground blob, dimmer than the rear halo. Its relative brightness is baked
    // into vertex colours, so both live in one geometry and one material.
    glow: {
      size: 5,
      y: 0.06,
      groundLevel: 0.18,
      nearFade: 14,
      textureSize: 128,
    },
  },

  // ================= CAR FOLLOWING =================
  //
  // WHY THIS EXISTS, measured before it was written. `_admits` is a PLACEMENT
  // filter: it runs once, when a vehicle respawns, and guarantees the escape
  // lane and the spacing AT THAT MOMENT. Nothing maintained either afterwards,
  // so two vehicles sharing a lane closed at their speed difference until they
  // were inside each other. In endless mode, on a build with no levels in it:
  // 2400 overlapping same-lane pairs over 721 frames, worst edge gap -10.7 m.
  // Cars drove through each other, and had since the traffic was written.
  //
  // It mattered far more than it looked. Because spacing decayed, ANY widening
  // of the speed spread multiplied how fast the road turned into a wall - so
  // `speedSpread`, which reads like a knob about how predictable the traffic
  // is, was really a knob about how quickly the guarantee stopped being true.
  // A level at a LOWER density than endless measured six times more crowded,
  // and levels five to nine left the rider with all four lanes blocked inside
  // their own reaction distance on up to a quarter of frames.
  //
  // So a follower now keeps its distance instead of merely starting with it.
  // It is the shared model, not a per level rule: an invariant that only holds
  // in one mode is not an invariant. SONSUZ gets it too, which changes SONSUZ -
  // visibly for the better, and it is the one change to that mode here.
  follow: {
    // The gap the follower settles at, edge to edge. Below this it drops under
    // the leader's speed so a gap that has already closed REOPENS, rather than
    // merely stopping getting worse - without that, traffic that had already
    // bunched before this shipped would stay bunched forever.
    minEdge: 8,
    // How far under the leader it drops while recovering. Gentle: a vehicle
    // that brakes hard in front of the rider is an event the rider cannot
    // predict, which is the thing the spacing rule exists to prevent.
    easeBack: 0.92,
    // Above `minEdge` the follower eases back up to its own cruising speed,
    // reaching it at the model's own promised gap. That is what ties this to
    // the level: a level with a tighter gap lets traffic run closer, and the
    // closing behaviour follows the same number rather than a second one.
  },

  // TWO TRAFFIC MODELS, and they want opposite things.
  //
  // God mode is a camera. The road should look BUSY, and the guard standing
  // behind the autopilot makes any density survivable - it is a cheat and it
  // is meant to be one. A player has no guard: player/autopilot/Guard.js is
  // inert outside god mode, and nothing else in the system has ever
  // guaranteed a passable gap. So the road that produces good footage is a
  // road a human crashes on constantly, which is exactly what it turned out
  // to be.
  //
  // Chosen at SPAWN TIME from config.autopilot.enabled, so ?god=1 and the
  // G-O-D sequence both keep the dense road and everyone else gets the
  // playable one. Spawn time rather than construction because god mode can be
  // armed mid-run, and the road should fill in behind that rather than need a
  // reload.
  models: {
    god: {
      // Exactly what the road has always been. Footage is tuned against this
      // and the measured autopilot figures refer to it.
      density: { start: 0.72, fullAt: 9000, curve: 1.2, max: 1 },
      gap: { base: 26, reaction: 0 },
      speedSpread: 1,
      weaveScale: 1,
      escape: { enabled: false },
    },

    player: {
      // Sparse at the start, rising slowly, capped well below full. At 16 per
      // cent of a 79 vehicle pool that is about 13 vehicles spread over the
      // kilometre of road ahead - roughly one per lane every 300 units, which
      // at a 100 unit per second closing speed is one every three seconds.
      // The cap matters more than the ramp: a curve that keeps climbing
      // eventually reaches the density that was unplayable to begin with.
      density: { start: 0.16, fullAt: 16000, curve: 0.85, max: 0.5 },

      // SPEED AWARE SPACING. The gap between two vehicles in a lane is
      // base + reaction * the player's current speed, so at a standstill it is
      // 30 units and at 235 it is 159 - about two thirds of a second of
      // reaction time either way, instead of the fixed 26 that gave a tenth of
      // a second at speed.
      gap: { base: 30, reaction: 0.55 },

      // Traffic that can be READ. Each type's speed range is squeezed toward
      // its own midpoint, so a sedan is reliably a bit quicker than a van
      // rather than sometimes slower than a truck - closing speeds a player
      // cannot predict are closing speeds they cannot plan around.
      speedSpread: 0.55,
      // And a motorcycle wanders less, for the same reason.
      weaveScale: 0.4,

      // THE GUARANTEE. No stretch of road may have more than two lanes
      // occupied, so there are always at least two free lanes to aim at - and
      // never three abreast, and never two trucks side by side. Enforced when
      // a vehicle is placed, by refusing the placement and trying elsewhere.
      escape: {
        enabled: true,
        window: 58, // metres of road counted as "level with each other"
        maxAbreast: 2, // occupied lanes allowed in one stretch, of four
        trucksAbreast: 1, // and only ever one truck among them
        attempts: 10, // lanes and pushes tried before giving up
        push: 80, // how much further along to try on each attempt
      },
    },
  },

  // Traffic thins out at the start of a run and builds as it goes, so the
  // opening is clean and the road gets busier the further you get.
  //   fraction = start + (1 - start) * (distance / fullAt) ^ curve
  // An inactive vehicle is scaled to nothing and skipped entirely; it costs no
  // fragments and cannot be collided with.
  //
  // The pools above are large and the road is meant to look busy from early on,
  // so this starts high and fills quickly. Raising the counts costs triangles
  // and nothing else: every type is a handful of InstancedMeshes whatever its
  // count, so the draw call total does not move at all.
  density: {
    start: 0.72, // share of each pool live at distance 0
    fullAt: 9000, // units travelled before every pool is full
    curve: 1.2, // above 1 holds it sparse for longer, then ramps
  },

  // What happens when the player hits one.
  //   'arcade' - speed loss and a screen flash
  //   'off'    - pass straight through, which is what recording wants
  collision: {
    mode: 'arcade',
    // A MOTORCYCLE IS ONE METRE WIDE, mirrors included; 0.62 made it 1.24 and
    // that quarter metre decided whether a legal line existed between two
    // trucks in adjacent lanes. Measured against the guard with
    // tools/god-run.mjs, not guessed.
    playerHalfWidth: 0.5,
    playerHalfLength: 1.2,
    speedLoss: 0.45, // speed is multiplied by this on contact

    // Sideways shove away from whatever was hit. Without it the player can end
    // up travelling at the same speed as a vehicle while occupying the same
    // space, which is both unescapable and invisible - the body surrounds the
    // camera and every face of it is pointing away.
    knockLateral: 2.0,

    // THE FLASH MOVED to config/flash.js, under `sources.collision`, with the
    // colour, strength, edge, duration and refractory unchanged. It is not a
    // property of traffic: whether a hit may light the frame depends on whether
    // the run is still going and whether the rider is inside the grace window,
    // and traffic knows neither. It went on flashing after the run had ended
    // for exactly that reason - see the header of config/flash.js.
  },

  // Passing close without touching. This is the moment worth recording, so it
  // gets its own response: a brief widening of the chromatic aberration and a
  // cool flash, both far softer than a collision.
  // Near misses happen CONSTANTLY on a four lane road - the player passes
  // several vehicles a second and the inner lanes sit barely a metre off the
  // shoulder, so a generous range keeps the effect permanently lit and washes
  // the frame. Two things keep it an event rather than a state: a tight range,
  // and a cooldown.
  //
  // The response is also pushed out to the edges of the frame rather than
  // tinting the whole image. A full screen tint at this rate reads as a colour
  // grade fault; an edge pulse reads as something rushing past.
  nearMiss: {
    // Must be SMALLER than the gap the player gets by sitting in the middle of
    // the road while a vehicle passes in an inner lane, or every overtake fires
    // and the effect becomes a permanent tint. With lanes at 2.5 and a combined
    // half width of about 1.6 that gap is 0.9, so this has to stay under it: a
    // near miss should mean the player chose to squeeze past, not that a car
    // went by.
    // 0.6 was solved against lanes 2.5 apart. On the four lane carriageway the
    // lanes are 3.8 apart but the bike rides BETWEEN them as often as in them,
    // and from the middle of a pair the edge to edge gap to either is only
    // 0.35 - so every overtake fired and the rate went from 28 a minute to
    // 161, which is a permanent tint rather than an event.
    range: 0.28, // lateral gap, edge to edge, that counts
    cooldown: 1.5, // seconds before another can fire
    // The look of it - colour, strength, edge, duration and the aberration
    // boost - is in config/flash.js under `sources.nearMiss`, unchanged. What
    // stays here is what makes a near miss a near miss: the range and the rate.
  },
};
