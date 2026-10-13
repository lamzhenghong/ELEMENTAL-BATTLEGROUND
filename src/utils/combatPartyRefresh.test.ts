import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import type { CombatCharacter } from '../types';
import { reconcileCombatParty, resolveActivePartyIndex } from './combatPartySelection';
import { normalizeUniqueEquippedWeapons } from './equipmentRules';

const hero = (id: string, overrides: Partial<CombatCharacter> = {}): CombatCharacter => {
  const template = PLAYABLE_CHARACTERS.find(character => character.id === id)!;
  return {
    ...template, level: 40, maxHp: 1000, currentHp: 1000, atk: 400, def: 100,
    critRate: 0.1, critDmg: 0.5, skillCooldownRemaining: 0,
    ultimateEnergy: 40, ultimateMaxEnergy: 80, ...overrides,
  };
};

test('wave reward save rebuilds preserve all four heroes at different energy levels', () => {
  const equipment = { aurelia: 'blade', kaelen: 'codex' };
  assert.notEqual(normalizeUniqueEquippedWeapons(equipment), equipment, 'reward saves can replace an equivalent equipment map');
  const ids = ['aurelia', 'kaelen', 'maelis', 'veyra'];
  const party = ids.map((id, index) => hero(id, { ultimateEnergy: [0, 11, 67, 80][index] }));
  let refreshed = party;
  for (let wave = 0; wave < 10; wave++) refreshed = reconcileCombatParty(refreshed, ids.map(id => hero(id)));
  assert.deepEqual(refreshed.map(character => character.ultimateEnergy), [0, 11, 67, 80]);
  assert.deepEqual(party.map(character => character.ultimateEnergy), [0, 11, 67, 80]);
});

test('reward refresh never heals damage, revives defeated heroes, or resets active effects', () => {
  const party = [hero('aurelia', {
    currentHp: 240, skillCooldownRemaining: 9, royalStacks: 3,
    widsithBuffTimer: 120, widsithCooldown: 400, widsithBuffAtk: 0.25,
    sacrificialCooldown: 180, swapBuffTimer: 60, swapBuffAtk: 0.2,
    swapBuffCooldown: 200, crescentPikeTimer: 90, debateClubTimer: 80,
    debateClubCd: 30, scepterBubbleCd: 15, spearDoubleCd: 45,
    favoniusCooldown: 100, portraitNormalHitCount: 5, portraitUltimateTimer: 4,
  }), hero('kaelen', { currentHp: 0 })];
  const next = reconcileCombatParty(party, [hero('aurelia'), hero('kaelen')]);
  for (const field of Object.keys(party[0]) as (keyof CombatCharacter)[]) {
    assert.deepEqual(next[0][field], party[0][field], `preserve ${field}`);
  }
  assert.equal(next[1].currentHp, 0);
});

test('rebuilt stats update while health, energy and skill cooldown remain live', () => {
  const old = hero('aurelia', { currentHp: 600, ultimateEnergy: 73, skillCooldownRemaining: 8 });
  const updated = hero('aurelia', { maxHp: 1400, atk: 600, energyRecharge: 0.4, portraitLevel: 3 });
  const [next] = reconcileCombatParty([old], [updated]);
  assert.equal(next.atk, 600);
  assert.equal(next.maxHp, 1400);
  assert.equal(next.energyRecharge, 0.4);
  assert.equal(next.portraitLevel, 3);
  assert.equal(next.currentHp, 600);
  assert.equal(next.ultimateEnergy, 73);
  assert.equal(next.skillCooldownRemaining, 8);
});

test('reordering follows character IDs; added heroes alone receive starting resources', () => {
  const old = [hero('aurelia', { ultimateEnergy: 12 }), hero('kaelen', { ultimateEnergy: 80 })];
  const next = reconcileCombatParty(old, [hero('kaelen'), hero('maelis'), hero('aurelia')]);
  assert.deepEqual(next.map(character => character.ultimateEnergy), [80, 40, 12]);
  assert.equal(resolveActivePartyIndex(next, 'kaelen'), 0);
  assert.deepEqual(reconcileCombatParty(old, []), []);
});

test('first battle and Rogue carry-in use their supplied initial resources', () => {
  const initial = [hero('aurelia'), hero('kaelen', { currentHp: 200, ultimateEnergy: 19 })];
  assert.deepEqual(reconcileCombatParty([], initial), initial);
});

test('actual lower resource caps clamp existing values without replenishing them', () => {
  const [next] = reconcileCombatParty(
    [hero('aurelia', { currentHp: 800, ultimateEnergy: 80 })],
    [hero('aurelia', { maxHp: 500, ultimateMaxEnergy: 60 })],
  );
  assert.equal(next.currentHp, 500);
  assert.equal(next.ultimateEnergy, 60);
});

test('the shared combat initialization reconciles live resources instead of replacing them', () => {
  const source = readFileSync(new URL('../components/CombatArena.tsx', import.meta.url), 'utf8');
  assert.match(source, /reconcileCombatParty\(/);
  assert.doesNotMatch(source, /setCombatParty\(list\)/);
});
