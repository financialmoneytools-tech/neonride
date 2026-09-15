/**
 * NEON RIDE - sound.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * EVERYTHING HERE IS SYNTHESISED. No sample files, for the same reason the
 * textures are drawn on a canvas - and for one more that is specific to an
 * engine. An engine loop has to cover idle to redline, better than three to
 * one in pitch, and pitch shifting one recording that far drags its FORMANTS
 * with it: the fixed resonances of airbox, exhaust and bodywork slide up too
 * and the bike turns into a mosquito. Doing it honestly with samples needs the
 * same engine recorded at five or six points in its range and crossfaded, and
 * matched sets like that do not exist under a licence this project can use. One
 * free loop pitch shifted is worse than synthesis, not better.
 *
 * WHY IT DOES NOT SOUND LIKE A SIREN. Four things, and the first is the one
 * that matters most:
 *
 * 1. The fundamental is a FIRING RATE, not a note. An inline four fires twice
 *    per crank revolution, so 4,000 rpm is 133 Hz and the redline is 467 Hz.
 *    The note lives between 145 and 470 Hz and spends most of its life under
 *    250, which is a rumble. Sirens live between 500 and 1,800 Hz.
 * 2. The formants DO NOT MOVE. Four peaking filters sit at fixed frequencies,
 *    so as the fundamental climbs its harmonics sweep through stationary peaks
 *    and the timbre changes through a gear instead of the whole spectrum
 *    sliding together. It is the difference between a voice singing a scale on
 *    one vowel and a slide whistle. A siren has no formants at all.
 * 3. The spectrum is never clean. Sixteen partials, a second oscillator
 *    detuned a few cents against the first for roughness, and a noise layer on
 *    top of both. One clean swept sine IS the definition of a siren.
 * 4. Load changes the timbre, not the pitch. Opening the throttle drives a
 *    waveshaper harder and opens a lowpass; closing it collapses both into a
 *    hollow overrun. Two identical rpms sound different depending on what the
 *    rider is asking for, which no siren does.
 */

// --- Sound ---
export const audio = {
  enabled: true,

  // Nothing is built until the title card is dismissed. A browser will not
  // start an AudioContext without a user gesture, and one that is created
  // without it runs happily, animates every parameter, and emits silence. See
  // ui/StartScreen.js for why there is a gesture to hang this on at all.
  master: {
    gain: 0.85,
    // Brickwall at the output. The mix is built to sit under this; it is here
    // so a stack of doppler passes arriving together cannot clip a recording,
    // which is not a thing that can be fixed afterwards.
    limiter: { threshold: -3, knee: 0, ratio: 20, attack: 0.003, release: 0.25 },
    // Seconds. Every parameter is driven with setTargetAtTime rather than being
    // assigned, because assigning a value sixty times a second is a staircase
    // and a staircase in an audio parameter is audible as buzz.
    tau: 0.02,
    // Fade in when the ride starts, so the engine arrives rather than barks.
    startFade: 0.6,
  },

  engine: {
    // Level against rpm, and the exponent matters more than the gain. An engine
    // at a quarter of its revs is not two thirds as loud as one at the redline,
    // and measured, a linear ramp came out at 0.46 rms against 0.73 - near
    // enough the same sound all the way up, which wastes the one dimension the
    // note has left when the autopilot holds full throttle for a whole clip.
    gain: 0.34,
    gainFloor: 0.18,
    gainExponent: 1.7,

    // Makeup trim after the formant bank. The four peaking filters add up to
    // +21.5 dB between them, which is deliberate - they are what shapes the
    // note - but it left the engine bus at 0.73 rms on its own, hard into a
    // limiter set at -3 dB, with the wind and six doppler voices still to come.
    // Measured back down to a fifth of that, which leaves the limiter doing
    // what it is for: catching a pile-up, not running permanently.
    trim: 0.2,

    // The crank speeds state.rpm is stretched over. state.rpm is 0..1 across
    // one gear - see player/bike/gearbox.js - and this is what 0 and 1 mean in
    // real revolutions per minute.
    idleRpm: 1300,
    redlineRpm: 14000,
    // Firings per crank revolution. Two for an inline four: four cylinders,
    // each firing once every two revolutions. This is the number that puts the
    // note in the right octave, and it is the whole reason it reads as an
    // engine rather than as a tone generator.
    firingsPerRev: 2,

    // Relative amplitude of each partial of the exhaust note, fundamental
    // first. Between a sawtooth's 1/n and something brighter, with the second
    // and fourth lifted: the even partials are what a four cylinder has more of
    // than a twin, and dropping them is most of the difference between this and
    // a V engine.
    partials: [
      1.0, 0.82, 0.52, 0.46, 0.30, 0.24, 0.205, 0.175,
      0.14, 0.115, 0.095, 0.078, 0.064, 0.052, 0.043, 0.035,
    ],
    // A second oscillator this many cents off the first. Real cylinders are
    // never exactly in phase and the slow beating between them is a large part
    // of why an engine sounds mechanical instead of electronic. Past about 25
    // it stops being roughness and starts being two engines.
    detuneCents: 11,
    detuneGain: 0.55,

    // Peaking filters in series, at FIXED frequencies. Peaking rather than
    // bandpass on purpose: a bank of bandpasses in parallel loses everything
    // between the bands, including the fundamental, and what is left is a vowel
    // rather than an engine. These lift their own regions and leave the rest.
    formants: [
      { frequency: 190, q: 1.1, gain: 7 }, // airbox boom, the bottom of the note
      { frequency: 620, q: 1.5, gain: 5 }, // body
      { frequency: 1750, q: 2.1, gain: 6.5 }, // exhaust rasp, the hard edge
      { frequency: 3250, q: 3.0, gain: 3 }, // top edge, only audible on full drive
    ],

    // Soft clipping. The rasp of a sport bike at the top of a gear is
    // non-linearity, not another harmonic written into the table: the drive
    // rises with rpm AND with throttle, so the same revs sound hard under power
    // and clean on the overrun.
    drive: { idle: 1.0, full: 6.5, fromThrottle: 0.55, curveSteps: 1024 },

    // The lowpass above the whole thing. Opening the throttle opens it; closing
    // it shuts the top of the note down, which is what the ear hears as the
    // engine going off power. The rpm term stops a closed throttle at 12,000
    // sounding like a closed throttle at 4,000.
    tone: { closed: 900, open: 7200, fromRpm: 3600, q: 0.7 },

    // Induction roar: noise through a bandpass that DOES track the revs. It is
    // the one part of the engine allowed to slide with rpm, because intake
    // noise genuinely does, and it is what stops the low gears sounding thin.
    intake: { low: 380, high: 2100, q: 0.9, gain: 0.5, fromThrottle: 0.7 },

    // An upshift. The revs drop between one frame and the next - the gearbox
    // hands over a new band instantly - and a step in a frequency is a click,
    // while a slow glide is a slide whistle. Ninety milliseconds is a shift.
    shift: { glide: 0.03, duckMs: 90, duck: 0.45 },

    // Engine braking. Below this throttle the note is on the overrun: the
    // intake layer drops away, the drive comes off, and the tone closes. The
    // autopilot's throttle is 0 or 1 and nothing between, so its lift offs land
    // squarely in here.
    overrun: { below: 0.25, gain: 0.55 },
  },

  wind: {
    // Clearly UNDER the engine. Measured at full speed with everything running,
    // 0.42 put the wind bus at 0.091 rms against the engine's 0.100 - the two
    // level with each other, which is a gale with a motorcycle in it. The
    // engine is the subject; the wind is what tells you how fast it is going.
    gain: 0.2,
    // Noise through a bandpass that opens and brightens with speed. Wind is the
    // one sound here that genuinely is just filtered noise, so there is nothing
    // cleverer to do and nothing lost by saying so.
    low: 260, // centre frequency at a standstill
    high: 1150, // and at top speed
    q: 0.55,
    // Loudness against speed. Squared, because wind noise goes roughly with the
    // square of speed and a linear ramp is audible as the wrong shape - too
    // loud when slow, and no sense of the last third of the range.
    exponent: 2.0,
    floor: 0.06, // still audible at a crawl, so the mix does not switch on
  },

  traffic: {
    // Under the engine, which is the subject. Each voice is scaled by the root
    // of the voice count on top of this; see TrafficVoices.js. Measured at full
    // speed on a busy road, 0.5 put this bus above the engine.
    gain: 0.26,
    // Voices, not vehicles. There are sixty five vehicles in the pools and no
    // browser wants sixty five live graphs; the nearest few get a voice and the
    // rest are silent, which is also what they are - anything far enough away
    // to lose its voice is far enough away to be inaudible.
    voices: 6,
    // Beyond this many units a vehicle cannot hold a voice.
    range: 90,
    // A pass is a noise burst through a moving bandpass. The doppler is worked
    // out from the real closing rate, which Traffic already knows exactly, but
    // the ratio is scaled: world units are not metres and pretending they are
    // gives either no effect at all or a cartoon.
    doppler: { strength: 0.55, maxShift: 1.9 },
    pass: { low: 220, high: 900, q: 1.2 },

    // The ambulance. Two alternating tones, which is what a siren is, and the
    // one sound in this file where sounding like a siren is the point.
    //
    // The rate is NOT written here: it is read from the beacon's own flash rate
    // in config/traffic.js, so the lights and the sound cannot drift apart.
    siren: {
      gain: 0.45,
      toneA: 650,
      toneB: 870,
      // Fraction of the alternation spent gliding between the two tones rather
      // than stepping. A hard step is a square wave in the frequency and reads
      // as a game alarm; a short glide is a two tone siren.
      glide: 0.18,
      partials: [1.0, 0.3, 0.14, 0.06],
      // Audible further out than a passing car, the way one is.
      range: 240,
    },
  },
};
