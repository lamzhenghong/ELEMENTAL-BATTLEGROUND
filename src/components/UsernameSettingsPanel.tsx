import { useEffect, useState, type FormEvent } from 'react';
import { AtSign, Loader2 } from 'lucide-react';
import {
  getUsernameChangeAvailableAt,
  getUsernameChangeRemainingMs,
  type PlayerProfile
} from '../cloud/playerProfile';
import type { CloudProfileMutationStatus } from '../cloud/useCloudAccount';
import { CopyValueButton } from './CopyValueButton';

interface UsernameSettingsPanelProps {
  profile: PlayerProfile;
  email: string;
  mutationStatus: CloudProfileMutationStatus;
  mutationMessage: string;
  mutationError: string;
  onChangeUsername: (username: string) => Promise<boolean>;
}

export function UsernameSettingsPanel({
  profile,
  email,
  mutationStatus,
  mutationMessage,
  mutationError,
  onChangeUsername
}: UsernameSettingsPanelProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = getUsernameChangeRemainingMs(profile, now);
  const availableAt = getUsernameChangeAvailableAt(profile);
  const cooldownActive = remainingMs > 0;

  useEffect(() => {
    setNow(Date.now());
  }, [profile.usernameChangedAt]);

  useEffect(() => {
    if (!cooldownActive) return;
    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(60_000, remainingMs + 50)
    );
    return () => window.clearTimeout(timer);
  }, [cooldownActive, remainingMs]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await onChangeUsername(usernameInput)) setUsernameInput('');
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-lg border border-white/5 bg-black/30 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            <span className="block font-mono text-[8px] font-black uppercase tracking-widest text-slate-500">Username</span>
            <span className="mt-1 block break-all text-[11px] font-black text-cyan-100">{profile.username}</span>
          </div>
          <CopyValueButton value={profile.username} label="Copy username" />
        </div>
        <div className="flex min-w-0 items-center gap-2 border-t border-white/5 pt-3">
          <div className="min-w-0 flex-1">
            <span className="block font-mono text-[8px] font-black uppercase tracking-widest text-slate-500">Player ID</span>
            <span className="mt-1 block break-all font-mono text-[9px] font-black tracking-wider text-cyan-200">{profile.publicId}</span>
          </div>
          <CopyValueButton value={profile.publicId} label="Copy player ID" />
        </div>
        <div className="min-w-0 border-t border-white/5 pt-3">
          <span className="block font-mono text-[8px] font-black uppercase tracking-widest text-slate-500">Email</span>
          <span className="mt-1 block break-all font-mono text-[8px] text-slate-400">{email}</span>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-2 rounded-lg border border-cyan-400/15 bg-cyan-950/15 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[8px] font-black uppercase tracking-widest text-cyan-300">Change Username</span>
          <span className={`font-mono text-[7px] font-black uppercase ${cooldownActive ? 'text-amber-300' : 'text-emerald-300'}`}>
            {cooldownActive ? 'Cooldown active' : 'Available now'}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block min-w-0">
            <span className="sr-only">New username</span>
            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              spellCheck={false}
              disabled={cooldownActive || mutationStatus === 'saving'}
              required
              placeholder="New username"
              className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-950/90 pl-10 pr-3 text-[11px] font-bold text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
          <button
            type="submit"
            disabled={cooldownActive || mutationStatus === 'saving'}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 text-[9px] font-black uppercase tracking-wider text-slate-950 disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.98]"
          >
            {mutationStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {cooldownActive ? 'COOLDOWN ACTIVE' : 'CHANGE USERNAME'}
          </button>
        </div>
        <p className="font-mono text-[8px] leading-relaxed text-slate-500">
          {cooldownActive && availableAt
            ? `Available again ${availableAt.toLocaleString()}.`
            : '3-20 letters, numbers, or underscores. You can change it once every 24 hours.'}
        </p>
        {mutationMessage && <p role="status" className="text-[9px] font-bold text-emerald-300">{mutationMessage}</p>}
        {mutationError && <p role="alert" className="text-[9px] font-bold text-rose-300">{mutationError}</p>}
      </form>
    </div>
  );
}
