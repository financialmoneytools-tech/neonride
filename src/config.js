/**
 * NEON RIDE — merkezi ayar dosyasi.
 * Kural: projedeki TUM sayisal ayarlar burada toplanir.
 * Hicbir modul kendi icinde "sihirli sayi" tutmaz.
 */
export const config = {
  // --- Render katmani ---
  renderer: {
    antialias: true,
    maxPixelRatio: 2, // ustu performans katili
    powerPreference: 'high-performance',
    clearColor: 0x05030f, // gokyuzu tabani ile uyumlu koyu lacivert-siyah
    toneMappingExposure: 1.0,
  },

  // --- Kamera ---
  camera: {
    fov: 75,
    near: 0.1,
    far: 2000,
    position: { x: 0, y: 2.2, z: 6 }, // gecici: Faz 4'te surucu konumu devralacak
    lookAt: { x: 0, y: 1.0, z: 0 },
  },

  // --- Ana dongu ---
  loop: {
    maxDelta: 0.05, // sekme arkaplana alininca dt patlamasin
  },

  // --- Olcum overlay'i ---
  stats: {
    enabled: true, // false yapinca overlay hic olusturulmaz
    updateInterval: 0.5, // saniye — sayaclarin tazelenme araligi
  },

  // --- Girdi ---
  input: {
    // Yumusatma zaman sabitleri (saniye). Kucuk = daha keskin tepki.
    steerSmoothing: 0.12,
    throttleSmoothing: 0.18,
    brakeSmoothing: 0.08,
    gamepadDeadzone: 0.15,
    gamepadTriggerThreshold: 0.05,
    touchSteerSplit: 0.5, // ekranin hangi oraninda sol/sag yarim ayrilir
  },

  // --- Gecici hata ayiklama sahnesi (Faz 2'de kaldirilacak) ---
  debug: {
    grid: {
      size: 200,
      divisions: 100,
      colorCenter: 0xff2fd0, // magenta
      colorGrid: 0x0a3a4a, // sonuk cyan
    },
    cube: {
      size: 1.5,
      position: { x: 0, y: 1.2, z: 0 },
      spinSpeed: { x: 0.6, y: 0.9 }, // rad/sn
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.6,
    },
  },
};

export default config;
