import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('mobile settings expose a validated touch-control editor', () => {
  const editor = readFileSync(new URL('./MobileControlEditor.tsx', import.meta.url), 'utf8');
  const mainSettings = readFileSync(new URL('./MainMenuSettingsModal.tsx', import.meta.url), 'utf8');
  const gameSettings = readFileSync(new URL('./InGameSettingsModal.tsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

  assert.match(editor, /setPointerCapture/);
  assert.match(editor, /RESET DEFAULT/);
  assert.match(editor, /SAVE LAYOUT/);
  assert.match(editor, /specialUltimate/);
  assert.match(editor, /getMobileControlLayoutErrors/);
  assert.match(mainSettings, /CUSTOMIZE MOBILE CONTROLS/);
  assert.match(gameSettings, /CUSTOMIZE MOBILE CONTROLS/);
  assert.match(mainSettings, /isMobile/);
  assert.match(gameSettings, /isMobile/);
  assert.match(app, /loadMobileControlLayout/);
  assert.match(app, /persistMobileControlLayout/);
});
