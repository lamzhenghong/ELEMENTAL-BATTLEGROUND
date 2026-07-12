import { getStageSpec as getLegacyStageSpec } from '../storyStages';
import { CHAPTER_4_PACK } from './campaign/chapter4';
import { CHAPTER_5_PACK } from './campaign/chapter5';
import { STORY_MODIFIERS } from './modifiers';
import type {
  AuthoredStoryStage,
  StoryBattleModifier,
  StoryChapterPack,
  StoryCharacterPack,
  StoryChoiceDefinition,
  StoryChoiceSelections,
  StoryEncounterVariant,
  StoryPhase,
  StoryScene,
  StoryStageSpec,
} from './types';

export { getCampaignReward } from './balance';
export { CHAPTER_4_PACK } from './campaign/chapter4';
export { CHAPTER_5_PACK } from './campaign/chapter5';
export { STORY_MODIFIERS } from './modifiers';
export type * from './types';

const CHAPTER_PACKS: readonly StoryChapterPack[] = [CHAPTER_4_PACK, CHAPTER_5_PACK];
const CHARACTER_PACKS: readonly StoryCharacterPack[] = [];

const getAuthoredStage = (stageId: string): AuthoredStoryStage | undefined => {
  for (const pack of CHAPTER_PACKS) {
    const stage = pack.stages[stageId];
    if (stage) return stage;
  }

  for (const pack of CHARACTER_PACKS) {
    const stage = pack.stages[stageId];
    if (stage) return stage;
  }

  return undefined;
};

const getEncounterVariant = (
  stage: AuthoredStoryStage,
  choices?: StoryChoiceSelections,
): StoryEncounterVariant | undefined => {
  const decisionId = stage.decisionId ?? stage.decision?.id;
  const optionId = decisionId ? choices?.[decisionId] : undefined;
  return stage.variants?.find((variant) => variant.optionId === optionId);
};

const isUnauthoredCampaignStage = (stageId: string) => {
  const match = /^(\d+)-(\d+)$/.exec(stageId);
  if (!match) return false;

  const chapter = Number(match[1]);
  return chapter >= 4 && chapter <= 10;
};

export const getStageSpec = (stageId: string, choices?: StoryChoiceSelections): StoryStageSpec => {
  const stage = getAuthoredStage(stageId);
  if (stage) {
    const variant = getEncounterVariant(stage, choices);
    return variant ? { ...stage, enemies: variant.enemies } : stage;
  }

  if (isUnauthoredCampaignStage(stageId)) {
    throw new Error(`No authored story stage is registered for ${stageId}.`);
  }

  return getLegacyStageSpec(stageId);
};

export const getStoryScene = (
  stageId: string,
  phase: StoryPhase,
  choices?: StoryChoiceSelections,
): StoryScene => {
  const stage = getAuthoredStage(stageId);
  if (!stage) return { slides: [] };

  const variant = getEncounterVariant(stage, choices);
  return {
    slides: phase === 'before' ? stage.beforeSlides : variant?.afterSlides ?? stage.afterSlides,
    backgroundId: stage.backgroundId,
  };
};

export const getStoryChoice = (stageId: string): StoryChoiceDefinition | undefined =>
  getAuthoredStage(stageId)?.decision;

export const getStoryModifier = (
  stageId: string,
  choices?: StoryChoiceSelections,
): StoryBattleModifier | undefined => {
  const stage = getAuthoredStage(stageId);
  const variant = stage && getEncounterVariant(stage, choices);
  return variant ? STORY_MODIFIERS[variant.modifierId] : undefined;
};

export const getMemoryUnlockIds = (stageId: string): string[] =>
  [...(getAuthoredStage(stageId)?.memoryUnlockIds ?? [])];
