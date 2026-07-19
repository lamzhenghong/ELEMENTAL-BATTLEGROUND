import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { SaveState } from '../types';
import { formatCloudAccountError, validateCloudCredentials } from './cloudAuthValidation';
import {
  clearCloudLocalMetadata,
  getOrCreateCloudDeviceId,
  readCloudLocalMetadata,
  readLocalCloudBundle,
  writeCloudLocalMetadata,
  writeLocalCloudBundle
} from './cloudLocalStorage';
import {
  CLOUD_SAVE_VERSION,
  decideInitialCloudSync,
  fingerprintCloudBundle,
  type CloudPullHistoryEntry,
  type CloudSaveBundle,
  type CloudSaveRecord
} from './cloudSaveModel';
import { CloudRevisionConflictError, createCloudSaveRepository } from './cloudSaveRepository';
import { normalizeUsername, validateUsername, type PlayerProfile } from './playerProfile';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { createSupabaseCloudSaveDataSource } from './supabaseCloudSaveDataSource';
import { createSupabasePlayerProfileDataSource } from './supabasePlayerProfileDataSource';

export const AUTOSAVE_DELAY_MS = 3000;
export const SAFETY_SYNC_INTERVAL_MS = 30000;

export type CloudSyncStatus =
  | 'unavailable'
  | 'guest'
  | 'checking'
  | 'saving'
  | 'synced'
  | 'offline'
  | 'conflict'
  | 'error';

export type CloudAuthMode = 'sign-in' | 'sign-up' | 'forgot-password' | 'update-password';
export type CloudProfileStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface CloudSaveConflict {
  remote: CloudSaveRecord<SaveState>;
  localBundle: CloudSaveBundle<SaveState>;
}

interface UseCloudAccountOptions {
  saveState: SaveState;
  pullHistory: CloudPullHistoryEntry[];
  localSaveReady: boolean;
  hasLocalProgress: boolean;
  applyCloudBundle: (bundle: CloudSaveBundle<SaveState>) => void;
}

const repository = supabase
  ? createCloudSaveRepository<SaveState>(createSupabaseCloudSaveDataSource(supabase))
  : null;
const profileDataSource = supabase ? createSupabasePlayerProfileDataSource(supabase) : null;

const isBrowserOnline = () => typeof navigator === 'undefined' || navigator.onLine !== false;

export const useCloudAccount = ({
  saveState,
  pullHistory,
  localSaveReady,
  hasLocalProgress,
  applyCloudBundle
}: UseCloudAccountOptions) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authResolved, setAuthResolved] = useState(!isSupabaseConfigured);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(isSupabaseConfigured ? 'checking' : 'unavailable');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [conflict, setConflict] = useState<CloudSaveConflict | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<CloudAuthMode>('sign-in');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<CloudProfileStatus>('idle');
  const [profileError, setProfileError] = useState('');

  const currentBundle = useMemo<CloudSaveBundle<SaveState>>(() => ({
    saveState,
    pullHistory: pullHistory.slice(0, 100)
  }), [saveState, pullHistory]);
  const currentFingerprint = useMemo(() => fingerprintCloudBundle(currentBundle), [currentBundle]);

  const bundleRef = useRef(currentBundle);
  const fingerprintRef = useRef(currentFingerprint);
  const sessionRef = useRef<Session | null>(session);
  const conflictRef = useRef<CloudSaveConflict | null>(conflict);
  const applyCloudBundleRef = useRef(applyCloudBundle);
  const initialSyncUserRef = useRef<string | null>(null);
  const initialSyncCompleteRef = useRef(false);
  const syncInFlightRef = useRef(false);
  const syncQueuedRef = useRef(false);
  const requestUploadRef = useRef<() => Promise<void>>(async () => {});
  const deviceIdRef = useRef<string | null>(null);

  bundleRef.current = currentBundle;
  fingerprintRef.current = currentFingerprint;
  sessionRef.current = session;
  conflictRef.current = conflict;
  applyCloudBundleRef.current = applyCloudBundle;

  if (typeof window !== 'undefined' && !deviceIdRef.current) {
    deviceIdRef.current = getOrCreateCloudDeviceId(window.localStorage);
  }

  const persistSyncedRecord = useCallback((
    record: CloudSaveRecord<SaveState>,
    bundle: CloudSaveBundle<SaveState>,
    applyToGame: boolean
  ) => {
    if (typeof window === 'undefined' || !deviceIdRef.current) return;
    const fingerprint = fingerprintCloudBundle(bundle);
    writeLocalCloudBundle(window.localStorage, bundle);
    writeCloudLocalMetadata(window.localStorage, {
      userId: record.userId,
      revision: record.revision,
      updatedAt: record.updatedAt,
      deviceId: deviceIdRef.current,
      lastSyncedFingerprint: fingerprint
    });
    setLastSyncedAt(record.updatedAt);
    setSyncStatus('synced');
    if (applyToGame) applyCloudBundleRef.current(bundle);
  }, []);

  const createConflict = useCallback(async (userId: string, localBundle: CloudSaveBundle<SaveState>) => {
    if (!repository) return;
    const remote = await repository.fetch(userId);
    if (!remote) {
      initialSyncUserRef.current = null;
      initialSyncCompleteRef.current = false;
      setSyncStatus('checking');
      return;
    }
    setConflict({ remote, localBundle });
    setSyncStatus('conflict');
  }, []);

  const runInitialSync = useCallback(async (user: User) => {
    if (!repository || typeof window === 'undefined' || !deviceIdRef.current) return;
    setSyncStatus('checking');
    try {
      if (!isBrowserOnline()) {
        setSyncStatus('offline');
        initialSyncUserRef.current = null;
        return;
      }

      const localBundle = readLocalCloudBundle<SaveState>(window.localStorage) ?? bundleRef.current;
      const localFingerprint = fingerprintCloudBundle(localBundle);
      const localMetadata = readCloudLocalMetadata(window.localStorage);
      const remote = await repository.fetch(user.id);
      if (remote && remote.saveVersion > CLOUD_SAVE_VERSION) {
        throw new Error('This cloud save requires a newer game version.');
      }

      const decision = decideInitialCloudSync({
        userId: user.id,
        remote,
        hasLocalSave: hasLocalProgress,
        localFingerprint,
        localMetadata
      });

      if (decision.action === 'conflict') {
        if (!remote) throw new Error('Cloud save conflict could not be loaded.');
        setConflict({ remote, localBundle });
        setSyncStatus('conflict');
        return;
      }

      if (decision.action === 'load-cloud') {
        if (!remote) throw new Error('Cloud save could not be loaded.');
        persistSyncedRecord(remote, remote.bundle, true);
      } else if (decision.action === 'upload-local') {
        const saved = remote
          ? await repository.update(user.id, remote.revision, localBundle, deviceIdRef.current)
          : await repository.create(user.id, localBundle, deviceIdRef.current);
        persistSyncedRecord(saved, localBundle, false);
      } else {
        const defaultBundle = bundleRef.current;
        const saved = await repository.create(user.id, defaultBundle, deviceIdRef.current);
        persistSyncedRecord(saved, defaultBundle, false);
      }

      initialSyncCompleteRef.current = true;
    } catch (error) {
      initialSyncUserRef.current = null;
      if (!isBrowserOnline() || formatCloudAccountError(error).includes('unreachable')) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('error');
        setAuthError(error instanceof Error ? error.message : 'Cloud synchronization failed.');
      }
    }
  }, [hasLocalProgress, persistSyncedRecord]);

  const performUpload = useCallback(async () => {
    const user = sessionRef.current?.user;
    if (!repository || !user || !initialSyncCompleteRef.current || conflictRef.current) return;
    if (!isBrowserOnline()) {
      setSyncStatus('offline');
      return;
    }
    if (typeof window === 'undefined' || !deviceIdRef.current) return;

    const metadata = readCloudLocalMetadata(window.localStorage);
    if (!metadata || metadata.userId !== user.id) {
      initialSyncCompleteRef.current = false;
      initialSyncUserRef.current = user.id;
      await runInitialSync(user);
      return;
    }

    const bundle = bundleRef.current;
    const fingerprint = fingerprintCloudBundle(bundle);
    if (metadata.lastSyncedFingerprint === fingerprint) {
      setSyncStatus('synced');
      return;
    }

    setSyncStatus('saving');
    try {
      const saved = await repository.update(user.id, metadata.revision, bundle, deviceIdRef.current);
      persistSyncedRecord(saved, bundle, false);
    } catch (error) {
      if (error instanceof CloudRevisionConflictError) {
        await createConflict(user.id, bundle);
      } else if (!isBrowserOnline() || formatCloudAccountError(error).includes('unreachable')) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('error');
      }
    }
  }, [createConflict, persistSyncedRecord, runInitialSync]);

  const requestUpload = useCallback(async () => {
    if (syncInFlightRef.current) {
      syncQueuedRef.current = true;
      return;
    }
    syncInFlightRef.current = true;
    try {
      await performUpload();
    } finally {
      syncInFlightRef.current = false;
      if (syncQueuedRef.current) {
        syncQueuedRef.current = false;
        await requestUploadRef.current();
      }
    }
  }, [performUpload]);
  requestUploadRef.current = requestUpload;

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(formatCloudAccountError(error));
      setSession(data.session);
      setAuthResolved(true);
      if (!data.session) setSyncStatus('guest');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthResolved(true);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('update-password');
        setAccountModalOpen(true);
      }
      if (event === 'SIGNED_OUT') {
        initialSyncUserRef.current = null;
        initialSyncCompleteRef.current = false;
        setConflict(null);
        setProfile(null);
        setProfileStatus('idle');
        setProfileError('');
        setSyncStatus('guest');
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!profileDataSource || !userId) {
      setProfile(null);
      setProfileStatus('idle');
      setProfileError('');
      return;
    }

    let active = true;
    setProfile(null);
    setProfileStatus('loading');
    setProfileError('');
    void profileDataSource.fetch(userId).then((nextProfile) => {
      if (!active) return;
      if (!nextProfile) throw new Error('Player profile is missing.');
      setProfile(nextProfile);
      setProfileStatus('ready');
    }).catch(() => {
      if (!active) return;
      setProfile(null);
      setProfileStatus('error');
      setProfileError('Player profile could not be loaded. Sign out and try again.');
    });

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  useEffect(() => {
    if (!authResolved || !localSaveReady) return;
    const user = session?.user;
    if (!user) {
      if (isSupabaseConfigured) setSyncStatus('guest');
      return;
    }
    if (initialSyncUserRef.current === user.id) return;
    initialSyncUserRef.current = user.id;
    initialSyncCompleteRef.current = false;
    void runInitialSync(user);
  }, [authResolved, localSaveReady, runInitialSync, session?.user]);

  useEffect(() => {
    if (!localSaveReady || !session?.user || !initialSyncCompleteRef.current || conflict) return;
    if (typeof window === 'undefined') return;
    const metadata = readCloudLocalMetadata(window.localStorage);
    if (metadata?.lastSyncedFingerprint === currentFingerprint) return;
    const autosaveTimer = window.setTimeout(() => {
      void requestUploadRef.current();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(autosaveTimer);
  }, [conflict, currentFingerprint, localSaveReady, session?.user]);

  useEffect(() => {
    if (!session?.user || conflict) return;
    const safetySyncInterval = window.setInterval(() => {
      void requestUploadRef.current();
    }, SAFETY_SYNC_INTERVAL_MS);
    return () => clearInterval(safetySyncInterval);
  }, [conflict, session?.user]);

  useEffect(() => {
    const handleOnline = () => {
      const user = sessionRef.current?.user;
      if (!user) return;
      if (!initialSyncCompleteRef.current) {
        initialSyncUserRef.current = user.id;
        void runInitialSync(user);
      } else {
        void requestUploadRef.current();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [runInitialSync]);

  const openAccountModal = useCallback((mode: CloudAuthMode = 'sign-in') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthMessage('');
    setAccountModalOpen(true);
  }, []);

  const closeAccountModal = useCallback(() => {
    if (authSubmitting) return;
    setAccountModalOpen(false);
    setAuthError('');
    setAuthMessage('');
  }, [authSubmitting]);

  const submitSignIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return setAuthError('Cloud services are not configured.');
    const validation = validateCloudCredentials(email, password);
    if (validation) return setAuthError(validation);
    setAuthSubmitting(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      setAccountModalOpen(false);
    } catch (error) {
      setAuthError(formatCloudAccountError(error));
    } finally {
      setAuthSubmitting(false);
    }
  }, []);

  const submitSignUp = useCallback(async (
    username: string,
    email: string,
    password: string,
    confirmation: string
  ) => {
    if (!supabase || !profileDataSource) return setAuthError('Cloud services are not configured.');
    const usernameValidation = validateUsername(username);
    if (usernameValidation) return setAuthError(usernameValidation);
    const validation = validateCloudCredentials(email, password, confirmation);
    if (validation) return setAuthError(validation);
    const normalizedUsername = normalizeUsername(username);
    setAuthSubmitting(true);
    setAuthError('');
    setAuthMessage('');
    try {
      const available = await profileDataSource.isUsernameAvailable(normalizedUsername);
      if (!available) {
        setAuthError('That username is already taken.');
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { username: normalizedUsername }
        }
      });
      if (error) throw error;
      if (data.session) {
        setAccountModalOpen(false);
      } else {
        setAuthMessage(
          'Check your email to confirm your account. If you already have an account, sign in or reset your password.'
        );
      }
    } catch (error) {
      setAuthError(formatCloudAccountError(error));
    } finally {
      setAuthSubmitting(false);
    }
  }, []);

  const submitPasswordReset = useCallback(async (email: string) => {
    if (!supabase) return setAuthError('Cloud services are not configured.');
    const validation = validateCloudCredentials(email, 'password');
    if (validation) return setAuthError(validation);
    setAuthSubmitting(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      setAuthMessage('Password reset link sent. Check your email.');
    } catch (error) {
      setAuthError(formatCloudAccountError(error));
    } finally {
      setAuthSubmitting(false);
    }
  }, []);

  const submitNewPassword = useCallback(async (password: string, confirmation: string) => {
    if (!supabase) return setAuthError('Cloud services are not configured.');
    const validation = validateCloudCredentials('player@example.com', password, confirmation);
    if (validation) return setAuthError(validation);
    setAuthSubmitting(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setAuthMessage('Password updated. Your account is ready.');
      setAuthMode('sign-in');
    } catch (error) {
      setAuthError(formatCloudAccountError(error));
    } finally {
      setAuthSubmitting(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await requestUploadRef.current();
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') clearCloudLocalMetadata(window.localStorage);
    setSession(null);
    setConflict(null);
    setProfile(null);
    setProfileStatus('idle');
    setProfileError('');
    setSyncStatus('guest');
  }, []);

  const useCloudVersion = useCallback(() => {
    if (!conflict) return;
    persistSyncedRecord(conflict.remote, conflict.remote.bundle, true);
    setConflict(null);
    initialSyncCompleteRef.current = true;
  }, [conflict, persistSyncedRecord]);

  const useDeviceVersion = useCallback(async () => {
    const user = session?.user;
    if (!user || !conflict || !repository || !deviceIdRef.current) return;
    setSyncStatus('saving');
    try {
      const saved = await repository.update(
        user.id,
        conflict.remote.revision,
        conflict.localBundle,
        deviceIdRef.current
      );
      persistSyncedRecord(saved, conflict.localBundle, false);
      setConflict(null);
      initialSyncCompleteRef.current = true;
    } catch (error) {
      if (error instanceof CloudRevisionConflictError) {
        await createConflict(user.id, conflict.localBundle);
      } else {
        setSyncStatus(isBrowserOnline() ? 'error' : 'offline');
      }
    }
  }, [conflict, createConflict, persistSyncedRecord, session?.user]);

  return {
    configured: isSupabaseConfigured,
    session,
    user: session?.user ?? null,
    authResolved,
    syncStatus,
    lastSyncedAt,
    conflict,
    accountModalOpen,
    authMode,
    authError,
    authMessage,
    authSubmitting,
    profile,
    profileStatus,
    profileError,
    setAuthMode,
    openAccountModal,
    closeAccountModal,
    submitSignIn,
    submitSignUp,
    submitPasswordReset,
    submitNewPassword,
    signOut,
    manualSync: requestUpload,
    useCloudVersion,
    useDeviceVersion
  };
};
