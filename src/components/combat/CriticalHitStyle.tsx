import type { ReactNode } from 'react';
import type { CriticalVisualIdentity } from '../../utils/damageFeedback';

interface CriticalHitStyleProps {
  identity: CriticalVisualIdentity;
  children: ReactNode;
}

const CRITICAL_ACCENTS: Partial<Record<CriticalVisualIdentity, string>> = {
  pyro: '·',
  hydro: '◌',
  electro: '⌁',
  cryo: '◇',
  verdant: '⌃',
  void: '◈',
  celestial: '✦',
};

export default function CriticalHitStyle({ identity, children }: CriticalHitStyleProps) {
  const accent = CRITICAL_ACCENTS[identity];
  return (
    <span className={`critical-hit critical-hit--${identity}`} data-critical-identity={identity}>
      {accent ? <span className="critical-hit__accent" aria-hidden="true">{accent}</span> : null}
      <span>{children}</span>
    </span>
  );
}
