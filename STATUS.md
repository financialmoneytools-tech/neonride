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

- **Cockpit art is 1.79:1 and needs to be about 2.6:1.** The size fix sizes the
  plane from the frame's height, which is correct and is what makes it stable
  across aspects - but it means the drawing no longer reaches the frame's sides.
  Measured, the arms stop 9.9 per cent from each edge at 16:9, 14.6 at 2:1 and
  19.5 at 21:9, leaving empty corners along the bottom. To cover the width at
  21:9 at the correct cockpit size the source needs an aspect of about 2.62:1,
  with the same composition and the arms reaching the new corners. Nothing else
  fixes it: widening the plane on its own stretches the drawing.
- **Dash screen** - `cut-cockpit.py` reports `CONFIG_DISAGREES` if the punched
  hole and `screen` in `config/cockpit.js` drift. Re-run after any art change.
- **Sway lifts the cut bottom edge** at full lock. With the plane now sitting
  10.2 per cent of the frame below the bottom edge this has headroom, but it is
  geometry rather than a fix: a big enough roll will always lift one end of a
  horizontal cut.

### Closed since the last note

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
