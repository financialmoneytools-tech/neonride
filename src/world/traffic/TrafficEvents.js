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
 * @param {object} events owner carrying impact, nearMiss and the two cooldowns
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
    // A TOTAL, not a level. events.impact is a flash that decays over a third
    // of a second, so anything reading it has to sample at the right moment and
    // will either miss a hit between two frames or see one hit several times
    // depending on the frame rate. A count that only goes up cannot do either,
    // which is what the run's fail state needs.
    events.hits++;
    bike.applyImpact(c.speedLoss);
    // Shove clear, so the player cannot settle inside a vehicle at a matched
    // speed and sit there with the screen permanently flashing.
    bike.knockAside(playerLateral >= vehicle.lateral ? c.knockLateral : -c.knockLateral);

    if (events._impactRefractory <= 0) {
      events.impact = 1;
      events._impactRefractory = c.flashRefractory;
    }
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
      events.nearMiss = 1;
      events.nearMisses++;
      events._nearMissCooldown = cfg.nearMiss.cooldown;
    }
  }
  vehicle.wasBehind = behind;
}
