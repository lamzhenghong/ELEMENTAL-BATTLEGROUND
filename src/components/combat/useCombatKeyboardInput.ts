import { useEffect } from 'react';
import { AetheriaAudioEngine } from '../../utils/audio';

export type CombatKeyCommand =
  | 'pause'
  | 'basic-attack'
  | 'ultimate'
  | 'special-ultimate'
  | 'skill'
  | 'dodge'
  | 'parry'
  | 'swap-0'
  | 'swap-1'
  | 'swap-2'
  | 'swap-3';

export const getCombatKeyCommand = (key: string): CombatKeyCommand | null => {
  switch (key.toLowerCase()) {
    case 'escape':
    case 'p':
      return 'pause';
    case 'j':
    case 'f':
      return 'basic-attack';
    case 'q':
      return 'ultimate';
    case 'z':
      return 'special-ultimate';
    case 'e':
      return 'skill';
    case ' ':
      return 'dodge';
    case 'c':
      return 'parry';
    case '1':
      return 'swap-0';
    case '2':
      return 'swap-1';
    case '3':
      return 'swap-2';
    case '4':
      return 'swap-3';
    default:
      return null;
  }
};

interface CombatKeyboardLoopState {
  battleStarted: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  countdownValue: number | null;
}

interface MutableCurrent<T> {
  current: T;
}

export interface UseCombatKeyboardInputOptions {
  loopStateRef: MutableCurrent<CombatKeyboardLoopState>;
  keyboardState: MutableCurrent<Record<string, boolean>>;
  onTogglePause: () => void;
  onBasicAttack: () => void;
  onUltimate: () => void;
  onSpecialUltimate: () => void;
  onElementalSkill: () => void;
  onDodge: () => void;
  onParry: () => void;
  onStopParry: () => void;
  onSwapPartyIndex: (index: number) => void;
}

export const useCombatKeyboardInput = ({
  loopStateRef,
  keyboardState,
  onTogglePause,
  onBasicAttack,
  onUltimate,
  onSpecialUltimate,
  onElementalSkill,
  onDodge,
  onParry,
  onStopParry,
  onSwapPartyIndex
}: UseCombatKeyboardInputOptions) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const command = getCombatKeyCommand(key);

      if (command === 'pause') {
        AetheriaAudioEngine.playClick();
        onTogglePause();
        return;
      }

      const loopState = loopStateRef.current;
      if (
        !loopState.battleStarted
        || loopState.isPaused
        || loopState.isGameOver
        || loopState.countdownValue !== null
      ) {
        return;
      }

      keyboardState.current[key] = true;

      switch (command) {
        case 'basic-attack':
          onBasicAttack();
          break;
        case 'ultimate':
          onUltimate();
          break;
        case 'special-ultimate':
          onSpecialUltimate();
          break;
        case 'skill':
          onElementalSkill();
          break;
        case 'dodge':
          event.preventDefault();
          onDodge();
          break;
        case 'parry':
          onParry();
          break;
        case 'swap-0':
          onSwapPartyIndex(0);
          break;
        case 'swap-1':
          onSwapPartyIndex(1);
          break;
        case 'swap-2':
          onSwapPartyIndex(2);
          break;
        case 'swap-3':
          onSwapPartyIndex(3);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keyboardState.current[key] = false;
      if (getCombatKeyCommand(key) === 'parry') onStopParry();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    keyboardState,
    loopStateRef,
    onBasicAttack,
    onDodge,
    onElementalSkill,
    onParry,
    onSpecialUltimate,
    onStopParry,
    onSwapPartyIndex,
    onTogglePause,
    onUltimate
  ]);
};
