import React, { useMemo, useState } from 'react';
import { Activity, ArrowLeft, Clock3, Crosshair, FlaskConical, RefreshCw, Shield, Sparkles, Swords, Zap } from 'lucide-react';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import type { ElementType } from '../types';
import { getCharacterKit, type CharacterKitEffect, type LimitedKitCharacterId } from '../utils/characterKits';
import { applyRoleStatModifiers } from '../utils/characterRoles';
import {
  applyCombatStatus,
  getStatusMovementMultiplier,
  getStatusOutgoingDamageMultiplier,
  tickCombatStatuses,
  type CombatStatusEffect,
  type CombatTargetClass
} from '../utils/combatStatusEffects';
import {
  activateVeyraDominion,
  addMaelisShield,
  addReactionField,
  addWhirlpool,
  createPartyEffectState,
  getReactionFieldModifiers,
  tickPartyEffects,
  type CombatPartyEffectState
} from '../utils/combatPartyEffects';
import { canTriggerElementalReaction, createReactionContext, type CombatDamageSource } from '../utils/reactionSources';
import { getReactionDamageOutcome, getSpecialUltimateStatDamage, getStatScaledAttackDamage } from '../utils/combatDamage';
import { SPECIAL_ULTIMATE_COMBOS } from '../utils/specialUltimates';
import CharacterRoleBadge from './CharacterRoleBadge';

const LIMITED_IDS: LimitedKitCharacterId[] = ['aurelia', 'kaelen', 'maelis', 'veyra'];

interface TestEnemy {
  spawnId: number;
  targetClass: CombatTargetClass;
  hp: number;
  maxHp: number;
  statuses: CombatStatusEffect[];
  activeElements: ElementType[];
}

const TARGET_HP: Record<CombatTargetClass, number> = {
  normal: 12000,
  elite: 24000,
  boss: 60000
};

const createEnemy = (targetClass: CombatTargetClass, spawnId = 1): TestEnemy => ({
  spawnId,
  targetClass,
  hp: TARGET_HP[targetClass],
  maxHp: TARGET_HP[targetClass],
  statuses: [],
  activeElements: []
});

const elementColor: Record<ElementType, string> = {
  Pyro: '#fb7185',
  Hydro: '#38bdf8',
  Cryo: '#bae6fd',
  Electro: '#c084fc',
  Anemo: '#34d399',
  Geo: '#fbbf24',
  Dendro: '#4ade80'
};

const actionButton = 'min-h-12 rounded-lg border border-white/10 bg-slate-950/75 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-200 transition-colors hover:border-cyan-400/45 hover:bg-slate-900 active:scale-[0.98]';

export default function CharacterKitTestPage() {
  const [characterId, setCharacterId] = useState<LimitedKitCharacterId>('aurelia');
  const [targetClass, setTargetClass] = useState<CombatTargetClass>('normal');
  const [enemy, setEnemy] = useState<TestEnemy>(() => createEnemy('normal'));
  const [partyEffects, setPartyEffects] = useState<CombatPartyEffectState>(() => createPartyEffectState());
  const [forceProc, setForceProc] = useState(false);
  const [lastReactionSource, setLastReactionSource] = useState<CombatDamageSource | 'none'>('none');
  const [lastReaction, setLastReaction] = useState('None');
  const [eventLog, setEventLog] = useState<string[]>(['Kit lab initialized.']);

  const character = PLAYABLE_CHARACTERS.find(candidate => candidate.id === characterId)!;
  const kit = getCharacterKit(characterId)!;
  const adjustedStats = useMemo(
    () => applyRoleStatModifiers(character.baseStats, character.role),
    [character]
  );
  const fieldModifiers = getReactionFieldModifiers(partyEffects, 0, 0);

  const log = (message: string) => {
    setEventLog(previous => [`${new Date().toLocaleTimeString()}  ${message}`, ...previous].slice(0, 30));
  };

  const spawnEnemy = () => {
    setEnemy(previous => createEnemy(targetClass, previous.spawnId + 1));
    setLastReaction('None');
    setLastReactionSource('none');
    log(`Spawned ${targetClass} target.`);
  };

  const applyDirectHit = (
    current: TestEnemy,
    source: Extract<CombatDamageSource, 'elemental-skill' | 'elemental-burst' | 'special-ultimate'>,
    baseDamage: number,
    incomingElement: ElementType
  ) => {
    const context = createReactionContext(source, true, true);
    let finalDamage = baseDamage;
    let activeElements = [...current.activeElements];
    let reactionLabel = 'None';

    if (canTriggerElementalReaction(context)) {
      const reaction = getReactionDamageOutcome(activeElements, incomingElement, baseDamage);
      if (reaction) {
        finalDamage = Math.round(reaction.finalDamage * fieldModifiers.reactionMultiplier);
        reactionLabel = reaction.reactionName;
        activeElements = reaction.consumesElements ? [] : activeElements;
      } else if (!activeElements.includes(incomingElement)) {
        activeElements.push(incomingElement);
      }
    }

    setLastReactionSource(context.source);
    setLastReaction(reactionLabel);
    return {
      ...current,
      hp: Math.max(0, current.hp - finalDamage),
      activeElements
    };
  };

  const applyStatusEffect = (
    current: TestEnemy,
    effect: CharacterKitEffect,
    sourceAbility: 'normal-attack' | 'skill' | 'burst'
  ) => {
    let incoming: CombatStatusEffect | null = null;
    if (effect.kind === 'burn') {
      incoming = {
        id: `burn:${characterId}:${sourceAbility}`,
        type: 'burn',
        sourceCharacterId: characterId,
        sourceAbility,
        duration: effect.duration,
        remainingDuration: effect.duration,
        strength: effect.attackMultiplier,
        stackBehavior: 'strongest',
        visualKind: 'burning',
        tickInterval: effect.tickInterval,
        timeUntilNextTick: effect.tickInterval,
        snapshotAtk: adjustedStats.atk
      };
    } else if (effect.kind === 'slow') {
      incoming = {
        id: `slow:${characterId}:${sourceAbility}`,
        type: 'slow',
        sourceCharacterId: characterId,
        sourceAbility,
        duration: effect.duration,
        remainingDuration: effect.duration,
        strength: effect.strength,
        stackBehavior: 'refresh',
        visualKind: 'slowed'
      };
    } else if (effect.kind === 'damage-down') {
      if (!forceProc && Math.random() >= effect.procChance) {
        log('Withering Mark did not proc.');
        return current;
      }
      incoming = {
        id: `damage-down:${characterId}:${sourceAbility}`,
        type: 'damage-down',
        sourceCharacterId: characterId,
        sourceAbility,
        duration: effect.duration,
        remainingDuration: effect.duration,
        strength: effect.strength,
        stackBehavior: 'refresh',
        visualKind: 'weakened'
      };
    } else if (effect.kind === 'stun') {
      if (effect.procChance && !forceProc && Math.random() >= effect.procChance) {
        log('Voltaic Shock did not proc.');
        return current;
      }
      const duration = current.targetClass === 'elite' ? effect.eliteDuration : effect.normalDuration;
      incoming = {
        id: `stun:${characterId}:${sourceAbility}`,
        type: 'stun',
        sourceCharacterId: characterId,
        sourceAbility,
        duration,
        remainingDuration: duration,
        strength: 1,
        stackBehavior: 'refresh',
        visualKind: 'stunned'
      };
    }

    if (!incoming) return current;
    const result = applyCombatStatus(current.statuses, incoming, current.targetClass);
    log(result.immune ? `${incoming.type.toUpperCase()} IMMUNE (${current.targetClass})` : `${incoming.type.toUpperCase()} applied.`);
    return { ...current, statuses: result.statuses };
  };

  const useNormalAttack = () => {
    const dominion = partyEffects.effects.find(effect => effect.kind === 'veyra-dominion' && effect.remainingDuration > 0);
    const dominionMultiplier = characterId === 'veyra' && dominion?.kind === 'veyra-dominion'
      ? dominion.normalAttackDamageMultiplier
      : 1;
    const damage = getStatScaledAttackDamage(
      adjustedStats.atk,
      character.skills.basic.damageMultiplier,
      kit.normalAttack.damageMultiplier * dominionMultiplier
    );
    let next = { ...enemy, hp: Math.max(0, enemy.hp - damage) };
    for (const effect of kit.normalAttack.effects) next = applyStatusEffect(next, effect, 'normal-attack');
    setEnemy(next);
    setLastReactionSource('normal-attack');
    setLastReaction('None');
    log(`${kit.normalAttack.name}: ${damage} damage; no aura or reaction.`);
  };

  const useSkill = () => {
    let next = enemy;
    if (kit.skill.directDamage) {
      const damage = getStatScaledAttackDamage(adjustedStats.atk, character.skills.skill.damageMultiplier, kit.skill.damageMultiplier);
      next = applyDirectHit(next, 'elemental-skill', damage, character.element);
      log(`${kit.skill.name}: ${damage} base direct damage.`);
    } else {
      setLastReactionSource('elemental-skill');
      setLastReaction('None');
    }

    for (const effect of kit.skill.effects) {
      if (effect.kind === 'party-shield') {
        const nextParty = addMaelisShield(partyEffects, effect.amount, effect.cap);
        setPartyEffects(nextParty);
        log(`Party Shield ${nextParty.shield?.currentHp ?? 0}/${effect.cap}.`);
      } else {
        next = applyStatusEffect(next, effect, 'skill');
      }
    }
    setEnemy(next);
  };

  const useBurst = () => {
    let next = enemy;
    if (kit.burst.directDamage) {
      const damage = getStatScaledAttackDamage(adjustedStats.atk, character.skills.ultimate.damageMultiplier, kit.burst.damageMultiplier);
      next = applyDirectHit(next, 'elemental-burst', damage, character.element);
      log(`${kit.burst.name}: ${damage} base direct damage.`);
    }

    let nextParty = partyEffects;
    for (const effect of kit.burst.effects) {
      if (effect.kind === 'whirlpool') {
        nextParty = addWhirlpool(nextParty, { x: 0, y: 0 });
        log(enemy.targetClass === 'boss' ? 'Boss received damage but resisted the pull.' : 'Abyssal Whirlpool is pulling the target.');
      } else if (effect.kind === 'reaction-field') {
        nextParty = addReactionField(nextParty, { x: 0, y: 0 });
        log('Verdant Resonance Field active for 15 seconds.');
      } else if (effect.kind === 'dominion-field') {
        nextParty = activateVeyraDominion(nextParty, { x: 0, y: 0, snapshotAtk: adjustedStats.atk });
        log(`Stormglass Dominion snapshotted ${adjustedStats.atk} ATK.`);
      } else if (effect.kind === 'large-explosion') {
        log('Solar Detonation reached the full test arena.');
      } else {
        next = applyStatusEffect(next, effect, 'burst');
      }
    }
    setPartyEffects(nextParty);
    setEnemy(next);
  };

  const useSpecialUltimate = () => {
    const combo = SPECIAL_ULTIMATE_COMBOS.find(candidate => candidate.requiredCharacterIds.includes(characterId));
    if (!combo) return;
    const partnerId = combo.requiredCharacterIds.find(id => id !== characterId)!;
    const partner = PLAYABLE_CHARACTERS.find(candidate => candidate.id === partnerId)!;
    const partnerAtk = applyRoleStatModifiers(partner.baseStats, partner.role).atk;
    const damage = getSpecialUltimateStatDamage(adjustedStats.atk, [adjustedStats.atk, partnerAtk], combo.damageMultiplier);
    setEnemy(applyDirectHit(enemy, 'special-ultimate', damage, combo.damageElement));
    log(`${combo.name}: ${damage} base direct damage. Existing shields and fields preserved.`);
  };

  const advanceOneSecond = () => {
    const statusTick = tickCombatStatuses(enemy.statuses, 1);
    const partyTick = tickPartyEffects(partyEffects, 1, {
      [characterId]: { x: 0, y: 0 },
      veyra: { x: 0, y: 0 }
    });
    const statusDamage = statusTick.events.reduce((sum, event) => sum + event.damage, 0);
    const fieldDamage = partyTick.events.reduce((sum, event) => sum + event.damage, 0);
    setEnemy(current => ({
      ...current,
      hp: Math.max(0, current.hp - statusDamage - fieldDamage),
      statuses: statusTick.statuses
    }));
    setPartyEffects(partyTick.state);
    if (statusDamage > 0) {
      setLastReactionSource('damage-over-time');
      setLastReaction('None');
      log(`Burn tick: ${statusDamage} reaction-ineligible damage.`);
    }
    if (fieldDamage > 0) {
      setLastReactionSource('persistent-field');
      setLastReaction('None');
      log(`Electric field pulse: ${fieldDamage} reaction-ineligible damage.`);
    }
    if (statusDamage === 0 && fieldDamage === 0) log('Advanced all durations by 1 second.');
  };

  const switchCharacter = () => {
    const nextIndex = (LIMITED_IDS.indexOf(characterId) + 1) % LIMITED_IDS.length;
    const nextId = LIMITED_IDS[nextIndex];
    setCharacterId(nextId);
    log(`Switched to ${PLAYABLE_CHARACTERS.find(candidate => candidate.id === nextId)?.name}. Party effects preserved.`);
  };

  const resetLab = () => {
    setEnemy(createEnemy(targetClass));
    setPartyEffects(createPartyEffectState());
    setLastReactionSource('none');
    setLastReaction('None');
    setEventLog(['Kit lab reset.']);
  };

  const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const statusSummary = enemy.statuses.length
    ? enemy.statuses.map(status => `${status.type} ${status.remainingDuration.toFixed(1)}s`).join(', ')
    : 'None';
  const fieldSummary = partyEffects.effects.length
    ? partyEffects.effects.map(effect => `${effect.kind} ${effect.remainingDuration.toFixed(1)}s`).join(', ')
    : 'None';

  return (
    <main className="min-h-dvh bg-[#050812] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070b16]/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Back to game" className="rounded-md border border-white/10 p-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </a>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-cyan-400">Developer Combat Lab</p>
              <h1 className="text-base font-black uppercase tracking-wider md:text-xl">Character Kit Test</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CharacterRoleBadge role={character.role} />
            <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase text-slate-400">Production reducers</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)_360px] md:p-6">
        <section className="space-y-4 rounded-lg border border-white/10 bg-[#0a0f1d] p-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <FlaskConical className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-black uppercase tracking-wider">Test Controls</h2>
          </div>

          <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
            Character
            <select
              value={characterId}
              onChange={event => setCharacterId(event.target.value as LimitedKitCharacterId)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
            >
              {LIMITED_IDS.map(id => {
                const option = PLAYABLE_CHARACTERS.find(candidate => candidate.id === id)!;
                return <option key={id} value={id}>{option.name}</option>;
              })}
            </select>
          </label>

          <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
            Target Class
            <select
              value={targetClass}
              onChange={event => setTargetClass(event.target.value as CombatTargetClass)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
            >
              <option value="normal">Normal Enemy</option>
              <option value="elite">Elite Enemy</option>
              <option value="boss">Boss</option>
            </select>
          </label>

          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-violet-400/20 bg-violet-500/5 px-3 py-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-violet-200">Force Chance Effects</span>
            <input type="checkbox" checked={forceProc} onChange={event => setForceProc(event.target.checked)} className="h-4 w-4 accent-violet-500" />
          </label>

          <button type="button" onClick={spawnEnemy} className={`${actionButton} w-full border-emerald-400/25 text-emerald-300`}>
            <RefreshCw className="mr-2 inline h-3.5 w-3.5" /> Spawn Enemy
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={useNormalAttack} className={actionButton}><Crosshair className="mr-1 inline h-3.5 w-3.5" /> Normal Attack</button>
            <button type="button" onClick={useSkill} className={actionButton}><Zap className="mr-1 inline h-3.5 w-3.5" /> Elemental Skill</button>
            <button type="button" onClick={useBurst} className={actionButton}><Sparkles className="mr-1 inline h-3.5 w-3.5" /> Elemental Burst</button>
            <button type="button" onClick={useSpecialUltimate} className={`${actionButton} border-fuchsia-400/30 text-fuchsia-200`}><Swords className="mr-1 inline h-3.5 w-3.5" /> Special Ultimate Test</button>
            <button type="button" onClick={switchCharacter} className={actionButton}>Switch Character</button>
            <button type="button" onClick={advanceOneSecond} className={actionButton}><Clock3 className="mr-1 inline h-3.5 w-3.5" /> Advance 1s</button>
          </div>
          <button type="button" onClick={resetLab} className={`${actionButton} w-full text-rose-300`}>Reset</button>
        </section>

        <section className="min-w-0 space-y-4">
          <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-[#080d18] p-5 md:min-h-[500px]">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
            {partyEffects.effects.some(effect => effect.kind === 'reaction-field') && <div className="absolute inset-[12%] rounded-full border border-emerald-400/50 bg-emerald-500/5 shadow-[0_0_40px_rgba(74,222,128,0.15)]" />}
            {partyEffects.effects.some(effect => effect.kind === 'whirlpool') && <div className="absolute inset-[22%] animate-spin rounded-full border-2 border-dashed border-cyan-300/60" />}
            {partyEffects.effects.some(effect => effect.kind === 'electric-field') && <div className="absolute inset-[18%] rounded-full border border-violet-300/70 bg-violet-500/5 shadow-[0_0_45px_rgba(192,132,252,0.18)]" />}

            <div className="relative z-10 flex h-full min-h-[320px] flex-col items-center justify-center md:min-h-[460px]">
              <div className="mb-5 w-full max-w-xl">
                <div className="mb-2 flex items-end justify-between text-[9px] font-black uppercase tracking-wider">
                  <span>{enemy.targetClass} target #{enemy.spawnId}</span>
                  <span className="text-rose-300">Enemy HP {enemy.hp.toLocaleString()} / {enemy.maxHp.toLocaleString()}</span>
                </div>
                <div className="h-3 overflow-hidden rounded bg-black/60 ring-1 ring-white/10">
                  <div className="h-full bg-gradient-to-r from-rose-600 to-amber-400 transition-[width] duration-300" style={{ width: `${hpPercent}%` }} />
                </div>
              </div>

              <div
                className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/20 text-4xl font-black shadow-[0_0_45px_rgba(56,189,248,0.15)] md:h-40 md:w-40"
                style={{ backgroundColor: `${elementColor[character.element]}22`, borderColor: elementColor[character.element] }}
              >
                {enemy.hp > 0 ? enemy.targetClass.charAt(0).toUpperCase() : 'KO'}
                {enemy.statuses.map((status, index) => (
                  <span key={status.id} className="absolute rounded-full border border-white/15 bg-black/80 px-2 py-1 text-[8px] uppercase text-slate-200" style={{ top: `${-12 + index * 24}px` }}>
                    {status.type} {status.remainingDuration.toFixed(1)}s
                  </span>
                ))}
              </div>

              <div className="mt-7 max-w-xl text-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm font-black uppercase">{kit.normalAttack.name}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-sm font-black uppercase text-cyan-300">{kit.skill.name}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-sm font-black uppercase text-amber-300">{kit.burst.name}</span>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{kit.identity}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {[
              ['Enemy HP', `${enemy.hp.toLocaleString()} / ${enemy.maxHp.toLocaleString()}`],
              ['Movement Speed', `${Math.round(getStatusMovementMultiplier(enemy.statuses) * 100)}%`],
              ['Outgoing Damage', `${Math.round(getStatusOutgoingDamageMultiplier(enemy.statuses) * fieldModifiers.enemyDamageMultiplier * 100)}%`],
              ['Active Aura', enemy.activeElements.join(' + ') || 'None'],
              ['Active Statuses', statusSummary],
              ['Party Shield', `${partyEffects.shield?.currentHp ?? 0} / ${partyEffects.shield?.maxHp ?? 3000}`],
              ['Active Fields', fieldSummary],
              ['Reaction Multiplier', `${fieldModifiers.reactionMultiplier.toFixed(1)}x`],
              ['Last Reaction Source', lastReactionSource],
              ['Last Reaction', lastReaction]
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg border border-white/10 bg-[#0a0f1d] p-3">
                <span className="block text-[8px] font-black uppercase tracking-wider text-slate-500">{label}</span>
                <span className="mt-1 block break-words text-[10px] font-bold text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex min-h-[300px] flex-col rounded-lg border border-white/10 bg-[#0a0f1d] p-4 lg:max-h-[calc(100dvh-7rem)]">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-wider">Combat Event Log</h2>
          </div>
          <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {eventLog.map((entry, index) => (
              <div key={`${entry}-${index}`} className="rounded-md border border-white/5 bg-black/30 px-3 py-2 text-[9px] leading-relaxed text-slate-400">
                {entry}
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-[8px] font-black uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Effects survive switch</span>
            <span className="flex items-center gap-1"><Swords className="h-3 w-3" /> Boss CC immune</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
