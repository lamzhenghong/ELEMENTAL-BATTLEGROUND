import type { EnemyDamageVisualState } from '../../utils/damageFeedback';

type EnemyDamageMaterialKind = 'armored' | 'stone' | 'magical' | 'organic';

const hashText = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  return Math.abs(hash);
};

export const getEnemyDamageMaterialKind = (enemy: {
  name?: string;
  type?: string;
  archetypeId?: string;
}): EnemyDamageMaterialKind => {
  const text = `${enemy.name || ''} ${enemy.type || ''} ${enemy.archetypeId || ''}`.toLowerCase();
  if (/golem|colossus|stone|geo|ruin/.test(text)) return 'stone';
  if (/mage|echo|void|aether|wisp|siphon|mimic/.test(text)) return 'magical';
  if (/slime|myconid|bloom|organic|beast/.test(text)) return 'organic';
  return 'armored';
};

export const drawEnemyDamageVisualState = (
  ctx: CanvasRenderingContext2D,
  enemy: { id?: string; name?: string; type?: string; archetypeId?: string },
  x: number,
  y: number,
  radius: number,
  state: EnemyDamageVisualState,
  timeMs: number,
): void => {
  if (state === 'normal' || radius <= 0) return;
  const kind = getEnemyDamageMaterialKind(enemy);
  const seed = hashText(enemy.id || enemy.name || kind);
  const lineCount = state === 'critical' ? 4 : 2;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1, radius * 0.045);
  ctx.strokeStyle = kind === 'magical'
    ? `rgba(216,180,254,${state === 'critical' ? 0.82 : 0.48})`
    : kind === 'organic'
      ? `rgba(254,202,202,${state === 'critical' ? 0.72 : 0.42})`
      : `rgba(226,232,240,${state === 'critical' ? 0.75 : 0.4})`;
  if (kind === 'magical') {
    ctx.shadowColor = '#d8b4fe';
    ctx.shadowBlur = 4 + Math.sin(timeMs / 180) * 1.5;
  }

  for (let index = 0; index < lineCount; index += 1) {
    const angle = ((seed % 17) / 17) * Math.PI * 2 + index * 1.7;
    const startX = x + Math.cos(angle) * radius * 0.18;
    const startY = y + Math.sin(angle) * radius * 0.18;
    const midAngle = angle + (index % 2 === 0 ? 0.28 : -0.28);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x + Math.cos(midAngle) * radius * 0.52, y + Math.sin(midAngle) * radius * 0.52);
    ctx.lineTo(x + Math.cos(angle) * radius * 0.82, y + Math.sin(angle) * radius * 0.82);
    ctx.stroke();
  }
  ctx.restore();
};
