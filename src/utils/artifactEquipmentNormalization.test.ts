import assert from 'node:assert/strict';
import type { Artifact } from '../types';
import { normalizeArtifactEquipment } from './artifactEquipment';

const artifacts: Artifact[] = [
  { id: 'head-a', name: 'A', slot: 'helmet', set: 'Guardian', rarity: 5, equippedTo: 'wrong' },
  { id: 'hands-a', name: 'B', slot: 'hands', set: 'Vanguard', rarity: 4 },
];

const normalized = normalizeArtifactEquipment(artifacts, {
  aurelia: { helmet: 'head-a', hands: 'missing', shoe: 'hands-a' },
  kaelen: { helmet: 'head-a' },
});

assert.deepEqual(normalized.characterEquippedArtifacts, {
  aurelia: { helmet: 'head-a' },
  kaelen: {},
});
assert.equal(normalized.inventoryArtifacts.find(artifact => artifact.id === 'head-a')?.equippedTo, 'aurelia');
assert.equal(normalized.inventoryArtifacts.find(artifact => artifact.id === 'hands-a')?.equippedTo, undefined);

console.log('artifact equipment normalization rules ok');
