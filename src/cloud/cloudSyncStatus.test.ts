import assert from 'node:assert/strict';
import test from 'node:test';
import { getCurrentCloudSyncStatus } from './cloudSyncStatus';

test('cloud success applies only to the acknowledged progress fingerprint', () => {
  assert.equal(getCurrentCloudSyncStatus('synced', 'new-progress', 'old-progress'), 'saving');
  assert.equal(getCurrentCloudSyncStatus('synced', 'progress', null), 'saving');
  assert.equal(getCurrentCloudSyncStatus('synced', 'progress', 'progress'), 'synced');
});

test('pending progress never hides cloud errors, conflicts, offline state or guest state', () => {
  for (const status of ['guest', 'checking', 'saving', 'error', 'conflict', 'offline', 'unavailable'] as const) {
    assert.equal(getCurrentCloudSyncStatus(status, 'new-progress', 'old-progress'), status);
  }
});
