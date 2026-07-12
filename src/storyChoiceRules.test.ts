import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStageSpec, getStoryModifier } from './data/story';

const rescue = { 'chapter-4-route': 'rescue-surveyors' };
const seal = { 'chapter-4-route': 'secure-whisper-seal' };

assert.notDeepEqual(getStageSpec('4-3', rescue).enemies, getStageSpec('4-3', seal).enemies);
assert.equal(getStoryModifier('4-3', rescue)?.id, 'surveyors-guidance');
assert.equal(getStoryModifier('4-3', seal)?.id, 'whisper-sealed');
assert.deepEqual(getStageSpec('4-5', rescue).enemies, getStageSpec('4-5', seal).enemies);

const srcDir = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath: string) => {
  const sourcePath = join(srcDir, relativePath);
  return existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : '';
};

const choicePromptSource = readSource('components/StoryChoicePrompt.tsx');
const storyCutsceneSource = readSource('components/StoryCutscene.tsx');
const storyModeSource = readSource('components/StoryMode.tsx');
const storyStageSource = readSource('components/StoryStage.tsx');
const appSource = readSource('App.tsx');
const combatArenaSource = readSource('components/CombatArena.tsx');

assert.match(choicePromptSource, /choice\.options\.map/, 'Choice prompt must render both tuple options.');
assert.match(choicePromptSource, /min-h-12/, 'Choice buttons must have a touch-friendly minimum height.');
assert.match(choicePromptSource, /touch-manipulation/, 'Choice buttons must opt into touch manipulation.');
assert.match(choicePromptSource, /focus-visible:/, 'Choice buttons must expose a visible keyboard focus state.');
assert.match(choicePromptSource, /grid-cols-1/, 'Choice buttons must stack on narrow portrait screens.');
assert.match(choicePromptSource, /sm:grid-cols-2/, 'Choice buttons must split into columns when space allows.');
assert.match(choicePromptSource, /max-h-\[calc\(100dvh-/, 'Choice prompt must fit the dynamic viewport.');
assert.match(choicePromptSource, /overflow-y-auto/, 'Choice prompt must scroll when landscape height is constrained.');
assert.doesNotMatch(choicePromptSource, /confirm\s*\(/, 'Choice selection must not use browser-native confirmation.');

assert.match(storyCutsceneSource, /scene:\s*StoryScene/, 'Cutscenes must consume resolved story scenes.');
assert.match(storyCutsceneSource, /choice\?:\s*StoryChoiceDefinition/, 'Cutscenes must accept an authored choice.');
assert.match(storyCutsceneSource, /z-\[60\]/, 'Cutscenes and choice controls must stack above developer chrome.');
assert.match(storyStageSource, /max-h-\[calc\(100dvh-/, 'Stage details must fit the dynamic viewport.');
assert.match(storyStageSource, /overflow-y-auto/, 'Stage details must keep content scrollable.');
assert.match(storyStageSource, /min-h-12/, 'Stage actions must remain touch friendly.');
assert.match(storyStageSource, /z-\[60\]/, 'Stage controls must stack above developer chrome.');

assert.match(storyModeSource, /\[decision\.id\]: optionId/, 'Replays must overwrite only the selected decision.');
assert.match(storyModeSource, /storyChoices:\s*nextChoices/, 'Choices must persist to story progress.');
assert.match(storyModeSource, /choiceSelections:\s*nextChoices/, 'The selected choice map must be snapshotted into battle config.');
assert.match(appSource, /storyChoiceSelections=\{storyBattleConfig\.choiceSelections\}/, 'Captured choices must reach CombatArena.');

assert.match(combatArenaSource, /getStageSpec\(storyStageId, storyChoiceSelections\)/, 'Story encounters must resolve from captured choices.');
assert.match(combatArenaSource, /getStoryModifier\(storyStageId, storyChoiceSelections\)/, 'Story modifiers must resolve from captured choices.');
assert.match(combatArenaSource, /enemySpec\.type === 'Boss' \? 1 : modifier\?\.enemyHpMultiplier \?\? 1/, 'Boss HP must ignore branch modifiers.');
assert.match(combatArenaSource, /enemySpec\.type === 'Boss' \? 1 : modifier\?\.enemySpeedMultiplier \?\? 1/, 'Boss speed must ignore branch modifiers.');

console.log('story choice rules ok');
