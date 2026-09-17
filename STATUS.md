# Neon Ride - status

Handover note, 16 September 2026. Read this, then `CLAUDE.md`, `BUILD-PLAN.md`
and `ASSETS.md`. Git history carries the detail; this carries the state.

Stack: Vite, vanilla JS, three@0.186.0. Local path `C:\Projelerim\neon-ride`
(deliberately outside OneDrive). Two goals, equal weight: a playable game, and a
footage generator for YouTube / Instagram. Anything that hurts a recording is a
bug even if gameplay is fine.

## Built and working

- **Sky** - starfield, nebulae, aurora.
- **Road** - endless, CatmullRomCurve3 chunks from a recycling pool. Zero new
  geometry inside the loop. Neon edge lines, cyan left / magenta right.
- **Post** - UnrealBloomPass, vignette, chromatic aberration.
- **Traffic** - InstancedMesh, five vehicle types, ~65 on the road.
- **God mode** - AI rider slaloms through traffic. 36,000 frames with zero
  overlap, tightest pass 0.050 u, ~23.5 near misses a minute. If no safe gap
  exists the guard slows and waits instead of phasing through. The guard is
  inert outside god mode.
- **Audio** - Web Audio, fully synthesised: engine formant bank with
  progressive gearing (short low gears, long top gears), wind, traffic pass-bys.
  Confirmed good against the ride.
- **Start screen** - title and start prompt only; it is the audio unlock
  gesture. Skippable in god mode so it never lands in footage.
- **Stats overlay** - `H`. Last reading: 90 FPS, 64 draw calls, 21k triangles.
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
2. **Cockpit art is not wide enough.** See open issues - this is now the thing
   holding the framing back.
3. **Production build** - Vite build, deploy to Vercel.
4. **Bike library** - naked and concept bikes, each a cockpit sprite.
5. **Road themes.**

## Open issues

- **Dash screen** - `cut-cockpit.py` reports `CONFIG_DISAGREES` if the punched
  hole and `screen` in `config/cockpit.js` drift. Re-run after any art change.
- **Sway lifts the cut bottom edge** at full lock. With the plane now sitting
  10.2 per cent of the frame below the bottom edge this has headroom, but it is
  geometry rather than a fix: a big enough roll will always lift one end of a
  horizontal cut.

### Closed since the last note

- ~~Empty bottom corners at wide aspects~~. ACCEPTED after play-testing, 16
  September 2026. Sizing the plane from the frame's height keeps the cockpit the
  same size at every landscape aspect, and the cost is that a 1.79:1 drawing
  stops short of the frame's sides: measured, the sleeves end 9.9 per cent from
  each edge at 16:9, 14.6 at 2:1 and 19.5 at 21:9. The sleeves run off the
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
| `config/cockpit.js` -> `heightScale` | **0.890** - the plane's height as a fraction of the FRAME's height. The size knob. Solved, not chosen: the only value that puts the windscreen top and the grips inside their targets at once. |
| `config/cockpit.js` -> `offset` | **[0, -0.2042]** - half-frames [across, up]. Drops the bottom-anchored plane until the windscreen top lands at 52.5% down. |
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
    cloudflared tunnel --url http://localhost:5173

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

### The cockpit contract

Asserted by `tools/measure-cockpit.mjs` at 16:9, 2:1 and 21:9. All three give
identical numbers, which is the point of sizing from height:

| | target | actual |
|---|---|---|
| windscreen top | 50-55% down | **52.5%** |
| grips | 82-85% down | **83.5%** |
| road band, horizon to windscreen | > 0 | **2.5%** of frame height |
| cockpit share of frame height | - | 47.5% |

This REPLACES the old hand contract of 20 / 80 per cent across and 85 per cent
down. That was written when the hands were two separate sprites which could be
placed independently; they are painted into the cockpit drawing now, so where
they sit across the frame is the artist's and not a knob. Only how far down the
frame the whole cockpit sits is still ours to set.

Tools: **`tools/measure-cockpit.mjs`** - run it after any cockpit change; it
exits non-zero when a target is missed. Also `tools/cut-cockpit.py --debug`,
`tools/cockpit.mjs` (`--depths`, `--parts`, `--render`, `--overlay`),
`tools/measure-hands.mjs` and `tools/preview-hands.py` (primitive cockpit),
`tools/key-sprite.py --group`.
