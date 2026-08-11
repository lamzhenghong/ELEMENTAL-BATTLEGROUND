export type HapticPreset = 'M1_HIT' | 'M1_CRITICAL' | 'PARRY' | 'ULTIMATE_IMPACT' | 'FINAL_HIT';

interface HapticDefinition {
  pattern: number | number[];
  priority: number;
  arbitrationMs: number;
  strongMagnitude: number;
  weakMagnitude: number;
}

export const HAPTIC_PRESETS: Record<HapticPreset, HapticDefinition> = {
  M1_HIT: { pattern: 10, priority: 1, arbitrationMs: 70, strongMagnitude: 0.12, weakMagnitude: 0.18 },
  M1_CRITICAL: { pattern: [14, 18, 10], priority: 2, arbitrationMs: 90, strongMagnitude: 0.3, weakMagnitude: 0.38 },
  PARRY: { pattern: [30, 18, 18], priority: 4, arbitrationMs: 130, strongMagnitude: 0.62, weakMagnitude: 0.75 },
  ULTIMATE_IMPACT: { pattern: [38, 22, 48], priority: 5, arbitrationMs: 180, strongMagnitude: 0.85, weakMagnitude: 1 },
  FINAL_HIT: { pattern: [26, 14, 22], priority: 3, arbitrationMs: 115, strongMagnitude: 0.5, weakMagnitude: 0.62 },
};

interface GamepadHapticActuatorLike {
  playEffect?: (type: 'dual-rumble', params: {
    duration: number;
    startDelay: number;
    strongMagnitude: number;
    weakMagnitude: number;
  }) => Promise<unknown>;
  reset?: () => Promise<unknown>;
}

interface GamepadLike {
  vibrationActuator?: GamepadHapticActuatorLike | null;
}

export interface HapticEnvironment {
  now: () => number;
  vibrate?: (pattern: number | number[]) => boolean;
  getGamepads?: () => ArrayLike<GamepadLike | null>;
}

const getPatternDuration = (pattern: number | number[]): number => (
  typeof pattern === 'number' ? pattern : pattern.reduce((total, value) => total + value, 0)
);

const createBrowserEnvironment = (): HapticEnvironment => ({
  now: () => performance.now(),
  vibrate: typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
    ? pattern => navigator.vibrate(pattern)
    : undefined,
  getGamepads: typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function'
    ? () => navigator.getGamepads()
    : undefined,
});

export class CombatHapticManager {
  private enabled = true;
  private activePreset: HapticPreset | null = null;
  private activeUntil = 0;
  private lastM1At = Number.NEGATIVE_INFINITY;

  constructor(private readonly environment: HapticEnvironment = createBrowserEnvironment()) {}

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  trigger(preset: HapticPreset): boolean {
    if (!this.enabled) return false;

    const now = this.environment.now();
    const definition = HAPTIC_PRESETS[preset];
    const isM1 = preset === 'M1_HIT' || preset === 'M1_CRITICAL';
    if (isM1 && now - this.lastM1At < HAPTIC_PRESETS.M1_HIT.arbitrationMs) return false;

    if (this.activePreset && now < this.activeUntil) {
      const activeDefinition = HAPTIC_PRESETS[this.activePreset];
      if (definition.priority <= activeDefinition.priority) return false;
      this.stopOutput();
    }

    if (isM1) this.lastM1At = now;
    this.activePreset = preset;
    this.activeUntil = now + Math.max(definition.arbitrationMs, getPatternDuration(definition.pattern));

    let supported = this.environment.vibrate?.(definition.pattern) ?? false;
    const duration = getPatternDuration(definition.pattern);
    const gamepads = this.environment.getGamepads?.();
    if (gamepads) {
      for (const gamepad of Array.from(gamepads)) {
        const actuator = gamepad?.vibrationActuator;
        if (!actuator?.playEffect) continue;
        supported = true;
        void actuator.playEffect('dual-rumble', {
          duration,
          startDelay: 0,
          strongMagnitude: definition.strongMagnitude,
          weakMagnitude: definition.weakMagnitude,
        }).catch(() => undefined);
      }
    }
    return supported;
  }

  stop(): void {
    this.stopOutput();
    this.activePreset = null;
    this.activeUntil = 0;
  }

  private stopOutput(): void {
    this.environment.vibrate?.(0);
    const gamepads = this.environment.getGamepads?.();
    if (!gamepads) return;
    for (const gamepad of Array.from(gamepads)) {
      const actuator = gamepad?.vibrationActuator;
      if (actuator?.reset) void actuator.reset().catch(() => undefined);
    }
  }
}

export const HapticManager = new CombatHapticManager();
