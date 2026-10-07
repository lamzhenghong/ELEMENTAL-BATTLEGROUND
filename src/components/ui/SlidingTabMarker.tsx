import { useLayoutEffect, useRef, useState } from 'react';

export default function SlidingTabMarker({ selection }: { selection: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0 });
  useLayoutEffect(() => {
    const rail = ref.current?.parentElement;
    if (!rail) return;
    const selected = rail.querySelector<HTMLElement>('[aria-current="page"], [aria-pressed="true"], [aria-selected="true"]');
    if (!selected) { setBounds({ left: 0, top: 0, width: 0 }); return; }
    const update = () => setBounds({ left: selected.offsetLeft + 8, top: selected.offsetTop + selected.offsetHeight - 3, width: Math.max(0, selected.offsetWidth - 16) });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    observer.observe(selected);
    return () => observer.disconnect();
  }, [selection]);
  return <span ref={ref} className="menu-tab-marker" aria-hidden="true" style={{ width: bounds.width, transform: `translate(${bounds.left}px, ${bounds.top}px)` }} />;
}
