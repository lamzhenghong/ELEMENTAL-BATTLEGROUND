import assert from 'node:assert/strict';
import {
  formatCombatDuration,
  getCombatSessionPresentation,
  getImprovedClearTime,
} from './combatSessionPresentation';

assert.equal(formatCombatDuration(0), '00:00');
assert.equal(formatCombatDuration(65), '01:05');
assert.equal(getImprovedClearTime(undefined, 42), 42);
assert.equal(getImprovedClearTime(42, 42), undefined);
assert.equal(getImprovedClearTime(42, 41), 41);

assert.deepEqual(
  getCombatSessionPresentation({ mode: 'story-campaign', stageId: '4-3', bestClearSecs: 73 }),
  {
    eyebrow: 'STORY CAMPAIGN',
    progressLabel: 'CHAPTER 4 - STAGE 3',
    deploymentLabel: 'STORY CAMPAIGN - CHAPTER 4 - STAGE 3',
    pauseLabel: 'CHAPTER 4 - STAGE 3',
    resultLabel: 'STAGE 4-3',
    recordLabel: 'FASTEST CLEAR',
    recordValue: '01:13',
  },
);

const character = getCombatSessionPresentation({
  mode: 'character-story',
  stageId: 'char-aurelia-2',
  characterName: 'Aurelia',
  act: 2,
  bestClearSecs: 54,
});
assert.match(character.deploymentLabel, /AURELIA - ACT 2/);
assert.doesNotMatch(character.deploymentLabel, /WAVE/);

assert.equal(
  getCombatSessionPresentation({ mode: 'endless-arena', wave: 8, bestWave: 12 }).recordValue,
  'WAVE 12',
);
assert.equal(
  getCombatSessionPresentation({ mode: 'artifact-grind', wave: 8, bestWave: 19 }).recordValue,
  'WAVE 19',
);
assert.match(
  getCombatSessionPresentation({
    mode: 'rogue-ruins',
    room: 6,
    roomCount: 10,
    roomType: 'elite',
    deepestRoom: 8,
  }).progressLabel,
  /ROOM 6\/10 - ELITE/,
);

assert.equal(
  getCombatSessionPresentation({ mode: 'story-campaign', stageId: '4-3' }).recordValue,
  'NO RECORD',
);
assert.equal(formatCombatDuration(-4.9), '00:00');
assert.equal(formatCombatDuration(65.9), '01:05');

console.log('combat session presentation ok');
