import { Coins, Hammer, Sparkles, Star } from 'lucide-react';
import type { Weapon } from '../types';
import { getUpgradedWeaponStats } from '../utils/characterBuildStats';
import type { ForgeOperationEvent, ForgeVisualItem } from '../utils/forgePresentation';
import ForgeFocusStage from './ForgeFocusStage';

interface WeaponForgePanelProps {
  weapon: Weapon;
  operation?: ForgeOperationEvent;
  operationVersion: number;
  lowGraphics: boolean;
  onUpgrade: (weaponId: string) => boolean | void;
}

const rarityLabel: Record<Weapon['rarity'], string> = {
  3: 'Common',
  4: 'Rare',
  5: 'Legendary',
};

export function WeaponForgePanel({
  weapon,
  operation,
  operationVersion,
  lowGraphics,
  onUpgrade,
}: WeaponForgePanelProps) {
  const stats = getUpgradedWeaponStats(weapon);
  const isMaxed = weapon.level >= 50;
  const nextLevel = Math.min(50, weapon.level + 1);
  const upgradeCost = weapon.level * 200;
  const refinement = Math.floor(Math.min(weapon.level, 49) / 5) + 1;
  const levelProgress = Math.min(100, Math.max(0, (weapon.level / 50) * 100));
  const visualItem: ForgeVisualItem = {
    kind: 'weapon',
    id: weapon.id,
    name: weapon.name,
    rarity: weapon.rarity,
    level: weapon.level,
    primaryStat: `Base ATK ${stats.calcBaseAtk}`,
    weaponType: weapon.weaponType,
  };

  return (
    <section
      className="forge-presentation-layout forge-weapon-panel overflow-hidden rounded-xl border border-indigo-400/20 bg-black/35"
      data-forge-layout="weapon"
      data-weapon-forge-panel={weapon.id}
    >
      <div className="forge-focus-shell" key={`${weapon.id}-${operationVersion}`}>
        <ForgeFocusStage
          item={visualItem}
          operation={operation}
          lowGraphics={lowGraphics}
        />
      </div>

      <div className="forge-action-shell flex min-w-0 flex-col gap-4">
        <header className="min-w-0 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <span className="rounded border border-indigo-400/25 bg-indigo-400/10 px-2 py-1 text-indigo-300">{weapon.weaponType}</span>
            <span className="rounded border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-amber-300">{rarityLabel[weapon.rarity]}</span>
            <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${weapon.rarity} star weapon`}>
              {Array.from({ length: weapon.rarity }).map((_, index) => (
                <Star className="h-3 w-3 fill-current" key={index} />
              ))}
            </span>
          </div>
          <h3 className="mt-3 break-words text-lg font-black uppercase leading-tight text-slate-100 sm:text-xl">{weapon.name}</h3>
        </header>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black uppercase tracking-wider">
            <span className="text-slate-200">Level {weapon.level}</span>
            <span className={isMaxed ? 'text-emerald-300' : 'text-slate-400'}>
              {isMaxed ? 'Max Level' : `Next Level ${nextLevel}`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-900 ring-1 ring-white/10" aria-label={`${Math.round(levelProgress)} percent weapon level progress`}>
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-white/10 bg-black/35 p-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Base ATK</span>
            <strong className="mt-1 block break-words font-mono text-base text-amber-300">{stats.calcBaseAtk}</strong>
          </div>
          <div className="min-w-0 rounded-lg border border-white/10 bg-black/35 p-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Bonus Stat</span>
            <strong className="mt-1 block break-words font-mono text-sm text-emerald-300">{stats.calcStatBonus}</strong>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-indigo-400/20 bg-indigo-950/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Passive
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Refinement S{refinement}</span>
          </div>
          <p className="mt-3 break-words text-xs leading-5 text-slate-300">{stats.calcFeatureDesc}</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300">Passive potency +{(refinement - 1) * 8}%</p>
        </div>

        <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2.5">
            <Coins className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">Upgrade Cost</span>
              <strong className="break-words font-mono text-xs text-amber-300">{isMaxed ? 'No further cost' : `${upgradeCost.toLocaleString()} Mora`}</strong>
            </div>
          </div>
          <button
            type="button"
            disabled={isMaxed}
            aria-label={isMaxed ? `${weapon.name} is at maximum level` : `Upgrade ${weapon.name} to level ${nextLevel}`}
            onClick={() => onUpgrade(weapon.id)}
            className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-xs font-black uppercase tracking-widest transition-all sm:w-auto ${
              isMaxed
                ? 'cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500'
                : 'cursor-pointer border-indigo-400/35 bg-indigo-500 text-white shadow-[0_0_18px_rgba(99,102,241,0.22)] hover:bg-indigo-400 active:scale-[0.98]'
            }`}
          >
            <Hammer className="h-4 w-4" />
            {isMaxed ? 'Maxed' : `Upgrade to Lv. ${nextLevel}`}
          </button>
        </div>
      </div>
    </section>
  );
}

export default WeaponForgePanel;
