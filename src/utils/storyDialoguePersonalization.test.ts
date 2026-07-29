import assert from 'node:assert/strict';
import {
  getCampaignPlayerName,
  personalizeCampaignDialogueLine,
  personalizeCampaignScene,
} from './storyDialoguePersonalization';

assert.equal(getCampaignPlayerName('  sadin  '), 'sadin');
assert.equal(getCampaignPlayerName(''), 'Traveler');
assert.equal(getCampaignPlayerName(null), 'Traveler');

const personalizedLine = personalizeCampaignDialogueLine(
  {
    speaker: 'Marina',
    element: 'Hydro',
    text: 'Eldric, stay close to Eldric Thorne while the gate opens.',
  },
  'sadin',
);
assert.equal(personalizedLine.speaker, 'Marina');
assert.equal(personalizedLine.text, 'sadin, stay close to sadin while the gate opens.');

const sourceScene = {
  backgroundId: 'chapter-1' as const,
  slides: [
    { speaker: 'Eldric Thorne', element: 'Anemo' as const, text: 'I am Eldric Thorne.' },
    { speaker: 'Marina', element: 'Hydro' as const, text: 'Ready, Eldric?' },
  ],
};
const personalizedScene = personalizeCampaignScene(sourceScene, 'sadin');

assert.notEqual(personalizedScene, sourceScene);
assert.notEqual(personalizedScene.slides, sourceScene.slides);
assert.equal(personalizedScene.slides[0].speaker, 'sadin');
assert.equal(personalizedScene.slides[0].text, 'I am sadin.');
assert.equal(personalizedScene.slides[1].text, 'Ready, sadin?');
assert.equal(sourceScene.slides[0].speaker, 'Eldric Thorne');
assert.equal(sourceScene.slides[1].text, 'Ready, Eldric?');

const unrelated = personalizeCampaignDialogueLine(
  { speaker: 'Eldric Core', text: 'The elder relic remains sealed.' },
  'sadin',
);
assert.equal(unrelated.speaker, 'Eldric Core');
assert.equal(unrelated.text, 'The elder relic remains sealed.');

console.log('story dialogue personalization ok');
