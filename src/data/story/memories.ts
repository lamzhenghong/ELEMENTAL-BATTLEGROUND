import { CHAPTER_4_PACK } from './campaign/chapter4';
import { CHAPTER_5_PACK } from './campaign/chapter5';
import { CHAPTER_6_PACK } from './campaign/chapter6';
import { CHAPTER_7_PACK } from './campaign/chapter7';
import { CHAPTER_8_PACK } from './campaign/chapter8';
import { CHAPTER_9_PACK } from './campaign/chapter9';
import { CHAPTER_10_PACK } from './campaign/chapter10';
import { AURELIA_STORY_PACK } from './characters/aurelia';
import { KAELEN_STORY_PACK } from './characters/kaelen';
import { MAELIS_STORY_PACK } from './characters/maelis';
import { VEYRA_STORY_PACK } from './characters/veyra';
import type { StoryChapterPack, StoryCharacterPack, StoryMemoryEntry } from './types';

const CHAPTER_MEMORY_PACKS: readonly StoryChapterPack[] = [
  CHAPTER_4_PACK,
  CHAPTER_5_PACK,
  CHAPTER_6_PACK,
  CHAPTER_7_PACK,
  CHAPTER_8_PACK,
  CHAPTER_9_PACK,
  CHAPTER_10_PACK,
];

const CHARACTER_MEMORY_PACKS: readonly StoryCharacterPack[] = [
  AURELIA_STORY_PACK,
  KAELEN_STORY_PACK,
  MAELIS_STORY_PACK,
  VEYRA_STORY_PACK,
];

const AUTHORED_MEMORY_PACKS = [...CHAPTER_MEMORY_PACKS, ...CHARACTER_MEMORY_PACKS];

export const STORY_MEMORIES: StoryMemoryEntry[] = AUTHORED_MEMORY_PACKS.flatMap(
  (pack) => pack.memories,
);

export const LEGACY_CAMPAIGN_CHRONICLES: StoryMemoryEntry[] = [
  {
    id: 'chapter-1-clear',
    title: 'Ruins Core Stabilized',
    sourceLabel: 'Chapter 1 - The Awakening',
    location: 'Ancient Ruins Core',
    category: 'campaign',
    text: 'Defeating the Calamity Pyro Dragon stabilized the ancient ruins core. Analysis of its fragments revealed that the anomalies were triggered deliberately by frequencies from beyond the known world.',
  },
  {
    id: 'chapter-2-clear',
    title: 'Overlord Stabilized',
    sourceLabel: 'Chapter 2 - Elemental Crisis',
    location: 'Frozen River',
    category: 'campaign',
    text: 'With the Glacial Frost Golem defeated, the Frozen River shipping routes opened again. The Oracle concluded that the tears had been calibrating how mortals channel elemental reactions.',
  },
  {
    id: 'chapter-3-clear',
    title: 'The Gate Opened',
    sourceLabel: 'Chapter 3 - Ancient Aetheria',
    location: 'Gates of Ancient Aetheria',
    category: 'campaign',
    text: 'The Tempest Thunderbird fell and the Gates of Ancient Aetheria began to flow once more. Beyond them waited deeper vaults and the first trace of the hand shaping the calamities.',
  },
];

export const ALL_STORY_MEMORIES: StoryMemoryEntry[] = [
  ...LEGACY_CAMPAIGN_CHRONICLES,
  ...STORY_MEMORIES,
];

const MEMORY_UNLOCKS_BY_STAGE = new Map<string, readonly string[]>(
  AUTHORED_MEMORY_PACKS.flatMap((pack) => Object.values(pack.stages))
    .map((stage) => [stage.id, stage.memoryUnlockIds ?? []] as const),
);

export const getMemoryUnlockIds = (stageId: string): string[] => [
  ...(MEMORY_UNLOCKS_BY_STAGE.get(stageId) ?? []),
];

export const mergeUnlockedStoryMemories = (
  currentIds: readonly string[],
  stageId: string,
): string[] => [...new Set([...currentIds, ...getMemoryUnlockIds(stageId)])];
