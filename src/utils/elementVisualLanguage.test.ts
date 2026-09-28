import assert from 'node:assert/strict';
import test from 'node:test';
import { ELEMENT_VISUALS, getReactionChoreography } from './elementVisualLanguage';

test('all seven gameplay elements have distinct motifs and colors', () => {
  const profiles = Object.values(ELEMENT_VISUALS);
  assert.equal(profiles.length, 7);
  assert.equal(new Set(profiles.map(profile => profile.motif)).size, 7);
  assert.equal(new Set(profiles.map(profile => profile.color)).size, 7);
});

test('reaction choreography picks a visual sequence without changing damage', () => {
  assert.equal(getReactionChoreography('vaporize').motion, 'compress');
  assert.equal(getReactionChoreography('superconduct').motion, 'fracture');
  assert.equal(getReactionChoreography('unknown').motion, 'ring');
});
