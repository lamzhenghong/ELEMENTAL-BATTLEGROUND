import assert from 'node:assert/strict';
import test from 'node:test';
import type { CombatCharacter } from '../types';
import { tickCombatPartyTimers } from './combatPartyTimers';

const character = (overrides: Partial<CombatCharacter> = {}) => ({
  id: 'marina',
  skillCooldownRemaining: 0,
  ...overrides,
}) as CombatCharacter;

test('idle combat does not allocate a new party or character', () => {
  const hero = character();
  const party = [hero];
  assert.equal(tickCombatPartyTimers(party, 1), party);
  assert.equal(tickCombatPartyTimers(party, 0), party);
});

test('seconds and frame timers advance equally at different refresh rates', () => {
  for (const fps of [30, 60, 120]) {
    let party = [character({ skillCooldownRemaining: 2, sacrificialCooldown: 120, portraitUltimateTimer: 2 })];
    const step = 60 / fps;
    for (let frame = 0; frame < fps; frame++) party = tickCombatPartyTimers(party, step);
    assert.ok(Math.abs(party[0].skillCooldownRemaining - 1) < 0.001);
    assert.ok(Math.abs((party[0].sacrificialCooldown ?? 0) - 60) < 0.001);
    assert.ok(Math.abs((party[0].portraitUltimateTimer ?? 0) - 1) < 0.001);
  }
});

test('expired timers clamp at zero without changing unaffected party members', () => {
  const idleHero = character({ id: 'idle' });
  const party = [character({ skillCooldownRemaining: 0.01, debateClubCd: 0.25 }), idleHero];
  const next = tickCombatPartyTimers(party, 2);
  assert.equal(next[0].skillCooldownRemaining, 0);
  assert.equal(next[0].debateClubCd, 0);
  assert.equal(next[1], idleHero);
});
