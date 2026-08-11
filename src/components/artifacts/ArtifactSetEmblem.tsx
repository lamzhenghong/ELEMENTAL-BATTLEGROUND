import { Clock3, Shield, Sparkles, Swords } from 'lucide-react';
import { ARTIFACT_SETS } from '../../data/artifacts';
import { ARTIFACT_SET_VISUALS, type ArtifactSetProgress } from '../../utils/artifactSetVisuals';

interface ArtifactSetEmblemProps {
  progress: ArtifactSetProgress;
  compact?: boolean;
  className?: string;
}

const ICONS = {
  sword: Swords,
  shield: Shield,
  star: Sparkles,
  clock: Clock3,
};

export default function ArtifactSetEmblem({ progress, compact = false, className = '' }: ArtifactSetEmblemProps) {
  if (progress.tier < 2) return null;
  const theme = ARTIFACT_SET_VISUALS[progress.set];
  const Icon = ICONS[theme.emblem];
  const tierLabel = progress.tier === 4 ? '4-Piece Active' : '2-Piece Active';
  const title = `${ARTIFACT_SETS[progress.set].name}: ${tierLabel}`;

  return (
    <span
      className={`artifact-set-emblem inline-flex items-center justify-center rounded-full border bg-slate-950/80 ${
        compact ? 'h-5 min-w-5 px-1' : 'h-7 min-w-7 gap-1 px-1.5'
      } ${progress.tier === 4 ? 'artifact-set-emblem--complete' : ''} ${className}`}
      style={{ color: theme.color, borderColor: `${theme.color}80`, boxShadow: progress.tier === 4 ? `0 0 12px ${theme.color}55` : undefined }}
      title={title}
      aria-label={title}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {!compact ? <span className="text-[8px] font-black font-mono">{progress.tier}PC</span> : null}
    </span>
  );
}
