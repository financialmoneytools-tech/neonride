# Cockpit redraw brief

A richer cockpit in the **same cel-shaded neon style**. Not a photograph, not a
3D model: the realism probe on `probe/realism` showed that a realistic cockpit
drags the whole world realistic with it, and the world is not going there.

**The hands do not move.** Everything below exists to make that possible to
check rather than to hope for.

---

## 1. The brief, to paste into an image generator

> First-person view from a motorcycle rider's eyes, looking down at the cockpit
> of a sport-touring motorcycle. Cel-shaded neon comic style: flat colour fills,
> hard-edged shading in two or three tones per surface, crisp black line art,
> thin glowing neon rim-light along edges. Night scene, dark palette, the bike
> lit mainly by its own instrument glow and by cyan and magenta neon rim light.
> Plain flat white background behind the motorcycle, no scenery, no road, no
> sky.
>
> **Composition, and this is the part that must not change.** Symmetrical,
> centred, wide 16:9 framing. Two black-leather-gloved hands gripping the ends
> of a straight handlebar that runs horizontally across the lower third of the
> image. The bar spans about 71 per cent of the image width. The grips sit at
> about 72 per cent down the image. The gloves are centred at roughly 22 per
> cent and 78 per cent across. Forearms in dark textured sleeves run from the
> gloves down and outward, leaving the image through the bottom edge at about 7
> per cent and 93 per cent across. Brake and clutch levers in front of the
> grips, black switch blocks inboard of each glove. Above the bar: the
> instrument cluster, then a tinted windscreen, with a mirror on a short stalk
> to each side. Below the bar: the fuel tank, running off the bottom edge.
>
> **Draw these in far more detail than a simple flat panel.**
>
> - **Instrument cluster**: larger and dominant, a wide rectangular TFT screen
>   in a sculpted housing with a raised hood over it to shade it, with a visible
>   bezel, mounting bolts and a gap between housing and fairing. **The screen
>   itself must be a single flat blank rectangle of uniform dark grey with no
>   text, no numbers, no dials, no icons and no reflections** - it is replaced
>   at runtime by a live display.
> - **Brake and clutch fluid reservoirs**: small translucent cylindrical
>   containers on short brackets, one above each lever mount, with a dark cap
>   and a fluid level line.
> - **Cable runs**: throttle, clutch and brake lines looping from each switch
>   block and lever, gathering toward the centre and disappearing behind the
>   cluster. Braided texture, cable ties, gentle sag.
> - **Fork tops**: the tops of two upside-down front fork legs rising through a
>   triple clamp, with preload adjusters, pinch bolts and a visible machined
>   edge on the clamp.
> - **Fairing**: sculpted rather than a slab. Layered panels with visible panel
>   lines and shadow gaps, a raised centre spine, vents or ducts either side,
>   fasteners along the seams, and a chamfered inner edge where it meets the
>   screen.
> - **Windscreen**: a double-bubble profile with a thicker rolled top edge, two
>   or three visible mounting bolts, a faint tint gradient, and a soft neon
>   highlight running along the rolled edge.
> - **Tank**: layered, with a knee recess either side, a raised centre section,
>   a visible seam line, and a proper fuel cap with a hinge and a keyhole.
> - **Mirrors**: on slim sculpted stalks with a visible joint and adjuster,
>   housing drawn from behind, glass a flat dark surface with one soft highlight
>   band.
>
> **Palette.** Near-black line art. Bodywork very dark blue-grey, in the range
> #0f0f1b to #2b3241, with highlight passes up to about #9066c8 on the
> shoulders. Windscreen a dark slate blue, around #2d3a4e to #6ca8d7. Rim light
> in electric cyan (#7df2ff) along upper edges, magenta (#ff3ca8) along lower
> and inner edges. Glove piping cyan. Instrument housing slightly lighter than
> the fairing so the cluster reads as a separate object.
>
> **Line weight.** Consistent, crisp, moderately heavy black outline on the
> outer silhouette, lighter interior lines for panel seams and details. Line art
> should be roughly 13 per cent of the drawn area. No sketchy or broken strokes,
> no cross-hatching, no painterly blending, no airbrush gradients except the
> faint screen tint.
>
> **Prohibitions - none of these may appear.**
>
> - No road, no horizon, no sky, no landscape, no headlights, no other vehicles,
>   no motion blur, no speed lines. Plain white background only.
> - No text, no numbers, no logos, no brand names, no badges, no licence plates,
>   no watermark, no signature.
> - Nothing on the instrument screen: it is a blank flat rectangle.
> - No rider body above the forearms, no chest, no chin, no helmet, no visor
>   edge.
> - No changes to the hands, gloves, sleeves, handlebar, levers or switch
>   blocks: same position, same size, same shape, same style as described.
> - No photorealism, no 3D render look, no ray-traced reflections, no depth of
>   field, no lens flare, no film grain, no vignette.
> - No asymmetry: the left and right sides mirror each other apart from the
>   brake and clutch hardware.
> - No extra fingers, no extra hands, no floating parts, no parts that do not
>   connect to something.

---

## 2. What the pipeline needs

**Source resolution: 2752 x 1536**, or any size at the **same 1.7917 aspect**.
Larger is fine and is downscaled; the shipped sprite is capped at 2048 on the
long side by `cut-cockpit.py`.

**The aspect is a precondition, not a preference.** Every landmark below is a
fraction of the image, so a drawing at a different shape makes every one of them
mean something else. `check-redraw.py` refuses a candidate more than 0.01 away
from 1.7917.

**Framing.** Keep the existing margin. The drawing does not fill its canvas:
there is deliberate empty white on every side so the cut edges stay outside the
frame through the whole roll-and-shift range of the sway, and `cut-cockpit.py`
does **not** crop to content precisely so that margin survives. A candidate
cropped tight to the artwork will pass the checks and then show its own cut edge
when the bike leans.

Save as `art/cockpit/cockpit-wide-source.jpg`, quality 92 or better. Sources
live in `art/` and are never shipped.

### Commands, in order

    # 1. Will the hands still be where they were? Run this FIRST - it is the
    #    cheapest check and the one that rejects most candidates.
    python tools/check-redraw.py art/cockpit/candidate.jpg --debug

    # 2. Adopt it, then key it. This writes public/sprites/cockpit.png and
    #    prints the dash rectangle it cut.
    copy art\cockpit\candidate.jpg art\cockpit\cockpit-wide-source.jpg
    python tools/cut-cockpit.py --debug

    # 3. If it printed CONFIG_DISAGREES, put the rectangle it printed into
    #    config/cockpit.js -> screen, then run it again until it agrees.

    # 4. Re-derive the paint mask for the four bikes, and LOOK at the overlay.
    python tools/paint-mask.py --debug
    #    tools/out/paint-mask.png: orange is bodywork, blue is glass, green is
    #    rim light, and anything left dark is excluded. The gloves must be dark.

    # 5. The framing contract, at all three aspects.
    node tools/measure-cockpit.mjs

    # 6. The four bikes, in game, on Aurora Pass.
    node tools/bike-shots.mjs auroraPass

    # 7. Everything else.
    npm run build && npm run smoke

---

## 3. The acceptance check

    python tools/check-redraw.py art/cockpit/candidate.jpg --debug

Exits non-zero if anything moved. `--debug` writes `tools/out/check-redraw.png`
with the baseline silhouette in red and the candidate in cyan: grey is
agreement, and a coloured fringe is a move.

Both images go through the **same keyer**, imported from `cut-cockpit.py` rather
than reimplemented, because a candidate measured with a different silhouette
extractor is being compared against a different question.

| Landmark | Current | Tolerance |
|---|---|---|
| grip line, down the image | 0.7168 | **±1.0%** (±15 px) |
| bar span, across | 0.7093 | ±2.0% |
| hand centroid left | 0.2358, 0.8184 | ±1.5% across, ±1.0% down |
| hand centroid right | 0.7601, 0.8122 | ±1.5% across, ±1.0% down |
| sleeve exit, left / right | 0.0745 / 0.9253 | ±1.5% across |

### Why ±1.0% vertically

Solved, not picked. `measure-cockpit` asserts the grips between **85 and 88 per
cent down the frame** and they currently sit at **86.5**, so there is 1.5 per
cent of frame height of room in the tighter direction. The sprite is 0.7034 of
the frame's height, so 1.5 per cent of the frame is `1.5 / 0.7034` = **2.13 per
cent of the image**. The tolerance is **half** of that, because a redraw may
spend half the budget and leave the other half for a future framing change -
two things that each spend all of it cannot both ship.

`heightScale` itself is `0.245 / 0.3483`, where 0.3483 is the distance between
the windscreen top and the grips **as a fraction of the image**. That is the
deeper reason the grip line matters more than anything else here: move it and
the size knob is answering a question about a picture that no longer exists.

### Why ±1.5% horizontally

Looser on purpose. `STATUS.md` is explicit that where the hands sit *across* the
frame is the artist's and not a knob - the old 20/80 per cent hand contract was
retired when the hands were painted into one drawing. But the **mirrors** are
still asserted, across 32.8 to 67.3 per cent, and the paint mask's seeds have to
keep landing in the right regions. 1.5 per cent keeps both true without
pretending the across position is fixed.

### Verified, both ways

Run against the current source it reports every landmark unmoved and passes. Run
against a copy shifted 22 px down - 1.43 per cent, just past tolerance - it
reports `grip line y +0.0143 (+22 px)` and exits 1. A check that has never
failed is not a check.

**One honest limitation.** The hand centroids are *damped*: the forearms run off
the bottom of the image, so ink that leaves cannot be counted, and a 22 px shift
moves those centroids by only about 6. The **grip line is the sensitive
measure** and it moves by the full amount. A knuckle-line measure was tried to
fix this and was worse - the topmost ink in the hand boxes is forearm, not hand,
so it pinned to the box edge and reported the same number whatever the drawing
did. The boxes now run to the bottom edge, which removes the larger half of the
damping, and the grip line carries the rest.

---

## 4. Can the paint mask be re-derived automatically?

**Partly. The tool will run, and it will tell you honestly if it has gone
wrong - but expect to move some seeds by hand.**

`tools/paint-mask.py` finds each part by flooding the connected region a **seed
point** lands in, where a seed is the deepest interior point of that part. A
richer drawing changes those regions in three ways:

1. **Parts get subdivided.** A sculpted fairing with panel lines is no longer
   one enclosed region - each panel line cuts it into separate regions. The
   current `fairing` seed will find one panel instead of the whole fairing, and
   the rest of the fairing will go unpainted. **This is the likely outcome and
   it needs new seeds, one per panel.**
2. **New parts appear.** Reservoirs, fork tops, the triple clamp and the
   instrument housing are all new enclosed regions. Each needs a decision: is it
   painted bodywork, or is it hardware that stays neutral like the levers and
   switch blocks? My recommendation is that **reservoirs, cables, fork tops and
   the triple clamp stay neutral** - they are mechanical parts, not paint, and
   painting the brake reservoir orange on EMBER would look wrong.
3. **Seeds drift.** Even an unchanged part is drawn slightly differently, so its
   deepest interior point moves.

**What the tool does about it, without being asked.** Every seed is checked
against the size recorded beside it and fails at more than 45 per cent drift;
two seeds claiming one region is a failure; and eight **excluded** parts - both
sleeves, both gloves, both mirrors and both bars - are looked up and must not
have been claimed. That last check is the one that matters: a mask which has
leaked into a glove paints the rider in the bike's colour, and nobody would
think to look.

So it will not silently ship a wrong mask. It will refuse and name the part.

**The work, realistically:** run `paint-mask.py --debug`, read the failures, and
for each one open `tools/out/paint-mask.png` and pick a new interior point.
About **30-60 minutes** for a redraw of this scope, most of it on the fairing
panels. I can do it in one pass once the art exists.

**One thing that would make it near-automatic**, if you want to make the art do
the work: keep every painted region **enclosed by a continuous ink outline**,
and let panel lines be *interior* lines that do not fully separate a panel from
its neighbour - leave a small gap where each panel line meets the outer edge.
Then the fairing stays one region however many lines are drawn on it, and the
existing seeds keep working. That is a real constraint on the drawing, so it is
your call whether it is worth it; if not, moving seeds by hand is a small job.

---

## What happens after the art lands

The four bikes recolour the masked region, so a richer fairing with more
readable panels makes VOLT, NOVA, EMBER and FROST **more** distinct rather than
less. The recolour keeps luminance exactly and replaces chroma, so added shading
detail survives it. Nothing in `config/bikes.js` needs to change.
