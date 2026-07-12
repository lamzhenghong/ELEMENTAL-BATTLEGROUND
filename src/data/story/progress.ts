import { StoryProgress } from '../../types';

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

export const normalizeStoryProgress = (progress?: Partial<StoryProgress>): StoryProgress => ({
  ...createDefaultStoryProgress(),
  ...(progress || {}),
  completedStages: [...(progress?.completedStages || [])],
  starRatings: { ...(progress?.starRatings || {}) },
  unlockedLoreEntries: [...(progress?.unlockedLoreEntries || [])],
  completedCharacterStoryActs: { ...(progress?.completedCharacterStoryActs || {}) },
  hardModeUnlockedChapters: [...(progress?.hardModeUnlockedChapters || [])],
  hardModeCompletedStages: [...(progress?.hardModeCompletedStages || [])],
  storyChoices: { ...(progress?.storyChoices || {}) },
});
