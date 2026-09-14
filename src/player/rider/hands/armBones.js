/**
 * armBones - finds the bones poseArm needs inside whatever skeleton arrived.
 *
 * Kept apart from the posing itself so that the posing knows nothing about how
 * any particular pack names things. Blender's conventions are what is assumed
 * here: a '.r' / '.l' suffix for the side, 'finger_<name><joint>' for the
 * digits.
 *
 * Note that three's GLTFLoader runs every node name through
 * PropertyBinding.sanitizeNodeName, which strips the characters the animation
 * path syntax reserves - the dot included - so the bone a file calls 'wrist.r'
 * arrives here as 'wristr'. Matching is done on a name with every separator
 * removed, which sidesteps the difference entirely.
 */

const SIDE = 'r';

/** Lower case, letters and digits only, so 'forearm.Twist1.r' and
 *  'forearmTwist1r' are the same string. */
function key(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * @param {import('three').Skeleton} skeleton
 * @returns {{shoulder, bicep, forearm, wrist, fingers: Array<{name, bones}>}}
 */
export function collectArmBones(skeleton) {
  const bones = skeleton.bones;
  const found = {};
  for (const bone of bones) found[key(bone.name)] = bone;

  const pick = (stem) => found[stem + SIDE] || null;

  const fingers = [];
  for (const stem of ['thumb', 'index', 'middle', 'ring', 'pinky']) {
    const chain = [];
    for (let joint = 1; joint <= 3; joint++) {
      const bone = found['finger' + stem + joint + SIDE];
      if (bone) chain.push(bone);
    }
    if (chain.length) fingers.push({ name: stem, bones: chain });
  }

  return {
    shoulder: pick('shoulder'),
    bicep: pick('bicep'),
    forearm: pick('forearm'),
    wrist: pick('wrist'),
    fingers,
  };
}
