import assert from 'node:assert/strict';
import {
  CLOUD_SAVE_VERSION,
  decideInitialCloudSync,
  fingerprintCloudBundle,
  isCloudSaveBundle
} from './cloudSaveModel';

const localBundle = {
  saveState: { playerLevel: 12, mora: 45000, nested: { b: 2, a: 1 } },
  pullHistory: [{ name: 'Aurelia', rarity: 5, time: '12:00' }]
};

const localFingerprint = fingerprintCloudBundle(localBundle);
const remote = {
  userId: 'user-1',
  bundle: localBundle,
  saveVersion: CLOUD_SAVE_VERSION,
  revision: 4,
  updatedAt: '2026-07-20T10:00:00.000Z',
  lastDeviceId: 'device-a'
};

assert.equal(
  fingerprintCloudBundle({
    pullHistory: [{ time: '12:00', rarity: 5, name: 'Aurelia' }],
    saveState: { nested: { a: 1, b: 2 }, mora: 45000, playerLevel: 12 }
  }),
  localFingerprint,
  'fingerprints must be stable when Postgres JSONB reorders object keys'
);

assert.equal(isCloudSaveBundle(localBundle), true);
assert.equal(isCloudSaveBundle({ saveState: null, pullHistory: [] }), false);
assert.equal(isCloudSaveBundle({ saveState: {}, pullHistory: {} }), false);

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote: null,
    hasLocalSave: true,
    localFingerprint,
    localMetadata: null
  }),
  { action: 'upload-local', reason: 'cloud-empty' }
);

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote: null,
    hasLocalSave: false,
    localFingerprint,
    localMetadata: null
  }),
  { action: 'create-default', reason: 'cloud-and-device-empty' }
);

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote,
    hasLocalSave: false,
    localFingerprint,
    localMetadata: null
  }),
  { action: 'load-cloud', reason: 'device-empty' }
);

const syncedMetadata = {
  userId: 'user-1',
  revision: 4,
  updatedAt: remote.updatedAt,
  deviceId: 'device-a',
  lastSyncedFingerprint: localFingerprint
};

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote,
    hasLocalSave: true,
    localFingerprint,
    localMetadata: syncedMetadata
  }),
  { action: 'load-cloud', reason: 'already-synced' }
);

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote,
    hasLocalSave: true,
    localFingerprint: 'dirty-local',
    localMetadata: syncedMetadata
  }),
  { action: 'upload-local', reason: 'local-newer' }
);

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote: { ...remote, revision: 5 },
    hasLocalSave: true,
    localFingerprint,
    localMetadata: syncedMetadata
  }),
  { action: 'load-cloud', reason: 'cloud-newer' }
);

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote: { ...remote, revision: 5 },
    hasLocalSave: true,
    localFingerprint: 'dirty-local',
    localMetadata: syncedMetadata
  }),
  { action: 'conflict', reason: 'both-changed' }
);

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote,
    hasLocalSave: true,
    localFingerprint,
    localMetadata: null
  }),
  { action: 'conflict', reason: 'legacy-local-and-cloud' }
);

assert.deepEqual(
  decideInitialCloudSync({
    userId: 'user-1',
    remote,
    hasLocalSave: true,
    localFingerprint,
    localMetadata: { ...syncedMetadata, userId: 'user-2' }
  }),
  { action: 'conflict', reason: 'different-account' }
);

console.log('cloud save model rules ok');
