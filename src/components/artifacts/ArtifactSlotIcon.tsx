import { Footprints, Hand, HardHat } from 'lucide-react';
import type { ArtifactSlot } from '../../types';

interface ArtifactSlotIconProps {
  slot: ArtifactSlot;
  className?: string;
  strokeWidth?: number;
}

function GreaveIcon({ className, strokeWidth = 1.8 }: Omit<ArtifactSlotIconProps, 'slot'>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 3.5h7l-.8 5.2-1.2 4.1.6 6.7-2.2 1-3.1-1.2.8-6.5-1.4-4.1.3-5.2Z" />
      <path d="M9.2 7.6h5.4M9.6 12.8h3.9M9.1 17.1h4.8" />
      <path d="m14.1 19.5 2.2 1M8.8 19.3l-1.7.9" />
    </svg>
  );
}

export default function ArtifactSlotIcon({ slot, className = 'h-5 w-5', strokeWidth = 1.8 }: ArtifactSlotIconProps) {
  const iconProps = { 'aria-hidden': true, className, strokeWidth } as const;

  switch (slot) {
    case 'helmet':
      return <HardHat {...iconProps} />;
    case 'hands':
      return <Hand {...iconProps} />;
    case 'leg':
      return <GreaveIcon className={className} strokeWidth={strokeWidth} />;
    case 'shoe':
      return <Footprints {...iconProps} />;
  }
}
