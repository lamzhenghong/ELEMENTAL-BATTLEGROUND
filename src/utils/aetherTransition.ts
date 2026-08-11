export type AppScreen =
  | 'menu'
  | 'home'
  | 'wiki'
  | 'arena'
  | 'wish'
  | 'inventory'
  | 'quest'
  | 'dungeon'
  | 'party'
  | 'story'
  | 'shop';

export type TransitionKind = 'standard' | 'title';

export type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

export interface TransitionTone {
  id: AppScreen;
  color: string;
  label: string;
}

export interface AetherTransitionState {
  phase: TransitionPhase;
  requestId: number;
  source: AppScreen;
  destination: AppScreen;
  kind: TransitionKind;
}

export type AetherTransitionEvent =
  | { type: 'request'; requestId: number; destination: AppScreen; kind: TransitionKind }
  | { type: 'covered'; requestId: number }
  | { type: 'reveal'; requestId: number }
  | { type: 'complete'; requestId: number };

const TRANSITION_TONES: Record<AppScreen, TransitionTone> = {
  menu: { id: 'menu', color: '#94a3b8', label: 'Menu' },
  home: { id: 'home', color: '#06b6d4', label: 'Home' },
  story: { id: 'story', color: '#10b981', label: 'Story' },
  arena: { id: 'arena', color: '#ef4444', label: 'Arena' },
  dungeon: { id: 'dungeon', color: '#8b5cf6', label: 'Rogue Ruins' },
  wish: { id: 'wish', color: '#f472b6', label: 'Celestial Summons' },
  inventory: { id: 'inventory', color: '#f97316', label: 'Forge' },
  party: { id: 'party', color: '#3b82f6', label: 'Party Setup' },
  quest: { id: 'quest', color: '#eab308', label: 'Quest Log' },
  shop: { id: 'shop', color: '#14b8a6', label: 'Gems Shop' },
  wiki: { id: 'wiki', color: '#d946ef', label: 'God Lore Wiki' },
};

export const createIdleTransition = (screen: AppScreen): AetherTransitionState => ({
  phase: 'idle',
  requestId: 0,
  source: screen,
  destination: screen,
  kind: 'standard',
});

export const getTransitionTone = (screen: AppScreen): TransitionTone => TRANSITION_TONES[screen];

export const getTransitionTimings = (kind: TransitionKind, reducedMotion: boolean) => {
  if (reducedMotion) return { coverMs: 100, swapMs: 140, totalMs: 280 };
  if (kind === 'title') return { coverMs: 420, swapMs: 760, totalMs: 1550 };
  return { coverMs: 220, swapMs: 450, totalMs: 850 };
};

export const reduceAetherTransition = (
  state: AetherTransitionState,
  event: AetherTransitionEvent,
): AetherTransitionState => {
  if (event.type === 'request') {
    if (event.requestId <= state.requestId) return state;

    return {
      phase: 'covering',
      requestId: event.requestId,
      source: state.phase === 'covering' ? state.source : state.destination,
      destination: event.destination,
      kind: event.kind,
    };
  }

  if (event.requestId !== state.requestId || state.phase === 'idle') return state;

  if (event.type === 'covered') return state.phase === 'covered' ? state : { ...state, phase: 'covered' };
  if (event.type === 'reveal') return state.phase === 'revealing' ? state : { ...state, phase: 'revealing' };
  if (event.type === 'complete') {
    return { ...state, phase: 'idle', source: state.destination };
  }

  return state;
};
