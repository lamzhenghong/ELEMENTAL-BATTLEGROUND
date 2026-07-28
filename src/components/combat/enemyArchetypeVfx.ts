import type { EnemyArchetypeId, EnemyArchetypeRuntimeState } from '../../utils/enemyArchetypes';

interface ArchetypeEnemyVisual {
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'Normal' | 'Elite';
  archetypeId: EnemyArchetypeId;
  archetypeState: EnemyArchetypeRuntimeState;
  facingX?: number;
  facingY?: number;
}

const drawEnemyBody = (
  ctx: CanvasRenderingContext2D,
  enemy: ArchetypeEnemyVisual,
  isMobile: boolean
) => {
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
  ctx.fillStyle = enemy.color;
  ctx.shadowBlur = isMobile ? 6 : 10;
  ctx.shadowColor = enemy.color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = enemy.archetypeId === 'stalker' ? '#64748b' : 'rgba(255,255,255,0.52)';
  ctx.lineWidth = enemy.type === 'Elite' ? 2.5 : 1.5;
  ctx.stroke();
};

const drawHexagon = (ctx: CanvasRenderingContext2D, radius: number) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

export const drawEnemyArchetypeEnemy = (
  ctx: CanvasRenderingContext2D,
  enemy: ArchetypeEnemyVisual,
  timeMs: number,
  isMobile: boolean
) => {
  const phase = timeMs / 1000;
  const pulse = 0.5 + Math.sin(phase * 3) * 0.5;
  const radius = enemy.radius;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  if (enemy.archetypeId === 'summoner') {
    ctx.save();
    ctx.scale(1, 0.34);
    ctx.strokeStyle = `rgba(139,92,246,${0.35 + pulse * 0.16})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, radius * 2.35, radius + 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  if (enemy.archetypeId === 'stalker') {
    ctx.globalAlpha = (enemy.archetypeState.vanishFrames ?? 0) > 0 ? 0.22 : 1;
  }

  drawEnemyBody(ctx, enemy, isMobile);

  switch (enemy.archetypeId) {
    case 'bulwark': {
      const shieldRatio = (enemy.archetypeState.shieldHp ?? 0) / Math.max(1, enemy.archetypeState.maxShieldHp ?? 1);
      if (shieldRatio > 0) {
        ctx.globalAlpha = 0.48 + pulse * 0.2;
        ctx.strokeStyle = '#93c5fd';
        ctx.fillStyle = 'rgba(59,130,246,0.08)';
        ctx.lineWidth = 2;
        drawHexagon(ctx, radius + 14);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case 'channeler': {
      ctx.fillStyle = 'rgba(187,247,208,0.82)';
      ctx.font = `bold ${Math.max(11, radius * 0.55)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 3; i++) {
        const angle = phase * 0.7 + (Math.PI * 2 * i) / 3;
        ctx.fillText('+', Math.cos(angle) * (radius + 12), Math.sin(angle) * (radius + 9));
      }
      break;
    }
    case 'artillery': {
      const facingAngle = Math.atan2(enemy.facingY ?? 0, enemy.facingX ?? 1);
      ctx.save();
      ctx.rotate(facingAngle);
      ctx.fillStyle = '#7c2d12';
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 1.5;
      ctx.fillRect(radius * 0.3, -5, radius + 15, 10);
      ctx.strokeRect(radius * 0.3, -5, radius + 15, 10);
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(radius + 20 + pulse * 2, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'siphon': {
      ctx.strokeStyle = 'rgba(233,213,255,0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.7, -radius * 0.4);
      ctx.lineTo(radius * 0.1, radius * 0.1);
      ctx.lineTo(radius * 0.7, -radius * 0.55);
      ctx.stroke();
      ctx.save();
      ctx.rotate(phase * 0.8);
      ctx.scale(1, 0.42);
      ctx.strokeStyle = 'rgba(216,180,254,0.62)';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f3e8ff';
      ctx.beginPath();
      ctx.arc(radius + 14, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'mimic': {
      const colors = ['#60a5fa', '#a855f7', '#f472b6', '#f59e0b', '#22c55e', '#38bdf8'];
      ctx.lineWidth = 2;
      colors.forEach((color, index) => {
        const start = phase * 0.55 + (Math.PI * 2 * index) / colors.length;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 7, start, start + Math.PI / 3.4);
        ctx.stroke();
      });
      break;
    }
    case 'summoner': {
      ctx.strokeStyle = 'rgba(196,181,253,0.68)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.58, phase, phase + Math.PI * 1.35);
      ctx.stroke();
      break;
    }
    case 'stalker': {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ef4444';
      ctx.shadowBlur = isMobile ? 4 : 7;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.28, -radius * 0.08, radius * 0.13, radius * 0.07, -0.18, 0, Math.PI * 2);
      ctx.ellipse(radius * 0.28, -radius * 0.08, radius * 0.13, radius * 0.07, 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(148,163,184,0.24)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 8 + pulse * 3, Math.PI * 0.25, Math.PI * 1.65);
      ctx.stroke();
      break;
    }
    case 'relic-carrier': {
      const sparkleRadius = radius + 10;
      ctx.fillStyle = '#fef3c7';
      for (let i = 0; i < 3; i++) {
        const angle = phase * 1.1 + (Math.PI * 2 * i) / 3;
        const size = i === 1 ? 3 : 2;
        ctx.fillRect(
          Math.cos(angle) * sparkleRadius - size / 2,
          Math.sin(angle) * sparkleRadius - size / 2,
          size,
          size
        );
      }
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-radius * 0.56, radius * 0.08, 4, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
};
