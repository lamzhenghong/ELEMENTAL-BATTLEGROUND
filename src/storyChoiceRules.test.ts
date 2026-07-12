import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React, { type ReactElement, type ReactNode } from 'react';
import StoryChoicePrompt from './components/StoryChoicePrompt';
import { getStageSpec, getStoryChoice, getStoryModifier } from './data/story';
import { applyStoryChoice } from './storyChoiceRules';

const rescue = { 'chapter-4-route': 'rescue-surveyors' };
const seal = { 'chapter-4-route': 'secure-whisper-seal' };

assert.notDeepEqual(getStageSpec('4-3', rescue).enemies, getStageSpec('4-3', seal).enemies);
assert.equal(getStoryModifier('4-3', rescue)?.id, 'surveyors-guidance');
assert.equal(getStoryModifier('4-3', seal)?.id, 'whisper-sealed');
assert.deepEqual(getStageSpec('4-5', rescue).enemies, getStageSpec('4-5', seal).enemies);

type ChoiceButtonElement = ReactElement<{
  children?: ReactNode;
  onClick?: () => void;
}, 'button'>;

const collectChoiceButtons = (node: ReactNode): ChoiceButtonElement[] => {
  if (!React.isValidElement(node)) return [];

  const element = node as ReactElement<{ children?: ReactNode }>;
  const nestedButtons = React.Children.toArray(element.props.children).flatMap(collectChoiceButtons);
  return element.type === 'button'
    ? [element as ChoiceButtonElement, ...nestedButtons]
    : nestedButtons;
};

const decision = getStoryChoice('4-2');
assert.ok(decision, 'Stage 4-2 must expose its authored decision.');

let emittedDecisionId: string | undefined;
let emittedOptionId: string | undefined;
const captureChoice = (decisionId: string, optionId: string) => {
  emittedDecisionId = decisionId;
  emittedOptionId = optionId;
};
const promptTree = StoryChoicePrompt({
  choice: decision,
  onChoice: captureChoice,
});
const choiceButtons = collectChoiceButtons(promptTree);

assert.equal(choiceButtons.length, 2, 'The actual prompt tree must contain exactly two buttons.');
choiceButtons[0].props.onClick?.();
assert.equal(emittedDecisionId, decision.id, 'The prompt must emit its decision ID.');
assert.equal(emittedOptionId, decision.options[0].id, 'The prompt must emit the clicked option ID.');

assert.ok(emittedDecisionId);
assert.ok(emittedOptionId);
const currentChoices = { 'unrelated-route': 'keep-this-selection' };
const selectedChoices = applyStoryChoice(currentChoices, emittedDecisionId, emittedOptionId);

assert.deepEqual(selectedChoices, {
  ...currentChoices,
  [decision.id]: decision.options[0].id,
});
assert.notEqual(selectedChoices, currentChoices, 'Applying a choice must return a new snapshot.');
assert.deepEqual(getStageSpec('4-3', selectedChoices).enemies, getStageSpec('4-3', rescue).enemies);
assert.equal(getStoryModifier('4-3', selectedChoices)?.id, 'surveyors-guidance');
assert.deepEqual(getStageSpec('4-5', selectedChoices), getStageSpec('4-5', seal));

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

assert.match(storyModeSource, /storyChoices:\s*nextChoices/, 'Choices must persist to story progress.');
assert.match(storyModeSource, /choiceSelections:\s*nextChoices/, 'The selected choice map must be snapshotted into battle config.');
assert.match(
  storyModeSource,
  /applyStoryChoice\(storyProgress\.storyChoices, decision\.id, optionId\)/,
  'StoryMode must persist and snapshot choices through the behaviorally tested helper.',
);
assert.match(appSource, /storyChoiceSelections=\{storyBattleConfig\.choiceSelections\}/, 'Captured choices must reach CombatArena.');

assert.match(combatArenaSource, /getStageSpec\(storyStageId, storyChoiceSelections\)/, 'Story encounters must resolve from captured choices.');
assert.match(combatArenaSource, /getStoryModifier\(storyStageId, storyChoiceSelections\)/, 'Story modifiers must resolve from captured choices.');
assert.match(combatArenaSource, /enemySpec\.type === 'Boss' \? 1 : modifier\?\.enemyHpMultiplier \?\? 1/, 'Boss HP must ignore branch modifiers.');
assert.match(combatArenaSource, /enemySpec\.type === 'Boss' \? 1 : modifier\?\.enemySpeedMultiplier \?\? 1/, 'Boss speed must ignore branch modifiers.');

console.log('story choice rules ok');
