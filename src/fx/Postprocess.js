import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { config } from '../config.js';
import { createGradeMaterial } from './GradeShader.js';

/**
 * Postprocess - the render chain: scene, then bloom, then grade.
 *
 * Two decisions are worth knowing about.
 *
 * The composer buffers are half float and linear, so a neon strip that comes
 * out of its shader at 1.3 stays at 1.3 instead of clipping at the first write.
 * Bloom ADDS into that buffer and the tone mapping only happens afterwards, in
 * the grade pass. That order is the whole reason a strip can glow hard without
 * turning white: the excess lives above 1.0 until ACES rolls it off.
 *
 * The renderer is left on NoToneMapping. ACES is applied once, in the grade
 * pass, which means no material can map a second time on the way in - and every
 * MeshBasicMaterial in the project would, since three includes the tone mapping
 * chunk in all of them.
 *
 * Turning config.postprocess.enabled off at runtime falls straight back to
 * drawing the scene to the screen, untouched. That is the first thing to try
 * when something looks wrong after this phase.
 */
export class Postprocess {
  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(renderer, scene, camera) {
    const cfg = config.postprocess;

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.composer = new EffectComposer(renderer);

    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    const size = renderer.getSize(new THREE.Vector2());
    this.bloom = new UnrealBloomPass(
      size.clone().multiplyScalar(cfg.bloom.resolutionScale),
      cfg.bloom.strength,
      cfg.bloom.radius,
      cfg.bloom.threshold,
    );
    this.composer.addPass(this.bloom);

    this.gradeMaterial = createGradeMaterial();
    this.grade = new ShaderPass(this.gradeMaterial);
    this.composer.addPass(this.grade);

    // renderer.info resets itself on every render call, and a composer makes
    // several per frame, so the counters would only ever describe the last full
    // screen quad - one draw call, one triangle. Taking the reset over by hand
    // makes them describe the whole frame again, post passes included, which is
    // the number that actually has to stay under budget.
    renderer.info.autoReset = false;

    this.setSize(window.innerWidth, window.innerHeight);
    this.update(0, {});
  }

  /**
   * Speed linked feel: the glow swells and the fringes widen as the bike winds
   * up. Both stay small, because at this end of the chain a little goes a long
   * way and the road strips are already the brightest thing on screen.
   * @param {number} dt
   * @param {object} state shared loop state; reads state.speedRatio
   */
  update(dt, state) {
    const cfg = config.postprocess;
    const speed = state.speedRatio || 0;

    this.bloom.strength = cfg.bloom.strength + cfg.bloom.speedGain * speed;
    this.bloom.radius = cfg.bloom.radius;
    this.bloom.threshold = cfg.bloom.threshold;

    const uniforms = this.gradeMaterial.uniforms;
    uniforms.toneMappingExposure.value = cfg.exposure;
    uniforms.uSaturation.value = cfg.saturation;
    uniforms.uAberration.value = cfg.aberration.amount + cfg.aberration.speedGain * speed;
    uniforms.uAberrationPower.value = cfg.aberration.power;
    uniforms.uVignetteStrength.value = cfg.vignette.strength;
    uniforms.uVignetteStart.value = cfg.vignette.start;

    // Traffic events. The hit wins when both are live, which is right: if you
    // touched something, that is the thing worth showing.
    const traffic = config.world.traffic;
    const impact = cfg.flash.enabled ? state.impact || 0 : 0;
    const nearMiss = cfg.flash.enabled ? state.nearMiss || 0 : 0;

    const impactLevel = impact * traffic.collision.flashStrength;
    const nearLevel = nearMiss * traffic.nearMiss.flashStrength;
    const hitWins = impactLevel >= nearLevel;
    uniforms.uFlashColor.value.set(
      hitWins ? traffic.collision.flashColor : traffic.nearMiss.flashColor,
    );
    uniforms.uFlashAmount.value = Math.max(impactLevel, nearLevel);
    uniforms.uFlashEdge.value = hitWins
      ? traffic.collision.flashEdge
      : traffic.nearMiss.flashEdge;
    uniforms.uAberration.value += nearMiss * traffic.nearMiss.aberrationBoost;

    const streaks = cfg.streaks;
    uniforms.uStreakStrength.value = streaks.strength * Math.pow(speed, streaks.exponent);
    uniforms.uStreakLength.value = streaks.length;
    uniforms.uStreakStart.value = streaks.start;
  }

  /** Draws one frame. Called by Loop as the render step. */
  render(dt) {
    this.renderer.info.reset();

    if (config.postprocess.enabled) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  /**
   * @param {number} width in css pixels
   * @param {number} height in css pixels
   */
  setSize(width, height) {
    const pixelRatio = this.renderer.getPixelRatio();

    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);

    // The composer has just sized every pass to the full frame. UnrealBloomPass
    // halves whatever it is given, so putting it back to a fraction of the
    // frame here is what makes the glow cost a quarter of the pixels at the
    // default scale. This has to come after composer.setSize, not before.
    const scale = config.postprocess.bloom.resolutionScale;
    this.bloom.setSize(
      Math.max(1, Math.round(width * pixelRatio * scale)),
      Math.max(1, Math.round(height * pixelRatio * scale)),
    );
  }

  dispose() {
    this.renderer.info.autoReset = true;

    this.bloom.dispose();
    this.renderPass.dispose();
    this.grade.dispose();
    this.gradeMaterial.dispose();
    this.composer.dispose();

    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }
}
