export type BgmTrackId =
  | 'main-menu'
  | 'home-hub'
  | 'celestial-summons'
  | 'forge-ascension'
  | 'god-lore-wiki'
  | 'story-map'
  | 'character-stories-memories'
  | 'story-battle'
  | 'combat-arena'
  | 'artifact-grind'
  | 'rogue-exploration'
  | 'rogue-battle'
  | 'boss-battle';

export const BGM_TRACK_URLS: Record<BgmTrackId, string> = {
  'main-menu': new URL('../../assets/bgm/MAIN MENU BGM.mp3', import.meta.url).href,
  'home-hub': new URL('../../assets/bgm/Home Hub BGM (Used for Home, Party Setup, Quest Log and Gems Shop).mp3', import.meta.url).href,
  'celestial-summons': new URL('../../assets/bgm/Celestial Summons BGM.mp3', import.meta.url).href,
  'forge-ascension': new URL('../../assets/bgm/Forge and Ascension BGM.mp3', import.meta.url).href,
  'god-lore-wiki': new URL('../../assets/bgm/god and lore wiki bgm.mp3', import.meta.url).href,
  'story-map': new URL('../../assets/bgm/STORY BGM.mp3', import.meta.url).href,
  'character-stories-memories': new URL('../../assets/bgm/Character Stories and Memories BGM.mp3', import.meta.url).href,
  'story-battle': new URL('../../assets/bgm/Story Battles BGM.mp3', import.meta.url).href,
  'combat-arena': new URL('../../assets/bgm/Combat Arena BGM.mp3', import.meta.url).href,
  'artifact-grind': new URL('../../assets/bgm/Artifact Grind BGM.mp3', import.meta.url).href,
  'rogue-exploration': new URL('../../assets/bgm/Rogue Ruins Exploration BGM.mp3', import.meta.url).href,
  'rogue-battle': new URL('../../assets/bgm/Rogue Ruins Battles BGM.mp3', import.meta.url).href,
  'boss-battle': new URL('../../assets/bgm/Universal Boss Battle BGM.mp3', import.meta.url).href
};

export const MOBILE_BGM_VOLUME_MULTIPLIER = 1.45;
const FILE_BGM_VOLUME = 0.38;

const isMobileAudioDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const hasTouch = navigator.maxTouchPoints > 0;
  return hasTouch && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
};

export const getBgmVolumeMultiplierForDevice = (isMobile: boolean) => (
  isMobile ? MOBILE_BGM_VOLUME_MULTIPLIER : 1
);

export const getScreenBgmTrack = (screen: string): BgmTrackId | null => {
  switch (screen) {
    case 'menu': return 'main-menu';
    case 'home':
    case 'party':
    case 'quest':
    case 'shop': return 'home-hub';
    case 'story': return 'story-map';
    case 'arena': return 'combat-arena';
    case 'dungeon': return 'rogue-exploration';
    case 'wish': return 'celestial-summons';
    case 'inventory': return 'forge-ascension';
    case 'wiki': return 'god-lore-wiki';
    default: return null;
  }
};

export const getCombatBgmTrack = ({
  storyMode,
  dungeonMode,
  artifactGrindMode
}: {
  storyMode: boolean;
  dungeonMode: boolean;
  artifactGrindMode: boolean;
}): BgmTrackId => {
  if (storyMode) return 'story-battle';
  if (dungeonMode) return 'rogue-battle';
  if (artifactGrindMode) return 'artifact-grind';
  return 'combat-arena';
};

export const resolveBgmTrack = (
  baseTrack: BgmTrackId | null,
  bossFightActive: boolean
): BgmTrackId | null => bossFightActive ? 'boss-battle' : baseTrack;

export interface BgmAudioLike {
  src: string;
  currentTime: number;
  loop: boolean;
  preload: string;
  volume: number;
  muted: boolean;
  paused: boolean;
  playsInline?: boolean;
  play: () => Promise<void> | void;
  pause: () => void;
  load: () => void;
}

interface BgmPlayerOptions {
  audioFactory?: () => BgmAudioLike;
  fadeOutMs?: number;
  fadeInMs?: number;
  mobile?: boolean;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/**
 * Owns the game's single reusable file-backed BGM element. New contexts only
 * need to select a track ID; fade, boss override, volume, and autoplay retry
 * behavior stay centralized here.
 */
export class BgmPlayer {
  private readonly audioFactory: () => BgmAudioLike;
  private readonly fadeOutMs: number;
  private readonly fadeInMs: number;
  private readonly mobileMultiplier: number;
  private audio: BgmAudioLike | null = null;
  private baseTrack: BgmTrackId | null = null;
  private currentTrack: BgmTrackId | null = null;
  private bossFightActive = false;
  private enabled = false;
  private muted = false;
  private volumeScale = 1;
  private duckScale = 1;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private transitionToken = 0;

  constructor(options: BgmPlayerOptions = {}) {
    this.audioFactory = options.audioFactory ?? (() => new Audio());
    this.fadeOutMs = options.fadeOutMs ?? 450;
    this.fadeInMs = options.fadeInMs ?? 700;
    this.mobileMultiplier = getBgmVolumeMultiplierForDevice(options.mobile ?? isMobileAudioDevice());
  }

  private ensureAudio() {
    if (this.audio) return this.audio;
    this.audio = this.audioFactory();
    this.audio.loop = true;
    this.audio.preload = 'metadata';
    this.audio.volume = 0;
    this.audio.muted = this.muted;
    if ('playsInline' in this.audio) this.audio.playsInline = true;
    return this.audio;
  }

  private getTargetVolume() {
    return clamp(FILE_BGM_VOLUME * this.volumeScale * this.mobileMultiplier * this.duckScale);
  }

  private clearFade() {
    if (!this.fadeTimer) return;
    clearInterval(this.fadeTimer);
    this.fadeTimer = null;
  }

  private fadeTo(target: number, durationMs: number, onComplete?: () => void) {
    const audio = this.ensureAudio();
    this.clearFade();
    const safeTarget = clamp(target);
    if (durationMs <= 0 || Math.abs(audio.volume - safeTarget) < 0.001) {
      audio.volume = safeTarget;
      onComplete?.();
      return;
    }

    const startedAt = Date.now();
    const startVolume = audio.volume;
    this.fadeTimer = setInterval(() => {
      const progress = clamp((Date.now() - startedAt) / durationMs);
      audio.volume = startVolume + (safeTarget - startVolume) * progress;
      if (progress < 1) return;
      this.clearFade();
      onComplete?.();
    }, 30);
  }

  private playCurrent() {
    const audio = this.ensureAudio();
    try {
      const result = audio.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          // Mobile browsers may reject until the next direct user interaction.
        });
      }
    } catch {
      // The next start() call retries the same reusable element.
    }
  }

  private transitionTo(targetTrack: BgmTrackId | null) {
    const token = ++this.transitionToken;
    const audio = this.ensureAudio();

    if (!this.enabled) {
      this.clearFade();
      audio.volume = 0;
      audio.pause();
      return;
    }

    if (targetTrack === this.currentTrack) {
      if (targetTrack) this.playCurrent();
      this.fadeTo(this.getTargetVolume(), this.fadeInMs);
      return;
    }

    this.fadeTo(0, this.fadeOutMs, () => {
      if (token !== this.transitionToken) return;
      audio.pause();

      if (!targetTrack) {
        this.currentTrack = null;
        return;
      }

      this.currentTrack = targetTrack;
      audio.src = BGM_TRACK_URLS[targetTrack];
      audio.currentTime = 0;
      audio.load();
      this.playCurrent();
      this.fadeTo(this.getTargetVolume(), this.fadeInMs);
    });
  }

  public setBaseTrack(track: BgmTrackId | null) {
    this.baseTrack = track;
    this.transitionTo(resolveBgmTrack(this.baseTrack, this.bossFightActive));
  }

  public setBossFightActive(active: boolean) {
    if (this.bossFightActive === active) return;
    this.bossFightActive = active;
    this.transitionTo(resolveBgmTrack(this.baseTrack, this.bossFightActive));
  }

  public start() {
    this.enabled = true;
    this.transitionTo(resolveBgmTrack(this.baseTrack, this.bossFightActive));
  }

  public stop() {
    this.enabled = false;
    const token = ++this.transitionToken;
    this.fadeTo(0, this.fadeOutMs, () => {
      if (token === this.transitionToken) this.ensureAudio().pause();
    });
  }

  public setVolume(scale: number) {
    this.volumeScale = clamp(scale);
    if (this.enabled && this.currentTrack) this.fadeTo(this.getTargetVolume(), 120);
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.audio) this.audio.muted = muted;
  }

  public duck(level: number, durationMs = 350) {
    this.duckScale = clamp(level);
    if (this.enabled && this.currentTrack) this.fadeTo(this.getTargetVolume(), durationMs);
  }

  public getCurrentTrack() {
    return this.currentTrack;
  }
}

export const AetheriaBgmPlayer = new BgmPlayer();
