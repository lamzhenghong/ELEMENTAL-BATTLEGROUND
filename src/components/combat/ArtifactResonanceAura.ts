import type { ArtifactSetProgress } from '../../utils/artifactSetVisuals';
import { ARTIFACT_SET_VISUALS } from '../../utils/artifactSetVisuals';
import type { FeedbackQuality } from '../../utils/damageFeedback';

export const drawArtifactResonanceAura = (
  ctx: CanvasRenderingContext2D,
  progress: readonly ArtifactSetProgress[],
  x: number,
  y: number,
  radius: number,
  timeMs: number,
  quality: FeedbackQuality,
): void => {
  const active = progress.filter(entry => entry.tier >= 2);
  if (active.length === 0 || radius <= 0) return;
  const shown = quality === 'low' ? active.slice(0, 1) : active.slice(0, 2);

  ctx.save();
  shown.forEach((entry, index) => {
    const theme = ARTIFACT_SET_VISUALS[entry.set];
    const intensity = entry.tier === 4 ? 0.48 : 0.27;
    const auraRadius = radius + 7 + index * 5 + Math.sin(timeMs / 420 + index) * 1.5;
    ctx.globalAlpha = quality === 'low' ? intensity * 0.72 : intensity;
    ctx.strokeStyle = theme.color;
    ctx.lineWidth = entry.tier === 4 ? 2 : 1;
    ctx.setLineDash(theme.aura === 'time-ring' ? [5, 5] : []);
    ctx.beginPath();
    ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
    ctx.stroke();

    if (quality !== 'low' && entry.tier === 4) {
      const moteCount = quality === 'high' ? 4 : 2;
      for (let mote = 0; mote < moteCount; mote += 1) {
        const angle = timeMs / 900 + (Math.PI * 2 * mote) / moteCount + index;
        ctx.fillStyle = theme.color;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * auraRadius, y + Math.sin(angle) * auraRadius, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  ctx.restore();
};
