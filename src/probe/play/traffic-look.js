import * as THREE from 'three';

/**
 * Re-materials the game's traffic as painted metal, in place.
 *
 * world/traffic/VehicleMesh.js builds each vehicle as three InstancedMeshes -
 * Body, Strip, Tail - with MeshBasicMaterial. Only the BODY is swapped here:
 * the strips and the tails are lights, and a light is emissive in a realistic
 * scene exactly as it is in a neon one. A tail lamp lit by the moon would be a
 * tail lamp that is off.
 *
 * NOTHING IS REBUILT. The instanced geometry, the pools, the per instance
 * colours and the collision boxes are all the shipped ones; the body meshes are
 * handed a different material and told to cast shadows. That is the same claim
 * play/road-look.js makes, and between them they are most of the answer to what
 * a realistic conversion would cost: the look is a material layer, not a
 * rewrite.
 *
 * WHAT IS LOST, and it is worth naming: the basic materials carry an injected
 * distance fade (`applyDistanceFade`) that dissolves a vehicle before the chunk
 * it stands on is recycled. A MeshStandardMaterial built here does not, so the
 * fog in play/look.js has to do that job instead. On a clear day it would not
 * be enough and the vehicles would pop.
 */
export class TrafficLook {
  constructor(options = {}) {
    // Car paint: a clearcoat over colour, like the bike's. `vertexColors` and
    // the instance colour are both kept, because that is how each vehicle gets
    // its own paint and how the dark parts stay dark - see VehicleMesh.
    this.body = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      metalness: 0.5,
      roughness: 0.34,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      envMapIntensity: options.envIntensity === undefined ? 0.5 : options.envIntensity,
    });
    this.swapped = 0;
  }

  /**
   * @param {import('../../world/Traffic.js').Traffic} traffic
   */
  apply(traffic) {
    traffic.group.traverse((object) => {
      if (!object.isMesh) return;
      // THE LAMPS ARE TONE MAPPED HERE AND NOT IN THE GAME. VehicleMesh builds
      // the strips and the tails with `toneMapped: false` so their colour
      // survives the neon grade exactly as authored - which is right for neon
      // and wrong here, where it means a marker light punches straight through
      // an ACES curve and comes out as a saturated cyan dot on a night road.
      // Letting the tone mapper have them is most of what stops the traffic
      // looking like an arcade game.
      if (object.name.endsWith('_Strip') || object.name.endsWith('_Tail')) {
        const material = object.material;
        if (material && material.toneMapped === false) {
          material.toneMapped = true;
          material.needsUpdate = true;
        }
        return;
      }
      if (!object.name.endsWith('_Body')) return;
      object.material = this.body;
      object.castShadow = true;
      // NOT receiveShadow. These are instanced meshes spanning a kilometre with
      // `frustumCulled` off, and putting them in the receive pass costs a full
      // extra traversal of every instance for a shadow that lands on a roof
      // nobody is looking at.
      object.receiveShadow = false;
      this.swapped++;
    });
    return this.swapped;
  }

  dispose() {
    this.body.dispose();
  }
}
