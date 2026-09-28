import type { ElementType } from '../types';

export type ElementMotif = 'flame' | 'tide' | 'crystal' | 'bolt' | 'spiral' | 'facet' | 'leaf';

export const ELEMENT_VISUALS: Record<ElementType, { color: string; pale: string; motif: ElementMotif; motion: string; symbolPath: string }> = {
  Pyro: { color: '#fb7047', pale: '#ffc08a', motif: 'flame', motion: 'rising', symbolPath: 'M12 2c2 4-1 5 2 8 2-1 2-3 2-4 5 5 5 10 2 14-2 3-10 3-12 0-3-4-1-8 3-11 0 3 1 4 3 5-2-4 0-7 0-12Z' },
  Hydro: { color: '#39b9e9', pale: '#a3eaff', motif: 'tide', motion: 'flowing', symbolPath: 'M12 2C9 8 4 11 4 15a8 8 0 0 0 16 0c0-4-5-7-8-13ZM7 16c1 3 3 4 6 4' },
  Cryo: { color: '#93e3f3', pale: '#e6fbff', motif: 'crystal', motion: 'fracturing', symbolPath: 'M12 2v20M2 12h20M5 5l14 14M19 5 5 19M9 5l3 3 3-3M9 19l3-3 3 3' },
  Electro: { color: '#bb83f6', pale: '#e2c4ff', motif: 'bolt', motion: 'branching', symbolPath: 'M13 2 5 13h6l-1 9 9-12h-6l2-8Z' },
  Anemo: { color: '#62dbbf', pale: '#c6fff1', motif: 'spiral', motion: 'circling', symbolPath: 'M4 13c2-7 13-10 16-3 2 5-2 10-7 10-4 0-6-4-3-7 2-2 5-1 5 1M3 17c3 4 8 5 11 5' },
  Geo: { color: '#efbd58', pale: '#ffe9a9', motif: 'facet', motion: 'settling', symbolPath: 'M12 2 21 9v7l-9 6-9-6V9l9-7Zm0 0v20M3 9l9 5 9-5' },
  Dendro: { color: '#8bd65c', pale: '#d7ffad', motif: 'leaf', motion: 'unfurling', symbolPath: 'M20 3C10 3 4 7 4 15c0 4 3 6 7 5 8-2 10-9 9-17ZM3 21c4-7 8-10 14-13' },
};

export type ReactionMotion = 'compress' | 'fracture' | 'branch' | 'bloom' | 'ring';

const REACTION_MOTIONS: Record<string, { motion: ReactionMotion; elements: readonly ElementType[] }> = {
  vaporize: { motion: 'compress', elements: ['Hydro', 'Pyro'] },
  melt: { motion: 'compress', elements: ['Cryo', 'Pyro'] },
  frozen: { motion: 'fracture', elements: ['Hydro', 'Cryo'] },
  'hyper-shatter': { motion: 'fracture', elements: ['Cryo', 'Electro'] },
  superconduct: { motion: 'fracture', elements: ['Cryo', 'Electro'] },
  'electro-charged': { motion: 'branch', elements: ['Hydro', 'Electro'] },
  'hyperbloom-quasar': { motion: 'branch', elements: ['Dendro', 'Electro'] },
  'bloom-eruption': { motion: 'bloom', elements: ['Dendro', 'Hydro'] },
  burning: { motion: 'bloom', elements: ['Dendro', 'Pyro'] },
  overloaded: { motion: 'ring', elements: ['Pyro', 'Electro'] },
  crystallize: { motion: 'ring', elements: ['Geo', 'Cryo'] },
  'swirl-splash': { motion: 'ring', elements: ['Anemo', 'Hydro'] },
};

export const getReactionChoreography = (id: string) =>
  REACTION_MOTIONS[id] ?? { motion: 'ring' as const, elements: ['Anemo'] as const };
