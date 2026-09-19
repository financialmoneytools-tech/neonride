/**
 * NEON RIDE - the celebration at the end of level ten.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as `config.celebration`.
 *
 * ================= WHAT IT IS =================
 *
 * The finish straight opens into a lit arena: the bike decelerates, a podium
 * rises under it, the camera lifts and pitches down, and fireworks, confetti
 * and a champagne spray go up over a silhouetted crowd waving flags.
 *
 * ON THE ROAD, NOT A SEPARATE SCENE. The sky, the fog and the road stay
 * exactly as they were, so it is ONE CONTINUOUS RECORDABLE SHOT with no cut
 * and no second set of lighting to keep in agreement with the first. A rider
 * crosses the line and the world becomes an arena around them.
 *
 * ================= BRAND SAFE BY CONSTRUCTION =================
 *
 * This ships on app stores and in ads. No logos, no real likenesses, no
 * readable text on anything, the crowd is silhouettes and the champagne is an
 * unlabelled spray. None of that is a filter applied afterwards - there is no
 * geometry here that could carry a brand.
 *
 * ================= WHY EVERYTHING HERE IS BRIGHTER THAN THE ROAD ======
 *
 * CLAUDE.md's thread rule - every lit thing at or under 0.45, under the
 * bloom threshold - governs THE CARRIAGEWAY, where a rider spends ten
 * minutes at 220 km/h and a hazed frame becomes tiring. None of that applies
 * to a stationary seven second shot of a podium.
 *
 * It matters here in the other direction. There is no light in this scene:
 * every material is a MeshBasicMaterial with a flat colour, so a body
 * painted near black against a near black road is simply not drawn as far as
 * the eye is concerned - and the fireworks set the frame's reference
 * brightness far above anything the road ever does, which makes everything
 * else darker still by comparison. The podium, the bike and the crowd were
 * all invisible at road brightness, photographed twice, which is the same
 * fault world/ThemeGate.js and world/Roadside.js each fixed once already.
 *
 * ================= THE COMFORT EXCEPTION, STATED =================
 *
 * CLAUDE.md says every lit thing ON THE ROAD is a thread, at or under 0.45 so
 * it contributes nothing to bloom. That rule is about a ten minute ride at
 * 220 km/h and it does not govern a six second held shot at the end of one.
 * Fireworks that do not bloom are not fireworks.
 *
 * So the exception is scoped and written down rather than taken quietly:
 *   - it applies ONLY to `fireworks` and `champagne`, never to anything on
 *     the carriageway, and never outside the celebration
 *   - no full frame flashes, and no burst may cover more than `burst.maxArea`
 *     of the frame
 *   - burst rate stays outside 3-30 Hz, the photosensitivity band. This is an
 *     app store requirement as much as a comfort one.
 *   - the camera move goes through motionScale('celebration')
 */

// --- The celebration ---
export const celebration = {
  // ================= THE SEQUENCE =================
  //
  // Seconds, on the GAME clock like everything else with a duration here, so
  // a pause holds it and a slow frame costs what it took.
  //
  // The results card is NOT part of this. config/stage.js -> resultsDelay
  // already waits before a card lands on the one frame worth posting, and the
  // celebration simply needs to be longer than that wait.
  timing: {
    // Rolling to a stop. Not a hard brake: the bike has just crossed a line
    // at two hundred metres a second and stopping it in a second would throw
    // the camera forward hard enough to be the only thing in the shot.
    slowSeconds: 2.6,
    // How far past the line the podium stands, so the bike arrives at it
    // rather than stopping and then being teleported onto it.
    podiumAt: 260,
    // The lift and the pitch down, once stopped.
    craneSeconds: 2.2,
    // Fireworks begin before the bike has finished slowing - the sky should
    // already be going up as the rider arrives, not wait politely.
    fireworksAt: 0.8,
    confettiAt: 1.6,
    champagneAt: 3.2,
    // Total, after which the card may land.
    holdSeconds: 7.5,
  },

  // How hard the bike brakes once the last line is behind it, as a share of
  // its own brake force. Gentle: it has just crossed a line at two hundred
  // metres a second, and standing on the brakes throws the camera forward on
  // exactly the frame anybody would post. `timing.podiumAt` is where the
  // podium stands, and the two have to agree - too gentle and the bike is
  // still rolling when it arrives, too hard and it stops short of it.
  stopBrake: 0.55,

  // ================= THE CAMERA =================
  //
  // A NEW PROFILE, which CLAUDE.md requires be checked with reduced motion on
  // AND off. It raises the eye and pitches down, which changes how much of the
  // frame the ground fills and therefore how much optic flow there is - the
  // same reason the cinematic profile has to be checked.
  camera: {
    // Where it ends up, relative to the rider's eye at rest.
    // CLOSER AND LOWER than it was. At 3.4 up and 7.0 back a two metre bike
    // is a small dark object in the middle of a large empty podium; the shot
    // is of the machine, so the machine has to fill something.
    lift: 2.5,
    back: 5.2,
    // HOW THE SHOT IS FRAMED, as a raised aim point rather than a pitch.
    // Pitching after a lookAt fights the lookAt; raising what it aims at
    // lifts the podium in frame and leaves room for the fireworks above it.
    aimLift: 1.1,
    // A slow orbit around the podium. Small: this is the one moving thing in
    // a held shot and it goes through motionScale('celebration'), so on
    // reduced motion it very nearly stops.
    orbit: 0.16, // radians a second
    orbitAmount: 0.5, // radians total, either side of centre
  },

  // ================= THE ARENA =================
  podium: {
    // Three tiers, but only the centre one is ever occupied - the other two
    // are what make it read as a podium rather than as a box.
    tiers: [
      { width: 3.0, height: 0.55, depth: 3.0, x: -3.4 }, // second
      { width: 3.0, height: 0.95, depth: 3.0, x: 0 },    // first
      { width: 3.0, height: 0.35, depth: 3.0, x: 3.4 },  // third
    ],
    // NOT NEAR BLACK. Everything here is MeshBasicMaterial with flat colour -
    // there is no light in this scene - so a body painted 0x10131f against a
    // near black road is invisible, and the lit trim on top of it reads as
    // glowing rectangles lying in mid air with nothing under them. That is
    // the IDENTICAL fault world/ThemeGate.js documents for its legs and
    // world/Roadside.js for its pylons, photographed and fixed twice before,
    // and walked into again here. Dark enough to be structure, light enough
    // to have a silhouette.
    color: 0x39425c,
    // A lit edge along the top of each tier. A thread, like everything else
    // that is lit here and not a firework.
    trim: { height: 0.06, inset: 0.04, color: 0x2de3ff, intensity: 0.7 },
    // The floor the whole thing stands on, so the arena has a ground rather
    // than the podium floating on the road surface.
    floor: { radius: 26, color: 0x151b28, glow: 0x24557e, glowIntensity: 0.4 },
  },

  // ================= THE BIKE ON IT =================
  //
  // A NEON SILHOUETTE, and the reason is in CLAUDE.md's backlog: there is no
  // bike model in this project. The cockpit is one drawn sprite and a real
  // third-person bike needs a frame, a seat, an exhaust, a rear wheel and a
  // rider body - which is a separate piece of work, not a prop for one shot.
  //
  // A silhouette is also the read that always works at this scale, and it
  // matches the crowd behind it. Built for ONE camera angle and never
  // animated, so it only has to hold up from behind and above.
  bike: {
    length: 2.1,
    height: 1.15,
    width: 0.62,
    wheelRadius: 0.34,
    // Same rule as the podium: a silhouette still has to be lighter than what
    // it is a silhouette against.
    // LIGHTER THAN THE PODIUM IT STANDS ON. It was 0x2e364c against a
    // podium of 0x39425c - the hero of the shot painted darker than its own
    // plinth, so it sank into it. A silhouette needs something to be a
    // silhouette against, and here that is the podium, not the sky.
    color: 0x4a5673,
    // The lit edge is what makes a dark shape read as an object rather than a
    // hole. Takes the chosen bike's own paint, so the machine on the podium is
    // the machine that was ridden.
    rimIntensity: 0.95,
    // Thickness of the lit edges. 0.035 was a road value and at seven metres
    // it is two pixels - the rim light that is supposed to make the machine
    // read did not exist on screen. This is a prop three metres from a
    // camera, not a line on a carriageway.
    rimWidth: 0.09,
    rider: { height: 1.15, shoulders: 0.52, color: 0x39435e },
  },

  // ================= THE CROWD =================
  //
  // One InstancedMesh of silhouettes and one of flags. Never individuals: a
  // crowd is a texture, and anything detailed enough to be a person is
  // detailed enough to be a likeness.
  crowd: {
    count: 240,
    rows: 5,
    radius: 21,
    spread: 2.4, // radians of arc they occupy, centred behind the podium
    height: [1.5, 1.9],
    width: 0.46,
    // The crowd IS against the sky rather than the road, so it can be darker
    // than the podium - but not black, or it is a hole in the horizon.
    color: 0x222a3d,
    // A waving flag per few people, tilted and animated in the vertex shader
    // so the whole crowd is still one draw call.
    flags: { count: 120, width: 0.5, height: 0.34, stick: 0.5, sway: 0.5, rate: 1.4 },
    // Tiers behind them, so the crowd is standing on something.
    stand: { rows: 4, rise: 0.75, depth: 1.5, color: 0x1b2233 },
  },

  // ================= THE CHEQUERED FLAGS =================
  //
  // A pair, either side of the podium, on a procedural checker. The one thing
  // in the scene that says MOTOR RACING rather than CONCERT.
  flags: {
    width: 2.2,
    height: 1.4,
    poleHeight: 4.2,
    offset: 6.2, // either side of centre
    squares: 6,
    // Vertex animated, so a waving flag costs nothing per frame on the CPU.
    wave: { amplitude: 0.16, frequency: 2.4, speed: 2.0 },
    texture: 128,
  },

  // ================= THE PARTICLES =================
  //
  // All three are THREE.Points, one draw call each, built the way
  // world/Weather.js is: one buffer, allocated once, nothing spawned or
  // destroyed. They are gl.POINTS so they cost ZERO triangles - the whole
  // celebration's triangle budget is geometry, not sparks.
  //
  // The real cost of these is FILL, not geometry: three additive clouds over
  // a full frame. That is why every count is halved on the low preset and why
  // it is measured on the phone's own frame rather than a desktop capture.
  fireworks: {
    count: 1800,
    bursts: 7,
    // Seconds between bursts. Deliberately IRREGULAR and deliberately slow:
    // anything periodic between 3 and 30 Hz is the photosensitivity band, and
    // a burst every second and a half is two orders of magnitude clear of it.
    interval: [1.1, 2.3],
    // Where they go up, IN THE ARENA'S FRAME. Local +z is away from the
    // camera, so every shell is beyond the podium and none can go off at the
    // lens - which is what the world-axis version did, and a shell two metres
    // from the camera is a white disc over the whole shot rather than a
    // firework. High enough to be sky rather than scenery.
    spread: { x: 34, y: [16, 30], z: [22, 78] },
    speed: [9, 18],
    gravity: -5.2,
    life: [1.4, 2.6],
    size: 2.4,
    // ABOVE the bloom threshold, on purpose, and only here. See the header.
    // Above the bloom threshold on purpose - see the header - but not by as
    // much as it was. At 1.7 a burst behind the podium washed the podium out
    // with it; the point is a sky that glows, not a frame that does.
    intensity: 1.25,
    // No single burst may cover more than this share of the frame. Enforced
    // by the burst radius rather than trusted; tools/celebration-check.mjs
    // measures what actually lands on screen.
    maxArea: 0.22,
    colors: [0xff3d8b, 0x2de3ff, 0xffd166, 0x9d7bff, 0x39ff88],
  },

  confetti: {
    count: 2000,
    // A slab above the podium that it falls out of, and wraps back into -
    // the same trick Weather uses, so nothing is ever created.
    box: { x: 26, y: 16, z: 26 },
    fall: [1.1, 2.6],
    drift: 0.7,
    spin: 2.2,
    size: 1.7,
    // A thread, not a firework: confetti is IN FRONT of everything for the
    // whole shot, and at a firework's brightness it would be a wall of light
    // between the camera and the scene it is celebrating.
    intensity: 0.40,
    // Metres. Anything nearer fades out: a point sprite is sized as 1/depth,
    // so a piece a metre from the lens is drawn metres wide, and the camera
    // cranes INTO the box these fall through. Without it the shot is a wall
    // of paper with the podium somewhere behind it.
    nearFade: 6,
    // And a hard ceiling in pixels, so no single piece can fill the frame
    // however the camera ends up placed.
    maxSize: 46,
    colors: [0xff3d8b, 0x2de3ff, 0xffd166, 0xffffff, 0x39ff88],
  },

  champagne: {
    count: 420,
    // From the rider, forward and up.
    origin: { y: 1.7, z: -0.4 },
    speed: [6, 13],
    // Wide, so it disperses into a spray instead of staying a column.
    cone: 0.6, // radians
    gravity: -7.5,
    life: [0.8, 1.7],

    // ================= WHY THESE ARE SO SMALL AND SO DIM =================
    //
    // ADDITIVE PARTICLES STACK. Six hundred sprites at 0.95, overlapping in
    // a tight cone two metres above the podium and seven metres from the
    // camera, do not read as a spray - they sum past white and render as a
    // hard edged disc of light sitting exactly where the bike is. It was
    // photographed three times and blamed on the fireworks twice before the
    // arithmetic was done: any additive cloud dense enough to be a liquid is
    // dense enough to saturate, so the per particle value has to be small
    // enough that only the DENSEST part of it reaches white.
    //
    // 0.22 and a size under one are what make it a mist with a bright core
    // rather than a core with nothing around it.
    size: 0.85,
    intensity: 0.22,
    color: 0xfff1c9,
  },

  // ================= THE RECORDING HOOK =================
  //
  // God mode never enters `running`, so it can never reach level ten, and the
  // best shot in the game would be unrecordable without a way in. `?finish=1`
  // starts a REAL staged run at the last level with the line a few hundred
  // metres ahead - the real gate, the real flash, the real finish - and fills
  // in plausible results for the levels that were not ridden.
  //
  // IT WRITES NOTHING. A dev run hands game/Levels.js a null Progress, so
  // there is no branch that could unlock a level or record a best time; the
  // guard is structural rather than remembered. See main.js.
  dev: {
    // How far before the line `?finish=1` drops the rider.
    finishRunway: 240,
    // Plausible per-level times for the nine levels it did not ride, so the
    // card has a real total and a real tally. Close to the measured
    // references, varied enough not to look generated.
    sampleTimes: [25.4, 23.8, 25.1, 24.9, 24.6, 23.9, 26.4, 25.2, 24.3],
  },
};
