import { getEnemyArchetypeDefinition, type EnemyArchetypeId } from '../../utils/enemyArchetypes';
import type { BossIdentity, BossMechanicProfile } from '../../utils/bossIdentities';
import type { CampaignBossMechanicId } from '../../data/story/types';
import {
  createCampaignBossMechanicState,
  stepCampaignBossMechanic,
  type CampaignBossAction,
} from '../../utils/campaignBossMechanics';

export interface DemoPoint { x: number; y: number }
export type DemoSteps<T> = readonly [T, T, T];
export interface DemoActor {
  id: string;
  kind: 'player' | 'enemy' | 'ally' | 'wisp';
  route: DemoSteps<DemoPoint>;
  visible: DemoSteps<boolean>;
  label?: string;
}
export interface DemoEffect {
  id: string;
  kind: 'warning' | 'projectile' | 'shield' | 'link' | 'hit' | 'boundary' | 'label';
  at: DemoPoint;
  to?: DemoPoint;
  radius?: number;
  innerRadius?: number;
  color?: string;
  label?: string;
  visible: DemoSteps<boolean>;
}
export interface MechanicDemo {
  sourceId: EnemyArchetypeId | BossMechanicProfile | CampaignBossMechanicId;
  family: string;
  title: string;
  counterplay: string;
  scope: string;
  phase?: 1 | 2 | 3;
  steps: DemoSteps<string>;
  actors: readonly DemoActor[];
  effects: readonly DemoEffect[];
}

export const canAnimateMechanicDemo = (state: {
  inView: boolean; pageVisible: boolean; paused: boolean; reducedMotion: boolean;
}): boolean => state.inView && state.pageVisible && !state.paused && !state.reducedMotion;

const ALL: DemoSteps<boolean> = [true, true, true];
const BEFORE: DemoSteps<boolean> = [true, true, false];
const RESPONSE: DemoSteps<boolean> = [false, true, false];
const AFTER: DemoSteps<boolean> = [false, false, true];
const point = (x: number, y: number): DemoPoint => ({ x, y });
const actor = (
  id: string, kind: DemoActor['kind'], start: DemoPoint,
  end = start, visible = ALL, label?: string,
): DemoActor => ({ id, kind, route: [start, end, end], visible, label });
const effect = (
  id: string, kind: DemoEffect['kind'], at: DemoPoint,
  options: Omit<Partial<DemoEffect>, 'id' | 'kind' | 'at'> = {},
): DemoEffect => ({ id, kind, at, visible: ALL, ...options });

const ENEMY_DEMOS: Record<EnemyArchetypeId, Omit<MechanicDemo, 'sourceId' | 'scope'>> = {
  bulwark: {
    family: 'shield-break', title: 'Break the guard',
    counterplay: 'Damage wears down the shield. A successful parry shatters it; attacking from behind bypasses its own frontal absorption.',
    steps: ['Nearby ally guarded', 'Damage the shield', 'Guard broken'],
    actors: [actor('enemy', 'enemy', point(96, 64)), actor('ally', 'ally', point(139, 72), undefined, ALL, 'ALLY'), actor('you', 'player', point(201, 64))],
    effects: [
      effect('shield', 'shield', point(96, 64), { radius: 29, visible: BEFORE }),
      effect('guard', 'link', point(96, 64), { to: point(139, 72), visible: BEFORE }),
      effect('attack', 'link', point(195, 64), { to: point(104, 64), visible: RESPONSE, color: '#67e8f9' }),
      effect('break', 'hit', point(96, 64), { visible: AFTER }),
    ],
  },
  channeler: {
    family: 'support-priority', title: 'Stop enemy support',
    counterplay: 'Prioritize the Channeler. Stun pauses its support cooldown; defeating it prevents further heals or revives.',
    steps: ['Ally receives support', 'Focus the Channeler', 'Support stopped'],
    actors: [actor('enemy', 'enemy', point(96, 64), undefined, BEFORE), actor('ally', 'ally', point(143, 81), undefined, ALL, 'ALLY'), actor('you', 'player', point(203, 40), point(131, 40))],
    effects: [
      effect('heal', 'link', point(96, 64), { to: point(143, 81), color: '#4ade80', visible: BEFORE }),
      effect('heal-label', 'label', point(143, 116), { label: '+HP', visible: [true, false, false] }),
      effect('attack', 'link', point(131, 40), { to: point(96, 64), color: '#67e8f9', visible: RESPONSE }),
      effect('defeated', 'hit', point(96, 64), { visible: AFTER }),
    ],
  },
  artillery: {
    family: 'ground-marker', title: 'Leave the lock-on',
    counterplay: 'The shot lands at the marked position. Move out before impact and close the distance while it keeps its range.',
    steps: ['Position marked', 'Move and close in', 'Shot misses old position'],
    actors: [actor('enemy', 'enemy', point(48, 64)), actor('you', 'player', point(178, 64), point(111, 27))],
    effects: [effect('marker', 'warning', point(178, 64), { radius: 24 })],
  },
  siphon: {
    family: 'beam-interrupt', title: 'Break the siphon',
    counterplay: 'The beam steals 5% of current Ultimate energy every five seconds. Damage the Siphon to break it and return stolen energy.',
    steps: ['Beam channels', 'Damage the Siphon', 'Stolen energy returned'],
    actors: [actor('enemy', 'enemy', point(66, 64)), actor('you', 'player', point(190, 64))],
    effects: [
      effect('beam', 'link', point(190, 64), { to: point(66, 64), color: '#c084fc', visible: BEFORE }),
      effect('drain', 'label', point(132, 43), { label: '-5% current ULT', visible: [true, false, false] }),
      effect('hit', 'hit', point(66, 64), { color: '#67e8f9', visible: RESPONSE }),
      effect('return', 'link', point(66, 64), { to: point(190, 64), color: '#67e8f9', visible: AFTER }),
      effect('return-label', 'label', point(132, 43), { label: 'ULT returned', visible: AFTER }),
    ],
  },
  mimic: {
    family: 'skill-copy', title: 'Bait the copied Skill',
    counterplay: 'Use a weaker Skill before the copy, then leave its marker. A character swap alone does not clear the last recorded Skill.',
    steps: ['Use a weaker Skill', 'Mimic copies last Skill', 'Leave the copied marker'],
    actors: [actor('enemy', 'enemy', point(62, 64)), { ...actor('you', 'player', point(181, 64)), route: [point(181, 64), point(181, 64), point(136, 26)] }],
    effects: [
      effect('skill', 'link', point(181, 64), { to: point(62, 64), color: '#67e8f9', visible: [true, false, false] }),
      effect('copy', 'label', point(62, 39), { label: 'COPY', visible: [false, true, true] }),
      effect('marker', 'warning', point(181, 64), { radius: 25, visible: [false, true, true] }),
    ],
  },
  summoner: {
    family: 'summon-priority', title: 'Stop new Wisps',
    counterplay: 'Defeat the Summoner first to stop new summons. Its existing Wisps still need to be cleared.',
    steps: ['Wisps summoned', 'Focus the Summoner', 'Then clear existing Wisps'],
    actors: [
      actor('enemy', 'enemy', point(89, 60), undefined, BEFORE),
      actor('wisp-1', 'wisp', point(127, 84), undefined, ALL, 'WISP'),
      actor('wisp-2', 'wisp', point(61, 91)),
      actor('you', 'player', point(196, 45), point(126, 37)),
    ],
    effects: [
      effect('attack', 'link', point(126, 37), { to: point(89, 60), color: '#67e8f9', visible: RESPONSE }),
      effect('defeated', 'hit', point(89, 60), { visible: AFTER }),
    ],
  },
  stalker: {
    family: 'back-attack', title: 'Read the back attack',
    counterplay: 'The Stalker reappears behind your movement direction. Watch the red eyes and time Dash for a perfect dodge, or move beyond its strike range.',
    steps: ['Stalker vanishes', 'Red eyes behind you', 'Dodge the back strike'],
    actors: [actor('enemy', 'enemy', point(92, 64), undefined, [false, true, true]), { ...actor('you', 'player', point(121, 64)), route: [point(121, 64), point(171, 28), point(171, 28)] }],
    effects: [
      effect('eyes', 'label', point(92, 42), { label: 'EYES', color: '#f87171', visible: [false, true, true] }),
      effect('strike', 'warning', point(92, 64), { radius: 37, visible: [false, true, true] }),
    ],
  },
  'relic-carrier': {
    family: 'escape-chase', title: 'Catch it before the edge',
    counterplay: 'Chase and defeat the carrier before it reaches the arena boundary. A defeated carrier grants bonus Mora, Gems, or an Artifact; an escape does not.',
    steps: ['Carrier flees', 'Chase before the edge', 'Defeat for bonus loot'],
    actors: [actor('enemy', 'enemy', point(129, 64), point(182, 64), BEFORE), actor('you', 'player', point(62, 64), point(155, 64))],
    effects: [
      effect('edge', 'boundary', point(224, 20), { to: point(224, 108), label: 'EDGE' }),
      effect('hit', 'hit', point(182, 64), { visible: AFTER }),
      effect('loot', 'label', point(182, 90), { label: 'BONUS', color: '#facc15', visible: AFTER }),
    ],
  },
};

export const getEnemyMechanicDemo = (id: EnemyArchetypeId): MechanicDemo => ({
  ...ENEMY_DEMOS[id], sourceId: id, scope: 'Schematic counterplay sequence.',
});

interface CampaignDemoPattern {
  family: string;
  title: string;
  label: string;
  phase: 1 | 2 | 3;
  counterplay: string;
  steps: DemoSteps<string>;
  destination: DemoPoint;
  includeFrostFan?: boolean;
}

const CAMPAIGN_PATTERNS: Record<CampaignBossMechanicId, CampaignDemoPattern> = {
  'sepulchral-silence': {
    family: 'annular-warning', title: 'Closing silence ring', label: 'CLOSING SILENCE', phase: 2,
    counterplay: 'Cross beyond the ring before impact. This annular warning has an inner opening, but other attacks can still hit there.',
    steps: ['Ring marks position', 'Cross before impact', 'Outside this ring'], destination: point(580, -155),
  },
  'vowclock-edict': {
    family: 'cross-warning', title: 'Crossing clock hands', label: 'VOWCLOCK HAND', phase: 2,
    counterplay: 'Move diagonally off the crossing marker rows. Leave recorded positions too; the echo is a separate attack.',
    steps: ['Crossing rows marked', 'Move diagonally', 'Rows strike old position'], destination: point(500, -180),
  },
  'seasonal-convergence': {
    family: 'meteor-fan', title: 'Meteor and Frost fan', label: 'CONVERGENCE METEOR', phase: 3,
    counterplay: 'Move sideways out of the meteor marker and the incoming Frost fan. Keep Dash available; seasonal patches can overlap this attack.',
    steps: ['Meteor and fan aimed', 'Move sideways / Dash', 'Leave both attack paths'], destination: point(360, -190), includeFrostFan: true,
  },
  'seven-anchor-dominion': {
    family: 'anchor-gap', title: 'Final anchor formation', label: 'ANCHOR COLLAPSE', phase: 3,
    counterplay: 'The final formation omits one marker. Move through that opening early; the pull is toward the boss, not the center of the marker ring.',
    steps: ['Final anchors marked', 'Move through opening', 'Clear the marked circles'],
    destination: point(320 + Math.cos(Math.PI * 2 / 7) * 260, Math.sin(Math.PI * 2 / 7) * 260),
  },
  'worldforge-root': {
    family: 'eruption-chain', title: 'Worldforge eruption chain', label: 'WORLDFORGE ERUPTION', phase: 3,
    counterplay: 'Move sideways off the eruption chain before its staggered impacts. Persistent root zones are separate hazards to avoid.',
    steps: ['Chain aimed at you', 'Sidestep the line', 'Eruptions follow old line'], destination: point(320, -170),
  },
  'one-perfect-second': {
    family: 'recorded-positions', title: 'Recorded afterimages', label: 'AFTERIMAGE STRIKE', phase: 1,
    counterplay: 'Keep moving away from your recorded positions instead of retracing the route. Later clockface markers add another threat.',
    steps: ['Recent positions recorded', 'Leave the recorded route', 'Afterimages strike behind'], destination: point(410, -165),
  },
  'sevenfold-convergence': {
    family: 'annular-warning', title: 'Collapsing orbit ring', label: 'COLLAPSING ORBIT', phase: 2,
    counterplay: 'Cross beyond the annular warning before impact. The inner opening is not a guaranteed safe zone against the separate elemental orbit strikes.',
    steps: ['Orbit ring marks position', 'Cross before impact', 'Outside this ring'], destination: point(580, -155),
  },
};

const BOSS_SCOPE = 'Schematic of one attack; other hazards can overlap.';
const project = ({ x, y }: DemoPoint): DemoPoint => point(44 + x * 0.22, 64 + y * 0.22);

const campaignEffect = (action: CampaignBossAction, index: number): DemoEffect | undefined => {
  if (action.kind === 'warning') {
    return effect(`warning-${index}`, 'warning', project(action), {
      radius: action.radius * 0.22,
      innerRadius: action.innerRadius === undefined ? undefined : action.innerRadius * 0.22,
      color: action.color,
    });
  }
  if (action.kind === 'projectile') {
    return effect(`projectile-${index}`, 'projectile', project(action), {
      to: project(point(action.x + action.vx * 100, action.y + action.vy * 100)),
      radius: action.radius * 0.22, color: action.color,
    });
  }
};

const getCampaignDemo = (id: CampaignBossMechanicId): MechanicDemo => {
  const pattern = CAMPAIGN_PATTERNS[id];
  const state = createCampaignBossMechanicState();
  state.recordedTargets = [point(220, 0), point(260, 0)];
  // Sample the actual pure combat step. Only the named attack is shown, not a full encounter.
  const { actions } = stepCampaignBossMechanic(state, {
    mechanicId: id, phase: pattern.phase, combatSpeed: 1,
    bossX: 0, bossY: 0, targetX: 320, targetY: 0, random: () => 0.25,
  });
  const selected = actions.filter(action =>
    (action.kind === 'warning' && action.label === pattern.label)
    || (pattern.includeFrostFan && action.kind === 'projectile' && action.element === 'Cryo'),
  );
  return {
    sourceId: id, family: pattern.family, title: pattern.title, phase: pattern.phase,
    counterplay: pattern.counterplay, scope: BOSS_SCOPE, steps: pattern.steps,
    actors: [actor('enemy', 'enemy', project(point(0, 0))), actor('you', 'player', project(point(320, 0)), project(pattern.destination))],
    effects: selected.map(campaignEffect).filter((value): value is DemoEffect => value !== undefined),
  };
};

export const getBossMechanicDemo = (identity: BossIdentity): MechanicDemo => {
  if (identity.campaignMechanicId) return getCampaignDemo(identity.campaignMechanicId);

  const enemy = point(47, 64);
  const player = point(165, 64);
  const actors = [actor('enemy', 'enemy', enemy), actor('you', 'player', player, point(162, 24))];
  const base = { sourceId: identity.mechanicProfile, actors, scope: BOSS_SCOPE, phase: 1 as const };
  switch (identity.mechanicProfile) {
    case 'fire_dragon': return {
      ...base, family: 'aimed-projectile', title: 'Aimed fireball',
      counterplay: 'Move sideways off the aimed fireball path. Later phases add burning patches and meteor markers; this path does not avoid those.',
      steps: ['Fireball aimed at you', 'Sidestep its path', 'Fireball passes old position'],
      effects: [effect('fireball', 'projectile', enemy, { to: point(211, 64), radius: 4, color: '#fb923c' })],
    };
    case 'ice_golem': return {
      ...base, family: 'projectile-fan', title: 'Three-shard fan',
      counterplay: 'Sidestep outside the three-shard spread. Later ice fields and the final close-range aura must also be avoided.',
      steps: ['Three shards aimed', 'Sidestep the fan', 'Shards pass old position'],
      effects: [-0.25, 0, 0.25].map((angle, index) => effect(`shard-${index}`, 'projectile', enemy, {
        to: point(enemy.x + Math.cos(angle) * 150, enemy.y + Math.sin(angle) * 150), radius: 3, color: '#a5f3fc',
      })),
    };
    case 'thunderbird': return {
      ...base, family: 'ground-marker', title: 'Lightning lock-on',
      counterplay: 'Move as soon as the lightning marker appears; the bolt hits the marked position. Later phases add grouped and repeated warnings.',
      steps: ['Position marked', 'Leave the marker', 'Lightning hits old position'],
      effects: [effect('lightning', 'warning', player, { radius: 20, color: '#c084fc' })],
    };
  }
};

export const getDemoEnemyColor = (id: EnemyArchetypeId) =>
  id === 'stalker' ? '#f87171' : getEnemyArchetypeDefinition(id).color;
