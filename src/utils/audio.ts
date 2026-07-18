/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AetheriaBgmPlayer,
  getBgmVolumeMultiplierForDevice,
  getScreenBgmTrack,
  type BgmTrackId
} from './bgm';

export { getBgmVolumeMultiplierForDevice } from './bgm';

export const SPECIAL_ULTIMATE_BGM_NAME = 'Resonance of Aetheria';
export const SPECIAL_ULTIMATE_THEME_DURATION_MS = 9_000;
const BASE_SPECIAL_ULTIMATE_GAIN = 0.17;

const detectMobileAudioDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent || '';
  const hasTouch = navigator.maxTouchPoints > 0;
  return hasTouch && /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
};

// Simple self-contained Web Audio API synthesizer for retro-arcade RPG effects and BGM
class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private specialUltimateGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private specialUltimateTimerIds: ReturnType<typeof setTimeout>[] = [];
  private specialUltimateIntervalId: ReturnType<typeof setInterval> | null = null;
  private isSpecialUltimateThemePlaying: boolean = false;
  private bgmVolScale: number = 1.0;
  private sfxVolScale: number = 1.0;
  private isMobileAudioDevice: boolean = detectMobileAudioDevice();

  constructor() {
    // Lazy initialisation inside user interaction
  }

  private getSpecialUltimateGainTarget() {
    return BASE_SPECIAL_ULTIMATE_GAIN * this.bgmVolScale * getBgmVolumeMultiplierForDevice(this.isMobileAudioDevice);
  }

  private fadeGain(gainNode: GainNode | null, targetValue: number, duration: number) {
    if (!this.ctx || !gainNode) return;
    const now = this.ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(Math.max(0.0001, gainNode.gain.value), now);
    gainNode.gain.linearRampToValueAtTime(Math.max(0.0001, targetValue), now + duration);
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Setup gain structure
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.specialUltimateGain = this.ctx.createGain();
      this.specialUltimateGain.gain.value = 0.0001;
      this.specialUltimateGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolScale * 0.5; // Scaled SFX
      this.sfxGain.connect(this.masterGain);

      // Start music if flags were active
      if (this.isMusicPlaying) {
        AetheriaBgmPlayer.start();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    AetheriaBgmPlayer.setMuted(muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.value = muted ? 0 : 0.8;
    }
  }

  public getMuteState() {
    return this.isMuted;
  }

  public getMusicState() {
    return this.isMusicPlaying;
  }

  public setBgmVolume(scale: number) {
    this.bgmVolScale = scale;
    AetheriaBgmPlayer.setVolume(scale);
  }

  public setSfxVolume(scale: number) {
    this.sfxVolScale = scale;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(scale * 0.5, this.ctx.currentTime);
    }
  }

  public getBgmVolume() {
    return this.bgmVolScale;
  }

  public getSfxVolume() {
    return this.sfxVolScale;
  }

  public pauseCombatTheme() {
    AetheriaBgmPlayer.duck(0, 450);
  }

  public resumeCombatTheme() {
    if (!this.isMusicPlaying) return;
    AetheriaBgmPlayer.duck(1, 850);
  }

  private clearSpecialUltimateThemeTimers() {
    if (this.specialUltimateIntervalId) {
      clearInterval(this.specialUltimateIntervalId);
      this.specialUltimateIntervalId = null;
    }
    this.specialUltimateTimerIds.forEach(timerId => clearTimeout(timerId));
    this.specialUltimateTimerIds = [];
  }

  private scheduleSpecialUltimateNote(step: number) {
    if (!this.ctx || !this.specialUltimateGain) return;

    const now = this.ctx.currentTime;
    const roots = [110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 329.63];
    const root = roots[step % roots.length];
    const phase = step < 7 ? 'activation' : step < 18 ? 'build' : 'climax';

    const playTone = (
      freq: number,
      type: OscillatorType,
      gainValue: number,
      duration: number,
      delay: number = 0,
      detune: number = 0,
    ) => {
      if (!this.ctx || !this.specialUltimateGain || freq <= 0) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const start = now + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      osc.detune.setValueAtTime(detune, start);
      filter.type = phase === 'activation' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(phase === 'climax' ? 1200 : 760, start);
      filter.Q.setValueAtTime(phase === 'climax' ? 1.5 : 2.6, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(gainValue, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.specialUltimateGain);
      osc.start(start);
      osc.stop(start + duration + 0.04);
    };

    const playImpact = (gainValue: number, duration: number, delay: number = 0) => {
      if (!this.ctx || !this.specialUltimateGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + delay;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(105, start);
      osc.frequency.exponentialRampToValueAtTime(28, start + duration);
      gain.gain.setValueAtTime(gainValue, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(this.specialUltimateGain);
      osc.start(start);
      osc.stop(start + duration + 0.03);
    };

    if (phase === 'activation') {
      if (step % 2 === 0) playImpact(0.32, 0.24);
      playTone(root, 'sawtooth', 0.08, 0.42);
      playTone(root * 0.5, 'triangle', 0.08, 0.55);
      return;
    }

    if (phase === 'build') {
      playTone(root * 2, 'sawtooth', 0.09, 0.58);
      playTone(root * 3, 'triangle', 0.07, 0.7, 0.02);
      playTone(root * 4, 'sine', 0.045, 0.74, 0.06);
      if (step % 3 === 0) playImpact(0.2, 0.18);
      return;
    }

    playTone(root * 2, 'sawtooth', 0.14, 0.62, 0, -8);
    playTone(root * 2, 'sawtooth', 0.1, 0.62, 0, 8);
    playTone(root * 3, 'triangle', 0.09, 0.72, 0.02);
    playTone(root * 4, 'sine', 0.055, 0.78, 0.05);
    if (step % 2 === 0) playImpact(0.28, 0.22);
  }

  public playSpecialUltimateTheme() {
    this.resume();
    if (!this.ctx || !this.specialUltimateGain || this.isMuted) return;
    if (this.isSpecialUltimateThemePlaying) return;

    this.isSpecialUltimateThemePlaying = true;
    this.pauseCombatTheme();

    const now = this.ctx.currentTime;
    this.specialUltimateGain.gain.cancelScheduledValues(now);
    this.specialUltimateGain.gain.setValueAtTime(0.0001, now);
    this.specialUltimateGain.gain.linearRampToValueAtTime(this.getSpecialUltimateGainTarget(), now + 0.35);

    let step = 0;
    this.scheduleSpecialUltimateNote(step++);
    this.specialUltimateIntervalId = setInterval(() => {
      this.scheduleSpecialUltimateNote(step++);
    }, 280);

    this.specialUltimateTimerIds = [
      setTimeout(() => this.stopSpecialUltimateTheme(), SPECIAL_ULTIMATE_THEME_DURATION_MS)
    ];
  }

  public stopSpecialUltimateTheme(resumeCombat: boolean = true) {
    this.clearSpecialUltimateThemeTimers();
    if (this.ctx && this.specialUltimateGain) {
      this.fadeGain(this.specialUltimateGain, 0.0001, 0.75);
    }
    this.isSpecialUltimateThemePlaying = false;
    if (resumeCombat) {
      this.resumeCombatTheme();
    }
  }

  public changeBgmForScreen(screen: string) {
    AetheriaBgmPlayer.setBaseTrack(getScreenBgmTrack(screen));
  }

  public setBgmContext(track: BgmTrackId | null) {
    AetheriaBgmPlayer.setBaseTrack(track);
  }

  public setBossFightActive(active: boolean) {
    AetheriaBgmPlayer.setBossFightActive(active);
  }

  // --- PLAY PROCEDURAL SFX ---

  public playSummonSwoop(maxRarity: number) {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const duration = maxRarity >= 5 ? 2.5 : maxRarity === 4 ? 1.8 : 1.2;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(maxRarity >= 5 ? 1800 : maxRarity === 4 ? 1200 : 800, this.ctx.currentTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playSummonExplosion(maxRarity: number) {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const duration = maxRarity >= 5 ? 2.0 : maxRarity === 4 ? 1.4 : 0.8;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + duration);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(maxRarity >= 5 ? 300 : 200, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + duration * 0.5);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);

    // If 5-star, add a high bell resonance chime for legendary impact
    if (maxRarity >= 5) {
      const playBell = (freq: number, delay: number) => {
        if (!this.ctx) return;
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        bGain.gain.setValueAtTime(0.3, this.ctx.currentTime + delay);
        bGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + 1.2);
        bOsc.connect(bGain);
        bGain.connect(this.sfxGain!);
        bOsc.start(this.ctx.currentTime + delay);
        bOsc.stop(this.ctx.currentTime + delay + 1.2);
      };
      playBell(880, 0.05);
      playBell(1100, 0.15);
      playBell(1320, 0.25);
    }
  }

  public playClick() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playSlash() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Synthesize friction noise slash via rapid sawtooth swept frequency
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playHit() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Heavy crash impact
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.15);
    osc2.stop(this.ctx.currentTime + 0.15);
  }

  public playDodge() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playParry() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Metal shield clang: high triangle wave with fast decay
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1240, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.25);
    osc2.stop(this.ctx.currentTime + 0.25);
  }

  public playSkill() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Beautiful resonance sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playUltimate() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Celestial roar boom
    const oscMajor = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    oscMajor.type = 'sawtooth';
    oscMajor.frequency.setValueAtTime(180, this.ctx.currentTime);
    oscMajor.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.8);

    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(90, this.ctx.currentTime);
    oscSub.frequency.setValueAtTime(40, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.80);

    oscMajor.connect(gain);
    oscSub.connect(gain);
    gain.connect(this.sfxGain!);

    oscMajor.start();
    oscSub.start();
    oscMajor.stop(this.ctx.currentTime + 0.8);
    oscSub.stop(this.ctx.currentTime + 0.8);
  }

  public playSpecialUltimate() {
    this.playUltimate();
    if (!this.ctx || this.isMuted) return;

    const playTone = (freq: number, delay: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, this.ctx!.currentTime + delay + 0.45);

      gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.22, this.ctx!.currentTime + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + 0.52);
    };

    playTone(220, 0.08);
    playTone(330, 0.18);
    playTone(495, 0.28);
  }

  public playWaveClear() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Positive major triad arpeggio
    const playNote = (freq: number, delay: number, dur: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);
      
      gain.gain.setValueAtTime(0, this.ctx!.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx!.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + dur);
    };

    // Notes: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    playNote(523.25, 0.0, 0.3);
    playNote(659.25, 0.1, 0.3);
    playNote(783.99, 0.2, 0.3);
    playNote(1046.50, 0.3, 0.6);
  }

  public playLevelUp() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Upward pentatonic scale: C5, D5, E5, G5, A5, C6, E6
    const playNote = (freq: number, delay: number, dur: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + dur);
    };

    const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1318.51];
    freqs.forEach((f, idx) => {
      playNote(f, idx * 0.08, 0.4);
    });
  }

  public playGameOver() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Unfortunate sad minor sound
    const playNote = (freq: number, delay: number, dur: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);
      
      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + delay + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + dur);
    };

    // Notes: A4 (440Hz), F4 (349Hz), C#4 (277Hz)
    playNote(440, 0.0, 0.3);
    playNote(349.23, 0.15, 0.3);
    playNote(277.18, 0.3, 0.8);
  }

  // --- LOOPING BACKGROUND MUSIC SYNTHESIZER ---

  public toggleMusic() {
    this.isMusicPlaying = !this.isMusicPlaying;
    if (this.isMusicPlaying) {
      this.resume();
      AetheriaBgmPlayer.start();
    } else {
      this.stopBgmLoop();
    }
    return this.isMusicPlaying;
  }

  /** Call this on the very first user interaction to auto-start BGM */
  public startMusic() {
    this.isMusicPlaying = true;
    this.resume();
    // Retried on every interaction so mobile autoplay rejection can recover.
    AetheriaBgmPlayer.start();
  }

  private stopBgmLoop() {
    AetheriaBgmPlayer.stop();
  }

}

export const AetheriaAudioEngine = new AudioEngine();
