import assert from 'node:assert/strict';
import test from 'node:test';
import { getArenaLocation } from './arenaLocation';

test('each story chapter has its own floor while its five stages share one', () => {
  const ids = Array.from({ length: 10 }, (_, index) => getArenaLocation({ storyStageId: `${index + 1}-1` }).id);
  assert.equal(new Set(ids).size, 10);
  const motifs = Array.from({ length: 10 }, (_, index) => getArenaLocation({ storyStageId: `${index + 1}-1` }).motif);
  assert.equal(new Set(motifs).size, 10);
  for (let chapter = 1; chapter <= 10; chapter++) {
    assert.equal(getArenaLocation({ storyStageId: `${chapter}-1` }).id, getArenaLocation({ storyStageId: `${chapter}-5`, hard: true }).id);
  }
});

test('existing combat modes receive separate scene profiles', () => {
  const modes = [
    getArenaLocation({}).id,
    getArenaLocation({ artifactGrind: true }).id,
    getArenaLocation({ rogueRoom: 'battle' }).id,
    getArenaLocation({ rogueRoom: 'elite' }).id,
    getArenaLocation({ rogueRoom: 'boss' }).id,
    getArenaLocation({ storyStageId: 'char-aurelia-1' }).id,
  ];
  assert.equal(new Set(modes).size, modes.length);
});
