import { config } from '../config.js';
import { noiseSource } from './sources.js';

/**
 * TrafficVoices - the whoosh of a vehicle going past, and the ambulance siren.
 *
 * VOICES, NOT VEHICLES. There are sixty five vehicles in the pools and no
 * browser wants sixty five live audio graphs. A handful of voices are built
 * once and handed to the nearest vehicles each frame, which is not a
 * compromise: anything far enough away to lose its voice is far enough away to
 * be inaudible anyway. Voices are stolen freely because a pass is continuous
 * noise rather than a triggered event, so there is no note to cut off.
 *
 * THE DOPPLER IS REAL, worked out from the rate the gap is actually closing.
 * Traffic already knows every vehicle's distance and speed exactly, so there is
 * nothing to estimate: while the bike is catching a vehicle the gap shrinks and
 * the pitch rises, and the instant it is passed the gap starts growing and the
 * pitch drops. That crossover IS the whoosh, and it falls in the right place on
 * its own because it is derived rather than scripted.
 *
 * The ratio is SCALED rather than physical. World units are not metres and the
 * speeds here are not metres a second, so using the textbook formula gives
 * either nothing audible or a cartoon. `strength` is the knob and it is honest
 * about being one.
 *
 * THE SIREN READS THE BEACON'S OWN FLASH RATE out of the traffic config and the
 * beacon's own phase off Traffic, so the lights and the sound cannot drift
 * apart - they are the same number and the same clock, not two copies of it.
 */
export class TrafficVoices {
  /**
   * @param {AudioContext} ctx
   * @param {AudioNode} destination
   * @param {AudioBuffer} noise
   * @param {import('../world/Traffic.js').Traffic} traffic
   */
  constructor(ctx, destination, noise, traffic) {
    const cfg = config.audio.traffic;
    this.ctx = ctx;
    this.traffic = traffic;

    this.out = ctx.createGain();
    this.out.gain.value = cfg.gain;
    this.out.connect(destination);

    // Every voice is noise, and uncorrelated noise sums in POWER rather than in
    // amplitude, so six voices at full level are not six times one voice - they
    // are the square root of six, about two and a half. Dividing by that keeps
    // a busy road at the same loudness as a single close pass instead of two
    // and a half times it. Measured without it the traffic bus ran at 0.137 rms
    // against the engine's 0.075, which is a road with a motorcycle somewhere
    // on it rather than a motorcycle on a road.
    this._voiceScale = 1 / Math.sqrt(cfg.voices);

    this.voices = [];
    for (let i = 0; i < cfg.voices; i++) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = cfg.pass.low;
      filter.Q.value = cfg.pass.q;

      const panner = ctx.createStereoPanner();
      const gain = ctx.createGain();
      gain.gain.value = 0;

      const source = noiseSource(ctx, noise);
      source.connect(filter);
      filter.connect(panner);
      panner.connect(gain);
      gain.connect(this.out);

      this.voices.push({ source, filter, panner, gain });
    }

    // One siren. More than one ambulance can be in range at once and two
    // sirens alternating in step is a chord, not a road: the nearest one gets
    // it and the rest are silent, which is what an ear picks out anyway.
    const siren = config.audio.traffic.siren;
    this.siren = {
      osc: ctx.createOscillator(),
      panner: ctx.createStereoPanner(),
      gain: ctx.createGain(),
      high: false,
    };
    this.siren.osc.setPeriodicWave(periodicSiren(ctx, siren.partials));
    this.siren.osc.frequency.value = siren.toneA;
    this.siren.gain.gain.value = 0;
    this.siren.osc.connect(this.siren.panner);
    this.siren.panner.connect(this.siren.gain);
    this.siren.gain.connect(this.out);
    this.siren.osc.start();

    // Which type carries a beacon, and how fast it flashes. Read from the
    // traffic config rather than written down again here.
    const beaconType = config.world.traffic.types.find((type) => type.beacon);
    this.beaconRate = beaconType ? beaconType.beacon.rate : 0;
    this.beaconName = beaconType ? beaconType.name : null;

    this._near = [];
  }

  /**
   * @param {number} dt
   * @param {object} state shared loop state; reads distance, lateral and speed
   */
  update(dt, state) {
    const cfg = config.audio.traffic;
    const now = this.ctx.currentTime;
    const tau = config.audio.master.tau;
    const maxSpeed = config.player.bike.maxSpeed;

    const playerDistance = state.distance || 0;
    const playerLateral = state.lateral || 0;
    const playerSpeed = state.speed || 0;

    const near = this._near;
    near.length = 0;
    let siren = null;

    const fleets = this.traffic.fleets;
    for (let f = 0; f < fleets.length; f++) {
      const fleet = fleets[f];
      const isBeacon = fleet.type.name === this.beaconName;
      const vehicles = fleet.vehicles;

      for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];
        if (!vehicle.active) continue;

        const along = vehicle.distance - playerDistance;
        const across = vehicle.lateral - playerLateral;
        const gap = Math.hypot(along, across);

        if (isBeacon && gap < cfg.siren.range && (!siren || gap < siren.gap)) {
          siren = { gap, along, across };
        }
        if (gap > cfg.range) continue;

        near.push({ gap, along, across, speed: vehicle.speed * maxSpeed });
      }
    }

    // Nearest first, so the voices go where the ear is.
    near.sort(byGap);

    for (let v = 0; v < this.voices.length; v++) {
      const voice = this.voices[v];
      const hit = near[v];

      if (!hit) {
        voice.gain.gain.setTargetAtTime(0, now, tau);
        continue;
      }

      // The rate the GAP is changing, which is the only thing a doppler shift
      // depends on. Negative while the bike is catching the vehicle and
      // positive once it is past, so the crossover lands exactly at the pass
      // without anything having to detect one.
      const direction = hit.along >= 0 ? 1 : -1;
      const radial = direction * (hit.speed - playerSpeed);
      let shift = 1 - (cfg.doppler.strength * radial) / maxSpeed;
      shift = clamp(shift, 1 / cfg.doppler.maxShift, cfg.doppler.maxShift);

      const closeness = 1 - hit.gap / cfg.range;
      const level = closeness * closeness * this._voiceScale;

      const centre = cfg.pass.low + (cfg.pass.high - cfg.pass.low) * level;
      voice.filter.frequency.setTargetAtTime(centre * shift, now, tau);
      voice.gain.gain.setTargetAtTime(level, now, tau);
      // Lateral offset only. A vehicle dead ahead is centred, one being passed
      // on the left is on the left, and it swings across as it goes by.
      voice.panner.pan.setTargetAtTime(clamp(hit.across / 6, -1, 1), now, tau);
    }

    this._updateSiren(siren, now, tau);
  }

  /** Two alternating tones, in step with the roof lights. */
  _updateSiren(hit, now, tau) {
    const cfg = config.audio.traffic.siren;
    const voice = this.siren;

    if (!hit) {
      voice.gain.gain.setTargetAtTime(0, now, tau);
      return;
    }

    // The same expression Traffic uses to pick which lamp is lit, off the same
    // phase, so the sound alternates on the frame the colour changes.
    const high = Math.sin(this.traffic.beaconPhase * Math.PI * 2 * this.beaconRate) >= 0;
    if (high !== voice.high) {
      voice.high = high;
      // Glided, not stepped. A step in the frequency is a square wave and reads
      // as a game alarm; a short glide is a two tone siren.
      const glide = (cfg.glide / Math.max(this.beaconRate, 0.001)) * 0.5;
      voice.osc.frequency.setTargetAtTime(high ? cfg.toneB : cfg.toneA, now, Math.max(glide, 0.005));
    }

    const closeness = 1 - hit.gap / cfg.range;
    voice.gain.gain.setTargetAtTime(cfg.gain * closeness * closeness, now, tau);
    voice.panner.pan.setTargetAtTime(clamp(hit.across / 8, -1, 1), now, tau);
  }

  dispose() {
    for (let i = 0; i < this.voices.length; i++) this.voices[i].source.stop();
    this.siren.osc.stop();
    this.out.disconnect();
  }
}

/** A siren is a tone with a little edge on it, not a sine and not a sawtooth. */
function periodicSiren(ctx, partials) {
  const real = new Float32Array(partials.length + 1);
  const imag = new Float32Array(partials.length + 1);
  for (let i = 0; i < partials.length; i++) imag[i + 1] = partials[i];
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}

function byGap(a, b) {
  return a.gap - b.gap;
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}
