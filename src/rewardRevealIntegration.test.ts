import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layer = readFileSync(new URL('./components/RewardRevealLayer.tsx', import.meta.url), 'utf8');

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

console.log('reward reveal layer contracts ok');
