import {
  Award,
  Cloud,
  LogOut,
  Play,
  Settings,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GAME_VERSION } from '../config/gameVersion';

interface MainMenuProps {
  backgroundVideo: string;
  logo: string;
  username: string | null;
  email: string | null;
  signedIn: boolean;
  syncLabel: string;
  bgmEnabled: boolean;
  onStart: () => void;
  onAccount: () => void;
  onSettings: () => void;
  onCredits: () => void;
  onExit: () => void;
  onToggleBgm: () => void;
}

export default function MainMenu({
  backgroundVideo,
  logo,
  username,
  email,
  signedIn,
  syncLabel,
  bgmEnabled,
  onStart,
  onAccount,
  onSettings,
  onCredits,
  onExit,
  onToggleBgm,
}: MainMenuProps) {
  return (
    <div className="aether-main-menu">
      <video
        className="aether-main-menu__video"
        src={backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="aether-main-menu__shade" aria-hidden="true" />

      <header className="aether-main-menu__header">
        <div className="aether-main-menu__mini-brand">
          <img src={logo} alt="" />
          <span>Elemental Battleground</span>
        </div>
        <div className="aether-main-menu__header-actions">
          <span>V{GAME_VERSION} Live</span>
          <button type="button" onClick={onToggleBgm} aria-label="Toggle background music">
            {bgmEnabled ? <Volume2 /> : <VolumeX />}
            <span>BGM {bgmEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
      </header>

      <main className="aether-main-menu__center">
        <div className="aether-main-menu__title">
          <div><i />Dawning Core<i /></div>
          <h1><span>ELEMENTAL</span><span>BATTLEGROUND</span></h1>
          <p>Realtime Elemental RPG</p>
        </div>

        <button type="button" className="aether-main-menu__start" onClick={onStart}>
          <span className="aether-main-menu__start-glint" aria-hidden="true" />
          <Play />
          <span>START GAME</span>
        </button>

        <button type="button" className="aether-main-menu__account" onClick={onAccount}>
          <span className="aether-main-menu__account-icon"><Cloud /></span>
          <span className="aether-main-menu__identity">
            <small>CLOUD ACCOUNT</small>
            <strong>{signedIn ? username || 'Loading player...' : 'Guest Player'}</strong>
            <span>{signedIn ? email : 'Sign in for cross-device saves'}</span>
          </span>
          <span className="aether-main-menu__sync">{syncLabel}<i /></span>
        </button>

        <nav className="aether-main-menu__dock" aria-label="Main menu">
          <button type="button" onClick={onAccount}><User /><span>Account</span></button>
          <button type="button" onClick={onSettings}><Settings /><span>Settings</span></button>
          <button type="button" onClick={onCredits}><Award /><span>Credits</span></button>
          <button type="button" className="is-exit" onClick={onExit}><LogOut /><span>Exit</span></button>
        </nav>
      </main>

      <footer className="aether-main-menu__footer">
        <i />
        {signedIn ? 'Aetheria Cloud Connected' : 'Local Save Ready'}
      </footer>
    </div>
  );
}
