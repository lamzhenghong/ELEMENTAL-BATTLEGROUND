import assert from 'node:assert/strict';
import {
  CLOUD_DEVICE_ID_KEY,
  CLOUD_LOCAL_METADATA_KEY,
  LOCAL_GAME_SAVE_KEY,
  clearCloudLocalMetadata,
  getOrCreateCloudDeviceId,
  hasLocalGameSave,
  readCloudLocalMetadata,
  readLocalCloudBundle,
  writeCloudLocalMetadata,
  writeLocalCloudBundle
} from './cloudLocalStorage';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const storage = new MemoryStorage();
let generatedIds = 0;
const firstDeviceId = getOrCreateCloudDeviceId(storage, () => `device-${++generatedIds}`);
const secondDeviceId = getOrCreateCloudDeviceId(storage, () => `device-${++generatedIds}`);
assert.equal(firstDeviceId, 'device-1');
assert.equal(secondDeviceId, 'device-1');
assert.equal(storage.getItem(CLOUD_DEVICE_ID_KEY), 'device-1');

assert.equal(hasLocalGameSave(storage), false);
assert.equal(readLocalCloudBundle(storage), null);

const bundle = {
  saveState: { playerLevel: 22, mora: 90000 },
  pullHistory: [{ name: 'Veyra', rarity: 5, time: '14:25' }]
};
writeLocalCloudBundle(storage, bundle);
assert.equal(hasLocalGameSave(storage), true);
assert.deepEqual(readLocalCloudBundle(storage), bundle);
assert.ok(storage.getItem(LOCAL_GAME_SAVE_KEY));

const metadata = {
  userId: 'user-1',
  revision: 8,
  updatedAt: '2026-07-20T12:00:00.000Z',
  deviceId: firstDeviceId,
  lastSyncedFingerprint: 'v1:10:12345678'
};
writeCloudLocalMetadata(storage, metadata);
assert.deepEqual(readCloudLocalMetadata(storage), metadata);

storage.setItem(CLOUD_LOCAL_METADATA_KEY, '{bad json');
assert.equal(readCloudLocalMetadata(storage), null);

writeCloudLocalMetadata(storage, metadata);
clearCloudLocalMetadata(storage);
assert.equal(readCloudLocalMetadata(storage), null);
assert.equal(storage.getItem(CLOUD_DEVICE_ID_KEY), firstDeviceId, 'sign-out must retain the stable device id');

storage.setItem(LOCAL_GAME_SAVE_KEY, 'null');
assert.equal(readLocalCloudBundle(storage), null);

console.log('cloud local storage rules ok');
