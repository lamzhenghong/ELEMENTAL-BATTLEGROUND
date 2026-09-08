import type { ArtifactSlot, SavedTeamBuild, SaveState, TeamBuildItem } from '../types';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { assignUniqueWeaponOwner } from './equipmentRules';

export const MAX_TEAM_BUILDS = 5;
export const TEAM_BUILD_NAME_LENGTH = 32;
export const BUILD_SLOTS: ArtifactSlot[] = ['helmet', 'hands', 'leg', 'shoe'];
export const BUILD_SLOT_LABELS: Record<ArtifactSlot, string> = { helmet: 'Head', hands: 'Hands', leg: 'Legs', shoe: 'Feet' };
export const buildHeroName = (id: string) => PLAYABLE_CHARACTERS.find(c => c.id === id)?.name ?? id;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const safeId = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 128 && !['__proto__', 'constructor', 'prototype'].includes(v);
const itemRef = (v: unknown): v is TeamBuildItem => record(v) && safeId(v.id) && typeof v.name === 'string' && v.name.length <= 180;

export function normalizeTeamBuilds(value: unknown): SavedTeamBuild[] {
  if (!Array.isArray(value)) return [];
  const result: SavedTeamBuild[] = [];
  for (const b of value) {
    if (!record(b) || !safeId(b.id) || result.some(x => x.id === b.id) || typeof b.name !== 'string' || !b.name.trim()
      || typeof b.damageSkin !== 'string' || !Array.isArray(b.members) || b.members.length < 1 || b.members.length > 4) continue;
    if (!b.members.every(m => record(m) && safeId(m.characterId) && (m.weapon === null || itemRef(m.weapon))
      && record(m.artifacts) && Object.entries(m.artifacts).every(([slot, item]) => BUILD_SLOTS.includes(slot as ArtifactSlot) && itemRef(item)))) continue;
    result.push({
      id: b.id, name: b.name.trim().slice(0, TEAM_BUILD_NAME_LENGTH), damageSkin: b.damageSkin.slice(0, 32),
      members: b.members.map(m => ({ characterId: m.characterId, weapon: m.weapon ? { ...m.weapon } : null, artifacts: Object.fromEntries(Object.entries(m.artifacts).map(([s, v]) => [s, { ...(v as TeamBuildItem) }])) })),
    });
    if (result.length === MAX_TEAM_BUILDS) break;
  }
  return result;
}

export function cleanTeamBuildName(name: string): string {
  const clean = name.trim();
  if (!clean || clean.length > TEAM_BUILD_NAME_LENGTH) throw new Error('Use a team name between 1 and 32 characters.');
  return clean;
}

export function captureTeamBuild(state: SaveState, name: string, id: string): SavedTeamBuild {
  if (!state.partyIds.length || state.partyIds.length > 4) throw new Error('Choose 1 to 4 heroes before saving a build.');
  return {
    id, name: cleanTeamBuildName(name), damageSkin: state.activeDamageSkin || 'Default',
    members: state.partyIds.map(characterId => {
      const weaponId = state.characterEquippedWeapon[characterId];
      const weapon = state.inventoryWeapons.find(w => w.id === weaponId);
      return {
        characterId,
        weapon: weaponId ? { id: weaponId, name: weapon?.name ?? 'Missing weapon' } : null,
        artifacts: Object.fromEntries(BUILD_SLOTS.flatMap(slot => {
          const artId = state.characterEquippedArtifacts?.[characterId]?.[slot];
          const art = state.inventoryArtifacts?.find(a => a.id === artId);
          return artId ? [[slot, { id: artId, name: art?.name ?? 'Missing artifact' }]] : [];
        })),
      };
    }),
  };
}

export function renameTeamBuild(state: SaveState, id: string, name: string): SaveState {
  const clean = cleanTeamBuildName(name);
  return { ...state, savedTeamBuilds: (state.savedTeamBuilds ?? []).map(b => b.id === id ? { ...b, name: clean } : b) };
}

export function previewTeamBuild(state: SaveState, build: SavedTeamBuild) {
  const issues: string[] = [];
  const transfers: string[] = [];
  const heroes = new Set<string>();
  const weapons = new Set<string>();
  const artifacts = new Set<string>();
  if (build.members.length < 1 || build.members.length > 4) issues.push('A build needs 1 to 4 heroes.');
  for (const member of build.members) {
    const hero = PLAYABLE_CHARACTERS.find(c => c.id === member.characterId);
    const label = buildHeroName(member.characterId);
    if (!hero || !state.unlockedCharacterIds.includes(member.characterId)) issues.push(`${label} is not unlocked.`);
    if (heroes.has(member.characterId)) issues.push(`${label} appears more than once.`);
    heroes.add(member.characterId);
    if (member.weapon) {
      const weapon = state.inventoryWeapons.find(w => w.id === member.weapon!.id);
      if (!weapon) issues.push(`${label}: ${member.weapon.name} is missing.`);
      else if (hero && weapon.weaponType !== hero.weaponType) issues.push(`${label} cannot use ${weapon.name}.`);
      if (weapons.has(member.weapon.id)) issues.push(`${member.weapon.name} is assigned to multiple heroes.`);
      weapons.add(member.weapon.id);
      for (const [owner, id] of Object.entries(state.characterEquippedWeapon)) {
        if (id === member.weapon.id && owner !== member.characterId) transfers.push(`${member.weapon.name}: ${buildHeroName(owner)} to ${label}`);
      }
    }
    for (const slot of BUILD_SLOTS) {
      const ref = member.artifacts[slot];
      if (!ref) continue;
      const art = state.inventoryArtifacts?.find(a => a.id === ref.id);
      if (!art) issues.push(`${label}: ${ref.name} is missing.`);
      else if (art.slot !== slot) issues.push(`${label}: ${ref.name} is in the wrong slot.`);
      if (artifacts.has(ref.id)) issues.push(`${ref.name} is assigned to multiple slots.`);
      artifacts.add(ref.id);
      const owners = new Set(Object.entries(state.characterEquippedArtifacts ?? {}).filter(([, slots]) => Object.values(slots).includes(ref.id)).map(([owner]) => owner));
      if (art?.equippedTo) owners.add(art.equippedTo);
      for (const owner of owners) if (owner !== member.characterId) transfers.push(`${ref.name}: ${buildHeroName(owner)} to ${label}`);
    }
  }
  if (!['Default', 'Ice', 'Void', 'Celestial'].includes(build.damageSkin)
    || (build.damageSkin !== 'Default' && !state.unlockedDamageSkins?.includes(build.damageSkin))) issues.push(`${build.damageSkin} damage skin is not unlocked.`);
  return { issues, transfers };
}

// Apply one validated equipment transaction; never partially restore a missing build.
export function applyTeamBuild(state: SaveState, build: SavedTeamBuild, outsideCombat: boolean): SaveState {
  if (!outsideCombat || previewTeamBuild(state, build).issues.length) return state;
  let weaponMap = { ...state.characterEquippedWeapon };
  const artifactMap = Object.fromEntries(Object.entries(state.characterEquippedArtifacts ?? {}).map(([id, slots]) => [id, { ...slots }]));
  for (const member of build.members) {
    delete weaponMap[member.characterId];
    artifactMap[member.characterId] = {};
  }
  for (const member of build.members) {
    weaponMap = assignUniqueWeaponOwner(weaponMap, member.characterId, member.weapon?.id ?? '');
    for (const slot of BUILD_SLOTS) {
      const ref = member.artifacts[slot];
      if (!ref) continue;
      for (const slots of Object.values(artifactMap)) {
        for (const [oldSlot, id] of Object.entries(slots)) if (id === ref.id) delete slots[oldSlot];
      }
      artifactMap[member.characterId][slot] = ref.id;
    }
  }
  const artifactOwners = new Map(Object.entries(artifactMap).flatMap(([owner, slots]) => Object.values(slots).map(id => [id, owner] as const)));
  const weaponOwners = new Map(Object.entries(weaponMap).map(([owner, id]) => [id, owner]));
  return {
    ...state, partyIds: build.members.map(m => m.characterId), activeDamageSkin: build.damageSkin,
    characterEquippedWeapon: weaponMap, characterEquippedArtifacts: artifactMap,
    inventoryWeapons: state.inventoryWeapons.map(w => ({ ...w, equippedTo: weaponOwners.get(w.id) })),
    inventoryArtifacts: (state.inventoryArtifacts ?? []).map(a => ({ ...a, equippedTo: artifactOwners.get(a.id) })),
  };
}
