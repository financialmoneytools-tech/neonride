import { createRng } from '../utils/rng.js';

/**
 * sources - the raw material every voice in the project is built from.
 *
 * Three things, all generated once at start up and shared: a noise buffer, a
 * soft clipping curve, and a PeriodicWave for the exhaust note. Nothing here
 * is fetched, because nothing in this project is - see config/audio.js for why
 * an engine in particular is synthesised rather than sampled.
 *
 * The noise is SEEDED, from the same generator the world uses. It sounds
 * identical either way, and it means two recordings of the same run are two
 * recordings of the same run down to the sample, which is the same promise
 * capture mode already makes about the pixel ratio.
 */

/**
 * White noise, looped. Long enough that the loop point is not a rhythm: at two
 * seconds there is nothing periodic for the ear to lock onto, where a tenth of
 * a second buzzes at 10 Hz.
 * @param {BaseAudioContext} ctx
 * @param {number} seconds
 * @param {number} seed
 * @returns {AudioBuffer}
 */
export function noiseBuffer(ctx, seconds = 2, seed = 0x4e454f4e) {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const rng = createRng(seed);

  for (let i = 0; i < frames; i++) data[i] = rng.next() * 2 - 1;

  // Cross fade the last few milliseconds into the first, or the wrap is a step
  // and a step repeated every two seconds is a click track.
  const blend = Math.min(2048, frames >> 2);
  for (let i = 0; i < blend; i++) {
    const t = i / blend;
    const tail = frames - blend + i;
    data[tail] = data[tail] * (1 - t) + data[i] * t;
  }
  return buffer;
}

/**
 * Soft clipping curve for a WaveShaperNode.
 *
 * tanh, so it saturates smoothly instead of squaring off: hard clipping adds
 * odd harmonics without limit and turns the engine into a fuzz pedal. The
 * AMOUNT of drive is a gain node in front of this, because a WaveShaper's curve
 * is fixed once it is set and the drive has to move with the throttle.
 * @param {number} steps
 * @returns {Float32Array}
 */
export function shaperCurve(steps = 1024) {
  const curve = new Float32Array(steps);
  for (let i = 0; i < steps; i++) {
    const x = (i / (steps - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 2) / Math.tanh(2);
  }
  return curve;
}

/**
 * A PeriodicWave from a table of partial amplitudes, fundamental first.
 *
 * An OscillatorNode built from one of these is band limited by the browser, so
 * it can be swept from 140 Hz to 470 without any of its upper partials folding
 * back down the spectrum as aliasing - which is what a hand summed stack of
 * sine oscillators would do, and it would do it exactly where the note is
 * loudest.
 *
 * Alternate partials get the opposite sign. It costs nothing, changes no
 * amplitude, and shifts the peak of the waveform off centre, which is what a
 * pressure pulse from a cylinder actually looks like.
 * @param {BaseAudioContext} ctx
 * @param {number[]} partials
 * @returns {PeriodicWave}
 */
export function periodicWave(ctx, partials) {
  const real = new Float32Array(partials.length + 1);
  const imag = new Float32Array(partials.length + 1);
  for (let i = 0; i < partials.length; i++) {
    imag[i + 1] = i % 2 === 0 ? partials[i] : -partials[i];
  }
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}

/**
 * A looping noise source, started and ready to be routed.
 * @param {BaseAudioContext} ctx
 * @param {AudioBuffer} buffer
 * @returns {AudioBufferSourceNode}
 */
export function noiseSource(ctx, buffer) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.start();
  return source;
}
