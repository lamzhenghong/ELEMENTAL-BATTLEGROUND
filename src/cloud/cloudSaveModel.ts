export const CLOUD_SAVE_VERSION = 1;

export interface CloudPullHistoryEntry {
  name: string;
  rarity: number;
  time: string;
}

export interface CloudSaveBundle<TSave = unknown> {
  saveState: TSave;
  pullHistory: CloudPullHistoryEntry[];
}

export interface CloudSaveRecord<TSave = unknown> {
  userId: string;
  bundle: CloudSaveBundle<TSave>;
  saveVersion: number;
  revision: number;
  updatedAt: string;
  lastDeviceId: string | null;
}

export interface CloudLocalMetadata {
  userId: string;
  revision: number;
  updatedAt: string;
  deviceId: string;
  lastSyncedFingerprint: string;
}

export type CloudSyncDecision =
  | { action: 'upload-local'; reason: 'cloud-empty' | 'local-newer' }
  | { action: 'create-default'; reason: 'cloud-and-device-empty' }
  | { action: 'load-cloud'; reason: 'device-empty' | 'already-synced' | 'cloud-newer' }
  | { action: 'conflict'; reason: 'both-changed' | 'legacy-local-and-cloud' | 'different-account' | 'cloud-revision-behind' };

export interface InitialCloudSyncInput<TSave = unknown> {
  userId: string;
  remote: CloudSaveRecord<TSave> | null;
  hasLocalSave: boolean;
  localFingerprint: string;
  localMetadata: CloudLocalMetadata | null;
}

const stableSerialize = (value: unknown): string => {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (Array.isArray(value)) {
    return `[${value.map(item => stableSerialize(item === undefined ? null : item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const pairs = Object.keys(record)
      .filter(key => record[key] !== undefined)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableSerialize(record[key])}`);
    return `{${pairs.join(',')}}`;
  }
  return 'null';
};

export const fingerprintCloudBundle = (bundle: CloudSaveBundle): string => {
  const serialized = stableSerialize(bundle);
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `v1:${serialized.length}:${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

export const isCloudSaveBundle = (value: unknown): value is CloudSaveBundle => {
  if (!value || typeof value !== 'object') return false;
  const bundle = value as Partial<CloudSaveBundle>;
  return !!bundle.saveState
    && typeof bundle.saveState === 'object'
    && !Array.isArray(bundle.saveState)
    && Array.isArray(bundle.pullHistory);
};

export const decideInitialCloudSync = <TSave>({
  userId,
  remote,
  hasLocalSave,
  localFingerprint,
  localMetadata
}: InitialCloudSyncInput<TSave>): CloudSyncDecision => {
  if (!remote) {
    return hasLocalSave
      ? { action: 'upload-local', reason: 'cloud-empty' }
      : { action: 'create-default', reason: 'cloud-and-device-empty' };
  }

  if (!hasLocalSave) {
    return { action: 'load-cloud', reason: 'device-empty' };
  }

  if (!localMetadata) {
    return { action: 'conflict', reason: 'legacy-local-and-cloud' };
  }

  if (localMetadata.userId !== userId) {
    return { action: 'conflict', reason: 'different-account' };
  }

  const localChanged = localMetadata.lastSyncedFingerprint !== localFingerprint;

  if (remote.revision > localMetadata.revision) {
    return localChanged
      ? { action: 'conflict', reason: 'both-changed' }
      : { action: 'load-cloud', reason: 'cloud-newer' };
  }

  if (remote.revision < localMetadata.revision) {
    return { action: 'conflict', reason: 'cloud-revision-behind' };
  }

  return localChanged
    ? { action: 'upload-local', reason: 'local-newer' }
    : { action: 'load-cloud', reason: 'already-synced' };
};
