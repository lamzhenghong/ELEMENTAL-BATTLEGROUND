import { getArtifactMainStat } from '../data/artifacts';
import { WEAPONS_DATABASE } from '../data/weapons';
import type { Artifact, ArtifactSet, PlayableCharacter, Weapon } from '../types';
import { getAccumulatedPortraitBuffs } from './portraits';

export const getUpgradedWeaponStats = (weapon: Weapon) => {
  const level = weapon.level || 1;
  const upgradeSteps = Math.floor(level / 5);
  const calcBaseAtk = Math.round(weapon.baseAtk + level * 2.5);

  const statBonus = weapon.statBonus || 'None +0%';
  let baseBonusValue = 0;
  let statBonusPrefix = '';
  let statBonusSuffix = '';
  const bonusNumberMatch = statBonus.match(/(\d+(\.\d+)?)/);
  if (bonusNumberMatch) {
    baseBonusValue = parseFloat(bonusNumberMatch[1]);
    const valueIndex = bonusNumberMatch.index ?? 0;
    statBonusPrefix = statBonus.slice(0, valueIndex);
    statBonusSuffix = statBonus.slice(valueIndex + bonusNumberMatch[1].length);
  }

  const upgradedBonusValue = Number(
    (baseBonusValue * (1 + upgradeSteps * 0.12)).toFixed(1)
  );
  const calcStatBonus = bonusNumberMatch
    ? `${statBonusPrefix}${upgradedBonusValue}${statBonusSuffix}`
    : `${statBonus} (+${upgradeSteps * 12}%)`;

  const template = WEAPONS_DATABASE.find(candidate => candidate.name === weapon.name);
  const baseFeatureDesc = template?.featureDesc
    ?? 'Master tier armaments with scaled global combat potency.';
  let calcFeatureDesc = baseFeatureDesc;
  const percentMatches = baseFeatureDesc.match(/(\d+)%/g);
  if (percentMatches) {
    percentMatches.forEach(match => {
      const originalValue = parseInt(match);
      const upgradedValue = Math.round(originalValue * (1 + upgradeSteps * 0.08));
      calcFeatureDesc = calcFeatureDesc.replace(match, `${upgradedValue}%`);
    });
  }

  return {
    calcBaseAtk,
    calcStatBonus,
    calcFeatureDesc,
    upgradeSteps
  };
};

export interface CharacterBuildStatsInput {
  character: PlayableCharacter;
  level: number;
  equippedWeapon?: Weapon;
  equippedArtifacts: Artifact[];
  portraitLevel: number;
}

export const calculateCharacterBuildStats = ({
  character,
  level,
  equippedWeapon,
  equippedArtifacts,
  portraitLevel
}: CharacterBuildStatsInput) => {
  let weaponCritRate = 0;
  let weaponCritDmg = 0;
  let weaponAtkPercent = 0;

  if (equippedWeapon) {
    const upgradeSteps = Math.floor(equippedWeapon.level / 5);
    const statBonus = equippedWeapon.statBonus || '';
    const bonusNumberMatch = statBonus.match(/(\d+(\.\d+)?)/);
    const baseBonusValue = bonusNumberMatch ? parseFloat(bonusNumberMatch[1]) : 0;
    const upgradedBonusValue = baseBonusValue * (1 + upgradeSteps * 0.12);
    const normalizedStat = statBonus.toLowerCase();

    if (normalizedStat.includes('crit rate')) {
      weaponCritRate = upgradedBonusValue / 100;
    } else if (normalizedStat.includes('crit dmg') || normalizedStat.includes('crit damage')) {
      weaponCritDmg = upgradedBonusValue / 100;
    } else if (normalizedStat.includes('atk') || normalizedStat.includes('attack')) {
      weaponAtkPercent = upgradedBonusValue / 100;
    }
  }

  const charMultiplier = character.rarity === 5 ? 3 : character.rarity === 4 ? 1.5 : 1;
  const weaponMultiplier = equippedWeapon
    ? equippedWeapon.rarity === 5 ? 3 : equippedWeapon.rarity === 4 ? 1.5 : 1
    : 1;
  const portraitBuffs = getAccumulatedPortraitBuffs(character.id, portraitLevel);

  const setCounts: Record<ArtifactSet, number> = {
    Vanguard: 0,
    Guardian: 0,
    Celestial: 0,
    Chrono: 0
  };
  equippedArtifacts.forEach(artifact => {
    if (artifact.set in setCounts) setCounts[artifact.set]++;
  });

  let artifactHpPercent = setCounts.Guardian >= 4
    ? 0.55
    : setCounts.Guardian >= 2 ? 0.20 : 0;
  let artifactDmgPercent = setCounts.Vanguard >= 4
    ? 0.45
    : setCounts.Vanguard >= 2 ? 0.15 : 0;
  let artifactCritRate = setCounts.Celestial >= 4
    ? 0.25
    : setCounts.Celestial >= 2 ? 0.10 : 0;
  let artifactCritDmg = setCounts.Celestial >= 4
    ? 0.55
    : setCounts.Celestial >= 2 ? 0.20 : 0;
  const artifactCooldownReduction = setCounts.Chrono >= 4
    ? 0.30
    : setCounts.Chrono >= 2 ? 0.10 : 0;

  equippedArtifacts.forEach(artifact => {
    const stat = getArtifactMainStat(artifact.slot, artifact.rarity);
    if (artifact.slot === 'helmet') {
      artifactHpPercent += stat.value;
    } else if (artifact.slot === 'hands') {
      artifactDmgPercent += stat.value;
    } else if (artifact.slot === 'leg') {
      artifactCritRate += stat.value;
    } else if (artifact.slot === 'shoe') {
      artifactCritDmg += stat.value;
    }
  });

  let hp = Math.round((character.baseStats.hp + level * 14) * charMultiplier);
  let def = Math.round((character.baseStats.def + level * 2.4) * charMultiplier);
  const finalCharacterBaseAtk = Math.round(
    (character.baseStats.atk + level * 3.8) * charMultiplier
  );
  const finalWeaponBaseAtk = equippedWeapon
    ? Math.round(
      (equippedWeapon.baseAtk + equippedWeapon.level * 2.5) * weaponMultiplier
    )
    : 10;
  const rawAtk = finalCharacterBaseAtk + finalWeaponBaseAtk;
  let atk = Math.round(rawAtk * (1 + weaponAtkPercent + artifactDmgPercent));
  let critRate = character.baseStats.critRate + weaponCritRate + artifactCritRate;
  let critDmg = character.baseStats.critDmg + weaponCritDmg + artifactCritDmg;

  hp = Math.round(hp * (1 + portraitBuffs.hp + artifactHpPercent));
  def = Math.round(def * (1 + portraitBuffs.def));
  atk = Math.round(atk * (1 + portraitBuffs.atk));
  critRate += portraitBuffs.critRate;
  critDmg += portraitBuffs.critDmg;

  return {
    charMultiplier,
    weaponMultiplier,
    portraitBuffs,
    setCounts,
    weaponCritRate,
    weaponCritDmg,
    weaponAtkPercent,
    artifactHpPercent,
    artifactDmgPercent,
    artifactCritRate,
    artifactCritDmg,
    finalCharacterBaseAtk,
    finalWeaponBaseAtk,
    finalHp: hp,
    finalDef: def,
    finalAtk: atk,
    finalCritRate: critRate * 100,
    finalCritDmg: critDmg * 100,
    finalCooldownReduction: artifactCooldownReduction * 100,
    upgradedWeaponStats: equippedWeapon
      ? getUpgradedWeaponStats(equippedWeapon)
      : null
  };
};
