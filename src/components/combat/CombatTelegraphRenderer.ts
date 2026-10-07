import type { TelegraphCounterCue } from './combatTelegraphs';

export interface CombatTelegraphGeometry {
  x: number;
  y: number;
  radius: number;
  innerRadius?: number;
  color?: string;
  cueOffsetY?: number;
}

export interface TelegraphViewport {
  left: number;
  top: number;
  right: number;
  bottom: number;
  zoom: number;
}

const TAU = Math.PI * 2;
const NO_DASH: number[] = [];

const traceBorder = (ctx: CanvasRenderingContext2D, shape: CombatTelegraphGeometry, progress: number) => {
  ctx.beginPath();
  const end = -Math.PI / 2 + TAU * progress;
  ctx.arc(0, 0, shape.radius, -Math.PI / 2, end);
  if (shape.innerRadius !== undefined && shape.innerRadius > 0) {
    ctx.moveTo(0, -shape.innerRadius);
    ctx.arc(0, 0, shape.innerRadius, -Math.PI / 2, end);
  }
};

const drawCounterSymbol = (ctx: CanvasRenderingContext2D, cue: TelegraphCounterCue, mobile: boolean) => {
  ctx.beginPath();
  ctx.arc(0, 0, mobile ? 15 : 13, 0, TAU);
  ctx.fillStyle = '#071014';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  if (cue === 'parry') {
    ctx.strokeStyle = '#67e8f9';
    ctx.moveTo(-7, -7);
    ctx.lineTo(0, -10);
    ctx.lineTo(7, -7);
    ctx.lineTo(6, 2);
    ctx.lineTo(0, 8);
    ctx.lineTo(-6, 2);
    ctx.closePath();
  } else {
    ctx.strokeStyle = '#bef264';
    ctx.moveTo(-8, -7);
    ctx.lineTo(-1, 0);
    ctx.lineTo(-8, 7);
    ctx.moveTo(1, -7);
    ctx.lineTo(8, 0);
    ctx.lineTo(1, 7);
  }
  ctx.stroke();
};

export const drawCombatTelegraph = (
  ctx: CanvasRenderingContext2D,
  shape: CombatTelegraphGeometry,
  progress: number,
  cue: TelegraphCounterCue | null,
  view: TelegraphViewport,
  mobile: boolean,
): void => {
  if (!Number.isFinite(shape.x) || !Number.isFinite(shape.y) || !(shape.radius > 0)
    || !Number.isFinite(shape.radius) || !Number.isFinite(progress)) return;
  const zoom = view.zoom > 0 ? view.zoom : 1;
  const margin = 4 / zoom;
  const left = shape.x - shape.radius;
  const right = shape.x + shape.radius;
  const top = shape.y - shape.radius;
  const bottom = shape.y + shape.radius;
  if (right < view.left - margin || left > view.right + margin
    || bottom < view.top - margin || top > view.bottom + margin) return;
  const pct = Math.max(0, Math.min(1, progress));

  ctx.save();
  ctx.translate(shape.x, shape.y);
  ctx.shadowBlur = 0;
  ctx.setLineDash(NO_DASH);
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  ctx.fillStyle = shape.color ?? '#ef4444';
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(0, 0, shape.radius, 0, TAU);
  if (shape.innerRadius !== undefined && shape.innerRadius > 0) {
    ctx.moveTo(shape.innerRadius, 0);
    ctx.arc(0, 0, shape.innerRadius, 0, TAU, true);
    ctx.fill('evenodd');
  } else {
    ctx.fill();
  }
  traceBorder(ctx, shape, 1);
  ctx.globalAlpha = 0.65;
  ctx.strokeStyle = shape.color ?? '#ef4444';
  ctx.lineWidth = 2 / zoom;
  ctx.stroke();
  if (pct > 0) {
    traceBorder(ctx, shape, pct);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#071014';
    ctx.lineWidth = (mobile ? 7 : 6) / zoom;
    ctx.stroke();
    ctx.strokeStyle = '#fff3b0';
    ctx.lineWidth = (mobile ? 3.5 : 3) / zoom;
    ctx.stroke();
  }

  // Keep symbols in screen pixels and hide, rather than pin, offscreen cues.
  const offsetY = shape.cueOffsetY ?? (shape.innerRadius !== undefined
    ? -(shape.radius + shape.innerRadius) / 2 : 0);
  const cueY = shape.y + offsetY;
  const badgeRadius = (mobile ? 15 : 13) / zoom;
  if (cue && pct < 1 && shape.x - badgeRadius >= view.left
    && shape.x + badgeRadius <= view.right && cueY - badgeRadius >= view.top
    && cueY + badgeRadius <= view.bottom) {
    ctx.translate(0, offsetY);
    ctx.scale(1 / zoom, 1 / zoom);
    ctx.globalAlpha = 1;
    drawCounterSymbol(ctx, cue, mobile);
  }
  ctx.restore();
};
