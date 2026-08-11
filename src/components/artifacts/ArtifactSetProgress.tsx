import { Clock3, Shield, Sparkles, Swords } from 'lucide-react';
import { ARTIFACT_SETS } from '../../data/artifacts';
import type { ArtifactSlot } from '../../types';
import {
  ARTIFACT_SET_VISUALS,
  ARTIFACT_SLOT_ORDER,
  type ArtifactSetProgress as ArtifactSetProgressModel,
} from '../../utils/artifactSetVisuals';

interface ArtifactSetProgressProps {
  progress: readonly ArtifactSetProgressModel[];
  suggestedSet?: ArtifactSetProgressModel | null;
  activationTier?: 2 | 4 | null;
}

const TIER_PROGRESS_LABELS = { 2: '2/4', 4: '4/4' } as const;

const SLOT_LABELS: Record<ArtifactSlot, string> = {
  helmet: 'Head',
  hands: 'Hands',
  leg: 'Legs',
  shoe: 'Boots',
};

const ICONS = {
  sword: Swords,
  shield: Shield,
  star: Sparkles,
  clock: Clock3,
};

export default function ArtifactSetProgress({ progress, suggestedSet, activationTier = null }: ArtifactSetProgressProps) {
  const visible = progress.filter(entry => entry.count > 0);
  if (visible.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-3 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
        Equip matching artifacts to awaken set resonance.
      </div>
    );
  }

  return (
    <div className={`artifact-set-progress space-y-2 rounded-lg border border-white/10 bg-black/30 p-3 ${activationTier ? 'artifact-set-progress--activated' : ''}`}>
      {activationTier === 4 ? (
        <div className="artifact-set-activation text-center text-[10px] font-black uppercase tracking-widest text-amber-300">4-Piece Resonance Active</div>
      ) : activationTier === 2 ? (
        <div className="artifact-set-activation text-center text-[10px] font-black uppercase tracking-widest text-emerald-300">2-Piece Resonance Active</div>
      ) : null}

      {visible.map(entry => {
        const theme = ARTIFACT_SET_VISUALS[entry.set];
        const Icon = ICONS[theme.emblem];
        return (
          <div key={entry.set} className="space-y-2 rounded-md border border-white/5 bg-slate-950/45 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-wider" style={{ color: theme.color }}>
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{ARTIFACT_SETS[entry.set].name}</span>
              </span>
              <span className="shrink-0 rounded border border-white/10 bg-black/40 px-2 py-1 font-mono text-[9px] font-black text-slate-200">
                {entry.count >= 4 ? TIER_PROGRESS_LABELS[4] : entry.count === 2 ? TIER_PROGRESS_LABELS[2] : `${entry.count}/4`}
              </span>
            </div>

            <div className="relative grid grid-cols-4 gap-1.5">
              <span className="pointer-events-none absolute left-[10%] right-[10%] top-1/2 h-px -translate-y-1/2 bg-white/8" />
              {ARTIFACT_SLOT_ORDER.map(slot => {
                const active = entry.activeSlots.includes(slot);
                const missingSlots = suggestedSet?.set === entry.set ? suggestedSet.missingSlots : [];
                const suggested = !active && missingSlots.includes(slot);
                return (
                  <span
                    key={slot}
                    className={`relative z-10 flex min-h-9 items-center justify-center rounded border px-1 text-center text-[7px] font-black uppercase tracking-tight ${
                      active
                        ? 'bg-slate-900 text-white'
                        : suggested
                          ? 'artifact-slot-missing border-dashed bg-black/35 text-slate-400'
                          : 'border-white/5 bg-black/25 text-slate-600'
                    }`}
                    style={active || suggested ? { borderColor: `${theme.color}${active ? '99' : '55'}`, boxShadow: active ? `0 0 8px ${theme.color}28` : undefined } : undefined}
                    title={active ? `${SLOT_LABELS[slot]} equipped` : `${SLOT_LABELS[slot]} missing`}
                  >
                    {SLOT_LABELS[slot]}
                  </span>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[8px] font-bold uppercase tracking-wide">
              <span className={entry.isTwoPieceActive ? 'text-emerald-300' : 'text-slate-600'}>◆ 2-Piece {entry.isTwoPieceActive ? 'Active' : 'Inactive'}</span>
              <span className={entry.isFourPieceActive ? 'text-amber-300' : 'text-slate-500'}>
                {entry.isFourPieceActive ? '◆ 4-Piece Active' : `◇ 4-Piece — ${4 - entry.count} more ${4 - entry.count === 1 ? 'piece' : 'pieces'} required`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
