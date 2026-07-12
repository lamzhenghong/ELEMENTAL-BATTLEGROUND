import type { StoryEnemySpec } from './types';

const TITLES = ['Ashen', 'Hollow', 'Stormforged', 'Gilded', 'Silent', 'Riftborn', 'Starved'] as const;
const SUBJECTS = ['Warden', 'Behemoth', 'Sovereign', 'Devourer', 'Sentinel', 'Colossus'] as const;
const TEMPLATES = ['fire_dragon', 'ice_golem', 'thunderbird'] as const;

const hashStageId = (value: string) => {
  let hash = 0x811c9dc5;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

export const generateFutureBoss = (stageId: string): StoryEnemySpec => {
  const hash = hashStageId(stageId);
  return {
    name: `${TITLES[hash % TITLES.length]} ${SUBJECTS[(hash >>> 4) % SUBJECTS.length]}`,
    type: 'Boss',
    element: 'Anemo',
    level: 120,
    bossType: TEMPLATES[(hash >>> 8) % TEMPLATES.length],
  };
};
