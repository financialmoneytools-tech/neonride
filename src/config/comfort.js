/**
 * NEON RIDE - motion comfort.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly.
 *
 * THIS IS NOT A THEME, and the difference is the whole reason it has its own
 * file. A theme is a patch applied before anything is built, because a strip
 * count is a shader define and a pylon spacing sizes an instance buffer. This
 * has to work MID-RUN, from a toggle somebody reaches for because they have
 * started to feel unwell, so every value here is read live by its consumer on
 * the frame it is needed and nothing is baked.
 *
 * WHAT MAKES PEOPLE ILL HERE, in the order it is worth turning down:
 *
 * 1. The strips. They scroll at 1.45 times road speed through the middle of the
 *    field of view, which the eye tries to track and cannot.
 * 2. The bob. A vertical oscillation at 2 Hz is close to the frequency the
 *    vestibular system is most sensitive to, and it disagrees with an inner ear
 *    that is reporting a person sitting still.
 * 3. The shake. Small, fast and unpredictable, which is the hardest kind of
 *    motion to ignore.
 *
 * None of them goes to zero. A frozen camera over a moving road is its own kind
 * of wrong, and the point is a ride somebody can finish, not a slideshow.
 */

// --- Motion comfort ---
export const comfort = {
  /**
   * Off by default, and set from the operating system on first load: a person
   * who has already told their machine they want less motion should not have to
   * tell this game as well. See core/Comfort.js - once anyone touches the
   * toggle their choice is kept and the system stops being consulted.
   */
  reducedMotion: false,

  /** Where the system preference is looked up. */
  media: '(prefers-reduced-motion: reduce)',

  // Kept across sessions, so nobody has to find the toggle twice.
  storageKey: 'neon-ride.reduced-motion',

  // What `reducedMotion` multiplies when it is on. One would be no change.
  scale: {
    // The strips barely move relative to the road. Not zero: a dashed line that
    // is perfectly static reads as a painted road marking, which is fine, and
    // at 0.12 there is still a hint of flow for the speed without anything the
    // eye will chase.
    stripScroll: 0.12,
    // Enough bob left to say the bike is on a road surface.
    bob: 0.25,
    // The shake goes almost entirely. It is the least legible of the three and
    // the one that buys the least.
    shake: 0.1,
    // Field of view ramp with speed. A fov that opens up under acceleration is
    // a strong sensation cue and a strong nausea trigger, and it is the one
    // most people never think to name.
    fovRamp: 0.35,
  },
};
