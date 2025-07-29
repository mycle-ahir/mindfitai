import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeCapacitorPlugins } from './capacitor-plugins';

// Initialize Capacitor plugins
initializeCapacitorPlugins().then(() => {
  console.log('Capacitor plugins initialized');
}).catch((error) => {
  console.error('Failed to initialize Capacitor plugins:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
