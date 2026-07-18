export type CombatDamageSource =
  | 'normal-attack'
  | 'elemental-skill'
  | 'elemental-burst'
  | 'special-ultimate'
  | 'damage-over-time'
  | 'persistent-field'
  | 'environment'
  | 'reaction';

export interface ReactionTriggerContext {
  source: CombatDamageSource;
  dealsDirectDamage: boolean;
  appliesElement: boolean;
  isReactionDamage: boolean;
}

export const DEFAULT_REACTION_ELIGIBILITY: Readonly<Record<CombatDamageSource, boolean>> = {
  'normal-attack': false,
  'elemental-skill': true,
  'elemental-burst': true,
  'special-ultimate': true,
  'damage-over-time': false,
  'persistent-field': false,
  environment: false,
  reaction: false
};

export const createReactionContext = (
  source: CombatDamageSource,
  dealsDirectDamage: boolean,
  appliesElement: boolean = dealsDirectDamage && DEFAULT_REACTION_ELIGIBILITY[source]
): ReactionTriggerContext => ({
  source,
  dealsDirectDamage,
  appliesElement,
  isReactionDamage: source === 'reaction'
});

export const canTriggerElementalReaction = (context: ReactionTriggerContext) =>
  DEFAULT_REACTION_ELIGIBILITY[context.source]
  && context.dealsDirectDamage
  && context.appliesElement
  && !context.isReactionDamage;

export const getReactionAmplification = (activeMultipliers: readonly number[]) =>
  Math.max(1, ...activeMultipliers.filter(multiplier => Number.isFinite(multiplier) && multiplier >= 1));
