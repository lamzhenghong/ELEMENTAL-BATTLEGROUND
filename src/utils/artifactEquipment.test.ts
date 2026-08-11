import assert from 'node:assert/strict';
import test from 'node:test';
import type { Artifact } from '../types';
import { unequipAllArtifactsForCharacter } from './artifactEquipment';

const artifacts: Artifact[] = [
  { id: 'a-helmet', name: 'Helm', slot: 'helmet', set: 'Vanguard', rarity: 5, equippedTo: 'hero-a' },
  { id: 'a-hands', name: 'Hands', slot: 'hands', set: 'Vanguard', rarity: 4, equippedTo: 'hero-a' },
  { id: 'b-leg', name: 'Leg', slot: 'leg', set: 'Guardian', rarity: 5, equippedTo: 'hero-b' },
];

const equipped = {
  'hero-a': { helmet: 'a-helmet', hands: 'a-hands' },
  'hero-b': { leg: 'b-leg' },
};

test('unequips every artifact from one character without changing other characters', () => {
  const result = unequipAllArtifactsForCharacter(artifacts, equipped, 'hero-a');

  assert.deepEqual(result.characterEquippedArtifacts['hero-a'], {});
  assert.deepEqual(result.characterEquippedArtifacts['hero-b'], { leg: 'b-leg' });
  assert.equal(result.inventoryArtifacts.find(artifact => artifact.id === 'a-helmet')?.equippedTo, undefined);
  assert.equal(result.inventoryArtifacts.find(artifact => artifact.id === 'a-hands')?.equippedTo, undefined);
  assert.equal(result.inventoryArtifacts.find(artifact => artifact.id === 'b-leg')?.equippedTo, 'hero-b');
});

test('returns immutable copies and reports when nothing was equipped', () => {
  const result = unequipAllArtifactsForCharacter(artifacts, equipped, 'hero-c');

  assert.equal(result.didUnequip, false);
  assert.notEqual(result.inventoryArtifacts, artifacts);
  assert.notEqual(result.characterEquippedArtifacts, equipped);
  assert.equal(artifacts[0].equippedTo, 'hero-a');
  assert.deepEqual(equipped['hero-a'], { helmet: 'a-helmet', hands: 'a-hands' });
});
