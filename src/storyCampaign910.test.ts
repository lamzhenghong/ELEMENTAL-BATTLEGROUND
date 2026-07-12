import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getMemoryUnlockIds,
  getStageSpec,
  getStoryChoice,
  getStoryModifier,
  getStoryScene,
} from './data/story';
import { getStageDialogue } from './data/storyStages';
import type { AuthoredStoryStage, StoryChapterPack } from './data/story';

const chapterModules = await Promise.all(
  [9, 10].map((chapter) => import(`./data/story/campaign/chapter${chapter}`).catch(() => undefined)),
);

assert.deepEqual(
  chapterModules.map(Boolean),
  [true, true],
  'Chapter 9 and Chapter 10 authored packs must exist.',
);
assert.ok(chapterModules[0] && chapterModules[1]);

const packs = [
  chapterModules[0].CHAPTER_9_PACK,
  chapterModules[1].CHAPTER_10_PACK,
] as StoryChapterPack[];

const manifests = [
  {
    pack: packs[0],
    chapter: 9,
    names: ['Paradox Shore', 'Forked Horizon', 'City That Never Was', 'Last Stable Second', 'Chronos Monarch Boss'],
    locations: ['Paradox Verge', 'Forked Horizon', 'Unwritten Capital', 'Last Stable Second', "Monarch's Clockface"],
    enemyNames: ['Rift Mimic', 'Paradox Shade', 'Unwritten Citizen', 'Looping Pursuer', 'Glitch Sentinel', 'Timeline Bailiff'],
    eliteNames: ['Glitch Sentinel', 'Timeline Bailiff'],
    memoryIds: ['chapter-9-other-sun', 'chapter-9-unwritten-city', 'chapter-9-forward-time'],
    memoryTitles: ['Under Another Sun', 'The City That Refused', 'Time Chooses Forward'],
    decisionId: 'chapter-9-route',
    optionIds: ['anchor-present', 'recover-future-record'],
    modifierIds: ['present-anchored', 'future-record'],
  },
  {
    pack: packs[1],
    chapter: 10,
    names: ['Prime Orbit Vestibule', 'Sevenfold Trial', 'Hall of Choosing', 'Catalyst Mirror', 'Eldric Core Prime Boss'],
    locations: ['Prime Orbit Vestibule', 'Sevenfold Matrix', 'Stewardship Hall', 'Catalyst Mirror', 'Prime Defense Core'],
    enemyNames: ['Orbit Custodian', 'Protocol Shade', 'Divine Simulacrum', 'Consensus Warden', 'Sevenfold Examiner', 'Catalyst Replica'],
    eliteNames: ['Sevenfold Examiner', 'Catalyst Replica'],
    memoryIds: ['chapter-10-first-command', 'chapter-10-empty-throne', 'chapter-10-reforged-aetheria'],
    memoryTitles: ['The First Command', 'No Hand Owns the Orbit', 'Aetheria Reforged'],
    decisionId: 'chapter-10-route',
    optionIds: ['restore-divine-protocol', 'shared-mortal-stewardship'],
    modifierIds: ['divine-protocol', 'mortal-stewardship'],
  },
] satisfies Array<{
  pack: StoryChapterPack;
  chapter: number;
  names: string[];
  locations: string[];
  enemyNames: string[];
  eliteNames: string[];
  memoryIds: string[];
  memoryTitles: string[];
  decisionId: string;
  optionIds: string[];
  modifierIds: string[];
}>;

for (const manifest of manifests) {
  assert.equal(manifest.pack.chapter, manifest.chapter);
  assert.deepEqual(Object.keys(manifest.pack.stages), [1, 2, 3, 4, 5].map((stage) => `${manifest.chapter}-${stage}`));
  assert.deepEqual(manifest.pack.memories.map(({ id }) => id), manifest.memoryIds);
  assert.deepEqual(manifest.pack.memories.map(({ title }) => title), manifest.memoryTitles);

  const authoredEnemies = Object.values(manifest.pack.stages).flatMap((stage) => [
    ...stage.enemies,
    ...(stage.variants ?? []).flatMap((variant) => variant.enemies),
  ]);
  const authoredEnemyNames = new Set(authoredEnemies.map(({ name }) => name));
  for (const enemyName of manifest.enemyNames) assert.ok(authoredEnemyNames.has(enemyName), `${enemyName} must be authored.`);
  for (const eliteName of manifest.eliteNames) {
    assert.ok(authoredEnemies.some(({ name, type }) => name === eliteName && type === 'Elite'), `${eliteName} must be Elite.`);
  }

  for (let stageNumber = 1; stageNumber <= 5; stageNumber += 1) {
    const stageId = `${manifest.chapter}-${stageNumber}`;
    const stage = manifest.pack.stages[stageId];

    assert.ok(stage, `${stageId} must be explicitly authored.`);
    assert.equal(getStageSpec(stageId), stage);
    assert.equal(stage.name, manifest.names[stageNumber - 1]);
    assert.equal(stage.location, manifest.locations[stageNumber - 1]);
    assert.equal(stage.difficulty, stageNumber === 5 ? 'Boss' : 'Normal');
    assert.ok(stage.beforeSlides.length >= 2 && stage.beforeSlides.length <= 4);
    assert.ok(stage.afterSlides.length >= 2 && stage.afterSlides.length <= 3);
    assert.deepEqual(getStoryScene(stageId, 'before').slides, stage.beforeSlides);
    assert.deepEqual(getStoryScene(stageId, 'after').slides, stage.afterSlides);

    const expectedUnlocks = [1, 3, 5].includes(stageNumber) ? 1 : 0;
    assert.equal(getMemoryUnlockIds(stageId).length, expectedUnlocks);
  }

  assert.equal(getStoryChoice(`${manifest.chapter}-2`)?.id, manifest.decisionId);
  assert.deepEqual(getStoryChoice(`${manifest.chapter}-2`)?.options.map(({ id }) => id), manifest.optionIds);
  assert.equal(getStoryChoice(`${manifest.chapter}-1`), undefined);
  assert.equal(getStoryChoice(`${manifest.chapter}-3`), undefined);

  const firstRoute = { [manifest.decisionId]: manifest.optionIds[0] };
  const secondRoute = { [manifest.decisionId]: manifest.optionIds[1] };
  assert.equal(getStoryModifier(`${manifest.chapter}-3`, firstRoute)?.id, manifest.modifierIds[0]);
  assert.equal(getStoryModifier(`${manifest.chapter}-3`, secondRoute)?.id, manifest.modifierIds[1]);
  assert.notDeepEqual(getStageSpec(`${manifest.chapter}-3`, firstRoute), getStageSpec(`${manifest.chapter}-3`, secondRoute));
  assert.deepEqual(getStageSpec(`${manifest.chapter}-4`, firstRoute), getStageSpec(`${manifest.chapter}-4`, secondRoute));
  assert.deepEqual(getStageSpec(`${manifest.chapter}-5`, firstRoute), getStageSpec(`${manifest.chapter}-5`, secondRoute));
}

assert.deepEqual(getStageSpec('9-5').enemies, [
  { name: 'Colossus of Pyro', type: 'Boss', element: 'Pyro', level: 103, bossType: 'fire_dragon' },
]);
assert.deepEqual(getStageSpec('10-5').enemies, [
  { name: 'Colossus of Hydro', type: 'Boss', element: 'Hydro', level: 113, bossType: 'ice_golem' },
]);

for (let chapter = 4; chapter <= 10; chapter += 1) {
  for (let stageNumber = 1; stageNumber <= 5; stageNumber += 1) {
    const stageId = `${chapter}-${stageNumber}`;
    const stage = getStageSpec(stageId) as AuthoredStoryStage;
    assert.ok(stage.location, `${stageId} must have an authored location.`);
    assert.ok(getStoryScene(stageId, 'before').slides.length >= 2, `${stageId} must have an authored opening scene.`);
    assert.ok(getStoryScene(stageId, 'after').slides.length >= 2, `${stageId} must have an authored closing scene.`);
    assert.deepEqual(getStageDialogue(stageId).before, getStoryScene(stageId, 'before').slides);
    assert.deepEqual(getStageDialogue(stageId).after, getStoryScene(stageId, 'after').slides);
    assert.ok(stage.enemies.length > 0, `${stageId} must have explicit enemies.`);
    assert.doesNotMatch(stage.desc, /Enter the challenges of/i);
    for (const enemy of stage.enemies) {
      assert.doesNotMatch(enemy.name, /Spore Slime|Shock Slime|Vanguard Elite/);
    }
  }
}

const testDir = dirname(fileURLToPath(import.meta.url));
const campaignSources = ['chapter9.ts', 'chapter10.ts']
  .map((fileName) => readFileSync(join(testDir, 'data', 'story', 'campaign', fileName), 'utf8'))
  .join('\n');
const storyStagesSource = readFileSync(join(testDir, 'data', 'storyStages.ts'), 'utf8');

for (const limitedHero of ['Aurelia', 'Kaelen', 'Maelis', 'Veyra']) {
  assert.doesNotMatch(campaignSources, new RegExp(limitedHero, 'i'));
}

for (const pack of packs) {
  for (const stage of Object.values(pack.stages)) {
    for (const line of [...stage.beforeSlides, ...stage.afterSlides, ...(stage.variants ?? []).flatMap((variant) => variant.afterSlides)]) {
      assert.ok(line.text.length <= 180, `${stage.id} dialogue should stay concise.`);
      assert.doesNotMatch(line.text, /\b(?:client|runtime|modifier|system)\b/i);
    }
  }
}

assert.doesNotMatch(storyStagesSource, /const stageNames/);
assert.doesNotMatch(storyStagesSource, /const chapterLoreContext/);

console.log('story campaign chapters 9-10 ok');
