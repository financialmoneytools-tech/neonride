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

/**
 * The roads that are PLANNED but not built, in the order docs/THEMES.md lists
 * them. The road screen shows them locked rather than leaving them out.
 *
 * Saying "there are more roads coming" is worth a card; an empty grid says the
 * opposite. They are named here and not in the UI text file because this is the
 * list that has to shrink as each one lands - a locked card whose theme now
 * exists is a lie the moment somebody forgets to delete it, so the road screen
 * refuses to lock a name that is present in `themes` above.
 */
export const plannedThemes = [
  { key: 'sunsetHighway', name: 'GÜN BATIMI YOLU' },
  { key: 'neonMetropolis', name: 'NEON ŞEHİR' },
  { key: 'nebulaCoast', name: 'NEBULA KIYISI' },
  { key: 'redPlanet', name: 'KIZIL GEZEGEN' },
];

/**
 * Where the road choice is kept between sessions, and the key the mixed card
 * stores under. `mixed` is not a theme - it is a request to keep changing - so
 * it can never be handed to the patch selector as a name.
 */
export const themeStorageKey = 'neon-ride.theme';
export const MIXED = 'mixed';
