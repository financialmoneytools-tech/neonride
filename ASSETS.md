# External assets

Almost everything in this project is generated at runtime. What is not is listed
here. Every entry names the source, the licence, the date it was taken and where
the file lives, and nothing goes in `public/` without a row.

## Sprites

### Gloved hand on a grip

| | |
|---|---|
| File | `public/sprites/glove-right.png` |
| Source | `public/sprites/glove-right.jpg`, generated to order for this project |
| Retrieved | 15 September 2026 |
| Used by | `src/player/rider/hands/SpriteHands.js` |

A right hand in a black leather racing glove closed on a bar grip, drawn with a
cyan rim down its inboard edge and magenta down its outboard one, which is the
same pair the road edge lines use. The image carries the grip, the bar end
weight, the brake lever and the switch block along with the hand, and that is
the point: the join between a 2D hand and a 3D bar is what would give the trick
away, and there is no join if the bar ends inside the picture. The 3D grip,
lever and bar end are no longer built.

ONE image serves both hands. The left is the same texture with the plane flipped
in x, which is what a left hand is.

The source is a JPEG on flat white. `tools/key-sprite.py` turns it into the RGBA
PNG the game loads: a flood fill from the borders finds the background, enclosed
white pockets - the gap between the lever and the fingers - are found
separately, the anti aliased edge is recovered from luminance and unpremultiplied
so no white halo survives, the result is cropped to what is drawn, resized to
1024 on its long side, and the last ninth of the sleeve is faded out so it ends
in shadow rather than on a cut. Run it again if the source is redrawn:

    python tools/key-sprite.py public/sprites/glove-right.jpg

The JPEG is kept as the source of record. Only the PNG is fetched at runtime.

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
