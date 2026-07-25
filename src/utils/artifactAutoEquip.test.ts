import assert from 'node:assert/strict';
import { Artifact, ArtifactSet, CharacterRole } from '../types';
import {
  getRecommendedArtifactSet,
  recommendArtifactsForCharacter
} from './artifactAutoEquip';

const artifact = (
  id: string,
  rarity: 3 | 4 | 5,
  set: ArtifactSet = 'Vanguard',
  overrides: Partial<Artifact> = {}
): Artifact => ({
  id,
  name: `${set} ${id}`,
  slot: 'helmet',
  set,
  rarity,
  ...overrides
});

const roleSets: Array<[CharacterRole, ArtifactSet]> = [
  ['dps', 'Vanguard'],
  ['tank', 'Guardian'],
  ['sub-dps', 'Celestial'],
  ['support', 'Chrono']
];

for (const [role, expectedSet] of roleSets) {
  assert.equal(
    getRecommendedArtifactSet(role),
    expectedSet,
    `${role} should recommend the ${expectedSet} set`
  );
}

const recommend = (
  artifacts: Artifact[],
  role: CharacterRole = 'dps',
  characterId = 'selected-hero'
) => recommendArtifactsForCharacter({
  artifacts,
  characterId,
  role
});

const sameSetPreference = recommend([
  artifact('off-set-gold', 5, 'Guardian'),
  artifact('target-blue', 3, 'Vanguard')
]);
assert.equal(
  sameSetPreference.helmet?.id,
  'target-blue',
  'the recommended role set should outrank a higher-rarity off-set artifact'
);

const rarityOrdering = recommend([
  artifact('target-blue', 3),
  artifact('target-purple', 4),
  artifact('target-gold', 5)
]);
assert.equal(
  rarityOrdering.helmet?.id,
  'target-gold',
  'higher rarity should win when set and ownership are equal'
);

const currentOwnerPreference = recommend([
  artifact('unowned-gold', 5),
  artifact('current-owner-gold', 5, 'Vanguard', { equippedTo: 'selected-hero' })
]);
assert.equal(
  currentOwnerPreference.helmet?.id,
  'current-owner-gold',
  'an artifact already equipped by the selected character should receive the ownership bonus'
);

const occupiedItemPenalty = recommend([
  artifact('occupied-gold', 5, 'Vanguard', { equippedTo: 'another-hero' }),
  artifact('available-purple', 4)
]);
assert.equal(
  occupiedItemPenalty.helmet?.id,
  'available-purple',
  'an artifact equipped by another character should receive the occupied-item penalty'
);

const deterministicTie = recommend([
  artifact('first-equal-score', 5, 'Vanguard', { equippedTo: 'another-hero' }),
  artifact('second-equal-score', 3)
]);
assert.equal(
  deterministicTie.helmet?.id,
  'first-equal-score',
  'equal scores should preserve the original inventory order'
);

const recommendationsBySlot = recommend([
  artifact('helmet', 3, 'Vanguard', { slot: 'helmet' }),
  artifact('hands', 3, 'Vanguard', { slot: 'hands' }),
  artifact('leg', 3, 'Vanguard', { slot: 'leg' }),
  artifact('shoe', 3, 'Vanguard', { slot: 'shoe' })
]);
assert.deepEqual(
  Object.fromEntries(
    Object.entries(recommendationsBySlot).map(([slot, item]) => [slot, item?.id])
  ),
  {
    helmet: 'helmet',
    hands: 'hands',
    leg: 'leg',
    shoe: 'shoe'
  },
  'the policy should independently recommend the best artifact for every populated slot'
);

assert.deepEqual(
  recommend([]),
  {},
  'empty inventories should not produce recommendations'
);

console.log('artifact auto-equip policy ok');
