export const FIVE_STAR_BASE_RATE = 0.005;
export const FOUR_STAR_BASE_RATE = 0.051;
export const FIVE_STAR_HARD_PITY = 90;
export const FOUR_STAR_HARD_PITY = 10;

const DUPLICATE_WEAPON_MORA_REFUNDS: Record<3 | 4 | 5, number> = {
  3: 20_000,
  4: 50_000,
  5: 100_000
};

export const isFiveStarRoll = (roll: number, pityAfterIncrement: number) => {
  return roll < FIVE_STAR_BASE_RATE || pityAfterIncrement >= FIVE_STAR_HARD_PITY;
};

export const isFourStarRoll = (roll: number, pityAfterIncrement: number) => {
  return roll < FIVE_STAR_BASE_RATE + FOUR_STAR_BASE_RATE || pityAfterIncrement >= FOUR_STAR_HARD_PITY;
};

export const getDuplicateWeaponMoraRefund = (rarity: 3 | 4 | 5) => {
  return DUPLICATE_WEAPON_MORA_REFUNDS[rarity];
};
