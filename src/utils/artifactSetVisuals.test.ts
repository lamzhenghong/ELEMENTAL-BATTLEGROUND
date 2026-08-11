import assert from 'node:assert/strict';
import test from 'node:test';
import type { Artifact, ArtifactSet, ArtifactSlot } from '../types';
import {
  ARTIFACT_SET_VISUALS,
  getArtifactSetProgress,
  getPrimaryIncompleteSet,
} from './artifactSetVisuals';

const slots: ArtifactSlot[] = ['helmet', 'hands', 'leg', 'shoe'];
const makeArtifact = (set: ArtifactSet, slot: ArtifactSlot, index = 0): Artifact => ({
  id: `${set}-${slot}-${index}`,
  name: `${set} ${slot}`,
  set,
  slot,
  rarity: 5,
});

test('artifact progress reports 0 through 4 pieces without applying bonuses', () => {
  for (let count = 0; count <= 4; count += 1) {
    const progress = getArtifactSetProgress(slots.slice(0, count).map(slot => makeArtifact('Celestial', slot)))
      .find(entry => entry.set === 'Celestial');
    assert.equal(progress?.count, count);
    assert.equal(progress?.tier, count >= 4 ? 4 : count >= 2 ? 2 : 0);
    assert.equal(progress?.isTwoPieceActive, count >= 2);
    assert.equal(progress?.isFourPieceActive, count >= 4);
    assert.deepEqual(progress?.missingSlots, slots.slice(count));
  }
});

test('replacing and removing pieces updates set progress from equipped slots', () => {
  const initial = [
    makeArtifact('Vanguard', 'helmet'),
    makeArtifact('Vanguard', 'hands'),
    makeArtifact('Vanguard', 'leg'),
    makeArtifact('Guardian', 'shoe'),
  ];
  const before = getArtifactSetProgress(initial).find(entry => entry.set === 'Vanguard');
  const completed = getArtifactSetProgress([...initial.slice(0, 3), makeArtifact('Vanguard', 'shoe')])
    .find(entry => entry.set === 'Vanguard');
  const removed = getArtifactSetProgress(initial.slice(0, 2)).find(entry => entry.set === 'Vanguard');

  assert.equal(before?.tier, 2);
  assert.deepEqual(before?.missingSlots, ['shoe']);
  assert.equal(completed?.tier, 4);
  assert.equal(removed?.count, 2);
});

test('incomplete guidance picks a unique leading set and avoids tied recommendations', () => {
  const unique = getArtifactSetProgress([
    makeArtifact('Chrono', 'helmet'),
    makeArtifact('Chrono', 'hands'),
    makeArtifact('Guardian', 'leg'),
  ]);
  const tied = getArtifactSetProgress([
    makeArtifact('Chrono', 'helmet'),
    makeArtifact('Guardian', 'hands'),
  ]);

  assert.equal(getPrimaryIncompleteSet(unique)?.set, 'Chrono');
  assert.equal(getPrimaryIncompleteSet(tied), null);
});

test('all canonical artifact sets provide an emblem and aura theme', () => {
  assert.deepEqual(Object.keys(ARTIFACT_SET_VISUALS).sort(), ['Celestial', 'Chrono', 'Guardian', 'Vanguard']);
  Object.values(ARTIFACT_SET_VISUALS).forEach(theme => {
    assert.ok(theme.color.startsWith('#'));
    assert.ok(theme.aura.length > 0);
    assert.ok(theme.emblem.length > 0);
  });
});
