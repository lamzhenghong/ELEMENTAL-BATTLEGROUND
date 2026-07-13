import type { StoryProgress } from '../../types';
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
import { mergeUnlockedStoryMemories } from './memories';
import type { StoryChapterPack, StoryCharacterPack } from './types';

const AUTHORED_PROGRESS_PACKS: readonly (StoryChapterPack | StoryCharacterPack)[] = [
  CHAPTER_4_PACK,
  CHAPTER_5_PACK,
  CHAPTER_6_PACK,
  CHAPTER_7_PACK,
  CHAPTER_8_PACK,
  CHAPTER_9_PACK,
  CHAPTER_10_PACK,
  AURELIA_STORY_PACK,
  KAELEN_STORY_PACK,
  MAELIS_STORY_PACK,
  VEYRA_STORY_PACK,
];

export const createDefaultStoryProgress = (): StoryProgress => ({
  currentChapter: 1,
  currentStage: '1-1',
  completedStages: [],
  starRatings: {},
  unlockedLoreEntries: [],
  completedCharacterStoryActs: {},
  hardModeUnlockedChapters: [],
  hardModeCompletedStages: [],
  storyChoices: {},
});

export const normalizeStoryProgress = (progress?: Partial<StoryProgress>): StoryProgress => {
  const normalized: StoryProgress = {
    ...createDefaultStoryProgress(),
    ...(progress || {}),
    completedStages: [...(progress?.completedStages || [])],
    starRatings: { ...(progress?.starRatings || {}) },
    unlockedLoreEntries: [...(progress?.unlockedLoreEntries || [])],
    completedCharacterStoryActs: { ...(progress?.completedCharacterStoryActs || {}) },
    hardModeUnlockedChapters: [...(progress?.hardModeUnlockedChapters || [])],
    hardModeCompletedStages: [...(progress?.hardModeCompletedStages || [])],
    storyChoices: { ...(progress?.storyChoices || {}) },
  };

  const completedCharacterStages = Object.entries(normalized.completedCharacterStoryActs)
    .flatMap(([characterId, completedAct]) => {
      const safeActCount = Math.max(0, Math.min(3, Math.floor(Number(completedAct) || 0)));
      return Array.from(
        { length: safeActCount },
        (_, index) => `char-${characterId}-${index + 1}`,
      );
    });
  const completedStoryStageIds = new Set([
    ...normalized.completedStages,
    ...completedCharacterStages,
  ]);

  let unlockedLoreEntries = [...new Set(normalized.unlockedLoreEntries)];
  for (const stageId of completedStoryStageIds) {
    unlockedLoreEntries = mergeUnlockedStoryMemories(unlockedLoreEntries, stageId);
  }

  const storyChoices = { ...normalized.storyChoices };
  for (const pack of AUTHORED_PROGRESS_PACKS) {
    for (const stage of Object.values(pack.stages)) {
      const decision = stage.decision;
      const legacyDefaultOption = decision?.options[0];
      if (
        completedStoryStageIds.has(stage.id)
        && decision
        && legacyDefaultOption
        && storyChoices[decision.id] === undefined
      ) {
        storyChoices[decision.id] = legacyDefaultOption.id;
      }
    }
  }

  return {
    ...normalized,
    unlockedLoreEntries,
    storyChoices,
  };
};
