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

    // THE TWO WAYS OUT OF A RUN - see ui/PauseExit.js. Until these there were
    // none: a rider who had picked the wrong road had to crash three times on
    // purpose or reload the page.
    restartLevel: 'YENİDEN BAŞLA',
    menu: 'ANA MENÜ',
    // The armed state of the same button. It says what the second press does,
    // not "are you sure" - a question nobody reads is not a confirm step.
    menuConfirm: 'ÇIKMAK İÇİN TEKRAR BAS',
    // How long the confirm stays armed. Long enough to be a deliberate second
    // press, short enough that a card left open is not a trap for whoever
    // picks the phone up next.
    exitConfirmSeconds: 4,
  },

  // THE MODE SCREEN: the first choice, before the bike.
  //
  // KOŞU is the staged run - five kilometres with a finish line. SONSUZ is the
  // original game, ridden until the third crash, and it is what the high score
  // belongs to. Two words, deliberately: this screen is the first thing a new
  // player meets and a paragraph on it is a paragraph nobody reads.
  modes: {
    title: 'MOD SEÇ',
    stage: 'KOŞU',
    stageBlurb: '5 KM. BİTİŞ ÇİZGİSİ VE MADALYA.',
    endless: 'SONSUZ',
    endlessBlurb: 'DÜŞENE KADAR SÜR. EN İYİ SKOR BURADA.',
    // Shown on the road screen and in the pause panel, so the active mode is
    // never something a player has to remember choosing.
    label: 'MOD',
    // The pause panel's switch. It changes the mode for the NEXT run rather
    // than this one - a run whose rules changed underneath it is not a run.
    change: 'MOD DEĞİŞTİR',
    nextRun: 'SONRAKİ KOŞUDA',
  },

  // THE RESULTS CARD, which replaced the old game over panel outright. It has
  // to say three different things - finished with a medal, finished without
  // beating anything, and failed short of the line - and the failure case is
  // the one that must NOT read as a scolding: it says how far, because how far
  // is the thing to beat next time.
  results: {
    finishedTitle: 'BİTTİ',
    failedTitle: 'DÜŞTÜN',
    time: 'SÜRE',
    best: 'EN İYİ SÜRE',
    record: 'YENİ REKOR',
    reached: 'ULAŞILAN MESAFE',
    of: ' / ',
    // Medal names. Shown with the pip below, so the word carries the meaning
    // and the colour only has to agree with it - a medal told by colour alone
    // is a medal a colour blind player cannot read.
    medal: {
      gold: 'ALTIN',
      silver: 'GÜMÜŞ',
      bronze: 'BRONZ',
    },
    medalPip: '●',
    againKey: 'TEKRAR İÇİN BİR TUŞA BAS',
    againTouch: 'TEKRAR İÇİN DOKUN',

    // ================= TEN LEVELS =================
    // A run now ends in one of three places and each wants a different first
    // line: fell short on level seven, finished level seven of ten, or
    // finished the road. The third is the only one that gets a total.
    roadDone: 'YOL TAMAMLANDI',
    levelShort: 'SEVİYE',      // SEVİYE 7 - 3600 / 5000 M
    levelOf: 'SEVİYE %1 / %2', // finished a level that was not the last
    total: 'TOPLAM',
    // The medal tally on the finished-road card: "7 ALTIN  2 GÜMÜŞ  1 BRONZ".
    // Zero counts are dropped rather than shown as 0, because a road finished
    // entirely in gold should say so and not carry two empty columns.
    tallyJoin: '   ',
    // Only an unbroken level 1 to 10 run gets a total; a replay says this
    // instead, so the card never implies a road time that was not ridden.
    practice: 'ALIŞTIRMA TURU',
  },

  // The level banner: the one thing that marks a level boundary, and it is
  // deliberately not a card. It appears over a world that has not stopped,
  // takes no input and dismisses itself - see ui/LevelBanner.js.
  levelBanner: {
    label: 'SEVİYE',
    // Shown under the number when a life comes back, and only then: at three
    // lives nothing is handed back and a banner claiming otherwise would be
    // the game lying about the one resource the player is counting.
    life: '+1 CAN',
  },

  // The staged run's HUD: how far in, out of how long, and the clock.
  stageHud: {
    // PROGRESS, not remaining. The HUD read KALAN 2866 M next to a separate
    // running total of 2134 M, which is two distances for one stage and one of
    // them counting the wrong way. `2134 / 5000` is the whole state of the run
    // in one string and needs no label to say which end it is measured from.
    progress: ' / ',
    unit: ' M',
    checkpoint: 'KONTROL',
  },

  // THE SELECTION SCREENS: title -> mode -> bike -> road -> start.
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
      sunsetHighway: 'GÜN BATIMI YOLU',
      neonMetropolis: 'NEON ŞEHİR',
      nebulaCoast: 'NEBULA KIYISI',
      redPlanet: 'KIZIL GEZEGEN',
    },
    blurb: {
      galaxyRoad: 'YILDIZLARIN ALTINDA BOŞ BİR OTOYOL.',
      auroraPass: 'KAR, DAĞLAR VE KUZEY IŞIKLARI.',
      sunsetHighway: 'ÇÖLDE BATMAYAN BİR GÜNEŞ.',
      neonMetropolis: 'YAĞMUR, MOR BULUTLAR VE ISLAK ASFALT.',
      nebulaCoast: 'İKİ AYIN ALTINDA SAKİN BİR KIYI.',
      redPlanet: 'KIZIL KANYON VE DEV BİR GEZEGEN.',
    },
    // The card that cycles every built road through light gates. Named TÜM
    // YOLLAR rather than anything with SONSUZ in it, because SONSUZ is a game
    // mode and two different things one word apart, two taps apart, is how a
    // menu stops being readable.
    mixed: 'TÜM YOLLAR',
    mixedBlurb: 'YOL, IŞIK KAPILARINDA DEĞİŞİR.',
    // Progress on each road card: "SEVİYE 7 / 10". Only on the staged mode -
    // SONSUZ has no levels and a card advertising them there would be a
    // promise the mode does not keep.
    progress: 'SEVİYE %1 / %2',
    done: 'TAMAMLANDI',
    // TÜM YOLLAR counts ROADS, not levels: it is the card that means all of
    // them, so a level number would be asking which road's level.
    mixedProgress: 'YOL %1 / %2',
  },

  // The level select, which opens after a road in staged mode. Every level up
  // to the highest REACHED may be started; see game/Progress.js for why
  // replay is allowed and what it costs.
  levels: {
    title: 'SEVİYE SEÇ',
    label: 'SEVİYE',
    locked: 'KİLİTLİ',
    // Shown under a level that has been finished, with its best time.
    best: 'EN İYİ',
    // The first card, which is the one a rider who wants the road total picks.
    fromStart: 'BAŞTAN BAŞLA',
    fromStartBlurb: 'ON SEVİYE, TEK KOŞU. TOPLAM SÜRE İÇİN TEK YOL.',
  },
};
