import { CheckCircle2, Gamepad2, X } from 'lucide-react';
import type { UiThemeId } from '../types';
import { UI_THEMES } from '../utils/uiThemes';

interface MainMenuSettingsModalProps {
  open: boolean;
  bgmVolume: number;
  sfxVolume: number;
  screenShakeEnabled: boolean;
  hapticsEnabled: boolean;
  devCheatsEnabled: boolean;
  playerLevel: number;
  activeThemeId: UiThemeId;
  isMobile: boolean;
  onClose: () => void;
  onBgmVolumeChange: (value: number) => void;
  onSfxVolumeChange: (value: number) => void;
  onScreenShakeChange: (enabled: boolean) => void;
  onHapticsChange: (enabled: boolean) => void;
  onSelectTheme: (themeId: UiThemeId) => void;
  onOpenMobileControlEditor: () => void;
}

export default function MainMenuSettingsModal({
  open,
  bgmVolume,
  sfxVolume,
  screenShakeEnabled,
  hapticsEnabled,
  devCheatsEnabled,
  playerLevel,
  activeThemeId,
  isMobile,
  onClose,
  onBgmVolumeChange,
  onSfxVolumeChange,
  onScreenShakeChange,
  onHapticsChange,
  onSelectTheme,
  onOpenMobileControlEditor,
}: MainMenuSettingsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex min-h-[100dvh] items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="main-menu-settings-title" className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#07111f] shadow-2xl scrollbar-none">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#07111f]/95 px-4 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">Dawning Core</p>
            <h2 id="main-menu-settings-title" className="text-base font-black uppercase tracking-wider text-white">Settings</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white" aria-label="Close settings">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="space-y-4 rounded-lg border border-white/10 bg-black/25 p-4">
            <label className="block">
              <span className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-300"><b>BGM Volume</b><b>{bgmVolume}%</b></span>
              <input className="mt-3 w-full accent-cyan-400" type="range" min="0" max="100" value={bgmVolume} onChange={(event) => onBgmVolumeChange(Number(event.target.value))} />
            </label>
            <label className="block">
              <span className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-300"><b>SFX Volume</b><b>{sfxVolume}%</b></span>
              <input className="mt-3 w-full accent-cyan-400" type="range" min="0" max="100" value={sfxVolume} onChange={(event) => onSfxVolumeChange(Number(event.target.value))} />
            </label>
            <label className="flex min-h-12 items-center justify-between gap-4 border-t border-white/10 pt-4 text-[10px] font-black uppercase tracking-wider text-slate-300">
              Screen Shake
              <input type="checkbox" checked={screenShakeEnabled} onChange={(event) => onScreenShakeChange(event.target.checked)} className="h-5 w-5 accent-cyan-400" />
            </label>
            <label className="flex min-h-12 items-center justify-between gap-4 border-t border-white/10 pt-4 text-[10px] font-black uppercase tracking-wider text-slate-300">
              Combat Haptics
              <input type="checkbox" checked={hapticsEnabled} onChange={(event) => onHapticsChange(event.target.checked)} className="h-5 w-5 accent-cyan-400" />
            </label>
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={onOpenMobileControlEditor}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/25 bg-cyan-950/30 px-4 text-[10px] font-black uppercase tracking-wider text-cyan-100 active:scale-[0.98]"
            >
              <Gamepad2 className="h-4 w-4" />
              CUSTOMIZE MOBILE CONTROLS
            </button>
          )}

          <div className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-white">UI Theme</span>
              <span className="font-mono text-[8px] uppercase text-slate-500">{devCheatsEnabled ? 'Developer override active' : 'Unlocks at Player LV.20'}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {UI_THEMES.map(theme => {
                const unlocked = devCheatsEnabled || playerLevel >= theme.unlockLevel;
                const active = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onSelectTheme(theme.id)}
                    className="flex min-h-12 items-center justify-between rounded-lg border bg-slate-950/80 px-3 text-left disabled:cursor-not-allowed disabled:opacity-45"
                    style={{ borderColor: active ? theme.accent : 'rgba(255,255,255,0.1)' }}
                  >
                    <span>
                      <strong className="block text-[10px] uppercase text-white">{theme.label}</strong>
                      <small className="font-mono text-[8px] uppercase text-slate-500">{unlocked ? 'Available' : `LV ${theme.unlockLevel}`}</small>
                    </span>
                    {active ? <CheckCircle2 className="h-4 w-4" style={{ color: theme.accent }} /> : <i className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.accent }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
