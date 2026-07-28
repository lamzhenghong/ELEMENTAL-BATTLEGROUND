export const ENEMY_ARCHETYPE_IDS = [
  'bulwark',
  'channeler',
  'artillery',
  'siphon',
  'mimic',
  'summoner',
  'stalker',
  'relic-carrier'
] as const;

export type EnemyArchetypeId = (typeof ENEMY_ARCHETYPE_IDS)[number];
export type EnemyArchetypeTier = 'Normal' | 'Elite';

const COMMON_ENEMY_ARCHETYPE_IDS = [
  'bulwark',
  'channeler',
  'artillery',
  'siphon'
] as const satisfies readonly EnemyArchetypeId[];

const SPECIALIST_ENEMY_ARCHETYPE_IDS = [
  'mimic',
  'summoner',
  'stalker'
] as const satisfies readonly EnemyArchetypeId[];

const COMMON_ARCHETYPE_POOL_CHANCE = 0.8;
export const RELIC_CARRIER_SPAWN_CHANCE = 0.1;

export interface EnemyArchetypeDefinition {
  id: EnemyArchetypeId;
  name: string;
  color: string;
  mechanic: string;
  counter: string;
  visual: string;
}

export interface EnemyArchetypeRuntimeState {
  abilityCooldownFrames: number;
  shieldHp?: number;
  maxShieldHp?: number;
  beamFrames?: number;
  stolenEnergy?: number;
  vanishFrames?: number;
  strikeFrames?: number;
  escaped?: boolean;
}

export interface EnemyArchetypeAssignment {
  archetypeId: EnemyArchetypeId;
  archetypeState: EnemyArchetypeRuntimeState;
}

export const ENEMY_ARCHETYPE_DEFINITIONS: readonly EnemyArchetypeDefinition[] = [
  {
    id: 'bulwark',
    name: 'Bulwark',
    color: '#3b82f6',
    mechanic: 'Projects a breakable shield that reduces damage dealt to nearby enemies.',
    counter: 'Flank it, parry its attack, or break the shield.',
    visual: 'Blue hexagonal shield aura'
  },
  {
    id: 'channeler',
    name: 'Channeler',
    color: '#22c55e',
    mechanic: 'Heals wounded enemies and can revive one defeated ally.',
    counter: 'Interrupt it and prioritize it first.',
    visual: 'Floating green healing runes'
  },
  {
    id: 'artillery',
    name: 'Artillery',
    color: '#f97316',
    mechanic: 'Keeps its distance and fires at visible ground markers.',
    counter: 'Keep moving and close the distance.',
    visual: 'Orange cannon barrel with small sparks'
  },
  {
    id: 'siphon',
    name: 'Siphon',
    color: '#a855f7',
    mechanic: 'Channels a telegraphed beam that steals 5% of current Ultimate energy every five seconds.',
    counter: 'Damage it to break the beam and recover stolen energy.',
    visual: 'Purple energy veins and orbiting particles'
  },
  {
    id: 'mimic',
    name: 'Mimic',
    color: '#f8fafc',
    mechanic: 'Copies the last Elemental Skill used by the active hero.',
    counter: 'Change characters or bait it with a weaker Skill.',
    visual: 'White body with a shifting prism outline'
  },
  {
    id: 'summoner',
    name: 'Summoner',
    color: '#5b21b6',
    mechanic: 'Continuously creates fragile Abyss Wisps.',
    counter: 'Defeat the Summoner before clearing its minions.',
    visual: 'Dark violet summoning circles'
  },
  {
    id: 'stalker',
    name: 'Stalker',
    color: '#09090b',
    mechanic: 'Vanishes briefly, moves behind the player, then launches a back attack.',
    counter: 'Watch its red eyes and perfect dodge.',
    visual: 'Black smoke with glowing red eyes'
  },
  {
    id: 'relic-carrier',
    name: 'Relic Carrier',
    color: '#facc15',
    mechanic: 'Flees from combat and escapes if it reaches the arena boundary.',
    counter: 'Defeat it quickly for bonus Mora, Gems, or an Artifact.',
    visual: 'Golden sparkles with floating coins and gems'
  }
];

const ARCHETYPE_BY_ID = Object.fromEntries(
  ENEMY_ARCHETYPE_DEFINITIONS.map(definition => [definition.id, definition])
) as Record<EnemyArchetypeId, EnemyArchetypeDefinition>;

export const getEnemyArchetypeDefinition = (id: EnemyArchetypeId) => ARCHETYPE_BY_ID[id];

const createRuntimeState = (
  archetypeId: EnemyArchetypeId,
  tier: EnemyArchetypeTier,
  maxHp: number
): EnemyArchetypeRuntimeState => {
  const abilityCooldownFrames = tier === 'Elite' ? 210 : 270;
  if (archetypeId === 'bulwark') {
    const shieldHp = Math.round(maxHp * (tier === 'Elite' ? 0.35 : 0.25));
    return { abilityCooldownFrames, shieldHp, maxShieldHp: shieldHp };
  }
  if (archetypeId === 'siphon') {
    return { abilityCooldownFrames, beamFrames: 0, stolenEnergy: 0 };
  }
  if (archetypeId === 'stalker') {
    return { abilityCooldownFrames, vanishFrames: 0, strikeFrames: 0 };
  }
  if (archetypeId === 'relic-carrier') {
    return { abilityCooldownFrames, escaped: false };
  }
  return { abilityCooldownFrames };
};

const pickFromPool = <T>(pool: readonly T[], roll: number): T => {
  const normalizedRoll = Math.max(0, Math.min(0.999999, roll));
  return pool[Math.floor(normalizedRoll * pool.length)];
};

const rollStandardEnemyArchetype = (random: () => number): EnemyArchetypeId => {
  const roll = Math.max(0, Math.min(0.999999, random()));
  if (roll < COMMON_ARCHETYPE_POOL_CHANCE) {
    return pickFromPool(COMMON_ENEMY_ARCHETYPE_IDS, roll / COMMON_ARCHETYPE_POOL_CHANCE);
  }
  return pickFromPool(
    SPECIALIST_ENEMY_ARCHETYPE_IDS,
    (roll - COMMON_ARCHETYPE_POOL_CHANCE) / (1 - COMMON_ARCHETYPE_POOL_CHANCE)
  );
};

export function applyEnemyArchetype<T extends { type: EnemyArchetypeTier; color: string; maxHp: number }>(
  enemy: T,
  random?: () => number
): T & EnemyArchetypeAssignment;
export function applyEnemyArchetype<T extends { type: 'Boss'; color: string; maxHp: number }>(
  enemy: T,
  random?: () => number
): T;
export function applyEnemyArchetype<T extends { type: string; color: string; maxHp: number }>(
  enemy: T,
  random: () => number = Math.random
): T | (T & EnemyArchetypeAssignment) {
  if (enemy.type !== 'Normal' && enemy.type !== 'Elite') return enemy;
  const archetypeId = rollStandardEnemyArchetype(random);
  const definition = getEnemyArchetypeDefinition(archetypeId);
  return {
    ...enemy,
    color: definition.color,
    archetypeId: definition.id,
    archetypeState: createRuntimeState(definition.id, enemy.type, enemy.maxHp)
  };
}

export const shouldSpawnRelicCarrier = (random: () => number = Math.random) =>
  random() < RELIC_CARRIER_SPAWN_CHANCE;

export const applyRelicCarrierArchetype = <
  T extends { type: EnemyArchetypeTier; color: string; maxHp: number }
>(
  enemy: T
): T & EnemyArchetypeAssignment => {
  const definition = getEnemyArchetypeDefinition('relic-carrier');
  return {
    ...enemy,
    color: definition.color,
    archetypeId: definition.id,
    archetypeState: createRuntimeState(definition.id, enemy.type, enemy.maxHp)
  };
};

interface BulwarkCandidate {
  id: string;
  x: number;
  y: number;
  hp: number;
  archetypeId?: EnemyArchetypeId;
  archetypeState?: EnemyArchetypeRuntimeState;
}

export const getBulwarkProtection = (
  target: { id: string; x: number; y: number },
  enemies: readonly BulwarkCandidate[],
  incomingDamage: number
) => {
  const bulwark = enemies.find(enemy =>
    enemy.id !== target.id
    && enemy.hp > 0
    && enemy.archetypeId === 'bulwark'
    && (enemy.archetypeState?.shieldHp ?? 0) > 0
    && Math.hypot(enemy.x - target.x, enemy.y - target.y) <= 170
  );
  if (!bulwark) {
    return { damage: incomingDamage, absorbedDamage: 0, bulwarkId: null as string | null };
  }
  const absorbedDamage = Math.min(
    Math.round(incomingDamage * 0.4),
    bulwark.archetypeState?.shieldHp ?? 0
  );
  return {
    damage: Math.max(0, incomingDamage - absorbedDamage),
    absorbedDamage,
    bulwarkId: bulwark.id
  };
};

export type RelicCarrierReward =
  | { kind: 'gems'; amount: number }
  | { kind: 'mora'; amount: number }
  | { kind: 'artifact'; amount: 1 };

export const getRelicCarrierReward = (random: () => number = Math.random): RelicCarrierReward => {
  const roll = random();
  if (roll < 0.34) return { kind: 'gems', amount: 120 };
  if (roll < 0.78) return { kind: 'mora', amount: 12000 };
  return { kind: 'artifact', amount: 1 };
};
