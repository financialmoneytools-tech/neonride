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
    soundOn: 'SES: AÇIK',
    soundOff: 'SES: KAPALI',
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

  // Lives, on the HUD. A crash costs one and the ride continues; the run ends
  // when the third is gone.
  lives: {
    label: 'CAN',
    full: '●',
    empty: '○',
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

  // THE SELECTION SCREENS: title -> bike -> road -> start.
  //
  // Every string a player sees while choosing is here, Turkish with the real
  // characters. The screens are built for a LANDSCAPE PHONE first and have to
  // fit 740x320 without scrolling, so these are short on purpose - a label that
  // wraps on a phone is a label that has to be rewritten, not a stylesheet that
  // has to be argued with.
  select: {
    // Shared by both screens.
    back: 'GERİ',
    next: 'İLERİ',
    start: 'BAŞLA',
    quick: 'HIZLI BAŞLA',
    locked: 'YAKINDA',
    hintKeys: 'SEÇMEK İÇİN OK TUŞLARI, ONAYLAMAK İÇİN ENTER',
    // Names the ARROWS first. The screen used to say only "swipe or tap", and
    // when the swipe silently failed on the phone that sentence was the only
    // instruction on screen - it told the player to do the one thing that did
    // not work. The arrows are the visible control now, so they are what it
    // points at.
    hintTouch: 'OKLARA DOKUN VEYA KAYDIR',
  },

  // The bike screen. Names are not translated - they are the bikes' names.
  bikes: {
    title: 'MOTOR SEÇ',
    speed: 'HIZ',
    acceleration: 'HIZLANMA',
    handling: 'YÖN HAKİMİYETİ',
    // One line each, and each names the trade rather than only the strength.
    // A bike described purely by what it is good at reads as strictly better
    // than the one before it, and none of these are.
    blurb: {
      volt: 'DENGELİ. HER YOLDA GÜVENİLİR.',
      nova: 'ÇIKIŞTA HIZLI, ZİRVEDE DAHA YAVAŞ.',
      ember: 'EN YÜKSEK HIZ, EN AĞIR KALKIŞ.',
      frost: 'EN İYİ VİRAJ VE FREN, ORTA HIZ.',
    },
  },

  // The road screen. One card per theme, plus the mixed card.
  roads: {
    title: 'YOL SEÇ',
    // Theme names, keyed to config/themes. A theme that has no entry falls back
    // to its own `name`, which is English - so a new theme shows up readable
    // rather than blank, and obviously untranslated.
    name: {
      galaxyRoad: 'GALAKSİ YOLU',
      auroraPass: 'KUZEY GEÇİDİ',
    },
    blurb: {
      galaxyRoad: 'YILDIZLARIN ALTINDA BOŞ BİR OTOYOL.',
      auroraPass: 'KAR, DAĞLAR VE KUZEY IŞIKLARI.',
    },
    // The card that cycles every built road through light gates. Named TÜM
    // YOLLAR rather than anything with SONSUZ in it, because SONSUZ is a game
    // mode and two different things one word apart, two taps apart, is how a
    // menu stops being readable.
    mixed: 'TÜM YOLLAR',
    mixedBlurb: 'YOL, IŞIK KAPILARINDA DEĞİŞİR.',
  },
};
