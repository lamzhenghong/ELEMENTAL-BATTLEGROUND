import { getBgmVolumeMultiplierForDevice } from './bgm';

export const SPECIAL_ULTIMATE_BGM_URL = new URL(
  '../../assets/bgm/SPECIAL ULTIMATE BGM.mp3',
  import.meta.url
).href;

export const SPECIAL_ULTIMATE_FADE_IN_MS = 450;
export const SPECIAL_ULTIMATE_FADE_OUT_MS = 750;
const SPECIAL_ULTIMATE_VOLUME = 0.42;

export interface SpecialUltimateAudioLike {
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

interface SpecialUltimateBgmPlayerOptions {
  audioFactory?: () => SpecialUltimateAudioLike;
  fadeInMs?: number;
  fadeOutMs?: number;
  mobile?: boolean;
}

const detectMobileAudioDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const hasTouch = navigator.maxTouchPoints > 0;
  return hasTouch && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export class SpecialUltimateBgmPlayer {
  private readonly audioFactory: () => SpecialUltimateAudioLike;
  private readonly fadeInMs: number;
  private readonly fadeOutMs: number;
  private readonly mobileMultiplier: number;
  private audio: SpecialUltimateAudioLike | null = null;
  private volumeScale = 1;
  private muted = false;
  private playing = false;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private transitionToken = 0;

  constructor(options: SpecialUltimateBgmPlayerOptions = {}) {
    this.audioFactory = options.audioFactory ?? (() => new Audio());
    this.fadeInMs = options.fadeInMs ?? SPECIAL_ULTIMATE_FADE_IN_MS;
    this.fadeOutMs = options.fadeOutMs ?? SPECIAL_ULTIMATE_FADE_OUT_MS;
    this.mobileMultiplier = getBgmVolumeMultiplierForDevice(options.mobile ?? detectMobileAudioDevice());
  }

  private ensureAudio() {
    if (this.audio) return this.audio;
    this.audio = this.audioFactory();
    this.audio.src = SPECIAL_ULTIMATE_BGM_URL;
    this.audio.loop = false;
    this.audio.preload = 'auto';
    this.audio.volume = 0;
    this.audio.muted = this.muted;
    if ('playsInline' in this.audio) this.audio.playsInline = true;
    this.audio.load();
    return this.audio;
  }

  private getTargetVolume() {
    return clamp(SPECIAL_ULTIMATE_VOLUME * this.volumeScale * this.mobileMultiplier);
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

  public preload() {
    this.ensureAudio();
  }

  public play() {
    const audio = this.ensureAudio();
    const token = ++this.transitionToken;
    this.clearFade();
    this.playing = true;
    audio.currentTime = 0;
    audio.volume = 0;
    try {
      const result = audio.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          if (token === this.transitionToken) this.playing = false;
        });
      }
    } catch {
      this.playing = false;
      return;
    }
    this.fadeTo(this.getTargetVolume(), this.fadeInMs);
  }

  public stop(onComplete?: () => void) {
    const audio = this.audio;
    if (!audio) {
      onComplete?.();
      return;
    }

    const token = ++this.transitionToken;
    this.playing = false;
    this.fadeTo(0, this.fadeOutMs, () => {
      if (token !== this.transitionToken) return;
      audio.pause();
      audio.currentTime = 0;
      onComplete?.();
    });
  }

  public setVolume(scale: number) {
    this.volumeScale = clamp(scale);
    if (this.playing) this.fadeTo(this.getTargetVolume(), 120);
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.audio) this.audio.muted = muted;
  }
}

export const AetheriaSpecialUltimateBgmPlayer = new SpecialUltimateBgmPlayer();
