# External assets

Everything in this project is generated at runtime. There are currently no
external assets.

The "no external assets" rule in CLAUDE.md carries an exception for character
and vehicle geometry. Nothing uses it today. If something does again, every
entry must name the source, the licence, the date it was taken and where the
file lives, and nothing goes in `public/` without a row here.

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

What replaced it is `player/rider/hands/GlovedFist.js` - one lofted closed mass
wrapped round the grip, with the knuckles as stations where the section swells.
The one thing the model offered over a well shaped fist is finger separation on
an OPEN hand, and this hand is never open.
