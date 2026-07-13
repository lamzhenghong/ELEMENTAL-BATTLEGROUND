import React from 'react';
import { getStageSpec } from '../data/storyStages';
import { Star, Lock, Swords, Skull } from 'lucide-react';
import { motion } from 'motion/react';

interface StoryMapProps {
  chapter: number;
  completedStages: string[];
  starRatings: Record<string, number>;
  onSelectStage: (stageId: string) => void;
  devCheatsEnabled: boolean;
  isHardMode: boolean;
  hardModeCompletedStages: string[];
}

export default function StoryMap({
  chapter,
  completedStages,
  starRatings,
  onSelectStage,
  devCheatsEnabled,
  isHardMode,
  hardModeCompletedStages
}: StoryMapProps) {
  
  // Stages in chapter: 1 to 5
  const stages = [1, 2, 3, 4, 5].map((s) => `${chapter}-${s}`);

  // Helper to determine if a stage is unlocked
  const isStageUnlocked = (stageId: string, idx: number) => {
    if (devCheatsEnabled) return true;
    if (idx === 0) {
      if (chapter === 1) return true;
      // Chapter N-1 stage 5 must be completed to unlock Chapter N-1 stage 5 or Chapter N stage 1
      const prevChapterLastStage = `${chapter - 1}-5`;
      if (isHardMode) {
        return hardModeCompletedStages.includes(prevChapterLastStage);
      }
      return completedStages.includes(prevChapterLastStage);
    }
    // Previous stage in same chapter must be completed
    const prevStage = `${chapter}-${idx}`;
    if (isHardMode) {
      return hardModeCompletedStages.includes(prevStage);
    }
    return completedStages.includes(prevStage);
  };

  // Node absolute coordinates (in percent) to plot a curved path
  const nodePositions = [
    { left: '12%', top: '65%' },
    { left: '32%', top: '35%' },
    { left: '52%', top: '55%' },
    { left: '72%', top: '25%' },
    { left: '88%', top: '50%' }
  ];

  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-slate-950/40 rounded-2xl border border-white/10 overflow-hidden select-none shadow-inner">
      {/* SVG connection lines between nodes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <path
          d="M 12 65 Q 32 35, 52 55 T 88 50"
          fill="none"
          stroke="rgba(99, 102, 241, 0.15)"
          strokeWidth="6"
          strokeLinecap="round"
          className="hidden md:block"
          style={{ pathLength: 1 }}
        />
        <path
          d="M 12 65 Q 32 35, 52 55 T 88 50"
          fill="none"
          stroke="rgba(251, 191, 36, 0.3)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="8,6"
          className="hidden md:block animate-[dash_10s_linear_infinite]"
        />
      </svg>

      {/* Nodes mapping */}
      {stages.map((stageId, idx) => {
        const pos = nodePositions[idx];
        const nodeLeft = idx === 0 ? 'max(12%, 78px)'
          : idx === 4 ? 'min(88%, calc(100% - 62px))'
          : pos.left;
        const unlocked = isStageUnlocked(stageId, idx);
        const spec = getStageSpec(stageId);
        const isBoss = spec.difficulty === 'Boss';
        
        const completed = isHardMode 
          ? hardModeCompletedStages.includes(stageId)
          : completedStages.includes(stageId);
        
        const stars = starRatings[stageId] || 0;

        // Determine node styling
        let borderClass = 'border-white/10 bg-slate-900 text-slate-500';
        let hoverClass = 'cursor-not-allowed';
        let glowClass = '';

        if (unlocked) {
          if (completed) {
            borderClass = 'border-amber-400/80 bg-slate-900/90 text-amber-400';
            hoverClass = 'hover:scale-105 active:scale-95 cursor-pointer hover:border-amber-400 hover:bg-slate-900';
            glowClass = 'shadow-[0_0_15px_rgba(251,191,36,0.25)]';
          } else {
            // Unlocked but not completed yet -> ACTIVE stage
            borderClass = isBoss 
              ? 'border-rose-500 bg-rose-950/40 text-rose-400 animate-pulse'
              : 'border-indigo-400 bg-indigo-950/40 text-indigo-300 animate-pulse';
            hoverClass = 'hover:scale-105 active:scale-95 cursor-pointer hover:bg-slate-900';
            glowClass = isBoss 
              ? 'shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'shadow-[0_0_20px_rgba(99,102,241,0.4)]';
          }
        }

        return (
          <div
            key={stageId}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
            style={{ left: nodeLeft, top: pos.top }}
          >
            {/* Stage title label above the node */}
            <span className={`text-[8.5px] md:text-[9.5px] font-mono tracking-wider uppercase font-black px-2 py-0.5 rounded shadow backdrop-blur-sm ${
              unlocked 
                ? completed 
                  ? 'bg-amber-500/10 border border-amber-400/30 text-amber-300' 
                  : isBoss 
                    ? 'bg-rose-500 text-white animate-bounce' 
                    : 'bg-indigo-500 text-white'
                : 'bg-slate-900/60 border border-white/5 text-slate-500'
            }`}>
              {spec.name}
            </span>

            {/* Clickable Node Sphere */}
            <div
              onClick={() => unlocked && onSelectStage(stageId)}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-150 ${borderClass} ${hoverClass} ${glowClass}`}
            >
              {unlocked ? (
                isBoss ? (
                  <Skull className="w-5 h-5 md:w-7 md:h-7 animate-pulse text-rose-500" />
                ) : (
                  <Swords className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                )
              ) : (
                <Lock className="w-4 h-4 md:w-5 md:h-5 text-slate-650" />
              )}
            </div>

            {/* Star ratings details below the node */}
            {unlocked && (
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${
                      s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
