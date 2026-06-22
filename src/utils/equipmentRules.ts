export type EquippedWeaponMap = Record<string, string>;

export function normalizeUniqueEquippedWeapons(equippedWeapons: EquippedWeaponMap): EquippedWeaponMap {
  const seenWeaponIds = new Set<string>();
  const normalized: EquippedWeaponMap = {};

  for (const [characterId, weaponId] of Object.entries(equippedWeapons || {})) {
    if (!weaponId || seenWeaponIds.has(weaponId)) continue;
    seenWeaponIds.add(weaponId);
    normalized[characterId] = weaponId;
  }

  return normalized;
}

export function assignUniqueWeaponOwner(
  equippedWeapons: EquippedWeaponMap,
  characterId: string,
  weaponId: string
): EquippedWeaponMap {
  const next: EquippedWeaponMap = {};

  for (const [ownerId, equippedWeaponId] of Object.entries(equippedWeapons || {})) {
    if (ownerId === characterId || equippedWeaponId === weaponId) continue;
    next[ownerId] = equippedWeaponId;
  }

  if (weaponId) {
    next[characterId] = weaponId;
  }

  return normalizeUniqueEquippedWeapons(next);
}
