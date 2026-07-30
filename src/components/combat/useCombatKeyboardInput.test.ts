import assert from 'node:assert/strict';
import { getCombatKeyCommand } from './useCombatKeyboardInput';

const expectedCommands = new Map<string, string>([
  ['escape', 'pause'],
  ['p', 'pause'],
  ['j', 'basic-attack'],
  ['f', 'basic-attack'],
  ['q', 'ultimate'],
  ['z', 'special-ultimate'],
  ['e', 'skill'],
  [' ', 'dodge'],
  ['c', 'parry'],
  ['1', 'swap-0'],
  ['2', 'swap-1'],
  ['3', 'swap-2'],
  ['4', 'swap-3']
]);

for (const [key, command] of expectedCommands) {
  assert.equal(getCombatKeyCommand(key), command);
  assert.equal(getCombatKeyCommand(key.toUpperCase()), command);
}

assert.equal(getCombatKeyCommand('x'), null);
assert.equal(getCombatKeyCommand('arrowup'), null);

console.log('combat keyboard mapping rules ok');
