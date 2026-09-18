import { config } from '../../config.js';

/**
 * TrafficEvents - the collision and near miss rules, kept apart from the pool
 * bookkeeping in Traffic.js so each file has one job.
 */

/**
 * Collision and near miss for one vehicle, judged in road space.
 *
 * The hit LATCHES on the vehicle and releases only on separation. A timer here
 * is what let a hit repeat forever: a player can end up matching a vehicle's
 * speed while inside it, and every expiry fired again.
 *
 * @param {object} events owner carrying the hit and near miss totals and the
 *   near miss cooldown
 * @param {object} fleet
 * @param {object} vehicle
 * @param {number} playerDistance
 * @param {number} playerLateral
 * @param {object} cfg config.world.traffic
 * @param {object} bike
 */
export function testVehicle(events, fleet, vehicle, playerDistance, playerLateral, cfg, bike) {
  const size = fleet.type.size;
  const c = cfg.collision;

  const alongGap = Math.abs(playerDistance - vehicle.distance);
  const lateralGap = Math.abs(playerLateral - vehicle.lateral);

  const alongReach = size.length * 0.5 * vehicle.scale + c.playerHalfLength;
  const lateralReach = size.width * 0.5 * vehicle.scale + c.playerHalfWidth;

  const overlapping = alongGap < alongReach && lateralGap < lateralReach;

  if (c.mode === 'arcade' && overlapping && !vehicle.hit) {
    vehicle.hit = true;
    // A TOTAL, not a level. A level that decays over a third of a second has
    // to be sampled at the right moment, and will either miss a hit between two
    // frames or see one hit several times depending on the frame rate. A count
    // that only goes up cannot do either, which is what the run's fail state
    // needs - and, since fx/Flash.js landed, what the screen flash reads too.
    events.hits++;
    bike.applyImpact(c.speedLoss);
    // Shove clear, so the player cannot settle inside a vehicle at a matched
    // speed and sit there with the screen permanently flashing.
    bike.knockAside(playerLateral >= vehicle.lateral ? c.knockLateral : -c.knockLateral);

    // NO FLASH IS RAISED HERE any more. It used to be, with its own refractory,
    // and this is the wrong place to decide: nothing at this level knows
    // whether the run is still going or whether the rider is inside the grace
    // window, and both of those are the difference between one pulse and a sky
    // that stays red. fx/Flash.js watches `events.hits` rise and answers those
    // questions in one place. See config/flash.js for what that cost.
  }

  // Release on separation, never on a timer: while overlapped the latch stays
  // set, so one pass can only ever be one hit.
  if (vehicle.hit && alongGap > alongReach * 1.6) vehicle.hit = false;

  // A near miss is judged on the frame the player draws level, so one pass
  // fires at most once however long it takes.
  const behind = playerDistance < vehicle.distance;
  if (behind !== vehicle.wasBehind) {
    const edgeGap = lateralGap - lateralReach;
    if (edgeGap > 0 && edgeGap < cfg.nearMiss.range && events._nearMissCooldown <= 0) {
      events.nearMisses++;
      events._nearMissCooldown = cfg.nearMiss.cooldown;
    }
  }
  vehicle.wasBehind = behind;
}
