import type { ReactNode } from 'react';
import { BarChart2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AetheriaAudioEngine } from '../utils/audio';
import type { UiThemeDefinition } from '../utils/uiThemes';

export interface PlayerStatItem {
  label: string;
  value: ReactNode;
  color: string;
}

interface PlayerStatsModalProps {
  open: boolean;
  activeUiTheme: UiThemeDefinition;
  stats: PlayerStatItem[];
  onClose: () => void;
}

export default function PlayerStatsModal({
  open,
  activeUiTheme,
  stats,
  onClose
}: PlayerStatsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/95 z-[60] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            className={`max-w-md w-full border rounded-2xl shadow-2xl relative flex flex-col ${activeUiTheme.panelClass}`}
            style={{ maxHeight: '85vh' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/10 px-6 py-4 shrink-0">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-display flex items-center gap-2">
                <BarChart2 className={`w-4 h-4 ${activeUiTheme.iconClass}`} />
                PLAYER TELEMETRY & STATS
              </h3>
              <button
                onClick={onClose}
                className="p-1 px-2 text-slate-400 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors text-xs font-black cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 font-mono text-xs text-slate-350">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-slate-950/60 p-3 rounded-lg border border-white/5 flex flex-col justify-between gap-1 shadow-inner"
                  >
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                      {stat.label}
                    </span>
                    <span className={`text-xs font-black font-mono ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex justify-end shrink-0 bg-slate-950/40 rounded-b-2xl">
              <button
                onClick={() => {
                  AetheriaAudioEngine.playClick();
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer ${activeUiTheme.settingsButtonClass}`}
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
