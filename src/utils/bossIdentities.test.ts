import assert from 'node:assert/strict';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { getCampaignBossForStage } from '../data/story/campaignBosses';
import { getStageSpec } from '../data/storyStages';
import {
  BOSS_IDENTITIES,
  getBossIdentityById,
  getBossIdentityForEnemy
} from './bossIdentities';

assert.equal(BOSS_IDENTITIES.length, 45, 'Every current boss should have one identity');

const identityIds = BOSS_IDENTITIES.map(identity => identity.id);
const identityColors = BOSS_IDENTITIES.map(identity => identity.color);

assert.equal(new Set(identityIds).size, BOSS_IDENTITIES.length, 'Boss identity IDs must be unique');
assert.equal(new Set(identityColors).size, BOSS_IDENTITIES.length, 'Every boss should have a unique accent color');

for (const identity of BOSS_IDENTITIES) {
  assert.ok(identity.mechanic.trim().length >= 24, `${identity.name} needs a useful mechanic description`);
  assert.ok(identity.counter.trim().length >= 12, `${identity.name} needs counter guidance`);
  assert.ok(getBossIdentityById(identity.id), `${identity.name} should resolve by ID`);
}

const campaignBosses = Array.from({ length: 10 }, (_, index) => {
  const stageId = `${index + 1}-5`;
  const stage = getStageSpec(stageId);
  return {
    stageId,
    boss: stage.enemies.find(enemy => enemy.type === 'Boss')
  };
});

for (const { stageId, boss } of campaignBosses) {
  assert.ok(boss, 'Every campaign chapter should end with a boss');
  const definition = getCampaignBossForStage(stageId);
  assert.ok(definition, `${stageId} should have a campaign boss definition`);
  const identity = getBossIdentityForEnemy(boss.name, boss.bossType);
  assert.equal(identity.name, boss.name, `${boss.name} should resolve to its authored identity`);
  assert.equal(identity.category, 'campaign');
  assert.equal(identity.name, definition.name);
  assert.equal(identity.skillName, definition.skillName);
  assert.equal(identity.mechanic, definition.mechanic);
  assert.equal(identity.counter, definition.counter);
  assert.equal(identity.campaignMechanicId, definition.campaignMechanicId);
}

for (const character of PLAYABLE_CHARACTERS) {
  const bossName = `${character.name} Trial Boss`;
  const identity = getBossIdentityForEnemy(bossName);
  assert.equal(identity.name, bossName, `${bossName} should resolve`);
  assert.equal(identity.category, 'trial');
  assert.equal(identity.element, character.element);
  assert.equal(identity.weaponType, character.weaponType);
}

assert.equal(getBossIdentityById('world-calamity-drake')?.mechanicProfile, 'fire_dragon');
assert.equal(getBossIdentityById('world-glacial-golem')?.mechanicProfile, 'ice_golem');
assert.equal(getBossIdentityById('world-tempest-thunderbird')?.mechanicProfile, 'thunderbird');

const unknownBoss = getBossIdentityForEnemy('Unknown Future Boss', 'ice_golem');
assert.equal(unknownBoss.id, 'world-glacial-golem', 'Unknown bosses should retain their existing template model');

console.log('boss identity registry ok');
