import React from 'react';
import type { StoryChoiceDefinition } from '../data/story';

interface StoryChoicePromptProps {
  choice: StoryChoiceDefinition;
  onSelect: (optionId: string) => void;
}

export default function StoryChoicePrompt({ choice, onSelect }: StoryChoicePromptProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/75 p-2 sm:items-center sm:p-4">
      <div className="w-full max-w-3xl max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-lg border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md sm:max-h-[calc(100dvh-2rem)] sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Choose your response</p>
        <h2 className="mt-2 text-lg font-black text-white sm:text-xl">{choice.prompt}</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 landscape:grid-cols-2">
          {choice.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className="min-h-12 touch-manipulation rounded-lg border border-indigo-400/35 bg-indigo-950/70 px-4 py-3 text-left transition-colors hover:border-amber-300/70 hover:bg-indigo-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:bg-indigo-800"
            >
              <span className="block text-sm font-black text-white">{option.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-300">{option.consequence}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
