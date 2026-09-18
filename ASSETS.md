# External assets

Almost everything in this project is generated at runtime. What is not is listed
here. Every entry names the source, the licence, the date it was taken and where
the file lives, and nothing goes in `public/` without a row.

## Sprites

### Gloved hands on the bars

| | |
|---|---|
| Files | `public/sprites/glove-right.png`, `glove-right-brake.png` |
| Sources | the same two names under `art/sprites/` |
| Retrieved | 15 September 2026, redrawn 16 September 2026 |
| Used by | `src/player/rider/hands/SpriteHands.js` |

Hands in black leather racing gloves closed on the bars, seen from the rider's
eyes, drawn with a cyan rim down one edge and magenta down the other - the same
pair the road edge lines use. Each image carries the grip, the bar end, the
lever and the switch block along with the hand, and that is the point: the join
between a 2D hand and a 3D bar is what would give the trick away, and there is
no join if the bar ends inside the picture. The 3D grip, lever and bar end are
no longer built.

ONE IMAGE, MIRRORED FOR THE LEFT. This went the other way for a while - a
separate drawing per hand, on the reasoning that each is posed on its own bar
with its own lever and switch block - and that was wrong in practice. Two
separately generated images never matched: the ribbed cuff, the neon piping and
the line weight came out differently each time the second was regenerated, and
the eye reads two hands side by side as a pair or not at all.

A mirrored right arm IS an anatomically correct left arm, so every detail
matches by construction rather than by luck. It is right for the hardware too:
reflected, the brake lever lands where the clutch lever belongs, the bar end
goes to the upper left and the switch block ends up inboard, which is where all
three are on a real left bar.

The brake frame is NOT mirrored onto the left. A rider braking is not pulling
the clutch.

Sources live in `art/` and are not shipped. `tools/key-sprite.py` turns each one
into the RGBA PNG the game loads.

NOTE: the glove sources are no longer in `art/sprites/` - the directory was
cleared when the cockpit art replaced them - so these commands cannot be re-run
as written. The shipped PNGs still work and the primitive cockpit still uses
them; only regeneration is gone. There was a third command here for
`glove-left`, and it was already wrong before that: the left glove has been the
right one mirrored since the one-drawing change.

    python tools/key-sprite.py --group         art/sprites/glove-right.png public/sprites/glove-right.png         art/sprites/glove-right-brake.png public/sprites/glove-right-brake.png

The two right hand frames are keyed as a GROUP because they swap in place when
the brake comes on. Cropped separately they would each shrink to their own
content, come out different sizes, and the hand would jump the instant it
changed.

Keeping source and target apart matters more than it looks now that both are
PNGs: a script that derived its own output name would have overwritten the
source the second time anyone ran it.

What it does, and why none of it is a per-pixel threshold: a threshold punches
holes through every light thing INSIDE the drawing - the carbon knuckle armour
is full of highlights - and leaves a white halo wherever the artwork is dark.
So it floods from the borders, finds enclosed pockets separately (the gap
between a lever and the fingers is background the border fill cannot reach, and
came out as a white patch hanging in the middle of the sprite), recovers the
anti aliased edge from luminance and unpremultiplies it, crops to what is drawn,
and resizes to 1024 on the long side.

It also PADS each source with white before doing any of that. The drawings run
off their own canvas - the switch block at one side, the bar end at the other -
and a fill starting at the border cannot get round them, so those sides came out
with no silhouette at all: the alpha simply stopped where the image did. Fading
the edge hid it and cost a visible gradient band. Padding fixes the cause. The
fill goes all the way round, every side gets a real outline, and the only fade
left is the one that belongs - the forearm, which genuinely does leave the
picture and should go into shadow rather than stop on a cut.

Three things it does NOT assume about a source, each of them a defect that
actually arrived rather than a precaution:

**The frames of a set are not assumed to be registered.** They were, once: both
sources came off one 2048 canvas and a shared crop was enough. The 35 degree
redraw arrived as 2048x2048 and 1178x925 - the same composition, cropped and
scaled differently - and a shared crop of two unregistered images is not a
shared anything. It cropped the brake frame to a box lying mostly outside it and
wrote a hand in the corner of an empty square. So `--group` now MEASURES the
alignment: it sweeps scale, takes the offset at each scale from a cross
correlation of the two ink masks, scores by overlap, and composites every frame
onto the region all of them cover. The brake frame fits the neutral one at
x2.2125 with 0.939 overlap; the arm, which is identical in both, lands within a
pixel at 1024. A poor fit is printed as a warning rather than shipped.

**The edges are not assumed to be clean.** The brake source arrived with a one
pixel seam down its left column, a flat grey at a median of 197 - light enough
to read as background, dark enough to fail the white test, so the flood fill
could not cross it. It would have shipped as a grey hairline and dragged the
crop box out to the full height. A seam is told from artwork by what its light
pixels are: white on a real edge, grey on a seam.

**The direction the arm leaves is not assumed.** The fade used to ramp alpha by
row, which was the same thing as fading the cut only because the old arm ran off
the bottom. The 35 degree art sends the sleeve out through the bottom RIGHT
corner, where a row-wise fade eats the part of the arm that does not leave, misses
the part that exits sideways, and lays a horizontal gradient across a diagonal
cut. So the cut is found - the longest run of silhouette sitting on the source's
own edge, walked as one loop so that an exit turning a corner counts once - and
alpha ramps with distance from it, which works whichever way it runs.

That last change retired the outline softening that used to run beside it. It
existed because the old forearm's outer edge was drawn within 13 degrees of
vertical, and a billboard turns a near vertical line into an exactly vertical one
that reads as the edge of a rectangle. The redraw moves that edge 814 px across
717 rows - 49 degrees - and a diagonal reads as an arm.

### Where they sit in the frame

`tools/measure-hands.mjs` computes it, and `--solve` derives the numbers that
put the knuckles on the contract: 20 and 80 per cent across, 85 per cent down a
16:9 frame. It imports the rig, the config and the anchor maths rather than
modelling them, so a change to any of those shows up as a changed measurement
instead of a stale comment. `--quads | python tools/preview-hands.py out` draws
the result, because percentages are a proxy for a composition and a proxy is
worth checking against the thing it stands for.

A redraw moves the hand inside its own picture, and that is the whole reason
this exists. The old sprite had the knuckles at 47 per cent across and 42 down
the image; the 35 degree one has them at 27 and 30, with the rest given over to
forearm. So scaling the plane now MOVES the hand rather than growing around it,
and `width` can no longer set size and position together. `width` holds the size
- the glove spanning 26.5 per cent of a 16:9 frame, as it did before the redraw
- `offset` puts it on the contract. `handInset` was a per aspect correction for
the tall framing profile; that profile is gone with portrait, there is one
profile left, and the value is 0. It is dead weight kept only because the
primitive cockpit still reads it.

## Cockpit

### Cockpit overlay

| | |
|---|---|
| File | `public/sprites/cockpit.png` |
| Source | `art/cockpit/cockpit-wide-source.jpg` |
| Retrieved | 16 September 2026 |
| Used by | `src/player/Cockpit.js` |

The whole bike as one drawing: bars across the lower third, arms entering from
both bottom corners and running off the bottom edge, cluster with a blank
screen, windscreen and mirrors above it, tank nose and fuel cap below. It
replaces the primitive cockpit in `player/Rider.js` outright, which is still
built and still selectable through `config.player.cockpit.source`.

ONE SOURCE, because the game is landscape only. There was a portrait source and
a selector that picked between them by frame shape; both are gone, along with
the second framing profile. Two earlier pairs are in the history: photographs of
two different real motorcycles, which needed a hand-authored polygon mask
because there was no background to key, and a neon pair whose portrait half was
drawn at 2:3.

`tools/cut-cockpit.py` keys it:

    python tools/cut-cockpit.py
    python tools/cut-cockpit.py --debug

It floods white in from the border the way `key-sprite.py` does, and differs in
three ways: it does NOT crop to content, because the source carries a margin
that keeps the cut edges out of frame and cropping to content throws that away;
it finds the blank instrument panel and punches it out; and it has no sleeve
fade or outline softening, since nothing leaves this picture except at the
edges, which are frame edges.

Three things it does not assume:

- **The white is not white.** Sources have arrived at 254 and at 246, with only
  6.6 per cent of one of them at 249 or above, so a fixed pure white test finds
  almost nothing and every enclosed pocket ships opaque. The level is read off
  the image's own border.
- **One threshold is not enough.** Where bodywork meets the ground the white is
  shaded down - measured, to a median of 228 - so a strict flood leaves opaque
  crescents. A second, looser pass seeded from the strict result clears them and
  still cannot walk into the artwork, because it may only extend background that
  is already background.
- **The panel is not the flattest thing in the picture.** Finding it by local
  variance finds the FAIRING, which is large and smoothly shaded; that candidate
  filled 57 per cent of its own bounding box. A seeded colour flood comes back
  at 1.000, because the panel really is one flat rectangle.

The hole is narrowed to the dash's own 16:9 before it is punched - the panel is
drawn at 2.10 - so nothing is stretched. What is left over is a sliver of the
panel's own grey down each side, which reads as part of the instrument.

The script prints the rectangle it cut and compares it with `screen` in
`config/cockpit.js`, reporting `CONFIG_DISAGREES` if they have drifted. One
punches the alpha and the other places the dash; a comment asking for them to
match is not the same as checking it.

Output is capped at 2048 on the long side.

### Cockpit paint mask

| | |
|---|---|
| File | `public/sprites/cockpit-mask.png` |
| Source | `public/sprites/cockpit.png` - derived, not drawn |
| Built by | `tools/paint-mask.py` |
| Used by | `src/player/cockpit/paint.js` |

Three single channel masks packed into one RGB texture: **R** the painted
bodywork (fairing, tank, nose panels, frame block, fuel cap), **G** the rim
light on that bodywork, **B** the windscreen. It is what lets one drawing be
four bikes.

    python tools/paint-mask.py
    python tools/paint-mask.py --debug     # and an overlay in tools/out/

**The mask is regional, not chromatic, and that is the whole design.** There is
no colour separation between the bike and the rider in this drawing: measured,
the fairing is RGB 34,36,51 at 0.43 saturation and the gloves are 38,49,61 at
0.45, and 87 per cent of every coloured pixel in the image sits between 180 and
225 degrees of hue. No threshold on hue, saturation or luminance can tell a
fairing from a glove. What separates them is the line art, which fully encloses
every part - so the mask comes from labelling the connected components of
everything that is not ink, exactly the way `cut-cockpit.py` already finds the
blank instrument panel.

**Only the seeds are authored**, one point per part, and each is the deepest
point inside its own region rather than its centroid: a centroid is only
guaranteed to be inside a convex shape, and the fairing is a horseshoe around
the dash while the tank has the filler cap punched out of its middle. The first
set of seeds were centroids and four of them missed, one landing on ink and one
inside the fuel cap.

The tool checks its own work and exits non-zero: every seed must land in a
region within 45 per cent of the size recorded beside it, no two seeds may claim
the same region, and eight EXCLUDED parts - both sleeves, both gloves, both
mirrors and both bars - are looked up and must not have been claimed. That last
check is the one that matters, because a mask which has leaked into a glove
paints the rider in the bike's colour and nobody would think to look.

The gloves keep their cyan piping on all four bikes. It is the same colour drawn
the same way as the bike's own, and it stays: the gloves are the rider, and the
rider does not change when the bike does.

## Removed

### WRAD ARMS - first person hands and forearms (removed)

CC0 rigged arms pack from https://wriks.itch.io/wrad-arms, retrieved
14 September 2026, carried at `public/models/wrad-arms.glb` until it was
dropped. Recorded here rather than deleted outright, so the next person to
reach for a hand model knows this was already tried and why it did not work.

It was a 1,200 triangle **first person shooter** arms pack, authored around a
rifle: one mesh holding both arms, 50 bones, posed onto the grip by this
project's own IK. Rendered side by side against the primitive hands it sat
beside the bar gripping nothing, with the grip and its ribs fully exposed.
Closing its fingers on a 26 mm tube needs per-finger IK against a cylinder plus
enough edge loops at the knuckles to bend, and it has neither.

Three more attempts followed it - a lofted single-mass fist, and a hand drawn
procedurally on a canvas - and the sprite above is what replaced all of them.
