import React, { useState, useEffect } from 'react';
import { ElementType } from '../types';
import { ChevronRight, ChevronsRight } from 'lucide-react';
import { motion } from 'motion/react';

export interface StoryDialogueLine {
  speaker: string;
  text: string;
  element?: ElementType;
  portraitSide?: 'left' | 'right';
  effect?: 'fade-in' | 'shake' | 'flash';
}

interface StoryDialogueProps {
  key?: React.Key;
  line: StoryDialogueLine;
  onNext: () => void;
  onSkip: () => void;
}

export default function StoryDialogue({ line, onNext, onSkip }: StoryDialogueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    setCurrentIndex(0);
    setIsTyping(true);
  }, [line.text]);

  useEffect(() => {
    if (currentIndex >= line.text.length) {
      setIsTyping(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 15);

    return () => clearTimeout(timer);
  }, [currentIndex, line.text]);

  const displayedText = line.text.slice(0, currentIndex);

  const handleBoxClick = () => {
    if (isTyping) {
      // Complete typing instantly
      setCurrentIndex(line.text.length);
      setIsTyping(false);
    } else {
      onNext();
    }
  };

  // Helper for element border & name color
  const getElementStyles = (elem?: ElementType) => {
    switch (elem) {
      case 'Pyro': return { text: 'text-orange-400', border: 'border-orange-500/50', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.25)]', bg: 'bg-orange-500' };
      case 'Hydro': return { text: 'text-sky-400', border: 'border-sky-500/50', glow: 'shadow-[0_0_15px_rgba(56,189,248,0.25)]', bg: 'bg-sky-500' };
      case 'Cryo': return { text: 'text-cyan-300', border: 'border-cyan-400/50', glow: 'shadow-[0_0_15px_rgba(103,232,249,0.25)]', bg: 'bg-cyan-400' };
      case 'Electro': return { text: 'text-purple-400', border: 'border-purple-500/50', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.25)]', bg: 'bg-purple-500' };
      case 'Anemo': return { text: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.25)]', bg: 'bg-emerald-500' };
      case 'Geo': return { text: 'text-amber-400', border: 'border-amber-500/50', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]', bg: 'bg-amber-500' };
      case 'Dendro': return { text: 'text-green-400', border: 'border-green-500/50', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.25)]', bg: 'bg-green-500' };
      default: return { text: 'text-indigo-400', border: 'border-indigo-500/30', glow: 'shadow-none', bg: 'bg-indigo-600' };
    }
  };

  const elemStyles = getElementStyles(line.element);

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 z-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-auto flex flex-col items-center">
      {/* Dialogue Area Container */}
      <div className="max-w-3xl w-full flex flex-col gap-3 relative">
        
        {/* Skip Cutscene Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          className="self-end px-3 py-1 bg-black/55 hover:bg-slate-900 border border-white/10 hover:border-amber-400/40 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 transition-all duration-100 cursor-pointer"
        >
          <span>Skip Dialogue</span>
          <ChevronsRight className="w-3 h-3 text-amber-400 animate-pulse" />
        </button>

        {/* dialogue box frame */}
        <div 
          onClick={handleBoxClick}
          className={`glass-hud w-full p-4 md:p-5 rounded-2xl border ${elemStyles.border} ${elemStyles.glow} hover:bg-slate-900/60 active:scale-[0.99] cursor-pointer transition-all duration-200 flex gap-4 items-start select-none min-h-[110px] md:min-h-[130px]`}
        >
          {/* Left Speaker Portrait */}
          {line.portraitSide !== 'right' && (
            <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl flex items-center justify-center text-slate-950 text-xl md:text-3xl font-black shadow-md border ${elemStyles.border} ${elemStyles.bg}`}>
              {line.speaker.charAt(0)}
            </div>
          )}

          {/* Dialogue Text Content */}
          <div className="flex-1 flex flex-col gap-1 md:gap-1.5 overflow-hidden">
            {/* Speaker Name Tag */}
            <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider font-display ${elemStyles.text}`}>
              {line.speaker}
            </span>
            {/* Dialogue text box */}
            <p className="text-[11px] md:text-sm text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-line break-words">
              {displayedText}
              {isTyping && <span className="inline-block w-1.5 h-3 bg-amber-400 ml-0.5 animate-pulse" />}
            </p>
          </div>

          {/* Right Speaker Portrait */}
          {line.portraitSide === 'right' && (
            <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl flex items-center justify-center text-slate-950 text-xl md:text-3xl font-black shadow-md border ${elemStyles.border} ${elemStyles.bg}`}>
              {line.speaker.charAt(0)}
            </div>
          )}

          {/* Indicator that text is done */}
          {!isTyping && (
            <div className="self-end shrink-0 text-amber-400 animate-bounce">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
