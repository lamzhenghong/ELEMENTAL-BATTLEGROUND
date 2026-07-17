import assert from 'node:assert/strict';
import {
  ARTIFACT_FUSION_RULES,
  createFusedArtifact,
  getEligibleFusionArtifacts,
  getArtifactFusionRule,
  getArtifactFusionAvailability
} from './artifactFusion';
import * as artifactFusion from './artifactFusion';
import { Artifact } from '../types';

const artifact = (
  id: string,
  rarity: 3 | 4 | 5,
  overrides: Partial<Artifact> = {}
): Artifact => ({
  id,
  name: "Guardian's Bulwark Greaves",
  set: 'Guardian',
  slot: 'shoe',
  rarity,
  isLocked: false,
  ...overrides
});

assert.deepEqual(ARTIFACT_FUSION_RULES[3], {
  inputRarity: 3,
  resultRarity: 4,
  moraCost: 10000,
  gemCost: 1000,
  inputLabel: '3 Blue',
  outputLabel: '1 Purple'
});

assert.deepEqual(ARTIFACT_FUSION_RULES[4], {
  inputRarity: 4,
  resultRarity: 5,
  moraCost: 25000,
  gemCost: 2500,
  inputLabel: '3 Purple',
  outputLabel: '1 Gold'
});

assert.equal(getArtifactFusionRule(5), null);

const candidates = getEligibleFusionArtifacts([
  artifact('blue-1', 3),
  artifact('blue-2', 3),
  artifact('blue-3', 3),
  artifact('wrong-slot', 3, { slot: 'helmet', name: "Guardian's Crested Crown" }),
  artifact('locked', 3, { isLocked: true }),
  artifact('equipped', 3, { equippedTo: 'aurelia' }),
  artifact('purple', 4)
], artifact('selected', 3));

assert.deepEqual(candidates.map(a => a.id), ['blue-1', 'blue-2', 'blue-3']);

const fused = createFusedArtifact(artifact('purple-source', 4), 'fused-gold');
assert.equal(fused.id, 'fused-gold');
assert.equal(fused.name, "Guardian's Bulwark Greaves");
assert.equal(fused.set, 'Guardian');
assert.equal(fused.slot, 'shoe');
assert.equal(fused.rarity, 5);
assert.equal(fused.isLocked, false);
assert.equal(fused.equippedTo, undefined);

const availabilityCases = [
  {
    name: 'max rarity',
    input: {
      artifact: artifact('gold', 5),
      matchingArtifactCount: 3,
      mora: 99999,
      aetherGems: 99999,
      hasFuseHandler: true
    },
    expected: { canFuse: false, blockReason: 'Gold artifacts are already at maximum tier.' }
  },
  {
    name: 'locked artifact',
    input: {
      artifact: artifact('locked', 3, { isLocked: true }),
      matchingArtifactCount: 3,
      mora: 10000,
      aetherGems: 1000,
      hasFuseHandler: true
    },
    expected: { canFuse: false, blockReason: 'Unlock this artifact before fusion.' }
  },
  {
    name: 'equipped artifact',
    input: {
      artifact: artifact('equipped', 3, { equippedTo: 'aurelia' }),
      matchingArtifactCount: 3,
      mora: 10000,
      aetherGems: 1000,
      hasFuseHandler: true
    },
    expected: { canFuse: false, blockReason: 'Unequip this artifact before fusion.' }
  },
  {
    name: 'insufficient matching copies',
    input: {
      artifact: artifact('too-few', 3),
      matchingArtifactCount: 2,
      mora: 10000,
      aetherGems: 1000,
      hasFuseHandler: true
    },
    expected: { canFuse: false, blockReason: "Need 3 unlocked, unequipped copies of Guardian's Bulwark Greaves." }
  },
  {
    name: 'insufficient currency',
    input: {
      artifact: artifact('too-poor', 4),
      matchingArtifactCount: 3,
      mora: 24999,
      aetherGems: 2499,
      hasFuseHandler: true
    },
    expected: { canFuse: false, blockReason: 'Requires 25,000 Mora and 2,500 Gems.' }
  },
  {
    name: 'missing fusion handler',
    input: {
      artifact: artifact('no-handler', 3),
      matchingArtifactCount: 3,
      mora: 10000,
      aetherGems: 1000,
      hasFuseHandler: false
    },
    expected: { canFuse: false, blockReason: 'Artifact fusion is unavailable right now.' }
  },
  {
    name: 'ready fusion',
    input: {
      artifact: artifact('ready', 3),
      matchingArtifactCount: 3,
      mora: 10000,
      aetherGems: 1000,
      hasFuseHandler: true
    },
    expected: { canFuse: true, blockReason: 'Ready to fuse this artifact part.' }
  }
] as const;

for (const { name, input, expected } of availabilityCases) {
  assert.deepEqual(getArtifactFusionAvailability(input), expected, `fusion availability: ${name}`);
}

type ArtifactFusionRequestFactory = (input: {
  artifact: Artifact;
  fusionArtifacts: Artifact[];
  mora: number;
  aetherGems: number;
  hasFuseHandler: boolean;
  fusedArtifactId?: string;
}) => {
  consumeArtifactIds: string[];
  upgradedArtifact: Artifact;
  costMora: number;
  costGems: number;
} | null;

const createArtifactFusionRequest = (artifactFusion as {
  createArtifactFusionRequest?: ArtifactFusionRequestFactory;
}).createArtifactFusionRequest;

assert.ok(createArtifactFusionRequest, 'artifact fusion must expose a typed request payload factory');

const selectedArtifact = artifact('selected-blue', 3);
const fusionRequest = createArtifactFusionRequest({
  artifact: selectedArtifact,
  fusionArtifacts: [
    selectedArtifact,
    artifact('consume-blue-1', 3),
    artifact('consume-blue-2', 3)
  ],
  mora: 10000,
  aetherGems: 1000,
  hasFuseHandler: true,
  fusedArtifactId: 'fused-purple'
});

assert.deepEqual(fusionRequest, {
  consumeArtifactIds: ['selected-blue', 'consume-blue-1', 'consume-blue-2'],
  upgradedArtifact: {
    id: 'fused-purple',
    name: "Guardian's Bulwark Greaves",
    set: 'Guardian',
    slot: 'shoe',
    rarity: 4,
    isLocked: false,
    equippedTo: undefined
  },
  costMora: 10000,
  costGems: 1000
});

console.log('artifact fusion rules ok');
