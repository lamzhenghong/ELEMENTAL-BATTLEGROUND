import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Check, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import type { SaveState, SavedTeamBuild } from '../types';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import {
  applyTeamBuild, BUILD_SLOT_LABELS, BUILD_SLOTS, buildHeroName, captureTeamBuild,
  cleanTeamBuildName, MAX_TEAM_BUILDS, previewTeamBuild, renameTeamBuild, TEAM_BUILD_NAME_LENGTH,
} from '../utils/teamBuilds';
import './SavedTeamBuilds.css';

interface Props {
  saveState: SaveState;
  onUpdate: (updater: (prev: SaveState) => SaveState) => void;
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
          <div><h2 id="team-build-title">Saved Team Builds <span>{builds.length}/{MAX_TEAM_BUILDS}</span></h2><p>Party, equipment and damage skin</p></div>
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
                  <strong>{build.name}</strong><span>{build.members.length} heroes / {build.damageSkin}</span>
                </button>
                <button type="button" className="team-build-icon" title={`Rename ${build.name}`} aria-label={`Rename ${build.name}`} onClick={() => { resetMessages(); setRenameId(build.id); setDraft(build.name); }}><Pencil size={14} /></button>
              </div>}
              <div className="team-build-hero-list">{build.members.map((m, index) => {
                const hero = PLAYABLE_CHARACTERS.find(c => c.id === m.characterId);
                return <span key={`${m.characterId}-${index}`} style={{ borderColor: hero?.themeColor }} title={buildHeroName(m.characterId)}>{buildHeroName(m.characterId).split(' ')[0]}</span>;
              })}</div>
              {previewTeamBuild(saveState, build).issues.length > 0 && <small className="team-build-warning">Needs attention</small>}
            </div>)}
            {!builds.length && <p className="team-build-empty">No saved builds yet.</p>}
            <form className="team-build-new" onSubmit={e => { e.preventDefault(); saveNew(); }}>
              <label htmlFor="new-team-build">Save Current Party</label>
              <input id="new-team-build" placeholder="Team name" maxLength={TEAM_BUILD_NAME_LENGTH} value={newName} onChange={e => setNewName(e.target.value)} disabled={builds.length >= MAX_TEAM_BUILDS} />
              <button type="submit" className="team-build-button" disabled={!newName.trim() || !saveState.partyIds.length || builds.length >= MAX_TEAM_BUILDS}><Plus size={16} />Save New Build</button>
              {builds.length >= MAX_TEAM_BUILDS && <small>All 5 presets used. Update or delete a saved build.</small>}
              {!saveState.partyIds.length && <small>Select at least one hero in Party Setup.</small>}
            </form>
          </aside>
          <div className="team-build-preview">
            {selected && preview ? <>
              <h3>{selected.name}</h3>
              <div className="team-build-summary"><span>Current party</span><p>{saveState.partyIds.map(buildHeroName).join(', ') || 'Empty'}</p><span>Saved party</span><p>{selected.members.map(m => buildHeroName(m.characterId)).join(', ')}</p><span>Damage skin</span><p>{saveState.activeDamageSkin || 'Default'} <span aria-hidden="true">&rarr;</span> {selected.damageSkin}</p></div>
              <div className="team-build-members">{selected.members.map((member, index) => {
                const currentWeaponId = saveState.characterEquippedWeapon[member.characterId];
                const currentWeapon = saveState.inventoryWeapons.find(w => w.id === currentWeaponId);
                const desiredWeapon = saveState.inventoryWeapons.find(w => w.id === member.weapon?.id);
                const row = (label: string, before: string, after: string, changed: boolean, missing: boolean) => <div className={`team-build-gear ${changed ? 'is-changed' : ''} ${missing ? 'is-missing' : ''}`} key={label}>
                  <span>{label}</span><div>{changed && <small>Current: {before}</small>}<p>{after}{missing && <strong> (Missing)</strong>}</p></div>
                </div>;
                return <article className="team-build-member" key={`${member.characterId}-${index}`}>
                  <h4>{index + 1}. {buildHeroName(member.characterId)}</h4>
                  {row('Weapon', currentWeapon?.name ?? 'Unequipped', desiredWeapon ? `${desiredWeapon.name} / Lv.${desiredWeapon.level}` : member.weapon?.name ?? 'Unequipped', (currentWeaponId ?? null) !== (member.weapon?.id ?? null), !!member.weapon && !desiredWeapon)}
                  {BUILD_SLOTS.map(slot => {
                    const beforeId = saveState.characterEquippedArtifacts?.[member.characterId]?.[slot];
                    const before = saveState.inventoryArtifacts?.find(a => a.id === beforeId);
                    const desired = member.artifacts[slot];
                    const after = saveState.inventoryArtifacts?.find(a => a.id === desired?.id);
                    return row(BUILD_SLOT_LABELS[slot], before?.name ?? 'Unequipped', after ? `${after.name} / ${after.rarity}-Star` : desired?.name ?? 'Unequipped', (beforeId ?? null) !== (desired?.id ?? null), !!desired && !after);
                  })}
                </article>;
              })}</div>
              {!!preview.transfers.length && <div className="team-build-transfers"><h4>Equipment Transfers</h4><ul>{preview.transfers.map((line, i) => <li key={i}>{line}</li>)}</ul></div>}
              {!!preview.issues.length && <div className="team-build-issues"><h4>Resolve Before Applying</h4><ul>{preview.issues.map((line, i) => <li key={i}>{line}</li>)}</ul></div>}
              <div className="team-build-actions">
                <button type="button" className="team-build-button primary" disabled={!!preview.issues.length || !!pending} onClick={() => {
                  resetMessages();
                  onUpdate(prev => {
                    const currentBuild = prev.savedTeamBuilds?.find(b => b.id === selected.id);
                    return currentBuild ? applyTeamBuild(prev, currentBuild, true) : prev;
                  });
                  setNotice(`${selected.name} applied.`);
                }}><Check size={16} />Apply Build</button>
                <button type="button" className="team-build-button" disabled={!saveState.partyIds.length} onClick={() => { resetMessages(); setPending('replace'); }}><RefreshCw size={16} />Update from Current Party</button>
                <button type="button" className="team-build-icon danger" title="Delete preset" aria-label="Delete preset" onClick={() => { resetMessages(); setPending('delete'); }}><Trash2 size={17} /></button>
              </div>
              {pending && <div className="team-build-confirm" role="alert"><p>{pending === 'delete' ? `Delete "${selected.name}"? Only this preset will be removed.` : `Replace "${selected.name}" with your current party and equipment?`}</p><div><button type="button" className="team-build-button" onClick={() => setPending(null)}>Cancel</button><button type="button" className="team-build-button primary" onClick={confirmAction}>Confirm</button></div></div>}
            </> : <div className="team-build-empty"><Bookmark size={30} /><p>Select a saved build to preview its equipment.</p></div>}
          </div>
        </div>
        <footer className="team-build-footer" aria-live="polite">{error ? <span role="alert" className="team-build-warning">{error}</span> : notice || 'Builds are saved with your progress. Sign in to sync across devices.'}</footer>
      </section>
    </div>, document.body)}
  </>;
}
