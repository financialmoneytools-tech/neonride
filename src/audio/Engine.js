import { config } from '../config.js';
import { noiseSource, periodicWave, shaperCurve } from './sources.js';

/**
 * Engine - the exhaust note, synthesised.
 *
 * THE SIGNAL CHAIN, and why each piece is there:
 *
 *   oscillator (firing rate) ─┐
 *   oscillator (detuned)     ─┼─→ drive ─→ waveshaper ─→ formants ─→ tone ─→ gain
 *   noise ─→ intake bandpass ─┘              (x4, fixed)   (lowpass)
 *
 * The FUNDAMENTAL IS A FIRING RATE, not a note. An inline four fires twice per
 * crank revolution, so the note sweeps 145 Hz to 467 across the rev range and
 * spends most of its life under 250. That is a rumble. Every siren anyone has
 * ever heard lives between 500 and 1,800 Hz, and choosing the right octave is
 * most of the distance between this and one.
 *
 * The FORMANTS DO NOT MOVE. Four peaking filters at fixed frequencies, so the
 * harmonics sweep through stationary peaks as the revs climb and the timbre
 * changes THROUGH a gear rather than the whole spectrum sliding at once. It is
 * a voice singing a scale on one vowel against a slide whistle. Peaking rather
 * than bandpass, and in series rather than in parallel: a parallel bank of
 * bandpasses throws away everything between its bands, including the
 * fundamental, and what comes out is a vowel rather than an engine.
 *
 * LOAD CHANGES TIMBRE, NOT PITCH. Throttle drives the waveshaper harder and
 * opens the lowpass; lifting off collapses both. Two identical rpms sound
 * different depending on what the rider is asking for - which matters here more
 * than it would anywhere else, because the autopilot holds full throttle at the
 * top of the range for most of a clip and the timbre is what is left to move.
 *
 * ONLY THE INTAKE SLIDES WITH THE REVS. Its bandpass tracks rpm because intake
 * noise genuinely does. It is also what stops the low gears sounding thin.
 */
export class Engine {
  /**
   * @param {AudioContext} ctx
   * @param {AudioNode} destination
   * @param {AudioBuffer} noise
   */
  constructor(ctx, destination, noise) {
    const cfg = config.audio.engine;
    this.ctx = ctx;

    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(destination);

    // --- tone and formants, built back to front so each has a destination ---
    this.tone = ctx.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.tone.frequency.value = cfg.tone.closed;
    this.tone.Q.value = cfg.tone.q;
    this.tone.connect(this.out);

    // Makeup trim. The formant bank below adds up to +21.5 dB between its four
    // filters, which is the point of it, and which also means the note arrives
    // here far too hot to sit under a limiter with everything else.
    this.trim = ctx.createGain();
    this.trim.gain.value = cfg.trim;
    this.trim.connect(this.tone);

    this.formants = [];
    let tail = this.trim;
    // Built from the output backwards, so `tail` is always something already
    // connected to the speakers and no node is ever left dangling.
    for (let i = cfg.formants.length - 1; i >= 0; i--) {
      const spec = cfg.formants[i];
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = spec.frequency;
      filter.Q.value = spec.q;
      filter.gain.value = spec.gain;
      filter.connect(tail);
      tail = filter;
      this.formants.unshift(filter);
    }

    this.shaper = ctx.createWaveShaper();
    this.shaper.curve = shaperCurve(cfg.drive.curveSteps);
    this.shaper.oversample = '2x';
    this.shaper.connect(tail);

    // The waveshaper's curve is fixed once set, so the DRIVE is a gain in front
    // of it, and a matching trim behind keeps the level roughly steady as the
    // drive changes - otherwise opening the throttle is just a volume knob.
    this.drive = ctx.createGain();
    this.drive.gain.value = cfg.drive.idle;
    this.drive.connect(this.shaper);

    // --- the note itself ---
    const wave = periodicWave(ctx, cfg.partials);

    this.osc = ctx.createOscillator();
    this.osc.setPeriodicWave(wave);
    this.osc.connect(this.drive);
    this.osc.start();

    // A second oscillator a few cents off the first. Real cylinders are never
    // exactly in phase and the slow beating between them is most of why an
    // engine sounds mechanical rather than electronic.
    this.oscDetuned = ctx.createOscillator();
    this.oscDetuned.setPeriodicWave(wave);
    this.oscDetuned.detune.value = cfg.detuneCents;
    this.detuneGain = ctx.createGain();
    this.detuneGain.gain.value = cfg.detuneGain;
    this.oscDetuned.connect(this.detuneGain);
    this.detuneGain.connect(this.drive);
    this.oscDetuned.start();

    // --- induction roar ---
    this.intakeFilter = ctx.createBiquadFilter();
    this.intakeFilter.type = 'bandpass';
    this.intakeFilter.frequency.value = cfg.intake.low;
    this.intakeFilter.Q.value = cfg.intake.q;
    this.intakeGain = ctx.createGain();
    this.intakeGain.gain.value = 0;
    this.intakeFilter.connect(this.intakeGain);
    this.intakeGain.connect(this.drive);

    this.noise = noiseSource(ctx, noise);
    this.noise.connect(this.intakeFilter);

    this._gear = -1;
    this._shiftUntil = 0;
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads rpm, gear and input
   */
  update(dt, state) {
    const cfg = config.audio.engine;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const tau = config.audio.master.tau;

    const rpm = clamp01(state.rpm || 0);
    const input = state.input;
    const brake = input ? clamp01(input.brake) : 0;

    // The throttle the bike is actually GIVEN, not the one the rider asked for.
    // `throttleFloor` means a hands-off bike is pulling 42 per cent, and reading
    // the raw input here made an accelerating bike sound like it was coasting
    // any time nobody was holding a key - which is most of a recording.
    //
    // Braking closes it, because a rider braking has shut the throttle. The
    // physics keeps applying the floor while the brake is on, correctly - it is
    // what stops the bike stalling to a halt - but the NOTE should be on the
    // overrun, which is what a bike being braked sounds like.
    const throttle = clamp01((state.drive === undefined ? 0 : state.drive) * (1 - brake));

    // --- pitch ------------------------------------------------------------
    //
    // Crank speed first, then firings a second. Going through real revolutions
    // per minute rather than straight to a frequency is what keeps the note in
    // the right octave when any of these numbers is tuned.
    const crank = cfg.idleRpm + (cfg.redlineRpm - cfg.idleRpm) * rpm;
    const firing = (crank / 60) * cfg.firingsPerRev;

    // The gearbox hands over a new rev band between one frame and the next, so
    // the frequency has to be glided rather than set: a step is a click, and
    // anything slower than about a tenth of a second is a slide whistle.
    const shifting = now < this._shiftUntil;
    const glide = shifting ? cfg.shift.glide : tau;
    this.osc.frequency.setTargetAtTime(firing, now, glide);
    this.oscDetuned.frequency.setTargetAtTime(firing, now, glide);

    if (state.gear !== this._gear) {
      // Only an upshift ducks. A downshift on the brakes raises the revs and
      // should be heard, not hidden.
      if (state.gear > this._gear && this._gear > 0) {
        this._shiftUntil = now + cfg.shift.duckMs / 1000;
      }
      this._gear = state.gear;
    }

    // --- load -------------------------------------------------------------
    //
    // The overrun is a real state, not a quiet version of being on power: the
    // intake drops away, the drive comes off and the top of the note closes.
    // The autopilot's throttle is 0 or 1 and nothing between, so every one of
    // its lift offs lands squarely in here - which is where most of the
    // variation in a hands-off recording comes from.
    const onPower = throttle > cfg.overrun.below ? 1 : 0;
    const load = onPower ? throttle : 0;

    const drive = cfg.drive.idle
      + (cfg.drive.full - cfg.drive.idle) * rpm * (1 - cfg.drive.fromThrottle)
      + (cfg.drive.full - cfg.drive.idle) * load * cfg.drive.fromThrottle;
    this.drive.gain.setTargetAtTime(shifting ? cfg.drive.idle : drive, now, tau);

    const cutoff = cfg.tone.closed
      + (cfg.tone.open - cfg.tone.closed) * load
      + cfg.tone.fromRpm * rpm * (onPower ? 1 : 0.25);
    this.tone.frequency.setTargetAtTime(cutoff, now, tau);

    const intakeHz = cfg.intake.low + (cfg.intake.high - cfg.intake.low) * rpm;
    this.intakeFilter.frequency.setTargetAtTime(intakeHz, now, tau);
    const intake = cfg.intake.gain
      * (1 - cfg.intake.fromThrottle + cfg.intake.fromThrottle * load)
      * (0.35 + 0.65 * rpm);
    this.intakeGain.gain.setTargetAtTime(onPower ? intake : intake * 0.25, now, tau);

    // --- level ------------------------------------------------------------
    let gain = cfg.gain
      * (cfg.gainFloor + (1 - cfg.gainFloor) * Math.pow(rpm, cfg.gainExponent));
    if (!onPower) gain *= cfg.overrun.gain;
    if (shifting) gain *= cfg.shift.duck;
    this.out.gain.setTargetAtTime(gain, now, tau);
  }

  dispose() {
    this.osc.stop();
    this.oscDetuned.stop();
    this.noise.stop();
    this.out.disconnect();
  }
}

function clamp01(value) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
