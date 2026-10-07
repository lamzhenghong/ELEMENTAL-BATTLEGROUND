import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MechanicDemonstration from './MechanicDemonstration';
import { getEnemyMechanicDemo } from './mechanicDemonstrations';

test('diagram exposes its counterplay and subject-specific playback controls without a canvas loop', () => {
  const html = renderToStaticMarkup(React.createElement(MechanicDemonstration, {
    demo: getEnemyMechanicDemo('siphon'), subject: 'Siphon', enemyColor: '#c084fc',
  }));
  assert.match(html, /<svg[^>]+role="img"/);
  assert.match(html, /<desc[^>]*>Circle: you\. Diamond: enemy\./);
  assert.match(html, /Damage the Siphon/);
  assert.match(html, /aria-label="Pause Siphon demonstration"/);
  assert.match(html, /aria-label="Replay Siphon demonstration"/);
  assert.match(html, /data-running="false"/, 'waits for observed visibility before animating');
  assert.equal((html.match(/<button/g) ?? []).length, 2);
  assert.doesNotMatch(html, /<canvas/);
});

test('separate mounted diagrams have unique accessible SVG descriptions', () => {
  const html = renderToStaticMarkup(React.createElement('section', null,
    ...['Siphon', 'Another Siphon'].map(subject => React.createElement(MechanicDemonstration, {
      key: subject, demo: getEnemyMechanicDemo('siphon'), subject, enemyColor: '#c084fc',
    })),
  ));
  const ids = Array.from(html.matchAll(/id="([^"]+)"/g), match => match[1]);
  assert.equal(ids.length, 6);
  assert.equal(new Set(ids).size, 6);
});
