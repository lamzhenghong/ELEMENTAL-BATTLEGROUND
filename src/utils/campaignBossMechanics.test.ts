import assert from 'node:assert/strict';
import type { CampaignBossMechanicId } from '../data/story/types';
import {
  createCampaignBossMechanicState,
  stepCampaignBossMechanic,
  type CampaignBossAction,
  type CampaignBossMechanicContext,
  type CampaignBossMechanicState,
} from './campaignBossMechanics';

const IDS: CampaignBossMechanicId[] = [
  'sepulchral-silence',
  'vowclock-edict',
  'seasonal-convergence',
  'seven-anchor-dominion',
  'worldforge-root',
  'one-perfect-second',
  'sevenfold-convergence',
];

const runMechanic = (
  mechanicId: CampaignBossMechanicId,
  phase: 1 | 2 | 3,
  frames = 720,
) => {
  let state = createCampaignBossMechanicState();
  const actions: CampaignBossAction[] = [];
  let maxStepActions = 0;

  for (let frame = 0; frame < frames; frame += 1) {
    const context: CampaignBossMechanicContext = {
      mechanicId,
      phase,
      combatSpeed: 1,
      bossX: 500,
      bossY: 350,
      targetX: 200 + (frame % 180),
      targetY: 220 + ((frame * 2) % 140),
      random: () => 0.25,
    };
    const step = stepCampaignBossMechanic(state, context);
    state = step.state;
    actions.push(...step.actions);
    maxStepActions = Math.max(maxStepActions, step.actions.length);
  }

  return { state, actions, maxStepActions };
};

for (const mechanicId of IDS) {
  for (const phase of [1, 2, 3] as const) {
    const result = runMechanic(mechanicId, phase);
    assert.ok(result.actions.length > 0, `${mechanicId} phase ${phase} should act`);
    assert.ok(result.maxStepActions <= 16, `${mechanicId} emitted too many actions`);
    for (const warning of result.actions.filter((action) => action.kind === 'warning')) {
      assert.ok(warning.delayFrames >= 30, `${mechanicId} warning telegraph is too short`);
    }
  }
}

const silenceOne = runMechanic('sepulchral-silence', 1).actions;
assert.equal(silenceOne.filter((action) => action.kind === 'projectile').length >= 7, true);
const silenceTwo = runMechanic('sepulchral-silence', 2).actions;
assert.ok(silenceTwo.some((action) => action.kind === 'warning' && action.innerRadius !== undefined));
const silenceThree = runMechanic('sepulchral-silence', 3).actions;
assert.ok(silenceThree.some((action) => action.kind === 'warning' && action.label === 'FROZEN HEART'));

const vowOne = runMechanic('vowclock-edict', 1).actions;
assert.ok(vowOne.filter((action) => action.kind === 'warning' && action.label === 'VOWCLOCK HAND').length >= 2);
const vowTwo = runMechanic('vowclock-edict', 2);
assert.ok(vowTwo.state.recordedTargets && vowTwo.state.recordedTargets.length > 0);
assert.ok(vowTwo.actions.some((action) => action.kind === 'warning' && action.label === 'RECORDED ECHO'));
const vowPhaseTwoCount = vowTwo.actions.filter((action) => action.kind === 'warning').length;
const vowPhaseThreeCount = runMechanic('vowclock-edict', 3).actions
  .filter((action) => action.kind === 'warning').length;
assert.ok(vowPhaseThreeCount > vowPhaseTwoCount);

const seasonal = runMechanic('seasonal-convergence', 1).actions;
assert.ok(seasonal.some((action) => action.kind === 'projectile' && action.element === 'Pyro'));
assert.ok(seasonal.some((action) => action.kind === 'projectile' && action.element === 'Cryo'));
assert.ok(runMechanic('seasonal-convergence', 2).actions.some((action) => action.kind === 'patch'));
const seasonalThree = runMechanic('seasonal-convergence', 3).actions;
assert.ok(seasonalThree.some((action) => action.kind === 'warning' && action.label === 'CONVERGENCE METEOR'));
assert.ok(seasonalThree.some((action) => action.kind === 'projectile' && action.element === 'Cryo'));

const anchorsOne = runMechanic('seven-anchor-dominion', 1).actions;
assert.ok(anchorsOne.filter((action) => action.kind === 'warning' && action.label === 'SKY ANCHOR').length >= 6);
assert.ok(runMechanic('seven-anchor-dominion', 2).actions.some((action) => action.kind === 'pull'));
assert.ok(
  runMechanic('seven-anchor-dominion', 3).actions
    .filter((action) => action.kind === 'warning' && action.label === 'ANCHOR COLLAPSE').length >= 6,
);

const rootsOne = runMechanic('worldforge-root', 1).actions;
assert.ok(rootsOne.filter((action) => action.kind === 'warning' && action.label === 'ROOT CAGE').length >= 5);
assert.ok(runMechanic('worldforge-root', 2).actions.some((action) => action.kind === 'patch'));
assert.ok(
  runMechanic('worldforge-root', 3).actions
    .filter((action) => action.kind === 'warning' && action.label === 'WORLDFORGE ERUPTION').length >= 5,
);

const perfectSecond = runMechanic('one-perfect-second', 2);
assert.ok(perfectSecond.state.recordedTargets && perfectSecond.state.recordedTargets.length > 0);
assert.ok(perfectSecond.actions.some((action) => action.kind === 'warning' && action.label === 'AFTERIMAGE STRIKE'));
assert.ok(perfectSecond.actions.some((action) => action.kind === 'warning' && action.label === 'CLOCKFACE BARRAGE'));
const perfectTwoCount = perfectSecond.actions.filter((action) => action.kind === 'warning').length;
const perfectThreeCount = runMechanic('one-perfect-second', 3).actions
  .filter((action) => action.kind === 'warning').length;
assert.ok(perfectThreeCount > perfectTwoCount);

const sevenfoldOne = runMechanic('sevenfold-convergence', 1).actions;
assert.ok(new Set(
  sevenfoldOne
    .filter((action) => action.kind === 'warning')
    .map((action) => action.element),
).size >= 7);
assert.ok(
  runMechanic('sevenfold-convergence', 2).actions
    .some((action) => action.kind === 'warning' && action.innerRadius !== undefined),
);
assert.ok(
  runMechanic('sevenfold-convergence', 3).actions
    .some((action) => action.kind === 'warning' && action.label === 'SEVENFOLD CONVERGENCE'),
);

console.log('campaign boss mechanic scheduler ok');
