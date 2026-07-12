import type { ElementType } from '../../types';

export interface StoryStageReward {
  gems: number;
  mora: number;
  charXp: number;
  ascensionMaterialCount?: number;
  specialItem?: string;
}

export interface StoryEnemySpec {
  name: string;
  type: 'Normal' | 'Elite' | 'Boss';
  element: ElementType;
  level: number;
  bossType?: 'fire_dragon' | 'ice_golem' | 'thunderbird';
}

export interface StoryStageSpec {
  id: string;
  chapter: number;
  name: string;
  recommendedLevel: number;
  difficulty: 'Normal' | 'Hard' | 'Boss';
  desc: string;
  enemies: StoryEnemySpec[];
  firstClearRewards: StoryStageReward;
}

export interface StoryDialogueLine {
  speaker: string;
  text: string;
  element?: ElementType;
  portraitSide?: 'left' | 'right';
  effect?: 'fade-in' | 'shake' | 'flash';
}

export type StoryPhase = 'before' | 'after';
export type StoryChoiceSelections = Record<string, string>;
export type StoryBackgroundId =
  | 'chapter-4' | 'chapter-5' | 'chapter-6' | 'chapter-7' | 'chapter-8' | 'chapter-9' | 'chapter-10'
  | 'aurelia-memory' | 'kaelen-memory' | 'maelis-memory' | 'veyra-memory';

export interface StoryChoiceOption {
  id: string;
  label: string;
  consequence: string;
}

export interface StoryChoiceDefinition {
  id: string;
  prompt: string;
  options: readonly [StoryChoiceOption, StoryChoiceOption];
}

export interface StoryScene {
  slides: StoryDialogueLine[];
  backgroundId?: StoryBackgroundId;
}

export interface StoryMemoryEntry {
  id: string;
  title: string;
  sourceLabel: string;
  location: string;
  category: 'campaign' | 'character';
  text: string;
}

export interface StoryArtwork {
  src: string;
  desktopPosition: string;
  mobilePosition: string;
}

export interface StoryBattleModifier {
  id: string;
  label: string;
  description: string;
  enemyHpMultiplier: number;
  enemySpeedMultiplier: number;
}

export interface StoryEncounterVariant {
  optionId: string;
  enemies: StoryEnemySpec[];
  modifierId: string;
  afterSlides: StoryDialogueLine[];
}

export interface AuthoredStoryStage extends StoryStageSpec {
  location: string;
  backgroundId: StoryBackgroundId;
  beforeSlides: StoryDialogueLine[];
  afterSlides: StoryDialogueLine[];
  decision?: StoryChoiceDefinition;
  decisionId?: string;
  variants?: StoryEncounterVariant[];
  memoryUnlockIds?: string[];
}

export interface StoryChapterPack {
  chapter: number;
  stages: Record<string, AuthoredStoryStage>;
  memories: StoryMemoryEntry[];
}

export interface StoryCharacterPack {
  characterId: 'aurelia' | 'kaelen' | 'maelis' | 'veyra';
  stages: Record<string, AuthoredStoryStage>;
  memories: StoryMemoryEntry[];
}
