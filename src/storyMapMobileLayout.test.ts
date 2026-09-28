import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import StoryMap from './components/StoryMap';

const renderMap = (chapter: number, completedStages: string[] = [], hard = false) => renderToStaticMarkup(
  React.createElement(StoryMap, {
    chapter,
    completedStages,
    starRatings: { '1-1': 3 },
    onSelectStage: () => undefined,
    devCheatsEnabled: false,
    isHardMode: hard,
    hardModeCompletedStages: hard ? completedStages : [],
  }),
);

test('campaign route has five touch-sized stages and mobile/desktop artwork', () => {
  const markup = renderMap(1);
  assert.match(markup, /Whispering Ruins campaign journey/);
  assert.match(markup, /grid-cols-1/);
  assert.match(markup, /md:grid-cols-5/);
  assert.equal((markup.match(/h-14 w-14/g) ?? []).length, 5);
  assert.match(markup, /Forest Entrance, available/);
  assert.match(markup, /Slime Ambush, locked/);
});

test('clearing a stage lights the route and unlocks the next stage', () => {
  const markup = renderMap(1, ['1-1']);
  assert.match(markup, /1 of 5 stages complete/);
  assert.match(markup, /Forest Entrance, 3 of 3 stars/);
  assert.match(markup, /Slime Ambush, available/);
});

test('hard mode uses hard progress and chapter artwork stays distinct', () => {
  const hard = renderMap(1, ['1-1'], true);
  assert.match(hard, /Hard Story Campaign/);
  assert.match(hard, /Slime Ambush, available/);
  assert.notEqual(renderMap(1).match(/chapter-1[^" ]*\.jpg/)?.[0], renderMap(6).match(/chapter-6[^" ]*\.jpg/)?.[0]);
});
