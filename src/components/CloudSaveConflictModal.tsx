import { createPortal } from 'react-dom';
import { Cloud, HardDrive, RefreshCw, ShieldAlert } from 'lucide-react';
import type { CloudSaveConflict } from '../cloud/useCloudAccount';

interface CloudSaveConflictModalProps {
  conflict: CloudSaveConflict | null;
  busy: boolean;
  onUseCloud: () => void;
  onUseDevice: () => Promise<void>;
}

export default function CloudSaveConflictModal({
  conflict,
  busy,
  onUseCloud,
  onUseDevice
}: CloudSaveConflictModalProps) {
  if (!conflict || typeof document === 'undefined') return null;

  const cloudLevel = conflict.remote.bundle.saveState.playerLevel || 1;
  const deviceLevel = conflict.localBundle.saveState.playerLevel || 1;
  const cloudUpdated = new Date(conflict.remote.updatedAt).toLocaleString();

  const modal = (
    <div className="fixed inset-0 z-[10001] flex min-h-[100dvh] items-center justify-center bg-slate-950/95 p-3 backdrop-blur-lg sm:p-6">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cloud-conflict-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-amber-400/35 bg-[#0b101c] shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_38px_rgba(251,191,36,0.12)]"
      >
        <header className="flex items-start gap-3 border-b border-white/10 p-5 sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">Manual Choice Required</p>
            <h2 id="cloud-conflict-title" className="mt-1 text-lg font-black uppercase tracking-wider text-white">CLOUD SAVE CONFLICT</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Progress changed in more than one place. Choose which version should become your account save.
            </p>
          </div>
        </header>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
          <button
            type="button"
            onClick={onUseCloud}
            disabled={busy}
            className="min-h-36 rounded-lg border border-cyan-400/25 bg-cyan-950/25 p-4 text-left transition-colors hover:border-cyan-300/60 hover:bg-cyan-950/40 disabled:opacity-50"
          >
            <Cloud className="h-5 w-5 text-cyan-300" />
            <span className="mt-4 block text-xs font-black uppercase tracking-wider text-white">USE CLOUD SAVE</span>
            <span className="mt-2 block font-mono text-[10px] leading-relaxed text-slate-400">
              Player LV.{cloudLevel}<br />Revision {conflict.remote.revision}<br />{cloudUpdated}
            </span>
          </button>

          <button
            type="button"
            onClick={() => void onUseDevice()}
            disabled={busy}
            className="min-h-36 rounded-lg border border-indigo-400/25 bg-indigo-950/25 p-4 text-left transition-colors hover:border-indigo-300/60 hover:bg-indigo-950/40 disabled:opacity-50"
          >
            <HardDrive className="h-5 w-5 text-indigo-300" />
            <span className="mt-4 block text-xs font-black uppercase tracking-wider text-white">USE DEVICE SAVE</span>
            <span className="mt-2 block font-mono text-[10px] leading-relaxed text-slate-400">
              Player LV.{deviceLevel}<br />Current device progress<br />Uploads over cloud version
            </span>
          </button>
        </div>

        <footer className="flex items-center gap-2 border-t border-white/10 px-5 py-4 text-[9px] font-mono uppercase leading-relaxed tracking-wider text-slate-500">
          {busy && <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-300" />}
          Nothing is deleted until you choose. The selected version is also cached on this device.
        </footer>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
