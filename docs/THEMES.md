# Neon Ride - road themes

Plan, not a record of work done. Nothing in here is built yet except where it
says so. Written 17 September 2026.

## The concept

Real highways at night, always under a galactic sky, always lit with neon. A
theme is a PLACE: multi-lane road, lane markings, guardrails, light poles,
power lines, trees, overhead sign gantries, trucks in the traffic mix. Each
place has its own sky lighting, its own neon palette and its own weather.

Stars are visible on every road, including while it snows or rains. That is a
hard rule, not a default - the galactic sky is what the game is, and a theme
that loses it is a different game. Weather sits BETWEEN the camera and the sky,
never over it: the particles are near-field and the star layers keep their
brightness.

Six themes:

| | Place | Sky | Neon | Weather |
|---|---|---|---|---|
| 1 | **Galaxy Road** (current) | stars, nebula, aurora | cyan / magenta | none |
| 2 | **Aurora Pass** | snowy pines, mountains, snow on the guardrails | bright stars, green-purple aurora | ice blue / green | snow |
| 3 | **Sunset Highway** | desert hills, power poles, sign gantries | orange-pink horizon, retro striped sun, stars overhead | orange / pink | none |
| 4 | **Neon Metropolis** | skyline, bridges, big neon signs | purple cloud, stars through the gaps | purple / cyan | rain, wet road |
| 5 | **Nebula Coast** | palms, sea, coastal lamps | pink-teal nebula, two moons | teal / pink | none |
| 6 | **Red Planet** | red rock, canyon walls | one huge planet | orange / red | dust |

## What already exists

This is not a green field, and the plan is mostly about what has to CHANGE.

- `src/config/themes.js` - a theme is a patch over `config`, with two entries:
  `neonHighway` (empty, the base look) and `openRoad`.
- `src/utils/patch.js` - `applyPatch` and `PatchSelector`: a library of patches,
  one selected at a time, with an undo so patches never stack. Written to be
  reused for bikes and maps.
- `?theme=<name>` **already works**, read in `main.js`. The `T` key cycles
  themes by reloading the page with a new parameter.
- `world/Road.js` - a fixed pool of chunks, global chunk N in slot N % poolSize.
  `road.onChunkBuilt(fn)` is the hook everything roadside hangs off, and it
  replays the current pool on subscribe.
- `world/Roadside.js` - the model for every prop system to come: two
  InstancedMeshes, the instance buffer partitioned by pool slot, filled from
  `onChunkBuilt`, two draw calls for every pylon in the world.
- `world/Traffic.js` - one instanced pool per vehicle type, sized by
  `quality.trafficScale`.
- `world/road/RoadMaterial.js` - the whole road surface in one shader from two
  vertex attributes, `aAlong` and `aAcross`. Strips, edge lines and a fake sky
  sheen all come out of those.
- `config/device.js` - quality presets as patches, applied before anything is
  built.

## The problem this plan has to solve

**A theme is a load-time patch, and the feature asks for live transitions.**

Today `T` reloads the page, and the comment in `main.js` says exactly why: the
strip count is a shader define, the pylon spacing sizes an instance buffer, the
star counts allocate a geometry. None of that can change after construction. A
theme change every few kilometres cannot reload the page.

The resolution is to split every theme field into two classes and never let them
mix:

**Structural** - read once, at construction. Buffer sizes, pool counts, shader
defines, which prop kinds exist at all. These are allocated ONCE, as the UNION
over every theme, sized by the quality preset. They never change mid-run.

**Continuous** - read every frame, or cheap to write every frame. Colours,
intensities, fog colour and density, bloom, sky dome gradient, aurora strength,
weather rate, prop density. These are what a transition animates.

The consequence, and it is the whole design: **a theme never allocates. It
selects and it tints.** A prop kind that a theme does not use is not absent, it
is at density zero - its instances are parked outside the fog wall. A strip lane
a theme does not want is at intensity zero, not removed, so `STRIP_COUNT` stays
fixed at 4 for every theme and lanes can cross-fade.

This costs memory for props nobody can see, and it is the right trade: the
budget that matters on a phone is fill rate and draw calls, and a parked
instance costs neither. It also removes a whole class of bug - an instance
buffer that is the right size for the theme you started on.

### What that means for `openRoad`

`openRoad` is not a place, it is a motion-comfort variant of `neonHighway`. When
themes become places it stops being one of them and becomes a MODIFIER: a flag
a theme carries or a toggle beside the reduced-motion one. Left in the same list
it would be the odd entry the transition system has to special-case, and it
would turn up in the middle of a run as if it were a location.

## Architecture

### Config

```
config/themes/
  index.js        the library, the structural union, and the current selection
  galaxyRoad.js   one file per theme, ~80-120 lines of data each
  auroraPass.js
  sunsetHighway.js
  neonMetropolis.js
  nebulaCoast.js
  redPlanet.js
```

`config/themes.js` becomes `config/themes/index.js` and keeps its contract with
`config.js`: one import, one `themes` object, one `theme` name.

Each theme file is data only, in this shape:

```js
export const auroraPass = {
  name: 'Aurora Pass',
  sky:      { dome, stars, aurora, nebula, bodies },
  fog:      { color, density },
  bloom:    { strength, radius, threshold },
  road:     { surface, edges, strips, markings, wetness },
  scenery:  { pine: 0.8, rock: 0.35, lampPost: 0.5, guardrail: 1 },
  weather:  { kind: 'snow', rate, size, drift, motion },
  traffic:  { mix: { sedan: 0.3, van: 0.2, truck: 0.4 } },
  comfort:  { /* see below - every theme must answer this */ },
};
```

`scenery` is a density per prop kind, 0..1, where 1 means the kind's full
allocated count is placed. That is the single knob a transition animates, and it
is why the union is allocated up front.

### New modules

Each one file, each one job, all under the 300-line rule.

| File | Job |
|---|---|
| `world/Scenery.js` | the prop system: instanced, pooled, filled from `onChunkBuilt`, exactly like `Roadside.js` |
| `world/scenery/props.js` | low-poly geometry builders, one per kind, on top of `utils/geometry.js` |
| `world/scenery/Placement.js` | where props go: seeded, per chunk, deterministic from the chunk index |
| `world/Guardrail.js` | a continuous rail that follows the path; pooled per chunk, attributes rewritten in place |
| `world/Weather.js` | one GPU particle system, snow / rain / dust from the same buffer |
| `world/sky/Bodies.js` | the retro sun, the planet, the moons - billboards with a small shader each |
| `world/sky/CloudLayer.js` | the purple cloud bank for Metropolis; stars stay visible through the gaps |
| `world/ThemeBlend.js` | drives every continuous value from theme A to theme B over N seconds |
| `world/ThemeGate.js` | the arch that marks a change, and the flash that covers it |

### Scenery, in detail

`Roadside.js` is the template and the numbers are already proven by it. Scenery
differs in three ways:

1. **Several kinds, one system.** One InstancedMesh per kind per material, with
   the instance buffer partitioned by pool slot the same way. A kind at density
   zero writes its matrices outside the fog wall rather than skipping the write,
   so the buffer never has a stale instance in it.
2. **Placement is seeded by chunk index, not by slot.** `Roadside.js` places
   pylons at an exact spacing; trees cannot be evenly spaced or they read as a
   fence. A per-chunk RNG seeded from the global chunk index gives scatter that
   is the same every time that chunk is rebuilt, which matters because a chunk
   is rebuilt whenever the pool wraps.
3. **Props have a side and a setback.** Lateral offset from the path, jittered,
   with a minimum clearance so nothing lands on the asphalt.

Sign gantries and bridges span the road and need the path's frame at two points;
they are a prop kind with a different placement rule, not a different system.

### Weather

One `THREE.Points` with a fixed buffer and a custom shader. Particles live in a
box that is kept centred on the camera and wrap when they leave it, so there is
no spawning and no despawning - the same trick the sky group uses to let the
rider travel forever.

Streaking with speed happens in the vertex shader: the point is stretched along
its own velocity vector by a factor of the bike's speed, which turns snow into
dashes and rain into lines without touching the buffer. Dust is the same system
with a wide, slow, near-horizontal drift.

**Weather goes through `motionScale()`.** This is the standing requirement in
`CLAUDE.md`, and weather is the most obvious trigger the project has ever added:
high-contrast motion directly through the centre of vision, which is the first
cause on that list. Reduced motion cuts the rate and the streak length hard,
and it is scaled live, not baked, like `stripScroll` already is.

### Wet road

In the existing road shader, not a new pass - a new pass is a full-screen read
and write and the phone budget cannot pay for one.

The surface already computes a fake sky sheen at grazing angles. Wetness
extends it: the edge and strip colours are re-sampled with the along-coordinate
stretched, which smears them down the road the way a reflection does, modulated
by a noise term so it breaks into puddles rather than covering the asphalt
evenly. `wetness` is one continuous uniform, so rain can arrive gradually.

The quality split: on `high` the reflection samples every strip lane; on `low`
and below it samples only the two edge lines, which is where almost all of the
visible effect is anyway.

### Transitions

`ThemeBlend` holds two theme objects and a 0..1 factor, and writes the
interpolated continuous values into `config` and into the live uniforms each
frame. Colours are interpolated in linear space, not sRGB, or the midpoint goes
muddy.

A change is announced rather than sprung: a gate is placed a few hundred units
ahead, the blend runs while the rider passes through it, and a brief flash
covers the moment when structural-but-visible things change over - which should
be nothing, if the structural/continuous split above has been done properly. The
flash is there to make the change feel deliberate, not to hide a seam.

Distance between changes, gate style and blend duration all go in
`config/game.js`, and `?theme=<name>` pins one theme and disables the cycle so a
recording gets what it asked for.

**A tunnel is deferred.** It is a different piece of work - interior geometry,
the sky switched off and back on, the audio changing inside it - and it is not
needed to prove the transition. The gate ships first; the tunnel is a second
gate style once the blend is known to work.

### Motion comfort, per theme

`CLAUDE.md` requires every new theme to say where its motion lives, and six
themes at once is exactly where that rule gets forgotten. So every theme file
carries a `comfort` block, and the review for each theme answers three
questions:

- What moves through the centre of vision, and how fast relative to the road?
- Does the weather need a reduced-motion rate, and what is it?
- Checked with reduced motion both on and off? Both screenshots, both readings.

Themes with weather are the risky ones. Metropolis in the rain with wet-road
reflections is the worst case in the whole project, and it needs a real answer
before it ships, not a note afterwards.

## Budget

Current measured: 64 draw calls, 21k triangles, 90 FPS on the desktop. The
ceilings in `CLAUDE.md` are 120 draw calls and 400k triangles, and the phone
floor is 30 FPS at the mobile preset.

Per-theme allowance:

| | draw calls | triangles |
|---|---|---|
| now | 64 | 21k |
| scenery, up to 6 active kinds | +12 | +40k |
| guardrail | +2 | +12k |
| weather | +1 | +8k (points) |
| sky bodies and cloud | +3 | +4k |
| **worst-case theme** | **~82** | **~85k** |

Both well inside the ceilings, which is the point of allocating the union: the
cost is memory, and memory is not what a phone runs out of here.

Triangle counts per prop are a design constraint, not an outcome. A pine is two
cones and a trunk, about 60 triangles. A palm is a trunk and six quads. A power
pole is a box and two crossarms; its wires are lines, and lines are free. If a
kind cannot be drawn in under about 120 triangles it is the wrong shape for this
game - the existing vehicles make a van read as a van with blunt slabs, and
scenery at 40 metres has less to prove than a vehicle at 4.

## Tools and acceptance

- `tools/shot.mjs` already takes a 16:9 screenshot and already accepts a query
  string, so
  `node tools/shot.mjs tools/out/aurora.png 1280 720 "theme=auroraPass&god=1"`
  is the screenshot command. No new tool needed.
- `tools/bench-themes.mjs`, new: loads each theme in turn and reports draw
  calls, triangles and desktop frame time. Draw calls and triangles are exact
  and are the real regression signal. **Headless FPS is not a phone figure** and
  this document will not pretend it is - the phone number comes off the device
  with `?stats=1`, one reading per theme, written down here.
- `tools/smoke-mobile.mjs` must pass for every theme, which means it takes a
  theme argument.

A theme is done when it has: a screenshot in `tools/out/`, a draw call and
triangle figure from the bench, a measured FPS reading from the phone, a
reduced-motion check, and a green smoke run.

## Order of work

1. **This document.** Report and stop for approval.
2. **The theme system plus Aurora Pass, end to end.** The split into structural
   and continuous, the theme files, `Scenery`, `Guardrail`, `Weather`, and one
   complete place to prove all of it. Screenshots at 16:9, then stop for visual
   approval. No transitions yet - one theme at a time via `?theme=`.
3. **The remaining four places, then the transitions.** Sunset Highway, Neon
   Metropolis (with the wet road), Nebula Coast, Red Planet; then `ThemeBlend`
   and `ThemeGate`. Every theme gets its screenshot, its bench figures, its
   phone reading and a green smoke run.

## Open questions

- **Does Galaxy Road keep the empty patch?** It is the current look and the
  `themes.js` comment argues well for the default being the base config rather
  than a layer. Once every theme carries scenery and weather, a base config with
  no scenery is a strange shape. Leaning toward: Galaxy Road becomes an explicit
  theme file like the others, and the base config keeps only what is common.
- **Multi-lane.** The road is one ribbon with painted strips, and "multi-lane
  with lane markings" is a real change to `RoadMaterial` and possibly to how
  traffic picks a lane. It affects every theme at once, so it may want to be its
  own step between 2 and 3 rather than being folded into a place.
- **Trucks** are a new vehicle type, not a theme's business, and the traffic mix
  per theme only works once they exist.
- **Two seeds.** `sky.seed` and `world.seed` are fixed. A theme that changes the
  sky seed gets different nebula placement, which may be wanted; a theme that
  changes the world seed gets a different road, which is almost certainly not.
