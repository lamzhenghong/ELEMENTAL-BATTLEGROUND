import assert from 'node:assert/strict';
import {
  CloudRevisionConflictError,
  createCloudSaveRepository,
  type CloudSaveDataSource,
  type GameSaveRow
} from './cloudSaveRepository';

const bundle = {
  saveState: { playerLevel: 40, aetherGems: 12000 },
  pullHistory: [{ name: 'Maelis', rarity: 5, time: '18:00' }]
};

let row: GameSaveRow | null = null;
let updateShouldConflict = false;
const dataSource: CloudSaveDataSource = {
  async selectByUserId() {
    return row;
  },
  async insert(values) {
    row = {
      ...values,
      updated_at: '2026-07-20T15:00:00.000Z'
    };
    return row;
  },
  async updateIfRevisionMatches(_userId, expectedRevision, values) {
    if (!row || updateShouldConflict || row.revision !== expectedRevision) return null;
    row = { ...row, ...values, updated_at: '2026-07-20T15:05:00.000Z' };
    return row;
  },
  async deleteByUserId() {
    row = null;
  }
};

const repository = createCloudSaveRepository(dataSource);
assert.equal(await repository.fetch('user-1'), null);

const created = await repository.create('user-1', bundle, 'device-a');
assert.equal(created.userId, 'user-1');
assert.equal(created.revision, 1);
assert.equal(created.lastDeviceId, 'device-a');
assert.deepEqual(created.bundle, bundle);

const updatedBundle = {
  saveState: { playerLevel: 41, aetherGems: 13000 },
  pullHistory: bundle.pullHistory
};
const updated = await repository.update('user-1', 1, updatedBundle, 'device-a');
assert.equal(updated.revision, 2);
assert.deepEqual(updated.bundle, updatedBundle);

updateShouldConflict = true;
await assert.rejects(
  () => repository.update('user-1', 2, updatedBundle, 'device-b'),
  CloudRevisionConflictError
);

updateShouldConflict = false;
await repository.remove('user-1');
assert.equal(await repository.fetch('user-1'), null);

const invalidDataSource: CloudSaveDataSource = {
  ...dataSource,
  async selectByUserId() {
    return {
      user_id: 'user-1',
      save_data: null,
      pull_history: [],
      save_version: 1,
      revision: 1,
      updated_at: '2026-07-20T15:00:00.000Z',
      last_device_id: null
    };
  }
};
await assert.rejects(() => createCloudSaveRepository(invalidDataSource).fetch('user-1'), /invalid cloud save payload/i);

console.log('cloud save repository rules ok');
