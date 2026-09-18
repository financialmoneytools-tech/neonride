# Realism probe

**Branch `probe/realism` only. Nothing here is on `main` and nothing here is
meant to merge.** It exists to answer one question with numbers instead of
opinions: what would it cost to make this game photoreal, and what would be
left of the code.

    npm run dev          # then open /probe.html
    /probe.html?quality=low   # no shadows, fewer lamps - the phone guess

    python tools/probe-assets.py   # fetch the CC0 textures (once)
    node tools/probe-shots.mjs     # the two comparison screenshots
    node tools/probe-bench.mjs     # what each look costs to draw

## What it deliberately does differently

The shipped game is **unlit**. Every surface is a `MeshBasicMaterial` or a
custom shader that computes its own colour, there is not one `THREE.Light` in
the scene, and nothing casts a shadow. That is the style, not a shortcut: neon
is emission, and emission needs no light.

The probe is the opposite of every one of those choices - `MeshStandardMaterial`
throughout, real spot lights, real shadow maps, and albedo + normal + roughness
+ ambient occlusion on every surface. Everything it costs, it costs because of
that, and not because of how it is written.

## The camera is the game's camera

Same eye height (`config.player.camera.height`, 2.35), same base field of view
(the 16:9 framing profile, 75), same downward pitch (-0.0994 rad), same
1280x720. Photographing a realistic scene from a flattering angle and the
current one from a driving angle would prove nothing.

The cockpit sprite is hidden in both shots: the question is what the ROAD looks
like, and the drawn bike covers the bottom third of the answer.

## Assets

CC0, fetched by `tools/probe-assets.py`, credited in `public/probe/CREDITS.json`.
Poly Haven for the surfaces, ambientCG for the guardrail metal, Khronos for the
vehicle.

**There is no CC0 photoreal car**, and that is a finding rather than an
inconvenience. The vehicle is Khronos's `ToyCar` - real car paint with
clearcoat, sheen and transmission, on a toy's body. It stands in for a car and
does not look like one.

---

# The PLAYABLE probe

The static scene above answers "what would it look like". This one answers
"what would be LEFT", because it is the real game rendered realistically.

    npm run dev          # then open /probe-play.html
    /probe-play.html?quality=low   # no shadows, smaller maps
    /probe-play.html?fp=1          # first person, to compare cameras
    /probe-play.html?raw=1         # the grade off

    npm run probe:play    # screenshots at 1280x720
    npm run probe:check   # does the gameplay still work?

## What is borrowed and what is new

**Borrowed, unchanged, and driven in the same order as `src/main.js`:**
`core/Loop.js`, `core/Input.js`, `core/Framing.js`, `world/Road.js`,
`world/Traffic.js`, `player/BikePhysics.js`, `game/Session.js`. Not copies -
the modules themselves. The speed model, the lateral clamp, the collision
boxes, the near miss detection, the lives and the scoring here are the shipped
ones.

**New:** renderer settings, lighting, materials, the bike, the camera and a
one-pass grade. That list is the answer to what a realistic conversion costs.

`npm run probe:check` is what makes that a claim rather than a hope: it drives
real input at the real modules and asserts the bike rolls, steering moves it,
the clamp holds, the traffic is still solid, the run still scores, and the
scene is genuinely lit. Measured: 2 hits and a score of 6028 over 6 km of
weaving, on a road that is a `MeshStandardMaterial` with 26 shadow casters.

## Measured, 1280x720, desktop

| | FPS | draw calls | triangles |
|---|---|---|---|
| chase, graded | 60 | 144 | 68,209 |
| first person | 60 | 45 | 32,899 |
| `quality=low` | 60 | 113 | 56,061 |

The shipped neon game draws the same road in about 74 calls. Roughly double,
for one lit road with no roadside, no scenery, no weather and no sky.

## The bike is a BLOCKOUT, and that is the finding

There is no free photoreal motorcycle at a licence this project can use. The
first pass of this probe hit the same wall with cars and had to stand in
Khronos's ToyCar; a motorcycle is harder, because it is the one vehicle with no
bodywork to hide behind - every tube, every weld and the rider on top of it are
load bearing. `play/bike.js` is massing in the right proportions and the four
materials, behind a factory so a real model drops in later. It is not meant to
be judged as a bike.

## Three bugs worth keeping

1. **`half` is a reserved word in GLSL ES.** A function parameter named `half`
   fails to link the whole program, which shows up as an untextured road rather
   than as an error anybody notices.
2. **A position spring on a chase camera drifts with speed.** An exponential
   smoother chasing a moving target settles at `speed * lag` behind it - 22
   metres at 139 u/s - so the bike shrank to a dot and got smaller the faster it
   went. The damping belongs on the YAW; the distance behind is rigid.
3. **A grade that darkens is an exposure change in a costume.** Contrast about
   mid grey crushed a night scene where every pixel sits below the pivot, and a
   split tone multiplied by a dark tint was a 40 per cent exposure cut. Pivot at
   the scene's own level, normalise the tints by their own luminance, and pay
   for the rest upstream with exposure.

## What is deliberately missing

Sky, roadside, median, scenery, weather, mountains, the cockpit sprite, bloom
and the whole neon grade. Every one of them is a neon object, and the brief was
ONE realistic scene rather than a realistic version of every object in the game.
