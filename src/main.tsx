import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import CharacterKitTestPage from './components/CharacterKitTestPage.tsx';
import './index.css';

console.log("RPG GAME: Version 1.1.4 - Mobile cooldown fix.");

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
