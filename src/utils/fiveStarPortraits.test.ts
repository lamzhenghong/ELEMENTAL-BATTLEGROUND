import assert from 'node:assert/strict';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import {
  FIVE_STAR_PORTRAITS,
  createPortraitCombatState,
  getActiveFiveStarPortrait,
  resolvePortraitCombatEvent,
  tickPortraitCombatState
} from './fiveStarPortraits';

const fiveStars = PLAYABLE_CHARACTERS.filter(character => character.rarity === 5);
assert.deepEqual(
  Object.keys(FIVE_STAR_PORTRAITS).sort(),
  fiveStars.map(character => character.id).sort(),
  'every current and future five-star must have one portrait definition'
);

for (const character of fiveStars) {
  const definition = FIVE_STAR_PORTRAITS[character.id];
  assert.ok(definition, `${character.name} must define a cumulative portrait kit`);
  assert.equal(definition.tiers.length, 6);
  assert.deepEqual(definition.tiers.map(tier => tier.tier), [1, 2, 3, 4, 5, 6]);
  assert.equal(definition.tiers.filter(tier => tier.kind === 'stat').length, 2);
  assert.equal(definition.tiers[5].kind, 'mechanic');
  assert.ok(definition.rotationSummary.length >= 30);
  assert.ok(definition.tiers.every(tier => !/special ultimate/i.test(tier.description)));
}

assert.deepEqual(getActiveFiveStarPortrait('aurelia', 1)?.statBuffs, {});
assert.deepEqual(getActiveFiveStarPortrait('aurelia', 2)?.statBuffs, { critRate: 0.10 });
assert.deepEqual(getActiveFiveStarPortrait('aurelia', 4)?.statBuffs, {
  critRate: 0.10,
  elementalDamage: 0.18
});
assert.deepEqual(getActiveFiveStarPortrait('kaelen', 4)?.statBuffs, {
  energyRecharge: 0.20,
  elementalDamage: 0.15
});
assert.deepEqual(getActiveFiveStarPortrait('zephyr', 4)?.statBuffs, {
  elementalMastery: 80,
  energyRecharge: 0.18
});
assert.deepEqual(getActiveFiveStarPortrait('goliath', 4)?.statBuffs, {
  def: 0.25,
  hp: 0.20
});

let state = createPortraitCombatState();
let outcome = resolvePortraitCombatEvent(state, {
  kind: 'aurelia-direct-hit', characterId: 'aurelia', portraitLevel: 6,
  targetId: 'enemy-1', targetIsSunBranded: true
});
state = outcome.state;
assert.equal(outcome.procs.length, 0);
for (let hit = 2; hit <= 4; hit++) {
  outcome = resolvePortraitCombatEvent(state, {
    kind: 'aurelia-direct-hit', characterId: 'aurelia', portraitLevel: 6,
    targetId: 'enemy-1', targetIsSunBranded: true
  });
  state = outcome.state;
}
assert.deepEqual(outcome.procs, [{ kind: 'damage', multiplier: 1.6, element: 'Pyro', label: 'SOLAR RUPTURE' }]);

state = createPortraitCombatState();
for (let hit = 1; hit <= 4; hit++) {
  outcome = resolvePortraitCombatEvent(state, {
    kind: 'lyra-combo-finisher', characterId: 'lyra', portraitLevel: 6, targetId: 'enemy-1'
  });
  state = outcome.state;
}
outcome = resolvePortraitCombatEvent(state, {
  kind: 'lyra-skill', characterId: 'lyra', portraitLevel: 6,
  targetId: 'enemy-1', targetIsFrozen: true
});
assert.deepEqual(outcome.procs, [
  { kind: 'damage', multiplier: 2, element: 'Cryo', label: 'MINI AVALANCHE' },
  { kind: 'damage', multiplier: 1, element: 'Cryo', label: 'FROST SHATTER' }
]);

state = createPortraitCombatState();
outcome = resolvePortraitCombatEvent(state, {
  kind: 'goliath-shield-absorbed', characterId: 'goliath', portraitLevel: 6, amount: 6500
});
state = outcome.state;
outcome = resolvePortraitCombatEvent(state, {
  kind: 'goliath-skill', characterId: 'goliath', portraitLevel: 6
});
assert.deepEqual(outcome.procs, [
  { kind: 'def-damage', multiplier: 5, element: 'Geo', label: 'MOUNTAIN FORCE' },
  { kind: 'shield-restore-percent', percent: 0.5, label: 'MOUNTAIN AEGIS' }
]);

state = createPortraitCombatState();
for (let hit = 1; hit <= 3; hit++) {
  outcome = resolvePortraitCombatEvent(state, {
    kind: 'raijin-normal-hit', characterId: 'raijin', portraitLevel: 6, targetId: 'enemy-1'
  });
  state = outcome.state;
}
assert.deepEqual(outcome.procs, [
  { kind: 'bonus-damage', bonusMultiplier: 0.35, element: 'Electro', label: 'THUNDER DISCHARGE' },
  { kind: 'apply-sigil', count: 1, label: 'LIGHTNING SIGIL' }
]);
state = tickPortraitCombatState(state, 4);
assert.equal(state.raijinSkillRecastWindow, 0);

console.log('five-star cumulative portrait contract and rotation rules ok');
