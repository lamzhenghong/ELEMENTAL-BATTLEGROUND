import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import CharacterKitTestPage from './components/CharacterKitTestPage.tsx';
import './index.css';
import { GAME_VERSION } from './config/gameVersion';

console.log(`RPG GAME: Version ${GAME_VERSION}`);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log("New service worker activated, reloading page...");
    window.location.reload();
  });
}

const isCharacterKitTestRoute = window.location.pathname === '/kit-test';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCharacterKitTestRoute ? <CharacterKitTestPage /> : <App />}
  </StrictMode>,
);
