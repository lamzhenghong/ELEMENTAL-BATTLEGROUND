import type { CloudLocalMetadata, CloudSaveBundle } from './cloudSaveModel';
import { isCloudSaveBundle } from './cloudSaveModel';

export const LOCAL_GAME_SAVE_KEY = 'aetheria_rpg_save_v3';
export const LOCAL_PULL_HISTORY_KEY = 'aetheria_pull_history';
export const CLOUD_LOCAL_METADATA_KEY = 'aetheria_cloud_meta_v1';
export const CLOUD_DEVICE_ID_KEY = 'aetheria_cloud_device_v1';

const makeDeviceId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

export const getOrCreateCloudDeviceId = (
  storage: Storage,
  generateId: () => string = makeDeviceId
) => {
  const stored = storage.getItem(CLOUD_DEVICE_ID_KEY);
  if (stored) return stored;
  const created = generateId();
  storage.setItem(CLOUD_DEVICE_ID_KEY, created);
  return created;
};

export const hasLocalGameSave = (storage: Storage) => {
  const value = storage.getItem(LOCAL_GAME_SAVE_KEY);
  return value !== null && value !== 'null';
};

export const readLocalCloudBundle = <TSave>(storage: Storage): CloudSaveBundle<TSave> | null => {
  try {
    const saveJson = storage.getItem(LOCAL_GAME_SAVE_KEY);
    if (!saveJson) return null;
    const saveState = JSON.parse(saveJson);
    const pullHistoryJson = storage.getItem(LOCAL_PULL_HISTORY_KEY);
    const pullHistory = pullHistoryJson ? JSON.parse(pullHistoryJson) : [];
    const bundle = { saveState, pullHistory };
    return isCloudSaveBundle(bundle) ? bundle as CloudSaveBundle<TSave> : null;
  } catch {
    return null;
  }
};

export const writeLocalCloudBundle = <TSave>(storage: Storage, bundle: CloudSaveBundle<TSave>) => {
  storage.setItem(LOCAL_GAME_SAVE_KEY, JSON.stringify(bundle.saveState));
  storage.setItem(LOCAL_PULL_HISTORY_KEY, JSON.stringify(bundle.pullHistory.slice(0, 100)));
};

const isCloudLocalMetadata = (value: unknown): value is CloudLocalMetadata => {
  if (!value || typeof value !== 'object') return false;
  const metadata = value as Partial<CloudLocalMetadata>;
  return typeof metadata.userId === 'string'
    && Number.isInteger(metadata.revision)
    && (metadata.revision ?? 0) > 0
    && typeof metadata.updatedAt === 'string'
    && typeof metadata.deviceId === 'string'
    && typeof metadata.lastSyncedFingerprint === 'string';
};

export const readCloudLocalMetadata = (storage: Storage): CloudLocalMetadata | null => {
  try {
    const value = storage.getItem(CLOUD_LOCAL_METADATA_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return isCloudLocalMetadata(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeCloudLocalMetadata = (storage: Storage, metadata: CloudLocalMetadata) => {
  storage.setItem(CLOUD_LOCAL_METADATA_KEY, JSON.stringify(metadata));
};

export const clearCloudLocalMetadata = (storage: Storage) => {
  storage.removeItem(CLOUD_LOCAL_METADATA_KEY);
};
