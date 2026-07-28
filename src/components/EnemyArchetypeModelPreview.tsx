import React from 'react';
import { drawEnemyArchetypeEnemy } from './combat/enemyArchetypeVfx';
import type {
  EnemyArchetypeDefinition,
  EnemyArchetypeRuntimeState
} from '../utils/enemyArchetypes';

interface EnemyArchetypePreviewState {
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'Elite';
  archetypeId: EnemyArchetypeDefinition['id'];
  archetypeState: EnemyArchetypeRuntimeState;
  facingX: number;
  facingY: number;
}

interface EnemyArchetypePreviewFrame {
  x: number;
  y: number;
  facingX: number;
  facingY: number;
}

interface EnemyArchetypeModelPreviewProps {
  archetype: EnemyArchetypeDefinition;
}

export const createEnemyArchetypePreviewState = (
  archetype: EnemyArchetypeDefinition
): EnemyArchetypePreviewState => {
  const archetypeState: EnemyArchetypeRuntimeState = {
    abilityCooldownFrames: 0
  };

  if (archetype.id === 'bulwark') {
    archetypeState.shieldHp = 100;
    archetypeState.maxShieldHp = 100;
  } else if (archetype.id === 'siphon') {
    archetypeState.beamFrames = 300;
    archetypeState.stolenEnergy = 5;
  } else if (archetype.id === 'stalker') {
    archetypeState.vanishFrames = 0;
    archetypeState.strikeFrames = 0;
  } else if (archetype.id === 'relic-carrier') {
    archetypeState.escaped = false;
  }

  return {
    x: 0,
    y: 0,
    radius: 28,
    color: archetype.color,
    type: 'Elite',
    archetypeId: archetype.id,
    archetypeState,
    facingX: 1,
    facingY: 0
  };
};

export const getEnemyArchetypePreviewFrame = (
  timeMs: number,
  width: number,
  height: number,
  prefersReducedMotion: boolean
): EnemyArchetypePreviewFrame => {
  if (prefersReducedMotion) {
    return {
      x: width / 2,
      y: height / 2,
      facingX: 1,
      facingY: 0
    };
  }

  const phase = timeMs / 1000;
  return {
    x: width / 2 + Math.sin(phase * 0.72) * Math.min(9, width * 0.035),
    y: height / 2 + Math.sin(phase * 1.7) * 4,
    facingX: Math.cos(phase * 0.58),
    facingY: Math.sin(phase * 0.58) * 0.3
  };
};

const drawPreviewStage = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string
) => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#070b13';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(71,85,105,0.22)';
  ctx.lineWidth = 1;
  const gridSize = 24;
  for (let x = gridSize; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = gridSize; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.fillStyle = `${accentColor}12`;
  ctx.beginPath();
  ctx.ellipse(width / 2, height / 2 + 37, 52, 11, 0, 0, Math.PI * 2);
  ctx.fill();
};

export default function EnemyArchetypeModelPreview({
  archetype
}: EnemyArchetypeModelPreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const previewState = React.useMemo(
    () => createEnemyArchetypePreviewState(archetype),
    [archetype]
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let isVisible = true;
    let width = 1;
    let height = 1;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const drawFrame = (timeMs: number) => {
      drawPreviewStage(context, width, height, archetype.color);
      const frame = getEnemyArchetypePreviewFrame(
        timeMs,
        width,
        height,
        reducedMotionQuery.matches
      );
      drawEnemyArchetypeEnemy(
        context,
        {
          ...previewState,
          ...frame,
          radius: Math.min(30, Math.max(23, width * 0.115))
        },
        timeMs,
        width < 360
      );
    };

    const animate = (timeMs: number) => {
      drawFrame(timeMs);
      if (isVisible && !reducedMotionQuery.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const startAnimation = () => {
      window.cancelAnimationFrame(animationFrame);
      drawFrame(performance.now());
      if (isVisible && !reducedMotionQuery.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      startAnimation();
    });
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startAnimation();
        else window.cancelAnimationFrame(animationFrame);
      },
      { rootMargin: '80px' }
    );
    visibilityObserver.observe(canvas);

    reducedMotionQuery.addEventListener('change', startAnimation);
    startAnimation();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotionQuery.removeEventListener('change', startAnimation);
    };
  }, [archetype.color, previewState]);

  return (
    <div
      className="relative mt-3 aspect-[12/6.5] min-h-[116px] w-full overflow-hidden rounded-md border border-slate-800 bg-[#070b13]"
      style={{ boxShadow: `inset 0 0 28px ${archetype.color}0d` }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label={`${archetype.name} animated enemy model preview`}
        role="img"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70"
        style={{ backgroundColor: archetype.color }}
        aria-hidden="true"
      />
    </div>
  );
}
