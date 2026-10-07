import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Check, CloudCheck, CloudOff, HardDrive, LoaderCircle, TriangleAlert } from 'lucide-react';
import type { CloudSyncStatus } from '../../cloud/useCloudAccount';
import { getSaveIndicatorPresentation, localSaveTracker } from '../../save/localSaveFeedback';

interface Props {
  cloudStatus: CloudSyncStatus;
  ready: boolean;
  onAccount: () => void;
}

const subscribeAfterCommit = (listener: () => void) => {
  let connected = true;
  const unsubscribe = localSaveTracker.subscribe(() => queueMicrotask(() => { if (connected) listener(); }));
  return () => { connected = false; unsubscribe(); };
};

export default function SaveStatusIndicator({ cloudStatus, ready, onAccount }: Props) {
  const local = useSyncExternalStore(subscribeAfterCommit, localSaveTracker.getSnapshot, localSaveTracker.getSnapshot);
  const status = getSaveIndicatorPresentation(local.status, cloudStatus, ready);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const Icon = status.icon === 'busy' ? LoaderCircle : status.icon === 'error' ? TriangleAlert
    : status.icon === 'cloud-warning' ? CloudOff : status.icon === 'cloud' ? CloudCheck
      : status.icon === 'saved' ? Check : HardDrive;

  useLayoutEffect(() => {
    if (position) popoverRef.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [position]);

  useEffect(() => {
    if (!position) return;
    const dismiss = (event: PointerEvent) => {
      if (!buttonRef.current?.contains(event.target as Node) && !popoverRef.current?.contains(event.target as Node)) setPosition(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setPosition(null); buttonRef.current?.focus(); }
    };
    const close = () => setPosition(null);
    const onFocus = (event: FocusEvent) => {
      if (!buttonRef.current?.contains(event.target as Node) && !popoverRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    document.addEventListener('focusin', onFocus);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
      document.removeEventListener('focusin', onFocus);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [position]);

  return (
    <>
      <button
        ref={buttonRef} type="button" className="save-status" data-tone={status.tone}
        aria-label={status.label} title={status.label} aria-expanded={Boolean(position)}
        aria-controls={position ? popoverId : undefined}
        onClick={() => {
          if (position) { setPosition(null); return; }
          const bounds = buttonRef.current!.getBoundingClientRect();
          setPosition({ top: Math.max(8, Math.min(window.innerHeight - 180, bounds.bottom + 8)), left: Math.max(8, Math.min(window.innerWidth - 248, bounds.left)) });
        }}
      >
        <Icon key={`${status.icon}-${local.revision}`} className={status.icon === 'busy' ? 'save-status__busy' : 'save-status__mark'} aria-hidden="true" />
      </button>
      <span className="sr-only" role="status" aria-live="polite">{status.label}</span>
      {position && createPortal(
        <div ref={popoverRef} id={popoverId} role="region" aria-label="Save details" className="save-status__popover" style={position}>
          <strong>{status.label}</strong>
          <p>{status.detail}</p>
          <button type="button" onClick={() => { setPosition(null); onAccount(); }}>Account &amp; Cloud</button>
        </div>, document.body,
      )}
    </>
  );
}
