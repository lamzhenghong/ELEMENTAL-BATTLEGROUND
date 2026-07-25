import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface FloatingDamageTextDOMProps {
  t: {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    size: number;
    isCrit: boolean;
    skin?: string;
  };
  key?: any;
}

export function FloatingDamageTextDOM({ t }: FloatingDamageTextDOMProps) {
  const keyframes = useMemo(() => {
    // Generate random angle (-20 to 20 degrees) and initial speed for the burst
    const angle = (Math.random() * 40 - 20) * (Math.PI / 180);
    const speed = t.isCrit ? (150 + Math.random() * 70) : (100 + Math.random() * 60);
    const dir = Math.random() > 0.5 ? 1 : -1;

    // vx is horizontal, vy is vertical (upward)
    const vx = dir * speed * Math.sin(Math.abs(angle) + 0.18);
    const vy = -speed * Math.cos(angle);
    const gravity = t.isCrit ? 520 : 440;
    const duration = 0.75; // 750ms total lifetime

    const xPath: number[] = [];
    const yPath: number[] = [];
    const opacityPath: number[] = [];
    const scalePath: number[] = [];

    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const r = i / steps;
      const time = r * duration;

      const dx = vx * time;
      const dy = vy * time + 0.5 * gravity * time * time;

      xPath.push(dx);
      yPath.push(dy);

      // Smooth fade-in on mount, rapid fade-out after 70% duration
      if (r < 0.1) {
        opacityPath.push(r / 0.1);
      } else if (r > 0.7) {
        opacityPath.push(Math.max(0, 1 - (r - 0.7) / 0.3));
      } else {
        opacityPath.push(1);
      }

      // Pop scale on spawn, then slightly shrink
      if (r < 0.12) {
        const peakScale = t.isCrit ? 1.65 : 1.15;
        scalePath.push(0.5 + (peakScale - 0.5) * (r / 0.12));
      } else {
        const peakScale = t.isCrit ? 1.65 : 1.15;
        const endScale = t.isCrit ? 1.1 : 0.8;
        scalePath.push(peakScale - (peakScale - endScale) * ((r - 0.12) / 0.88));
      }
    }

    return { x: xPath, y: yPath, opacity: opacityPath, scale: scalePath };
  }, [t.id, t.isCrit]);

  let skinStyle: React.CSSProperties = {
    position: 'absolute',
    color: t.color,
    fontSize: `${t.size}px`,
    fontWeight: '900',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, -50%)',
  };

  let textClass = '';

  switch (t.skin) {
    case 'Ice':
      skinStyle.fontFamily = '"Trebuchet MS", sans-serif';
      skinStyle.textShadow = '1px 1px 0 #38bdf8, -1px -1px 0 #e0f2fe';
      textClass = 'shiver-text';
      break;
    case 'Void':
      skinStyle.fontFamily = '"Lucida Console", monospace';
      skinStyle.textShadow = '1px 1px 0 #1e1b4b, -1px -1px 0 #d946ef';
      textClass = 'pulse-void-text';
      break;
    case 'Celestial':
      skinStyle.fontFamily = '"Georgia", serif';
      skinStyle.textShadow = '1px 1px 0 #fde047, -1px -1px 0 #ffffff';
      break;
    default:
      skinStyle.fontFamily = '"Space Grotesk", sans-serif';
      skinStyle.textShadow = '1px 1px 0 rgba(0,0,0,0.85)';
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${t.x}px`,
        top: `${t.y}px`,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <motion.div
        animate={{
          x: keyframes.x,
          y: keyframes.y,
          opacity: keyframes.opacity,
          scale: keyframes.scale
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.75,
          ease: "linear",
          times: Array.from({ length: 11 }, (_, i) => i / 10)
        }}
        style={{
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            ...skinStyle,
            position: 'relative',
          }}
          className={`select-none pointer-events-none ${textClass}`}
        >
          {t.skin === 'Void' && (
            <div className="absolute inset-[-6px] bg-purple-950/30 rounded-full blur-sm -z-10 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
          )}

          <span>{t.text}</span>
        </div>
      </motion.div>
    </div>
  );
}
