# Neon Ride - status

Handover note, 17 September 2026. Read this, then `CLAUDE.md`, `README.md`,
`BUILD-PLAN.md` and `ASSETS.md`; `docs/THEMES.md` for the road themes plan. Git
history carries the detail; this carries the state.

Stack: Vite, vanilla JS, three@0.186.0. Local path `C:\Projelerim\neon-ride`
(deliberately outside OneDrive). Two goals, equal weight: a playable game, and a
footage generator for YouTube / Instagram. Anything that hurts a recording is a
bug even if gameplay is fine.

## Built and working

- **Sky** - starfield, nebulae, aurora.
- **Road** - a four lane motorway, endless, CatmullRomCurve3 chunks from a
  recycling pool. Zero new geometry inside the loop. Painted lane markings, a
  median barrier, an oncoming carriageway beyond it, neon edge lines cyan on the
  median side and magenta on the shoulder. See the cross section below.
- **Post** - UnrealBloomPass, vignette, chromatic aberration.
- **Traffic** - InstancedMesh, seven vehicle types including a box truck and a
  16 m semi, lane-aware: a vehicle's speed suggests its lane and the widest
  types are barred from the outside lanes.
- **Scenery and weather** - `world/Scenery.js` pools instanced props with the
  road chunks; `world/Weather.js` is one wrapping line buffer that does snow,
  rain and dust. Both are theme-driven and neither allocates per theme.
- **God mode** - AI rider slaloms through traffic. Measured with
  `tools/god-run.mjs` on the four lane road, 17 September 2026:

  | | Galaxy Road | Aurora Pass |
  |---|---|---|
  | run | 150 s, 9000 frames, 28.2 km | 55 s, 3295 frames, 14.3 km |
  | overlaps | **0** | **0** |
  | tightest pass | 0.050 u (ambulance) | 0.050 u (semi) |
  | near misses | 21.6 a minute | 30.6 a minute |
  | trapped frames | 0 | 0 |
  | worst guard correction | 0.33 u | 0.14 u |

  Every tightest pass lands exactly on the guard's 0.05 floor, which is the
  guard doing its job. If no safe gap exists it slows and waits instead of
  phasing through; it is inert outside god mode.
- **Audio** - Web Audio, fully synthesised: engine formant bank with
  progressive gearing (short low gears, long top gears), wind, traffic pass-bys.
  Confirmed good against the ride.
- **Start screen** - title and start prompt only; it is the audio unlock
  gesture. Skippable in god mode so it never lands in footage.
- **Stats overlay** - `H`. Measured 17 September 2026:

  | | draw calls | triangles | FPS |
  |---|---|---|---|
  | Galaxy Road, desktop (RTX 5060 laptop) 1280x720 | 69 | 41k | 60, vsync capped |
  | Aurora Pass, same | 83 | 88k | 60, vsync capped |
  | **Aurora Pass, Android Chrome, player driving** | **78** | **58k** | **60.1, refresh capped** |

  The phone reading is the one that matters and it is comfortable. Budget for a
  theme on that phone: at least 45 FPS, under 120 draw calls, under 250k
  triangles - so there is a great deal of headroom left, and the Aurora Pass
  rework spent some of it deliberately.

  **A SCREENSHOT'S FPS COUNTER IS ONLY REAL IF THE TOOL ASKED FOR A GPU.** An
  early Aurora Pass screenshot read 7.5 FPS and that number was software
  rendering, not a cost: headless Chromium falls back to SwiftShader unless it
  is launched with `--use-angle=default --enable-gpu`. Both `tools/shot.mjs`
  and `tools/god-run.mjs` pass those flags now, and god-run prints the renderer
  it actually got alongside the frame rate.
- **Cockpit sprite** - `public/sprites/cockpit.png`, drawn by
  `src/player/Cockpit.js`. Art and placement are both right now: sized from the
  frame HEIGHT, so it is identical at every landscape aspect. Asserted by
  `tools/measure-cockpit.mjs` at 16:9, 2:1 and 21:9.
- **Gameplay loop** - `src/game/Session.js`: score, distance, fail on collision,
  pause. HUD shows score and distance. God mode bypasses it.
- **Mobile controls** - two modes, switchable in the pause card and stored in
  localStorage. TILT (default on phones) steers from DeviceOrientation with the
  holding angle as neutral; TOUCH steers by dragging the left thumb. See below.
- **Landscape gate** - `core/Orientation.js` shows a rotate prompt in portrait
  and pauses a running session; orientation lock and fullscreen are requested on
  first touch and allowed to fail.

## The cockpit lesson - do not repeat this

The most expensive part of the project was trying to build the rider's hands
and bars as 3D geometry. It was attempted repeatedly: the WRAD rigged arms pack
(an FPS rifle rig, never closed on a bar), a lofted single-mass fist, a hand
drawn procedurally on a canvas, primitive grips and levers around a 2D hand.
Every one failed on the same thing: **the join between a hand and a bar.** A
hand that does not visibly close on the grip reads as fake instantly, and
closing fingers on a 26 mm tube needs per-finger IK and topology none of these
had.

What works: **one 2D drawing that contains the whole cockpit** - bars, levers,
switch blocks, arms, dash, screen, mirrors, tank. There is no join because
nothing 3D touches the drawing. Rules that came out of it:

1. Do not build 3D parts that must meet 2D art. If it touches the hand, it is
   in the picture.
2. One arm drawn, mirrored for the other. Two separately generated arms never
   match. A mirrored right arm is a correct left arm, hardware included.
3. Sources live in `art/`, never shipped. `tools/cut-cockpit.py` and
   `tools/key-sprite.py` key them; source and output paths are always separate.
4. Placement is measured by tools, not eyeballed and not trusted to comments.
5. Nim prompting: composition first, labelled CRITICAL; state prohibitions
   ("never show X") as explicitly as requirements.

The primitive cockpit in `player/Rider.js` still exists behind
`config.player.cockpit.source`. It is a fallback, not a direction.

## Landscape only

Portrait / 9:16 was dropped. The game is landscape and shows an orientation
prompt in portrait. Deleted for it: the portrait cockpit source, the selector
that chose a source by frame shape, and the second (tall) framing profile.

## Outstanding, in order

1. **Mobile landscape** - the portrait prompt, the orientation lock and
   fullscreen-on-first-touch are done. What is left: quality presets checked on
   a real mid-range phone, and the touch band tried with actual thumbs.
   The Aurora Pass phone reading is done - 60.1 FPS, see above - so the floor is
   no longer in doubt for that theme. Galaxy Road has not been read on the phone
   since the highway landed, though it is the cheaper of the two.
2. **Cockpit art is not wide enough.** See open issues - this is now the thing
   holding the framing back.
3. **Production build** - Vite build, deploy to Vercel.
4. **Road themes** - step 2 of 3 done. `docs/THEMES.md` is the plan. Built: the
   four lane highway, trucks, the theme system, GALAXY ROAD and AURORA PASS.
   Left for step 3: Sunset Highway, Neon Metropolis (with the wet road), Nebula
   Coast, Red Planet, and the transitions through a light gate.
5. **Bike library** - naked and concept bikes, each a cockpit sprite.

## Open issues

- **Dash screen** - `cut-cockpit.py` reports `CONFIG_DISAGREES` if the punched
  hole and `screen` in `config/cockpit.js` drift. Re-run after any art change.
- **Four files are over the 300 line limit.** `src/main.js` 514 (it was 497
  before any of this and has been over for a while), `world/Traffic.js` 338,
  `core/Input.js` 323, `world/traffic/VehicleMesh.js` 316 and
  `config/world.js` 312 - which was split once already, into `config/road.js`,
  and has crept back with the scenery and weather blocks. Named here rather
  than quietly left: main.js wants a bootstrap split, Traffic wants its respawn
  logic in `world/traffic/spawn.js`, VehicleMesh wants its builders in a parts
  file, and `config/world.js` wants `config/scenery.js` taking the props and
  the weather out of it.
- **Near miss rate swings between runs.** Measured at 7.8 and 26.3 a minute over
  two god runs of the same length on the same seed. The autopilot is
  deterministic in its inputs but not in its timing, and a single lane choice
  early on changes how the rest of the run threads. Worth a longer sample before
  anyone tunes `nearMiss.range` again.
- **Sway lifts the cut bottom edge** at full lock. The plane sits 7.6 per cent
  of the frame below the bottom edge, down from 10.2 before the framing change,
  so there is less headroom than there was. Still headroom, but it is geometry
  rather than a fix: a big enough roll will always lift one end of a horizontal
  cut, and any further drop of the cockpit spends what is left.

### Closed since the last note

- ~~The right shoulder had no snow bank~~. Every bank was a symmetric bump
  centred ON an edge of the asphalt, multiplied by (1 - paved) to keep it off
  the road - and `paved` is 1 at the edge, so each bank was cancelled exactly
  where it was brightest. Only the outboard tail survived. The left side got
  away with it because the median beside it is unpaved; the right shoulder had
  three metres of verge to show in and read as a flat green plane lit by the
  edge line. The banks are one sided now, measured OUTWARD from each edge, on
  all four of them.
- ~~Trucks were plain boxes~~. They have wheels, a rear bumper, mud flaps, rear
  doors with a centre split and hinges, red tail lights, a lit number plate and
  amber marker lights along the top AND down both flanks - the side row being
  what makes one read as a truck from beside it, which on a four lane road is
  most of the time. All of it in the existing meshes via vertex colours, so a
  truck still costs the same four draw calls every other type costs. Two things
  had to move out of the way first: the rear outline and the rear halo are
  sized for a car, and at a truck's size in a truck's amber they were a glowing
  frame that swallowed everything inside it. Both are per-type gains now.

- ~~The aurora was invisible, and raising its intensity did nothing~~.
  `rayContrast` and `rayHeight` BOTH push the curtain DOWN, which is the
  opposite of what their names suggest. The shader sets each column's top to
  `curtainHeight + variation + rayHeight * (rays - 0.5)`, and `rays` is noise
  raised to the power of `rayContrast` - noise sits around 0.5, so a high
  contrast crushes it (0.5^3.8 = 0.07) and makes that last term a large
  NEGATIVE number. At 3.8 and 0.95 the tops landed at 13.9 degrees of elevation
  against mountains that reach 20.3: the whole curtain was behind the ridge
  line. Cranking the intensity to 20 changed nothing, because none of it was on
  screen, and that test is what proved it was placement rather than brightness.
  Also: `top` is where a ribbon ENDS, not where it stops being visible - the
  body fades across the whole height, so the visible extent lands well below
  the number, and solving for it on paper came out 7 degrees high.

- ~~Tilt steering did nothing on Android~~, and there were THREE faults behind
  it, each of which would have been enough on its own.

  1. **The wrong sensor.** `deviceorientation` is built on a fused rotation
     vector on Chrome for Android and on a great many handsets it never fires
     at all - no error, no prompt, just silence, which is indistinguishable
     from a sensor that is switched off. The primary source is now
     `devicemotion` and `accelerationIncludingGravity`, which needs only an
     accelerometer; any phone that can auto-rotate has one. The roll is
     computed from where gravity points. Orientation is kept as the fallback
     for devices where it is the one that works.
  2. **The permission gate.** The constructor only attached its listeners when
     `requestPermission` did NOT exist, and `request()` treated any answer
     other than 'granted' as final. Headless Chromium exposes
     `requestPermission` and answers something else - so did the phone, in all
     likelihood. The rule is now: always listen, ask if the API is there, and
     let DATA decide. A refusal is recorded and only becomes the explanation
     once two seconds have passed with nothing arriving.
  3. **The diagnostics did not exist.** `StatsOverlay` took a `controls`
     argument and its docstring described the block; `update()` never read it.
     The parameter was wired and the feature was not written, so the one thing
     that would have shown which of the above was happening showed nothing.

- ~~The pause card was unreachable on a landscape phone~~. Six stacked blocks
  on a viewport about 320 to 360 CSS pixels tall: measured, the lowest button
  sat at exactly 360 on a 360 tall screen and 10 to 20 pixels below the edge on
  anything shorter, with nothing to scroll because the page does not scroll. It
  lays out as two columns below 520px of height - what you read on the left,
  what you press on the right.

- ~~A flat black shape blocked the sky on Galaxy Road~~. It was
  `MountainSlab` - the ridge curtains are near black, and at 360 and 560 units
  out they sat across the lower third of the frame eating the starfield. A
  theme can switch them off now and Galaxy Road does: nothing opaque blocks the
  sky on a road in space.
- ~~The aurora was behind a mountain~~. Literally: a probe put the near ridge's
  bounding sphere 357 units from the camera and the aurora cylinder's at 390,
  so the curtain was drawing behind a wall - and what was left of it cleared
  the ridge line by about six degrees, at the very top of the frame. That is
  why the sky read as a green wash with no ribbons in it. Aurora Pass now puts
  its ridges at 700 and 1000, where fog makes them silhouettes rather than
  walls, and the curtain's tops land at 30 degrees against a frame edge at
  31.8 - which is also what brings the PURPLE into shot, since the colour ramps
  from green at a ribbon's foot to purple at its top.
- ~~Snow drew as white blocks~~. The flakes are points whose falloff is
  measured in a frame aligned with their own screen space velocity, so they are
  circles at rest and short dashes at speed. The first attempt stretched the
  along axis and left the across axis alone - but gl_PointSize is a SQUARE, so
  asking for a longer streak asks for a bigger sprite in both directions, and
  the flake got fatter as fast as it got longer. The across axis is multiplied
  by the stretch instead.
- ~~Roadside pylons floated~~. A 0.26 square neon bar hanging beside a post so
  dark it was invisible. The post is a real pole on a plinth now and the neon is
  a thin strip up its face; both are still one geometry, so it is the same two
  draw calls for every pylon in the world.
- ~~Lamp heads were unlit white slabs~~. Light is not a surface. Each lamp kind
  carries a second additive mesh - a pool of lit road under the head and a halo
  at it - placed by the same instance matrix.

- ~~The mirror figures were measured against a detached cockpit~~. The tool
  computed them by calling its `at()` projector AFTER `cockpit.dispose()`, and
  dispose takes the group off the camera - three's `localToWorld` re-derives the
  world matrix from the parent chain, so from that moment `at()` silently
  dropped the camera transform and answered a different question. Everything
  ever reported as "mirrors down 57.7-65.4%" was wrong; they are at 64.4-72.4%.
  Caught by the new two-fov comparison: the same point read 64.4% from the
  landmark list and 57.75% from the mirror block, two lines apart. Mirrors are
  now measured inside `measure()` while the cockpit is still attached.
- ~~The `[hidden]` trap, for good~~. `index.html` carries one global
  `[hidden] { display: none !important }`. It had already cost two bugs with
  the same shape - the clipped FREN label and the pause button in every frame -
  because any author `display` rule beats the user agent's `[hidden]`, and
  almost every element here is a flex box. `.panel` and `.controls-panel` were
  the next two waiting to be found. The per-component fixes and the
  attach/detach workaround in `ControlHints` are gone with it.

- ~~The pause button never hid~~. `.pause-button` sets `display: flex`, an
  author rule, which beats the browser's own `[hidden] { display: none }` - so
  `setVisible(false)` did nothing and the button sat in the middle of the top
  edge of every frame, including god-mode footage and every desktop window that
  has no use for it. The same trap as the stray FREN label, in a second file.
  Fixed with a `.pause-button[hidden]` rule in `index.html`.
- ~~The smoke test was testing the title screen~~. It tapped the centre of the
  frame, which is where the title card's reduced-motion toggle sits, and that
  toggle stops the pointerdown reaching the window listener on purpose so the
  setting can be changed without starting the run. So the card never dismissed,
  the run never began, and the test flipped reduced motion in storage on every
  pass. Everything under it still passed, because the world renders behind the
  card and the loop ticks behind it. Two bugs cancelling out: the one check that
  would have caught it - the pause button - was the vacuous one above. The tap
  moved to the top right, and a card still on screen is now a failure.

- ~~Empty bottom corners at wide aspects~~. ACCEPTED after play-testing, 16
  September 2026. Sizing the plane from the frame's height keeps the cockpit the
  same size at every landscape aspect, and the cost is that a 1.79:1 drawing
  stops short of the frame's sides: measured, the sleeves end 18.0 per cent from
  each edge at 16:9, 21.7 at 2:1 and 25.7 at 21:9 - wider than the 9.9 / 14.6 /
  19.5 this was accepted at, because the new framing makes the plane smaller.
  Re-checked on screen after the change and still kept. The sleeves run off the
  BOTTOM edge, which is where they read as continuing past the frame; they only
  clip the side edges in the last 4 per cent of the image (y 1473-1535 of 1536),
  so what is exposed at the corners is small and low. It plays and records
  fine, so it stays.

  A widening plan was written and cancelled: `pad-cockpit-source.py` padded the
  canvas to 2.8:1 for an external outpaint, and both are deleted. Recorded
  because the option is real if a future aspect makes the corners matter - the
  drawing would need about 2.62:1 to reach the sides at 21:9 at this cockpit
  size, and the padding tool is one command to write again. What does NOT work
  is widening the plane on its own; that stretches the art.

- ~~Cockpit too large in landscape~~. It was sized from the frame WIDTH, so
  every window wider than 16:9 grew it. Now sized from height. Note that this
  was never a regression in the sense of a fix coming undone - see below.
- ~~Possible double arms~~. Confirmed impossible: `createHands` is called only
  from `Rider.js`, and `new Rider` only on the `else` branch of
  `config.player.cockpit.source`. In sprite mode Rider is never constructed.
- ~~Hand contract predates the full cockpit~~. Reconciled - see the knob table.
- ~~Stale docs~~. `ASSETS.md` no longer carries the `glove-left` command and no
  longer describes `handInset` as a tall-profile correction.

## Why the cockpit size came back

It did not come back. It was never fixed.

The previous round ended with a measurement and a recommendation - drop the
plane with `offset[1]` - under an explicit instruction to measure before
changing anything. The measurement was taken, the candidate values were tested
and REVERTED, and nothing was committed. `scale` was 1.0 and `offset` was [0, 0]
in the repo the whole time. The `(VERIFY name)` in this file's own knob table
was the tell: the row could not be named because the knob had never been set.

Two things follow, and both are the actual lesson:

1. A recommendation in a reply is not a change in a repo. If it is not in the
   config it is not in the game.
2. The recommended value would have been wrong anyway. `offset[1] = -0.326` was
   solved at 16:9 against a plane sized from the frame's WIDTH, so it would have
   looked right on one window and drifted on every other one. The size had to
   stop depending on aspect first; only then does a single offset mean anything.

That is why the fix ships with `tools/measure-cockpit.mjs` and three aspects
rather than with a number.

## Config knobs that matter

| Knob | What it does |
|---|---|
| `config.player.cockpit.source` | sprite cockpit vs primitive fallback |
| `config/cockpit.js` -> `screen` | dash placement; must match the punched hole |
| `config/cockpit.js` -> `heightScale` | **0.7034** - the plane's height as a fraction of the FRAME's height. The size knob. Solved, not chosen: the windscreen and grip landmarks are 0.3483 of the sprite apart and have to span 86.5 - 62.0 = 24.5% of the frame, so 0.245 / 0.3483. |
| `config/cockpit.js` -> `offset` | **[0, -0.1521]** - half-frames [across, up]. Drops the bottom-anchored plane until the windscreen top lands at 62.0% down. |
| `config/framing.js` -> `pitch` | **-0.0994** rad - the ride camera's own downward tilt. The cockpit is parented to the camera, so this moves only the world: it is what opens the road band without moving the bike. |
| `config/cockpit.js` -> `sway` | roll and shift with lean and steer; goes through `motionScale('cockpitSway')` |
| hands `width` / `offset` / `handInset` | the primitive fallback only. `handInset` is 0 and dead - it was a per-aspect correction for the tall framing profile, which no longer exists. |

### Control modes

`core/Controls.js` owns which mode is live, the stored choice and the tilt
sensor. `core/Input.js` reads coordinates and the keyboard and asks Controls
which scheme those coordinates mean. Desktop is untouched - Controls is
constructed with `device.coarsePointer` and does nothing when false.

| Mode | Steer | Throttle | Brake |
|---|---|---|---|
| `tilt` (phone default) | DeviceOrientation, neutral = the angle you started at | hold the right half | hold the left half |
| `touch` | drag the left thumb horizontally, relative to where it landed | hold the right half | a button above the right thumb |

Releasing everything coasts in both. Switch, set sensitivity and recalibrate
from the pause card; the choice and the sensitivity are stored under
`neon-ride.controls`.

The stats overlay (`H`, or `?stats=1`) carries a control diagnostics block:
mode and fallback reason, `isSecureContext`, whether the sensor exists and
whether it needs permission, whether we are listening, events received, last
beta/gamma, and `screen.orientation.angle`. There is no console on a phone and
no keyboard to open one with, so anything that has to be read on the device is
on the screen.

Things that are the way they are for a reason:

- **The neutral is wherever you were holding it.** There is no correct angle to
  hold a phone at, so the first reading becomes zero and everything after is a
  delta. RECALIBRATE in the pause card does it again, which is the answer to
  shifting in a seat mid-run.
- **Axis mapping is not optional.** beta and gamma are reported in the device's
  portrait frame; which one means "leaned left" depends on which way the phone
  was turned to get to landscape. `screenTilt()` rotates them into screen space
  using `screen.orientation.angle`, and the two landscape angles take OPPOSITE
  signs. Without it steering is inverted for half of all riders.
- **Permission is a gesture, on iOS only.** iOS refuses DeviceOrientationEvent
  outside one, so it is requested from the start card's tap. Android needs no
  permission and so listens from construction - waiting for the tap everywhere
  meant the sensor had no chance to answer until the card was dismissed, which
  on a phone is seconds after load, behind a certificate warning.
- **The fallback timer starts when listening starts.** It used to start at load,
  and `update()` runs from the first frame, behind the title card - so the
  budget was spent before the tap and the fallback fired on the very next frame,
  before the sensor could possibly answer. Tilt looked unsupported on hardware
  that supports it.
- **A fallback is not written to storage.** It used to be, which turned that
  one misfire into a permanent setting: every later load read `touch` back and
  never tried the sensor again. The stored preference is only ever what somebody
  chose, so a reload always retries.
- **There is a pause button**, top centre, because Escape is a key and every
  touch on the canvas is a driving input - without it the mode switch existed
  and could not be reached. It is a real button on `document.body` while
  `core/Input.js` listens on `#app`, so its touches never enter the driving
  path. Hidden in god mode and capture.
- **The throttle floor is per mode.** `player.bike.throttleFloor` is 0.42 so a
  desktop ride never stalls; `controls.floorByMode` sets it to 0 for tilt and
  touch, so letting go of the gas actually slows the bike. A mode not named
  there keeps the bike's value, which is what the keyboard gets.
- **Every touch is read from coordinates, including the brake button.** The
  on-screen controls are `pointer-events: none` pictures. A real button would be
  a second, disagreeing source of truth and would break multi-touch, because a
  thumb held on an element does not appear in the other listener's stream.
- **Hints fade** after 12 s of play and vanish in god mode and capture, so
  footage stays clean. A mode change brings them back.

### Tilt steering, and how to check it on a device

`core/Controls.js`. **`devicemotion` is the primary source and
`deviceorientation` is the fallback**, not the other way round - see the closed
issue above for why. The roll comes from the gravity vector, rotated into the
screen's frame by `screen.orientation.angle`, low-pass filtered, with the dead
zone, the sensitivity and recalibrate all unchanged.

THE ONE THING THAT CAN STILL BE WRONG IS A SIGN. iOS reports
`accelerationIncludingGravity` with the opposite polarity to Android, and the
neutral is captured by calibration - so an inverted axis does not break tilt, it
steers the wrong way. `config/controls.js` -> `tilt.invert` flips it in one
place rather than one edit.

Three things to read, in order:

| | where | what it means |
|---|---|---|
| `public/sensor-test.html` | any browser, no game code | whether the PHONE sends data at all |
| stats overlay, `?stats=1` | in the game | whether the game is receiving it |
| the notice at the start | in the game | which fault it was, in Turkish |

The overlay's block is always printed while the overlay is up, whatever the
mode: switching to touch to look at why tilt failed must not blank the evidence.
It shows the live source, `isSecureContext`, events and readings per second for
BOTH event types, the last gravity vector, the orientation angle and the tilt
value.

`tools/smoke-mobile.mjs` feeds a synthetic `devicemotion` stream, so the gravity
path has automated coverage and the pause card can be checked with all four of
its buttons showing - in touch mode two of them are hidden and a geometry check
run against that card is checking half of it.

### Phone testing

    npm run dev:phone

HTTPS with `--host`, via `vite.phone.config.js`. **DeviceOrientation is a
secure-context API**: over plain http:// to a LAN address the events never
arrive - no error, no prompt, nothing - and tilt looks like a bug in the game.
The certificate is self-signed, so the phone warns once and has to be told to
continue. `npm run dev` is unchanged.

**The port is pinned with `strictPort`.** Vite's default is to hop to the next
free port and print it, which is fine until that URL is also typed into a second
command: a stale server on 5173 sent the dev server to 5174 while
`cloudflared --url http://localhost:5173` went on addressing the stale one, and
the tunnel answered 404 from a server nobody meant to run. It now fails to start
rather than moving. If it says the port is in use, kill the old server.

A separate config rather than an env var on one script: `PHONE=1 vite` is not
something the Windows shell understands, and this project lives on two Windows
laptops.

If the self-signed certificate turns out to be the problem rather than the
solution - a browser told to proceed past a warning may still refuse powerful
APIs - use a real one through a tunnel:

    npm run dev:tunnel

ONE COMMAND, and it prints the two URLs to open on the phone. It starts the dev
server, starts a Cloudflare quick tunnel in front of it, waits for the tunnel's
own address and prints the game and the sensor test. `cloudflared` is a
devDependency, so there is nothing to install by hand. The address is new every
run; read it off the terminal rather than remembering one.

It parses cloudflared's own output rather than using the npm package's
`tunnel()` helper - that helper's URL parser does not match the output of the
version it ships with, and resolved `undefined`, which printed a perfectly good
tunnel as `undefined/?stats=1`.

`vite.tunnel.config.js` serves plain HTTP with `allowedHosts` open, because a
tunnel's host is random per run and Vite answers an unrecognised Host header
with a blocked-host error and nothing else. cloudflared terminates TLS with a
trusted certificate, so the phone gets real HTTPS and no warning.

### Checks before saying anything works

    npm run smoke

`tools/smoke-mobile.mjs` drives real Chromium in a phone profile - landscape
viewport, `hasTouch`, `isMobile` - taps through the title card, waits five
seconds and fails on a console error or page exception, a flat picture, a stats
overlay still reading "measuring...", or a pause button that does not open the
card. It starts its own dev server and reads the URL out of that server's own
output rather than assuming a port.

It exists because a one-line scope mistake shipped and the only symptom on the
device was a black screen: the loop threw on its first tick, no frame was drawn,
and every readout that would have explained it never updated. `npm run build`
passed, both measure tools passed, and nothing in the repo could see it.

Verified by reintroducing that bug: the run fails and prints the error panel's
text. A check that has never failed is not a check.

**The on-screen error panel** (`ui/ErrorPanel.js`) is installed first in
main.js, before anything it might have to catch, and prints `window.onerror` and
`unhandledrejection` with the stack. There is no console on a phone and no
keyboard to open one with.

### URL parameters

For testing on a phone, where there is no keyboard and none of the hotkeys can
be reached. They set state at LOAD only; every key still does what it did.

| Parameter | What it does |
|---|---|
| `?theme=openRoad` | picks a theme for the session |
| `?stats=1` | shows the stats overlay, `?stats=0` hides it. Applied last, after capture and god mode have had their say. |
| `?god=1` | self-driving plus capture mode, and no title card |

Two things worth knowing rather than discovering:

- **The stats overlay is already on by default**, so `?stats=1` on its own
  changes nothing. It is for combining with `?god=1`, which turns capture mode
  on and takes the overlay away with it.
- **`?god=1` drops the title card, and the card is the build's only user
  gesture.** No browser will start an AudioContext without one, so the run
  starts silent and the first touch anywhere brings the sound up. Everything
  else - autopilot, capture mode, the world - is already running before the
  phone is picked up.

### Traffic: two models, and why

**A player has no guard.** `player/autopilot/Guard.js` makes a collision
impossible while the autopilot is driving - it is a cheat and it says so - and
it is inert outside god mode. Nothing else in the system ever guaranteed a
passable gap: `minGap` only stopped two vehicles stacking in the SAME lane, and
nothing at all coordinated across lanes. So the density that produces good
footage is a road a human crashes on constantly, which is what it turned out to
be.

`config/traffic.js` -> `models`, chosen at spawn time from
`config.autopilot.enabled`, so `?god=1` and the G-O-D sequence keep the dense
road and everyone else gets the playable one.

| | god | player |
|---|---|---|
| density start | 0.72 of the pool | **0.16** |
| rises to | 1.0 by 9 km | **0.5, capped** |
| curve / fullAt | 1.2 / 9000 | **0.85 / 16000** |
| same-lane gap | 26, fixed | **30 + 0.55 x speed** (159 at top speed) |
| speed spread | full | **0.55 of each type's range** |
| motorcycle weave | full | **0.4** |
| lanes occupied per 58 m | unlimited | **at most 2 of 4** |
| trucks abreast | unlimited | **1** |

The cap matters more than the ramp: a curve that keeps climbing arrives back at
the density that was unplayable to begin with.

THE ESCAPE GUARANTEE IS ENFORCED AT SPAWN, because that is the only place it
can be. Nothing downstream can open a gap that was never left. A placement that
would put a third lane in use over any 58 metre stretch is REFUSED, and the
vehicle tries the next lane, then 80 metres further along, ten times - and if
there is genuinely nowhere, it is sent beyond the spawn window rather than
forced into a wall. At most two of four lanes occupied means at least two free
lanes to aim at, always.

Measured with `tools/bot-run.mjs`, which drives the ordinary input path with no
guard at all - full throttle, steer at the freest lane:

| | distance | crashes | per km | live vehicles |
|---|---|---|---|---|
| opening density | 3.09 km | **0** | 0.00 | 22 |
| capped maximum | 1.07 km | **0** | 0.00 | 40 |

It held 234 and 221 of a 235 top speed. The bot is deliberately stupid: a road a
dumb bot can hold at full speed is a road a person has room to make decisions
on.

### On a crash

One collision ends the run - `config/game.js` -> `crashesAllowed: 1`. There are
no lives and no checkpoints. The crash itself costs 45 per cent of speed and a
sideways shove, the panel arrives after `overDelay` 0.9 s so the flash is seen
first, and any key or tap restarts from zero. God mode never fails.

### The highway

Four lanes our way, a median barrier, four more coming the other way. Every
lateral position in the world is derived from six numbers in
`config/road.js` -> `carriageway` by `world/road/layout.js`, and everything that
needs one asks: the ribbon geometry, the road shader's markings, where traffic
sits, where the barrier stands, where the pylons go. **Nothing writes a lateral
position out in metres of its own**, because the lane width has already changed
once and every hand written copy would have been silently wrong.

In metres from the path centre, which is the middle of OUR carriageway:

| | |
|---|---|
| our lanes | -5.7, -1.9, 1.9, 5.7 (3.8 wide) |
| lane dividers, dashed paint | -3.8, 0, 3.8 |
| our edges, solid paint + neon | -7.6 and 7.6 |
| hard shoulder | out to 10.2 |
| median, barrier down the middle | -8.8 to -12.0 |
| oncoming carriageway | -12.0 to -27.2 |
| the drawn ribbon | -31.6 to 12.8 |

`aAcross` CARRIES METRES now, not -1..1 across the ribbon. It had to: a
normalised coordinate made every marking position depend on the total width, so
widening the verge moved the lane markings.

**Lane width is 3.8, not the real 3.6, and the 20 cm is load bearing.** A truck
is 2.5 wide and the bike is 1.0, so at 3.6 the gap between two trucks in
adjacent lanes was 1.1 against a 1.1 requirement - there was no legal line at
all, and `tools/god-run.mjs` showed the god mode guard reporting trapped frames
and then letting overlaps through. Three things fixed it together: 3.8 m lanes,
a 1.0 m bike instead of 1.24, and `minLane` keeping the box truck out of lane 0
and the semi out of lanes 0 and 1.

The oncoming carriageway is SCENERY. `world/Oncoming.js` is never tested against
the player and never can be: it is behind a barrier, and a collision system that
reaches across the barrier is one that will one day kill somebody through a wall.

### Where the neon went

The flowing neon strips used to run down the middle of the asphalt at 1.45 times
road speed, directly under the cluster. They are now on the shoulder, on both
sides of the median and out on the far verge, and the traffic lanes carry
painted markings instead - world locked, so they stream past at exactly road
speed, which is the comfortable kind of cue.

That retires `openRoad`. It was never a place, it was the motion comfort variant
that existed because of those centre strips, and the variant IS the default now
on every theme. `config/comfort.js` and the reduced motion toggle are unchanged
and still matter - weather is a far stronger trigger than the strips ever were.

### Road themes

`docs/THEMES.md` is the plan. Two themes are built, in `config/themes/`:
**GALAXY ROAD** (the original look) and **AURORA PASS** (snow pass, northern
lights, ice blue and green). `?theme=<name>` picks one, `T` cycles by reloading.

**A THEME NEVER ALLOCATES.** It sets colours, intensities and densities, and
nothing else - no counts, no pool sizes, no shader defines. Every scenery kind
and the whole weather buffer are allocated at load whatever theme is fitted; a
kind a theme does not use has its mesh switched off. That is the rule the live
transitions in step 3 rest on, because an instance buffer cannot be resized mid
run and a road that changes theme every few kilometres cannot reload the page.

Measured, and worth knowing: parking unused instances a million units away is
NOT free. An InstancedMesh still submits its draw call and all of its triangles
wherever its instances are, so a kind at density zero is switched off outright -
Galaxy Road was paying four draw calls and 21k triangles for scenery it does not
have.

Each theme file carries a `comfort` block saying where its motion lives, which
`CLAUDE.md` requires of every theme. Aurora Pass is the one that needed it:
falling snow is the strongest nausea trigger in the project, and it goes through
`motionScale('weather')`.

### The cockpit contract

Asserted by `tools/measure-cockpit.mjs` at 16:9, 2:1 and 21:9. All three give
identical numbers, which is the point of sizing from height:

| | target | actual |
|---|---|---|
| windscreen top | 60-64% down | **62.0%** |
| grips | 85-88% down | **86.5%** |
| wrist cuffs, both gloves | inside the frame | **94.9%** down |
| horizon / road vanishing point | 40-47% down | **43.5%** |
| road band, horizon to windscreen | >= 15% | **18.5%** of frame height |
| both mirrors fully visible | yes | across 32.8-67.3%, down 64.4-72.4% at 16:9 |
| cockpit share of frame height | - | 38.0% |
| arms to the side edge | report only | 18.0% at 16:9, 21.7% at 2:1, 25.7% at 21:9 |

The forearms and the tank run off the bottom edge by design; only the cuffs
have to be in frame. Arm-to-edge is reported and never asserted - it is a
consequence of the plane's width at each aspect, not something worth failing a
build over, and the bottom corners it leaves empty were play-tested and kept.

**Both ends of the speed ramp are asserted**, not just the base fov of 75. The
fov opens to 104 at full speed, which moves the horizon but not the cockpit:
`_place()` runs every frame off the current fov, so the sprite holds its screen
position while the world opens up around it. Measured:

| | horizon | road band |
|---|---|---|
| fov 75, at rest | 43.5% | 18.5% |
| fov 104, full speed | 46.1% | **15.9%** |

The frame is tightest exactly when the rider is going fastest, and 15.9 against
a floor of 15 is not much room - so a wider `fovMax` fails the tool rather than
needing anyone to remember this paragraph.

The cockpit's own landmarks are reported once because they are identical at both
fovs, and the tool proves that rather than assuming it: a cockpit that has
started to move with the fov is its own failure.

Two knobs and a camera angle put it there: `heightScale` 0.7034 and `offset`
[0, -0.1521] in `config/cockpit.js` size and drop the plane, and `pitch`
-0.0994 rad in `config/framing.js` tilts the CAMERA down. They do different
jobs and both are needed. The cockpit is parented to the camera
(`camera.add(group)` in `player/Cockpit.js`) and `_place()` reads only the fov,
so pitch moves the world underneath a cockpit that does not move - which is how
the road band was opened up without the cockpit climbing back into it.

This REPLACES the old hand contract of 20 / 80 per cent across and 85 per cent
down. That was written when the hands were two separate sprites which could be
placed independently; they are painted into the cockpit drawing now, so where
they sit across the frame is the artist's and not a knob. Only how far down the
frame the whole cockpit sits is still ours to set.

Tools: **`tools/measure-cockpit.mjs`** - run it after any cockpit change; it
exits non-zero when a target is missed. **`tools/god-run.mjs`** - drives a real
browser in god mode for N seconds and reports overlaps, the tightest pass, near
misses a minute, draw calls, triangles and frame rate; it exits non-zero on a
single overlap. `node tools/god-run.mjs 120 auroraPass`. It prints the WebGL
renderer with the result, because a headless frame rate off SwiftShader is a
regression signal and not a frame rate anybody will see. Also `tools/cut-cockpit.py --debug`,
`tools/cockpit.mjs` (`--depths`, `--parts`, `--render`, `--overlay`),
`tools/measure-hands.mjs` and `tools/preview-hands.py` (primitive cockpit),
`tools/key-sprite.py --group`.
**`tools/shot.mjs`** takes one screenshot of the running game at a given size
(`node tools/shot.mjs tools/out/x.png 1280 720 god=1`) - it starts its own dev
server and reads back the port that server actually bound. `?god=1` in the
query is usually what you want: it drops the title card, which is otherwise
what you photograph. Output lands in `tools/out/`, which is not committed.
