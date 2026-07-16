import React, { useEffect, useRef, useState } from 'react';
import { STORY_CHAPTERS, STORY_STAGES, getStageSpec, getStageDialogue, getCharacterStoryScript, getStoryChoice, getStoryScene } from '../data/storyStages';
import { STORY_MEMORIES } from '../data/story';
import type { StoryChoiceDefinition, StoryChoiceSelections, StoryScene } from '../data/story';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { ElementType, SaveState } from '../types';
import { Star, ShieldAlert, Award, Swords, Sparkles, BookOpen, User, Flame, ArrowRight, Lock, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StoryMap from './StoryMap';
import StoryStage from './StoryStage';
import StoryCutscene from './StoryCutscene';
import { AetheriaAudioEngine } from '../utils/audio';
import { normalizeStoryProgress } from '../data/story/progress';
import { applyStoryChoice } from '../storyChoiceRules';
import StoryMemoryArchive from './StoryMemoryArchive';

interface StoryModeProps {
  saveState: SaveState;
  onModifyCurrencies: (gems: number, mora: number, exp: number) => void;
  onAddItems: (itemType: 'char_xp' | 'ascension', amount: number) => void;
  onUpdateSaveState: (updater: (prev: SaveState) => SaveState) => void;
  onStartStoryBattle: (config: { stageId: string; isHardMode: boolean; isCharStory: boolean; choiceSelections: StoryChoiceSelections; charId?: string; act?: number }) => void;
  devCheatsEnabled: boolean;
  onShowAlert: (msg: string, sol: string, typ: 'error' | 'success' | 'info') => void;
}

export default function StoryMode({
  saveState,
  onModifyCurrencies,
  onAddItems,
  onUpdateSaveState,
  onStartStoryBattle,
  devCheatsEnabled,
  onShowAlert
}: StoryModeProps) {
  const [activeTab, setActiveTab] = useState<'campaign' | 'characters' | 'memories'>('campaign');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [isHardMode, setIsHardMode] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const chapterStripRef = useRef<HTMLDivElement | null>(null);
  const chapterCardRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Character Stories Sub-state
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [storySearchQuery, setStorySearchQuery] = useState('');
  const [storyRarityFilter, setStoryRarityFilter] = useState<'All' | 3 | 4 | 5>('All');
  const [storyElementFilter, setStoryElementFilter] = useState<'All' | ElementType>('All');

  // Visual Novel Cutscene overlay states
  const [activeCutsceneScene, setActiveCutsceneScene] = useState<StoryScene | null>(null);
  const [activeCutsceneChoice, setActiveCutsceneChoice] = useState<StoryChoiceDefinition | null>(null);
  const [cutsceneCallback, setCutsceneCallback] = useState<((choiceSelections: StoryChoiceSelections) => void) | null>(null);

  const storyProgress = normalizeStoryProgress(saveState.storyProgress);

  useEffect(() => {
    if (activeTab !== 'campaign') return;
    const chapterStrip = chapterStripRef.current;
    const selectedCard = chapterCardRefs.current.get(selectedChapter);
    if (!chapterStrip || !selectedCard) return;

    const stripRect = chapterStrip.getBoundingClientRect();
    const cardRect = selectedCard.getBoundingClientRect();
    const unclampedLeft = chapterStrip.scrollLeft
      + cardRect.left
      - stripRect.left
      - (chapterStrip.clientWidth - cardRect.width) / 2;
    const targetLeft = Math.max(
      0,
      Math.min(unclampedLeft, chapterStrip.scrollWidth - chapterStrip.clientWidth)
    );

    chapterStrip.scrollTo({
      left: targetLeft,
      behavior: 'smooth'
    });
  }, [activeTab, selectedChapter]);

  // Helper: completion percentage of a chapter
  const getChapterCompletionPct = (chapId: number) => {
    const totalStages = 5;
    const completedInChap = [1, 2, 3, 4, 5].filter((s) => {
      const stageId = `${chapId}-${s}`;
      return storyProgress.completedStages.includes(stageId);
    }).length;
    return Math.round((completedInChap / totalStages) * 100);
  };

  // Helper: total stars in a chapter
  const getChapterStars = (chapId: number) => {
    return [1, 2, 3].reduce((sum, s) => {
      return sum + [1, 2, 3, 4, 5].reduce((innerSum, stg) => {
        const rating = storyProgress.starRatings[`${chapId}-${stg}`] || 0;
        return innerSum + (rating >= s ? 1 : 0);
      }, 0);
    }, 0);
  };

  // Helper: check if a chapter is unlocked
  const isChapterUnlocked = (chapId: number) => {
    if (devCheatsEnabled || chapId === 1) return true;
    // Chapter N-1 stage 5 must be completed
    const prevChapLastStage = `${chapId - 1}-5`;
    return storyProgress.completedStages.includes(prevChapLastStage);
  };

  const handleSelectStage = (stageId: string) => {
    AetheriaAudioEngine.playClick();
    setSelectedStageId(stageId);
  };

  const handleDeployStage = (stageId: string, hardModeActive: boolean) => {
    setSelectedStageId(null);
    AetheriaAudioEngine.playClick();

    const choiceSelections = { ...storyProgress.storyChoices };
    const authoredScene = getStoryScene(stageId, 'before', choiceSelections);
    const dialogue = getStageDialogue(stageId);
    const scene = authoredScene.slides.length > 0
      ? authoredScene
      : { slides: dialogue?.before ?? [], backgroundId: authoredScene.backgroundId };
    const choice = getStoryChoice(stageId);
    const startBattle = (nextChoices: StoryChoiceSelections) => {
      onStartStoryBattle({
        stageId,
        isHardMode: hardModeActive,
        isCharStory: false,
        choiceSelections: nextChoices,
      });
    };

    if (scene.slides.length > 0) {
      // Trigger VN cutscene
      setActiveCutsceneScene(scene);
      setActiveCutsceneChoice(choice ?? null);
      setCutsceneCallback(() => startBattle);
    } else {
      startBattle(choiceSelections);
    }
  };

  // Character Stories logic
  const handlePlayCharStoryAct = (charId: string, act: number) => {
    AetheriaAudioEngine.playClick();
    const completedCount = storyProgress.completedCharacterStoryActs[charId] || 0;
    if (!devCheatsEnabled && completedCount < act - 1) {
      onShowAlert(
        'Character Story Locked',
        `Clear Act ${act - 1} before starting this optional side battle.`,
        'info'
      );
      return;
    }

    const stageId = `char-${charId}-${act}`;
    const choiceSelections = { ...storyProgress.storyChoices };
    const authoredScene = getStoryScene(stageId, 'before', choiceSelections);
    const script = getCharacterStoryScript(charId, act);
    const scene = authoredScene.slides.length > 0
      ? authoredScene
      : { slides: script.before, backgroundId: authoredScene.backgroundId };
    const choice = getStoryChoice(stageId);
    const startBattle = (nextChoices: StoryChoiceSelections) => {
      onStartStoryBattle({
        stageId,
        isHardMode: false,
        isCharStory: true,
        choiceSelections: nextChoices,
        charId,
        act,
      });
    };

    if (scene.slides.length > 0) {
      setActiveCutsceneScene(scene);
      setActiveCutsceneChoice(choice ?? null);
      setCutsceneCallback(() => startBattle);
    } else {
      startBattle(choiceSelections);
    }
  };

  const handleCutsceneChoice = (decisionId: string, optionId: string) => {
    const decision = activeCutsceneChoice;
    if (!decision || decision.id !== decisionId) return;

    const nextChoices = applyStoryChoice(storyProgress.storyChoices, decision.id, optionId);
    onUpdateSaveState(prev => ({
      ...prev,
      storyProgress: {
        ...normalizeStoryProgress(prev.storyProgress),
        storyChoices: nextChoices,
      },
    }));

    const cb = cutsceneCallback;
    setActiveCutsceneScene(null);
    setActiveCutsceneChoice(null);
    setCutsceneCallback(null);
    if (cb) cb(nextChoices);
  };

  const ownedCharacters = [...PLAYABLE_CHARACTERS]
    .filter((c) => saveState.unlockedCharacterIds.includes(c.id))
    .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));

  const filteredStoryCharacters = ownedCharacters.filter((c) => {
    const query = storySearchQuery.trim().toLowerCase();
    const matchesSearch = query === '' ||
      c.name.toLowerCase().includes(query) ||
      c.element.toLowerCase().includes(query) ||
      c.weaponType.toLowerCase().includes(query);
    const matchesRarity = storyRarityFilter === 'All' || c.rarity === storyRarityFilter;
    const matchesElement = storyElementFilter === 'All' || c.element === storyElementFilter;
    return matchesSearch && matchesRarity && matchesElement;
  });

  const handleChapterStripWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const strip = chapterStripRef.current;
    if (!strip) return;

    const usesHorizontalAxis = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    const delta = usesHorizontalAxis ? event.deltaX : event.shiftKey ? event.deltaY : 0;
    if (delta === 0) return;

    const maxScrollLeft = strip.scrollWidth - strip.clientWidth;
    const canMove = delta < 0 ? strip.scrollLeft > 0 : strip.scrollLeft < maxScrollLeft;
    if (!canMove) return;

    event.preventDefault();
    strip.scrollLeft += delta;
  };

  return (
    <div className="space-y-6 select-none relative">
      {/* Cutscene overlay */}
      <AnimatePresence>
        {activeCutsceneScene && (
          <StoryCutscene
            scene={activeCutsceneScene}
            choice={activeCutsceneChoice ?? undefined}
            onChoice={handleCutsceneChoice}
            onComplete={() => {
              const cb = cutsceneCallback;
              const choiceSelections = { ...storyProgress.storyChoices };
              setActiveCutsceneScene(null);
              setActiveCutsceneChoice(null);
              setCutsceneCallback(null);
              if (cb) cb(choiceSelections);
            }}
          />
        )}
      </AnimatePresence>

      {/* Primary campaign tabs */}
      <div className="grid grid-cols-3 bg-[#0b0f19]/80 border border-white/10 p-1 rounded-xl w-full md:flex md:w-fit gap-1 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            setActiveTab('campaign');
            AetheriaAudioEngine.playClick();
          }}
          className={`min-h-12 flex-1 md:flex-initial py-2.5 px-2 sm:px-4 md:px-6 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'campaign'
              ? 'bg-indigo-650 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-white" />
          <span>Story Campaign</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('characters');
            AetheriaAudioEngine.playClick();
          }}
          className={`min-h-12 flex-1 md:flex-initial py-2.5 px-2 sm:px-4 md:px-6 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'characters'
              ? 'bg-indigo-650 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <User className="w-3.5 h-3.5 text-white" />
          <span>Character Stories</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('memories');
            AetheriaAudioEngine.playClick();
          }}
          className={`min-h-12 flex-1 md:flex-initial py-2.5 px-2 sm:px-4 md:px-6 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'memories'
              ? 'bg-indigo-650 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Archive className="w-3.5 h-3.5 text-white" />
          <span>Memory Archive</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'campaign' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            key="camp_tab"
            className="space-y-6"
          >
            {/* Chapters Slider Carousel */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">
                Select Campaign Chapter:
              </h4>
              <div
                ref={chapterStripRef}
                role="region"
                aria-label="Campaign chapters"
                tabIndex={0}
                onWheel={handleChapterStripWheel}
                className="flex gap-4 overflow-x-auto overscroll-x-contain pb-3 scrollbar-none snap-x snap-mandatory"
              >
                {STORY_CHAPTERS.map((chap) => {
                  const unlocked = isChapterUnlocked(chap.id);
                  const active = selectedChapter === chap.id;
                  const completionPct = getChapterCompletionPct(chap.id);
                  const stars = getChapterStars(chap.id);

                  let blockClass = 'border-white/5 bg-slate-900/40 text-slate-500';
                  if (unlocked) {
                    blockClass = active
                      ? 'border-indigo-550 bg-indigo-950/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20'
                      : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700';
                  }

                  return (
                    <button
                      key={chap.id}
                      ref={(node) => {
                        if (node) chapterCardRefs.current.set(chap.id, node);
                        else chapterCardRefs.current.delete(chap.id);
                      }}
                      type="button"
                      aria-pressed={active}
                      disabled={!unlocked}
                      onClick={() => {
                        setSelectedChapter(chap.id);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`w-[250px] sm:w-[260px] shrink-0 snap-center p-4 rounded-xl border flex flex-col text-left justify-between gap-3 transition-all select-none ${blockClass} ${
                        unlocked ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span>CHAPTER {String(chap.id).padStart(2, '0')}</span>
                          {!unlocked && <Lock className="w-3 h-3 text-red-500" />}
                        </div>
                        <h5 className="font-extrabold text-xs truncate uppercase font-display leading-tight">
                          {chap.title}
                        </h5>
                      </div>

                      {unlocked && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                            <span>Stars: {stars}/15</span>
                            <span>{completionPct}% Complete</span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full transition-all duration-350"
                              style={{ width: `${completionPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campaign map screen container */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h3 className="text-xl font-black text-white font-display uppercase tracking-wide">
                    Chapter {selectedChapter}: {STORY_CHAPTERS[selectedChapter - 1]?.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {STORY_CHAPTERS[selectedChapter - 1]?.desc}
                  </p>
                </div>

                {/* Hard Mode Toggle */}
                {getChapterCompletionPct(selectedChapter) === 100 && (
                  <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl shadow">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Campaign Difficulty:</span>
                    <button
                      onClick={() => {
                        setIsHardMode((prev) => !prev);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded transition-all cursor-pointer ${
                        isHardMode
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-indigo-650 text-white shadow-sm'
                      }`}
                    >
                      {isHardMode ? '🔴 Hard Mode Active' : '🔵 Normal Campaign'}
                    </button>
                  </div>
                )}
              </div>

              {/* Story Map rendering */}
              <StoryMap
                chapter={selectedChapter}
                completedStages={storyProgress.completedStages}
                starRatings={storyProgress.starRatings}
                onSelectStage={handleSelectStage}
                devCheatsEnabled={devCheatsEnabled}
                isHardMode={isHardMode}
                hardModeCompletedStages={storyProgress.hardModeCompletedStages || []}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'characters' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            key="char_tab"
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {/* Left Column: owned character list */}
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              <h4 className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest block font-mono px-2">
                Select Owned Character ({filteredStoryCharacters.length}/{ownedCharacters.length}):
              </h4>
              <div className="bg-slate-950/45 border border-white/5 rounded-xl p-2 space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={storySearchQuery}
                    onChange={(e) => setStorySearchQuery(e.target.value)}
                    placeholder="Search character stories..."
                    className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 pr-8 text-[10px] font-bold uppercase tracking-wide text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-indigo-400/70"
                  />
                  {storySearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setStorySearchQuery('');
                        AetheriaAudioEngine.playClick();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 transition-colors hover:text-slate-200"
                      aria-label="Clear character story search"
                    >
                      X
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(['All', 5, 4, 3] as const).map((rarity) => (
                    <button
                      key={rarity}
                      type="button"
                      onClick={() => {
                        setStoryRarityFilter(rarity);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-wider transition-all ${
                        storyRarityFilter === rarity
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rarity === 'All' ? 'All' : `${rarity} Star`}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(['All', 'Pyro', 'Hydro', 'Cryo', 'Electro', 'Anemo', 'Geo', 'Dendro'] as const).map((element) => (
                    <button
                      key={element}
                      type="button"
                      onClick={() => {
                        setStoryElementFilter(element);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-wider transition-all ${
                        storyElementFilter === element
                          ? 'bg-indigo-500 text-white border-indigo-300'
                          : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {element}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                {filteredStoryCharacters.length === 0 && (
                  <div className="rounded-xl border border-white/5 bg-black/25 p-4 text-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    No character stories match this search.
                  </div>
                )}
                {filteredStoryCharacters.map((char) => {
                  const isSelected = selectedCharId === char.id;
                  const completedCount = storyProgress.completedCharacterStoryActs[char.id] || 0;

                  return (
                    <button
                      key={char.id}
                      onClick={() => {
                        setSelectedCharId(char.id);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-indigo-500 shadow-md text-white'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 font-black text-xs ${char.avatarPlaceholder}`}>
                          {char.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs block">{char.name}</div>
                          <span className="text-[8.5px] font-mono block opacity-80 uppercase text-amber-400">
                            Acts Cleared: {completedCount}/3
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Character Acts detail sheet */}
            <div className="md:col-span-3">
              {selectedCharId ? (() => {
                const char = PLAYABLE_CHARACTERS.find((c) => c.id === selectedCharId)!;
                const completedCount = storyProgress.completedCharacterStoryActs[char.id] || 0;

                const acts = [
                  { index: 1, title: 'Act I: Origin Mythos', encounterType: 'Normal' },
                  { index: 2, title: 'Act II: Memory Pressure', encounterType: 'Elite' },
                  { index: 3, title: 'Act III: Final Memory', encounterType: 'Boss' }
                ];

                return (
                  <div className="glass-hud p-6 rounded-2xl border border-white/10 space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-white font-display uppercase tracking-wide">
                        {char.name}'s Character Story Acts
                      </h3>
                      <p className="text-xs text-slate-400">
                        Fight through a character's memories for Mora and Gems.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {acts.map((act) => {
                        const isUnlocked = completedCount >= act.index - 1 || devCheatsEnabled;
                        const isCompleted = completedCount >= act.index;

                        let cardClass = 'border-white/5 bg-slate-950/20 text-slate-500';
                        if (isUnlocked) {
                          cardClass = isCompleted
                            ? 'border-emerald-500/20 bg-slate-950/40 text-slate-300'
                            : 'border-indigo-500/40 bg-indigo-950/10 text-white';
                        }

                        return (
                          <div
                            key={act.index}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${cardClass}`}
                          >
                            <div className="space-y-2">
                              <h4 className="font-extrabold text-sm flex items-center gap-2 font-display uppercase tracking-wide">
                                <span>{act.title}</span>
                                {isCompleted && (
                                  <span className="text-[8px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-1.5 py-0.2 rounded uppercase">
                                    CLEARED
                                  </span>
                                )}
                              </h4>
                              <div className="flex flex-wrap gap-1.5 text-[9px] font-black uppercase tracking-wide font-mono">
                                <span className="rounded border border-indigo-500/25 bg-indigo-500/10 px-2 py-1 text-indigo-300">
                                  {act.encounterType}
                                </span>
                                <span className="rounded border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-amber-300">Mora</span>
                                <span className="rounded border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 text-cyan-300">Gems</span>
                              </div>
                            </div>

                            {isUnlocked ? (
                              !isCompleted ? (
                                <button
                                  onClick={() => handlePlayCharStoryAct(char.id, act.index)}
                                  className="py-2 px-4 bg-indigo-650 hover:bg-indigo-550 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all cursor-pointer shrink-0"
                                >
                                  ⚔️ Play Act
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-bold font-mono uppercase shrink-0">
                                  ✓ Cleared
                                </span>
                              )
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold font-mono uppercase shrink-0">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Locked</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })() : (
                <div className="glass-hud p-12 rounded-2xl border border-white/5 text-center text-slate-500 italic text-xs font-mono uppercase">
                  Select a character on the left sidebar to unlock their story acts
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'memories' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            key="memory_tab"
          >
            <StoryMemoryArchive
              entries={STORY_MEMORIES}
              unlockedLoreEntries={storyProgress.unlockedLoreEntries}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage Details Dialog Overlay */}
      <AnimatePresence>
        {selectedStageId && (
          <StoryStage
            stageId={selectedStageId}
            storyChoices={storyProgress.storyChoices}
            previousStars={storyProgress.starRatings[selectedStageId] || 0}
            onDeploy={handleDeployStage}
            onClose={() => setSelectedStageId(null)}
            isHardMode={isHardMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
