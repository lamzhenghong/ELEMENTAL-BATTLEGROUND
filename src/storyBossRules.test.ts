import assert from 'node:assert/strict';
import { getStageSpec } from './data/storyStages';
import { generateFutureBoss } from './data/story/bossRegistry';

const currentBosses = {
  '4-5': ["Nhal'Kyr, Warden of Whispers", 'ice_golem'],
  '5-5': ['Aevum, Knight of the Last Vow', 'thunderbird'],
  '6-5': ['Rimeflare, Wyrm of Two Seasons', 'fire_dragon'],
  '7-5': ['Aureolith, the Crownless Skywarden', 'ice_golem'],
  '8-5': ['Verdigris, Root of the First Command', 'thunderbird'],
  '9-5': ['Solvane, Monarch of the Final Second', 'fire_dragon'],
  '10-5': ['Orison Prime, Keeper of the Empty Throne', 'ice_golem'],
} as const;

for (const [stageId, [name, bossType]] of Object.entries(currentBosses)) {
  const boss = getStageSpec(stageId).enemies.at(-1)!;
  assert.equal(boss.type, 'Boss');
  assert.equal(boss.name, name);
  assert.equal(boss.bossType, bossType);
}

const first = generateFutureBoss('11-5', 123);
assert.deepEqual(generateFutureBoss('11-5', 123), first);
assert.notEqual(generateFutureBoss('12-5', 133).name.length, 0);

for (const stageId of ['11-5', '12-5', '20-5']) {
  const spec = getStageSpec(stageId);
  assert.equal(spec.enemies[0].level, spec.recommendedLevel);
}
console.log('story boss rules ok');
