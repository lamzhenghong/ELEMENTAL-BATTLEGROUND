import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { CriticalVisualIdentity, DamageNumberMotion } from '../../utils/damageFeedback';
import { getDamageSkinTextPresentation } from '../../utils/combatReadability';
import CriticalHitStyle from './CriticalHitStyle';

export interface FloatingDamageTextEntry {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  isCrit: boolean;
  skin?: string;
  isDot?: boolean;
  motion?: DamageNumberMotion;
  criticalStyle?: CriticalVisualIdentity;
}

interface FloatingDamageTextDOMProps {
  t: FloatingDamageTextEntry;
  key?: any;
}

export function FloatingDamageTextDOM({ t }: FloatingDamageTextDOMProps) {
  const skinPresentation = getDamageSkinTextPresentation(t.skin, t.isCrit, t.isDot === true);
  const keyframes = useMemo(() => {
    const seed = Array.from(t.id).reduce((value, char) => ((value * 31) + char.charCodeAt(0)) | 0, 7);
    const fallbackDirection = seed % 2 === 0 ? 1 : -1;
    const vx = t.motion?.velocityX ?? fallbackDirection * (t.isDot ? 12 : t.isCrit ? 44 : 28);
    const vy = t.motion?.velocityY ?? (t.isDot ? -45 : t.isCrit ? -142 : -108);
    const gravity = t.motion?.gravity ?? (t.isDot ? 120 : t.isCrit ? 390 : 430);
    const duration = t.motion?.duration ?? 0.75;

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
        const peakScale = t.isDot ? 1 : t.isCrit ? 1.65 : 1.15;
        scalePath.push(0.5 + (peakScale - 0.5) * (r / 0.12));
      } else {
        const peakScale = t.isDot ? 1 : t.isCrit ? 1.65 : 1.15;
        const endScale = t.isDot ? 0.85 : t.isCrit ? 1.1 : 0.8;
        scalePath.push(peakScale - (peakScale - endScale) * ((r - 0.12) / 0.88));
      }
    }

    return { x: xPath, y: yPath, opacity: opacityPath, scale: scalePath, duration };
  }, [t.id, t.isCrit, t.isDot, t.motion]);

  let skinStyle: React.CSSProperties = {
    position: 'absolute',
    color: t.color,
    fontSize: `${t.size}px`,
    fontWeight: '900',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, -50%)',
    WebkitTextStroke: t.isDot ? undefined : '0.35px rgba(0,0,0,0.72)',
  };

  let textClass = skinPresentation.className;

  switch (t.skin) {
    case 'Ice':
      skinStyle.fontFamily = '"Trebuchet MS", sans-serif';
      skinStyle.color = '#f0fbff';
      skinStyle.WebkitTextStroke = '0.75px #075985';
      skinStyle.textShadow = '0 0 2px #ffffff, 0 0 8px rgba(56,189,248,0.95), 0 2px 2px rgba(2,12,27,0.95)';
      break;
    case 'Void':
      skinStyle.fontFamily = '"Lucida Console", monospace';
      skinStyle.textShadow = '1px 1px 0 #1e1b4b, -1px -1px 0 #d946ef';
      break;
    case 'Celestial':
      skinStyle.fontFamily = '"Georgia", serif';
      skinStyle.color = '#fff8cf';
      skinStyle.WebkitTextStroke = '0.8px #854d0e';
      skinStyle.textShadow = '0 0 2px #ffffff, 0 0 9px rgba(250,204,21,0.98), 0 2px 2px rgba(30,18,2,0.98)';
      break;
    default:
      skinStyle.fontFamily = '"Space Grotesk", sans-serif';
      skinStyle.textShadow = '0 2px 2px rgba(0,0,0,0.95), 0 0 5px rgba(0,0,0,0.78)';
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
          duration: keyframes.duration,
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

          {t.isCrit ? (
            <CriticalHitStyle identity={t.criticalStyle || 'neutral'}>{t.text}</CriticalHitStyle>
          ) : (
            <span>{t.text}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
