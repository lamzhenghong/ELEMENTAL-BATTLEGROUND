import type { CSSProperties } from 'react';
import type { AetherTransitionState } from '../utils/aetherTransition';
import { getTransitionTone } from '../utils/aetherTransition';

interface AetherCoreTransitionProps {
  state: AetherTransitionState;
  lowGraphics: boolean;
  reducedMotion: boolean;
}

const SIGIL_MARKS = ['diamond', 'bar', 'arc', 'cross', 'triangle', 'kite', 'ring'];

export function AetherCoreTransition({
  state,
  lowGraphics,
  reducedMotion,
}: AetherCoreTransitionProps) {
  if (state.phase === 'idle') return null;

  const tone = getTransitionTone(state.destination);
  const sigils = Array.from({ length: lowGraphics ? 3 : 7 }, (_, index) => ({
    index,
    mark: SIGIL_MARKS[index],
  }));
  const style = { '--aether-transition-color': tone.color } as CSSProperties;

  return (
    <div
      className="aether-transition fixed inset-0 z-[100] pointer-events-auto"
      data-phase={state.phase}
      data-kind={state.kind}
      data-reduced-motion={reducedMotion || undefined}
      style={style}
    >
      <span className="sr-only" aria-live="polite">Entering {tone.label}</span>

      <div className="aether-transition__field" aria-hidden="true">
        <div className="aether-transition__arc aether-transition__arc--north" />
        <div className="aether-transition__arc aether-transition__arc--south" />

        <div className="aether-transition__constellation" aria-hidden="true">
          {sigils.map(({ index, mark }) => (
            <span
              className="aether-transition__sigil"
              data-sigil={mark}
              key={mark}
              style={{ '--aether-sigil-index': index } as CSSProperties}
            >
              <span className="aether-transition__sigil-mark" />
            </span>
          ))}
        </div>

        <div className="aether-transition__core" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <span className="aether-transition__petal" data-petal={index} key={index}>
              <span className="aether-transition__facet" />
            </span>
          ))}
        </div>

        <span className="aether-transition__destination">{tone.label}</span>
      </div>
    </div>
  );
}

export default AetherCoreTransition;
