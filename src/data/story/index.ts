import { getLegacyStageSpec } from '../storyStages';
import { CHAPTER_4_PACK } from './campaign/chapter4';
import { CHAPTER_5_PACK } from './campaign/chapter5';
import { CHAPTER_6_PACK } from './campaign/chapter6';
import { CHAPTER_7_PACK } from './campaign/chapter7';
import { CHAPTER_8_PACK } from './campaign/chapter8';
import { CHAPTER_9_PACK } from './campaign/chapter9';
import { CHAPTER_10_PACK } from './campaign/chapter10';
import { AURELIA_STORY_PACK } from './characters/aurelia';
import { KAELEN_STORY_PACK } from './characters/kaelen';
import { MAELIS_STORY_PACK } from './characters/maelis';
import { VEYRA_STORY_PACK } from './characters/veyra';
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
export { CHAPTER_6_PACK } from './campaign/chapter6';
export { CHAPTER_7_PACK } from './campaign/chapter7';
export { CHAPTER_8_PACK } from './campaign/chapter8';
export { CHAPTER_9_PACK } from './campaign/chapter9';
export { CHAPTER_10_PACK } from './campaign/chapter10';
export { AURELIA_STORY_PACK } from './characters/aurelia';
export { KAELEN_STORY_PACK } from './characters/kaelen';
export { MAELIS_STORY_PACK } from './characters/maelis';
export { VEYRA_STORY_PACK } from './characters/veyra';
export { STORY_MODIFIERS } from './modifiers';
export {
  ALL_STORY_MEMORIES,
  LEGACY_CAMPAIGN_CHRONICLES,
  STORY_MEMORIES,
  getMemoryUnlockIds,
  mergeUnlockedStoryMemories,
} from './memories';
export type * from './types';

const CHAPTER_PACKS: readonly StoryChapterPack[] = [
  CHAPTER_4_PACK,
  CHAPTER_5_PACK,
  CHAPTER_6_PACK,
  CHAPTER_7_PACK,
  CHAPTER_8_PACK,
  CHAPTER_9_PACK,
  CHAPTER_10_PACK,
];
const CHARACTER_PACKS: readonly StoryCharacterPack[] = [
  AURELIA_STORY_PACK,
  KAELEN_STORY_PACK,
  MAELIS_STORY_PACK,
  VEYRA_STORY_PACK,
];

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
