import * as THREE from 'three';

/**
 * ridgeShade - how a ridge gets faces instead of being a cut-out.
 *
 * ================= WHY IT IS NEEDED AT ALL =================
 *
 * The ridges are one `MeshBasicMaterial` with no lights in the scene, so a
 * ridge painted its layer colour is a SILHOUETTE: a correct outline with
 * nothing inside it. That is tolerable against a black sky, where a black
 * shape is a hole and the eye accepts it, and it falls apart completely
 * against Sunset Highway's lit horizon - which is the identical fault the
 * scenery had, and `world/scenery/shading.js` is its identical answer.
 *
 * The colour goes into the vertex buffer, so it costs no material, no draw
 * call and no triangle.
 *
 * ================= TWO TERMS, AND THE SECOND ONE MATTERS MORE =================
 *
 * `ambient` scales the layer's own colour by how the face turns, which is
 * ordinary shading and does almost nothing on the roads that need it most:
 * Sunset Highway's ridges are 0x1a0a16 on purpose, so that they read as
 * silhouettes against a hot sky, and near-black times anything is near-black.
 *
 * `skylight` is what actually gives those ridges faces. A dark slope turned
 * toward a bright horizon picks up the colour of that horizon, so the lit
 * faces get a share of the FOG colour added rather than multiplied. It works
 * on a near-black ridge, it is brightest exactly where the sky is brightest,
 * and it needs nothing from the theme that the theme does not already set.
 *
 * The light is a fixed world direction. A ridge is scenery on the horizon;
 * tying it to each theme's own sun would be four more numbers per road for a
 * difference of a few percent on a shape eight degrees tall.
 */

const _normal = new THREE.Vector2();
const _light = new THREE.Vector2();

/**
 * Writes the colour buffer for one ring from the profile already in
 * `positions`.
 *
 * The vertex layout is peak, base, peak, base - so column `i` is at `i * 6`,
 * and its two vertices are the ones the geometry's own index buffer joins
 * into quads. Reading the profile back out rather than being handed the
 * angles is deliberate: the shading then describes the shape that is
 * actually there, including the radial wobble, rather than the shape the
 * caller meant to make.
 *
 * @param {Float32Array} positions peak/base pairs, x y z each
 * @param {Float32Array} colors written in place, same layout
 * @param {number} segments columns, not counting the duplicated seam
 * @param {THREE.Color} layerColor
 * @param {THREE.Color} fog
 * @param {{ambient:number, skylight:number, azimuth:number}} cfg
 */
export function ridgeShade(positions, colors, segments, layerColor, fog, cfg) {
  _light.set(Math.sin(cfg.azimuth), Math.cos(cfg.azimuth));

  for (let i = 0; i <= segments; i++) {
    // The horizontal tangent, from the neighbours on each side. The seam
    // column wraps to the far end so its face is lit like every other.
    const prev = ((i - 1 + segments) % segments) * 6;
    const next = ((i + 1) % segments) * 6;
    const tx = positions[next] - positions[prev];
    const tz = positions[next + 2] - positions[prev + 2];

    // Turned a quarter, which for a vertical wall is the way it faces.
    _normal.set(tz, -tx);
    if (_normal.lengthSq() > 1e-9) _normal.normalize();

    // Half Lambert: the wrapped term keeps the faces turned away readable
    // instead of collapsing a third of the ring into one flat black.
    const lit = _normal.dot(_light) * 0.5 + 0.5;
    const shade = cfg.ambient + (1 - cfg.ambient) * lit;
    const sky = cfg.skylight * lit;

    const at = i * 6;
    colors[at] = layerColor.r * shade + fog.r * sky;
    colors[at + 1] = layerColor.g * shade + fog.g * sky;
    colors[at + 2] = layerColor.b * shade + fog.b * sky;

    // THE FOOT IS THE FOG COLOUR and is not shaded. That is what makes a
    // ridge melt into the horizon from below instead of standing on it, and
    // shading it would put a dark band along the bottom of every range.
    colors[at + 3] = fog.r;
    colors[at + 4] = fog.g;
    colors[at + 5] = fog.b;
  }
}
