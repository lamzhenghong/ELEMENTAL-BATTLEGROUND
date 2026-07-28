import type { EnemyArchetypeId } from './enemyArchetypes';

export const SIPHON_DRAIN_INTERVAL_FRAMES = 5 * 60;
export const SIPHON_ENERGY_DRAIN_RATIO = 0.05;

export const getElapsedCombatFrames = (deltaMs: number, combatSpeed = 1) => (
  Math.min(3, Math.max(0, deltaMs / (1000 / 60))) * Math.max(0, combatSpeed)
);

export const getArchetypeMoveDirection = (
  archetypeId: EnemyArchetypeId,
  distanceToPlayer: number
): -1 | 0 | 1 => {
  if (archetypeId === 'relic-carrier') return -1;
  if (archetypeId === 'artillery' || archetypeId === 'siphon' || archetypeId === 'mimic') {
    if (distanceToPlayer < 220) return -1;
    if (distanceToPlayer > 420) return 1;
    return 0;
  }
  return 1;
};

interface SupportTarget {
  id: string;
  type: 'Normal' | 'Elite' | 'Boss';
  hp: number;
  maxHp: number;
}

export type ChannelerSupportAction =
  | { kind: 'revive'; targetId: string; amount: number }
  | { kind: 'heal'; targetId: string; amount: number }
  | { kind: 'buff'; targetId: string; amount: number };

export const chooseChannelerSupportAction = (
  channelerId: string,
  enemies: readonly SupportTarget[]
): ChannelerSupportAction | null => {
  const eligible = enemies.filter(enemy => enemy.id !== channelerId && enemy.type !== 'Boss');
  const defeated = eligible.find(enemy => enemy.hp <= 0);
  if (defeated) {
    return { kind: 'revive', targetId: defeated.id, amount: Math.round(defeated.maxHp * 0.3) };
  }
  const wounded = eligible
    .filter(enemy => enemy.hp > 0 && enemy.hp < enemy.maxHp)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (wounded) {
    return { kind: 'heal', targetId: wounded.id, amount: Math.round(wounded.maxHp * 0.18) };
  }
  const ally = eligible.find(enemy => enemy.hp > 0);
  return ally ? { kind: 'buff', targetId: ally.id, amount: 180 } : null;
};

const roundEnergy = (value: number) => Math.round(value * 100) / 100;

export const getSiphonEnergyTransfer = (currentEnergy: number) => {
  const availableEnergy = Math.max(0, currentEnergy);
  const stolenEnergy = roundEnergy(availableEnergy * SIPHON_ENERGY_DRAIN_RATIO);
  return {
    remainingEnergy: roundEnergy(Math.max(0, availableEnergy - stolenEnergy)),
    stolenEnergy
  };
};

export const tickSiphonDrainTimer = (remainingFrames: number, elapsedFrames: number) => {
  const nextRemainingFrames = Math.max(0, remainingFrames - Math.max(0, elapsedFrames));
  if (nextRemainingFrames > 0) {
    return { remainingFrames: nextRemainingFrames, shouldDrain: false };
  }
  return {
    remainingFrames: SIPHON_DRAIN_INTERVAL_FRAMES,
    shouldDrain: true
  };
};

export const getStalkerAmbushPosition = (
  player: { x: number; y: number; lastDirX: number; lastDirY: number },
  distance: number
) => ({
  x: player.x - player.lastDirX * distance,
  y: player.y - player.lastDirY * distance
});

export const isRelicCarrierAtExit = (
  x: number,
  y: number,
  worldWidth = 2000,
  worldHeight = 2000,
  margin = 35
) => x <= margin || y <= margin || x >= worldWidth - margin || y >= worldHeight - margin;

export const isAttackerFlanking = (
  attacker: { x: number; y: number },
  defender: { x: number; y: number; facingX?: number; facingY?: number }
) => {
  const facingX = defender.facingX ?? 1;
  const facingY = defender.facingY ?? 0;
  const attackerDx = attacker.x - defender.x;
  const attackerDy = attacker.y - defender.y;
  const attackerDistance = Math.hypot(attackerDx, attackerDy);
  const facingDistance = Math.hypot(facingX, facingY);
  if (attackerDistance === 0 || facingDistance === 0) return false;
  const dot = (
    (attackerDx / attackerDistance) * (facingX / facingDistance)
    + (attackerDy / attackerDistance) * (facingY / facingDistance)
  );
  return dot < -0.35;
};
