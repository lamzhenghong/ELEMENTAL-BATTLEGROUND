import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Save, X } from 'lucide-react';
import {
  DEFAULT_MOBILE_CONTROL_LAYOUT,
  MOBILE_CONTROL_IDS,
  clampMobileControlLayout,
  getMobileControlLayoutErrors,
  toMobileControlPixelRect,
  type MobileControlId,
  type MobileControlLayout,
  type MobileControlMetrics,
  type MobileSafeInsets,
} from '../utils/mobileControlLayout';

interface MobileControlEditorProps {
  open: boolean;
  initialLayout: MobileControlLayout;
  onCancel: () => void;
  onSave: (layout: MobileControlLayout) => void;
}

const CONTROL_LABELS: Record<MobileControlId, string> = {
  joystick: 'MOVE',
  attack: 'ATTACK',
  skill: 'SKILL',
  parry: 'PARRY',
  dash: 'DASH',
  ultimate: 'BURST',
  specialUltimate: 'SPECIAL ULTIMATE',
};

const cloneLayout = (layout: MobileControlLayout): MobileControlLayout => Object.fromEntries(
  MOBILE_CONTROL_IDS.map(id => [id, { ...layout[id] }]),
) as MobileControlLayout;

const readSafeInsets = (): MobileSafeInsets => {
  const probe = document.createElement('div');
  probe.style.cssText = [
    'position:fixed',
    'visibility:hidden',
    'pointer-events:none',
    'padding-top:env(safe-area-inset-top, 0px)',
    'padding-right:env(safe-area-inset-right, 0px)',
    'padding-bottom:env(safe-area-inset-bottom, 0px)',
    'padding-left:env(safe-area-inset-left, 0px)',
  ].join(';');
  document.body.appendChild(probe);
  const style = window.getComputedStyle(probe);
  const insets = {
    top: Number.parseFloat(style.paddingTop) || 0,
    right: Number.parseFloat(style.paddingRight) || 0,
    bottom: Number.parseFloat(style.paddingBottom) || 0,
    left: Number.parseFloat(style.paddingLeft) || 0,
  };
  probe.remove();
  return insets;
};

const getMetrics = (): MobileControlMetrics => ({
  width: Math.max(1, window.innerWidth),
  height: Math.max(1, window.innerHeight),
  safeInsets: readSafeInsets(),
});

export default function MobileControlEditor({
  open,
  initialLayout,
  onCancel,
  onSave,
}: MobileControlEditorProps) {
  const [metrics, setMetrics] = useState<MobileControlMetrics>(() => ({
    width: Math.max(1, window.innerWidth),
    height: Math.max(1, window.innerHeight),
    safeInsets: { top: 0, right: 0, bottom: 0, left: 0 },
  }));
  const [draft, setDraft] = useState<MobileControlLayout>(() => cloneLayout(initialLayout));
  const [selectedId, setSelectedId] = useState<MobileControlId | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextMetrics = getMetrics();
    setMetrics(nextMetrics);
    setDraft(clampMobileControlLayout(cloneLayout(initialLayout), nextMetrics));
    setSelectedId(null);
  }, [initialLayout, open]);

  useEffect(() => {
    if (!open) return;
    const handleResize = () => {
      const nextMetrics = getMetrics();
      setMetrics(nextMetrics);
      setDraft(current => clampMobileControlLayout(current, nextMetrics));
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [open]);

  const validationErrors = useMemo(
    () => getMobileControlLayoutErrors(draft, metrics),
    [draft, metrics],
  );

  if (!open) return null;

  const moveControl = (id: MobileControlId, clientX: number, clientY: number) => {
    setDraft(current => clampMobileControlLayout({
      ...current,
      [id]: {
        x: clientX / metrics.width,
        y: clientY / metrics.height,
      },
    }, metrics));
  };

  return (
    <div className="fixed inset-0 z-[20000] select-none overflow-hidden bg-[#040711]/95 text-white touch-none">
      <div
        className="pointer-events-none absolute border border-dashed border-cyan-300/30"
        style={{
          top: metrics.safeInsets.top,
          right: metrics.safeInsets.right,
          bottom: metrics.safeInsets.bottom,
          left: metrics.safeInsets.left,
        }}
      />

      <div className="absolute inset-x-0 top-0 z-30 flex min-h-14 items-center justify-between gap-2 border-b border-white/10 bg-slate-950/90 px-3 py-2 backdrop-blur-md">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Mobile Controls</p>
          <p className="truncate font-mono text-[8px] uppercase text-slate-500">Drag controls, then save</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setDraft(clampMobileControlLayout(cloneLayout(DEFAULT_MOBILE_CONTROL_LAYOUT), metrics))}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-[9px] font-black uppercase tracking-wider text-slate-200 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" /> RESET DEFAULT
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-rose-400/25 bg-rose-950/30 px-3 text-[9px] font-black uppercase tracking-wider text-rose-100 active:scale-95"
          >
            <X className="h-3.5 w-3.5" /> CANCEL
          </button>
          <button
            type="button"
            disabled={validationErrors.length > 0}
            onClick={() => onSave(cloneLayout(draft))}
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-cyan-400 px-3 text-[9px] font-black uppercase tracking-wider text-slate-950 disabled:bg-slate-700 disabled:text-slate-400 active:scale-95"
          >
            <Save className="h-3.5 w-3.5" /> SAVE LAYOUT
          </button>
        </div>
      </div>

      {MOBILE_CONTROL_IDS.map(id => {
        const rect = toMobileControlPixelRect(id, draft[id], metrics);
        const selected = selectedId === id;
        return (
          <button
            key={id}
            type="button"
            aria-label={`Move ${CONTROL_LABELS[id]} control`}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.setPointerCapture(event.pointerId);
              setSelectedId(id);
              moveControl(id, event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
              event.preventDefault();
              moveControl(id, event.clientX, event.clientY);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setSelectedId(null);
            }}
            onPointerCancel={() => setSelectedId(null)}
            className={`absolute z-20 flex items-center justify-center border-2 bg-slate-900/85 text-center font-black uppercase tracking-wider shadow-xl touch-none ${
              id === 'specialUltimate' ? 'rounded-xl text-[9px]' : 'rounded-full text-[8px]'
            } ${selected ? 'border-cyan-300 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.45)]' : 'border-white/30 text-white'}`}
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              touchAction: 'none',
            }}
          >
            {CONTROL_LABELS[id]}
          </button>
        );
      })}

      {validationErrors.length > 0 && (
        <div className="absolute bottom-2 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-rose-400/30 bg-rose-950/90 px-4 py-2 text-center font-mono text-[8px] font-black uppercase tracking-wider text-rose-100">
          Controls overlap too much. Separate them to save.
        </div>
      )}
    </div>
  );
}
