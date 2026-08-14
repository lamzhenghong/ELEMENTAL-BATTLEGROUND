import type { SpecialUltimateEffectState } from '../../utils/specialUltimateEffects';

interface FollowupVfxTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
}

export const drawSpecialUltimateFollowupVfx = (
  ctx: CanvasRenderingContext2D,
  state: SpecialUltimateEffectState,
  targets: readonly FollowupVfxTarget[],
  now: number,
  reducedEffects: boolean,
) => {
  const targetsById = new Map(targets.filter(target => target.hp > 0).map(target => [String(target.id), target]));
  const pulse = 0.72 + Math.sin(now / 180) * 0.18;

  if (state.livingStorm) {
    const linkedTargets = state.livingStorm.linkedTargetIds
      .map(targetId => targetsById.get(targetId))
      .filter((target): target is FollowupVfxTarget => Boolean(target));

    if (linkedTargets.length > 1) {
      ctx.save();
      ctx.globalAlpha = reducedEffects ? 0.42 : 0.58;
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = reducedEffects ? 1.5 : 2;
      ctx.setLineDash([8, 7]);
      ctx.lineDashOffset = -(now / 35) % 30;
      for (let index = 1; index < linkedTargets.length; index += 1) {
        const previous = linkedTargets[index - 1];
        const current = linkedTargets[index];
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    linkedTargets.forEach((target, index) => {
      ctx.save();
      ctx.globalAlpha = 0.58 + pulse * 0.2;
      ctx.strokeStyle = index % 2 === 0 ? '#a855f7' : '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius + 8 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  if (state.boilingPoint) {
    Object.values(state.boilingPoint.targets).forEach(effectTarget => {
      const target = targetsById.get(effectTarget.id);
      if (!target) return;

      ctx.save();
      ctx.globalAlpha = 0.58 + pulse * 0.18;
      ctx.strokeStyle = effectTarget.vulnerabilityRemaining > 0 ? '#facc15' : '#67e8f9';
      ctx.lineWidth = effectTarget.vulnerabilityRemaining > 0 ? 3 : 2;
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius + 8 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();

      const pipRadius = Math.max(2, Math.min(3.5, target.radius * 0.12));
      for (let stack = 0; stack < 5; stack += 1) {
        const angle = -Math.PI * 0.9 + (Math.PI * 0.45 * stack);
        const distance = target.radius + 15;
        ctx.beginPath();
        ctx.arc(
          target.x + Math.cos(angle) * distance,
          target.y + Math.sin(angle) * distance,
          pipRadius,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = stack < effectTarget.stacks ? '#fb923c' : 'rgba(148, 163, 184, 0.28)';
        ctx.fill();
      }
      ctx.restore();
    });
  }
};
