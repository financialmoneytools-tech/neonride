# NEON RIDE — Proje Kuralları

Birinci şahıs (FPS-POV) neon-galaktik motosiklet sürüş oyunu. Web tabanlı, Three.js + HTML5 Canvas.

## Product goal

Neon Ride is both a playable game and a footage generator. Two equal goals:

1. **Fun to play** - real speed sensation, traffic to weave through, obstacles.
2. **Beautiful to record** - the output will be posted as short-form video on
   YouTube and Instagram for marketing.

This means:

- Speed sensation is a core feature, not polish.
- The game must run and compose correctly in 9:16 vertical, not only 16:9.
- There must be a clean capture mode: HUD off, debug off, stable 60 fps,
  optional cinematic camera.
- Visual quality outranks feature count. A shot that looks spectacular is
  worth more than a mechanic nobody sees.

## Stack
- Vite (vanilla JS, framework yok)
- three (npm paketi, CDN değil)
- three/examples/jsm: EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, GLTFLoader
- Harici asset YOK. Tüm doku/gürültü/parçacık dokuları runtime'da canvas veya shader ile üretilecek.
  - **Exception**: external models are permitted for character and vehicle
    geometry only; road, sky and effects stay procedural. Every external file
    must be CC0 or CC-BY, must live under `public/models/`, and must be recorded
    in `ASSETS.md` with its source, licence and retrieval date. Bundled textures
    and materials are not used - loaded geometry is re-materialled with the
    project's own shaders so it matches the world.
- Node 18+

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

## Performans hedefi
- 1080p'de sabit 60 FPS, draw call < 120, aktif üçgen < 400k
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

- **Rigged GLTF hands and rider arms**, replacing the primitives. Needs an
  exception to the no-external-assets rule. The swap seam already exists:
  `createHands(anchor)` in `src/player/rider/Hands.js`, selected by
  `config.player.rider.hand.source`, aligned to `config.player.rider.anchors`.

- **Third-person camera mode** showing the whole bike and rider. Needs a full
  bike model - frame, seat, exhaust, rear wheel - and a rider body. Much bigger
  than the cockpit-only geometry that exists today, and it would also want the
  rear-view awareness the police pursuit item needs.

- **Multiple road themes** with different neon palettes and sky treatments.
