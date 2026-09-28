type FormableEnemy = { id: string; type: string; archetypeId?: string; x: number; y: number; radius: number };

const ROLE_ORDER: Record<string, number> = {
  bulwark: 0, stalker: 1, mimic: 2, siphon: 3, summoner: 4, channeler: 5, artillery: 6,
};

export function arrangeEnemyFormation<T extends FormableEnemy>(enemies: readonly T[], width: number, height: number): T[] {
  const eligible = enemies
    .map((enemy, index) => ({ enemy, index }))
    .filter(({ enemy }) => enemy.type !== 'Boss' && enemy.archetypeId !== 'relic-carrier')
    .sort((a, b) => (ROLE_ORDER[a.enemy.archetypeId ?? ''] ?? 3) - (ROLE_ORDER[b.enemy.archetypeId ?? ''] ?? 3) || a.index - b.index);
  if (eligible.length === 0) return [...enemies];

  const result = [...enemies];
  const centerX = width / 2;
  const centerY = height / 2;
  const count = eligible.length;
  const columns = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(count * 2))));
  eligible.forEach(({ enemy, index }, order) => {
    const row = Math.floor(order / columns);
    const column = order % columns;
    const rowCount = Math.min(columns, count - row * columns);
    const spacing = 100;
    const x = centerX + (column - (rowCount - 1) / 2) * spacing;
    const y = centerY - 310 - row * 110;
    result[index] = {
      ...enemy,
      x: Math.max(enemy.radius + 30, Math.min(width - enemy.radius - 30, x)),
      y: Math.max(enemy.radius + 30, Math.min(height - enemy.radius - 30, y)),
    };
  });
  return result;
}
