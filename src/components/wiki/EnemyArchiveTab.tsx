import React, { useState } from 'react';
import {
  BatteryCharging,
  CircleDot,
  Copy,
  Crosshair,
  Eye,
  Gem,
  HeartPulse,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { AetheriaAudioEngine } from '../../utils/audio';
import {
  ENEMY_ARCHETYPE_DEFINITIONS,
  type EnemyArchetypeId
} from '../../utils/enemyArchetypes';
import { getBossIdentityGroups } from '../../utils/bossIdentities';
import BossModelPreview from '../BossModelPreview';
import EnemyArchetypeModelPreview from '../EnemyArchetypeModelPreview';

const BOSS_IDENTITY_GROUPS = getBossIdentityGroups();

const getEnemyArchetypeIcon = (archetypeId: EnemyArchetypeId) => {
  switch (archetypeId) {
    case 'bulwark': return <Shield className="w-5 h-5" />;
    case 'channeler': return <HeartPulse className="w-5 h-5" />;
    case 'artillery': return <Crosshair className="w-5 h-5" />;
    case 'siphon': return <BatteryCharging className="w-5 h-5" />;
    case 'mimic': return <Copy className="w-5 h-5" />;
    case 'summoner': return <CircleDot className="w-5 h-5" />;
    case 'stalker': return <Eye className="w-5 h-5" />;
    case 'relic-carrier': return <Gem className="w-5 h-5" />;
  }
};

export default function EnemyArchiveTab() {
  const [enemyView, setEnemyView] = useState<'enemies' | 'bosses'>('enemies');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
      key="tab_enemies"
      id="gdd_enemies"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-400 font-mono">
            Battlefield Recognition
          </span>
          <h3 className="mt-1 text-2xl font-black text-slate-100 font-display uppercase tracking-tight">
            {enemyView === 'enemies' ? 'Enemy Archetypes' : 'Boss Enemies'}
          </h3>
          <p className="mt-2 max-w-3xl text-xs text-slate-400 leading-relaxed">
            {enemyView === 'enemies'
              ? 'Normal and Elite enemies use color and restrained cues to reveal their role. Identify the threat, then use the counter listed below.'
              : 'Review every current boss model, the attacks it performs, and the safest way to answer each combat pattern.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEnemyView(current => current === 'enemies' ? 'bosses' : 'enemies');
            AetheriaAudioEngine.playClick();
          }}
          className="min-h-10 shrink-0 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-400/20"
        >
          {enemyView === 'enemies' ? 'Switch to Boss' : 'Switch to Enemies'}
        </button>
      </div>

      {enemyView === 'enemies' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {ENEMY_ARCHETYPE_DEFINITIONS.map(archetype => (
              <article
                key={archetype.id}
                className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/55 p-4 transition-colors hover:border-slate-700"
                style={{ boxShadow: `inset 3px 0 0 ${archetype.color}` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border"
                    style={{
                      color: archetype.id === 'stalker' ? '#f87171' : archetype.color,
                      borderColor: `${archetype.color}66`,
                      backgroundColor: `${archetype.color}14`
                    }}
                    aria-hidden="true"
                  >
                    {getEnemyArchetypeIcon(archetype.id)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-wide text-slate-100">
                      {archetype.name}
                    </h4>
                    <span
                      className="mt-1 inline-block text-[8px] font-black uppercase tracking-wider"
                      style={{ color: archetype.id === 'stalker' ? '#f87171' : archetype.color }}
                    >
                      {archetype.visual}
                    </span>
                  </div>
                </div>

                <EnemyArchetypeModelPreview archetype={archetype} />

                <p className="mt-4 text-[11px] leading-relaxed text-slate-300">
                  {archetype.mechanic}
                </p>
                <div className="mt-3 border-t border-slate-800/80 pt-3">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                    Counter
                  </span>
                  <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-200">
                    {archetype.counter}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
            <p className="text-[10px] leading-relaxed text-slate-400">
              Enemy body colors are role indicators, not elemental identities. Player-applied elements and reactions continue to use the existing combat system.
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {([
            {
              id: 'campaign',
              title: 'Campaign Bosses',
              description: 'One authored boss at the end of each campaign chapter.',
              identities: BOSS_IDENTITY_GROUPS.campaign
            },
            {
              id: 'world',
              title: 'World and Rogue Bosses',
              description: 'Reusable boss encounters for Arena, Artifact Grind, and Rogue Ruins.',
              identities: BOSS_IDENTITY_GROUPS.world
            },
            {
              id: 'trial',
              title: 'Character Story Trial Bosses',
              description: 'Unique Act 3 memory constructs tied to each playable character.',
              identities: BOSS_IDENTITY_GROUPS.trial
            }
          ] as const).map(group => (
            <section key={group.id} aria-labelledby={`boss-group-${group.id}`}>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h4
                    id={`boss-group-${group.id}`}
                    className="text-sm font-black uppercase tracking-wider text-slate-100"
                  >
                    {group.title}
                  </h4>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                    {group.description}
                  </p>
                </div>
                <span className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                  {group.identities.length} Bosses
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {group.identities.map(identity => (
                  <article
                    key={identity.id}
                    className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/55 p-4 transition-colors hover:border-slate-700"
                    style={{ boxShadow: `inset 3px 0 0 ${identity.color}` }}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h5 className="text-sm font-black uppercase tracking-wide text-slate-100">
                          {identity.name}
                        </h5>
                        <p className="mt-1 truncate text-[8px] font-bold uppercase tracking-wider text-slate-500">
                          {identity.source}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded border px-1.5 py-1 text-[8px] font-black uppercase tracking-wider"
                        style={{
                          color: identity.secondaryColor,
                          borderColor: identity.color,
                          backgroundColor: 'rgba(2,6,23,0.72)'
                        }}
                      >
                        {identity.element}
                      </span>
                    </div>

                    <BossModelPreview identity={identity} />

                    <div className="mt-4">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                        Skill / Mechanic
                      </span>
                      <p
                        className="mt-1 text-[10px] font-black uppercase tracking-wide"
                        style={{ color: identity.secondaryColor }}
                      >
                        {identity.skillName}
                      </p>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                        {identity.mechanic}
                      </p>
                    </div>

                    <div className="mt-3 border-t border-slate-800/80 pt-3">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                        Counter
                      </span>
                      <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-200">
                        {identity.counter}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </motion.div>
  );
}
