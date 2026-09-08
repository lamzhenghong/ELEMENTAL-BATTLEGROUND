import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowRight, Axe, Bookmark, BowArrow, Check, ChevronDown, MoveUpRight, Pencil, Plus, RefreshCw, Shield, Sparkles, Star, Sword, Trash2, Users, WandSparkles, X } from 'lucide-react';
import type { SaveState, SavedTeamBuild } from '../types';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import ArtifactSlotIcon from './artifacts/ArtifactSlotIcon';
import { getBannerImage } from './gacha/bannerCatalog';
import { getRarityColor } from '../utils/forgePresentation';
import {
  applyTeamBuild, BUILD_SLOT_LABELS, BUILD_SLOTS, buildHeroName, captureTeamBuild,
  cleanTeamBuildName, MAX_TEAM_BUILDS, previewTeamBuild, renameTeamBuild, TEAM_BUILD_NAME_LENGTH,
} from '../utils/teamBuilds';
import './SavedTeamBuilds.css';

interface Props {
  saveState: SaveState;
  onUpdate: (updater: (prev: SaveState) => SaveState) => void;
}

function HeroMark({ id }: { id: string }) {
  const illustrated = ['aurelia', 'kaelen', 'maelis', 'veyra'].includes(id);
  return <span className="team-build-avatar" aria-hidden="true">
    {illustrated ? <img src={getBannerImage(id, 'character')} alt="" loading="lazy" /> : <span>{buildHeroName(id).slice(0, 1)}</span>}
  </span>;
}

function BuildMember({ member, state, index }: { key?: string; member: SavedTeamBuild['members'][number]; state: SaveState; index: number }) {
  const [inspected, setInspected] = useState<string | null>(null);
  const hero = PLAYABLE_CHARACTERS.find(c => c.id === member.characterId);
  const currentWeaponId = state.characterEquippedWeapon[member.characterId];
  const weapon = state.inventoryWeapons.find(w => w.id === member.weapon?.id);
  const WeaponIcon = { Sword, Claymore: Axe, Bow: BowArrow, Catalyst: WandSparkles, Polearm: MoveUpRight }[hero?.weaponType ?? 'Sword'];
  const gear = [
    { key: 'weapon', label: 'Weapon', icon: <WeaponIcon />, name: member.weapon?.name, rarity: weapon?.rarity,
      meta: weapon ? `Lv.${weapon.level}` : '', missing: !!member.weapon && !weapon,
      changed: (currentWeaponId ?? null) !== (member.weapon?.id ?? null),
      before: state.inventoryWeapons.find(w => w.id === currentWeaponId)?.name ?? 'Empty' },
    ...BUILD_SLOTS.map(slot => {
      const ref = member.artifacts[slot];
      const art = state.inventoryArtifacts?.find(a => a.id === ref?.id);
      const beforeId = state.characterEquippedArtifacts?.[member.characterId]?.[slot];
      return { key: slot, label: BUILD_SLOT_LABELS[slot], icon: <ArtifactSlotIcon slot={slot} />, name: ref?.name,
        rarity: art?.rarity, meta: art ? `${art.rarity}` : '', missing: !!ref && !art,
        changed: (beforeId ?? null) !== (ref?.id ?? null),
        before: state.inventoryArtifacts?.find(a => a.id === beforeId)?.name ?? 'Empty' };
    }),
  ];
  const detail = gear.find(g => g.key === inspected);
  return <article className="team-build-member" style={{ '--hero-color': hero?.themeColor ?? '#94a3b8' } as CSSProperties}>
    <div className="team-build-hero-header">
      <HeroMark id={member.characterId} />
      <div><span className="team-build-eyebrow">0{index + 1} / {hero?.element ?? 'Unknown'}</span><h4 title={buildHeroName(member.characterId)}>{buildHeroName(member.characterId).split(' ')[0]}</h4>
        <span className="team-build-level">Lv.{state.characterLevels[member.characterId] ?? 1}</span></div>
      {!state.unlockedCharacterIds.includes(member.characterId) && <AlertTriangle size={16} aria-label="Hero locked" />}
    </div>
    <div className="team-build-slots">{gear.map(g => <button key={g.key} type="button"
      className={`team-build-slot ${!g.name ? 'is-empty' : ''} ${g.missing ? 'is-missing' : ''} ${g.changed ? 'is-changed' : ''}`}
      style={{ '--rarity-color': g.rarity ? getRarityColor(g.rarity) : '#748198' } as CSSProperties}
      title={`${g.label}: ${g.name ?? 'Empty'}${g.missing ? ' (Missing)' : ''}`}
      aria-label={`${buildHeroName(member.characterId)}, ${g.label}: ${g.name ?? 'Empty'}${g.missing ? ', missing' : ''}`}
      aria-expanded={inspected === g.key} onClick={() => setInspected(inspected === g.key ? null : g.key)}>
      {g.icon}<span>{g.missing ? <AlertTriangle size={11} /> : g.meta ? <>{g.key !== 'weapon' && <Star size={9} fill="currentColor" />}{g.meta}</> : <span aria-hidden="true">&mdash;</span>}</span>
      {g.changed && <ArrowRight className="team-build-change" size={10} />}
    </button>)}</div>
    {detail && <div className="team-build-inspect"><span className="team-build-eyebrow">{detail.label}</span><strong>{detail.name ?? 'Empty slot'}</strong>
      {detail.missing && <span className="team-build-warning">Missing from inventory</span>}
      {detail.changed && <small>Replaces: {detail.before}</small>}
    </div>}
  </article>;
}

export default function SavedTeamBuilds({ saveState, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<'replace' | 'delete' | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const builds = saveState.savedTeamBuilds ?? [];
  const selected = builds.find(b => b.id === selectedId);
  const preview = selected ? previewTeamBuild(saveState, selected) : null;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    node?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); }
      if (e.key !== 'Tab' || !node) return;
      const controls = (Array.from(node.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]')) as HTMLElement[]).filter(el => el.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === node)) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  const resetMessages = () => { setError(''); setNotice(''); setPending(null); };
  const saveNew = () => {
    resetMessages();
    try {
      const name = cleanTeamBuildName(newName);
      const id = crypto.randomUUID();
      const captured = captureTeamBuild(saveState, name, id);
      const issues = previewTeamBuild(saveState, captured).issues;
      if (issues.length) throw new Error(issues[0]);
      onUpdate(prev => {
        if ((prev.savedTeamBuilds?.length ?? 0) >= MAX_TEAM_BUILDS) return prev;
        const build = captureTeamBuild(prev, name, id);
        if (previewTeamBuild(prev, build).issues.length) return prev;
        return { ...prev, savedTeamBuilds: [...(prev.savedTeamBuilds ?? []), build] };
      });
      setSelectedId(id); setNewName(''); setNotice('Team build saved.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save this team.'); }
  };
  const rename = (build: SavedTeamBuild) => {
    resetMessages();
    try {
      const name = cleanTeamBuildName(draft);
      onUpdate(prev => renameTeamBuild(prev, build.id, name));
      setRenameId(null); setNotice('Team renamed.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to rename this team.'); }
  };
  const confirmAction = () => {
    if (!selected) return;
    try {
      if (pending === 'delete') {
        onUpdate(prev => ({ ...prev, savedTeamBuilds: (prev.savedTeamBuilds ?? []).filter(b => b.id !== selected.id) }));
        setSelectedId(null); setNotice('Preset deleted. Your equipment is unchanged.');
      } else {
        const replacement = captureTeamBuild(saveState, selected.name, selected.id);
        const issues = previewTeamBuild(saveState, replacement).issues;
        if (issues.length) throw new Error(issues[0]);
        onUpdate(prev => {
          const updated = captureTeamBuild(prev, selected.name, selected.id);
          if (previewTeamBuild(prev, updated).issues.length) return prev;
          return { ...prev, savedTeamBuilds: (prev.savedTeamBuilds ?? []).map(b => b.id === selected.id ? updated : b) };
        });
        setNotice('Preset updated from your current party.');
      }
      setPending(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update this team.'); }
  };

  return <>
    <button ref={trigger} type="button" className="team-build-trigger" onClick={() => {
      resetMessages(); setRenameId(null); setSelectedId(builds[0]?.id ?? null); setOpen(true);
    }} aria-haspopup="dialog">
      <Bookmark size={16} /><span>Saved Builds</span><span className="team-build-count">{builds.length}/{MAX_TEAM_BUILDS}</span>
    </button>
    {open && createPortal(<div className="team-build-backdrop" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="team-build-title" className="team-build-dialog">
        <header className="team-build-header">
          <div className="team-build-heading"><Bookmark size={22} /><h2 id="team-build-title">Team Loadouts</h2><span className="team-build-count">{builds.length}/{MAX_TEAM_BUILDS}</span></div>
          <button type="button" className="team-build-icon" title="Close saved builds" aria-label="Close saved builds" onClick={() => setOpen(false)}><X size={20} /></button>
        </header>
        <div className="team-build-content">
          <aside className="team-build-list" aria-label="Saved teams">
            {builds.map(build => <div key={build.id} className={`team-build-entry ${selectedId === build.id ? 'is-selected' : ''}`}>
              {renameId === build.id ? <form className="team-build-rename" onSubmit={e => { e.preventDefault(); rename(build); }}>
                <input autoFocus aria-label="Team name" value={draft} maxLength={TEAM_BUILD_NAME_LENGTH} onChange={e => setDraft(e.target.value)} />
                <button className="team-build-icon" type="submit" aria-label="Save team name" title="Save team name"><Check size={16} /></button>
                <button className="team-build-icon" type="button" aria-label="Cancel rename" title="Cancel rename" onClick={() => setRenameId(null)}><X size={16} /></button>
              </form> : <div className="team-build-entry-top">
                <button type="button" className="team-build-select" aria-pressed={selectedId === build.id} onClick={() => { resetMessages(); setSelectedId(build.id); }}>
                  <strong>{build.name}</strong><span><Users size={12} aria-label="Heroes" />{build.members.length}/4 <Sparkles size={12} aria-label="Damage skin" />{build.damageSkin}</span>
                </button>
                <button type="button" className="team-build-icon" title={`Rename ${build.name}`} aria-label={`Rename ${build.name}`} onClick={() => { resetMessages(); setRenameId(build.id); setDraft(build.name); }}><Pencil size={14} /></button>
              </div>}
              <div className="team-build-hero-list">{build.members.map((m, index) => {
                const hero = PLAYABLE_CHARACTERS.find(c => c.id === m.characterId);
                return <span key={`${m.characterId}-${index}`} style={{ '--hero-color': hero?.themeColor } as CSSProperties} title={buildHeroName(m.characterId)}><HeroMark id={m.characterId} /></span>;
              })}</div>
              {previewTeamBuild(saveState, build).issues.length > 0 && <small className="team-build-warning"><AlertTriangle size={12} />Check equipment</small>}
            </div>)}
            {!builds.length && <p className="team-build-empty">No saved builds yet.</p>}
            <form className="team-build-new" onSubmit={e => { e.preventDefault(); saveNew(); }}>
              <label htmlFor="new-team-build"><Plus size={14} />New loadout</label>
              <input id="new-team-build" placeholder="Team name" maxLength={TEAM_BUILD_NAME_LENGTH} value={newName} onChange={e => setNewName(e.target.value)} disabled={builds.length >= MAX_TEAM_BUILDS} />
              <button type="submit" className="team-build-button" disabled={!newName.trim() || !saveState.partyIds.length || builds.length >= MAX_TEAM_BUILDS}><Plus size={16} />Save Party</button>
              {builds.length >= MAX_TEAM_BUILDS && <small>5/5 slots used</small>}
              {!saveState.partyIds.length && <small>Add a hero to save a team.</small>}
            </form>
          </aside>
          <div className="team-build-preview">
            {selected && preview ? <>
              <div className="team-build-preview-heading"><div><span className="team-build-eyebrow">Squad preview</span><h3>{selected.name}</h3></div><span className="team-build-skin"><Sparkles size={15} /><span>{(saveState.activeDamageSkin || 'Default') !== selected.damageSkin && <>{saveState.activeDamageSkin || 'Default'} &rarr; </>}{selected.damageSkin}</span></span></div>
              <div className="team-build-members">{selected.members.map((member, index) => <BuildMember key={`${selected.id}-${member.characterId}-${index}`} member={member} state={saveState} index={index} />)}</div>
              <details className="team-build-details"><summary><Users size={14} />Party changes<ChevronDown size={14} /></summary><p>{saveState.partyIds.map(buildHeroName).join(', ') || 'Empty party'} <ArrowRight size={14} /> {selected.members.map(m => buildHeroName(m.characterId)).join(', ')}</p></details>
              {!!preview.transfers.length && <details className="team-build-details team-build-transfers"><summary><RefreshCw size={14} />{preview.transfers.length} gear transfers<ChevronDown size={14} /></summary><ul>{preview.transfers.map((line, i) => <li key={i}>{line}</li>)}</ul></details>}
              {!!preview.issues.length && <div className="team-build-issues"><h4><AlertTriangle size={14} />Build unavailable</h4><ul>{preview.issues.map((line, i) => <li key={i}>{line}</li>)}</ul></div>}
            </> : <div className="team-build-empty"><Shield size={42} /><p>Your next squad starts here.</p></div>}
          </div>
        </div>
        <div className="team-build-dock">
          {selected && preview && <>
            {pending ? <div className="team-build-confirm" role="alert"><div><strong>{pending === 'delete' ? `Delete ${selected.name}?` : `Overwrite ${selected.name}?`}</strong><small>{pending === 'delete' ? 'Equipment stays untouched.' : 'Use your current party and gear.'}</small></div><div><button type="button" className="team-build-button" onClick={() => setPending(null)}>Cancel</button><button type="button" className={`team-build-button ${pending === 'delete' ? 'danger' : 'primary'}`} onClick={confirmAction}>{pending === 'delete' ? <Trash2 size={16} /> : <RefreshCw size={16} />}{pending === 'delete' ? 'Delete' : 'Overwrite'}</button></div></div> : <div className="team-build-actions">
                <span className="team-build-ready">{preview.issues.length ? <><AlertTriangle size={14} />Needs attention</> : <><Check size={14} />Ready</>}</span>
                <button type="button" className="team-build-button primary" disabled={!!preview.issues.length || !!pending} onClick={() => {
                  resetMessages();
                  onUpdate(prev => {
                    const currentBuild = prev.savedTeamBuilds?.find(b => b.id === selected.id);
                    return currentBuild ? applyTeamBuild(prev, currentBuild, true) : prev;
                  });
                  setNotice(`${selected.name} applied.`);
                }}><Check size={16} />Equip Team</button>
                <button type="button" className="team-build-icon" aria-label="Overwrite with current party" title="Overwrite with current party" disabled={!saveState.partyIds.length} onClick={() => { resetMessages(); setPending('replace'); }}><RefreshCw size={18} /></button>
                <button type="button" className="team-build-icon danger" title="Delete preset" aria-label="Delete preset" onClick={() => { resetMessages(); setPending('delete'); }}><Trash2 size={17} /></button>
              </div>}
          </>}
          {(error || notice) && <div className="team-build-status" aria-live="polite">{error ? <span role="alert" className="team-build-warning">{error}</span> : notice}</div>}
        </div>
      </section>
    </div>, document.body)}
  </>;
}
