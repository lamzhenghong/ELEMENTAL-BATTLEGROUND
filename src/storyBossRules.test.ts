import assert from 'node:assert/strict';
import { getStageSpec } from './data/storyStages';
import { generateFutureBoss } from './data/story/bossRegistry';

const currentBosses = {
  '4-5': ['Colossus of Cryo', 'ice_golem'],
  '5-5': ['Colossus of Electro', 'thunderbird'],
  '6-5': ['Colossus of Anemo', 'fire_dragon'],
  '7-5': ['Colossus of Geo', 'ice_golem'],
  '8-5': ['Colossus of Dendro', 'thunderbird'],
  '9-5': ['Colossus of Pyro', 'fire_dragon'],
  '10-5': ['Colossus of Hydro', 'ice_golem'],
} as const;

for (const [stageId, [name, bossType]] of Object.entries(currentBosses)) {
  const boss = getStageSpec(stageId).enemies.at(-1)!;
  assert.equal(boss.type, 'Boss');
  assert.equal(boss.name, name);
  assert.equal(boss.bossType, bossType);
}

const first = generateFutureBoss('11-5');
assert.deepEqual(generateFutureBoss('11-5'), first);
assert.notEqual(generateFutureBoss('12-5').name.length, 0);
console.log('story boss rules ok');
