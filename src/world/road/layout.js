import { config } from '../../config.js';

/**
 * layout - the highway's cross section, in METRES, derived once from config.
 *
 * Everything lateral in the world now agrees because it all comes from here:
 * the ribbon geometry, the road shader's markings, where traffic sits, where
 * the median barrier stands and where the oncoming carriageway is. A lane
 * centre written out twice is a lane centre that will disagree once.
 *
 * ACROSS IS IN METRES AND ZERO IS THE MIDDLE OF OUR CARRIAGEWAY. It used to be
 * normalised, -1 at the left rim of the ribbon and +1 at the right, which was
 * fine while the ribbon was symmetric and a plain strip of asphalt. A real
 * highway is not symmetric - four lanes our way, then a median, then four more
 * coming the other way - so a normalised coordinate would mean every marking
 * position depended on the total width, and widening the verge would move the
 * lane markings. In metres nothing moves anything else.
 *
 * WE DRIVE ON THE RIGHT, so the median is to the LEFT (negative across) and the
 * hard shoulder is to the right. That is the one convention the whole file
 * hangs on; flipping it means flipping every sign here and nothing else.
 */

/**
 * @typedef {object} RoadLayout
 * @property {number} laneWidth
 * @property {number[]} laneCentres our lanes, left to right, in metres
 * @property {number[]} laneEdges the dividers between our lanes
 * @property {number} left our carriageway's left edge (median side)
 * @property {number} right our carriageway's right edge (shoulder side)
 * @property {number} shoulderEdge outer edge of the hard shoulder
 * @property {number} medianInner near edge of the median, from us
 * @property {number} medianOuter far edge of the median
 * @property {number} medianCentre where the barrier stands
 * @property {number[]} oncomingCentres lanes of the opposite carriageway
 * @property {number} oncomingInner near edge of the opposite carriageway
 * @property {number} oncomingOuter far edge of it
 * @property {number} ribbonLeft left rim of the drawn ribbon
 * @property {number} ribbonRight right rim of it
 */

/** @returns {RoadLayout} */
export function roadLayout() {
  const c = config.world.road.carriageway;

  const half = (c.lanes * c.laneWidth) / 2;
  const laneCentres = [];
  const laneEdges = [];
  for (let i = 0; i < c.lanes; i++) {
    laneCentres.push(-half + c.laneWidth * (i + 0.5));
    if (i > 0) laneEdges.push(-half + c.laneWidth * i);
  }

  const medianInner = -half - c.medianGap;
  const medianOuter = medianInner - c.medianWidth;
  const oncomingInner = medianOuter;
  const oncomingOuter = oncomingInner - c.oncomingLanes * c.laneWidth;

  const oncomingCentres = [];
  for (let i = 0; i < c.oncomingLanes; i++) {
    oncomingCentres.push(oncomingInner - c.laneWidth * (i + 0.5));
  }

  return {
    laneWidth: c.laneWidth,
    laneCentres,
    laneEdges,
    left: -half,
    right: half,
    shoulderEdge: half + c.shoulderRight,
    medianInner,
    medianOuter,
    medianCentre: (medianInner + medianOuter) / 2,
    oncomingCentres,
    oncomingInner,
    oncomingOuter,
    shoulderLeft: oncomingOuter - c.shoulderRight,
    ribbonRight: half + c.shoulderRight + c.verge,
    ribbonLeft: oncomingOuter - c.shoulderRight - c.verge,
  };
}

/**
 * Resolves a named lateral anchor to metres, so nothing has to write a position
 * out in numbers that a change to the lane width would silently invalidate.
 * @param {RoadLayout} layout
 * @param {string} anchor
 * @returns {number}
 */
export function anchorAt(layout, anchor) {
  switch (anchor) {
    case 'shoulder': return layout.shoulderEdge;
    case 'right': return layout.right;
    case 'left': return layout.left;
    case 'medianInner': return layout.medianInner;
    case 'medianOuter': return layout.medianOuter;
    case 'medianCentre': return layout.medianCentre;
    case 'farVerge': return layout.shoulderLeft;
    default: return 0;
  }
}
