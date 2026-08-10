export const MOBILE_CONTROL_STORAGE_KEY = 'aetheria_pref_mobile_control_layout_v1';

export const MOBILE_CONTROL_IDS = [
  'joystick',
  'attack',
  'skill',
  'parry',
  'dash',
  'ultimate',
  'specialUltimate',
] as const;

export type MobileControlId = typeof MOBILE_CONTROL_IDS[number];

export interface MobileControlPlacement {
  x: number;
  y: number;
}

export type MobileControlLayout = Record<MobileControlId, MobileControlPlacement>;

export interface MobileSafeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MobileControlMetrics {
  width: number;
  height: number;
  safeInsets: MobileSafeInsets;
}

export interface MobileControlPixelRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const MOBILE_CONTROL_SIZES: Record<MobileControlId, { width: number; height: number }> = {
  joystick: { width: 120, height: 120 },
  attack: { width: 72, height: 72 },
  skill: { width: 44, height: 44 },
  parry: { width: 44, height: 44 },
  dash: { width: 44, height: 44 },
  ultimate: { width: 44, height: 44 },
  specialUltimate: { width: 240, height: 64 },
};

export const DEFAULT_MOBILE_CONTROL_LAYOUT: MobileControlLayout = {
  joystick: { x: 0.109, y: 0.764 },
  attack: { x: 0.858, y: 0.692 },
  skill: { x: 0.858, y: 0.533 },
  parry: { x: 0.784, y: 0.692 },
  dash: { x: 0.858, y: 0.851 },
  ultimate: { x: 0.931, y: 0.692 },
  specialUltimate: { x: 0.5, y: 0.885 },
};

const cloneDefaultLayout = (): MobileControlLayout => Object.fromEntries(
  MOBILE_CONTROL_IDS.map(id => [id, { ...DEFAULT_MOBILE_CONTROL_LAYOUT[id] }]),
) as MobileControlLayout;

const isPlacement = (value: unknown): value is MobileControlPlacement => {
  if (!value || typeof value !== 'object') return false;
  const placement = value as Partial<MobileControlPlacement>;
  return Number.isFinite(placement.x)
    && Number.isFinite(placement.y)
    && placement.x! >= 0
    && placement.x! <= 1
    && placement.y! >= 0
    && placement.y! <= 1;
};

export function parseMobileControlLayout(serialized: string | null): MobileControlLayout {
  if (!serialized) return cloneDefaultLayout();

  try {
    const parsed = JSON.parse(serialized) as Partial<Record<MobileControlId, unknown>>;
    const layout = cloneDefaultLayout();
    for (const id of MOBILE_CONTROL_IDS) {
      if (isPlacement(parsed[id])) layout[id] = { ...parsed[id] };
    }
    return layout;
  } catch {
    return cloneDefaultLayout();
  }
}

export function loadMobileControlLayout(storage: StorageLike): MobileControlLayout {
  try {
    return parseMobileControlLayout(storage.getItem(MOBILE_CONTROL_STORAGE_KEY));
  } catch {
    return cloneDefaultLayout();
  }
}

export function persistMobileControlLayout(storage: StorageLike, layout: MobileControlLayout): void {
  try {
    storage.setItem(MOBILE_CONTROL_STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Local preferences should never prevent the game from opening.
  }
}

export function toMobileControlPixelRect(
  id: MobileControlId,
  placement: MobileControlPlacement,
  metrics: MobileControlMetrics,
): MobileControlPixelRect {
  const size = MOBILE_CONTROL_SIZES[id];
  const left = (placement.x * metrics.width) - (size.width / 2);
  const top = (placement.y * metrics.height) - (size.height / 2);
  return {
    left,
    top,
    right: left + size.width,
    bottom: top + size.height,
    width: size.width,
    height: size.height,
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function clampMobileControlLayout(
  layout: MobileControlLayout,
  metrics: MobileControlMetrics,
): MobileControlLayout {
  const safeWidth = Math.max(1, metrics.width);
  const safeHeight = Math.max(1, metrics.height);

  return Object.fromEntries(MOBILE_CONTROL_IDS.map(id => {
    const size = MOBILE_CONTROL_SIZES[id];
    const minX = (metrics.safeInsets.left + (size.width / 2)) / safeWidth;
    const maxX = (safeWidth - metrics.safeInsets.right - (size.width / 2)) / safeWidth;
    const minY = (metrics.safeInsets.top + (size.height / 2)) / safeHeight;
    const maxY = (safeHeight - metrics.safeInsets.bottom - (size.height / 2)) / safeHeight;
    return [id, {
      x: clamp(layout[id].x, Math.min(minX, maxX), Math.max(minX, maxX)),
      y: clamp(layout[id].y, Math.min(minY, maxY), Math.max(minY, maxY)),
    }];
  })) as MobileControlLayout;
}

const overlapRatio = (a: MobileControlPixelRect, b: MobileControlPixelRect): number => {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const smallerArea = Math.min(a.width * a.height, b.width * b.height);
  return smallerArea > 0 ? (width * height) / smallerArea : 0;
};

export function getMobileControlLayoutErrors(
  layout: MobileControlLayout,
  metrics: MobileControlMetrics,
): string[] {
  const errors = new Set<string>();
  const rects = Object.fromEntries(MOBILE_CONTROL_IDS.map(id => [
    id,
    toMobileControlPixelRect(id, layout[id], metrics),
  ])) as Record<MobileControlId, MobileControlPixelRect>;

  for (const id of MOBILE_CONTROL_IDS) {
    const rect = rects[id];
    if (
      rect.left < metrics.safeInsets.left
      || rect.top < metrics.safeInsets.top
      || rect.right > metrics.width - metrics.safeInsets.right
      || rect.bottom > metrics.height - metrics.safeInsets.bottom
    ) {
      errors.add('outside-safe-area');
    }
  }

  const actions = MOBILE_CONTROL_IDS.filter(id => id !== 'joystick');
  for (const id of actions) {
    if (overlapRatio(rects.joystick, rects[id]) > 0.2) errors.add('joystick-overlap');
  }

  for (let i = 0; i < actions.length; i += 1) {
    for (let j = i + 1; j < actions.length; j += 1) {
      if (overlapRatio(rects[actions[i]], rects[actions[j]]) > 0.35) errors.add('action-overlap');
    }
  }

  return [...errors];
}
