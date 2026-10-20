import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MenuSurface from './MenuSurface';
import type { AppScreen } from '../../utils/aetherTransition';

const renderSurface = (screen: AppScreen, lowGraphics = false) => {
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { hidden: false } });
  try {
    return renderToStaticMarkup(createElement(MenuSurface, {
      screen, paused: false, lowGraphics,
      children: createElement('button', null, 'Combat content'),
    }));
  } finally {
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
};

test('combat screens do not trap fullscreen HUDs inside menu stacking contexts', () => {
  for (const screen of ['arena', 'dungeon'] as const) {
    for (const lowGraphics of [false, true]) {
      assert.equal(renderSurface(screen, lowGraphics), '<button>Combat content</button>');
    }
  }
});

test('noncombat menus retain their themed material and ambient presentation', () => {
  for (const [screen, material] of [['story', 'stone'], ['inventory', 'metal'], ['wiki', 'ink'], ['wish', 'astral']] as const) {
    const html = renderSurface(screen);
    assert.match(html, /class="menu-surface"/);
    assert.ok(html.includes(`data-material="${material}"`));
    assert.match(html, /<button>Combat content<\/button>/);
  }
});
