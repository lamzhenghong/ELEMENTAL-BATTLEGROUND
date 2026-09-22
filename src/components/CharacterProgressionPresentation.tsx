import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Sparkles, X } from 'lucide-react';
import type { ElementType, PlayableCharacter } from '../types';
import type { CharacterProgressionEvent } from '../utils/characterProgression';

export interface CharacterProgressionStats {
  hp: number;
  atk: number;
  def: number;
}

interface CharacterProgressionPresentationProps {
  event: CharacterProgressionEvent | null;
  character: PlayableCharacter;
  before: CharacterProgressionStats;
  after: CharacterProgressionStats;
  lowGraphics: boolean;
  onClose: () => void;
}

const ELEMENT_COLORS: Record<ElementType, string> = {
  Pyro: '#fb7185',
  Hydro: '#38bdf8',
  Cryo: '#a5f3fc',
  Electro: '#c084fc',
  Anemo: '#5eead4',
  Geo: '#fbbf24',
  Dendro: '#86efac',
};

export default function CharacterProgressionPresentation({
  event,
  character,
  before,
  after,
  lowGraphics,
  onClose,
}: CharacterProgressionPresentationProps) {
  useEffect(() => {
    if (!event) return undefined;
    const duration = event.intensity === 'normal' ? 1250 : event.intensity === 'milestone' ? 1900 : 2500;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [event, onClose]);

  if (typeof document === 'undefined') return null;

  const color = ELEMENT_COLORS[character.element];
  const statRows = [
    ['HP', before.hp, after.hp],
    ['ATK', before.atk, after.atk],
    ['DEF', before.def, after.def],
  ] as const;

  return createPortal(
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/72 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${character.name} ${event.label}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-lg border bg-[#070b14] p-5 shadow-2xl sm:p-7"
            style={{ borderColor: `${color}80`, boxShadow: `0 0 44px ${color}24` }}
            initial={lowGraphics ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={lowGraphics ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: lowGraphics ? 0.12 : 0.28, ease: 'easeOut' }}
            onClick={(event_) => event_.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: color }} />
            {!lowGraphics && (
              <motion.div
                className="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full opacity-20 blur-3xl"
                style={{ background: color }}
                animate={{ opacity: [0.12, 0.3, 0.12], scale: [0.9, 1.08, 0.9] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}

            <button
              type="button"
              aria-label="Skip progression presentation"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex items-center gap-4 pr-10">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-2xl font-black text-slate-950 ${character.avatarPlaceholder}`}
                style={{ boxShadow: `0 0 20px ${color}38` }}
              >
                {character.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em]" style={{ color }}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {event.label}
                </div>
                <h2 className="mt-1 truncate font-display text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
                  {character.name}
                </h2>
                <div className="mt-1 flex items-center gap-2 font-mono text-sm font-black">
                  <span className="text-slate-500">LV.{event.previousLevel}</span>
                  <ArrowUp className="h-4 w-4" style={{ color }} />
                  <span style={{ color }}>LV.{event.nextLevel}</span>
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {statRows.map(([label, oldValue, newValue], index) => (
                <motion.div
                  key={label}
                  className="rounded-md border border-white/10 bg-black/35 px-2 py-3 text-center sm:px-3"
                  initial={lowGraphics ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: lowGraphics ? 0 : 0.1 + (index * 0.07) }}
                >
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</div>
                  <div className="mt-1 font-mono text-xs font-bold text-slate-400 line-through decoration-slate-600 sm:text-sm">{oldValue}</div>
                  <div className="font-mono text-sm font-black sm:text-base" style={{ color }}>+{Math.max(0, newValue - oldValue)} / {newValue}</div>
                </motion.div>
              ))}
            </div>

            <p className="relative mt-4 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Tap anywhere to continue
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
