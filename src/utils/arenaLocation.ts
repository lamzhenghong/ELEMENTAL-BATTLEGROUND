export interface ArenaLocation {
  id: string;
  name: string;
  ground: string;
  seam: string;
  accent: string;
  motif: 'ruin' | 'frontier' | 'gate' | 'abyss' | 'astral' | 'frostfire' | 'sky' | 'volcano' | 'rift' | 'core' | 'arena' | 'reliquary' | 'rogue';
}

const CHAPTER_LOCATIONS: readonly ArenaLocation[] = [
  { id: 'chapter-1', name: 'Whispering Ruins', ground: '#172927', seam: '#47716b', accent: '#75b397', motif: 'ruin' },
  { id: 'chapter-2', name: 'Elemental Frontier', ground: '#302627', seam: '#705150', accent: '#e2ad68', motif: 'frontier' },
  { id: 'chapter-3', name: 'Aether Gates', ground: '#202c39', seam: '#4f7793', accent: '#79c5ed', motif: 'gate' },
  { id: 'chapter-4', name: 'Gloamvault', ground: '#241c33', seam: '#58426f', accent: '#af8bd2', motif: 'abyss' },
  { id: 'chapter-5', name: 'Astral Reliquary', ground: '#292a3e', seam: '#716e95', accent: '#d4c598', motif: 'astral' },
  { id: 'chapter-6', name: 'Rimeforge Fault', ground: '#252d38', seam: '#647a88', accent: '#d5866e', motif: 'frostfire' },
  { id: 'chapter-7', name: 'Aethelwing Skyroad', ground: '#26343c', seam: '#668d9b', accent: '#a9dce3', motif: 'sky' },
  { id: 'chapter-8', name: 'Eldruin Worldforge', ground: '#332922', seam: '#8a5844', accent: '#ef9460', motif: 'volcano' },
  { id: 'chapter-9', name: 'Paradox Verge', ground: '#282239', seam: '#785d8e', accent: '#b9a2e4', motif: 'rift' },
  { id: 'chapter-10', name: 'Prime Orbit Core', ground: '#242e3b', seam: '#758da1', accent: '#f0d39b', motif: 'core' },
];

const OTHER_LOCATIONS: Record<string, ArenaLocation> = {
  arena: { id: 'arena', name: 'Endless Arena', ground: '#1b2434', seam: '#3d5875', accent: '#83ccf2', motif: 'arena' },
  artifact: { id: 'artifact', name: 'Artifact Reliquary', ground: '#292721', seam: '#6d5e45', accent: '#e4be67', motif: 'reliquary' },
  'rogue-battle': { id: 'rogue-battle', name: 'Rogue Ruins', ground: '#22272c', seam: '#4c6665', accent: '#80b9a8', motif: 'rogue' },
  'rogue-elite': { id: 'rogue-elite', name: 'Rogue Elite Chamber', ground: '#29242e', seam: '#715f70', accent: '#c0a1ba', motif: 'rogue' },
  'rogue-boss': { id: 'rogue-boss', name: 'Rogue Throne', ground: '#2e242a', seam: '#825862', accent: '#d69ba5', motif: 'rogue' },
  memory: { id: 'memory', name: 'Memory Echo', ground: '#21273c', seam: '#60718e', accent: '#a2bff0', motif: 'astral' },
};

export function getArenaLocation(context: { storyStageId?: string | null; artifactGrind?: boolean; rogueRoom?: 'battle' | 'elite' | 'boss'; hard?: boolean }): ArenaLocation {
  if (context.storyStageId?.startsWith('char-')) return OTHER_LOCATIONS.memory;
  const chapter = Number(context.storyStageId?.split('-')[0]);
  if (Number.isInteger(chapter) && chapter >= 1 && chapter <= 10) return CHAPTER_LOCATIONS[chapter - 1];
  if (context.rogueRoom) return OTHER_LOCATIONS[`rogue-${context.rogueRoom}`];
  if (context.artifactGrind) return OTHER_LOCATIONS.artifact;
  return OTHER_LOCATIONS.arena;
}
