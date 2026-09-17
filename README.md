# Neon Ride

A first-person neon motorcycle ride. Web, Vite + vanilla JavaScript +
three@0.186.0, no framework.

Two goals, equal weight:

1. **Fun to play** - real speed sensation, traffic to weave through.
2. **Beautiful to record** - the output is posted as short-form video, so
   anything that hurts a recording is a bug even when the game plays fine.

Landscape only. Portrait gets a "turn the phone" gate; the cockpit is one drawn
image built for a wide frame, and a portrait version would be a different
composition rather than a narrower one.

Every texture is generated at runtime and all audio is synthesised. The single
exception is the cockpit sprite, which is a drawn image committed together with
the script that prepares it - see `ASSETS.md`.

## Running it

```
npm install
npm run dev          # http://localhost:5173
npm run build
npm run preview
```

On a phone, DeviceOrientation needs HTTPS:

```
npm run dev:phone    # self-signed cert, https://<your-lan-ip>:5173
npm run dev:tunnel   # a Cloudflare quick tunnel, for a trusted certificate
```

## Checks

```
npm run smoke                  # drives a real browser in a phone profile
node tools/measure-cockpit.mjs # cockpit framing, asserted at 16:9, 2:1 and 21:9
npm run build
```

## Controls

Desktop is the keyboard: `A` / `D` or the arrows steer, `W` or up is the
throttle, `S`, down or space is the brake. One-shot keys: `H` stats overlay,
`Escape` pause, `R` reduced motion, `T` road theme, `C` capture mode, `V` camera
profile, `Q` quality preset, `F` fullscreen, `M` mute. Typing G-O-D arms the
self-driving capture mode.

On a phone there are two modes, switchable in the pause card and remembered:
**tilt** (the default) steers from the accelerometer with the angle you are
already holding the phone at as neutral, and **touch** steers with the left
thumb. Gas and brake stay on screen in both.

Some settings can be set from the URL, which is how the game is tested on a
phone with no keyboard: `?stats=1`, `?god=1`, `?theme=<name>`.

## Where things are

| | |
|---|---|
| `CLAUDE.md` | project rules, including the standing motion-comfort requirement |
| `STATUS.md` | current state, open issues, and the contracts the tools assert |
| `BUILD-PLAN.md` | the phase plan |
| `ASSETS.md` | every external image and the script that prepares it |
| `docs/THEMES.md` | road themes: the concept and the technical plan |
| `src/config.js` | the only configuration import; sections live in `src/config/` |
| `tools/` | measuring and screenshot tools - none of them guess |
