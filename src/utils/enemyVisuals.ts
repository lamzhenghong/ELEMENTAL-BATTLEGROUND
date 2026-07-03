export interface EnemyVisualVariant {
  name: string;
  color: string;
}

const ELEMENT_NAME_PATTERN = /\b(Pyro|Hydro|Cryo|Electro|Anemo|Geo|Dendro)\b\s*/gi;

export const ENEMY_VISUAL_VARIANTS: readonly EnemyVisualVariant[] = [
  { name: 'Wild Slime', color: '#f97316' },
  { name: 'Bright Slime', color: '#3b82f6' },
  { name: 'Gleam Slime', color: '#60a5fa' },
  { name: 'Spark Slime', color: '#a855f7' },
  { name: 'Breeze Slime', color: '#10b981' },
  { name: 'Stone Slime', color: '#fbbf24' },
  { name: 'Verdant Slime', color: '#22c55e' },
  { name: 'Abyss Berserker', color: '#78350f' },
  { name: 'Abyss Channeler', color: '#0284c7' },
  { name: 'Epoch Ruin Guard', color: '#4b5563' }
];

export const BOSS_VISUAL_VARIANTS = {
  fire_dragon: { name: 'Calamity Drake', color: '#dc2626' },
  ice_golem: { name: 'Glacial Golem', color: '#06b6d4' },
  thunderbird: { name: 'Tempest Thunderbird', color: '#a855f7' }
} as const;

export const getRandomEnemyVisualVariant = (pool: readonly EnemyVisualVariant[] = ENEMY_VISUAL_VARIANTS) => {
  return pool[Math.floor(Math.random() * pool.length)];
};

export const sanitizeEnemyName = (name: string) => {
  return name
    .replace(ELEMENT_NAME_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^Slime$/i, 'Wild Slime')
    .replace(/^Abyss Channeler$/i, 'Abyss Channeler');
};
