import type { CloudSyncStatus } from './useCloudAccount';

export const getCurrentCloudSyncStatus = (
  status: CloudSyncStatus,
  currentFingerprint: string,
  lastSyncedFingerprint: string | null,
): CloudSyncStatus => status === 'synced' && currentFingerprint !== lastSyncedFingerprint
  ? 'saving'
  : status;
