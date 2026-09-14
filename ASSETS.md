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
world instead of the pack's hand painted retro look. The loaded scene, its
material and its texture are all disposed once the geometry has been copied.

#### What is actually inside the file

Measured, because none of it is what the shop page implies:

- **One mesh**, `arms_mesh`, holding BOTH arms - not a single arm to mirror.
  1,196 triangles, 872 vertices, one material, one 512 x 512 texture.
- **Skinned**, 50 bones, with `wrist_ik` and `arm_target` helpers per side. It
  was authored to be driven by IK, not to be used in its rest pose.
- Axes: **+X right, +Y up, -Z forward**, which is exactly our grip anchor frame,
  so no rotation is needed to reconcile them.
- Bone names carry a `.r` / `.l` suffix. Note that three's GLTFLoader runs every
  node name through `PropertyBinding.sanitizeNodeName`, which strips dots, so
  `wrist.r` arrives in code as `wristr`.
- Scale: the bind pose gives three readings against real anatomy - upper arm
  0.103, forearm 0.112, hand 0.106 - so **0.11** is where they converge.

#### The catch, and what is done about it

The rest pose is a splayed, flat, open hand with the arms spread. At life size
the wrists sit **1.03 m apart** while our handlebar is **0.67 m**. That cannot
be reconciled by scaling - matching the bar gives child sized hands - and no
placement makes straight fingers grip.

So the skeleton is posed at load and the result baked: see
`src/player/rider/hands/poseArm.js`. The clavicle is aimed, two bone IK puts the
wrist on the bar, the hand is rolled so the fingers lie across it rather than
along it, and the fingers are curled about the grip axis until their tips sit
just outside the tube. Measured after: the hollow of the closed hand sits **3 mm**
from the grip, and every fingertip lands within **1.32 to 1.37** grip radii of
the axis against a target of 1.35.

The whole arm is kept, not a stub. Posed, the shoulder ends up behind the camera
near plane, so the arm runs off the bottom of the frame and reads as attached to
a rider - which is the thing the primitive hands could never do.
