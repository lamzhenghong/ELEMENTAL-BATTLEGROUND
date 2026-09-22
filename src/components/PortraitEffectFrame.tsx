import type { ReactNode } from 'react';
import type { ElementType } from '../types';
import { resolvePortraitEffect } from '../utils/portraitEffects';

interface PortraitEffectFrameProps {
  characterId: string;
  element: ElementType;
  unlockedPortraits: Record<string, number>;
  characterIsUnlocked?: boolean;
  className?: string;
  children: ReactNode;
  showTier?: boolean;
}

export default function PortraitEffectFrame({
  characterId,
  element,
  unlockedPortraits,
  characterIsUnlocked = true,
  className = '',
  children,
  showTier = false,
}: PortraitEffectFrameProps) {
  const effect = resolvePortraitEffect(
    characterId,
    unlockedPortraits,
    element,
    characterIsUnlocked,
  );

  return (
    <div
      className={`portrait-effect-frame ${effect.isActive ? 'portrait-effect-frame--active' : ''} ${effect.activeTier >= 4 ? 'portrait-effect-frame--awakened' : ''} ${className}`}
      data-portrait-tier={effect.activeTier}
      style={effect.frameStyle}
    >
      {children}
      {effect.isActive && <span className="portrait-effect-frame__sheen" aria-hidden="true" />}
      {showTier && effect.isActive && (
        <span className="portrait-effect-frame__tier" aria-label={`Active portrait tier ${effect.activeTier}`}>
          P{effect.activeTier}
        </span>
      )}
    </div>
  );
}
