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
    // The photographic cockpit's roll and shift with lean and steer. It is a
    // large object low in the frame rather than something in the middle of
    // vision, so it is not the worst offender here - but it is rotation, it is
    // new, and CLAUDE.md is explicit that anything new which moves the camera
    // goes through motionScale rather than reading its own amplitude. Left with
    // enough to still answer the bars, because a cockpit that does not move at
    // all is the thing this was added to fix.
    cockpitSway: 0.3,

    // THE CELEBRATION'S CAMERA. CLAUDE.md requires any new camera profile to
    // be checked with reduced motion on AND off, and the celebration is one:
    // it lifts the eye, pitches down and orbits the podium, which changes how
    // much of the frame the ground fills and therefore how much optic flow
    // there is.
    //
    // Not zero. The lift and the pitch are how the shot is composed and
    // removing them leaves the camera inside the bike; what this cuts is the
    // ORBIT, which is the only continuous motion in a held shot and the only
    // part anybody would try to track. At 0.15 it is a drift rather than a
    // move, and the scene still arrives at the same framing.
    celebration: 0.15,

    // WEATHER, and it is the strongest trigger the project has ever added:
    // high contrast motion straight through the centre of vision, which is the
    // first cause on the list at the top of this file. Snow and rain streak
    // toward the rider and the eye cannot help trying to track them.
    //
    // Not zero. A theme that is meant to be snowing has to still be snowing -
    // an empty sky is a different place, not a gentler one - so this thins the
    // fall right down and shortens the streaks rather than stopping either.
    weather: 0.18,

    // THE SCREEN FLASH: a hit, a near miss, a checkpoint gate, a theme gate.
    // A full frame pulse several times a minute is exactly the kind of thing
    // this file exists for, and on a staged run there is now a gate every
    // kilometre on top of the traffic events.
    //
    // Not zero, for the same reason the weather is not. Each of these flashes
    // is the only signal its event has: with them off, a checkpoint would pass
    // unremarked and a collision would be a silent loss of speed. Turned down
    // far enough that nothing whites out, which is what makes it uncomfortable,
    // while the event is still unmistakably announced.
    flash: 0.28,
  },
};
