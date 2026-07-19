import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyValueButtonProps {
  value: string;
  label: string;
  className?: string;
}

type ClipboardWriter = (value: string) => Promise<void>;
type ClipboardFallback = (value: string) => boolean;

const writeWithClipboard: ClipboardWriter = async (value) => {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable.');
  await navigator.clipboard.writeText(value);
};

const writeWithDocumentCopy: ClipboardFallback = (value) => {
  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand('copy');
  } finally {
    textarea?.remove();
  }
};

export const copyText = async (
  value: string,
  writeClipboard: ClipboardWriter = writeWithClipboard,
  writeFallback: ClipboardFallback = writeWithDocumentCopy
) => {
  try {
    await writeClipboard(value);
    return true;
  } catch {
    try {
      return writeFallback(value);
    } catch {
      return false;
    }
  }
};

export function CopyValueButton({ value, label, className = '' }: CopyValueButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
    setStatus(await copyText(value) ? 'copied' : 'error');
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={label}
      title={label}
      className={`flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-950/35 px-3 font-mono text-[8px] font-black uppercase tracking-wider text-cyan-100 transition-colors hover:bg-cyan-950/60 active:scale-[0.97] ${className}`}
    >
      {status === 'copied' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{status === 'copied' ? 'COPIED' : status === 'error' ? 'COPY FAILED' : 'COPY'}</span>
    </button>
  );
}
