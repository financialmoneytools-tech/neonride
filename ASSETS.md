# External assets

Almost everything in this project is generated at runtime. What is not is listed
here. Every entry names the source, the licence, the date it was taken and where
the file lives, and nothing goes in `public/` without a row.

## Sprites

### Gloved hands on the bars

| | |
|---|---|
| Files | `public/sprites/glove-right.png`, `glove-right-brake.png`, `glove-left.png` |
| Sources | the same three names under `art/sprites/` |
| Retrieved | 15 September 2026 |
| Used by | `src/player/rider/hands/SpriteHands.js` |

Hands in black leather racing gloves closed on the bars, seen from the rider's
eyes, drawn with a cyan rim down one edge and magenta down the other - the same
pair the road edge lines use. Each image carries the grip, the bar end, the
lever and the switch block along with the hand, and that is the point: the join
between a 2D hand and a 3D bar is what would give the trick away, and there is
no join if the bar ends inside the picture. The 3D grip, lever and bar end are
no longer built.

ONE IMAGE PER HAND. An earlier pass used a single image mirrored, which is
geometrically what a left hand is; these two are not each other's reflection,
so each gets its own texture.

Sources live in `art/` and are not shipped. `tools/key-sprite.py` turns each one
into the RGBA PNG the game loads:

    python tools/key-sprite.py art/sprites/glove-left.png public/sprites/glove-left.png
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
left is the one that belongs - the forearm at the bottom, which genuinely does
leave the picture and should go into shadow rather than stop on a cut.

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
