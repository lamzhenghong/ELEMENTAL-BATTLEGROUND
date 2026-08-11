import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./RogueDungeon.tsx', import.meta.url), 'utf8');

assert.match(source, /completedRoomTokenRef/);
assert.match(source, /runTokenRef/);
assert.match(source, /const roomToken = `\$\{runTokenRef\.current\}:\$\{currentRoomIdx\}`/);
assert.match(source, /if \(completedRoomTokenRef\.current === roomToken\) return/);
assert.match(source, /completedRoomTokenRef\.current = roomToken/);
assert.match(source, /completedRoomTokenRef\.current = null/);
assert.match(source, /runTokenRef\.current \+= 1/);

const handlerStart = source.indexOf('const handleDungeonBattleEnd');
const rewardStart = source.indexOf("onAddItems?.('ascension'", handlerStart);
const guardStart = source.indexOf('completedRoomTokenRef.current === roomToken', handlerStart);
assert.ok(handlerStart >= 0 && guardStart > handlerStart && guardStart < rewardStart);

console.log('rogue room reward transaction contracts ok');
