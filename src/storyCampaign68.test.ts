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

const chapterModules = await Promise.all(
  [6, 7, 8].map((chapter) => import(`./data/story/campaign/chapter${chapter}`).catch(() => undefined)),
);

assert.deepEqual(
  chapterModules.map(Boolean),
  [true, true, true],
  'Chapter 6 through Chapter 8 authored packs must exist.',
);
assert.ok(chapterModules[0] && chapterModules[1] && chapterModules[2]);

const packs = [
  chapterModules[0].CHAPTER_6_PACK,
  chapterModules[1].CHAPTER_7_PACK,
  chapterModules[2].CHAPTER_8_PACK,
] as StoryChapterPack[];

const manifests = [
  {
    pack: packs[0],
    chapter: 6,
    names: ['Rimeforge Threshold', 'Split Current Works', 'Vaporworks Crossing', 'Engine of Two Seasons', 'Frostfire Wyrm Boss'],
    locations: ['Rimeforge Gate', 'Broken Climate Works', 'White-Steam Causeway', 'Twin-Season Engine', 'Faultheart Caldera'],
    enemyNames: ['Steam Wretch', 'Rime Crawler', 'Pressure Keeper', 'Meltwater Stalker', 'Tempered Sentinel', 'Fault Engineer'],
    memoryIds: ['chapter-6-first-gauge', 'chapter-6-sabotage-order', 'chapter-6-changing-balance'],
    memoryTitles: ['The First Gauge', 'Order for Perfect Winter', 'Balance Must Move'],
    decisionId: 'chapter-6-route',
    optionIds: ['vent-magma', 'thaw-glacier'],
    modifierIds: ['magma-vented', 'glacier-thawed'],
  },
  {
    pack: packs[1],
    chapter: 7,
    names: ['Fallen Sky Dock', 'Anchor District', 'Aethelwing Causeway', 'Crownwind Spire', 'Skyward Avian Boss'],
    locations: ['Lower Cloud Harbor', 'Anchor Ward', 'Aethelwing Skyroad', 'Crownwind Observatory', 'Eye Above the Spires'],
    enemyNames: ['Gale Harrier', 'Skyroad Prowler', 'Anchor Breaker', 'Prism Talon', 'Windchain Custodian', 'Crownwind Warden'],
    memoryIds: ['chapter-7-falling-bell', 'chapter-7-anchor-keeper', 'chapter-7-open-sky'],
    memoryTitles: ['The Falling Bell', "Anchor Keeper's Ledger", 'What Holds the Sky'],
    decisionId: 'chapter-7-route',
    optionIds: ['evacuate-settlement', 'stabilize-anchors'],
    modifierIds: ['civilians-evacuated', 'anchors-stabilized'],
  },
  {
    pack: packs[2],
    chapter: 8,
    names: ['Cinderlift Descent', 'Worldforge Control', 'Hammerfall Foundry', 'Crucible Keyway', 'Molten Overlord Boss'],
    locations: ['Mount Eldruin Cinderlift', 'Worldforge Control Ring', 'Hammerfall Foundry', 'Crucible Keyway', 'Planetary Anvil'],
    enemyNames: ['Cinder Scavenger', 'Furnace Husk', 'Chainforged Guard', 'Crucible Artificer', 'Worldforge Warden', 'Keyway Adjudicator'],
    memoryIds: ['chapter-8-bound-orbits', 'chapter-8-smiths-refusal', 'chapter-8-reclaimed-fire'],
    memoryTitles: ['When Orbits Were Chained', "The Smith's Refusal", 'Fire Without a Master'],
    decisionId: 'chapter-8-route',
    optionIds: ['disable-forge', 'reforge-key'],
    modifierIds: ['forge-disabled', 'key-reforged'],
  },
] satisfies Array<{
  pack: StoryChapterPack;
  chapter: number;
  names: string[];
  locations: string[];
  enemyNames: string[];
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

  const authoredEnemyNames = new Set(
    Object.values(manifest.pack.stages).flatMap((stage) => [
      ...stage.enemies.map(({ name }) => name),
      ...(stage.variants ?? []).flatMap((variant) => variant.enemies.map(({ name }) => name)),
    ]),
  );
  for (const enemyName of manifest.enemyNames) assert.ok(authoredEnemyNames.has(enemyName), `${enemyName} must be authored.`);

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

assert.deepEqual(getStageSpec('6-5').enemies, [
  { name: 'Colossus of Anemo', type: 'Boss', element: 'Anemo', level: 73, bossType: 'fire_dragon' },
]);
assert.deepEqual(getStageSpec('7-5').enemies, [
  { name: 'Colossus of Geo', type: 'Boss', element: 'Geo', level: 83, bossType: 'ice_golem' },
]);
assert.deepEqual(getStageSpec('8-5').enemies, [
  { name: 'Colossus of Dendro', type: 'Boss', element: 'Dendro', level: 93, bossType: 'thunderbird' },
]);

const testDir = dirname(fileURLToPath(import.meta.url));
const campaignSources = ['chapter6.ts', 'chapter7.ts', 'chapter8.ts']
  .map((fileName) => readFileSync(join(testDir, 'data', 'story', 'campaign', fileName), 'utf8'))
  .join('\n');

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

console.log('story campaign chapters 6-8 ok');
