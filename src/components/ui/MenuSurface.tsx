import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { AppScreen } from '../../utils/aetherTransition';
import { getMenuPresentation } from '../../utils/menuPresentation';

export default function MenuSurface({ screen, paused, lowGraphics, children }: {
  screen: AppScreen; paused: boolean; lowGraphics: boolean; children: ReactNode;
}) {
  const profile = getMenuPresentation(screen);
  const ambientRef = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  useEffect(() => {
    const node = ambientRef.current;
    if (!node) { setVisible(false); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(node);
    const onVisibility = () => setForeground(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [profile.ambient]);

  return (
    <div className="menu-surface" data-material={profile.material}
      data-ambient={profile.ambient} data-running={visible && foreground && !paused}
      data-low-graphics={lowGraphics}>
      <div className="menu-surface__content">{children}</div>
      {profile.ambient !== 'none' && (
        <svg ref={ambientRef} className="menu-ambient" viewBox="0 0 176 200" fill="none" aria-hidden="true">
          {profile.ambient === 'forge' && <>
            <path className="menu-ambient__engraving" d="M12 18h122l18 18v104M24 28h103l15 15v92M132 145l16 16-16 16-16-16z" />
            <path className="menu-ambient__glint" d="M40 18h35M152 66v25M124 160h17" />
          </>}
          {profile.ambient === 'summons' && <>
            <path className="menu-ambient__engraving" d="m26 154 34-34 8-52 57-43 22 69-45 56-76 4" />
            <path className="menu-ambient__constellation" pathLength="1" d="m26 154 34-34 8-52 57-43 22 69-45 56-76 4" />
            {[[26,154],[60,120],[68,68],[125,25],[147,94],[102,150]].map(([cx, cy]) => <circle key={cx} className="menu-ambient__star" cx={cx} cy={cy} r="2" />)}
          </>}
          {profile.ambient === 'wiki' && <>
            <path className="menu-ambient__engraving" d="M38 24v144m18-144v144m26-124h26l-13 22-13-22m8 37h29l-15 24-14-24m-8 58h28l-14 24-14-24M26 30h4m-4 20h4m-4 20h4m-4 20h4m-4 20h4m-4 20h4m-4 20h4" />
            <path className="menu-ambient__rune" d="M20 84h49M20 124h49" />
          </>}
        </svg>
      )}
    </div>
  );
}
