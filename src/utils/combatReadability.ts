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

interface DamageSkinTextPresentation {
  className: string;
  minimumSize: number;
}

export function getReadableDamageTextSize(baseSize: number, options: DamageTextSizeOptions): number {
  const safeSize = Number.isFinite(baseSize) ? Math.max(1, baseSize) : 14;
  if (options.isDot) return Math.min(safeSize, 11);
  return Math.max(safeSize, options.isCrit ? 20 : 18);
}

export function getDamageSkinTextPresentation(
  skin: string | undefined,
  isCrit: boolean,
  isDot: boolean,
): DamageSkinTextPresentation {
  if (isDot) return { className: '', minimumSize: 0 };

  if (skin === 'Ice') {
    return {
      className: 'damage-skin-text damage-skin-text--ice',
      minimumSize: isCrit ? 23 : 20,
    };
  }

  if (skin === 'Celestial') {
    return {
      className: 'damage-skin-text damage-skin-text--celestial',
      minimumSize: isCrit ? 24 : 21,
    };
  }

  return {
    className: skin === 'Void' ? 'pulse-void-text' : '',
    minimumSize: 0,
  };
}
