/**
 * NEON RIDE - on screen text and the title card.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * The one place in the project where non-ASCII is allowed, and the only place:
 * everything the PLAYER reads is Turkish, everything a developer reads - code,
 * comments, commit messages, console logs - is English ASCII. Keeping the
 * player facing strings together is what makes that rule checkable rather than
 * a thing people remember.
 */

// --- Interface ---
export const ui = {
  // The title card. It is the audio entry point as much as it is a title: a
  // browser will not start an AudioContext without a user gesture, so there
  // has to be a gesture somebody is actually asked for. See ui/StartScreen.js.
  start: {
    title: 'NEON RIDE',
    promptKey: 'BAŞLAMAK İÇİN BİR TUŞA BAS',
    promptTouch: 'BAŞLAMAK İÇİN DOKUN',
    fadeMs: 420,
  },

  // The reduced motion switch, on the title card and in the pause panel.
  // Two taps from anywhere somebody is likely to be when they start to feel
  // unwell, which is the whole requirement.
  comfort: {
    label: 'AZALTILMIŞ HAREKET',
    on: '●', // filled circle
    off: '○', // hollow circle
  },

  // Everything the control system says. Gathered here with the rest of the
  // player facing text rather than left inline: they were scattered across
  // core/Controls.js, ui/ControlsPanel.js and ui/ControlHints.js in ASCII
  // transliteration - EGIM for EĞİM, HASSASIYET for HASSASİYET - which is the
  // failure this file's rule exists to prevent. Turkish belongs in Turkish.
  controls: {
    modeTilt: 'KONTROL: EĞİM',
    modeTouch: 'KONTROL: DOKUNMATİK',
    // Shown for a few seconds at the start of every run, so the rider always
    // knows which scheme they are about to get without opening anything.
    bannerTilt: 'KONTROL: EĞİM',
    bannerTouch: 'KONTROL: DOKUNMATİK',
    bannerSeconds: 3,

    sensitivity: 'HASSASİYET: ',
    recentre: 'MERKEZİ SIFIRLA',
    recentred: 'SIFIRLANDI',

    hintSteer: 'YÖN',
    hintThrottle: 'GAZ',
    hintBrake: 'FREN',

    // Why tilt was refused. Each names a DIFFERENT fault, because "it does not
    // work" is not something anybody can act on.
    tiltSilent: 'Eğim sensörü veri göndermiyor. Dokunmatik kontrole geçildi.',
    tiltEmpty: 'Eğim sensörü boş veri gönderiyor. Dokunmatik kontrole geçildi.',
    tiltMissing: 'Bu cihazda eğim sensörü yok. Dokunmatik kontrole geçildi.',
    tiltDenied: 'Eğim izni verilmedi. Dokunmatik kontrole geçildi.',
    tiltInsecure: 'Eğim sensörü yalnızca HTTPS üzerinde çalışır. '
      + 'Dokunmatik kontrole geçildi.',
  },

  // The score readout during a run.
  hud: {
    distanceUnit: ' M',
    nearMiss: 'KIL PAYI',
  },

  // The pause and game over cards. Same object as the title card to the eye,
  // so they share its stylesheet.
  panel: {
    pausedTitle: 'DURAKLATILDI',
    resumeKey: 'DEVAM ETMEK İÇİN ESC',
    resumeTouch: 'DEVAM ETMEK İÇİN DOKUN',

    overTitle: 'DÜŞTÜN',
    best: 'EN İYİ',
    record: 'YENİ REKOR',
    restartKey: 'TEKRAR DENEMEK İÇİN BİR TUŞA BAS',
    restartTouch: 'TEKRAR DENEMEK İÇİN DOKUN',
  },
};
