import assert from 'node:assert/strict';
import test from 'node:test';
import { ElementalChoreography } from './ElementalChoreography';

test('reaction visuals are bounded, expire, and never affect combat state', () => {
  const visuals = new ElementalChoreography();
  for (let index = 0; index < 30; index++) visuals.reaction('vaporize', 10, 20);
  assert.equal(visuals.activeCount, 12);
  for (let index = 0; index < 10; index++) visuals.step(50);
  assert.equal(visuals.activeCount, 0);
});

test('rapid swaps replace the previous handoff visual', () => {
  const visuals = new ElementalChoreography();
  visuals.handoff('Pyro', 'Hydro', 10, 20);
  visuals.handoff('Hydro', 'Electro', 10, 20);
  assert.equal(visuals.activeCount, 1);
  visuals.clear();
  assert.equal(visuals.activeCount, 0);
});
