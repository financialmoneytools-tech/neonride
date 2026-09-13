# NEON RIDE — Proje Kuralları

Birinci şahıs (FPS-POV) neon-galaktik motosiklet sürüş oyunu. Web tabanlı, Three.js + HTML5 Canvas.

## Stack
- Vite (vanilla JS, framework yok)
- three (npm paketi, CDN değil)
- three/examples/jsm: EffectComposer, RenderPass, UnrealBloomPass
- Harici asset YOK. Tüm doku/gürültü/parçacık dokuları runtime'da canvas veya shader ile üretilecek.
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
- Kod yorumları Türkçe, değişken/fonksiyon isimleri İngilizce.
