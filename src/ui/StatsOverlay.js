import { config } from '../config.js';
import { lateralLine, steer as traceSteer, tilt as traceTilt } from '../core/Trace.js';

/**
 * StatsOverlay - FPS / draw call / triangle counter in the top left corner.
 * Pure HTML: it adds nothing to the scene and costs nothing to render.
 * When config.stats.enabled is false it is never created (see main.js).
 */
export class StatsOverlay {
  /**
   * @param {HTMLElement} parent
   * @param {import('../core/Controls.js').Controls} [controls] adds the control
   *   diagnostics block. There is no console on a phone and no keyboard to open
   *   one with, so anything that has to be read on the device has to be on the
   *   screen.
   * @param {import('../audio/Audio.js').Audio} [audio] adds the audio block,
   *   for the same reason: silence on a phone has four different causes that
   *   look identical from outside.
   */
  constructor(parent = document.body, controls = null, audio = null) {
    this.controls = controls;
    this.audio = audio;
    /**
     * Assigned by main.js once the Session exists, the way `audio` is. It adds
     * the stage line: how far into the stage, the stage clock, and the average
     * speed the two imply - the three numbers that have to agree with each
     * other and with the dial. tools/stage-check.mjs asserts that they do.
     * @type {import('../game/Session.js').Session|null}
     */
    this.session = null;
    this.el = document.createElement('div');
    this.el.className = 'stats-overlay';
    this.el.textContent = 'measuring...';
    parent.appendChild(this.el);

    this._acc = 0;
  }

  /**
   * Shows or hides the overlay. Capture mode and the H key both use this.
   * @param {boolean} visible
   */
  setVisible(visible) {
    if (this.el) this.el.hidden = !visible;
  }

  /** @returns {boolean} */
  get visible() {
    return !!this.el && !this.el.hidden;
  }

  /**
   * @param {number} dt
   * @param {object} state shared state object owned by Loop
   */
  update(dt, state) {
    if (!this.visible) return;

    // Rewriting the text every frame is pointless DOM traffic; refresh in steps.
    this._acc += dt;
    if (this._acc < config.stats.updateInterval) return;
    this._acc = 0;

    const inp = state.input;
    const trace = [];
    // ============ WHO MOVED THE BIKE, AND WHAT MOVED THEM ============
    //
    // FIRST, not last, and that is not a style choice. `.stats-overlay` is
    // capped at 56vh and clips what does not fit - on a 740x320 phone frame
    // the four trace lines were the ones cut off, which is the one place they
    // must never be. What is being diagnosed goes at the top; the frame rate
    // has never been the thing anybody was reading.
    //
    // Four things assign `state.lateral` and one wins each frame; a value
    // that will not come down is whichever wrote LAST. `lat` names every
    // writer that ran this frame with what it wrote, so a guard shoving the
    // bike and a physics integration running to its clamp are told apart
    // rather than argued about.
    //
    // `str` is the chain above it: which branch of core/Input.js produced the
    // raw steer, what each branch was offering, the damped value that came
    // out, and what the physics actually used - which in capture mode is not
    // the same number. `tlt` is the sum inside core/Controls.js, so a neutral
    // in the wrong place, a range small enough that any lean saturates, and a
    // raw reading that is not moving are three pictures, not one symptom.
    trace.push(lateralLine(state.frame));
    trace.push('str  ' + traceSteer.from
      + '  k ' + traceSteer.key.toFixed(2)
      + (traceSteer.keys ? '[' + traceSteer.keys + ']' : '')
      + '  t ' + traceSteer.tilt.toFixed(2)
      + '  tch ' + traceSteer.touch.toFixed(2)
      + '  pad ' + traceSteer.pad.toFixed(2));
    trace.push('str  raw ' + traceSteer.raw.toFixed(2)
      + '  val ' + traceSteer.value.toFixed(2)
      + '  used ' + traceSteer.used.toFixed(2)
      + '  tgt ' + traceSteer.target.toFixed(2));
    trace.push('tlt  raw ' + traceTilt.raw.toFixed(1)
      + '  neu ' + traceTilt.neutral.toFixed(1)
      + '  d ' + traceTilt.delta.toFixed(1)
      + '  rng ' + traceTilt.range.toFixed(1)
      + '  out ' + traceTilt.out.toFixed(2));
    trace.push('');

    const lines = [
      'FPS       ' + state.fps.toFixed(1) + '  (' + state.frameMs.toFixed(2) + ' ms)',
      'draw call ' + state.drawCalls,
      'triangle  ' + state.triangles.toLocaleString('en-US'),
      // Flat geometry and texture counts are the acceptance test for "no memory
      // growth": the pools allocate once and never again.
      'geom ' + state.geometries + '  tex ' + state.textures,
    ];

    if (state.distance !== undefined) {
      // ODO, NOT DIST. `state.distance` is BikePhysics' own odometer: it
      // starts at `startDistance` and counts up for the whole page session,
      // across every run, because the road is generated from it and restarting
      // does not send it back to zero. Labelled `dist` next to a five
      // kilometre stage it read as the stage's distance, and a finish at 28 s
      // appeared to have covered twelve kilometres. The stage's own progress
      // is on its own line below, from the only object that owns it.
      //
      // BOTH UNITS ON THE SPEED, for the same reason. A world unit is a metre,
      // so the number the physics carries is metres per second; the dial shows
      // it in km/h. Printing one and labelling it the other is exactly the
      // mistake this line existed to make, so it prints both and the
      // conversion between them is visible.
      const mps = state.speed || 0;
      lines.push(
        'odo ' +
          Math.round(state.distance) +
          '  speed ' +
          mps.toFixed(1) +
          ' m/s  ' +
          Math.round(mps * config.player.rider.instruments.speed.toKmh) +
          ' km/sa',
      );
      // Signed distance from the centre line, positive to the rider's right.
      // This is the readout to watch when checking that steering moves the bike.
      lines.push('lateral ' + (state.lateral >= 0 ? '+' : '') + (state.lateral || 0).toFixed(2)
        + '  lean ' + (((state.lean || 0) * 180) / Math.PI).toFixed(1));
    }

    // THE STAGE, from the stage. Only while one is running, so an endless run
    // and a god mode recording keep the overlay the shape they always had.
    const session = this.session;
    if (session && session.staged && session.scoring) {
      const stage = session.stage;
      lines.push('stage ' + Math.floor(stage.travelled) + ' / ' + config.stage.length
        + '  ' + stage.time.toFixed(1) + ' s'
        + '  avg ' + (stage.time > 0 ? (stage.travelled / stage.time).toFixed(1) : '0.0') + ' m/s');
    }

    if (inp) {
      lines.push(
        'steer ' +
          inp.steer.toFixed(2) +
          '  thr ' +
          inp.throttle.toFixed(2) +
          '  brk ' +
          inp.brake.toFixed(2),
      );
    }

    // THE TILT DIAGNOSTICS. This block is the reason the constructor takes
    // `controls`, and for one round it did not exist: the parameter was wired,
    // the docstring described the block, and update() never read it - so a
    // phone that was asked to show the readout showed the ordinary overlay and
    // nothing else. There is no console on a phone, so a diagnostic that is not
    // on the screen is a diagnostic that does not exist.
    //
    // Always printed when the overlay is up, whatever the mode: switching to
    // touch to go and look at why tilt failed must not blank the evidence.
    const controls = this.controls;
    if (controls && controls.enabled) {
      const g = controls.gravity;
      lines.push('');
      lines.push('mode ' + controls.mode
        + '  src ' + (controls.source || '-')
        + '  secure ' + (controls.secure ? 'yes' : 'NO'));
      lines.push('motion ' + controls.motionEvents
        + '  /s ' + controls.motionRate.toFixed(0)
        + '  read ' + controls.motionReadings);
      lines.push('orient ' + controls.orientationEvents
        + '  /s ' + controls.orientationRate.toFixed(0)
        + '  read ' + controls.orientationReadings);
      lines.push('grav ' + g.x.toFixed(2) + ' ' + g.y.toFixed(2) + ' ' + g.z.toFixed(2)
        + '  ang ' + controls.angle);
      lines.push('tilt ' + (controls.steer >= 0 ? '+' : '') + controls.steer.toFixed(3)
        + (controls.fellBack ? '  FELL BACK' : ''));
    }

    // AUDIO, because "there is no sound" has several causes that look identical
    // from outside: a context that was never created, one created and left
    // suspended, a master gain sitting at zero, and a mute nobody remembers
    // setting. `gest` is how many gestures have tried to unlock it - zero means
    // nothing has even attempted.
    const audio = this.audio;
    if (audio) {
      lines.push('audio ' + audio.state
        + '  gain ' + audio.gain.toFixed(2)
        + '  gest ' + audio.gestures
        + (audio.muted ? '  MUTED' : ''));
    }

    this.el.textContent = trace.concat(lines).join('\n');
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
