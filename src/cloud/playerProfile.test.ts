import assert from 'node:assert/strict';
import {
  getUsernameChangeAvailableAt,
  getUsernameChangeRemainingMs,
  mapPlayerProfileRow,
  normalizeUsername,
  USERNAME_CHANGE_COOLDOWN_MS,
  validateUsername
} from './playerProfile';

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
    updated_at: '2026-07-20T00:00:00.000Z',
    username_changed_at: null
  }),
  {
    userId: 'user-123',
    username: 'Aether_Hero',
    publicId: 'AETH-ABCDEF123456',
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
    usernameChangedAt: null
  }
);

const neverRenamed = {
  userId: 'user-123',
  username: 'Aether_Hero',
  publicId: 'AETH-ABCDEF123456',
  createdAt: '2026-07-20T00:00:00.000Z',
  updatedAt: '2026-07-20T00:00:00.000Z',
  usernameChangedAt: null
};
assert.equal(USERNAME_CHANGE_COOLDOWN_MS, 24 * 60 * 60 * 1000);
assert.equal(getUsernameChangeAvailableAt(neverRenamed), null);
assert.equal(getUsernameChangeRemainingMs(neverRenamed, Date.parse('2026-07-20T12:00:00.000Z')), 0);

const recentlyRenamed = {
  ...neverRenamed,
  usernameChangedAt: '2026-07-20T12:00:00.000Z'
};
assert.equal(
  getUsernameChangeAvailableAt(recentlyRenamed)?.toISOString(),
  '2026-07-21T12:00:00.000Z'
);
assert.equal(
  getUsernameChangeRemainingMs(recentlyRenamed, Date.parse('2026-07-20T18:00:00.000Z')),
  18 * 60 * 60 * 1000
);
assert.equal(
  getUsernameChangeRemainingMs(recentlyRenamed, Date.parse('2026-07-21T13:00:00.000Z')),
  0
);

console.log('player profile domain rules ok');
