import { galaxyRoad } from './galaxyRoad.js';
import { auroraPass } from './auroraPass.js';

/**
 * NEON RIDE - road themes.
 * Part of the single configuration surface; import from ../../config.js, never
 * from this file directly.
 *
 * A theme is a PLACE: a sky, a neon palette, what grows beside the road and
 * what is falling out of the sky. It is applied as a patch over config before
 * anything is built, the same way a quality preset is - see config/device.js
 * and utils/patch.js - and `?theme=<name>` picks one for a session.
 *
 * A THEME NEVER ALLOCATES. It sets colours, intensities and densities, and
 * nothing else. Every scenery kind and the whole weather buffer are allocated
 * at load whatever theme is fitted; a kind a theme does not use sits at density
 * zero, parked beyond the fog wall. That rule is what will let a run change
 * theme every few kilometres without a reload, and it is worth more than the
 * memory it costs - see docs/THEMES.md, and do not add a count, a pool size or
 * a shader define to a theme file.
 *
 * WHAT HAPPENED TO openRoad. It was never a place; it was a motion comfort
 * variant of the default look, and it existed because the flowing neon strips
 * ran down the middle of the asphalt at 1.45 times road speed, directly under
 * the cluster. The multi lane rebuild moved those strips out to the shoulder
 * and the median, so the centre of vision now carries nothing but painted lane
 * markings - which are world locked and stream past at exactly road speed.
 * The variant IS the default now, on every theme, so the entry is gone rather
 * than kept as a theme nobody should ever be driven into mid run.
 */
export const themes = {
  galaxyRoad,
  auroraPass,
};

/** Which theme is fitted. `?theme=` overrides it; the T key cycles. */
export const theme = 'galaxyRoad';
