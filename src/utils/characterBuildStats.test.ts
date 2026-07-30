import assert from 'node:assert/strict';
import type { Artifact, PlayableCharacter, Weapon } from '../types';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import {
  calculateCharacterBuildStats,
  getUpgradedWeaponStats
} from './characterBuildStats';

const character: PlayableCharacter = {
  id: 'fixture',
  role: 'dps',
  name: 'Fixture Hero',
  title: 'Build Test',
  rarity: 4,
  element: 'Pyro',
  weaponType: 'Sword',
  personality: '',
  backstory: '',
  avatarPlaceholder: '',
  themeColor: '',
  baseStats: {
    hp: 1000,
    atk: 100,
    def: 50,
    critRate: 0.05,
    critDmg: 0.5
  },
  skills: {
    basic: { name: '', desc: '', cooldown: 0, damageMultiplier: 1, element: 'Pyro' },
    skill: { name: '', desc: '', cooldown: 5, damageMultiplier: 1, element: 'Pyro' },
    ultimate: { name: '', desc: '', cooldown: 0, damageMultiplier: 1, element: 'Pyro' }
  },
  relations: []
};

const baseBuild = calculateCharacterBuildStats({
  character,
  level: 10,
  equippedArtifacts: [],
  portraitLevel: 0
});

assert.equal(baseBuild.charMultiplier, 1.5);
assert.equal(baseBuild.finalHp, 1710);
assert.equal(baseBuild.finalDef, 111);
assert.equal(baseBuild.finalAtk, 217);
assert.equal(baseBuild.finalCritRate, 5);
assert.equal(baseBuild.finalCritDmg, 50);
assert.equal(baseBuild.finalCooldownReduction, 0);

const weapon: Weapon = {
  id: 'weapon-fixture',
  name: 'Fixture Sword',
  rarity: 5,
  weaponType: 'Sword',
  baseAtk: 100,
  statBonus: 'Crit Rate +10%',
  level: 10
};

assert.equal(getUpgradedWeaponStats(weapon).calcBaseAtk, 125);
assert.equal(getUpgradedWeaponStats(weapon).calcStatBonus, 'Crit Rate +12.4%');

const celestialArtifacts: Artifact[] = [
  { id: 'helmet', name: '', slot: 'helmet', set: 'Celestial', rarity: 5 },
  { id: 'hands', name: '', slot: 'hands', set: 'Celestial', rarity: 5 },
  { id: 'leg', name: '', slot: 'leg', set: 'Celestial', rarity: 5 },
  { id: 'shoe', name: '', slot: 'shoe', set: 'Celestial', rarity: 5 }
];

const equippedBuild = calculateCharacterBuildStats({
  character,
  level: 10,
  equippedWeapon: weapon,
  equippedArtifacts: celestialArtifacts,
  portraitLevel: 0
});

assert.equal(equippedBuild.setCounts.Celestial, 4);
assert.equal(equippedBuild.finalWeaponBaseAtk, 375);
assert.equal(equippedBuild.finalHp, 2394);
assert.equal(equippedBuild.finalAtk, 815);
assert.ok(Math.abs(equippedBuild.finalCritRate - 64.4) < 0.000001);
assert.equal(equippedBuild.finalCritDmg, 149);

const aurelia = PLAYABLE_CHARACTERS.find(candidate => candidate.id === 'aurelia');
assert.ok(aurelia);
const aureliaBase = calculateCharacterBuildStats({
  character: aurelia,
  level: 1,
  equippedArtifacts: [],
  portraitLevel: 0
});
const aureliaPortrait = calculateCharacterBuildStats({
  character: aurelia,
  level: 1,
  equippedArtifacts: [],
  portraitLevel: 1
});
assert.equal(aureliaPortrait.portraitBuffs.atk, 0.08);
assert.equal(
  aureliaPortrait.finalAtk,
  Math.round(aureliaBase.finalAtk * 1.08)
);

console.log('character build stat rules ok');
