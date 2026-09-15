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
