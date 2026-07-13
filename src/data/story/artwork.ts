import type { StoryArtwork, StoryBackgroundId } from './types';

const STORY_ARTWORK: Record<StoryBackgroundId, StoryArtwork> = {
  'chapter-1': {
    src: new URL('../../../assets/story/chapter-1-whispering-ruins.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '58% center',
  },
  'chapter-2': {
    src: new URL('../../../assets/story/chapter-2-elemental-frontier.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
  },
  'chapter-3': {
    src: new URL('../../../assets/story/chapter-3-aether-gates.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
  },
  'chapter-4': {
    src: new URL('../../../assets/story/chapter-4-gloamvault.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '28% center',
  },
  'chapter-5': {
    src: new URL('../../../assets/story/chapter-5-astral-reliquary.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
  },
  'chapter-6': {
    src: new URL('../../../assets/story/chapter-6-rimeforge-fault.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
  },
  'chapter-7': {
    src: new URL('../../../assets/story/chapter-7-aethelwing-skyroad.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '54% center',
  },
  'chapter-8': {
    src: new URL('../../../assets/story/chapter-8-eldruin-worldforge.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
  },
  'chapter-9': {
    src: new URL('../../../assets/story/chapter-9-paradox-verge.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
  },
  'chapter-10': {
    src: new URL('../../../assets/story/chapter-10-prime-orbit-core.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
  },
  'aurelia-memory': {
    src: new URL('../../../assets/story/aurelia-solaris-relay.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '60% center',
  },
  'kaelen-memory': {
    src: new URL('../../../assets/story/kaelen-stormbound-harbor.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '64% center',
  },
  'maelis-memory': {
    src: new URL('../../../assets/story/maelis-living-archive.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '57% center',
  },
  'veyra-memory': {
    src: new URL('../../../assets/story/veyra-stormglass-observatory.jpg', import.meta.url).href,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
  },
};

export const getStoryArtwork = (backgroundId: StoryBackgroundId): StoryArtwork =>
  STORY_ARTWORK[backgroundId];
