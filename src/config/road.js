/**
 * NEON RIDE - the road itself.
 * Part of the single configuration surface; import from ../config.js, never
 * from this file directly. Reached as `config.world.road`.
 *
 * Split out of config/world.js when the highway arrived: four lanes, painted
 * markings, a median and an oncoming carriageway is more than one section's
 * worth, and config/world.js was past the 300 line limit.
 */

// --- The road ---
export const road = {
  chunkLength: 200,
  poolSize: 8, // 8 * 200 = 1600 units of road, far beyond the fog wall
  chunksBehind: 1, // chunks kept alive behind the camera before recycling
  lengthSegments: 48, // rings per chunk, about one every 4.2 units
  widthSegments: 12, // columns across the ribbon; see carriageway below
  pointsPerChunk: 4, // curve control points per chunk (spacing 50 units)

  // THE HIGHWAY'S CROSS SECTION, IN METRES, measured from the path centre.
  // The path centre is the middle of OUR carriageway, so the rider's lateral
  // stays centred on zero and nothing downstream had to learn a new origin.
  //
  // We drive on the RIGHT: the median is to the left (negative across), the
  // hard shoulder to the right. world/road/layout.js turns these six numbers
  // into every edge, lane centre and divider in the world, and everything
  // that needs one asks it rather than keeping its own copy.
  carriageway: {
    lanes: 4,
    // 3.8, not the 3.6 a real motorway uses, and the extra 20 cm is load
    // bearing. A truck is 2.5 wide and the bike is 1.0: at 3.6 the gap
    // between two trucks in adjacent lanes was 1.1 against a 1.1 requirement,
    // so there was NO legal line and the god mode guard was reporting
    // trapped frames and letting overlaps through. At 3.8 the gap is 1.3 and
    // a line always exists, however tight. Measured with tools/god-run.mjs.
    laneWidth: 3.8, // four of them span 15.2
    shoulderRight: 2.6, // hard shoulder, outside the right edge line
    medianGap: 1.2, // paved strip between our left edge and the median
    medianWidth: 3.2, // the barrier stands in the middle of this
    oncomingLanes: 4, // beyond the median. Scenery: no collision, ever.
    verge: 3.0, // how far the ribbon runs past the outermost shoulder
  },

  // Which gives, in metres from the path centre: our lanes at -5.4, -1.8,
  // 1.8 and 5.4, dividers at -3.6, 0 and 3.6, our edges at -7.2 and 7.2, the
  // median from -8.4 to -11.6 with the barrier down the middle of it, the
  // oncoming carriageway from -11.6 to -26.0, and a ribbon 44.4 wide. The
  // markings are computed in the fragment shader from the across coordinate,
  // so widthSegments does not have to line up with lanes - it only has to be
  // dense enough for the interpolated view direction to give a smooth sheen
  // over that width, which 12 columns is.

  // Curve generation. Amplitude over wavelength is the knob that decides
  // how sharp the turns get: keep amplitude / wavelength below ~0.08 or
  // the road starts to feel like a slalom.
  path: {
    lateralAmplitude: 70,
    lateralWavelength: 1100,
    lateralStraightBias: 0.62, // pushes small values toward zero -> straights
    elevationAmplitude: 6,
    elevationWavelength: 1500,
    fbm: { octaves: 2, lacunarity: 2, gain: 0.28 },
  },

  surface: {
    asphaltColor: 0x050509, // near black
    voidColor: 0x050310, // shoulder fades to this, same as the fog color
    // The median strip between the two carriageways: not asphalt and not
    // void, so the barrier standing in it has something to stand on.
    medianColor: 0x0a0814,

    // THE GROUND EITHER SIDE. Equal to voidColor here, which is Galaxy Road's
    // answer - a road in space has no verge - and the knob a snowy theme turns
    // up. `bankColor` is the ploughed ridge piled hard against each edge of
    // each carriageway; `bankWidth` is how far out it reaches, in metres.
    // How much of itself the far carriageway keeps. A theme that gives it
    // plenty of headlights can afford 1.0; one that does not needs it low, or
    // it reads as a second lane of ours rather than as somewhere else.
    oncomingDim: 0.55,
    groundColor: 0x050310,
    bankColor: 0x000000,
    bankWidth: 2.4,
    sheenColor: 0x2a1550, // fake sky reflection picked up at grazing angles
    sheenStrength: 0.55,
    sheenPower: 3.0,

    // Everything the road emits is faded to nothing between these two
    // distances. A chunk is born at (poolSize - chunksBehind - 1) *
    // chunkLength = 1200 units ahead, so as long as neonFadeEnd stays below
    // that, a fresh chunk cannot carry a single lit pixel at the moment it
    // appears - no matter how thin the fog is. That is what lets the fog
    // density be chosen for looks instead of for concealment.
    neonFadeStart: 800,
    neonFadeEnd: 1100,
  },

  // The two neon edge lines, sitting on our carriageway's outer edges. In
  // METRES now, like everything else lateral: the old values were fractions
  // of the ribbon half width, which meant widening the verge made the edge
  // lines wider.
  // ================= THE EDGE LINES ARE A DETAIL, NOT A LIGHT SOURCE =========
  //
  // Reported TWICE from a phone as wide white-hot bands along both shoulders,
  // with the asphalt, the lane markings and the traffic all dimmer than they
  // were. The first report was not acted on - `git log -L` on this block shows
  // one commit, the one that created the file - so nothing had changed when the
  // second arrived. tools/brightness-check.mjs exists so that cannot happen a
  // third time.
  //
  // MEASURED on Aurora Pass at 1280x720, from one frozen frame, by turning each
  // element off in turn and seeing what the frame lost:
  //
  //   removed     peak   >200 px   mean light it was adding
  //   (base)     238.7    12.58%
  //   bloom      229.1     4.61%   40.4
  //   edges      221.2     4.56%   34.3
  //   sheen      238.0    11.51%    8.5
  //   markings   233.0    11.50%    7.5
  //   roadside   238.7    12.64%    0.0
  //
  // So it is the edges AND the bloom, and they are the same fault: the edges
  // are what feeds the bloom. `intensity` was 1.15 (1.2 on Aurora Pass), which
  // is about 0.81 once encoded, and postprocess.bloom.threshold is 0.80 - the
  // strip core cleared the bloom threshold, so the glow was handed a value
  // brighter than white and gave it back as a band. Turning the colour down
  // without crossing back under that threshold changes the hue of the wall and
  // not the wall.
  //
  // The values below were SWEPT, not guessed, against the vehicle lights in the
  // same frozen frame (peak 170.1):
  //
  //   intensity/width/glow/halo   strip peak   lights this much of the band
  //   1.20 / 0.30 / 7.0 / 0.28       221.9      37.4%   <- was
  //   0.80 / 0.20 / 5.0 / 0.18       161.9      13.5%
  //   0.55 / 0.15 / 3.5 / 0.14       110.6       8.1%   <- is
  //   0.38 and below                     -       0.0%   strips stop reading
  //
  // 0.55 puts the core under the bloom threshold, so only the very brightest
  // part of the line glows at all, and the peak collapses from 221.9 to 110.6 -
  // comfortably under the traffic it has to sit behind.
  edges: {
    leftColor: 0x22f7ff, // cyan, the median side
    rightColor: 0xff2bd0, // magenta, the shoulder side
    width: 0.15, // halved
    glow: 3.5, // halo reach as a multiple of width; was 7.0
    intensity: 0.55, // under bloom.threshold 0.8 once encoded
    halo: 0.14,
  },

  // PAINTED LANE MARKINGS. Plain white road paint, world-locked: they do not
  // scroll, they stream past at exactly road speed because they are painted
  // on it. That is the comfortable kind of speed cue - the strips below are
  // the other kind, and the reason config/comfort.js exists.
  //
  // A real motorway dash is about 6 m of paint to 9 m of gap. Keeping the
  // real rhythm is most of what makes this read as a highway rather than as
  // a lit strip with lines on it.
  markings: {
    color: 0xb9c4cf, // road paint under sodium-free night light, not white
    laneWidth: 0.16, // the painted line itself
    edgeWidth: 0.2, // the solid line at each edge of the carriageway
    dash: 6.0, // metres of paint
    gap: 9.0, // metres of nothing
    intensity: 0.5, // paint is lit BY the scene; it does not emit
    // The opposite carriageway gets the same markings at a fraction of the
    // brightness, because it is across a median and behind more fog.
    oncomingScale: 0.55,
  },

  // Flowing neon strips on the asphalt.
  // patternLength must be an exact multiple of every lane period, and each
  // period is patternLength / repeats, so the whole pattern is periodic.
  // That is what lets the along-distance wrap without a visible jump.
  strips: {
    patternLength: 240,
    wrapCycles: 256, // wrap every 61440 units, keeps float32 precision sane

    // Scroll tied to how fast the bike is actually going, as a fraction of
    // road speed. NEGATIVE carries the pattern back toward the rider, which
    // ADDS to the flow the road already has: at -0.45 the strips appear to
    // approach at 1.45x the true speed. Cheapest speed cue in the project,
    // and it costs nothing per frame. Each lane's own `speed` is a constant
    // added on top of this.
    scrollFromSpeed: -0.45,
    softness: 0.14, // dash edge fade, as a fraction of the dash length
    glow: 5.0, // halo reach as a multiple of the strip width
    halo: 0.35,

    // OUT OF THE TRAFFIC LANES, and that is the change the highway brought.
    // These used to run down the middle of the asphalt, at +/-2.4 and
    // +/-6.3 metres, where the inner pair sat directly under the cluster -
    // the single worst thing in the frame for anyone prone to motion
    // sickness, scrolling at 1.45 times road speed through the centre of
    // vision, and the whole reason config/comfort.js and the openRoad
    // variant exist.
    //
    // The lanes now carry real painted markings, which stream past at
    // exactly road speed and are the comfortable kind of cue, so the neon
    // has somewhere better to be: the shoulder, both sides of the median,
    // and the far verge. Peripheral motion is where speed cues belong and
    // where the eye does not try to track them. Offsets are in METRES.
    // ANCHORED TO THE LAYOUT, not written out in metres. A strip at a fixed
    // -11.9 was correct for one lane width and silently wrong for the next,
    // which is the same trap the lane markings and the traffic lanes were
    // pulled out of: world/road/layout.js owns every lateral position, and
    // anything that wants one asks. `inset` is metres inboard of the anchor,
    // positive toward the rider's right.
    lanes: [
      { anchor: 'shoulder', inset: -1.2, width: 0.5, color: 0xff36c8, repeats: 6, duty: 0.38, speed: 0, intensity: 0.9 },
      { anchor: 'medianInner', inset: -0.4, width: 0.45, color: 0x2de3ff, repeats: 4, duty: 0.34, speed: 0, intensity: 0.85 },
      { anchor: 'medianOuter', inset: 0.4, width: 0.45, color: 0x39ff88, repeats: 5, duty: 0.30, speed: 0, intensity: 0.7 },
      { anchor: 'farVerge', inset: 1.2, width: 0.5, color: 0xff8a1f, repeats: 3, duty: 0.42, speed: 0, intensity: 0.6 },
    ],
  },
};
