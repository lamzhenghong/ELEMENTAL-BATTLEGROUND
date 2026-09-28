import assert from 'node:assert/strict';
import test from 'node:test';
import { arrangeEnemyFormation } from './enemyFormation';

test('formation preserves enemy identities and boss and relic positions', () => {
  const enemies = [
    { id: 'shield', type: 'Elite', archetypeId: 'bulwark', x: 10, y: 10, radius: 30 },
    { id: 'healer', type: 'Normal', archetypeId: 'channeler', x: 11, y: 11, radius: 24 },
    { id: 'gun', type: 'Normal', archetypeId: 'artillery', x: 12, y: 12, radius: 24 },
    { id: 'boss', type: 'Boss', x: 700, y: 700, radius: 80 },
    { id: 'relic', type: 'Normal', archetypeId: 'relic-carrier', x: 800, y: 800, radius: 24 },
  ];
  const result = arrangeEnemyFormation(enemies, 1000, 1000);
  assert.deepEqual(result.map(enemy => enemy.id), enemies.map(enemy => enemy.id));
  assert.deepEqual(result[3], enemies[3]);
  assert.deepEqual(result[4], enemies[4]);
  for (const enemy of result.slice(0, 3)) {
    assert.ok(enemy.x > enemy.radius && enemy.x < 1000 - enemy.radius);
    assert.ok(enemy.y > enemy.radius && enemy.y < 1000 - enemy.radius);
    assert.ok(Math.hypot(enemy.x - 500, enemy.y - 500) > 180);
  }
  assert.ok(Math.hypot(result[0].x - result[1].x, result[0].y - result[1].y) > 60);
});
