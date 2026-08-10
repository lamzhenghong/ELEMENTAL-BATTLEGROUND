import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  getRewardRevealTarget,
  INVENTORY_FALLBACK_SELECTOR,
  type RewardRevealEvent,
} from '../utils/rewardReveal';

interface RewardRevealLayerProps {
  events: readonly RewardRevealEvent[];
  onComplete: (id: string) => void;
  lowGraphics: boolean;
}

interface RevealPoint {
  x: number;
  y: number;
}

interface MeasuredRewardReveal {
  event: RewardRevealEvent;
  source: RevealPoint;
  destination: RevealPoint;
}

const MAX_ACTIVE_REVEALS = 4;
const LOW_GRAPHICS_ACTIVE_REVEALS = 1;
const DESTINATION_PULSE_MS = 260;

const rewardLabels: Record<RewardRevealEvent['kind'], string> = {
  mora: 'Mora',
  gems: 'Gems',
  weapon: 'Weapon',
  artifact: 'Artifact',
};

const rewardColors: Record<RewardRevealEvent['kind'], string> = {
  mora: '#fbbf24',
  gems: '#2dd4bf',
  weapon: '#60a5fa',
  artifact: '#c084fc',
};

const getViewportCenter = (): RevealPoint => ({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
});

const getCenter = (element: Element | null): RevealPoint | null => {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { x: rect.left + (rect.width / 2), y: rect.top + (rect.height / 2) };
};

const getSourceElement = (source?: string): Element | null => (
  source ? document.querySelector(`[data-reward-source="${source}"]`) : null
);

const getDestinationElement = (event: RewardRevealEvent): Element | null => (
  document.querySelector(event.target ?? getRewardRevealTarget(event.kind))
  ?? document.querySelector(INVENTORY_FALLBACK_SELECTOR)
);

const measureReveal = (event: RewardRevealEvent): MeasuredRewardReveal => ({
  event,
  source: getCenter(getSourceElement(event.source)) ?? getViewportCenter(),
  destination: getCenter(getDestinationElement(event)) ?? getViewportCenter(),
});

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;

    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  return reducedMotion;
}

export function RewardRevealLayer({ events, onComplete, lowGraphics }: RewardRevealLayerProps) {
  const reducedMotion = useReducedMotionPreference();
  const measurements = useRef(new Map<string, MeasuredRewardReveal>());
  const completedIds = useRef(new Set<string>());
  const pulseTimers = useRef(new Set<number>());
  const [visibleReveals, setVisibleReveals] = useState<MeasuredRewardReveal[]>([]);

  useLayoutEffect(() => {
    const availableIds = new Set(events.map((event) => event.id));
    for (const id of measurements.current.keys()) {
      if (!availableIds.has(id)) measurements.current.delete(id);
    }
    for (const id of completedIds.current) {
      if (!availableIds.has(id)) completedIds.current.delete(id);
    }

    const limit = lowGraphics ? LOW_GRAPHICS_ACTIVE_REVEALS : MAX_ACTIVE_REVEALS;
    const next = events
      .filter((event) => !completedIds.current.has(event.id))
      .slice(0, limit)
      .map((event) => {
        const existing = measurements.current.get(event.id);
        if (existing) return existing;

        const measurement = measureReveal(event);
        measurements.current.set(event.id, measurement);
        return measurement;
      });

    setVisibleReveals(next);
  }, [events, lowGraphics]);

  useEffect(() => () => {
    for (const timer of pulseTimers.current) window.clearTimeout(timer);
    pulseTimers.current.clear();
  }, []);

  const completeReveal = useCallback((reveal: MeasuredRewardReveal) => {
    if (completedIds.current.has(reveal.event.id)) return;
    completedIds.current.add(reveal.event.id);

    const target = getDestinationElement(reveal.event);
    if (target instanceof HTMLElement) {
      target.dataset.rewardPulse = 'true';
      const timer = window.setTimeout(() => {
        target.removeAttribute('data-reward-pulse');
        pulseTimers.current.delete(timer);
      }, DESTINATION_PULSE_MS);
      pulseTimers.current.add(timer);
    }

    onComplete(reveal.event.id);
  }, [onComplete]);

  if (typeof document === 'undefined') return null;

  const layer = (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
      {visibleReveals.map((reveal) => {
        const xDistance = reveal.destination.x - reveal.source.x;
        const yDistance = reveal.destination.y - reveal.source.y;
        const curve = Math.min(180, Math.max(56, Math.abs(xDistance) * 0.25));
        const controlX = xDistance / 2;
        const controlY = (yDistance / 2) - curve;
        const style = {
          left: reducedMotion ? reveal.destination.x : reveal.source.x,
          top: reducedMotion ? reveal.destination.y : reveal.source.y,
          '--reward-reveal-color': rewardColors[reveal.event.kind],
        } as CSSProperties;

        return (
          <motion.div
            className="pointer-events-none fixed flex items-center gap-1.5 rounded-full border border-white/30 bg-slate-950/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg"
            data-reward-reveal={reveal.event.kind}
            initial={reducedMotion ? { opacity: 0, scale: 0.88 } : { opacity: 1, scale: 0.88, x: 0, y: 0 }}
            animate={reducedMotion
              ? { opacity: [0, 1, 0], scale: [0.88, 1, 0.96] }
              : {
                opacity: [1, 1, 0],
                scale: [0.88, 1, 0.78],
                x: [0, controlX, xDistance],
                y: [0, controlY, yDistance],
              }}
            transition={reducedMotion
              ? { duration: 0.24, times: [0, 0.35, 1] }
              : { duration: lowGraphics ? 0.42 : 0.62, times: [0, 0.58, 1], ease: 'easeInOut' }}
            key={reveal.event.id}
            onAnimationComplete={() => completeReveal(reveal)}
            style={style}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: rewardColors[reveal.event.kind], boxShadow: lowGraphics ? undefined : '0 0 10px var(--reward-reveal-color)' }}
            />
            <span>+{reveal.event.quantity} {rewardLabels[reveal.event.kind]}</span>
          </motion.div>
        );
      })}
    </div>
  );

  return createPortal(layer, document.body);
}

export default RewardRevealLayer;
