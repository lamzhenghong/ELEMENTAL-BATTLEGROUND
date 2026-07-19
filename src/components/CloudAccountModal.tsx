import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, AtSign, Cloud, Loader2, LockKeyhole, Mail, ShieldCheck, X } from 'lucide-react';
import type { CloudAuthMode, CloudProfileStatus, CloudSyncStatus } from '../cloud/useCloudAccount';
import { CopyValueButton } from './CopyValueButton';

interface CloudAccountModalProps {
  isOpen: boolean;
  mode: CloudAuthMode;
  error: string;
  message: string;
  submitting: boolean;
  configured: boolean;
  userEmail: string | null;
  username: string | null;
  playerId: string | null;
  profileStatus: CloudProfileStatus;
  profileError: string;
  syncStatus: CloudSyncStatus;
  lastSyncedAt: string | null;
  onClose: () => void;
  onModeChange: (mode: CloudAuthMode) => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (username: string, email: string, password: string, confirmation: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  onNewPassword: (password: string, confirmation: string) => Promise<void>;
  onManualSync: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export default function CloudAccountModal({
  isOpen,
  mode,
  error,
  message,
  submitting,
  configured,
  userEmail,
  username,
  playerId,
  profileStatus,
  profileError,
  syncStatus,
  lastSyncedAt,
  onClose,
  onModeChange,
  onSignIn,
  onSignUp,
  onPasswordReset,
  onNewPassword,
  onManualSync,
  onSignOut
}: CloudAccountModalProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    setPassword('');
    setConfirmation('');
    if (mode === 'forgot-password' && userEmail) setEmail(userEmail);
  }, [mode, userEmail]);

  if (!isOpen || typeof document === 'undefined') return null;

  const title = mode === 'sign-up'
    ? 'CREATE ACCOUNT'
    : mode === 'forgot-password'
      ? 'FORGOT PASSWORD'
      : mode === 'update-password'
        ? 'NEW PASSWORD'
        : 'SIGN IN';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'sign-up') return onSignUp(usernameInput, email, password, confirmation);
    if (mode === 'forgot-password') return onPasswordReset(email);
    if (mode === 'update-password') return onNewPassword(password, confirmation);
    return onSignIn(email, password);
  };

  const fieldClass = 'min-h-12 w-full rounded-lg border border-white/10 bg-slate-950/90 px-10 pr-3 text-sm font-semibold text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/70';

  if (userEmail && mode === 'sign-in') {
    const statusText = syncStatus === 'synced'
      ? 'Cloud save synchronized'
      : syncStatus === 'saving'
        ? 'Saving progress'
        : syncStatus === 'offline'
          ? 'Offline - local save protected'
          : syncStatus === 'conflict'
            ? 'Save choice required'
            : 'Checking cloud save';
    const accountModal = (
      <div className="fixed inset-0 z-[10000] flex min-h-[100dvh] items-center justify-center bg-slate-950/92 p-3 backdrop-blur-md sm:p-6">
        <section role="dialog" aria-modal="true" aria-labelledby="cloud-account-signed-in-title" className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-xl border border-cyan-400/25 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10">
                <Cloud className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">Aetheria Cloud</p>
                <h2 id="cloud-account-signed-in-title" className="text-base font-black uppercase tracking-wider text-white">CLOUD ACCOUNT</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white" aria-label="Close account window">
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="min-w-0 space-y-3 rounded-lg border border-white/10 bg-black/30 p-4">
              {profileStatus === 'loading' && (
                <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-100">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-300" /> Loading player identity
                </div>
              )}
              {profileStatus === 'error' && (
                <p role="alert" className="text-xs font-bold leading-relaxed text-rose-200">{profileError}</p>
              )}
              {profileStatus === 'ready' && username && playerId && (
                <>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] font-black uppercase tracking-widest text-slate-500">Username</span>
                      <span className="mt-1 block break-all text-base font-black text-white">{username}</span>
                    </div>
                    <CopyValueButton value={username} label="Copy username" />
                  </div>
                  <div className="flex min-w-0 items-center gap-2 border-t border-white/5 pt-3">
                    <div className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] font-black uppercase tracking-widest text-slate-500">Player ID</span>
                      <span className="mt-1 block break-all font-mono text-xs font-black tracking-wider text-cyan-200">{playerId}</span>
                    </div>
                    <CopyValueButton value={playerId} label="Copy player ID" />
                  </div>
                </>
              )}
              <div className="min-w-0 border-t border-white/5 pt-3">
                <span className="block font-mono text-[9px] font-black uppercase tracking-widest text-slate-500">Email</span>
                <span className="mt-1 block break-all text-sm font-black text-slate-200">{userEmail}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-cyan-400/20 bg-cyan-950/20 p-4">
              <div>
                <span className="block text-xs font-black uppercase text-cyan-100">{statusText}</span>
                <span className="mt-1 block font-mono text-[9px] uppercase text-slate-500">
                  {lastSyncedAt ? `Last sync ${new Date(lastSyncedAt).toLocaleString()}` : 'Waiting for first sync'}
                </span>
              </div>
              {(syncStatus === 'saving' || syncStatus === 'checking') && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cyan-300" />}
            </div>
            <button type="button" onClick={() => void onManualSync()} disabled={syncStatus === 'saving' || syncStatus === 'checking' || syncStatus === 'conflict'} className="min-h-12 w-full rounded-lg bg-cyan-400 px-4 text-xs font-black uppercase tracking-wider text-slate-950 disabled:opacity-50">
              SYNCHRONIZE NOW
            </button>
            <button type="button" onClick={() => onModeChange('forgot-password')} className="min-h-12 w-full rounded-lg border border-cyan-400/30 bg-cyan-950/30 px-4 text-xs font-black uppercase tracking-wider text-cyan-100 hover:bg-cyan-950/50">
              RESET PASSWORD
            </button>
            <button type="button" onClick={() => void onSignOut()} className="min-h-12 w-full rounded-lg border border-rose-400/30 bg-rose-950/35 px-4 text-xs font-black uppercase tracking-wider text-rose-100">
              SIGN OUT
            </button>
            <p className="text-center font-mono text-[9px] uppercase leading-relaxed tracking-wider text-slate-500">
              Progress saves locally immediately and uploads automatically after changes.
            </p>
          </div>
        </section>
      </div>
    );
    return createPortal(accountModal, document.body);
  }

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex min-h-[100dvh] items-center justify-center bg-slate-950/92 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloud-account-title"
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-xl border border-cyan-400/25 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_32px_rgba(34,211,238,0.12)]"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#07111f]/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10">
              <Cloud className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">Aetheria Cloud</p>
              <h2 id="cloud-account-title" className="truncate text-base font-black uppercase tracking-wider text-white">{title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close account window"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          {!configured && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-950/40 p-3 text-xs font-bold leading-relaxed text-amber-100">
              Cloud services are unavailable. Guest progress will continue saving on this device.
            </div>
          )}

          {mode !== 'forgot-password' && mode !== 'update-password' && (
            <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-black/30 p-1">
              <button
                type="button"
                onClick={() => onModeChange('sign-in')}
                className={`min-h-10 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${mode === 'sign-in' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => onModeChange('sign-up')}
                className={`min-h-10 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${mode === 'sign-up' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                CREATE ACCOUNT
              </button>
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            {mode === 'sign-up' && (
              <label className="block space-y-1.5">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-400">Username</span>
                <span className="relative block">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(event) => setUsernameInput(event.target.value)}
                    autoComplete="username"
                    inputMode="text"
                    minLength={3}
                    maxLength={20}
                    pattern="[A-Za-z0-9_]{3,20}"
                    spellCheck={false}
                    required
                    placeholder="Aether_Hero"
                    className={fieldClass}
                  />
                </span>
                <span className="block font-mono text-[8px] leading-relaxed text-slate-500">3-20 letters, numbers, or underscores.</span>
              </label>
            )}

            {mode !== 'update-password' && (
              <label className="block space-y-1.5">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-400">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    required
                    placeholder="player@example.com"
                    className={fieldClass}
                  />
                </span>
              </label>
            )}

            {mode !== 'forgot-password' && (
              <label className="block space-y-1.5">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-400">Password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    minLength={8}
                    required
                    placeholder="Minimum 8 characters"
                    className={fieldClass}
                  />
                </span>
              </label>
            )}

            {(mode === 'sign-up' || mode === 'update-password') && (
              <label className="block space-y-1.5">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-400">Confirm Password</span>
                <span className="relative block">
                  <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className={fieldClass}
                  />
                </span>
              </label>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/45 p-3 text-xs font-bold leading-relaxed text-rose-100">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg border border-emerald-400/30 bg-emerald-950/35 p-3 text-xs font-bold leading-relaxed text-emerald-100">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !configured}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 text-xs font-black uppercase tracking-[0.16em] text-slate-950 transition-all hover:bg-cyan-300 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'forgot-password' ? 'SEND RESET LINK' : mode === 'update-password' ? 'SAVE NEW PASSWORD' : title}
            </button>
          </form>

          {mode === 'sign-in' && (
            <button
              type="button"
              onClick={() => onModeChange('forgot-password')}
              className="min-h-11 w-full rounded-lg border border-cyan-400/30 bg-cyan-950/25 px-4 text-center text-[10px] font-black uppercase tracking-wider text-cyan-200 transition-colors hover:bg-cyan-950/50 hover:text-white"
            >
              FORGOT PASSWORD? RESET HERE
            </button>
          )}

          {(mode === 'forgot-password' || mode === 'update-password') && (
            <button
              type="button"
              onClick={() => onModeChange('sign-in')}
              className="flex min-h-10 w-full items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO SIGN IN
            </button>
          )}

          <p className="border-t border-white/10 pt-4 text-center text-[9px] font-mono uppercase leading-relaxed tracking-wider text-slate-500">
            Guest play remains available. Signing in enables encrypted account sessions and cross-device progress.
          </p>
        </div>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
