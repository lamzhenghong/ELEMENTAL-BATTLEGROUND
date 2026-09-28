import type { ElementType } from '../types';
import { ELEMENT_VISUALS } from '../utils/elementVisualLanguage';

export default function ElementSigil({ element, className = 'h-4 w-4' }: { element: ElementType; className?: string }) {
  const visual = ELEMENT_VISUALS[element];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className={className} style={{ color: visual.color }} aria-hidden="true">
      <path d={visual.symbolPath} />
    </svg>
  );
}
