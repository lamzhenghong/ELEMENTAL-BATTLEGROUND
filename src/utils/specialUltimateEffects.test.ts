import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activateBoilingPoint,
  activateLivingStormNetwork,
  clearSpecialUltimateEffects,
  createSpecialUltimateEffectState,
  getSpecialUltimateDamageMultiplier,
  registerSpecialUltimateDirectHit,
  tickSpecialUltimateEffects,
} from './specialUltimateEffects';

const normal = { id: 'normal-1', targetClass: 'normal' as const };
const elite = { id: 'elite-1', targetClass: 'elite' as const };
const boss = { id: 'boss-1', targetClass: 'boss' as const };

test('Boiling Point detonates at five stacks and refreshes boss vulnerability', () => {
  let state = activateBoilingPoint(createSpecialUltimateEffectState(), [normal, boss], 1000);

  for (let hit = 1; hit < 5; hit += 1) {
    const result = registerSpecialUltimateDirectHit(state, boss.id, 300);
    state = result.state;
    assert.equal(result.events.length, 0);
  }

  const fifthHit = registerSpecialUltimateDirectHit(state, boss.id, 300);
  state = fifthHit.state;
  assert.deepEqual(fifthHit.events, [
    { kind: 'damage', targetId: boss.id, damage: 1500, element: 'Pyro', label: 'VAPOR PRESSURE BURST' },
    { kind: 'pull', centerTargetId: boss.id, radius: 240, distance: 70 },
  ]);
  assert.equal(state.boilingPoint?.targets[boss.id]?.stacks, 0);
  assert.equal(getSpecialUltimateDamageMultiplier(state, boss.id), 1.1);

  state = tickSpecialUltimateEffects(state, 4).state;
  assert.equal(getSpecialUltimateDamageMultiplier(state, boss.id), 1);
  assert.equal(getSpecialUltimateDamageMultiplier(state, normal.id), 1);
});

test('Boiling Point expires after ten seconds', () => {
  const state = activateBoilingPoint(createSpecialUltimateEffectState(), [normal], 800);
  assert.equal(tickSpecialUltimateEffects(state, 9.9).state.boilingPoint?.remainingDuration, 0.1);
  assert.equal(tickSpecialUltimateEffects(state, 10).state.boilingPoint, null);
});

test('Living Storm links five priority targets and caps echoed damage', () => {
  const targets = [
    { id: 'normal-1', targetClass: 'normal' as const },
    { id: 'normal-2', targetClass: 'normal' as const },
    { id: 'normal-3', targetClass: 'normal' as const },
    { id: 'normal-4', targetClass: 'normal' as const },
    { id: 'normal-5', targetClass: 'normal' as const },
    boss,
    elite,
  ];
  let state = activateLivingStormNetwork(createSpecialUltimateEffectState(), targets, 1000);
  assert.deepEqual(state.livingStorm?.linkedTargetIds, [boss.id, elite.id, 'normal-1', 'normal-2', 'normal-3']);

  const firstHit = registerSpecialUltimateDirectHit(state, 'normal-1', 10_000);
  state = firstHit.state;
  assert.equal(firstHit.events.length, 4);
  assert.ok(firstHit.events.every(event => event.kind === 'damage' && event.damage === 1000));

  const throttledHit = registerSpecialUltimateDirectHit(state, 'normal-1', 10_000);
  assert.equal(throttledHit.events.length, 0);

  state = tickSpecialUltimateEffects(state, 0.25).state;
  const nextHit = registerSpecialUltimateDirectHit(state, 'normal-1', 1000);
  assert.ok(nextHit.events.every(event => event.kind === 'damage' && event.damage === 200));
});

test('Living Storm roots non-bosses and strikes bosses every three seconds', () => {
  let state = activateLivingStormNetwork(createSpecialUltimateEffectState(), [normal, elite, boss], 1000);
  const pulse = tickSpecialUltimateEffects(state, 3);
  state = pulse.state;

  assert.deepEqual(pulse.events, [
    { kind: 'root', targetId: normal.id, duration: 1.2 },
    { kind: 'root', targetId: elite.id, duration: 0.7 },
    { kind: 'damage', targetId: boss.id, damage: 750, element: 'Electro', label: 'CONCENTRATED LIGHTNING' },
  ]);
  assert.equal(state.livingStorm?.remainingDuration, 9);
  assert.equal(tickSpecialUltimateEffects(state, 9).state.livingStorm, null);
});

test('clearing Special Ultimate effects is idempotent', () => {
  const active = activateBoilingPoint(createSpecialUltimateEffectState(), [normal], 1000);
  const cleared = clearSpecialUltimateEffects(active);
  assert.deepEqual(cleared, createSpecialUltimateEffectState());
  assert.deepEqual(clearSpecialUltimateEffects(cleared), createSpecialUltimateEffectState());
});
