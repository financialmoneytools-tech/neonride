/**
 * The traffic scan, as a string of browser code shared by every tool that
 * needs it.
 *
 * It is a string rather than an import because it runs inside the PAGE, under
 * `page.evaluate`, where nothing from node is in scope. Keeping it in one
 * place is what stops the level check and any later check from measuring
 * subtly different things and disagreeing about whether the road is fair.
 *
 * ================= WHAT IT MEASURES, AND WHY EACH ONE =================
 *
 * `noCorridor`   frames on which no free lateral corridor existed anywhere
 *                across the carriageway inside the rider's reaction distance.
 *                THIS is the hard failure and the only honest one: it unions
 *                the lateral span every vehicle blocks and asks whether a bike
 *                width is left anywhere. Nowhere to go and no time to find it
 *                is what unfair means.
 *
 * `trapped`      the older proxy: all four LANE CENTRES occupied. Reported,
 *                never asserted. The bike's lateral position is continuous and
 *                it rides between lanes as often as in them, so four occupied
 *                lanes with a gap between two of the vehicles is a passable
 *                road that this calls a wall. It swung 0.0% to 4.6% between
 *                two roads at the SAME level, which is what a proxy measuring
 *                the wrong thing looks like.
 *
 * `fourAbreast`  frames on which some 58 m stretch ANYWHERE in the visible
 *                road had all four lanes occupied. Not automatically unfair -
 *                it may be eight hundred metres away and gone by the time the
 *                rider arrives - but it is the shape that becomes `trapped`,
 *                so it is the leading indicator and it is compared between
 *                levels and against endless mode.
 *
 * `overlaps`     pairs of vehicles in the SAME LANE whose bodies intersect.
 *                This is a defect and it predates levels: `_admits` is a
 *                PLACEMENT filter, checked once when a vehicle respawns, and
 *                nothing maintains spacing afterwards. Two vehicles in a lane
 *                close at their speed difference and eventually pass through
 *                each other. Measured in endless mode on an untouched build:
 *                1402 overlapping pairs over 421 frames, worst gap -10.74 m.
 *                It is reported rather than asserted because asserting it
 *                would fail every build including the ones before this work.
 */

export const SCAN_SOURCE = `
function makeScan(N) {
  const state = {
    frames: 0, noCorridor: 0, trapped: 0, fourAbreast: 0, overlaps: 0, pairs: 0,
    minEdgeGap: Infinity, maxAbreast: 0, maxTrucksAbreast: 0,
  };

  state.sample = function sample() {
    const cfg = N.config.world.traffic;
    const window = N.config.levels.floor.escapeWindow;
    const here = N.loop.state.distance || 0;
    const speed = N.loop.state.speed || 0;
    // A FIXED YARDSTICK, not the level's own promise. Measuring against
    // 'model.gap' was self-defeating: that gap SHRINKS as levels get harder,
    // so the window the test looked at shrank with it and level ten scored
    // better than level five by being given a smaller road to be fair over.
    // 'minReactionSeconds' is the floor below which config/levels.js says the
    // road is unfair whatever else is true, so it is the same yardstick at
    // every level, which is the only way ten of them can be compared.
    const reach = N.config.levels.floor.minReactionSeconds * speed;

    const live = [];
    for (const fleet of N.traffic.fleets) {
      for (const v of fleet.vehicles) {
        if (!v.active) continue;
        const along = v.distance - here;
        if (along < -40 || along > cfg.spawnAhead) continue;
        live.push({
          d: v.distance, lane: v.lane, truck: !!fleet.type.truck,
          // The DRAWN size: _place scales the mesh by vehicle.scale, so the
          // type's dimensions are only what they would be at a jitter of zero.
          len: fleet.type.size.length * v.scale,
          wide: fleet.type.size.width * v.scale,
          // WHERE IT ACTUALLY IS, not where its lane is. A motorcycle weaves
          // inside its lane, so its lane centre is not its position.
          lat: v.lateral,
        });
      }
    }
    live.sort(function (a, b) { return a.d - b.d; });

    // --- 1. is there anywhere to go, right now? ---------------------------
    //
    // A FREE CORRIDOR, not four occupied lane centres. Counting lanes was the
    // obvious test and it is wrong in a way that flatters and damns at random:
    // the bike's lateral position is CONTINUOUS and reaches past the outer
    // lanes, so it rides BETWEEN lanes as often as in them. Four occupied lane
    // centres with a two metre gap between two of the vehicles is a road with
    // a way through it, and the lane count calls it a wall. Measured, that
    // proxy swung from 0.0% to 4.6% between two roads AT THE SAME LEVEL, which
    // is the signature of a metric measuring where cars happen to sit rather
    // than whether the rider can get past them.
    //
    // So this unions the lateral span each vehicle blocks - its own width plus
    // the bike's half width either side - and asks whether anything is left.
    const half = N.config.world.traffic.collision.playerHalfWidth;
    const limit = N.config.player.bike.lateralLimit;
    const spans = [];
    for (let i = 0; i < live.length; i++) {
      const front = live[i].d - live[i].len * 0.5;
      const back = live[i].d + live[i].len * 0.5;
      if (back < here || front > here + reach) continue;
      const pad = live[i].wide * 0.5 + half;
      spans.push([live[i].lat - pad, live[i].lat + pad]);
    }
    if (spans.length) {
      spans.sort(function (a, b) { return a[0] - b[0]; });
      let cursor = -limit;
      let free = false;
      for (let i = 0; i < spans.length; i++) {
        if (spans[i][0] > cursor) { free = true; break; }
        if (spans[i][1] > cursor) cursor = spans[i][1];
      }
      if (!free && cursor < limit) free = true;
      if (!free) state.noCorridor++;
    }

    // The old lane count, kept and REPORTED rather than asserted, because it
    // is still the cheapest way to see a road getting busier - it is simply
    // not the thing that decides whether a road is passable.
    const blocked = new Set();
    for (let i = 0; i < live.length; i++) {
      const front = live[i].d - live[i].len * 0.5;
      const back = live[i].d + live[i].len * 0.5;
      if (back < here || front > here + reach) continue;
      blocked.add(live[i].lane);
    }
    if (blocked.size >= N.traffic.lanes.length) state.trapped++;

    // --- 2. the shape that becomes that -----------------------------------
    // ONLY ROAD THE RIDER WILL ACTUALLY REACH SOON. Scanning the whole nine
    // hundred metre horizon measured density and almost nothing else: with
    // thirty vehicles in sight, SOME 58 m stretch has four lanes in it nearly
    // always, and most of those stretches have dissolved long before anybody
    // arrives. Two seconds of travel is the horizon a rider is committing to.
    const soon = here + speed * 2;
    let sawFour = false;
    for (let i = 0; i < live.length; i++) {
      if (live[i].d > soon) break;
      const lanes = new Set([live[i].lane]);
      let trucks = live[i].truck ? 1 : 0;
      for (let j = i + 1; j < live.length && live[j].d - live[i].d < window; j++) {
        lanes.add(live[j].lane);
        if (live[j].truck) trucks++;
      }
      if (lanes.size > state.maxAbreast) state.maxAbreast = lanes.size;
      if (trucks > state.maxTrucksAbreast) state.maxTrucksAbreast = trucks;
      if (lanes.size >= N.traffic.lanes.length) sawFour = true;
    }
    if (sawFour) state.fourAbreast++;

    // --- 3. the pre-existing drift ----------------------------------------
    // Edge to edge, not centre to centre: two 16 m semis 10 m apart are
    // inside each other, and a centre distance would call that a gap.
    for (let i = 1; i < live.length; i++) {
      if (live[i].lane !== live[i - 1].lane) continue;
      state.pairs++;
      const gap = live[i].d - live[i - 1].d - (live[i].len + live[i - 1].len) * 0.5;
      if (gap < state.minEdgeGap) state.minEdgeGap = gap;
      if (gap < 0) state.overlaps++;
    }

    state.frames++;
  };

  state.snapshot = function snapshot() {
    return {
      frames: state.frames,
      noCorridor: state.noCorridor,
      trapped: state.trapped,
      fourAbreast: state.fourAbreast,
      overlaps: state.overlaps,
      pairs: state.pairs,
      minEdgeGap: state.minEdgeGap === Infinity ? null : state.minEdgeGap,
      maxAbreast: state.maxAbreast,
      maxTrucksAbreast: state.maxTrucksAbreast,
    };
  };

  return state;
}
`;

/**
 * Per-frame rates, so a short sample and a long one can be compared.
 * @param {object} s a snapshot
 * @returns {{trapped: number, fourAbreast: number, overlaps: number}}
 */
export function rates(s) {
  const frames = Math.max(1, s.frames);
  return {
    noCorridor: s.noCorridor / frames,
    trapped: s.trapped / frames,
    fourAbreast: s.fourAbreast / frames,
    overlaps: s.overlaps / frames,
  };
}
