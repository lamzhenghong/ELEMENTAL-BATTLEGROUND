import assert from 'node:assert/strict';
import { LIMITED_CHARACTER_KITS, getCharacterKit } from './characterKits';

assert.deepEqual(Object.keys(LIMITED_CHARACTER_KITS).sort(), ['aurelia', 'kaelen', 'maelis', 'veyra']);

const aurelia = getCharacterKit('aurelia');
assert.equal(aurelia?.role, 'dps');
assert.equal(aurelia?.normalAttack.name, 'Scorching Edge');
assert.match(aurelia?.skill.description ?? '', /35%.*ATK.*once every second/i);
assert.equal(aurelia?.normalAttack.damageMultiplier, 1.5);
assert.equal(aurelia?.normalAttack.reactionEligible, false);
assert.deepEqual(aurelia?.skill.effects, [{
  kind: 'burn', duration: 6, tickInterval: 1, attackMultiplier: 0.35, refreshes: true
}]);
assert.equal(aurelia?.burst.effects[0]?.kind, 'large-explosion');
assert.equal(aurelia?.burst.rangeMultiplier, 2.5);

const kaelen = getCharacterKit('kaelen');
assert.equal(kaelen?.normalAttack.name, 'Chilling Current');
assert.equal(kaelen?.skill.name, 'Frozen Tide');
assert.equal(kaelen?.burst.name, 'Abyssal Whirlpool');
assert.deepEqual(kaelen?.normalAttack.effects, [{ kind: 'slow', strength: 0.1, duration: 0.5 }]);
assert.equal(kaelen?.skill.shape, 'full-aoe');
assert.deepEqual(kaelen?.skill.effects, [{ kind: 'slow', strength: 0.4, duration: 3, bossesImmune: true }]);
assert.deepEqual(kaelen?.burst.effects, [{ kind: 'whirlpool', duration: 1.8, bossesImmune: true }]);

const maelis = getCharacterKit('maelis');
assert.equal(maelis?.normalAttack.name, 'Withering Mark');
assert.equal(maelis?.skill.name, 'Verdant Aegis');
assert.equal(maelis?.burst.name, 'Verdant Resonance Field');
assert.match(maelis?.burst.description ?? '', /15 seconds.*20%.*doubled/i);
assert.deepEqual(maelis?.normalAttack.effects, [{
  kind: 'damage-down', procChance: 0.1, strength: 0.1, duration: 3
}]);
assert.equal(maelis?.skill.directDamage, false);
assert.deepEqual(maelis?.skill.effects, [{ kind: 'party-shield', amount: 1000, cap: 3000 }]);
assert.deepEqual(maelis?.burst.effects, [{
  kind: 'reaction-field', duration: 15, damageDown: 0.2, reactionMultiplier: 2, crowdControlDurationMultiplier: 2
}]);

const veyra = getCharacterKit('veyra');
assert.equal(veyra?.normalAttack.name, 'Voltaic Shock');
assert.equal(veyra?.skill.name, 'Thunder Lock');
assert.equal(veyra?.burst.name, 'Stormglass Dominion');
assert.match(veyra?.burst.description ?? '', /10 seconds.*100%.*ATK.*2 seconds/i);
assert.deepEqual(veyra?.normalAttack.effects, [{
  kind: 'stun', procChance: 0.15, normalDuration: 1, eliteDuration: 0.5, bossesImmune: true
}]);
assert.deepEqual(veyra?.skill.effects, [{
  kind: 'stun', normalDuration: 4, eliteDuration: 2, bossesImmune: true
}]);
assert.deepEqual(veyra?.burst.effects, [{
  kind: 'dominion-field', duration: 10, normalAttackDamageMultiplier: 1.5,
  normalAttackRangeMultiplier: 2, fieldTickInterval: 2, fieldAttackMultiplier: 1
}]);

assert.equal(getCharacterKit('marina'), null);

console.log('limited character kit registry ok');
