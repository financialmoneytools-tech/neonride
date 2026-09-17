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
    Roadside.js    # neon direkler/kenar şeritleri (InstancedMesh)
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

Rules:

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
