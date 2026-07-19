import assert from 'node:assert/strict';
import { mapPlayerProfileRow, normalizeUsername, validateUsername } from './playerProfile';

assert.equal(normalizeUsername('  Aether_Hero  '), 'Aether_Hero');
assert.equal(validateUsername('ab'), 'Username must be 3 to 20 characters.');
assert.equal(validateUsername('a'.repeat(21)), 'Username must be 3 to 20 characters.');
assert.equal(
  validateUsername('Aether Hero'),
  'Username can only use letters, numbers, and underscores.'
);
assert.equal(validateUsername('Aether-Hero'), 'Username can only use letters, numbers, and underscores.');
assert.equal(validateUsername('Aether_Hero20'), null);

assert.deepEqual(
  mapPlayerProfileRow({
    user_id: 'user-123',
    username: 'Aether_Hero',
    public_id: 'AETH-ABCDEF123456',
    created_at: '2026-07-20T00:00:00.000Z',
    updated_at: '2026-07-20T00:00:00.000Z'
  }),
  {
    userId: 'user-123',
    username: 'Aether_Hero',
    publicId: 'AETH-ABCDEF123456',
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z'
  }
);

console.log('player profile domain rules ok');
