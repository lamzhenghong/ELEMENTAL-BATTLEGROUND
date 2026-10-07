import type { AppScreen } from './aetherTransition';

export const getMenuPresentation = (screen: AppScreen) => {
  switch (screen) {
    case 'story': return { material: 'stone', ambient: 'none' } as const;
    case 'inventory': return { material: 'metal', ambient: 'forge' } as const;
    case 'wiki': return { material: 'ink', ambient: 'wiki' } as const;
    case 'wish': return { material: 'astral', ambient: 'summons' } as const;
    default: return { material: 'none', ambient: 'none' } as const;
  }
};

export const isMenuClickTarget = (buttonFound: boolean, disabled: boolean, ariaDisabled: string | null) => (
  buttonFound && !disabled && ariaDisabled !== 'true'
);

export const shouldPlayMenuClick = (now: number, lastClick: number) => now - lastClick >= 60;
