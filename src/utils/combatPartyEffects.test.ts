import assert from 'node:assert/strict';
import {
  activateVeyraDominion,
  addMaelisShield,
  addPeriodicField,
  addReactionField,
  addWhirlpool,
  advanceVeyraFieldTick,
  clearPartyEffects,
  consumePartyShield,
  createPartyEffectState,
  getReactionFieldModifiers,
  restorePartyShield,
  tickPartyEffects
} from './combatPartyEffects';

let state = createPartyEffectState();
state = addMaelisShield(state);
assert.equal(state.shield?.currentHp, 1000);
state = addMaelisShield(state);
state = addMaelisShield(state);
state = addMaelisShield(state);
assert.equal(state.shield?.currentHp, 3000);

let shieldHit = consumePartyShield(state, 1200);
assert.equal(shieldHit.absorbedDamage, 1200);
assert.equal(shieldHit.remainingDamage, 0);
assert.equal(shieldHit.state.shield?.currentHp, 1800);
shieldHit = consumePartyShield(shieldHit.state, 2000);
assert.equal(shieldHit.absorbedDamage, 1800);
assert.equal(shieldHit.remainingDamage, 200);
assert.equal(shieldHit.state.shield, null);

state = addMaelisShield(createPartyEffectState(), 1000, 4000);
state = restorePartyShield(state, 500);
assert.equal(state.shield?.currentHp, 1500);
assert.equal(state.shield?.maxHp, 4000);

state = addReactionField(createPartyEffectState(), { x: 100, y: 100 });
state = addReactionField(state, { x: 100, y: 100 });
assert.deepEqual(getReactionFieldModifiers(state, 100, 100), {
  reactionMultiplier: 2,
  crowdControlDurationMultiplier: 2,
  enemyDamageMultiplier: 0.8
});
assert.equal(tickPartyEffects(state, 14).state.effects.length, 2);
assert.equal(tickPartyEffects(state, 16).state.effects.length, 0);

state = addReactionField(createPartyEffectState(), { x: 100, y: 100 }, {
  duration: 18,
  enemyDamageMultiplier: 0.75
});
assert.equal(tickPartyEffects(state, 17).state.effects.length, 1);
assert.equal(getReactionFieldModifiers(state, 100, 100).enemyDamageMultiplier, 0.75);

state = addWhirlpool(createPartyEffectState(), { x: 50, y: 75 });
assert.equal(state.effects[0]?.kind, 'whirlpool');
assert.equal(tickPartyEffects(state, 1).state.effects.length, 1);
state = addWhirlpool(createPartyEffectState(), { x: 50, y: 75 }, { duration: 2.8, endDamageMultiplier: 1.5 });
assert.equal(state.effects[0]?.duration, 2.8);

state = activateVeyraDominion(createPartyEffectState(), {
  x: 10,
  y: 20,
  snapshotAtk: 1234
});
assert.equal(state.effects.length, 2);
let partyTick = tickPartyEffects(state, 2, { veyra: { x: 30, y: 40 } });
assert.equal(partyTick.events.length, 1);
assert.equal(partyTick.events[0]?.kind, 'field-damage');
assert.equal(partyTick.events[0]?.damage, 1234);
assert.deepEqual(partyTick.events[0]?.position, { x: 30, y: 40 });
assert.equal(partyTick.events[0]?.reactionContext.source, 'persistent-field');
assert.equal(partyTick.events[0]?.reactionContext.appliesElement, false);

state = activateVeyraDominion(createPartyEffectState(), {
  x: 10, y: 20, snapshotAtk: 1000, duration: 12.5, fieldAttackMultiplier: 1.25
});
partyTick = tickPartyEffects(state, 2);
assert.equal(partyTick.events[0]?.damage, 1250);
state = advanceVeyraFieldTick(state, 0.5);
const electricField = state.effects.find(effect => effect.kind === 'electric-field');
assert.equal(electricField?.kind === 'electric-field' ? electricField.timeUntilNextTick : -1, 1.5);

state = addPeriodicField(createPartyEffectState(), {
  sourceCharacterId: 'lyra', x: 20, y: 30, radius: 260,
  duration: 4, snapshotAtk: 1000, attackMultiplier: 0.6, tickInterval: 1
});
partyTick = tickPartyEffects(state, 1);
assert.equal(partyTick.events[0]?.sourceCharacterId, 'lyra');
assert.equal(partyTick.events[0]?.damage, 600);

// Party effects are session state: switching or a Special Ultimate does not recreate them.
partyTick = tickPartyEffects(partyTick.state, 1, { aurelia: { x: 500, y: 500 } });
assert.equal(partyTick.state.effects.length, 1);

const cleared = clearPartyEffects(partyTick.state);
assert.deepEqual(cleared, createPartyEffectState());
assert.deepEqual(clearPartyEffects(cleared), createPartyEffectState());

console.log('shared combat party effects ok');
