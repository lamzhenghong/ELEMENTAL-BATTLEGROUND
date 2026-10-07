import React, { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import {
  canAnimateMechanicDemo,
  type DemoActor,
  type DemoEffect,
  type DemoPoint,
  type DemoSteps,
  type MechanicDemo,
} from './mechanicDemonstrations';

interface Props {
  demo: MechanicDemo;
  subject: string;
  enemyColor: string;
}

const motionStyle = (visible: DemoSteps<boolean>, route?: DemoSteps<DemoPoint>): React.CSSProperties => ({
  ...Object.fromEntries(visible.map((value, index) => [`--v-${index}`, Number(value)])),
  ...(route ? Object.fromEntries(route.flatMap((at, index) => [
    [`--x-${index}`, `${at.x}px`], [`--y-${index}`, `${at.y}px`],
  ])) : {}),
} as React.CSSProperties);

function Arrow({ at, to }: { at: DemoPoint; to: DemoPoint }) {
  const angle = Math.atan2(to.y - at.y, to.x - at.x) * 180 / Math.PI;
  return (
    <>
      <line x1={at.x} y1={at.y} x2={to.x} y2={to.y} stroke="currentColor" strokeDasharray="4 3" />
      <path d="M -5 -3 L 0 0 L -5 3" transform={`translate(${to.x} ${to.y}) rotate(${angle})`} fill="none" stroke="currentColor" />
    </>
  );
}

function Effect({ effect }: { key?: string; effect: DemoEffect }) {
  const { kind, at, to, radius = 0, innerRadius, label } = effect;
  const style = { ...motionStyle(effect.visible), color: effect.color ?? '#fb7185' };
  if (kind === 'warning' || kind === 'shield') {
    const annulus = innerRadius !== undefined;
    const ringRadius = annulus ? (radius + innerRadius) / 2 : radius;
    return (
      <g className="wiki-demo-motion wiki-demo-visible" style={style}>
        <circle cx={at.x} cy={at.y} r={ringRadius} fill="none" stroke="currentColor"
          strokeWidth={annulus ? radius - innerRadius : 1.5} strokeOpacity={annulus ? 0.35 : 0.85}
          strokeDasharray={annulus ? undefined : '4 3'} />
        {!annulus && <circle cx={at.x} cy={at.y} r={radius} fill="currentColor" fillOpacity="0.1" />}
        {kind === 'warning' && (
          <g className="wiki-demo-motion wiki-demo-visible" style={motionStyle([false, false, true])}>
            <circle cx={at.x} cy={at.y} r={annulus ? ringRadius : radius} fill={annulus ? 'none' : 'currentColor'}
              fillOpacity="0.24" stroke="currentColor" strokeWidth={annulus ? radius - innerRadius : 1.5} strokeOpacity="0.7" />
          </g>
        )}
      </g>
    );
  }
  if (kind === 'projectile' && to) {
    return (
      <g className="wiki-demo-motion wiki-demo-visible" style={style}>
        <g opacity="0.35"><Arrow at={at} to={to} /></g>
        <circle className="wiki-demo-motion wiki-demo-actor" r={Math.max(2.5, radius)} fill="currentColor"
          style={motionStyle([true, true, true], [at, to, to])} />
      </g>
    );
  }
  return (
    <g className="wiki-demo-motion wiki-demo-visible" style={style}>
      {kind === 'link' && to && <Arrow at={at} to={to} />}
      {kind === 'boundary' && to && (
        <>
          <line x1={at.x} y1={at.y} x2={to.x} y2={to.y} stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
          <text x={at.x} y={at.y - 6} textAnchor="middle">{label}</text>
        </>
      )}
      {kind === 'hit' && <path d={`M ${at.x - 7} ${at.y - 7} l 14 14 M ${at.x + 7} ${at.y - 7} l -14 14`} stroke="currentColor" strokeWidth="2" />}
      {kind === 'label' && <text x={at.x} y={at.y} textAnchor="middle">{label}</text>}
    </g>
  );
}

function Actor({ actor, enemyColor }: { key?: string; actor: DemoActor; enemyColor: string }) {
  const isPlayer = actor.kind === 'player';
  const size = actor.kind === 'wisp' ? 4 : 7;
  return (
    <g className="wiki-demo-motion wiki-demo-visible wiki-demo-actor" style={motionStyle(actor.visible, actor.route)}>
      {isPlayer ? (
        <>
          <circle r="6" fill="#67e8f9" stroke="#ecfeff" strokeWidth="1.5" />
          <circle r="2" fill="#083344" />
        </>
      ) : (
        <path d={`M 0 ${-size} L ${size} 0 L 0 ${size} L ${-size} 0 Z`}
          fill={actor.kind === 'ally' ? '#0f172a' : enemyColor} stroke={enemyColor} strokeWidth="1.5" />
      )}
      {actor.label && <text x="0" y="20" textAnchor="middle" fill="#cbd5e1">{actor.label}</text>}
    </g>
  );
}

export default function MechanicDemonstration({ demo, subject, enemyColor }: Props) {
  const ref = useRef<HTMLElement>(null);
  const id = useId();
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [replay, setReplay] = useState(0);
  const [staticStep, setStaticStep] = useState(2);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(query.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    query.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)), { threshold: 0.05 });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      query.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  const running = canAnimateMechanicDemo({ inView, pageVisible, paused, reducedMotion });
  const playbackLabel = reducedMotion ? `Next step for ${subject} demonstration`
    : `${paused ? 'Play' : 'Pause'} ${subject} demonstration`;

  return (
    <figure ref={ref} className="wiki-mechanic-demo" data-running={running} data-reduced={reducedMotion}
      data-step={staticStep} aria-labelledby={`${id}-heading`}>
      <div className="wiki-demo-toolbar">
        <div className="wiki-demo-heading" id={`${id}-heading`}>
          {demo.title}
          {demo.phase && <span className="wiki-demo-phase">Phase {['I', 'II', 'III'][demo.phase - 1]}</span>}
        </div>
        <div className="wiki-demo-controls">
          <button type="button" title={playbackLabel} aria-label={playbackLabel}
            aria-pressed={reducedMotion ? undefined : paused}
            onClick={() => reducedMotion ? setStaticStep(step => (step + 1) % 3) : setPaused(value => !value)}>
            {reducedMotion ? <StepForward /> : paused ? <Play /> : <Pause />}
          </button>
          <button type="button" title={`Replay ${subject} demonstration`} aria-label={`Replay ${subject} demonstration`}
            onClick={() => { setReplay(value => value + 1); setStaticStep(0); setPaused(false); }}>
            <RotateCcw />
          </button>
        </div>
      </div>
      <div key={replay} className="wiki-demo-sequence">
        <svg viewBox="0 0 256 128" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
          <title id={`${id}-title`}>{`${subject}: ${demo.title}`}</title>
          <desc id={`${id}-desc`}>Circle: you. Diamond: enemy. {demo.steps.join('. ')}. {demo.counterplay} {demo.scope}</desc>
          <path d="M 0 32 H 256 M 0 64 H 256 M 0 96 H 256 M 64 0 V 128 M 128 0 V 128 M 192 0 V 128" stroke="#334155" strokeOpacity="0.22" />
          {demo.effects.map(effect => <Effect key={effect.id} effect={effect} />)}
          {demo.actors.map(actor => <Actor key={actor.id} actor={actor} enemyColor={enemyColor} />)}
        </svg>
        <div className="wiki-demo-steps" aria-hidden="true">
          {demo.steps.map((step, index) => (
            <span key={index} className="wiki-demo-motion wiki-demo-visible"
              style={motionStyle([index === 0, index === 1, index === 2])}>{index + 1}. {step}</span>
          ))}
        </div>
      </div>
      <div className="wiki-demo-legend" aria-hidden="true">
        <span><i className="wiki-demo-player-key" />You</span>
        <span><i className="wiki-demo-enemy-key" style={{ backgroundColor: enemyColor }} />Enemy</span>
      </div>
      <figcaption className="wiki-demo-caption">{demo.counterplay}</figcaption>
      {demo.phase && <p className="wiki-demo-scope">{demo.scope}</p>}
    </figure>
  );
}
