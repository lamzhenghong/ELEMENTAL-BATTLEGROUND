import type { StoryChoiceSelections } from './data/story';

export const applyStoryChoice = (
  currentChoices: StoryChoiceSelections,
  decisionId: string,
  optionId: string,
): StoryChoiceSelections => ({
  ...currentChoices,
  [decisionId]: optionId,
});
