import type { CharacterRole } from '../types';

export type LimitedKitCharacterId = 'aurelia' | 'kaelen' | 'maelis' | 'veyra';
export type KitActionShape = 'single-target' | 'medium-aoe' | 'full-aoe' | 'large-aoe' | 'none';

export type CharacterKitEffect =
  | { kind: 'damage-multiplier'; multiplier: number }
  | { kind: 'burn'; duration: number; tickInterval: number; attackMultiplier: number; refreshes: true }
  | { kind: 'large-explosion' }
  | { kind: 'slow'; strength: number; duration: number; bossesImmune?: true }
  | { kind: 'whirlpool'; duration: number; bossesImmune: true }
  | { kind: 'damage-down'; procChance: number; strength: number; duration: number }
  | { kind: 'party-shield'; amount: number; cap: number }
  | { kind: 'reaction-field'; duration: number; damageDown: number; reactionMultiplier: number; crowdControlDurationMultiplier: number }
  | { kind: 'stun'; procChance?: number; normalDuration: number; eliteDuration: number; bossesImmune: true }
  | { kind: 'dominion-field'; duration: number; normalAttackDamageMultiplier: number; normalAttackRangeMultiplier: number; fieldTickInterval: number; fieldAttackMultiplier: number };

export interface CharacterKitAction {
  name: string;
  description: string;
  shape: KitActionShape;
  directDamage: boolean;
  reactionEligible: boolean;
  rangeMultiplier: number;
  damageMultiplier: number;
  effects: readonly CharacterKitEffect[];
}

export interface LimitedCharacterKit {
  characterId: LimitedKitCharacterId;
  role: CharacterRole;
  identity: string;
  normalAttack: CharacterKitAction;
  skill: CharacterKitAction;
  burst: CharacterKitAction;
}

export const LIMITED_CHARACTER_KITS: Readonly<Record<LimitedKitCharacterId, LimitedCharacterKit>> = {
  aurelia: {
    characterId: 'aurelia',
    role: 'dps',
    identity: 'On-field Pyro sword DPS who brands enemies before a battlefield-wide solar detonation.',
    normalAttack: {
      name: 'Scorching Edge',
      description: 'Every strike deals 150% of its standard damage. Normal attacks do not apply Pyro or trigger elemental reactions.',
      shape: 'single-target', directDamage: true, reactionEligible: false,
      rangeMultiplier: 1, damageMultiplier: 1.5, effects: [{ kind: 'damage-multiplier', multiplier: 1.5 }]
    },
    skill: {
      name: 'Searing Brand',
      description: "Scorches a medium area and inflicts Burning for 6 seconds. Burning deals Pyro damage equal to 35% of Aurelia's ATK once every second; only the initial hit may trigger a reaction.",
      shape: 'medium-aoe', directDamage: true, reactionEligible: true,
      rangeMultiplier: 1.35, damageMultiplier: 1,
      effects: [{ kind: 'burn', duration: 6, tickInterval: 1, attackMultiplier: 0.35, refreshes: true }]
    },
    burst: {
      name: 'Solar Detonation',
      description: 'Releases a devastating Pyro explosion across a massive area, dealing heavy damage to every enemy caught within the blast.',
      shape: 'large-aoe', directDamage: true, reactionEligible: true,
      rangeMultiplier: 2.5, damageMultiplier: 1, effects: [{ kind: 'large-explosion' }]
    }
  },
  kaelen: {
    characterId: 'kaelen',
    role: 'sub-dps',
    identity: 'Hydro control specialist who slows crowds and gathers them into a tactical whirlpool.',
    normalAttack: {
      name: 'Chilling Current',
      description: "Each strike reduces the target's movement speed by 10% for 0.5 seconds. Normal attacks do not apply Hydro or trigger elemental reactions.",
      shape: 'single-target', directDamage: true, reactionEligible: false,
      rangeMultiplier: 1, damageMultiplier: 1,
      effects: [{ kind: 'slow', strength: 0.1, duration: 0.5 }]
    },
    skill: {
      name: 'Frozen Tide',
      description: "Releases a full-AOE Hydro surge that slows normal and elite enemies by 40% for 3 seconds. Bosses resist the Slow but still receive the Skill's damage.",
      shape: 'full-aoe', directDamage: true, reactionEligible: true,
      rangeMultiplier: 4, damageMultiplier: 1,
      effects: [{ kind: 'slow', strength: 0.4, duration: 3, bossesImmune: true }]
    },
    burst: {
      name: 'Abyssal Whirlpool',
      description: "Summons a massive whirlpool that smoothly pulls nearby normal and elite enemies before dealing heavy Hydro damage. Bosses cannot be pulled but still receive the Burst's damage.",
      shape: 'full-aoe', directDamage: true, reactionEligible: true,
      rangeMultiplier: 4, damageMultiplier: 1,
      effects: [{ kind: 'whirlpool', duration: 1.8, bossesImmune: true }]
    }
  },
  maelis: {
    characterId: 'maelis',
    role: 'support',
    identity: 'Dendro support who protects the party and turns a battlefield zone into a reaction nexus.',
    normalAttack: {
      name: 'Withering Mark',
      description: "Each strike has a 10% chance to reduce the target's outgoing damage by 10% for 3 seconds. Normal attacks do not apply Dendro or trigger elemental reactions.",
      shape: 'single-target', directDamage: true, reactionEligible: false,
      rangeMultiplier: 1, damageMultiplier: 1,
      effects: [{ kind: 'damage-down', procChance: 0.1, strength: 0.1, duration: 3 }]
    },
    skill: {
      name: 'Verdant Aegis',
      description: 'Grants a persistent 1,000 HP shared party shield. Repeated casts stack up to 3,000 HP, and the shield survives character switching until destroyed.',
      shape: 'none', directDamage: false, reactionEligible: false,
      rangeMultiplier: 0, damageMultiplier: 0,
      effects: [{ kind: 'party-shield', amount: 1000, cap: 3000 }]
    },
    burst: {
      name: 'Verdant Resonance Field',
      description: 'Creates a field for 15 seconds. Enemies inside deal 20% less damage, while valid direct-hit reactions have their damage and applicable control duration doubled. Creating the field does not trigger a reaction.',
      shape: 'large-aoe', directDamage: true, reactionEligible: true,
      rangeMultiplier: 2.5, damageMultiplier: 1,
      effects: [{ kind: 'reaction-field', duration: 15, damageDown: 0.2, reactionMultiplier: 2, crowdControlDurationMultiplier: 2 }]
    }
  },
  veyra: {
    characterId: 'veyra',
    role: 'dps',
    identity: 'Electro ranged DPS who stuns priority targets and commands a mobile storm field.',
    normalAttack: {
      name: 'Voltaic Shock',
      description: 'Each strike has a 15% chance to Stun normal enemies for 1 second or elites for 0.5 seconds. Bosses are immune, and normal attacks do not trigger reactions.',
      shape: 'single-target', directDamage: true, reactionEligible: false,
      rangeMultiplier: 1, damageMultiplier: 1,
      effects: [{ kind: 'stun', procChance: 0.15, normalDuration: 1, eliteDuration: 0.5, bossesImmune: true }]
    },
    skill: {
      name: 'Thunder Lock',
      description: 'Releases a full-AOE Electro discharge, stunning normal enemies for 4 seconds and elites for 2 seconds. Bosses resist the Stun but still receive damage.',
      shape: 'full-aoe', directDamage: true, reactionEligible: true,
      rangeMultiplier: 4, damageMultiplier: 1,
      effects: [{ kind: 'stun', normalDuration: 4, eliteDuration: 2, bossesImmune: true }]
    },
    burst: {
      name: 'Stormglass Dominion',
      description: "For 10 seconds, Veyra gains 150% normal attack damage and double range. A following field deals Electro damage equal to 100% of Veyra's snapshotted ATK once every 2 seconds without triggering reactions.",
      shape: 'large-aoe', directDamage: true, reactionEligible: true,
      rangeMultiplier: 2.5, damageMultiplier: 1,
      effects: [{
        kind: 'dominion-field', duration: 10, normalAttackDamageMultiplier: 1.5,
        normalAttackRangeMultiplier: 2, fieldTickInterval: 2, fieldAttackMultiplier: 1
      }]
    }
  }
};

export const getCharacterKit = (characterId: string): LimitedCharacterKit | null =>
  LIMITED_CHARACTER_KITS[characterId as LimitedKitCharacterId] ?? null;

export const getKitEffect = <TKind extends CharacterKitEffect['kind']>(
  action: CharacterKitAction,
  kind: TKind
) => action.effects.find(effect => effect.kind === kind) as Extract<CharacterKitEffect, { kind: TKind }> | undefined;
