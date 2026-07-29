import assert from 'node:assert/strict';
import { getStageDialogue, getStageSpec } from '../storyStages';
import { getStoryScene } from './index';
import { getCampaignBossForStage } from './campaignBosses';

const expectedRenamedBosses = [
  "Nhal'Kyr, Warden of Whispers",
  'Aevum, Knight of the Last Vow',
  'Rimeflare, Wyrm of Two Seasons',
  'Aureolith, the Crownless Skywarden',
  'Verdigris, Root of the First Command',
  'Solvane, Monarch of the Final Second',
  'Orison Prime, Keeper of the Empty Throne',
];

for (let chapter = 1; chapter <= 10; chapter += 1) {
  const stageId = `${chapter}-5`;
  const stage = getStageSpec(stageId);
  const boss = stage.enemies.find(enemy => enemy.type === 'Boss');
  const definition = getCampaignBossForStage(stageId);

  assert.ok(boss, `${stageId} must contain a boss`);
  assert.ok(definition, `${stageId} must have a shared campaign boss definition`);
  assert.equal(stage.name, definition.name, `${stageId} stage card must use the campaign boss name`);
  assert.equal(boss.name, definition.name, `${stageId} battle enemy must use the campaign boss name`);

  const authoredBefore = getStoryScene(stageId, 'before').slides;
  const before = authoredBefore.length > 0
    ? authoredBefore
    : getStageDialogue(stageId).before ?? [];
  assert.equal(
    before.some(line => line.speaker === definition.name),
    true,
    `${stageId} dialogue must identify the same campaign boss`
  );

  const fallbackDialogue = getStageDialogue(stageId);
  const fallbackBossLines = [
    ...(fallbackDialogue.before ?? []),
    ...(fallbackDialogue.after ?? []),
  ].filter((line) => line.speaker === definition.name);
  assert.ok(
    fallbackBossLines.length > 0,
    `${stageId} fallback dialogue must use the shared campaign boss name`,
  );
}

assert.deepEqual(
  Array.from(
    { length: 7 },
    (_, index) => getCampaignBossForStage(`${index + 4}-5`)?.name
  ),
  expectedRenamedBosses
);

const newMechanicIds = Array.from(
  { length: 7 },
  (_, index) => getCampaignBossForStage(`${index + 4}-5`)?.campaignMechanicId
);
assert.equal(newMechanicIds.every(Boolean), true, 'Every Chapter 4-10 boss needs a campaign mechanic');
assert.equal(new Set(newMechanicIds).size, 7, 'Every Chapter 4-10 boss mechanic must be unique');

for (let chapter = 1; chapter <= 3; chapter += 1) {
  assert.equal(
    getCampaignBossForStage(`${chapter}-5`)?.campaignMechanicId,
    undefined,
    `Chapter ${chapter} must retain its existing mechanic`
  );
}

console.log('campaign boss identity synchronization ok');
