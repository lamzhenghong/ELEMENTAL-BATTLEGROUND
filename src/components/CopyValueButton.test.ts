import assert from 'node:assert/strict';
import { copyText } from './CopyValueButton';

let fallbackValue = '';
assert.equal(
  await copyText(
    'QA_UI_Renamed',
    async () => { throw new Error('Clipboard permission denied.'); },
    (value) => {
      fallbackValue = value;
      return true;
    }
  ),
  true
);
assert.equal(fallbackValue, 'QA_UI_Renamed');

assert.equal(
  await copyText('AETH-ABCDEF123456', async () => {}, () => false),
  true,
  'A successful modern clipboard write should not require the fallback.'
);

assert.equal(
  await copyText(
    'unavailable',
    async () => { throw new Error('Clipboard permission denied.'); },
    () => false
  ),
  false
);

console.log('copy value fallback rules ok');
