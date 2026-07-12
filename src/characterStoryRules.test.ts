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
import type { StoryCharacterPack } from './data/story';
import { getCharacterStoryScript } from './data/storyStages';

const characterModules = await Promise.all(
  ['aurelia', 'kaelen', 'maelis', 'veyra']
    .map((characterId) => import(`./data/story/characters/${characterId}`).catch(() => undefined)),
);

assert.deepEqual(
  characterModules.map(Boolean),
  [true, true, true, true],
  'All four limited Character Story packs must exist.',
);
assert.ok(characterModules[0] && characterModules[1] && characterModules[2] && characterModules[3]);

const packs = [
  characterModules[0].AURELIA_STORY_PACK,
  characterModules[1].KAELEN_STORY_PACK,
  characterModules[2].MAELIS_STORY_PACK,
  characterModules[3].VEYRA_STORY_PACK,
] as StoryCharacterPack[];

const manifests = [
  {
    pack: packs[0],
    characterId: 'aurelia',
    names: ['The Unlit Watch', 'Weight of the Oath', 'Dawn Without Applause'],
    actOneEnemy: 'Ashbound Relay Drone',
    branchEnemies: ['Blackglass Saboteur', 'Sun Court Enforcer'],
    decisionId: 'aurelia-act-2-route',
    optionIds: ['protect-workers', 'obey-command'],
    modifierIds: ['protected-workers', 'obeyed-command'],
    memoryTitles: ['A Watch Without Witnesses', "The Oath's Smallest Line", 'Warmth Before Glory'],
    boss: { name: 'Aurelia Sunflare Trial Boss', element: 'Pyro', bossType: 'fire_dragon' },
  },
  {
    pack: packs[1],
    characterId: 'kaelen',
    names: ['A Blank Horizon', "The Admiral's Burden", 'Sounding the Deep'],
    actOneEnemy: 'Dockside Reef Scavenger',
    branchEnemies: ['Wakebreaker Marauder', 'Breakwater Corsair'],
    decisionId: 'kaelen-act-2-route',
    optionIds: ['rescue-crew', 'hold-harbor'],
    modifierIds: ['rescued-crew', 'held-harbor'],
    memoryTitles: ['Chart Zero', 'Names Behind the Numbers', 'A Current Shared'],
    boss: { name: 'Kaelen Tidebound Trial Boss', element: 'Hydro', bossType: 'ice_golem' },
  },
  {
    pack: packs[2],
    characterId: 'maelis',
    names: ['Sap and Scripture', 'The Page He Cannot Keep', 'Heartwood Farewell'],
    actOneEnemy: 'Blighted Sapling',
    branchEnemies: ['Blackroot Archivist', 'Hollow Ring Custodian'],
    decisionId: 'maelis-act-2-route',
    optionIds: ['preserve-memory', 'prune-memory'],
    modifierIds: ['preserved-memory', 'pruned-memory'],
    memoryTitles: ['The Tree That Spoke First', 'A Page in Black Sap', 'Room for New Leaves'],
    boss: { name: 'Maelis Verdantveil Trial Boss', element: 'Dendro', bossType: 'fire_dragon' },
  },
  {
    pack: packs[3],
    characterId: 'veyra',
    names: ['The Seventh Mirror', 'One Shot Too Early', 'Eye of the Shattered Storm'],
    actOneEnemy: 'Stormglass Calibration Drone',
    branchEnemies: ['Prism Sentinel', 'Signal Hunter'],
    decisionId: 'veyra-act-2-route',
    optionIds: ['repair-engine', 'pursue-signal'],
    modifierIds: ['repaired-engine', 'pursued-signal'],
    memoryTitles: ['Six Perfect Reflections', 'The Arrow Between Seconds', 'After Thunder'],
    boss: { name: 'Veyra Stormglass Trial Boss', element: 'Electro', bossType: 'thunderbird' },
  },
] satisfies Array<{
  pack: StoryCharacterPack;
  characterId: StoryCharacterPack['characterId'];
  names: string[];
  actOneEnemy: string;
  branchEnemies: [string, string] | string[];
  decisionId: string;
  optionIds: [string, string] | string[];
  modifierIds: [string, string] | string[];
  memoryTitles: string[];
  boss: { name: string; element: 'Pyro' | 'Hydro' | 'Dendro' | 'Electro'; bossType: 'fire_dragon' | 'ice_golem' | 'thunderbird' };
}>;

for (const manifest of manifests) {
  assert.equal(manifest.pack.characterId, manifest.characterId);
  assert.deepEqual(
    Object.keys(manifest.pack.stages),
    [1, 2, 3].map((act) => `char-${manifest.characterId}-${act}`),
  );
  assert.equal(manifest.pack.memories.length, 3);
  assert.deepEqual(manifest.pack.memories.map(({ title }) => title), manifest.memoryTitles);
  assert.ok(manifest.pack.memories.every(({ category, text }) => category === 'character' && text.length >= 80));

  for (const act of [1, 2, 3]) {
    const stageId = `char-${manifest.characterId}-${act}`;
    const stage = manifest.pack.stages[stageId];
    const expectedType = act === 1 ? 'Normal' : act === 2 ? 'Elite' : 'Boss';

    assert.equal(getStageSpec(stageId), stage);
    assert.equal(stage.name, manifest.names[act - 1]);
    assert.equal(stage.enemies[0].type, expectedType);
    assert.ok(stage.beforeSlides.length >= 2 && stage.beforeSlides.length <= 4);
    assert.ok(stage.afterSlides.length >= 2 && stage.afterSlides.length <= 3);
    assert.deepEqual(getStoryScene(stageId, 'before').slides, stage.beforeSlides);
    assert.deepEqual(getStoryScene(stageId, 'after').slides, stage.afterSlides);
    assert.deepEqual(getCharacterStoryScript(manifest.characterId, act), {
      before: stage.beforeSlides,
      after: stage.afterSlides,
    });
    assert.equal(getMemoryUnlockIds(stageId).length, 1);

    const rewards = stage.firstClearRewards;
    assert.ok(rewards.gems > 0);
    assert.ok(rewards.mora > 0);
    assert.equal(rewards.charXp, 0);
    assert.equal(rewards.ascensionMaterialCount, undefined);
    assert.equal(rewards.specialItem, undefined);

    for (const line of [...stage.beforeSlides, ...stage.afterSlides]) {
      assert.ok(line.text.length <= 180, `${stageId} dialogue should stay concise.`);
      assert.doesNotMatch(line.text, /optional memory battle|side battle|character story act|system/i);
    }
  }

  assert.equal(getStageSpec(`char-${manifest.characterId}-1`).enemies[0].name, manifest.actOneEnemy);
  assert.deepEqual(getStageSpec(`char-${manifest.characterId}-3`).enemies, [{
    name: manifest.boss.name,
    type: 'Boss',
    element: manifest.boss.element,
    level: 38,
    bossType: manifest.boss.bossType,
  }]);

  const actTwoId = `char-${manifest.characterId}-2`;
  assert.equal(getStoryChoice(actTwoId)?.id, manifest.decisionId);
  assert.deepEqual(getStoryChoice(actTwoId)?.options.map(({ id }) => id), manifest.optionIds);
  assert.equal(getStoryChoice(`char-${manifest.characterId}-1`), undefined);
  assert.equal(getStoryChoice(`char-${manifest.characterId}-3`), undefined);

  for (let route = 0; route < 2; route += 1) {
    const choices = { [manifest.decisionId]: manifest.optionIds[route] };
    const routedStage = getStageSpec(actTwoId, choices);
    assert.equal(routedStage.enemies[0].name, manifest.branchEnemies[route]);
    assert.equal(routedStage.enemies[0].type, 'Elite');
    assert.equal(getStoryModifier(actTwoId, choices)?.id, manifest.modifierIds[route]);
  }
}

const testDir = dirname(fileURLToPath(import.meta.url));
const storyModeSource = readFileSync(join(testDir, 'components', 'StoryMode.tsx'), 'utf8');
const appSource = readFileSync(join(testDir, 'App.tsx'), 'utf8');

const actTwoCardStart = storyModeSource.indexOf("Act II:");
const actThreeCardStart = storyModeSource.indexOf("Act III:");
assert.match(storyModeSource, /const isUnlocked = completedCount >= act\.index - 1 \|\| devCheatsEnabled;/);
assert.doesNotMatch(storyModeSource.slice(actTwoCardStart, actThreeCardStart), /portrait|stat|power|boost|gear/i);
assert.doesNotMatch(storyModeSource.slice(actThreeCardStart), /portrait|stat|power|boost|gear/i);

const playHandlerStart = storyModeSource.indexOf('const handlePlayCharStoryAct');
const playHandlerGuardEnd = storyModeSource.indexOf('const script =', playHandlerStart);
const playHandlerGuard = storyModeSource.slice(playHandlerStart, playHandlerGuardEnd);
assert.match(playHandlerGuard, /const completedCount = storyProgress\.completedCharacterStoryActs\[charId\] \|\| 0;/);
assert.match(playHandlerGuard, /if \(!devCheatsEnabled && completedCount < act - 1\)/);
assert.match(playHandlerGuard, /return;/);

for (const act of [1, 2, 3]) {
  const scriptText = JSON.stringify(getCharacterStoryScript('unknown-char', act));
  assert.doesNotMatch(scriptText, /portrait|stat|power|boost|upgrade/i);
}

const charStoryBranch = appSource.slice(
  appSource.indexOf('if (isCharStory)'),
  appSource.indexOf('} else {', appSource.indexOf('if (isCharStory)')),
);
assert.doesNotMatch(charStoryBranch, /nextCharacterPortraits|inventoryItems|char_xp|ascension/i);
assert.match(charStoryBranch, /nextGems\s*\+=/);
assert.match(charStoryBranch, /nextMora\s*\+=/);

console.log('character story rules ok');
