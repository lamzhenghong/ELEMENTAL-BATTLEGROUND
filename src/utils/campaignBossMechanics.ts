import type { ElementType } from '../types';
import type { CampaignBossMechanicId } from '../data/story/types';

export interface CampaignBossMechanicState {
  timers: Record<string, number>;
  mode?: 'frost' | 'flame';
  pullFrames?: number;
  recordedTargets?: Array<{ x: number; y: number }>;
}

export interface CampaignBossMechanicContext {
  mechanicId: CampaignBossMechanicId;
  phase: 1 | 2 | 3;
  combatSpeed: number;
  bossX: number;
  bossY: number;
  targetX: number;
  targetY: number;
  random: () => number;
}

export type CampaignBossAction =
  | {
      kind: 'projectile';
      projectileType: 'fireball' | 'ice_shard';
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      damage: number;
      element: ElementType;
      color: string;
      timer: number;
    }
  | {
      kind: 'warning';
      x: number;
      y: number;
      radius: number;
      innerRadius?: number;
      damage: number;
      element: ElementType;
      color: string;
      delayFrames: number;
      label: string;
      knockback?: number;
    }
  | {
      kind: 'patch';
      x: number;
      y: number;
      radius: number;
      damage: number;
      element: ElementType;
      color: string;
      durationFrames: number;
      label: string;
    }
  | { kind: 'pull'; strength: number }
  | { kind: 'text'; text: string; color: string; emphasized?: boolean };

export interface CampaignBossMechanicStep {
  state: CampaignBossMechanicState;
  actions: CampaignBossAction[];
}

const TAU = Math.PI * 2;
const SEVEN_ELEMENTS: readonly ElementType[] = [
  'Pyro',
  'Hydro',
  'Electro',
  'Cryo',
  'Anemo',
  'Geo',
  'Dendro',
];
const ELEMENT_COLORS: Record<ElementType, string> = {
  Pyro: '#fb7185',
  Hydro: '#38bdf8',
  Electro: '#c084fc',
  Cryo: '#a5f3fc',
  Anemo: '#5eead4',
  Geo: '#fbbf24',
  Dendro: '#4ade80',
};

export const createCampaignBossMechanicState = (): CampaignBossMechanicState => ({
  timers: {},
  recordedTargets: [],
});

const tickState = (
  source: CampaignBossMechanicState,
  combatSpeed: number,
): CampaignBossMechanicState => ({
  ...source,
  timers: Object.fromEntries(
    Object.entries(source.timers).map(([key, value]) => [key, value - combatSpeed]),
  ),
  pullFrames: Math.max(0, (source.pullFrames ?? 0) - combatSpeed),
  recordedTargets: source.recordedTargets?.map((target) => ({ ...target })) ?? [],
});

const isReady = (state: CampaignBossMechanicState, key: string) =>
  (state.timers[key] ?? 0) <= 0;

const setTimer = (state: CampaignBossMechanicState, key: string, frames: number) => {
  state.timers[key] = frames;
};

const radialProjectiles = (
  context: CampaignBossMechanicContext,
  count: number,
  element: ElementType,
  color: string,
  damage: number,
  speed: number,
  projectileType: 'fireball' | 'ice_shard',
): CampaignBossAction[] => Array.from({ length: count }, (_, index) => {
  const angle = (index / count) * TAU;
  return {
    kind: 'projectile',
    projectileType,
    x: context.bossX,
    y: context.bossY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 9,
    damage,
    element,
    color,
    timer: 360,
  };
});

const aimedFan = (
  context: CampaignBossMechanicContext,
  count: number,
  spread: number,
  element: ElementType,
  color: string,
  damage: number,
  projectileType: 'fireball' | 'ice_shard',
): CampaignBossAction[] => {
  const centerAngle = Math.atan2(
    context.targetY - context.bossY,
    context.targetX - context.bossX,
  );
  return Array.from({ length: count }, (_, index) => {
    const offset = count === 1 ? 0 : (index / (count - 1) - 0.5) * spread;
    const angle = centerAngle + offset;
    return {
      kind: 'projectile',
      projectileType,
      x: context.bossX,
      y: context.bossY,
      vx: Math.cos(angle) * 4.2,
      vy: Math.sin(angle) * 4.2,
      radius: 10,
      damage,
      element,
      color,
      timer: 380,
    };
  });
};

const warning = (
  x: number,
  y: number,
  radius: number,
  damage: number,
  element: ElementType,
  color: string,
  label: string,
  delayFrames = 48,
  innerRadius?: number,
  knockback?: number,
): CampaignBossAction => ({
  kind: 'warning',
  x,
  y,
  radius,
  innerRadius,
  damage,
  element,
  color,
  delayFrames: Math.max(30, delayFrames),
  label,
  knockback,
});

const circularWarnings = (
  centerX: number,
  centerY: number,
  count: number,
  orbitRadius: number,
  actionRadius: number,
  damage: number,
  element: ElementType,
  color: string,
  label: string,
  gapIndex = -1,
): CampaignBossAction[] => Array.from({ length: count }, (_, index) => index)
  .filter((index) => index !== gapIndex)
  .map((index) => {
    const angle = (index / count) * TAU;
    return warning(
      centerX + Math.cos(angle) * orbitRadius,
      centerY + Math.sin(angle) * orbitRadius,
      actionRadius,
      damage,
      element,
      color,
      label,
    );
  });

const crossWarnings = (
  context: CampaignBossMechanicContext,
  label: string,
  damage: number,
): CampaignBossAction[] => {
  const angle = Math.atan2(
    context.targetY - context.bossY,
    context.targetX - context.bossX,
  );
  const actions: CampaignBossAction[] = [];
  for (const rotation of [angle, angle + Math.PI / 2]) {
    for (const distance of [-150, 0, 150]) {
      actions.push(warning(
        context.targetX + Math.cos(rotation) * distance,
        context.targetY + Math.sin(rotation) * distance,
        42,
        damage,
        'Electro',
        '#facc15',
        label,
        50,
      ));
    }
  }
  return actions;
};

const recordTarget = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
  limit: number,
) => {
  state.recordedTargets = [
    ...(state.recordedTargets ?? []),
    { x: context.targetX, y: context.targetY },
  ].slice(-limit);
};

const stepSepulchralSilence = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
): CampaignBossAction[] => {
  const actions: CampaignBossAction[] = [];
  if (isReady(state, 'shards')) {
    setTimer(state, 'shards', context.phase === 3 ? 125 : 175);
    actions.push(...radialProjectiles(context, 7, 'Cryo', '#94a3b8', 220, 3.8, 'ice_shard'));
  }
  if (context.phase >= 2 && isReady(state, 'silenceRing')) {
    setTimer(state, 'silenceRing', context.phase === 3 ? 145 : 210);
    actions.push(warning(
      context.targetX,
      context.targetY,
      145,
      300,
      'Cryo',
      '#64748b',
      'CLOSING SILENCE',
      56,
      82,
    ));
  }
  if (context.phase === 3 && isReady(state, 'heartPulse')) {
    setTimer(state, 'heartPulse', 245);
    actions.push(warning(
      context.bossX,
      context.bossY,
      230,
      420,
      'Cryo',
      '#cbd5e1',
      'FROZEN HEART',
      65,
      undefined,
      80,
    ));
  }
  return actions;
};

const stepVowclockEdict = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
): CampaignBossAction[] => {
  const actions: CampaignBossAction[] = [];
  if (isReady(state, 'record')) {
    setTimer(state, 'record', 32);
    recordTarget(state, context, 3);
  }
  if (isReady(state, 'clockHands')) {
    setTimer(state, 'clockHands', context.phase === 3 ? 105 : 180);
    actions.push(...crossWarnings(context, 'VOWCLOCK HAND', 265));
  }
  if (context.phase >= 2 && isReady(state, 'echo')) {
    setTimer(state, 'echo', context.phase === 3 ? 95 : 170);
    actions.push(...(state.recordedTargets ?? []).map((target) => warning(
      target.x,
      target.y,
      48,
      300,
      'Electro',
      '#fde68a',
      'RECORDED ECHO',
      52,
    )));
  }
  return actions;
};

const stepSeasonalConvergence = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
): CampaignBossAction[] => {
  const actions: CampaignBossAction[] = [];
  if (isReady(state, 'seasonVolley')) {
    setTimer(state, 'seasonVolley', context.phase === 3 ? 115 : 165);
    state.mode = state.mode === 'flame' ? 'frost' : 'flame';
    const flame = state.mode === 'flame';
    actions.push(...aimedFan(
      context,
      5,
      0.75,
      flame ? 'Pyro' : 'Cryo',
      flame ? '#fb7185' : '#7dd3fc',
      flame ? 250 : 225,
      flame ? 'fireball' : 'ice_shard',
    ));
  }
  if (context.phase >= 2 && isReady(state, 'seasonPatch')) {
    setTimer(state, 'seasonPatch', context.phase === 3 ? 150 : 220);
    const flame = state.mode === 'flame';
    actions.push({
      kind: 'patch',
      x: context.targetX,
      y: context.targetY,
      radius: 55,
      damage: 42,
      element: flame ? 'Pyro' : 'Cryo',
      color: flame ? '#ef4444' : '#38bdf8',
      durationFrames: 260,
      label: flame ? 'FLAME SEASON' : 'FROST SEASON',
    });
  }
  if (context.phase === 3 && isReady(state, 'convergence')) {
    setTimer(state, 'convergence', 205);
    actions.push(warning(
      context.targetX,
      context.targetY,
      72,
      500,
      'Pyro',
      '#f97316',
      'CONVERGENCE METEOR',
      60,
      undefined,
      70,
    ));
    actions.push(...aimedFan(context, 4, 0.6, 'Cryo', '#bae6fd', 245, 'ice_shard'));
  }
  return actions;
};

const stepSevenAnchorDominion = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
): CampaignBossAction[] => {
  const actions: CampaignBossAction[] = [];
  if (isReady(state, 'anchors')) {
    setTimer(state, 'anchors', context.phase === 3 ? 135 : 205);
    const finalPhase = context.phase === 3;
    actions.push(...circularWarnings(
      context.targetX,
      context.targetY,
      finalPhase ? 7 : 6,
      finalPhase ? 165 : 125,
      42,
      finalPhase ? 360 : 275,
      'Geo',
      '#fbbf24',
      finalPhase ? 'ANCHOR COLLAPSE' : 'SKY ANCHOR',
      finalPhase ? Math.floor(context.random() * 7) : -1,
    ));
    if (context.phase >= 2) state.pullFrames = finalPhase ? 75 : 55;
  }
  if (context.phase >= 2 && (state.pullFrames ?? 0) > 0) {
    actions.push({ kind: 'pull', strength: context.phase === 3 ? 1.8 : 1.15 });
  }
  return actions;
};

const stepWorldforgeRoot = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
): CampaignBossAction[] => {
  const actions: CampaignBossAction[] = [];
  if (isReady(state, 'rootCage')) {
    setTimer(state, 'rootCage', context.phase === 3 ? 135 : 200);
    actions.push(...circularWarnings(
      context.targetX,
      context.targetY,
      6,
      95,
      38,
      260,
      'Dendro',
      '#4ade80',
      'ROOT CAGE',
      context.phase === 1 ? Math.floor(context.random() * 6) : -1,
    ));
  }
  if (context.phase >= 2 && isReady(state, 'rootZone')) {
    setTimer(state, 'rootZone', context.phase === 3 ? 150 : 225);
    actions.push({
      kind: 'patch',
      x: context.targetX,
      y: context.targetY,
      radius: 62,
      damage: 38,
      element: 'Dendro',
      color: '#22c55e',
      durationFrames: 300,
      label: 'LIVING ROOT ZONE',
    });
  }
  if (context.phase === 3 && isReady(state, 'eruptions')) {
    setTimer(state, 'eruptions', 180);
    const angle = Math.atan2(
      context.targetY - context.bossY,
      context.targetX - context.bossX,
    );
    for (let index = 0; index < 5; index += 1) {
      actions.push(warning(
        context.bossX + Math.cos(angle) * (80 + index * 75),
        context.bossY + Math.sin(angle) * (80 + index * 75),
        44,
        330,
        'Dendro',
        '#86efac',
        'WORLDFORGE ERUPTION',
        38 + index * 7,
        undefined,
        45,
      ));
    }
  }
  return actions;
};

const stepOnePerfectSecond = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
): CampaignBossAction[] => {
  const actions: CampaignBossAction[] = [];
  if (isReady(state, 'recordPath')) {
    setTimer(state, 'recordPath', 24);
    recordTarget(state, context, 4);
  }
  if (isReady(state, 'afterimages')) {
    setTimer(state, 'afterimages', context.phase === 3 ? 95 : 175);
    actions.push(...(state.recordedTargets ?? []).slice(-3).map((target) => warning(
      target.x,
      target.y,
      46,
      285,
      'Electro',
      '#f472b6',
      'AFTERIMAGE STRIKE',
      48,
    )));
  }
  if (context.phase >= 2 && isReady(state, 'clockface')) {
    setTimer(state, 'clockface', context.phase === 3 ? 115 : 225);
    actions.push(...circularWarnings(
      context.targetX,
      context.targetY,
      8,
      150,
      36,
      300,
      'Electro',
      '#e879f9',
      'CLOCKFACE BARRAGE',
      Math.floor(context.random() * 8),
    ));
  }
  return actions;
};

const stepSevenfoldConvergence = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
): CampaignBossAction[] => {
  const actions: CampaignBossAction[] = [];
  if (isReady(state, 'elementOrbit')) {
    setTimer(state, 'elementOrbit', context.phase === 3 ? 140 : 205);
    SEVEN_ELEMENTS.forEach((element, index) => {
      const angle = (index / SEVEN_ELEMENTS.length) * TAU;
      actions.push(warning(
        context.targetX + Math.cos(angle) * 135,
        context.targetY + Math.sin(angle) * 135,
        38,
        280,
        element,
        ELEMENT_COLORS[element],
        'SEVENFOLD ORBIT',
        36 + index * 5,
      ));
    });
  }
  if (context.phase >= 2 && isReady(state, 'orbitRing')) {
    setTimer(state, 'orbitRing', context.phase === 3 ? 145 : 220);
    actions.push(warning(
      context.targetX,
      context.targetY,
      180,
      340,
      'Anemo',
      '#67e8f9',
      'COLLAPSING ORBIT',
      58,
      112,
    ));
  }
  if (context.phase === 3 && isReady(state, 'finalConvergence')) {
    setTimer(state, 'finalConvergence', 255);
    actions.push(...circularWarnings(
      context.targetX,
      context.targetY,
      7,
      82,
      50,
      470,
      'Geo',
      '#fef08a',
      'SEVENFOLD CONVERGENCE',
      Math.floor(context.random() * 7),
    ));
  }
  return actions;
};

export const stepCampaignBossMechanic = (
  sourceState: CampaignBossMechanicState,
  context: CampaignBossMechanicContext,
): CampaignBossMechanicStep => {
  const state = tickState(sourceState, context.combatSpeed);
  let actions: CampaignBossAction[];

  switch (context.mechanicId) {
    case 'sepulchral-silence':
      actions = stepSepulchralSilence(state, context);
      break;
    case 'vowclock-edict':
      actions = stepVowclockEdict(state, context);
      break;
    case 'seasonal-convergence':
      actions = stepSeasonalConvergence(state, context);
      break;
    case 'seven-anchor-dominion':
      actions = stepSevenAnchorDominion(state, context);
      break;
    case 'worldforge-root':
      actions = stepWorldforgeRoot(state, context);
      break;
    case 'one-perfect-second':
      actions = stepOnePerfectSecond(state, context);
      break;
    case 'sevenfold-convergence':
      actions = stepSevenfoldConvergence(state, context);
      break;
    default: {
      const exhaustiveCheck: never = context.mechanicId;
      throw new Error(`Unsupported campaign boss mechanic: ${exhaustiveCheck}`);
    }
  }

  return { state, actions: actions.slice(0, 16) };
};
