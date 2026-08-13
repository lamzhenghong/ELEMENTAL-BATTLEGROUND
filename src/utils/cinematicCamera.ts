export interface Point2D {
  x: number;
  y: number;
}

export interface CameraUpdateInput {
  playerX: number;
  playerY: number;
  viewportWidth: number;
  viewportHeight: number;
  worldWidth: number;
  worldHeight: number;
  motionIntensity: number;
}

export interface CameraFrame {
  zoom: number;
  centerX: number;
  centerY: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  viewportWidth: number;
  viewportHeight: number;
}

type CameraCue =
  | {
      kind: 'dash' | 'parry' | 'heavy-impact' | 'ultimate-recovery';
      elapsedMs: number;
      holdMs: number;
      recoveryMs: number;
      zoom: number;
      offsetX: number;
      offsetY: number;
      focusX?: number;
      focusY?: number;
      focusWeight?: number;
    }
  | {
      kind: 'boss-intro';
      elapsedMs: number;
      holdMs: number;
      recoveryMs: number;
      focusX: number;
      focusY: number;
      radius: number;
    };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const WIDE_BOSS_VISUALS = new Set([
  'calamity-dragon',
  'frostfire-wyrm',
  'skyward-avian',
  'tempest-bird',
  'world-drake',
  'world-bird',
]);

const LARGE_BOSS_VISUALS = new Set([
  'frost-golem',
  'molten-overlord',
  'void-overlord',
  'world-golem',
]);

export const getBossFramingRadius = (radius: number, visualKind?: string): number => {
  const shapeScale = visualKind && WIDE_BOSS_VISUALS.has(visualKind)
    ? 1.35
    : visualKind && LARGE_BOSS_VISUALS.has(visualKind)
      ? 1.16
      : 1;
  return Math.max(1, radius) * shapeScale;
};

const normalizedDirection = (x: number, y: number): Point2D => {
  const length = Math.hypot(x, y);
  return length > 0.001 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
};

const getCueStrength = (cue: CameraCue | null): number => {
  if (!cue) return 0;
  if (cue.elapsedMs <= cue.holdMs) return 1;
  return clamp(1 - (cue.elapsedMs - cue.holdMs) / cue.recoveryMs, 0, 1);
};

export const createNeutralCameraFrame = (input: CameraUpdateInput): CameraFrame =>
  createCameraFrame(input, 1, input.playerX, input.playerY);

const createCameraFrame = (
  input: CameraUpdateInput,
  zoom: number,
  desiredCenterX: number,
  desiredCenterY: number,
): CameraFrame => {
  const safeZoom = clamp(zoom, 0.75, 1.15);
  const halfVisibleWidth = input.viewportWidth / (2 * safeZoom);
  const halfVisibleHeight = input.viewportHeight / (2 * safeZoom);

  const centerX = input.worldWidth <= halfVisibleWidth * 2
    ? input.worldWidth / 2
    : clamp(desiredCenterX, halfVisibleWidth, input.worldWidth - halfVisibleWidth);
  const centerY = input.worldHeight <= halfVisibleHeight * 2
    ? input.worldHeight / 2
    : clamp(desiredCenterY, halfVisibleHeight, input.worldHeight - halfVisibleHeight);

  return {
    zoom: safeZoom,
    centerX,
    centerY,
    left: centerX - halfVisibleWidth,
    top: centerY - halfVisibleHeight,
    right: centerX + halfVisibleWidth,
    bottom: centerY + halfVisibleHeight,
    viewportWidth: input.viewportWidth,
    viewportHeight: input.viewportHeight,
  };
};

export const worldToScreen = (point: Point2D, frame: CameraFrame): Point2D => ({
  x: (point.x - frame.centerX) * frame.zoom + frame.viewportWidth / 2,
  y: (point.y - frame.centerY) * frame.zoom + frame.viewportHeight / 2,
});

export const screenToWorld = (point: Point2D, frame: CameraFrame): Point2D => ({
  x: (point.x - frame.viewportWidth / 2) / frame.zoom + frame.centerX,
  y: (point.y - frame.viewportHeight / 2) / frame.zoom + frame.centerY,
});

export class CinematicCameraDirector {
  private cue: CameraCue | null = null;
  private currentZoom = 1;
  private currentOffsetX = 0;
  private currentOffsetY = 0;
  private currentFocusWeight = 0;

  triggerDash(directionX: number, directionY: number): void {
    const direction = normalizedDirection(directionX, directionY);
    this.cue = {
      kind: 'dash',
      elapsedMs: 0,
      holdMs: 120,
      recoveryMs: 280,
      zoom: 0.965,
      offsetX: direction.x * 12,
      offsetY: direction.y * 12,
    };
  }

  triggerParry(focusX: number, focusY: number): void {
    this.cue = {
      kind: 'parry',
      elapsedMs: 0,
      holdMs: 130,
      recoveryMs: 340,
      zoom: 1.035,
      offsetX: 0,
      offsetY: 0,
      focusX,
      focusY,
      focusWeight: 0.4,
    };
  }

  triggerHeavyImpact(directionX: number, directionY: number, strength = 1): void {
    if (this.cue?.kind === 'heavy-impact' && this.cue.elapsedMs < 120) return;
    const direction = normalizedDirection(directionX, directionY);
    const recoil = clamp(strength, 0.65, 1.5) * 10;
    this.cue = {
      kind: 'heavy-impact',
      elapsedMs: 0,
      holdMs: 70,
      recoveryMs: 210,
      zoom: 1.012,
      offsetX: -direction.x * recoil,
      offsetY: -direction.y * recoil,
    };
  }

  triggerBossIntro(focusX: number, focusY: number, radius: number): void {
    this.cue = {
      kind: 'boss-intro',
      elapsedMs: 0,
      holdMs: 650,
      recoveryMs: 650,
      focusX,
      focusY,
      radius: Math.max(1, radius),
    };
  }

  triggerUltimateRecovery(focusX: number, focusY: number): void {
    this.cue = {
      kind: 'ultimate-recovery',
      elapsedMs: 0,
      holdMs: 80,
      recoveryMs: 700,
      zoom: 1.02,
      offsetX: 0,
      offsetY: 0,
      focusX,
      focusY,
      focusWeight: 0.16,
    };
  }

  reset(): void {
    this.cue = null;
    this.currentZoom = 1;
    this.currentOffsetX = 0;
    this.currentOffsetY = 0;
    this.currentFocusWeight = 0;
  }

  update(deltaMs: number, input: CameraUpdateInput): CameraFrame {
    const intensity = clamp(input.motionIntensity / 100, 0, 1);
    if (intensity === 0) {
      this.reset();
      return createNeutralCameraFrame(input);
    }

    const safeDelta = clamp(deltaMs, 0, 100);
    if (this.cue) this.cue.elapsedMs += safeDelta;
    const cueStrength = getCueStrength(this.cue);
    const targets = this.resolveTargets(input, cueStrength, intensity);
    const responseMs = this.cue?.kind === 'boss-intro' ? 75 : 48;
    const smoothing = 1 - Math.exp(-safeDelta / responseMs);

    this.currentZoom += (targets.zoom - this.currentZoom) * smoothing;
    this.currentOffsetX += (targets.offsetX - this.currentOffsetX) * smoothing;
    this.currentOffsetY += (targets.offsetY - this.currentOffsetY) * smoothing;
    this.currentFocusWeight += (targets.focusWeight - this.currentFocusWeight) * smoothing;

    if (this.cue && cueStrength <= 0) this.cue = null;
    if (!this.cue && Math.abs(this.currentZoom - 1) < 0.0001) this.currentZoom = 1;
    if (!this.cue && Math.abs(this.currentOffsetX) < 0.01) this.currentOffsetX = 0;
    if (!this.cue && Math.abs(this.currentOffsetY) < 0.01) this.currentOffsetY = 0;
    if (!this.cue && this.currentFocusWeight < 0.0001) this.currentFocusWeight = 0;

    const focusX = targets.focusX ?? input.playerX;
    const focusY = targets.focusY ?? input.playerY;
    const centerX = input.playerX
      + (focusX - input.playerX) * this.currentFocusWeight
      + this.currentOffsetX;
    const centerY = input.playerY
      + (focusY - input.playerY) * this.currentFocusWeight
      + this.currentOffsetY;

    return createCameraFrame(input, this.currentZoom, centerX, centerY);
  }

  peek(input: CameraUpdateInput): CameraFrame {
    const intensity = clamp(input.motionIntensity / 100, 0, 1);
    if (intensity === 0) return createNeutralCameraFrame(input);
    const targets = this.resolveTargets(input, getCueStrength(this.cue), intensity);
    const focusX = targets.focusX ?? input.playerX;
    const focusY = targets.focusY ?? input.playerY;
    return createCameraFrame(
      input,
      this.currentZoom,
      input.playerX + (focusX - input.playerX) * this.currentFocusWeight + this.currentOffsetX,
      input.playerY + (focusY - input.playerY) * this.currentFocusWeight + this.currentOffsetY,
    );
  }

  private resolveTargets(input: CameraUpdateInput, cueStrength: number, intensity: number) {
    if (!this.cue || cueStrength <= 0) {
      return {
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        focusWeight: 0,
        focusX: input.playerX,
        focusY: input.playerY,
      };
    }

    if (this.cue.kind === 'boss-intro') {
      const framingScale = Math.min(input.viewportWidth, input.viewportHeight) / (this.cue.radius * 8);
      const bossZoom = clamp(framingScale, 0.86, 0.98);
      return {
        zoom: 1 + (bossZoom - 1) * cueStrength * intensity,
        offsetX: 0,
        offsetY: 0,
        focusWeight: cueStrength * intensity,
        focusX: this.cue.focusX,
        focusY: this.cue.focusY,
      };
    }

    return {
      zoom: 1 + (this.cue.zoom - 1) * cueStrength * intensity,
      offsetX: this.cue.offsetX * cueStrength * intensity,
      offsetY: this.cue.offsetY * cueStrength * intensity,
      focusWeight: (this.cue.focusWeight ?? 0) * cueStrength * intensity,
      focusX: this.cue.focusX ?? input.playerX,
      focusY: this.cue.focusY ?? input.playerY,
    };
  }
}
