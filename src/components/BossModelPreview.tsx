import React from 'react';
import { drawBossModel, type BossModelEnemy } from './combat/bossModelRenderer';
import type { BossIdentity } from '../utils/bossIdentities';

interface BossModelPreviewProps {
  identity: BossIdentity;
}

export const createBossPreviewEnemy = (identity: BossIdentity): BossModelEnemy => ({
  x: 0,
  y: 0,
  radius: 48,
  name: identity.name,
  bossType: identity.mechanicProfile,
  bossIdentityId: identity.id
});

export const getBossPreviewPosition = (
  timeMs: number,
  width: number,
  height: number,
  prefersReducedMotion: boolean
) => {
  if (prefersReducedMotion) return { x: width / 2, y: height / 2 };
  const phase = timeMs / 1000;
  return {
    x: width / 2 + Math.sin(phase * 0.54) * Math.min(5, width * 0.018),
    y: height / 2 + Math.sin(phase * 0.92) * 2
  };
};

const drawPreviewStage = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
) => {
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#070b13';
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'rgba(71,85,105,0.2)';
  context.lineWidth = 1;
  const gridSize = 24;
  for (let x = gridSize; x < width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = gridSize; y < height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.save();
  context.globalAlpha = 0.12;
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(width / 2, height / 2 + 42, 64, 13, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
};

export default function BossModelPreview({ identity }: BossModelPreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const previewEnemy = React.useMemo(() => createBossPreviewEnemy(identity), [identity]);

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
      drawPreviewStage(context, width, height, identity.color);
      const position = getBossPreviewPosition(
        timeMs,
        width,
        height,
        reducedMotionQuery.matches
      );
      drawBossModel(
        context,
        {
          ...previewEnemy,
          ...position,
          radius: Math.min(48, Math.max(37, width * 0.17))
        },
        timeMs,
        width < 360,
        reducedMotionQuery.matches
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
  }, [identity.color, previewEnemy]);

  return (
    <div
      className="relative mt-3 aspect-[12/6.5] min-h-[128px] w-full overflow-hidden rounded-md border border-slate-800 bg-[#070b13]"
      style={{ boxShadow: `inset 0 0 30px color-mix(in srgb, ${identity.color}, transparent 90%)` }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label={`${identity.name} animated boss model preview`}
        role="img"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70"
        style={{ backgroundColor: identity.color }}
        aria-hidden="true"
      />
    </div>
  );
}
