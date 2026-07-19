import {
  CLOUD_SAVE_VERSION,
  type CloudSaveBundle,
  type CloudSaveRecord,
  isCloudSaveBundle
} from './cloudSaveModel';

export interface GameSaveRow {
  user_id: string;
  save_data: unknown;
  pull_history: unknown;
  save_version: number;
  revision: number;
  updated_at: string;
  last_device_id: string | null;
}

export type NewGameSaveRow = Omit<GameSaveRow, 'updated_at'>;
export type GameSaveUpdate = Pick<
  GameSaveRow,
  'save_data' | 'pull_history' | 'save_version' | 'revision' | 'last_device_id'
>;

export interface CloudSaveDataSource {
  selectByUserId(userId: string): Promise<GameSaveRow | null>;
  insert(values: NewGameSaveRow): Promise<GameSaveRow>;
  updateIfRevisionMatches(
    userId: string,
    expectedRevision: number,
    values: GameSaveUpdate
  ): Promise<GameSaveRow | null>;
  deleteByUserId(userId: string): Promise<void>;
}

export class CloudRevisionConflictError extends Error {
  constructor() {
    super('Cloud save changed on another device.');
    this.name = 'CloudRevisionConflictError';
  }
}

const mapGameSaveRow = <TSave>(row: GameSaveRow): CloudSaveRecord<TSave> => {
  const bundle = {
    saveState: row.save_data,
    pullHistory: row.pull_history
  };
  if (!isCloudSaveBundle(bundle)) {
    throw new Error('Invalid cloud save payload returned by the database.');
  }
  if (!Number.isInteger(row.revision) || row.revision < 1) {
    throw new Error('Invalid cloud save revision returned by the database.');
  }
  return {
    userId: row.user_id,
    bundle: bundle as CloudSaveBundle<TSave>,
    saveVersion: row.save_version,
    revision: row.revision,
    updatedAt: row.updated_at,
    lastDeviceId: row.last_device_id
  };
};

export const createCloudSaveRepository = <TSave>(dataSource: CloudSaveDataSource) => ({
  async fetch(userId: string): Promise<CloudSaveRecord<TSave> | null> {
    const row = await dataSource.selectByUserId(userId);
    return row ? mapGameSaveRow<TSave>(row) : null;
  },

  async create(
    userId: string,
    bundle: CloudSaveBundle<TSave>,
    deviceId: string
  ): Promise<CloudSaveRecord<TSave>> {
    const row = await dataSource.insert({
      user_id: userId,
      save_data: bundle.saveState,
      pull_history: bundle.pullHistory.slice(0, 100),
      save_version: CLOUD_SAVE_VERSION,
      revision: 1,
      last_device_id: deviceId
    });
    return mapGameSaveRow<TSave>(row);
  },

  async update(
    userId: string,
    expectedRevision: number,
    bundle: CloudSaveBundle<TSave>,
    deviceId: string
  ): Promise<CloudSaveRecord<TSave>> {
    const row = await dataSource.updateIfRevisionMatches(userId, expectedRevision, {
      save_data: bundle.saveState,
      pull_history: bundle.pullHistory.slice(0, 100),
      save_version: CLOUD_SAVE_VERSION,
      revision: expectedRevision + 1,
      last_device_id: deviceId
    });
    if (!row) throw new CloudRevisionConflictError();
    return mapGameSaveRow<TSave>(row);
  },

  async remove(userId: string) {
    await dataSource.deleteByUserId(userId);
  }
});
