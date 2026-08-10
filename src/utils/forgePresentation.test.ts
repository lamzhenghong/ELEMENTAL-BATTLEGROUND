import assert from 'node:assert/strict';
import {
  getArtifactSilhouette,
  getForgeAnimationProfile,
  getRarityColor,
  getWeaponSilhouette,
} from './forgePresentation';

for (const [weaponType, silhouetteId] of [
  ['Sword', 'sword'],
  ['Claymore', 'claymore'],
  ['Bow', 'bow'],
  ['Catalyst', 'catalyst'],
  ['Polearm', 'polearm'],
] as const) {
  assert.equal(
    getWeaponSilhouette(weaponType).id,
    silhouetteId,
    `${weaponType} should have its own forge silhouette`,
  );
}

for (const [slot, silhouetteId] of [
  ['helmet', 'helmet'],
  ['hands', 'hands'],
  ['leg', 'legs'],
  ['shoe', 'boots'],
] as const) {
  assert.equal(
    getArtifactSilhouette(slot).id,
    silhouetteId,
    `${slot} should have its own forge silhouette`,
  );
}

assert.equal(getRarityColor(3), '#60a5fa');
assert.equal(getRarityColor(4), '#c084fc');
assert.equal(getRarityColor(5), '#fbbf24');

assert.deepEqual(getForgeAnimationProfile('upgrade'), {
  orbitingNodes: 6,
  sourceNodes: 0,
  durationMs: 720,
});
assert.deepEqual(getForgeAnimationProfile('fusion'), {
  orbitingNodes: 0,
  sourceNodes: 3,
  durationMs: 860,
});
assert.deepEqual(getForgeAnimationProfile('failure'), {
  orbitingNodes: 0,
  sourceNodes: 0,
  durationMs: 0,
});

console.log('forge presentation models ok');
