import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart2,
  CheckCircle2,
  Circle,
  LayoutGrid,
  Lock,
  Volume2,
  VolumeX
} from 'lucide-react';
import type { useCloudAccount } from '../cloud/useCloudAccount';
import type { UiThemeId } from '../types';
import { t, type LanguageType } from '../utils/i18n';
import {
  UI_THEMES,
  UI_THEME_UNLOCK_LEVEL,
  isUiThemeUnlocked,
  type UiThemeDefinition
} from '../utils/uiThemes';
import { UsernameSettingsPanel } from './UsernameSettingsPanel';

type CloudAccountController = ReturnType<typeof useCloudAccount>;

interface InGameSettingsModalProps {
  open: boolean;
  activeUiTheme: UiThemeDefinition;
  activeUiThemeId: UiThemeId;
  playerLevel: number;
  devCheatsEnabled: boolean;
  muteSfx: boolean;
  bgmVolume: number;
  sfxVolume: number;
  screenShakeEnabled: boolean;
  disableGameplayCutscenes: boolean;
  combatSpeed: number;
  fpsLimit: '60' | 'none';
  language: LanguageType;
  cloudSyncLabel: string;
  cloudAccount: CloudAccountController;
  onClose: () => void;
  onOpenPlayerStats: () => void;
  onToggleMuteSfx: () => void;
  onBgmVolumeChange: (value: number) => void;
  onSfxVolumeChange: (value: number) => void;
  onToggleDevCheats: () => void;
  onSelectUiTheme: (themeId: UiThemeId) => void;
  onToggleScreenShake: () => void;
  onToggleGameplayCutscenes: () => void;
  onCombatSpeedChange: (speed: number) => void;
  onFpsLimitChange: (limit: '60' | 'none') => void;
  onLanguageChange: (language: LanguageType) => void;
  onOpenLoginRewards: () => void;
  onReturnToMenu: () => void;
}

export default function InGameSettingsModal({
  open,
  activeUiTheme,
  activeUiThemeId,
  playerLevel,
  devCheatsEnabled,
  muteSfx,
  bgmVolume,
  sfxVolume,
  screenShakeEnabled,
  disableGameplayCutscenes,
  combatSpeed,
  fpsLimit,
  language,
  cloudSyncLabel,
  cloudAccount,
  onClose,
  onOpenPlayerStats,
  onToggleMuteSfx,
  onBgmVolumeChange,
  onSfxVolumeChange,
  onToggleDevCheats,
  onSelectUiTheme,
  onToggleScreenShake,
  onToggleGameplayCutscenes,
  onCombatSpeedChange,
  onFpsLimitChange,
  onLanguageChange,
  onOpenLoginRewards,
  onReturnToMenu
}: InGameSettingsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            className={`max-w-md w-full border rounded-2xl shadow-2xl relative flex flex-col ${activeUiTheme.panelClass}`}
            style={{ maxHeight: '90vh' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/10 px-6 py-4 shrink-0">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-display flex items-center gap-2">
                <LayoutGrid className={`w-4 h-4 ${activeUiTheme.iconClass}`} />
                Aetheria Settings Control
              </h3>
              <button
                onClick={onClose}
                className="p-1 px-2 text-slate-400 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors text-xs font-black cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5 font-sans">
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                <span className={`text-[9px] font-mono tracking-wider uppercase font-black block ${activeUiTheme.textClass}`}>Player Analytics</span>
                <button
                  type="button"
                  onClick={onOpenPlayerStats}
                  className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${activeUiTheme.settingsButtonClass}`}
                >
                  <BarChart2 className="w-4 h-4" />
                  PLAYER STAT
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4">
                <span className={`text-[9px] font-mono tracking-wider uppercase font-black block ${activeUiTheme.textClass}`}>SYSTEM HARDWARE CONTROLS</span>

                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[11px] text-slate-350 uppercase font-bold">Simulator sound effects</span>
                  <button
                    onClick={onToggleMuteSfx}
                    className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      !muteSfx ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-500 border border-white/5'
                    }`}
                  >
                    {!muteSfx ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{!muteSfx ? 'SFX ENABLED' : 'SFX MUTED'}</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-350 uppercase font-bold">
                    <span>BGM Volume</span>
                    <span className={`font-mono font-bold ${activeUiTheme.textClass}`}>{bgmVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgmVolume}
                    onChange={(event) => onBgmVolumeChange(Number.parseInt(event.target.value, 10))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: activeUiTheme.accent }}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-350 uppercase font-bold">
                    <span>SFX Volume</span>
                    <span className={`font-mono font-bold ${activeUiTheme.textClass}`}>{sfxVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVolume}
                    onChange={(event) => onSfxVolumeChange(Number.parseInt(event.target.value, 10))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: activeUiTheme.accent }}
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                <span className={`text-[9px] font-mono tracking-wider uppercase font-black block ${activeUiTheme.textClass}`}>GENERAL PREFERENCES</span>

                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[11px] text-slate-300 uppercase font-bold">Developer Cheats</span>
                  <button
                    onClick={onToggleDevCheats}
                    className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      devCheatsEnabled ? activeUiTheme.settingsButtonClass : 'bg-slate-800 text-slate-500 border border-white/5'
                    }`}
                  >
                    {devCheatsEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="space-y-2 border-b border-white/5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-slate-300 uppercase font-bold block">UI Theme</span>
                      <span className="text-[9px] text-slate-500">
                        Crimson, Emerald, Gold, and Void unlock at Player Level {UI_THEME_UNLOCK_LEVEL}.
                      </span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded uppercase border ${activeUiTheme.pillClass}`}>
                      {activeUiTheme.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {UI_THEMES.map((theme) => {
                      const unlocked = isUiThemeUnlocked(theme.id, playerLevel, devCheatsEnabled);
                      const active = activeUiThemeId === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => onSelectUiTheme(theme.id)}
                          className={`min-h-16 rounded-lg border p-2 text-left transition-all active:scale-95 cursor-pointer relative overflow-hidden ${
                            active
                              ? 'bg-white/10 border-white/40 shadow-[0_0_16px_rgba(255,255,255,0.10)]'
                              : unlocked
                                ? 'bg-black/35 border-white/10 hover:border-white/30'
                                : 'bg-slate-900/50 border-slate-800/80 opacity-70'
                          }`}
                        >
                          <span
                            className="absolute inset-x-0 top-0 h-1"
                            style={{ backgroundColor: theme.accent }}
                          />
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-100">
                              {theme.label}
                            </span>
                            {!unlocked ? (
                              <Lock className="w-3 h-3 text-slate-500" />
                            ) : active ? (
                              <CheckCircle2 className="w-3 h-3" style={{ color: theme.accent }} />
                            ) : (
                              <Circle className="w-3 h-3 text-slate-600" />
                            )}
                          </span>
                          <span className="mt-2 flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.accent }} />
                            <span className="text-[8px] font-mono uppercase text-slate-500">
                              {unlocked ? 'Available' : `LV ${theme.unlockLevel}`}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[11px] text-slate-300 uppercase font-bold">Screen Shake</span>
                  <button
                    onClick={onToggleScreenShake}
                    className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      screenShakeEnabled ? activeUiTheme.settingsButtonClass : 'bg-slate-800 text-slate-500 border border-white/5'
                    }`}
                  >
                    {screenShakeEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-300 uppercase font-bold block">Disable Gameplay Cutscenes</span>
                    <span className="text-[9px] text-slate-500">Skips Burst and Special Ultimate cinematic overlays.</span>
                  </div>
                  <button
                    onClick={onToggleGameplayCutscenes}
                    className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      disableGameplayCutscenes ? activeUiTheme.settingsButtonClass : 'bg-slate-800 text-slate-500 border border-white/5'
                    }`}
                  >
                    {disableGameplayCutscenes ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-300 uppercase font-bold block">Combat Speed Multiplier</span>
                  <div className="flex gap-1.5">
                    {[1, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => onCombatSpeedChange(speed)}
                        className={`flex-1 text-center py-2 text-xs font-black rounded uppercase tracking-wider cursor-pointer transition-all ${
                          combatSpeed === speed
                            ? activeUiTheme.settingsButtonClass
                            : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/5'
                        }`}
                      >
                        {speed === 1 ? '1x (Normal)' : speed === 1.5 ? '1.5x' : '2x (Fast)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-350 uppercase font-bold block">{t('fps_limit_label', language)}</span>
                    <span className="text-[9px] text-slate-500">{t('performance_desc', language)}</span>
                  </div>
                  <select
                    value={fpsLimit}
                    onChange={(event) => onFpsLimitChange(event.target.value as '60' | 'none')}
                    className="bg-slate-800 text-slate-200 text-[10px] font-black border border-white/10 rounded px-2 py-1.5 cursor-pointer uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                  >
                    <option value="60">{t('fps_limit_60', language)}</option>
                    <option value="none">{t('fps_limit_none', language)}</option>
                  </select>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[11px] text-slate-300 uppercase font-bold">{t('language_label', language)}</span>
                  <select
                    value={language}
                    onChange={(event) => onLanguageChange(event.target.value as LanguageType)}
                    className="bg-slate-800 text-slate-200 text-[10px] font-black border border-white/10 rounded px-2 py-1.5 cursor-pointer uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="jp">🇯🇵 Japanese</option>
                    <option value="zh">🇨🇳 Chinese</option>
                    <option value="ko">🇰🇷 Korean</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-300 uppercase font-bold">Display Mode</span>
                  <span className="text-[10px] font-black text-sky-400 bg-sky-900/20 border border-sky-500/20 px-2 py-1 rounded uppercase tracking-wider">DARK</span>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-400/15 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-mono tracking-wider text-cyan-300 uppercase font-bold">ACCOUNT & CLOUD SAVE</span>
                  <span className="rounded border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 font-mono text-[8px] font-black uppercase text-cyan-300">
                    {cloudSyncLabel}
                  </span>
                </div>
                {cloudAccount.user && cloudAccount.profile ? (
                  <UsernameSettingsPanel
                    profile={cloudAccount.profile}
                    email={cloudAccount.user.email ?? ''}
                    mutationStatus={cloudAccount.profileMutationStatus}
                    mutationMessage={cloudAccount.profileMutationMessage}
                    mutationError={cloudAccount.profileMutationError}
                    onChangeUsername={cloudAccount.changeUsername}
                  />
                ) : (
                  <div className="rounded-lg border border-white/5 bg-black/30 p-3">
                    <span className="block truncate text-[10px] font-black text-slate-200">
                      {cloudAccount.user
                        ? cloudAccount.profileStatus === 'loading' ? 'Loading player...' : 'Profile unavailable'
                        : 'Guest device save'}
                    </span>
                    {cloudAccount.user?.email && (
                      <span className="mt-2 block break-all font-mono text-[8px] text-slate-400">{cloudAccount.user.email}</span>
                    )}
                    <span className="mt-1 block font-mono text-[8px] uppercase leading-relaxed text-slate-500">
                      {cloudAccount.user
                        ? 'Automatic cloud backup and cross-device progress are active.'
                        : 'Create an account or sign in to continue on another device.'}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => cloudAccount.openAccountModal()}
                    className="min-h-11 rounded-lg border border-cyan-400/25 bg-cyan-950/30 px-3 text-[9px] font-black uppercase tracking-wider text-cyan-100 transition-colors hover:bg-cyan-950/50 active:scale-[0.98]"
                  >
                    {cloudAccount.user ? 'MANAGE ACCOUNT' : 'SIGN IN'}
                  </button>
                  {cloudAccount.user ? (
                    <button
                      type="button"
                      onClick={() => void cloudAccount.manualSync()}
                      disabled={cloudAccount.syncStatus === 'saving' || cloudAccount.syncStatus === 'checking' || cloudAccount.syncStatus === 'conflict'}
                      className="min-h-11 rounded-lg border border-white/10 bg-[#0e1628] px-3 text-[9px] font-black uppercase tracking-wider text-slate-200 disabled:opacity-45 active:scale-[0.98]"
                    >
                      SYNC NOW
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => cloudAccount.openAccountModal('sign-up')}
                      className="min-h-11 rounded-lg bg-cyan-400 px-3 text-[9px] font-black uppercase tracking-wider text-slate-950 active:scale-[0.98]"
                    >
                      CREATE ACCOUNT
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                <span className="text-[9px] font-mono tracking-wider text-indigo-350 uppercase font-bold block">GAME SESSION</span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={onOpenLoginRewards}
                    className="py-2.5 bg-[#0e1628] hover:bg-slate-900 text-amber-350 border border-amber-500/20 hover:border-amber-500 rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer text-center block"
                  >
                    🎁 LOGIN REWARD
                  </button>
                  <button
                    onClick={onReturnToMenu}
                    className="py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer text-center block shadow-md"
                  >
                    🔌 Return to Main Menu
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
