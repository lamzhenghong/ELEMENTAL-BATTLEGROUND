import { UiThemeId } from '../types';

export const UI_THEME_UNLOCK_LEVEL = 20;

export interface UiThemeDefinition {
  id: UiThemeId;
  label: string;
  unlockLevel: number;
  accent: string;
  accentSoft: string;
  accentRgb: string;
  textClass: string;
  iconClass: string;
  activeNavClass: string;
  headerClass: string;
  panelClass: string;
  pillClass: string;
  settingsButtonClass: string;
  backdropClass: string;
  orbOneClass: string;
  orbTwoClass: string;
}

export const UI_THEMES: UiThemeDefinition[] = [
  {
    id: 'Blue',
    label: 'Blue',
    unlockLevel: 1,
    accent: '#38bdf8',
    accentSoft: '#0ea5e9',
    accentRgb: '56, 189, 248',
    textClass: 'text-sky-300',
    iconClass: 'text-sky-400',
    activeNavClass: 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    headerClass: 'bg-slate-950/85 border-sky-400/15 shadow-[0_12px_45px_rgba(56,189,248,0.10)]',
    panelClass: 'bg-[#07111f]/85 border-sky-400/15 shadow-[0_0_20px_rgba(56,189,248,0.12)]',
    pillClass: 'bg-sky-500/10 border-sky-400/25 text-sky-300',
    settingsButtonClass: 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20',
    backdropClass: 'from-[#071526] via-[#06101c] to-[#03060a]',
    orbOneClass: 'bg-sky-500/10',
    orbTwoClass: 'bg-cyan-400/8'
  },
  {
    id: 'Crimson',
    label: 'Crimson',
    unlockLevel: UI_THEME_UNLOCK_LEVEL,
    accent: '#fb7185',
    accentSoft: '#ef4444',
    accentRgb: '251, 113, 133',
    textClass: 'text-rose-300',
    iconClass: 'text-rose-400',
    activeNavClass: 'bg-rose-500 text-slate-950 shadow-[0_0_15px_rgba(251,113,133,0.35)]',
    headerClass: 'bg-[#14080d]/90 border-rose-400/20 shadow-[0_12px_45px_rgba(251,113,133,0.12)]',
    panelClass: 'bg-[#13090e]/85 border-rose-400/20 shadow-[0_0_20px_rgba(251,113,133,0.13)]',
    pillClass: 'bg-rose-500/10 border-rose-400/25 text-rose-300',
    settingsButtonClass: 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20',
    backdropClass: 'from-[#16080d] via-[#0d070b] to-[#040305]',
    orbOneClass: 'bg-rose-500/12',
    orbTwoClass: 'bg-red-500/8'
  },
  {
    id: 'Emerald',
    label: 'Emerald',
    unlockLevel: UI_THEME_UNLOCK_LEVEL,
    accent: '#34d399',
    accentSoft: '#10b981',
    accentRgb: '52, 211, 153',
    textClass: 'text-emerald-300',
    iconClass: 'text-emerald-400',
    activeNavClass: 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.35)]',
    headerClass: 'bg-[#06140f]/90 border-emerald-400/20 shadow-[0_12px_45px_rgba(52,211,153,0.12)]',
    panelClass: 'bg-[#06130f]/85 border-emerald-400/20 shadow-[0_0_20px_rgba(52,211,153,0.13)]',
    pillClass: 'bg-emerald-500/10 border-emerald-400/25 text-emerald-300',
    settingsButtonClass: 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20',
    backdropClass: 'from-[#061510] via-[#06110d] to-[#030706]',
    orbOneClass: 'bg-emerald-500/12',
    orbTwoClass: 'bg-teal-400/8'
  },
  {
    id: 'Gold',
    label: 'Gold',
    unlockLevel: UI_THEME_UNLOCK_LEVEL,
    accent: '#facc15',
    accentSoft: '#f59e0b',
    accentRgb: '250, 204, 21',
    textClass: 'text-yellow-300',
    iconClass: 'text-yellow-400',
    activeNavClass: 'bg-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.35)]',
    headerClass: 'bg-[#151004]/90 border-yellow-400/20 shadow-[0_12px_45px_rgba(250,204,21,0.12)]',
    panelClass: 'bg-[#141006]/85 border-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.13)]',
    pillClass: 'bg-yellow-400/10 border-yellow-400/25 text-yellow-300',
    settingsButtonClass: 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20',
    backdropClass: 'from-[#171203] via-[#0f0c05] to-[#050403]',
    orbOneClass: 'bg-yellow-400/12',
    orbTwoClass: 'bg-amber-400/8'
  },
  {
    id: 'Void',
    label: 'Void',
    unlockLevel: UI_THEME_UNLOCK_LEVEL,
    accent: '#c084fc',
    accentSoft: '#7c3aed',
    accentRgb: '192, 132, 252',
    textClass: 'text-violet-300',
    iconClass: 'text-violet-400',
    activeNavClass: 'bg-violet-500 text-white shadow-[0_0_15px_rgba(192,132,252,0.35)]',
    headerClass: 'bg-[#090817]/90 border-violet-400/20 shadow-[0_12px_45px_rgba(192,132,252,0.12)]',
    panelClass: 'bg-[#090816]/85 border-violet-400/20 shadow-[0_0_20px_rgba(192,132,252,0.13)]',
    pillClass: 'bg-violet-500/10 border-violet-400/25 text-violet-300',
    settingsButtonClass: 'bg-violet-500 text-white shadow-md shadow-violet-500/20',
    backdropClass: 'from-[#0b0a1a] via-[#070712] to-[#020209]',
    orbOneClass: 'bg-violet-500/12',
    orbTwoClass: 'bg-fuchsia-500/8'
  }
];

export const getUiTheme = (themeId: UiThemeId | string | undefined): UiThemeDefinition => {
  return UI_THEMES.find(theme => theme.id === themeId) || UI_THEMES[0];
};

export const getAvailableUiThemes = (playerLevel: number): UiThemeDefinition[] => {
  const level = Number.isFinite(playerLevel) ? playerLevel : 1;
  return UI_THEMES.filter(theme => theme.unlockLevel <= level);
};

export const isUiThemeUnlocked = (themeId: UiThemeId | string | undefined, playerLevel: number): boolean => {
  const theme = UI_THEMES.find(item => item.id === themeId);
  if (!theme) return false;
  return theme.unlockLevel <= (Number.isFinite(playerLevel) ? playerLevel : 1);
};

export const normalizeUiTheme = (themeId: UiThemeId | string | undefined, playerLevel: number): UiThemeId => {
  return isUiThemeUnlocked(themeId, playerLevel) ? themeId as UiThemeId : 'Blue';
};
