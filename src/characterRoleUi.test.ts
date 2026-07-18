import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(join(srcDir, path), 'utf8');

const badgeSource = read('components/CharacterRoleBadge.tsx');
assert.match(badgeSource, /getRoleLabel/);
assert.match(badgeSource, /DPS/);
assert.match(badgeSource, /Support/);
assert.match(badgeSource, /Tank/);

const appSource = read('App.tsx');
assert.match(appSource, /CharacterRoleBadge/);
assert.match(appSource, /partyRoleFilter/);
assert.match(appSource, /c\.role === partyRoleFilter/);

const forgeSource = read('components/InventoryManager.tsx');
assert.match(forgeSource, /CharacterRoleBadge/);
assert.match(forgeSource, /selectedChar\.role/);

const wikiSource = read('components/GDDViewer.tsx');
assert.match(wikiSource, /CharacterRoleBadge/);
assert.match(wikiSource, /charRoleFilter/);
assert.match(wikiSource, /char\.role === charRoleFilter/);

const gachaSource = read('components/GachaSimulator.tsx');
assert.match(gachaSource, /CharacterRoleBadge/);
assert.match(gachaSource, /showSplashCharacter\?\.role/);
assert.match(gachaSource, /featuredCharacter\?\.role/);

const combatSource = read('components/CombatArena.tsx');
assert.match(combatSource, /CharacterRoleBadge/);

console.log('character role UI contract ok');
