import type { CloudSyncStatus } from '../cloud/useCloudAccount';

export type LocalSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export interface LocalSaveSnapshot {
  status: LocalSaveStatus;
  revision: number;
}

export const createLocalSaveTracker = () => {
  let snapshot: LocalSaveSnapshot = { status: 'idle', revision: 0 };
  const listeners = new Set<() => void>();
  const failedKeys = new Set<string>();
  const publish = (status: LocalSaveStatus, revision = snapshot.revision) => {
    snapshot = { status, revision };
    listeners.forEach(listener => listener());
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    write: (storage: Pick<Storage, 'setItem'>, key: string, value: unknown, options?: { acknowledgesProgress?: boolean }) => {
      publish(failedKeys.size ? 'error' : 'saving');
      try {
        // Report success only after serialization and storage both succeed.
        storage.setItem(key, JSON.stringify(value));
        // Metadata derived from an older stored snapshot cannot acknowledge lost progress.
        if (options?.acknowledgesProgress !== false) failedKeys.delete(key);
        publish(failedKeys.size ? 'error' : 'saved', snapshot.revision + 1);
      } catch (error) {
        failedKeys.add(key);
        publish('error');
        throw error;
      }
    },
  };
};

export const localSaveTracker = createLocalSaveTracker();
export const writeTrackedLocalJson = localSaveTracker.write;

export const getSaveIndicatorPresentation = (
  localStatus: LocalSaveStatus,
  cloudStatus: CloudSyncStatus,
  ready: boolean,
) => {
  const localDetail = localStatus === 'saved'
    ? 'Your latest progress is saved on this device.'
    : 'Progress is saved locally when it changes.';
  if (localStatus === 'error') return {
    icon: 'error', tone: 'error', label: 'Device save failed',
    detail: 'Progress is still in this session, but a device write failed. Free browser storage and try saving again before closing.',
  } as const;
  if (!ready) return { icon: 'busy', tone: 'neutral', label: 'Loading save', detail: 'Reading saved progress on this device.' } as const;
  if (localStatus === 'saving') return { icon: 'busy', tone: 'neutral', label: 'Saving on device', detail: 'Writing progress to device storage.' } as const;
  if (cloudStatus === 'saving' || cloudStatus === 'checking') return {
    icon: 'busy', tone: 'neutral', label: cloudStatus === 'saving' ? 'Syncing cloud save' : 'Checking cloud save', detail: localDetail,
  } as const;
  if (cloudStatus === 'offline' || cloudStatus === 'error' || cloudStatus === 'conflict') return {
    icon: 'cloud-warning', tone: 'warning',
    label: cloudStatus === 'offline' ? 'Cloud offline' : cloudStatus === 'conflict' ? 'Choose save version' : 'Cloud sync failed',
    detail: `${localDetail} ${cloudStatus === 'conflict' ? 'Open Account to resolve the version conflict.' : 'Open Account to retry cloud sync.'}`,
  } as const;
  if (cloudStatus === 'synced') return { icon: 'cloud', tone: 'success', label: 'Cloud synced', detail: localDetail } as const;
  return {
    icon: localStatus === 'saved' ? 'saved' : 'local', tone: localStatus === 'saved' ? 'success' : 'neutral',
    label: localStatus === 'saved' ? 'Saved on device' : 'Local autosave ready',
    detail: `${localDetail} Sign in to sync across devices.`,
  } as const;
};
