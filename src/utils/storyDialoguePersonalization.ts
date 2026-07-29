import type { StoryDialogueLine, StoryScene } from '../data/story';

const LEGACY_PLAYER_FULL_NAME = /\bEldric Thorne\b/g;
const LEGACY_PLAYER_FIRST_NAME = /\bEldric\b/g;

export const getCampaignPlayerName = (username?: string | null): string => {
  const trimmedUsername = username?.trim();
  return trimmedUsername || 'Traveler';
};

export const personalizeCampaignDialogueLine = (
  line: StoryDialogueLine,
  username?: string | null,
): StoryDialogueLine => {
  const playerName = getCampaignPlayerName(username);
  const replacePlayerName = (text: string) => text
    .replace(LEGACY_PLAYER_FULL_NAME, () => playerName)
    .replace(LEGACY_PLAYER_FIRST_NAME, () => playerName);

  return {
    ...line,
    speaker: line.speaker === 'Eldric Thorne' ? playerName : line.speaker,
    text: replacePlayerName(line.text),
  };
};

export const personalizeCampaignScene = (
  scene: StoryScene,
  username?: string | null,
): StoryScene => ({
  ...scene,
  slides: scene.slides.map((line) => personalizeCampaignDialogueLine(line, username)),
});
