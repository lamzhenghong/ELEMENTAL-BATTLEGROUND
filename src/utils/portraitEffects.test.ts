import assert from 'node:assert/strict';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { resolvePortraitEffect, unlockNextPortraitTier } from './portraitEffects';

const unlocked = { aurelia: 4, kaelen: 2, locked: 6 };
assert.equal(resolvePortraitEffect('aurelia', unlocked, 'Pyro').activeTier, 4);
assert.equal(resolvePortraitEffect('aurelia', unlocked, 'Pyro').buffs.atk, 0);
assert.equal(resolvePortraitEffect('aurelia', unlocked, 'Pyro').buffs.elementalDamage, 0.18);
assert.equal(resolvePortraitEffect('aurelia', { aurelia: 3 }, 'Pyro').buffs.atk, 0);
assert.equal(resolvePortraitEffect('aurelia', { aurelia: 3 }, 'Pyro').buffs.critRate, 0.10);
assert.equal(
  (resolvePortraitEffect('aurelia', unlocked, 'Pyro').frameStyle as Record<string, string>)['--portrait-effect-color'],
  '#fb7185',
);
assert.equal(resolvePortraitEffect('locked', unlocked, 'Electro', false).activeTier, 0);
assert.equal(unlockNextPortraitTier({ aurelia: 4 }, 'aurelia'), 5);
assert.equal(unlockNextPortraitTier({ aurelia: 6 }, 'aurelia'), 6);

for (const character of PLAYABLE_CHARACTERS) {
  const effect = resolvePortraitEffect(
    character.id,
    { [character.id]: 6 },
    character.element,
  );
  assert.equal(effect.unlockedTier, 6, `${character.name} must resolve P6 ownership`);
  assert.equal(effect.activeTier, 6, `${character.name} must activate every owned tier through P6`);
  assert.ok(effect.frameColor.startsWith('#'), `${character.name} must resolve an element frame`);
}

console.log('portrait effect ownership and cumulative activation rules ok');
