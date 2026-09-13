# NEON RIDE — Claude Code Faz Planı

Aşağıdaki blokları **sırayla**, açtığın Claude Code oturumuna (proje dizini: `neon-ride`) yapıştır.
Bir faz yeşil olmadan sonrakine geçme. Her faz sonunda `npm run dev` ile tarayıcıda kontrol et.

---

## FAZ 1 — İskelet ve döngü

```
CLAUDE.md'yi oku ve ona uy.

Faz 1'i yap: proje iskeleti ve render döngüsü.

- Vite vanilla JS projesi olarak yapılandır, three'yi npm'den kur.
- src/core/Engine.js: scene, PerspectiveCamera (fov 75, near 0.1, far 2000),
  WebGLRenderer (antialias true, pixelRatio max 2), resize handler, dispose().
- src/core/Loop.js: setAnimationLoop tabanlı tek döngü, dt clamp 0.05,
  update listener kaydı (add/remove), FPS + drawcall ölçümü.
- src/core/Input.js: WASD + ok tuşları + touch (sol/sağ yarı ekran) + gamepad,
  çıktı { steer: -1..1, throttle: 0..1, brake: 0..1 }, smoothing uygulanmış.
- src/config.js: tüm sayısal ayarlar burada.
- Sol üstte FPS / drawcall / üçgen sayacı overlay (HTML, config ile kapatılabilir).
- Sahnede geçici bir referans grid ve dönen bir küp olsun.

Kabul kriteri: npm run dev çalışıyor, sabit 60 FPS, tarayıcı konsolu temiz,
hot reload sonrası FPS düşmüyor ve sahne birikmiyor.
```

---

## FAZ 2 — Galaktik gökyüzü

```
Faz 2: gökyüzü. Geçici grid ve küpü kaldır.

src/world/Sky.js oluştur:
- Ters çevrilmiş dev küre (radius 1500, BackSide) üzerinde custom ShaderMaterial:
  dikey gradient, taban #05030f, orta #120a33, üst #2a1160. Fog'dan etkilenmesin.
- Yıldız alanı: 3 katmanlı Points (toplam ~12000). Katmanlar farklı boyut ve
  parallax hızında. Renk paleti beyaz / altın / buz mavisi, AdditiveBlending,
  yuvarlak yıldız dokusu runtime'da canvas ile üretilsin (radial gradient).
- Galaktik katman: yıldızların bir kısmı düz dağılmasın; noise tabanlı kavisli
  bantlar halinde yoğunlaşsın (referans görsellerdeki akan yıldız izleri hissi).
- Nebula: 4-6 adet büyük Sprite/Plane, canvas'ta üretilen yumuşak noise dokusu,
  kızıl-magenta ve turkuaz, opacity 0.15-0.35, AdditiveBlending, depthWrite false.
- Ufuk çizgisinde aurora perdesi: shader ile dikey dalgalanan yeşil-mor bant.
- Sky.update(dt) ile yıldızlar çok yavaş dönsün, nebula hafifçe nefes alsın.

Kabul kriteri: kamera etrafında dikiş/ek yeri görünmüyor, 60 FPS korunuyor,
gökyüzü tek başına bile "durup bakılır" görünüyor.
```

---

## FAZ 3 — Sonsuz yol

```
Faz 3: sonsuz yol sistemi. Bu fazın kalbi performans.

src/world/Road.js:
- Yol, CatmullRomCurve3 tabanlı chunk'lardan oluşur. Her chunk ~200 birim.
- 8 chunk'lık havuz. Kamera bir chunk geçtiğinde en arkadaki havuza döner,
  yeni kontrol noktaları üretilerek öne eklenir. Döngü içinde yeni geometri YOK;
  mevcut BufferGeometry'nin position attribute'u güncellenir.
- Kavis üretimi seed'li noise ile: yumuşak S dönüşler, ara sıra uzun düzlük,
  hafif yükselti farkı. Asla keskin dönüş üretme.
- Yol yüzeyi: neredeyse siyah, hafif yansımalı. Üzerinde akan neon şeritler:
  UV offset'i zamanla kaydırılan emissive shader (magenta, cyan, yeşil, turuncu).
- Yol kenarları: iki emissive çizgi (cyan solda, magenta sağda), sabit parlaklık.

src/world/Roadside.js:
- Neon direkler InstancedMesh ile, chunk geri dönüşümüne bağlı.

src/world/Mountains.js:
- Uzakta düşük poly dağ siluetleri, koyu renk, fog içinde erisin.
- Fog: FogExp2, rengi gökyüzü tabanıyla uyumlu, chunk doğuşunu gizleyecek yoğunlukta.

Kamera şimdilik yol üzerinde sabit hızla ilerlesin.

Kabul kriteri: 5 dakika kesintisiz sürüşte FPS düşmüyor, bellek artmıyor
(Chrome Performance monitor'da JS heap düz), chunk ekleri görünmüyor.
```

---

## FAZ 4 — Sürücü: eller, gidon, bobbing

```
Faz 4: birinci şahıs sürücü görünümü.

src/player/Rider.js:
- Eller ve gidon SADECE primitiflerden kurulacak (Cylinder, Box, Sphere, Lathe).
  CapsuleGeometry kullanma. Harici model yok.
- Gidon: ortada gövde bağlantısı, iki yana uzanan borular, uçlarda grip'ler,
  fren kolları, ortada küçük bir neon gösterge paneli (hız + devir, canvas texture).
- Eller: basitleştirilmiş ama okunaklı — avuç + 4 parmak grubu + başparmak,
  grip'leri saracak şekilde konumlanmış. Koyu eldiven materyali, kenarlarında
  ince emissive neon şerit (sahneyle uyumlu olsun).
- Tüm grup kameraya child olarak bağlanır, ekranın alt kısmında durur.
- Motorun ön kısmı da görünsün: farın arkası, ayna sapları, ön çatal üstü.

src/player/BikePhysics.js:
- Hız, ivme, fren, yanal konum (yolda sağa/sola kayma), lean açısı.
- Kamera bobbing: hıza bağlı genlikte sinüs, dikey + çok hafif roll.
  Genlik config'den ayarlanabilir, varsayılan abartısız olsun (mide bulandırmasın).
- Direksiyon: steer girdisi gidonu döndürsün, eller gidonla birlikte gitsin,
  kamera hafifçe o yöne yatsın (max 8 derece roll), FOV hızla 75→88 arası artsın.

Kabul kriteri: eller gidondan kopmuyor, near plane'e girip kesilmiyor,
dönüşlerde hareket doğal, 60 FPS korunuyor.
```

---

## FAZ 5 — Post-process ve renk

```
Faz 5: görsel cila.

src/fx/Postprocess.js:
- EffectComposer + RenderPass + UnrealBloomPass (yarı çözünürlük).
  Başlangıç: strength 0.9, radius 0.5, threshold 0.75 — config'den ayarlanabilir.
- Hafif vignette + çok hafif chromatic aberration custom ShaderPass.
- ACESFilmicToneMapping, exposure config'den.
- Hıza bağlı motion hissi: hız arttıkça bloom strength ve chromatic aberration
  çok hafif artsın.

Kabul kriteri: neonlar parlıyor ama beyaza yanmıyor, gösterge paneli okunabiliyor,
bloom açıkken FPS hâlâ 60.
```

---

## FAZ 6 — Oyunlaştırma

```
Faz 6: oyun döngüsü.

- Hız kademeleri, gaz/fren, yolda kalma. Yol kenarından çıkınca yavaşlama +
  ekran kenarında kırmızı uyarı parlaması.
- Mesafe ve skor, üstte minimal HUD (canvas/HTML overlay, neon tipografi).
- Toplanabilir neon enerji halkaları: içinden geçince kısa boost + parlama efekti.
- Başlangıç ekranı (başlık + "Başlamak için tıkla / dokun") ve duraklat (ESC).
- Ses YOK — bu fazın kapsamı dışında.

Kabul kriteri: oyun baştan sona oynanabiliyor, duraklat/devam çalışıyor,
mobil dokunmatikte de sürülebiliyor.
```

---

## FAZ 7 — Optimizasyon ve build

```
Faz 7: bitiriş.

- Chrome Performance kaydı al, en pahalı 3 noktayı bul ve düzelt.
- Draw call'ları say, birleştirilebilecekleri InstancedMesh/merge ile azalt.
- Düşük performanslı cihazlar için config.qualityPreset: 'low' | 'medium' | 'high'
  (yıldız sayısı, bloom, pixelRatio, chunk mesafesi buna bağlansın).
  İlk açılışta 2 saniyelik FPS ölçümüyle otomatik seçilsin.
- npm run build çalışsın, dist/ boyutunu raporla.
- README.md yaz: çalıştırma, kontroller, config açıklamaları, bilinen sınırlar.

Kabul kriteri: production build sorunsuz, 1080p'de 60 FPS, konsol temiz.
```

---

## Sık karşılaşılan tıkanmalar ve hazır düzeltme promptları

**FPS düşüyorsa:**
```
FPS 60'ın altına düştü. Önce ölç, sonra düzelt: hangi update fonksiyonu kaç ms
sürüyor raporla. Tahminle değiştirme, ölçüm sonucunu paylaş ve öyle optimize et.
```

**Hot reload sonrası sahne birikiyorsa:**
```
HMR sonrası sahne birikiyor. CLAUDE.md kural 3'e göre tüm modüllere dispose()
ekle ve main.js'de import.meta.hot.dispose bağlantısını kur.
```

**Eller/gidon yanlış duruyorsa:**
```
Eller ve gidonun konumu bozuk. Rider grubunun pozisyon/rotasyon değerlerini
config.js'e taşı ve dev modunda lil-gui olmadan, klavye kısayollarıyla canlı
ayarlanabilir hale getir ki doğru değeri bulalım. Bulunca sabitleyip kaldıracağız.
```

**Yol dikişi görünüyorsa:**
```
Chunk birleşim noktalarında dikiş görünüyor. Chunk'lar arası teğet sürekliliğini
(C1 continuity) garanti et: yeni chunk'ın ilk kontrol noktası öncekinin son
teğetini takip etsin. Ayrıca fog yoğunluğunu doğuş mesafesine göre ayarla.
```
