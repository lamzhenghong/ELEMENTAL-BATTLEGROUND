import type { ImpactShape } from '../../utils/damageFeedback';

export interface HitImpactEvent {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  shape: ImpactShape;
  color: string;
  strength: number;
  critical?: boolean;
}

export interface FinalHitEvent {
  x: number;
  y: number;
  radius: number;
  color: string;
  isBoss: boolean;
}

interface ImpactPoolEntry extends HitImpactEvent {
  active: boolean;
  ageMs: number;
  lifetimeMs: number;
}

interface FinalHitPoolEntry extends Omit<FinalHitEvent, 'isBoss'> {
  active: boolean;
  ageMs: number;
  lifetimeMs: number;
}

const EMPTY_IMPACT: ImpactPoolEntry = {
  active: false,
  ageMs: 0,
  lifetimeMs: 180,
  x: 0,
  y: 0,
  directionX: 1,
  directionY: 0,
  shape: 'slash',
  color: '#ffffff',
  strength: 1,
  critical: false,
};

const EMPTY_FINAL_HIT: FinalHitPoolEntry = {
  active: false,
  ageMs: 0,
  lifetimeMs: 80,
  x: 0,
  y: 0,
  radius: 20,
  color: '#ffffff',
};

const isVisible = (
  x: number,
  y: number,
  cameraX: number,
  cameraY: number,
  width: number,
  height: number,
  zoom = 1,
  margin = 80,
): boolean => x >= cameraX - margin / zoom
  && x <= cameraX + width / zoom + margin / zoom
  && y >= cameraY - margin / zoom
  && y <= cameraY + height / zoom + margin / zoom;

const drawImpact = (ctx: CanvasRenderingContext2D, impact: ImpactPoolEntry, x: number, y: number): void => {
  const progress = Math.min(1, impact.ageMs / impact.lifetimeMs);
  const alpha = 1 - progress;
  const strength = Math.max(0.75, Math.min(1.45, impact.strength));
  const angle = Math.atan2(impact.directionY, impact.directionX);
  const size = (impact.critical ? 30 : 23) * strength * (0.82 + progress * 0.35);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = impact.color;
  ctx.fillStyle = impact.color;
  ctx.lineCap = 'round';
  ctx.lineWidth = impact.critical ? 3 : 2;
  ctx.shadowColor = impact.color;
  ctx.shadowBlur = impact.critical ? 10 : 5;

  if (impact.shape === 'slash') {
    ctx.beginPath();
    ctx.arc(0, 0, size, -0.85, 0.85);
    ctx.stroke();
  } else if (impact.shape === 'radial') {
    for (let i = 0; i < 6; i += 1) {
      const spoke = (Math.PI * 2 * i) / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(spoke) * size * 0.24, Math.sin(spoke) * size * 0.24);
      ctx.lineTo(Math.cos(spoke) * size, Math.sin(spoke) * size);
      ctx.stroke();
    }
  } else if (impact.shape === 'pierce') {
    ctx.beginPath();
    ctx.moveTo(-size * 0.85, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.45, -size * 0.18);
    ctx.lineTo(size, 0);
    ctx.lineTo(size * 0.45, size * 0.18);
    ctx.stroke();
  } else if (impact.shape === 'projectile') {
    ctx.beginPath();
    ctx.ellipse(size * 0.25, 0, size * 0.58, size * 0.25, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(-size * 0.18, 0);
    ctx.stroke();
  } else if (impact.shape === 'magic') {
    for (let i = 0; i < 4; i += 1) {
      const spark = (Math.PI * 2 * i) / 4 + progress * 0.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(spark) * size * 0.25, Math.sin(spark) * size * 0.25);
      ctx.lineTo(Math.cos(spark) * size, Math.sin(spark) * size);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, size * (0.65 + progress * 0.6), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
};

export class DamageFeedbackManager {
  private readonly impacts: ImpactPoolEntry[];
  private readonly finalHits: FinalHitPoolEntry[];

  constructor(public readonly capacity: number) {
    const safeCapacity = Math.max(1, Math.floor(capacity));
    this.impacts = Array.from({ length: safeCapacity }, () => ({ ...EMPTY_IMPACT }));
    this.finalHits = Array.from({ length: Math.max(2, Math.ceil(safeCapacity / 4)) }, () => ({ ...EMPTY_FINAL_HIT }));
  }

  get activeCount(): number {
    return this.impacts.reduce((count, entry) => count + Number(entry.active), 0);
  }

  get activeFinalHitCount(): number {
    return this.finalHits.reduce((count, entry) => count + Number(entry.active), 0);
  }

  spawnImpact(event: HitImpactEvent): void {
    const target = this.impacts.find(entry => !entry.active)
      ?? this.impacts.reduce((oldest, entry) => entry.ageMs > oldest.ageMs ? entry : oldest);
    Object.assign(target, event, {
      active: true,
      ageMs: 0,
      lifetimeMs: event.shape === 'aoe-ring' ? 260 : 180,
      strength: Math.max(0.75, Math.min(1.45, event.strength)),
    });
  }

  spawnFinalHit(event: FinalHitEvent): boolean {
    if (event.isBoss) return false;
    const target = this.finalHits.find(entry => !entry.active)
      ?? this.finalHits.reduce((oldest, entry) => entry.ageMs > oldest.ageMs ? entry : oldest);
    Object.assign(target, event, { active: true, ageMs: 0, lifetimeMs: 80 });
    return true;
  }

  updateAndDraw(
    ctx: CanvasRenderingContext2D,
    deltaMs: number,
    cameraX: number,
    cameraY: number,
    width: number,
    height: number,
    zoom = 1,
  ): void {
    for (const impact of this.impacts) {
      if (!impact.active) continue;
      impact.ageMs += deltaMs;
      if (impact.ageMs >= impact.lifetimeMs) {
        impact.active = false;
        continue;
      }
      if (isVisible(impact.x, impact.y, cameraX, cameraY, width, height, zoom)) {
        drawImpact(ctx, impact, (impact.x - cameraX) * zoom, (impact.y - cameraY) * zoom);
      }
    }

    for (const flash of this.finalHits) {
      if (!flash.active) continue;
      flash.ageMs += deltaMs;
      if (flash.ageMs >= flash.lifetimeMs) {
        flash.active = false;
        continue;
      }
      if (!isVisible(flash.x, flash.y, cameraX, cameraY, width, height, zoom)) continue;
      const alpha = 1 - flash.ageMs / flash.lifetimeMs;
      ctx.save();
      ctx.globalAlpha = alpha * 0.82;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = flash.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(
        (flash.x - cameraX) * zoom,
        (flash.y - cameraY) * zoom,
        flash.radius * zoom * (1 + (1 - alpha) * 0.15),
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
  }

  clear(): void {
    this.impacts.forEach(entry => { entry.active = false; entry.ageMs = 0; });
    this.finalHits.forEach(entry => { entry.active = false; entry.ageMs = 0; });
  }
}
