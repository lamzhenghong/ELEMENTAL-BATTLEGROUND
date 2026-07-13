import React, { useMemo, useState } from 'react';
import { BookMarked, LockKeyhole, MapPin } from 'lucide-react';
import type { StoryMemoryEntry } from '../data/story';

interface StoryMemoryArchiveProps {
  entries: readonly StoryMemoryEntry[];
  unlockedLoreEntries: readonly string[];
}

type MemoryFilter = StoryMemoryEntry['category'];

export default function StoryMemoryArchive({ entries, unlockedLoreEntries }: StoryMemoryArchiveProps) {
  const [filter, setFilter] = useState<MemoryFilter>('campaign');
  const unlockedIds = useMemo(() => new Set(unlockedLoreEntries), [unlockedLoreEntries]);
  const visibleEntries = entries.filter((entry) => entry.category === filter);
  const unlockedCount = entries.filter((entry) => unlockedIds.has(entry.id)).length;

  return (
    <section aria-labelledby="memory-archive-title" className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300">Recovered records</p>
          <h2 id="memory-archive-title" className="mt-1 text-xl font-black uppercase text-white sm:text-2xl">Memory Archive</h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400">
            Clear authored campaign stages and character acts to recover lore memories. Archive entries are narrative only and grant no combat power.
          </p>
        </div>
        <div className="shrink-0 font-mono text-[10px] font-black uppercase tracking-wider text-amber-300">
          {unlockedCount} / {entries.length} Recovered
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:flex" role="group" aria-label="Memory archive filters">
        {([
          ['campaign', 'Campaign Memories'],
          ['character', 'Character Memories'],
        ] as const).map(([category, label]) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            aria-pressed={filter === category}
            className={`min-h-12 touch-manipulation rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
              filter === category
                ? 'border-indigo-300 bg-indigo-500 text-white'
                : 'border-white/10 bg-slate-950/50 text-slate-400 hover:border-white/25 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visibleEntries.map((entry) => {
          const isUnlocked = unlockedIds.has(entry.id);
          return (
            <article
              key={entry.id}
              className={`min-h-44 rounded-lg border p-4 sm:p-5 ${
                isUnlocked ? 'border-indigo-400/25 bg-slate-900/65' : 'border-white/5 bg-slate-950/35'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-md border p-2 ${isUnlocked ? 'border-indigo-400/30 text-indigo-300' : 'border-white/5 text-slate-700'}`}>
                  {isUnlocked ? <BookMarked className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {isUnlocked ? entry.sourceLabel : 'Memory signal locked'}
                  </p>
                  <h3 className={`mt-1 font-black uppercase ${isUnlocked ? 'text-white' : 'text-slate-700 blur-[2px]'}`}>
                    {isUnlocked ? entry.title : 'Unrecovered Memory'}
                  </h3>
                </div>
              </div>

              {isUnlocked ? (
                <div className="mt-4 space-y-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    <MapPin className="h-3.5 w-3.5" />
                    {entry.location}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-300">{entry.text}</p>
                </div>
              ) : (
                <p className="mt-5 text-xs leading-relaxed text-slate-700">
                  Clear the memory's story encounter to restore this record.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
