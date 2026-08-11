import React from 'react';
import { Crosshair, HeartPulse, Shield, Zap } from 'lucide-react';
import type { CharacterRole } from '../types';
import { getRoleLabel } from '../utils/characterRoles';

interface CharacterRoleBadgeProps {
  role: CharacterRole;
  compact?: boolean;
  className?: string;
}

const ROLE_BADGE_DESCRIPTION = 'DPS, Sub DPS, Support, or Tank combat role';

const ROLE_STYLES: Record<CharacterRole, string> = {
  dps: 'border-rose-400/35 bg-rose-500/10 text-rose-300',
  'sub-dps': 'border-violet-400/35 bg-violet-500/10 text-violet-300',
  support: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300',
  tank: 'border-sky-400/35 bg-sky-500/10 text-sky-300'
};

const ROLE_ICONS = {
  dps: Crosshair,
  'sub-dps': Zap,
  support: HeartPulse,
  tank: Shield
} satisfies Record<CharacterRole, React.ComponentType<{ className?: string }>>;

export default function CharacterRoleBadge({ role, compact = false, className = '' }: CharacterRoleBadgeProps) {
  const Icon = ROLE_ICONS[role];
  const label = getRoleLabel(role);
  return (
    <span
      aria-label={`${label} role`}
      title={`${label} role. ${ROLE_BADGE_DESCRIPTION}`}
      data-role-icon-only="true"
      className={`inline-flex shrink-0 items-center rounded-md border font-black uppercase tracking-wider ${ROLE_STYLES[role]} ${
        compact ? 'p-1' : 'p-1.5'
      } ${className}`}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
    </span>
  );
}
