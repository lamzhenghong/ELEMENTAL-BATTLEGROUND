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
import type { StoryChapterPack } from './data/story';

const [chapter4Module, chapter5Module] = await Promise.all([
  import('./data/story/campaign/chapter4').catch(() => undefined),
  import('./data/story/campaign/chapter5').catch(() => undefined),
]);

assert.deepEqual(
  [Boolean(chapter4Module), Boolean(chapter5Module)],
  [true, true],
  'Chapter 4 and Chapter 5 authored packs must exist.',
);
assert.ok(chapter4Module && chapter5Module);

const chapter4 = chapter4Module.CHAPTER_4_PACK;
const chapter5 = chapter5Module.CHAPTER_5_PACK;

const manifests = [
  {
    pack: chapter4,
    chapter: 4,
    names: [
      'Gloamvault Descent',
      'Hall of Last Voices',
      'Gallery of Broken Oaths',
      'Crownless Altar',
      'Void Overlord Boss',
    ],
    locations: [
      'The Last-Lamp Stair',
      'Surveyor Gallery',
      'The Sealed Procession',
      'Throne Without a King',
      'Heart of Gloamvault',
    ],
    memoryIds: [
      'chapter-4-last-lamp',
      'chapter-4-seven-names',
      'chapter-4-first-whisper',
    ],
    memoryTitles: ['The Last Lamp', 'Seal of Seven Names', 'The First Whisper'],
  },
  {
    pack: chapter5,
    chapter: 5,
    names: [
      'Starlight Threshold',
      'Mirror Pilgrims',
      'Hall of Borrowed Faces',
      'Clockless Dais',
      'Eternity Knight Boss',
    ],
    locations: [
      'Astral Reliquary Gate',
      'Procession of Reflections',
      'Thousandfold Gallery',
      'Reliquary Zenith',
      'Sanctuary Outside Time',
    ],
    memoryIds: [
      'chapter-5-star-map',
      'chapter-5-borrowed-face',
      'chapter-5-eternal-vow',
    ],
    memoryTitles: ['Map Without North', 'A Face That Remembered', "The Knight's Last Vow"],
  },
] satisfies Array<{
  pack: StoryChapterPack;
  chapter: number;
  names: string[];
  locations: string[];
  memoryIds: string[];
  memoryTitles: string[];
}>;

for (const manifest of manifests) {
  assert.equal(manifest.pack.chapter, manifest.chapter);
  assert.deepEqual(Object.keys(manifest.pack.stages), [1, 2, 3, 4, 5].map((stage) => `${manifest.chapter}-${stage}`));
  assert.deepEqual(manifest.pack.memories.map(({ id }) => id), manifest.memoryIds);
  assert.deepEqual(manifest.pack.memories.map(({ title }) => title), manifest.memoryTitles);

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
}

assert.deepEqual(getStoryChoice('4-2'), {
  id: 'chapter-4-route',
  prompt: 'The seal is failing while the surveyors call from below. What comes first?',
  options: [
    { id: 'rescue-surveyors', label: 'Rescue the surveyors', consequence: 'Gain local guidance in the next battle.' },
    { id: 'secure-whisper-seal', label: 'Secure the Whisper Seal', consequence: 'Weaken the shades in the next battle.' },
  ],
});
assert.deepEqual(
  getStoryChoice('5-2')?.options.map(({ id }) => id),
  ['trust-reflection', 'break-mirror'],
);

const rescueRoute = { 'chapter-4-route': 'rescue-surveyors' };
const sealRoute = { 'chapter-4-route': 'secure-whisper-seal' };
assert.deepEqual(getStageSpec('4-3').enemies, getStageSpec('4-3', rescueRoute).enemies);
assert.deepEqual(
  getStageSpec('4-3', rescueRoute).enemies.map(({ name }) => name),
  ['Sable Pursuer', 'Oathless Guard'],
);
assert.deepEqual(
  getStageSpec('4-3', sealRoute).enemies.map(({ name }) => name),
  ['Grief Echo', 'Crownless Retainer'],
);
assert.equal(getStoryModifier('4-3', rescueRoute)?.id, 'surveyors-guidance');
assert.equal(getStoryModifier('4-3', sealRoute)?.id, 'whisper-sealed');
assert.deepEqual(getStageSpec('4-4', rescueRoute), getStageSpec('4-4', sealRoute));
assert.deepEqual(getStageSpec('4-5', rescueRoute), getStageSpec('4-5', sealRoute));

const trustRoute = { 'chapter-5-route': 'trust-reflection' };
const breakRoute = { 'chapter-5-route': 'break-mirror' };
assert.deepEqual(getStageSpec('5-3').enemies, getStageSpec('5-3', trustRoute).enemies);
assert.deepEqual(
  getStageSpec('5-3', trustRoute).enemies.map(({ name }) => name),
  ['Astral Examiner', 'Gentle Echo'],
);
assert.deepEqual(
  getStageSpec('5-3', breakRoute).enemies.map(({ name }) => name),
  ['Mirror Shardling', 'Enraged Reflection'],
);
assert.equal(getStoryModifier('5-3', trustRoute)?.id, 'trusted-reflection');
assert.equal(getStoryModifier('5-3', breakRoute)?.id, 'broken-mirror');
assert.deepEqual(getStageSpec('5-4', trustRoute), getStageSpec('5-4', breakRoute));
assert.deepEqual(getStageSpec('5-5', trustRoute), getStageSpec('5-5', breakRoute));

assert.deepEqual(getStageSpec('4-5').enemies, [
  { name: 'Colossus of Cryo', type: 'Boss', element: 'Cryo', level: 53, bossType: 'ice_golem' },
]);
assert.deepEqual(getStageSpec('5-5').enemies, [
  { name: 'Colossus of Electro', type: 'Boss', element: 'Electro', level: 63, bossType: 'thunderbird' },
]);

const testDir = dirname(fileURLToPath(import.meta.url));
const campaignSources = ['chapter4.ts', 'chapter5.ts']
  .map((fileName) => readFileSync(join(testDir, 'data', 'story', 'campaign', fileName), 'utf8'))
  .join('\n');

for (const limitedHero of ['Aurelia', 'Kaelen', 'Maelis', 'Veyra']) {
  assert.doesNotMatch(campaignSources, new RegExp(limitedHero, 'i'));
}

for (const pack of [chapter4, chapter5] as StoryChapterPack[]) {
  for (const stage of Object.values(pack.stages)) {
    for (const line of [...stage.beforeSlides, ...stage.afterSlides, ...(stage.variants ?? []).flatMap((variant) => variant.afterSlides)]) {
      assert.ok(line.text.length <= 180, `${stage.id} dialogue should stay concise.`);
      assert.doesNotMatch(line.text, /\b(?:client|runtime|modifier|system)\b/i);
    }
  }
}

console.log('story campaign chapters 4-5 ok');
