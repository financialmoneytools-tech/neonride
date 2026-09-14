# Models

External model files go here. Vite copies `public/` verbatim to the site root,
so a file at `public/models/x.glb` is fetched at runtime as `models/x.glb`.

Nothing in this folder is committed by accident: every file must be listed in
`ASSETS.md` at the repo root with its source, licence and retrieval date, and
must be CC0 or CC-BY. See the exception to the no-external-assets rule in
CLAUDE.md.

## Expected files

- `wrad-arms.glb` - first person hands and forearms. CC0, from
  https://wriks.itch.io/wrad-arms. Committed, because CC0 allows it and a clone
  should not need a manual download step to look right.

  If it is ever missing, the rider falls back to the primitive hands and logs a
  warning rather than failing to boot.
