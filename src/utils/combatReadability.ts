export const CRITICAL_PLAYER_HEALTH_RATIO = 0.1;

export function isCriticalPlayerHealth(currentHp: number, maxHp: number): boolean {
  if (!Number.isFinite(currentHp) || !Number.isFinite(maxHp) || maxHp <= 0 || currentHp <= 0) {
    return false;
  }

  return currentHp / maxHp < CRITICAL_PLAYER_HEALTH_RATIO;
}

export function getCriticalHealthBlinkAlpha(currentHp: number, maxHp: number, nowMs: number): number {
  if (!isCriticalPlayerHealth(currentHp, maxHp)) return 1;

  const pulse = (Math.sin((Math.max(0, nowMs) / 900) * Math.PI * 2) + 1) / 2;
  return 0.52 + pulse * 0.48;
}

interface DamageTextSizeOptions {
  isCrit: boolean;
  isDot: boolean;
}

export function getReadableDamageTextSize(baseSize: number, options: DamageTextSizeOptions): number {
  const safeSize = Number.isFinite(baseSize) ? Math.max(1, baseSize) : 14;
  if (options.isDot) return Math.min(safeSize, 11);
  return Math.max(safeSize, options.isCrit ? 20 : 18);
}
