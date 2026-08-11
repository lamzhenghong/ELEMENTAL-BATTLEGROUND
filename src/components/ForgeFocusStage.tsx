import { useEffect, useState, type CSSProperties } from 'react';
import {
  Axe,
  BowArrow,
  Footprints,
  Hand,
  HardHat,
  PersonStanding,
  Sword,
  WandSparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  getArtifactSilhouette,
  getForgeAnimationProfile,
  getRarityColor,
  getWeaponSilhouette,
  type ForgeOperationEvent,
  type ForgeSilhouette,
  type ForgeVisualItem,
} from '../utils/forgePresentation';

interface ForgeFocusStageProps {
  item: ForgeVisualItem;
  operation?: ForgeOperationEvent;
  lowGraphics: boolean;
  reducedMotion?: boolean;
}

const iconBySilhouette = {
  sword: Sword,
  axe: Axe,
  bow: BowArrow,
  wand: WandSparkles,
  polearm: null,
  shield: HardHat,
  hand: Hand,
  legs: PersonStanding,
  boots: Footprints,
};

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;

    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  return reducedMotion;
}

function getItemSilhouette(item: ForgeVisualItem): ForgeSilhouette {
  return item.kind === 'weapon'
    ? getWeaponSilhouette(item.weaponType)
    : getArtifactSilhouette(item.slot);
}

function ForgeSilhouetteMark({ item, compact = false }: { item: ForgeVisualItem; compact?: boolean }) {
  const silhouette = getItemSilhouette(item);
  const Icon = iconBySilhouette[silhouette.icon];

  if (silhouette.icon === 'polearm') {
    return (
      <span
        aria-hidden="true"
        className={compact ? 'relative block h-5 w-5' : 'relative block h-16 w-16 sm:h-20 sm:w-20'}
        data-forge-polearm
      >
        <span className="absolute bottom-[12%] left-1/2 top-[12%] w-[2px] -translate-x-1/2 bg-current" data-forge-polearm-shaft />
        <span className="absolute left-1/2 top-[5%] h-3 w-3 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-current" data-forge-polearm-tip />
        <span className="absolute left-1/2 top-[48%] h-px w-7 -translate-x-1/2 bg-current" data-forge-polearm-guard />
        <span className="absolute bottom-[14%] left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-full bg-current" data-forge-polearm-grip />
      </span>
    );
  }

  if (!Icon) return null;

  return (
    <Icon
      aria-hidden="true"
      className={compact ? 'h-5 w-5' : 'h-16 w-16 sm:h-20 sm:w-20'}
      strokeWidth={compact ? 1.8 : 1.35}
    />
  );
}

export function ForgeFocusStage({
  item,
  operation,
  lowGraphics,
  reducedMotion: reducedMotionOverride,
}: ForgeFocusStageProps) {
  const prefersReducedMotion = useReducedMotionPreference();
  const reducedMotion = reducedMotionOverride ?? prefersReducedMotion;
  const rarityColor = getRarityColor(item.rarity);
  const profile = getForgeAnimationProfile(operation?.operation ?? 'failure');
  const showAnimation = Boolean(operation) && operation.operation !== 'failure' && !reducedMotion;
  const materialNodes = Array.from(
    { length: lowGraphics ? Math.min(3, profile.orbitingNodes) : profile.orbitingNodes },
    (_, index) => index,
  );
  const fusionSources = operation?.operation === 'fusion'
    ? operation.sourceItems.slice(0, profile.sourceNodes)
    : [];
  const stageStyle = {
    '--forge-rarity': rarityColor,
  } as CSSProperties;
  const operationLabel = operation
    ? operation.operation === 'failure'
      ? 'Forge operation failed'
      : operation.operation === 'fusion'
        ? 'Artifacts fused'
        : `Weapon enhanced to level ${operation.nextLevel}`
    : 'Forge item selected';

  return (
    <section
      className="relative grid min-h-56 w-full grid-cols-1 content-center items-center gap-2 overflow-hidden px-3 py-4 sm:min-h-64 sm:px-5 sm:py-5"
      data-forge-focus-stage
      data-forge-operation={operation?.operation ?? 'idle'}
      data-low-graphics={lowGraphics ? 'true' : 'false'}
      data-reduced-motion={reducedMotion || undefined}
      aria-label={`${item.name} forge focus`}
      style={stageStyle}
    >
      <span className="sr-only" aria-live="polite">{operationLabel}</span>

      <div className="relative flex min-h-36 items-center justify-center sm:min-h-44" aria-hidden="true">
        <div
          className="absolute h-32 w-32 rounded-full border-2 sm:h-40 sm:w-40"
          style={{
            borderColor: rarityColor,
            boxShadow: lowGraphics ? undefined : `0 0 24px ${rarityColor}44`,
          }}
        />
        <div
          className="absolute h-20 w-40 border-b border-white/20 sm:h-24 sm:w-48"
          style={{ borderColor: rarityColor }}
        />

        {showAnimation && operation?.operation === 'upgrade' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: [0, 1, 1, 0], rotate: [0, 160] }}
            transition={{ duration: profile.durationMs / 1000, times: [0, 0.12, 0.7, 1], ease: 'easeInOut' }}
          >
            {materialNodes.map((index) => {
              const angle = (360 / materialNodes.length) * index;
              return (
                <motion.span
                  className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full border border-white/60"
                  data-forge-material-node={index}
                  initial={{ x: Math.cos(angle * Math.PI / 180) * 66, y: Math.sin(angle * Math.PI / 180) * 66, scale: 0.6 }}
                  animate={{ x: 0, y: 0, scale: [0.6, 1, 0.3] }}
                  transition={{ duration: profile.durationMs / 1000, delay: index * 0.035, ease: 'easeIn' }}
                  key={index}
                  style={{ backgroundColor: rarityColor, boxShadow: `0 0 10px ${rarityColor}` }}
                />
              );
            })}
          </motion.div>
        )}

        {showAnimation && operation?.operation === 'fusion' && (
          <div className="absolute inset-0">
            {fusionSources.map((sourceItem, index) => {
              const positions = [[-70, 40], [0, -68], [70, 40]] as const;
              const [x, y] = positions[index];
              return (
                <motion.div
                  className="absolute left-1/2 top-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-slate-950/80"
                  data-forge-fusion-source={index}
                  initial={{ x, y, opacity: 0, scale: 0.75 }}
                  animate={{ x: 0, y: 0, opacity: [0, 1, 1, 0], scale: [0.75, 1, 0.35] }}
                  transition={{ duration: profile.durationMs / 1000, delay: index * 0.08, times: [0, 0.15, 0.66, 1], ease: 'easeIn' }}
                  key={sourceItem.id}
                  style={{ borderColor: getRarityColor(sourceItem.rarity) }}
                >
                  <ForgeSilhouetteMark item={sourceItem} compact />
                </motion.div>
              );
            })}
          </div>
        )}

        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/35 bg-slate-950/70 sm:h-24 sm:w-24"
          style={{ color: rarityColor, boxShadow: reducedMotion ? `0 0 18px ${rarityColor}55` : undefined }}
        >
          <ForgeSilhouetteMark item={item} />
        </div>
      </div>

      <div className="min-w-0 max-w-full space-y-1 text-center" data-forge-focus-copy>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: rarityColor }}>
          {getItemSilhouette(item).label}
        </p>
        <h3 className="break-words text-sm font-black leading-tight text-slate-100 sm:text-base" title={item.name}>{item.name}</h3>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>LV. {Math.max(0, Math.floor(item.level))}</span>
          <span aria-hidden="true">/</span>
          <span className="break-words">{item.primaryStat}</span>
        </div>
        {operation?.operation === 'upgrade' && (
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-200">Level {operation.previousLevel} to {operation.nextLevel}</p>
        )}
        {operation && reducedMotion && operation.operation !== 'failure' && (
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: rarityColor }}>Forge result ready</p>
        )}
      </div>
    </section>
  );
}

export default ForgeFocusStage;
