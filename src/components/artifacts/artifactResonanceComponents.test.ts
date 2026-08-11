import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const emblem = readFileSync(new URL('./ArtifactSetEmblem.tsx', import.meta.url), 'utf8');
const progress = readFileSync(new URL('./ArtifactSetProgress.tsx', import.meta.url), 'utf8');
const inventory = readFileSync(new URL('../InventoryManager.tsx', import.meta.url), 'utf8');
const arena = readFileSync(new URL('../CombatArena.tsx', import.meta.url), 'utf8');
const aura = readFileSync(new URL('../combat/ArtifactResonanceAura.ts', import.meta.url), 'utf8');

test('set emblem and progress expose two-piece, four-piece, and missing-slot states', () => {
  assert.match(emblem, /2-Piece Active/);
  assert.match(emblem, /4-Piece Active/);
  assert.match(progress, /missingSlots/);
  assert.match(progress, /2\/4/);
  assert.match(progress, /4\/4/);
});

test('Forge renders visual progress and an inline four-piece activation message', () => {
  assert.match(inventory, /ArtifactSetProgress/);
  assert.match(inventory, /4-Piece Resonance Active/);
  assert.match(inventory, /playArtifactResonance/);
  assert.match(inventory, /clearTimeout/);
});

test('combat renders subtle set emblems and allocation-free mobile quality aura', () => {
  assert.match(arena, /ArtifactSetEmblem/);
  assert.match(arena, /drawArtifactResonanceAura/);
  assert.match(aura, /quality === 'low'/);
  assert.doesNotMatch(aura, /new Particle/);
});
