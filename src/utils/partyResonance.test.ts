import assert from 'node:assert/strict';
import { getActivePartyResonances, getPartyResonanceModifiers } from './partyResonance';

const doublePyro = getActivePartyResonances(['Pyro', 'Pyro']);
assert.deepEqual(doublePyro.map(resonance => resonance.key), ['pyro']);
assert.equal(getPartyResonanceModifiers(doublePyro).atkPercent, 0.15);

const mixed = getActivePartyResonances(['Pyro', 'Hydro', 'Cryo', 'Dendro']);
assert.deepEqual(mixed.map(resonance => resonance.key), ['unique']);
assert.equal(getPartyResonanceModifiers(mixed).allDamagePercent, 0.15);

const dendro = getActivePartyResonances(['Dendro', 'Dendro']);
assert.equal(getPartyResonanceModifiers(dendro).elementalMastery, 50);
assert.deepEqual(getActivePartyResonances(['Dendro']), []);

console.log('party resonance activation and modifier rules ok');
