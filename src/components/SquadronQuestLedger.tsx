import React, { useState, useEffect } from 'react';
import { Quest } from '../types';
import { CheckCircle2, Circle, Sparkles, Coins, Trophy, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AetheriaAudioEngine } from '../utils/audio';
import { QuestCompletionAnnouncement, QuestCompletionStamp, useQuestCompletionPresentation } from './QuestCompletionPresentation';
import './QuestCompletion.css';
import SlidingTabMarker from './ui/SlidingTabMarker';

interface SquadronQuestLedgerProps {
  activeQuests: Quest[];
  completedQuestIds?: string[];
  onClaimQuestReward: (questId: string) => void;
  onClaimAllQuestRewards: () => void;
  layout: 'sidebar' | 'full';
}

export default function SquadronQuestLedger({ activeQuests, completedQuestIds, onClaimQuestReward, onClaimAllQuestRewards, layout }: SquadronQuestLedgerProps) {
  const reducedMotion = useReducedMotion();
  const { rows, announcement, requestClaims } = useQuestCompletionPresentation(activeQuests, completedQuestIds);
  const [showDescId, setShowDescId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'normal'>(() => {
    if (activeQuests.some(q => q.group === 'daily' && !q.completed)) return 'daily';
    if (activeQuests.some(q => q.group === 'daily')) return 'daily';
    if (activeQuests.some(q => q.group === 'weekly' && !q.completed)) return 'weekly';
    if (activeQuests.some(q => q.group === 'weekly')) return 'weekly';
    return 'normal';
  });

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (activeTab === 'normal') return;

    const updateTimer = () => {
      const now = new Date();
      if (activeTab === 'daily') {
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const diff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      } else if (activeTab === 'weekly') {
        const day = now.getDay();
        const daysUntilMonday = day === 0 ? 1 : 8 - day;
        const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday, 0, 0, 0);
        const diff = nextMonday.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);


  const dailyQuests = activeQuests.filter(q => q.group === 'daily');
  const weeklyQuests = activeQuests.filter(q => q.group === 'weekly');
  const campaignQuests = activeQuests.filter(q => q.group === 'normal' || !q.group);

  const getTabCount = (tab: 'daily' | 'weekly' | 'normal') => {
    if (tab === 'daily') return dailyQuests.length;
    if (tab === 'weekly') return weeklyQuests.length;
    return campaignQuests.length;
  };

  const currentQuests = rows.filter(({ quest }) => activeTab === 'normal'
    ? quest.group === 'normal' || !quest.group
    : quest.group === activeTab);
  const claimableCount = activeQuests.filter(q => q.completed).length;

  const handleClaimQuest = (questId: string) => {
    requestClaims([questId]);
    onClaimQuestReward(questId);
  };

  const handleClaimAll = () => {
    requestClaims(activeQuests.filter(quest => quest.completed).map(quest => quest.id));
    onClaimAllQuestRewards();
    AetheriaAudioEngine.playClick();
  };

  const handleTabClick = (tab: 'daily' | 'weekly' | 'normal') => {
    setActiveTab(tab);
    AetheriaAudioEngine.playClick();
  };

  if (layout === 'sidebar') {
    return (
      <div className="quest-completion-ledger min-w-0 bg-[#0b0f19]/70 border-l-4 border-l-amber-400 border-y border-r border-white/10 p-5 rounded-r-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col gap-4">
        <QuestCompletionAnnouncement announcement={announcement} />
        {/* Header */}
        <div className="flex flex-wrap gap-2 items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-amber-400 rounded-sm"></div>
            <h3 className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none font-display">
              Squadron Quest Ledger ({activeQuests.length} Remaining)
            </h3>
          </div>
          {claimableCount > 0 ? (
            <button
              data-reward-source="quest-claim-all"
              onClick={handleClaimAll}
              className="text-[8px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider transition-all duration-100 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_8px_rgba(52,211,153,0.3)] animate-pulse"
            >
              CLAIM ALL ({claimableCount})
            </button>
          ) : (
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-mono">
              No Claims
            </span>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="menu-tab-rail flex bg-black/40 border border-white/5 p-1 rounded-lg gap-1">
          {(['daily', 'weekly', 'normal'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'daily' ? 'DAILY' : tab === 'weekly' ? 'WEEKLY' : 'CAMPAIGN';
            return (
              <button
                key={tab}
                aria-pressed={isActive}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 py-1.5 text-[9px] font-black rounded uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-202 hover:bg-white/5'
                }`}
              >
                {label} ({getTabCount(tab)})
              </button>
            );
          })}
          <SlidingTabMarker selection={activeTab} />
        </div>

        {activeTab !== 'normal' && (
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded-lg justify-center w-full shadow-sm">
            <span className="animate-pulse">🕒</span>
            <span className="font-bold uppercase tracking-wider">
              {activeTab === 'daily' ? 'Daily Reset In:' : 'Weekly Reset In:'}
            </span>
            <span className="font-black text-[10px]">{timeLeft}</span>
          </div>
        )}

        {/* Quest List */}
        <div className="relative space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {currentQuests.map(({ quest: q, key, claimed }) => {
              const pct = Math.min(100, (q.currentValue / q.targetValue) * 100);
              const isDaily = q.group === 'daily';
              const isWeekly = q.group === 'weekly';

              return (
                <motion.div
                  key={key}
                  layout={!reducedMotion}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                  data-quest-id={q.id}
                  data-quest-state={claimed ? 'claimed' : 'active'}
                  className="quest-completion-card p-3 bg-black/40 rounded-lg border border-white/5 flex flex-col gap-2 relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Difficulty Badge */}
                      {isDaily && (
                        <span className="inline-block text-[8px] font-black tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-1 py-0.2 rounded-sm uppercase">
                          Easy Daily
                        </span>
                      )}
                      {isWeekly && (
                        <span className="inline-block text-[8px] font-black tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-500/20 px-1 py-0.2 rounded-sm uppercase">
                          Medium Weekly
                        </span>
                      )}
                      {!isDaily && !isWeekly && (
                        <span className="inline-block text-[8px] font-black tracking-wider text-rose-400 bg-rose-950/20 border border-rose-500/20 px-1 py-0.2 rounded-sm uppercase">
                          Hard Campaign
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <span className="min-w-0 break-words text-[10.5px] font-black text-slate-100 block leading-tight uppercase font-display tracking-wide">
                          {q.name.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDescId(showDescId === q.id ? null : q.id);
                          }}
                          className="shrink-0 text-slate-500 hover:text-slate-350 p-0.5 transition-colors cursor-pointer"
                          title="Show Description"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
                      </div>
                      {showDescId === q.id && (
                        <span className="text-[9.5px] text-slate-400 leading-normal block bg-black/40 p-2 rounded border border-white/5 mt-1 font-mono">
                          {q.desc}
                        </span>
                      )}
                    </div>

                    {q.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-700 shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Progress bar info */}
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 mt-1">
                    <div className="bg-slate-950 rounded-sm flex-1 h-2 overflow-hidden border border-white/5">
                      <div
                        data-quest-progress
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-350"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-bold font-mono text-slate-200 shrink-0">
                      {q.currentValue.toLocaleString()}/{q.targetValue.toLocaleString()}
                    </span>
                  </div>

                  {/* Claim reward link */}
                  <div className="quest-completion-reward-row flex justify-between items-center pt-2 border-t border-white/5">
                    <div className="quest-completion-rewards text-[8.5px] text-slate-400 flex items-center gap-1.5 font-sans leading-none">
                      <span className="uppercase text-[8px] tracking-wider text-slate-500">REWARDS:</span>
                      <span className="text-sky-400 font-bold flex items-center gap-0.5">
                        +{q.rewardTokens}G
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        +{q.rewardMora.toLocaleString()} Mora
                      </span>
                    </div>

                    {claimed ? <QuestCompletionStamp /> : q.completed ? (
                      <button
                        data-reward-source={`quest-${q.id}`}
                        onClick={() => handleClaimQuest(q.id)}
                        className="bg-amber-400 hover:bg-amber-350 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        CLAIM NOW
                      </button>
                    ) : (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {currentQuests.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              All quests in this category completed!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full Screen / Wide Layout (for Quest tab)
  return (
    <div className="quest-completion-ledger min-w-0 bg-[#0b0f19]/80 border border-white/10 p-6 md:p-8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col gap-6">
      <QuestCompletionAnnouncement announcement={announcement} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-amber-400 rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-[#f8fafc] uppercase tracking-widest leading-none font-display flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
              Squadron Quest Ledger
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">
              Active Objectives Remaining: {activeQuests.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {claimableCount > 0 && (
            <button
              data-reward-source="quest-claim-all"
              onClick={handleClaimAll}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-lg uppercase tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.35)] flex items-center gap-1.5 animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              CLAIM ALL REWARDS ({claimableCount})
            </button>
          )}
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="menu-tab-rail flex bg-black/45 border border-white/10 p-1.5 rounded-xl gap-2 w-full max-w-lg">
        {(['daily', 'weekly', 'normal'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'daily' ? 'DAILY' : tab === 'weekly' ? 'WEEKLY' : 'CAMPAIGN';
          return (
            <button
              key={tab}
              aria-pressed={isActive}
              onClick={() => handleTabClick(tab)}
              className={`min-w-0 flex-1 py-2.5 px-1 sm:px-4 text-xs font-black rounded-lg uppercase tracking-widest transition-all cursor-pointer flex flex-wrap items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                  : 'text-slate-400 hover:text-slate-202 hover:bg-white/5'
              }`}
            >
              <span>{label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-white/5 text-slate-400'}`}>
                {getTabCount(tab)}
              </span>
            </button>
          );
        })}
        <SlidingTabMarker selection={activeTab} />
      </div>

      {activeTab !== 'normal' && (
        <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3.5 py-2.5 rounded-xl justify-center w-full max-w-lg shadow-sm">
          <span className="animate-pulse">🕒</span>
          <span className="font-bold uppercase tracking-wider">
            {activeTab === 'daily' ? 'Daily Reset In:' : 'Weekly Reset In:'}
          </span>
          <span className="font-black text-[11.5px]">{timeLeft}</span>
        </div>
      )}

      {/* Quest Cards Grid */}
      <div className="relative space-y-4 max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {currentQuests.map(({ quest: q, key, claimed }) => {
            const pct = Math.min(100, (q.currentValue / q.targetValue) * 100);
            const isDaily = q.group === 'daily';
            const isWeekly = q.group === 'weekly';

            return (
              <motion.div
                key={key}
                layout={!reducedMotion}
                initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                data-quest-id={q.id}
                data-quest-state={claimed ? 'claimed' : 'active'}
                className="quest-completion-card p-5 bg-black/40 rounded-xl border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {/* Difficulty Badge */}
                      {isDaily && (
                        <span className="text-[9px] font-black tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                          Easy Daily
                        </span>
                      )}
                      {isWeekly && (
                        <span className="text-[9px] font-black tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                          Medium Weekly
                        </span>
                      )}
                      {!isDaily && !isWeekly && (
                        <span className="text-[9px] font-black tracking-wider text-rose-400 bg-rose-950/20 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                          Hard Campaign
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide font-display flex items-center gap-1.5 mt-1">
                      <span className="min-w-0 break-words">{q.name.toUpperCase()}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDescId(showDescId === q.id ? null : q.id);
                        }}
                        className="shrink-0 text-slate-500 hover:text-slate-355 p-0.5 transition-colors cursor-pointer"
                        title="Show Description"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </h3>
                    {showDescId === q.id && (
                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl bg-black/40 p-3 rounded-lg border border-white/5 mt-1.5 font-mono">
                        {q.desc}
                      </p>
                    )}
                  </div>

                  {q.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Progress bar info */}
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="bg-slate-950 rounded-full flex-1 h-2.5 overflow-hidden border border-white/5">
                    <div
                      data-quest-progress
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-350"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-bold font-mono text-slate-200 shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                    {q.currentValue.toLocaleString()} / {q.targetValue.toLocaleString()}
                  </span>
                </div>

                {/* Claim reward link */}
                <div className="quest-completion-reward-row flex justify-between items-center pt-3 border-t border-white/5 mt-1">
                  <div className="quest-completion-rewards text-xs text-slate-400 flex items-center gap-2 font-sans leading-none">
                    <span className="uppercase text-[10px] tracking-wider text-slate-500 font-bold">REWARDS:</span>
                    <span className="text-sky-400 font-black flex items-center gap-1 bg-sky-950/20 border border-sky-500/10 px-2.5 py-1 rounded font-mono">
                      <Sparkles className="w-3 h-3" /> +{q.rewardTokens}G
                    </span>
                    <span className="text-slate-605 font-bold">•</span>
                    <span className="text-amber-400 font-black flex items-center gap-1 bg-amber-950/20 border border-amber-500/10 px-2.5 py-1 rounded font-mono">
                      <Coins className="w-3 h-3" /> +{q.rewardMora.toLocaleString()} Mora
                    </span>
                  </div>

                  {claimed ? <QuestCompletionStamp /> : q.completed ? (
                    <button
                      data-reward-source={`quest-${q.id}`}
                      onClick={() => handleClaimQuest(q.id)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.35)]"
                    >
                      CLAIM NOW
                    </button>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg">
                      IN PROGRESS
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {currentQuests.length === 0 && (
          <div className="text-center py-20 text-slate-500 text-sm italic border border-dashed border-white/5 rounded-xl bg-black/20">
            ☀️ All quests in this category have been successfully resolved!
          </div>
        )}
      </div>
    </div>
  );
}
