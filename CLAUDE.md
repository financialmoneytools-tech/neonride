# NEON RIDE — Proje Kuralları

Birinci şahıs (FPS-POV) neon-galaktik motosiklet sürüş oyunu. Web tabanlı, Three.js + HTML5 Canvas.

## Product goal

Neon Ride is both a playable game and a footage generator. Two equal goals:

1. **Fun to play** - real speed sensation, traffic to weave through, obstacles.
2. **Beautiful to record** - the output will be posted as short-form video on
   YouTube and Instagram for marketing.

This means:

- Speed sensation is a core feature, not polish.
- The game is LANDSCAPE ONLY. It was going to be both, and 9:16 was dropped
  once the cockpit became one drawn image: the sprite, the road framing and the
  touch controls are all built for a wide frame, and a portrait version is a
  different composition rather than a narrower one. Portrait gets a "turn the
  phone" gate - see config/orientation.js.
- There must be a clean capture mode: HUD off, debug off, stable 60 fps,
  optional cinematic camera.
- Visual quality outranks feature count. A shot that looks spectacular is
  worth more than a mechanic nobody sees.

## Stack
- Vite (vanilla JS, framework yok)
- three (npm paketi, CDN değil)
- three/examples/jsm: EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, GLTFLoader
- Harici asset YOK. Tüm doku/gürültü/parçacık dokuları runtime'da canvas veya shader ile üretilecek.
  - **Exception**: the rider's hands. They are a sprite - one drawn image under
    `public/sprites/`, recorded in `ASSETS.md` with its source and date. Six
    attempts at generating them (primitives, a rigged GLB, a lofted fist, a
    canvas painting) are in the history and none read as a hand; a first person
    hand barely rotates, so the projection is the only thing that matters and a
    sprite IS the projection. Road, sky, effects and every other texture stay
    procedural.
  - Any external image is committed together with the script that prepares it,
    so the step from source to shipped file is repeatable rather than a
    remembered manual edit. See `tools/key-sprite.py`.
- Node 18+

> Ses tamamen sentezlenmiş (Web Audio), örnek dosya yok - sebebi
> `config/audio.js` başında yazılı.

> Not: Bu proje Next.js DEĞİL. Supabase / API route / `force-dynamic` kuralları burada geçersiz.

## Mimari — dosya sorumlulukları
Her dosya tek işten sorumlu. 300 satırı geçen dosya bölünür.

```
src/
  main.js          # bootstrap: renderer, composer, tek animasyon döngüsü
  core/
    Engine.js      # scene/camera/renderer/composer kurulumu + resize + dispose
    Loop.js        # delta-time yönetimi, sabit fizik adımı, FPS ölçümü
    Input.js       # klavye + touch + gamepad -> { steer, throttle, brake }
    Device.js      # cihaz tespiti + kalite preset'ini config'e uygular
    Viewport.js    # gercek kare boyutu (visualViewport) + fullscreen
  world/
    Sky.js         # gradient skydome shader + yıldız alanı + nebula katmanları
    Road.js        # sonsuz yol: spline chunk üretimi + geri dönüşüm havuzu
    road/layout.js # otoyolun enkesiti, METRE cinsinden - tek kaynak
    Roadside.js    # neon direkler/kenar şeritleri (InstancedMesh)
    Median.js      # orta bariyer, yol chunk'lariyla havuzlanir
    Oncoming.js    # karsi seritteki farlar - SADECE dekor, carpisma yok
    Scenery.js     # yol kenari nesneleri, tema yogunluk verir
    Weather.js     # kar/yagmur/toz, tek sarmalanan tampon
    Traffic.js     # oynayanin carpabilecegi tum araclar
    Mountains.js   # uzak dağ siluetleri (düşük poly, fog içinde erir)
  player/
    Rider.js       # eller + gidon (primitiflerden), kameraya child olarak bağlı
    BikePhysics.js # hız, yanal kayma, lean açısı, kamera bobbing
  fx/
    Postprocess.js # bloom + vignette + hafif chromatic aberration
  utils/
    rng.js         # seed'li rastgelelik
    noise.js       # simplex/value noise (kendi implementasyonu)
```

## Kritik teknik kurallar
1. **Tek animasyon döngüsü.** Sadece `renderer.setAnimationLoop(...)` kullan. Hiçbir modül kendi `requestAnimationFrame`'ini açmaz. Modüller yalnızca `update(dt, state)` metodu sunar.
2. **Delta-time zorunlu.** Hiçbir yerde frame'e bağlı sabit artış yok. `dt` her karede `Math.min(clock.getDelta(), 0.05)` ile sınırlanır (sekme arkaplana alınınca patlamasın).
3. **Vite HMR güvenliği.** Her modülde `dispose()` olacak; `main.js` içinde `import.meta.hot?.dispose(() => engine.dispose())`. Aksi halde hot reload'da üst üste sahne birikir ve FPS çöker.
4. **Bellek disiplini.** Chunk geri dönüşümü: yeni geometri yaratma, havuzdan al ve yeniden konumlandır. `new THREE.*Geometry` çağrısı yalnızca init aşamasında olur, döngü içinde asla.
5. **Regex içeren string'lerde** template literal yerine `array.join('')` yöntemi kullanılır.
6. **Shader'lar** ayrı `.glsl` dosyası değil, ilgili modül içinde string sabit olarak tutulur (build basit kalsın).
7. `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — üstü performans katili.
8. Bloom composer yarı çözünürlükte çalışır.
9. `THREE.CapsuleGeometry` KULLANMA — Cylinder + Sphere kombinasyonu kullan.
10. Tüm sayısal ayarlar (hız, bobbing genliği, bloom strength, fog yoğunluğu) `src/config.js` içinde tek yerde toplanır.

## Mobil
- YALNIZCA YATAY. Dikey tamamen birakildi: kokpit tek bir cizim ve 16:9 icin
  yapildi, yol cerceveleme ve dokunmatik kontroller de oyle. Dikeyde oyun
  baslamaz, "telefonu yan cevir" karti cikar ve kosu duraklatilir -
  `config/orientation.js` ve `core/Orientation.js`.
- Tam ekran ilk dokunusta istenir, ekran yonu kilidi de onunla birlikte -
  cogu tarayici kilidi reddeder, karti asil uygulayan sey odur.
- Yol dort seritli bir otoyol. Her yanal konum `world/road/layout.js`'ten
  tureler; hicbir modul kendi metre degerini yazmaz.
- Dokunmatik kontrol ekranin ALT SERIDINDE: sol alt kose sola, sag alt kose
  saga, ikisi birden fren. Ust yariya dokunmak gaz verir ama direksiyon
  cevirmez - telefonu tutan el yanlislikla yon vermesin diye.
- Adres cubugu acilip kapanirken boyut degisimi `Viewport.js` tarafindan
  `visualViewport` uzerinden okunur, debounce edilir ve kucuk degisimler
  yok sayilir. Cihaz dondurulunce debounce atlanir.
- Kalite preset'leri `config/device.js` icinde. `auto` dokunmatik + kucuk ekran
  gorurse telefon kabul eder. Preset'in degistirdigi seylerin cogu insaat
  aninda okundugu icin `Device` her seyden ONCE calisir.

## Kayit modu (gizli)
- Kendi kendine suren mod pazarlama videosu icin var. UI yok, ipucu yok.
  Aciliyor: G-O-D tus dizisi, ya da konsoldan `neonRide.god(true)`.
- Acilinca capture modunu da acar: overlay kapali, pixel ratio sabit.
- Oyuncu ile AYNI girdi uzerinden surer (steer/throttle/brake). Bisikleti,
  kamerayi, fizigi hic elleme - "kamera ray uzerinde" gibi gorunmemesinin ve
  hicbir seyle senkronunun kaymamasinin sebebi bu.
- Olculen (10 dakika, 60 Hz): 0 carpisma, azami hizin %98'i, dakikada ~1 near
  miss. Ayar noktalari ve olculen bedelleri `config/autopilot.js` icinde yazili.

## Motion comfort - standing requirement

Bu bir kerelik düzeltme değil, sürekli bir gereklilik. Someone was made
nauseous by the scrolling centre strips, and that is a bug class, not an
incident: **every new theme and every new camera profile must be checked
against it before it ships.**

What causes it here, in the order that matters:

1. **Motion through the centre of vision.** The eye tries to track it and
   cannot. The default theme's strips scroll at 1.45x road speed directly under
   the cluster. Peripheral motion - pylons, edge lines - is fine and is where
   speed cues belong.
2. **Camera bob.** ~2 Hz vertical oscillation sits close to where the
   vestibular system is most sensitive, and it disagrees with an inner ear
   reporting somebody sitting still.
3. **Field of view ramp.** A fov that opens under acceleration is a strong
   speed cue and a strong trigger, and the one nobody thinks to name.
4. **Speed shake.** Small, fast, unpredictable; the hardest to ignore.

5. **Sustained brightness.** Not a flash and not motion: a frame that is
   uniformly bright or hazed with glow is tiring to look at for ten minutes at
   220 km/h, which is the length of a real session and the length of a
   recording. The edge lines were reported as "wide white-hot bands along both
   shoulders" THREE TIMES before this was written down as a rule rather than
   treated as a taste argument.

Rules:

- **The road reads in a fixed order: surface and traffic first, lane markings
  second, neon last.** `npm run phone` asserts it, on a 740x320 frame at a
  device pixel ratio of 3 - the phone's own frame, not a desktop capture.
  Nothing neon may be wider or brighter than the lane markings.
- **Every lit thing on the road is a THREAD.** Neon edge lines at most 0.0375 m
  wide with a halo reach - `width * glow` - of at most 0.10 m; neon strips at
  most 0.12 m wide with a reach of at most 0.25 m; lane paint at most 0.14 m.
  Every neon intensity stays at or under 0.45, which is under
  `postprocess.bloom.threshold`, so neon contributes nothing to the bloom pass.
  A brightness RATIO alone is not enough and was tried twice: a band merely
  dimmer than a tail light is still a band, so the geometry is asserted
  directly.
- **`road.edges` and `road.strips` are different objects and they look the
  same.** The edges are two thin lines on the carriageway edges; the strips are
  four flowing neon lanes that often share a colour with the edge beside them.
  The band on the shoulder was reported four times and narrowed on the wrong
  object three times, because the check - the old `npm run bright` - ablated
  only the edges and passed while the strips were never measured. **A check
  that isolates one element must ablate ALL of them**, which is what
  `tools/phone-probe.mjs` does and why `tools/brightness-check.mjs` is gone.
- **Measure on the phone's frame, and never through god mode alone.** God mode
  turns on capture mode, and capture mode pins the pixel ratio to
  `config/capture.js`'s value of 1, so every capture taken under `?god=1`
  renders at a different resolution from the device it is meant to represent.
  Bloom makes this worse rather than neutral: it renders at half the drawing
  buffer, so on a phone it is upscaled by six against a desktop capture's two,
  and anything clearing the bloom threshold spreads three times further across
  the phone's frame. `phone-probe` restores the real ratio before measuring.
- `config/comfort.js` owns the reduced motion scales. Anything new that moves
  the camera or scrolls a pattern **must go through `motionScale()`** in
  `core/Comfort.js`, not read its amplitude straight from config.
- The toggle must stay reachable in **two taps** - it lives on the title card
  and in the pause panel. Someone reaching for it already feels unwell; a
  settings tree is not an acceptable answer.
- It must take effect **mid-run**. That is why motion comfort is not a theme:
  "restart for this to take effect" is not an answer either.
- `prefers-reduced-motion` is honoured on first load. A stored choice beats it
  from then on, so turning it back OFF sticks.
- A new **theme** must say where its motion lives. If it puts anything moving in
  the centre of the road, there has to be a variant that does not - the way
  `openRoad` is the variant for `neonHighway`.
- A new **camera profile** must be checked with reduced motion both on and off.
  The cinematic profile raises the eye and pitches down, which changes how much
  of the frame the road fills and therefore how much optic flow there is.
- Never make the comfortable option the boring one. `openRoad` loses the strips
  and pays for it with more pylons, because the strips are the cheapest speed
  cue in the project and a comfort option nobody picks helps nobody.

Measured, with the bike pinned so only the camera moves: reduced motion takes
the vertical swing from 0.0568 to 0.0134 units, the lateral from 0.0360 to
0.0057, the roll from 0.0262 to 0.0068 rad, and the strip scroll rate to an
eighth.

## The staged run

Every run can now have an end. `KOŞU` is a ROAD - ten levels of five
kilometres, each with a lit gate every kilometre, a finish line, a time and a
medal - and `SONSUZ` is the original ride-until-you-crash and still owns the
high score. The mode is the FIRST choice: title -> mode -> bike -> road ->
level -> run, and the level screen appears in staged mode only.

Everything below describes ONE level, which is what `game/Stage.js` still
measures. See "Levels - ten to a road" for the ten of them.

- `config/stage.js` owns the length, the checkpoint spacing and the medals.
  **Medal thresholds are multiples of a MEASURED reference time, never absolute
  seconds.** `npm run stage` re-measures it - autopilot, full length, no
  collisions - and FAILS if the configured value has drifted more than 15 per
  cent, so a change to top speed or traffic density cannot quietly make gold
  unreachable. Measured 2026-09-19 over three runs: 26.14, 26.17 and 26.90 s
  for 5000 units; the spread is the traffic. `referenceSeconds` is 26.3.
  Gold is 1.02 of it and silver 1.15 - 26.8 s and 30.2 s. Gold is set
  ALONGSIDE the machine, not behind it, because the autopilot is not the
  floor: the same bike over an empty five kilometres takes 23.15 s, so the
  bot's time is thirteen per cent of headroom that a rider who threads
  traffic instead of lifting for it can take. The measurement is read off the
  GAME clock, the one the stage keeps, never `performance.now()`.
- **The HUD shows PROGRESS, not a running total**: `2134 / 5000 M` and the
  clock, and that is the only distance on the screen during a stage. It used
  to show `KALAN 2866 M` above the run's own total of `2134 M` - two
  distances counting opposite ways, neither saying how long the stage was.
  The running total belongs to `SONSUZ`, where it is the result.
- `game/Stage.js` owns progress and nothing else - no geometry, no camera. The
  gates are `world/ThemeGate.js` with a tint, armed at an ABSOLUTE distance so
  the fourth gate is at four kilometres rather than near it.
- **Checkpoints do not restore anything.** No extra life, no extra time. A
  stage whose checkpoints hand back resources turns the last kilometre into the
  only one that counts, and the point of five kilometres is that all five do.
- **God mode ignores the whole thing.** Its phase is `free`, never `running`,
  so a recording has no checkpoints, no finish line and no stage clock in it.
- The old game over panel is RETIRED. `ui/Results.js` owns both endings -
  reaching the line and losing the third life - because two endings with two
  cards is two places to keep one look consistent.
- A stage is driven to a real finish by `npm run stage` and by `npm run smoke`,
  both with the same hook: a SHORT stage, not a simulated one. `stage.length`
  is what drives the finish, so a 400 metre stage runs the real gates, clock,
  counter and card. Calling `session._finish()` would prove the method works
  and nothing about whether anything reaches it.

## Levels - ten to a road

A road is ten levels of 5 km, ridden continuously. `KOŞU` means the whole
road; `SONSUZ` has no levels and is otherwise unchanged.

- **A level boundary is not an ending.** The phase stays `running`, the loop is
  never paused, no card appears and the bike is not touched. A gate lights, a
  banner says `SEVİYE 2`, a life comes back and the traffic re-tunes. That is
  the requirement, not a simplification - `npm run stage` asserts the phase is
  still `running` on the frame the level changes.
- **Lives: one back per level, capped at three.** Not a refill. A refill would
  mean the only level that can end a run is the one you are on.
- `config/levels.js` owns the curve, as ten explicit rows rather than a
  formula, so one level can be nudged without moving nine others.
- **`referenceSeconds` is ten measured times, one per level**, and
  `npm run levels` re-measures them and fails on more than 15 per cent drift.
  One shared reference would make late gold unreachable and early gold free.
- **The total and the medal tally are written only for an unbroken 1→10 run.**
  Levels are replayable from the highest REACHED (recorded on entry, so dying
  on level eight still unlocks practising it), because ten levels is five or
  six minutes and re-riding forty proven kilometres is not a punishment
  anybody learns from. Protecting the total directly is what makes replay safe.
- **God mode still never sees any of it.** Its phase is `free`, so
  `state.level` is zero and the traffic falls back to the god model.

### The fairness floor, and what measuring it turned up

`escape.maxAbreast`, `escape.trucksAbreast`, `escape.window` and `gap.base` are
IDENTICAL at every level. `escape.window` in particular is not a difficulty
knob: shrinking it lets two staggered pairs block all four lanes across 45 m,
which at 200 m/s is 0.22 s apart.

Measuring that floor found a defect that had been shipped since the traffic was
written. **`_admits` was a PLACEMENT filter, not an invariant** - it ran once
when a vehicle respawned and nothing maintained spacing afterwards, so
same-lane vehicles closed at their speed difference until they were inside each
other. Measured in endless mode with no levels in the build: **2400 overlapping
pairs over 721 frames, worst edge gap −10.7 m.**

It mattered far more than it looked, and this is the part to remember:
**because spacing decayed, `speedSpread` was secretly a knob about how fast the
road turned into a wall.** A level at a LOWER density than endless measured six
times more crowded, and levels five to nine left the rider with all four lanes
blocked inside their own reaction distance on up to a quarter of frames.

`config/traffic.js` → `follow` is the fix: a follower clamps its speed to keep
its distance, resolved **front to back** so each leader is final before the
vehicle behind it is asked to follow. Walking the queue forwards instead still
left 0.1 to 2.1 overlapping pairs a frame. It is the shared model and it
changes SONSUZ too - an invariant that holds in one mode is not one.

**`npm run spacing` is the permanent guard and it has ZERO tolerance.** One
overlapping pair anywhere fails the run - not a rate, not a threshold. It
sweeps both modes at every level on every road with the density ramp switched
off, so each level runs at full difficulty from the first metre. A tolerance
is how a defect like this survives: it gets set just above whatever the
current number is, and then the number grows into it. This check is worth more
than the difficulty curve, because the curve is a thing somebody chose and
this is a thing nobody noticed for the entire life of the project.

`npm run levels` is the deep version: a real ten level run per road, asserting
nobody is ever trapped, no level crowds the road more than endless already
does, and zero overlapping pairs. It measures its own endless control in the
same session with the density pinned at its cap, so the comparison stays true
as the shared model changes.

## Units - one metre, one second, and the dial converts

A world unit is a METRE. `config/road.js` is written in metres, a lane is 3.8
of them and a car is 4.5 long, and `stage.length` of 5000 is five kilometres.
Speeds carried on the loop state - `state.speed`, `maxSpeed`, every per-bike
terminal speed - are therefore METRES PER SECOND, and the clocks are seconds
of GAME time accumulated from `dt`, never wall clock.

**Only the display converts.** The dash reads km/h, so
`player/rider/Instruments.js` multiplies by
`config.player.rider.instruments.speed.toKmh` at the one point the value
enters the face, and the stats overlay prints both units side by side.
Nothing else scales anything; the physics is untouched.

For a long time the dash printed `state.speed` raw under a `KM/S` label, and
the three numbers a player can see stopped agreeing: a 5 km stage finished in
28.0 s with the dial reading 146. Distance and clock were both right. The
label was wrong twice over - wrong unit, and KM/S is kilometres per SECOND
anyway. It reads **KM/SA** now and the numbers are large: 825 km/h for VOLT,
785 NOVA, 845 EMBER, 805 FROST, quantised to the 5 the face steps in so a
steady cruise does not re-upload the texture every frame.

`npm run stage` asserts the three agree at the finish - the finish fires at
the stage length, the average speed is one the bike can physically do and
matches the speed it was seen doing, the dial reads that speed in km/h, and
the HUD and overlay are showing the STAGE's metres rather than the lifetime
odometer. `state.distance` is that odometer: it starts at `startDistance` and
counts up for the whole page session across every run, which is why the
overlay calls it `odo` and prints the stage on its own line.

## Performans hedefi
- 1080p'de sabit 60 FPS, draw call < 120, aktif üçgen < 400k
- Orta seviye telefonda 30 FPS'in altina dusmemek (preset: low)
- Her fazın sonunda ekranın köşesinde FPS + draw call sayacı görünür (config'den kapatılabilir)

## Görsel yön (referans görsellerden)
- Gökyüzü: derin siyah–lacivert taban, üstte mora dönen gradient
- Yıldızlar: beyaz/altın/buz mavisi, kavisli izler halinde akan katmanlar (galaktik katman hissi)
- Nebula: kızıl-magenta ve turkuaz bulut kütleleri, additive blending, düşük opaklık
- Yol: asfalt neredeyse siyah, üzerinde akan çok renkli neon şeritler (magenta / cyan / yeşil / turuncu)
- Yol kenarı: cyan ve magenta emissive çizgiler, ritmik direkler
- Ufuk: aurora benzeri yeşil-mor perde + sıcak turuncu bir alt katman
- Genel his: yüksek kontrast, koyu zeminde parlayan renkler, bloom belirgin ama yazıyı okunmaz yapmayacak kadar

## Çalışma şekli
- **DOGRUDAN `main`'e commit at. Yan dal (branch) ACMA.** Bu tek kisilik bir
  proje ve iki dizustu arasinda gidip geliyor; yan dallar sadece ayak bagi
  oluyor. Ajanin "varsayilan dalda isen once branch ac" seklindeki genel
  davranisi BU PROJEDE GECERSIZDIR - bu kural onu ezer. Kullanici aksini
  soylemedikce her commit dogrudan `main` uzerine gider.
- **Her commit'ten sonra PUSH et.** Ayni sebep: is iki dizustu arasinda gidip
  geliyor ve sadece yerelde duran bir commit, diger makine icin hic yok
  demektir. Kullanici ayrica istemesine gerek yok; commit bitti demek
  `git push` bitti demek.
- Her faz ayrı commit: `feat(phase-N): ...`
- Bir faz bitmeden sonrakine geçme. Faz sonunda `npm run dev` ile çalıştığını ve kabul kriterlerinin geçtiğini doğrula.
- Dosya değişikliği verirken tam dosya içeriği ver, parça diff verme.
- Tüm kod tamamen İngilizce: yorumlar, değişken/fonksiyon isimleri,
  commit mesajları, console log'ları ve JSDoc. Kaynak dosyalarda ASCII dışı
  karakter kullanma. Kullanıcıya gösterilen arayüz metinleri (HUD, başlangıç
  ekranı) bu kuralın dışında, onlar Türkçe kalacak.

## Backlog - not scheduled yet

- **Police / chaser pursuit**: AI vehicles that follow the player from behind with
  red-blue flashing lights. Strong visual for short-form video - the reflections
  on the road and the light wash on the rider would carry a clip on their own.
  Requires: rear-view awareness, chase AI, emissive flashing lights, possibly
  a rear-view mirror render.

- **Third-person camera mode** showing the whole bike and rider. Needs a full
  bike model - frame, seat, exhaust, rear wheel - and a rider body. Much bigger
  than the cockpit-only geometry that exists today, and it would also want the
  rear-view awareness the police pursuit item needs.

- **Multiple road themes** with different neon palettes and sky treatments.

- **Multiple bike models the player can choose.** Needs the bike geometry behind
  a factory the way the hands already are, plus somewhere to choose from.

- **Multiple maps, each with its own identity.** Not just a palette swap: every
  map needs its own sky treatment, road palette and roadside geometry.
  - Night forest road, neon stars overhead.
  - A route under the Northern Lights.
  - More to follow.
