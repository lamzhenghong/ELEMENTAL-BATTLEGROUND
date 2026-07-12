import type { StoryStageReward } from './types';

export const getCampaignReward = (chapter: number, stage: number): StoryStageReward => {
  if (stage === 5) {
    return {
      gems: 100 + chapter * 50,
      mora: 10000 + chapter * 3000,
      charXp: 5 + Math.floor(chapter / 2),
      ascensionMaterialCount: 3 + Math.floor(chapter / 3),
      specialItem: `Aetheric Essence Cap ${chapter}`,
    };
  }

  return {
    gems: 50 + chapter * 10,
    mora: 3000 + chapter * 1000 + stage * 200,
    charXp: 2 + Math.floor(chapter / 4),
  };
};
