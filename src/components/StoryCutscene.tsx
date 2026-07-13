import React, { useState, useEffect } from 'react';
import StoryDialogue from './StoryDialogue';
import { motion, AnimatePresence } from 'motion/react';
import type { StoryChoiceDefinition, StoryScene } from '../data/story';
import StoryChoicePrompt from './StoryChoicePrompt';
import { getStoryArtwork } from '../data/story/artwork';
import type { StoryBackgroundId } from '../data/story';

interface StoryCutsceneProps {
  scene: StoryScene;
  choice?: StoryChoiceDefinition;
  onChoice?: (decisionId: string, optionId: string) => void;
  onComplete: () => void;
  backgroundGradient?: string; // Optional custom background
}

export default function StoryCutscene({ scene, choice, onChoice, onComplete, backgroundGradient }: StoryCutsceneProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [failedArtworkId, setFailedArtworkId] = useState<StoryBackgroundId | null>(null);

  const slides = scene.slides;
  const currentLine = slides[currentIndex];
  const artwork = scene.backgroundId ? getStoryArtwork(scene.backgroundId) : undefined;
  const hasArtwork = Boolean(artwork && failedArtworkId !== scene.backgroundId);

  // Handle slide effects (shake, flash)
  useEffect(() => {
    if (!currentLine) return;

    if (currentLine.effect === 'shake') {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 400);
      return () => clearTimeout(timer);
    }

    if (currentLine.effect === 'flash') {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentLine]);

  if (!currentLine) {
    onComplete();
    return null;
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (choice) {
      setIsChoosing(true);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (choice) {
      setIsChoosing(true);
    } else {
      onComplete();
    }
  };

  const handleChoice = (decisionId: string, optionId: string) => {
    if (onChoice) {
      onChoice(decisionId, optionId);
      return;
    }
    onComplete();
  };

  const defaultBg = backgroundGradient || "from-indigo-950 via-slate-900 to-black";

  return (
    <div className={`fixed inset-0 z-[60] flex max-h-[100dvh] items-center justify-center overflow-hidden bg-slate-950 select-none ${isShaking ? 'animate-shake' : ''}`}>
      {/* Gradient remains mounted as a fast fallback while artwork loads. */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${defaultBg}`}>
        {!hasArtwork && (
          <>
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
          </>
        )}
      </div>

      {hasArtwork && artwork && (
        <>
          <img
            src={artwork.src}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            onError={() => setFailedArtworkId(scene.backgroundId ?? null)}
            className="absolute inset-0 h-full w-full object-cover [object-position:var(--story-mobile-position)] md:[object-position:var(--story-desktop-position)]"
            style={{
              objectPosition: artwork.mobilePosition,
              '--story-mobile-position': artwork.mobilePosition,
              '--story-desktop-position': artwork.desktopPosition,
            } as React.CSSProperties}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.34)_52%,rgba(2,6,23,0.88)_100%)]"
          />
        </>
      )}

      {/* Screen flash overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-45 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Narrative Portrayal Visual Scene */}
      <div className="relative flex h-full w-full max-w-4xl flex-col items-center justify-center px-4 pb-36 sm:px-6 sm:pb-40 md:pb-48 landscape:pb-28">
        
        {/* Animated Speaker Avatar representation in center of screen */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-2 md:gap-4 text-center mt-2 md:mt-12"
          >
            {/* Visual circle indicating speaker */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-900 bg-gradient-to-tr from-amber-400 to-indigo-500 text-3xl font-black text-slate-950 shadow-2xl sm:h-28 sm:w-28 sm:text-4xl md:h-40 md:w-40 md:text-6xl landscape:h-20 landscape:w-20 landscape:text-3xl">
              {currentLine.speaker.charAt(0)}
            </div>
            
            {/* Subdued name indicator */}
            <div className="bg-black/55 border border-white/5 px-4 py-1.5 rounded-full text-slate-300 font-mono text-[9px] md:text-xs uppercase tracking-widest">
              💬 {currentLine.speaker} speaking...
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dialogue Bottom Box overlay */}
      {isChoosing && choice ? (
        <StoryChoicePrompt choice={choice} onChoice={handleChoice} />
      ) : (
        <StoryDialogue
          key={currentIndex}
          line={currentLine}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      )}
    </div>
  );
}
