import type { EnemyArchetypeId } from './enemyArchetypes';

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

export const getSiphonEnergyTransfer = (currentEnergy: number, requestedAmount: number) => {
  const stolenEnergy = Math.min(Math.max(0, currentEnergy), Math.max(0, requestedAmount));
  return {
    remainingEnergy: Math.max(0, currentEnergy - stolenEnergy),
    stolenEnergy
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
