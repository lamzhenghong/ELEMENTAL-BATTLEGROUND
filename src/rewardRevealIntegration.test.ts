import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layer = readFileSync(new URL('./components/RewardRevealLayer.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const questSource = readFileSync(new URL('./components/SquadronQuestLedger.tsx', import.meta.url), 'utf8');
const loginSource = readFileSync(new URL('./components/LoginRewardModal.tsx', import.meta.url), 'utf8');
const shopSource = readFileSync(new URL('./components/GemsShop.tsx', import.meta.url), 'utf8');
const gachaSource = readFileSync(new URL('./components/GachaSimulator.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

assert.match(layer, /createPortal/);
assert.match(layer, /pointer-events-none/);
assert.match(layer, /data-reward-reveal/);
assert.match(layer, /onAnimationComplete/);
assert.match(layer, /lowGraphics/);
assert.match(layer, /INVENTORY_FALLBACK_SELECTOR/);
assert.match(layer, /getBoundingClientRect/);
assert.match(layer, /setTimeout/);
assert.match(layer, /clearTimeout/);
assert.match(layer, /reducedMotion/);
assert.match(layer, /left: reducedMotion \? reveal\.destination\.x : reveal\.source\.x/);
assert.match(layer, /top: reducedMotion \? reveal\.destination\.y : reveal\.source\.y/);
assert.match(layer, /createRewardPulseController/);
assert.match(layer, /pulseController\.current\?\.reset\(\)/);

assert.match(app, /data-reward-target="mora"/);
assert.match(app, /data-reward-target="gems"/);
assert.match(app, /data-reward-target="forge"/);
assert.match(app, /data-reward-target="forge"[\s\S]{0,800}id="dash_screen_inventory"/);
assert.doesNotMatch(app, /data-reward-target="forge"[\s\S]{0,800}id="dash_screen_home"/);
assert.match(app, /data-reward-target="inventory-fallback"/);
assert.match(app, /<RewardRevealLayer/);
assert.equal(app.match(/<RewardRevealLayer/g)?.length, 1);
assert.match(app, /appendRewardEvents/);
assert.match(app, /normalizeRewardEvents/);
assert.match(app, /const enqueueRewardReveal = useCallback/);
assert.match(app, /setRewardRevealQueue\(current => current\.filter\(event => event\.id !== id\)\)/);
assert.match(app, /gemsDiff > 0/);
assert.match(app, /moraDiff > 0/);
assert.match(app, /story-\$\{stageId\}/);
assert.match(app, /data-reward-source=\{`story-\$\{storyBattleConfig\.stageId\}`\}/);
assert.match(app, /quest-\$\{quest\.id\}/);
assert.match(app, /quest-claim-all/);
assert.match(app, /login-\$\{day\}/);
assert.match(app, /onRewardReveal=\{enqueueRewardReveal\}/);

assert.match(questSource, /data-reward-source=\{`quest-\$\{q\.id\}`\}/);
assert.match(questSource, /data-reward-source="quest-claim-all"/);
assert.match(loginSource, /data-reward-source=\{`login-\$\{day\}`\}/);
assert.match(shopSource, /onRewardReveal\?/);
assert.match(shopSource, /purchasedShopItemIds[\s\S]*?includes\(item\.id\)\) return/);
assert.match(shopSource, /data-reward-source=\{`shop-\$\{item\.id\}`\}/);
assert.match(gachaSource, /data-reward-source="summon-results"/);
assert.match(gachaSource, /animationPhase === 'showcase'[\s\S]{0,500}data-reward-source="summon-results"/);
assert.doesNotMatch(gachaSource, /onRewardReveal/);

assert.match(css, /\[data-reward-pulse="true"\]/);
assert.match(css, /reward-target-pulse 260ms/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?reward-target-outline 260ms/);

console.log('reward reveal integration contracts ok');
