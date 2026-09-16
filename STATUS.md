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
  `src/player/Cockpit.js`. Art is right. Placement is not - see open issues.

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

1. **Mobile landscape** - touch controls at thumb reach, fullscreen API,
   address-bar resize handling, portrait prompt, quality presets for a
   mid-range phone.
2. **Gameplay loop** - score, distance, fail on collision, pause. Builds on the
   start screen. God mode bypasses all of it.
3. **Production build** - Vite build, deploy to Vercel.
4. **Bike library** - naked and concept bikes, each a cockpit sprite.
5. **Road themes.**

## Open issues

- **BLOCKING: cockpit too large in landscape (regressed).** At 2034x1012 the
  windscreen top sits ~28% down, bars ~65%, tank off the bottom edge. The road
  is fully hidden; only its edge lines show, as stray bars beside the mirrors.
  Target at every aspect 16:9 to 21:9: windscreen top 50-55% down, grips
  ~82-85% down, road visible from horizon to windscreen. Suspected cause:
  scale follows frame width, so wider-than-16:9 windows grow the cockpit. Must
  be fixed with an automated check at 16:9, 2:1 and 21:9.
- **Hand contract predates the full cockpit.** 20 / 80% across, 85% down was
  written for the separate hand sprites. Reconcile it with the cockpit targets.
- **Possible double arms.** The cockpit drawing includes arms; confirm
  `SpriteHands.js` is not also rendering when the sprite cockpit is active.
- **Stale docs.** `ASSETS.md` still shows a `glove-left` key command (left is a
  mirror now) and describes `handInset` as a tall-profile correction, a profile
  that no longer exists.
- **Dash screen** - `cut-cockpit.py` reports `CONFIG_DISAGREES` if the punched
  hole and `screen` in `config/cockpit.js` drift. Re-run after any art change.

## Config knobs that matter

| Knob | What it does |
|---|---|
| `config.player.cockpit.source` | sprite cockpit vs primitive fallback |
| `config/cockpit.js` -> `screen` | dash placement; must match the punched hole |
| cockpit scale / offset (VERIFY name) | the blocking issue above |
| hands `width` | glove size, 26.5% of a 16:9 frame |
| hands `offset` | puts the knuckles on the contract |
| hands `handInset` | per-aspect correction; likely dead now |

Tools: `tools/measure-hands.mjs` (`--solve`, `--quads`),
`tools/preview-hands.py`, `tools/cut-cockpit.py --debug`,
`tools/key-sprite.py --group`.
