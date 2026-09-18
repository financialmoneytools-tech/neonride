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
