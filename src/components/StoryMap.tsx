import { Lock, Skull, Star } from 'lucide-react';
import { getStageSpec } from '../data/storyStages';
import { getStoryArtwork } from '../data/story/artwork';
import type { StoryBackgroundId } from '../data/story/types';
import { getArenaLocation } from '../utils/arenaLocation';
import ElementSigil from './ElementSigil';

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
  hardModeCompletedStages,
}: StoryMapProps) {
  const completed = isHardMode ? hardModeCompletedStages : completedStages;
  const stages = [1, 2, 3, 4, 5].map(index => `${chapter}-${index}`);
  const artwork = getStoryArtwork(`chapter-${chapter}` as StoryBackgroundId);
  const location = getArenaLocation({ storyStageId: `${chapter}-1` });
  const finishedCount = stages.filter(stageId => completed.includes(stageId)).length;

  const isUnlocked = (index: number) => {
    if (devCheatsEnabled) return true;
    if (index > 0) return completed.includes(stages[index - 1]);
    if (chapter === 1) return true;
    return completed.includes(`${chapter - 1}-5`);
  };

  return (
    <section className="relative isolate overflow-hidden rounded-lg border border-white/15 bg-[#070d16] shadow-inner" aria-label={`${location.name} campaign journey`}>
      <img src={artwork.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover md:hidden" style={{ objectPosition: artwork.mobilePosition }} />
      <img src={artwork.src} alt="" loading="lazy" className="absolute inset-0 hidden h-full w-full object-cover md:block" style={{ objectPosition: artwork.desktopPosition }} />
      <div className="absolute inset-0 bg-[#06101b]/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050b14]/95 via-transparent to-[#050b14]/60" />
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/15 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{isHardMode ? 'Hard Story Campaign' : 'Story Campaign'} / Chapter {String(chapter).padStart(2, '0')}</p>
          <h4 className="mt-0.5 truncate font-display text-base font-black uppercase text-white md:text-xl">{location.name}</h4>
        </div>
        <span className="shrink-0 border-l border-white/20 pl-3 font-mono text-xs font-black text-white md:pl-5" aria-label={`${finishedCount} of 5 stages complete`}>
          <span style={{ color: location.accent }}>{finishedCount}</span> / 5
        </span>
      </div>

      <ol className="relative z-10 grid grid-cols-1 gap-1 px-3 py-4 md:min-h-[275px] md:grid-cols-5 md:items-center md:gap-2 md:px-5 md:py-7">
        {stages.map((stageId, index) => {
          const spec = getStageSpec(stageId);
          const unlocked = isUnlocked(index);
          const done = completed.includes(stageId);
          const boss = spec.difficulty === 'Boss';
          const stars = starRatings[stageId] || 0;
          const element = spec.enemies.find(enemy => enemy.element)?.element ?? 'Anemo';
          const nextDone = index < 4 && completed.includes(stageId);
          const nodeColor = done ? location.accent : boss ? '#f39c9c' : location.accent;

          return (
            <li key={stageId} className="relative flex min-w-0 items-center gap-3 py-2 md:flex-col md:gap-3 md:py-0">
              {index < 4 && (
                <>
                  <span className="pointer-events-none absolute left-[27px] top-[63px] h-[calc(100%-16px)] w-px md:hidden" style={{ background: nextDone ? location.accent : '#ffffff38' }} />
                  <span className="pointer-events-none absolute left-[calc(50%+30px)] top-[29px] hidden h-px w-[calc(100%-38px)] md:block" style={{ background: nextDone ? location.accent : '#ffffff38' }} />
                </>
              )}
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectStage(stageId)}
                aria-label={`${spec.name}, ${done ? `${stars} of 3 stars` : unlocked ? 'available' : 'locked'}`}
                className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-[#0c1421]/90 shadow-lg transition-transform duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white ${unlocked ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-60'}`}
                style={{ borderColor: unlocked ? nodeColor : '#64748b66', boxShadow: unlocked && done ? `0 0 16px ${location.accent}55` : undefined }}
              >
                {!unlocked ? <Lock className="h-5 w-5 text-slate-400" /> : boss ? <Skull className="h-6 w-6" style={{ color: nodeColor }} /> : <ElementSigil element={element} className="h-6 w-6" />}
              </button>
              <div className="min-w-0 rounded border border-white/10 bg-[#07101b]/80 px-2.5 py-1.5 md:w-full md:max-w-[180px] md:text-center">
                <span className="block font-mono text-[10px] font-black uppercase tracking-wide" style={{ color: unlocked ? nodeColor : '#94a3b8' }}>
                  {boss ? 'Boss Gate' : `Stage ${index + 1}`}{done ? ' / Cleared' : ''}
                </span>
                <span className="mt-0.5 block text-xs font-semibold leading-snug text-white/90 md:min-h-[2.25rem]">{spec.name}</span>
                {unlocked && <span className="mt-1 flex gap-0.5 md:justify-center" aria-label={`${stars} of 3 stars`}>
                  {[1, 2, 3].map(star => <Star key={star} className={`h-3 w-3 ${star <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />)}
                </span>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
