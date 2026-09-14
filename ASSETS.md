# External assets

Everything in this project is generated at runtime except the models listed
here. See the "no external assets" rule in CLAUDE.md and the exception it
carries.

Every entry must name the source, the licence, the date it was taken and where
the file lives. Nothing goes in `public/` without a row here.

## Models

### WRAD ARMS - first person hands and forearms

| | |
|---|---|
| Source | https://wriks.itch.io/wrad-arms |
| Author | wriks |
| Licence | **Creative Commons Zero v1.0 Universal (CC0)** |
| Attribution | Not required. Page states "No attribution required. Completely free, forever." |
| Commercial use | Permitted |
| Archive | `WRAD_ARMS.zip`, 1.9 MB, uploaded 21 April 2026 |
| Formats in archive | GLB, FBX, OBJ |
| Triangles | 1,200 |
| Texture | 512 x 512, two skin variants |
| Rigged | Yes, IK armature |
| Retrieved | 14 September 2026 |
| Lands at | `public/models/wrad-arms.glb` |

The bundled texture is NOT used. The geometry is re-materialled with the
project's own rider shader - dark glove, neon rim - so the hands match the
world instead of the pack's hand painted retro look.
